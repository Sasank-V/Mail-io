import { oauth2Client } from "@/lib/auth";
import { Attachment } from "@/lib/types";
import { google, gmail_v1 } from "googleapis";
import { simpleParser } from "mailparser";

interface FilteredEmail {
  headers: Header[];
  text: string;
  html: string;
  attachments: Attachment[];
}

interface Header {
  recieved: string[];
  date: string;
  subject: string;
  from: string;
  to: string;
  cc: string;
}

export async function getParsedEmail(
  messageId: string
): Promise<FilteredEmail | null> {
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  try {
    const res = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "raw",
    });
    const resFull = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
      fields:
        "payload(parts(partId, mimeType, filename, body(attachmentId,data)))",
    });
    const rawMessage = res.data.raw;
    const decodedMessage = Buffer.from(rawMessage, "base64");
    const parsed = await simpleParser(decodedMessage);
    // console.log(rawMessage);
    // console.log("Directly parsed email:", parsed.attachments);
    // console.log(resFull.data.payload?.parts);

    //Get Headers
    const headersArray = parsed.headerLines.concat([]) || [];
    const filteredHeaders = extractDesiredHeaders(headersArray);
    const attachments = await getAttachmentsFromFull(resFull.data.payload!);
    // console.log(attachments);

    const filteredEmail = {
      headers: filteredHeaders,
      attachments,
      text: parsed.text,
      html: parsed.html,
    };
    return filteredEmail;
  } catch (error) {
    console.log("Error while parsing Email:", error);
    return null;
  }
}

export function extractDesiredHeaders(
  headersArray: {
    key?: string | null | undefined;
    line?: string | null | undefined;
  }[]
): Header {
  const desired = ["received", "from", "date", "subject", "to", "cc"];
  const result: { [key: string]: string | string[] } = {};

  for (const header of headersArray) {
    const name = header.key?.toLowerCase();
    const value = header.line;

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
    cc: (result["cc"] as string) || "",
  };
}

async function getAttachmentsFromFull(
  payload: gmail_v1.Schema$MessagePart | gmail_v1.Schema$MessagePartBody
) {
  let attachments: Attachment[] = [];

  // Ensure payload is defined and check if it has a 'parts' property
  if (
    payload &&
    "parts" in payload &&
    Array.isArray(payload.parts) &&
    payload.parts.length > 0
  ) {
    for (const part of payload.parts) {
      if (part.mimeType && part.mimeType.startsWith("multipart/")) {
        const nested = await getAttachmentsFromFull(part);
        attachments = attachments.concat(nested);
      } else if (part.body && part.body.attachmentId) {
        attachments.push({
          filename: part.filename || "",
          attachmentId: part.body.attachmentId,
        });
      }
    }
  } else if (payload && payload.body && payload.body.attachmentId) {
    // If the payload does not have parts but contains an attachment
    attachments.push({
      filename: "filename" in payload ? payload.filename || "" : "",
      attachmentId: payload.body.attachmentId,
    });
  }

  return attachments;
}
