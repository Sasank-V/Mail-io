import { oauth2Client } from "@/lib/auth";
import { Attachment } from "@/lib/types";
import { google, gmail_v1 } from "googleapis";

interface FilteredEmail {
  snippet: string;
  headers: Header;
  body: string;
  bodyHTML: string;
  attachments: Attachment[];
}

interface Header {
  recieved: string[];
  date: string;
  subject: string;
  from: string;
  to: string;
}

export async function getParsedEmail(
  messageId: string
): Promise<FilteredEmail | null> {
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  try {
    const res = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
      fields:
        "snippet,payload(headers(name,value),mimeType,body(attachmentId,data),parts(partId, mimeType, filename, body(attachmentId,data)))",
    });

    const messageData = res.data;
    const snippet = messageData.snippet || "";

    //Get Headers
    const headersArray =
      (messageData.payload && messageData.payload.headers) || [];
    const filteredHeaders = extractDesiredHeaders(headersArray);

    // Get Body and Attachments
    const { bodyText, attachments, bodyHTML } = await processPayload(
      messageData.payload!
    );
    const filteredEmail = {
      snippet,
      headers: filteredHeaders,
      body: bodyText,
      attachments,
      bodyHTML,
    };
    return filteredEmail;
  } catch (error) {
    console.log("Error while parsing Email:", error);
    return null;
  }
}

export function extractDesiredHeaders(
  headersArray: {
    name?: string | null | undefined;
    value?: string | null | undefined;
  }[]
): Header {
  const desired = ["received", "from", "date", "subject", "to"];
  const result: { [key: string]: string | string[] } = {};

  for (const header of headersArray) {
    const name = header.name?.toLowerCase();
    const value = header.value;

    if (name && value && desired.includes(name)) {
      if (result[name]) {
        if (!Array.isArray(result[name])) {
          result[name] = [result[name] as string];
        }
        (result[name] as string[]).push(value);
      } else {
        result[name] = value;
      }
    }
  }

  return {
    recieved: (result["received"] as string[]) || [""],
    date: (result["date"] as string) || "",
    subject: (result["subject"] as string) || "",
    from: (result["from"] as string) || "",
    to: (result["to"] as string) || "",
  };
}

export async function processPayload(payload: gmail_v1.Schema$MessagePart) {
  let bodyText = "";
  let bodyHTML = "";
  let attachments: Attachment[] = [];

  if (payload.parts && payload.parts.length) {
    for (const part of payload.parts) {
      if (part.mimeType && part.mimeType.startsWith("multipart/")) {
        const nested = await processPayload(part);
        bodyText += nested.bodyText;
        bodyHTML += nested.bodyHTML;
        attachments = attachments.concat(nested.attachments);
      } else if (part.mimeType === "text/plain") {
        if (part.body && part.body.data) {
          const text = Buffer.from(part.body.data, "base64").toString("utf8");
          bodyText += text + "\n";
        }
      } else if (part.mimeType === "text/html") {
        if (part.body && part.body.data) {
          const html = Buffer.from(part.body.data, "base64").toString("utf8");
          bodyHTML += html;
        }
      } else {
        if (part.body && part.body.attachmentId) {
          attachments.push({
            filename: part.filename || "",
            attachmentId: part.body.attachmentId,
          });
        }
      }
    }
  } else {
    if (
      payload.mimeType === "text/plain" &&
      payload.body &&
      payload.body.data
    ) {
      bodyText = Buffer.from(payload.body.data, "base64").toString("utf8");
    } else if (
      payload.mimeType === "text/html" &&
      payload.body &&
      payload.body.data
    ) {
      bodyHTML = Buffer.from(payload.body.data, "base64").toString("utf8");
    }
  }
  return { bodyText, attachments, bodyHTML };
}
