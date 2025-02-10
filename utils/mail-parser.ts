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
      // fields:
      //   "snippet,payload(headers(name,value),mimeType,body(attachmentId,data),parts(partId, mimeType, filename, body(attachmentId,data)))",
    });
    const rawMessage = res.data.raw;
    const decodedMessage = Buffer.from(rawMessage, "base64");
    const parsed = await simpleParser(decodedMessage);
    // console.log("Directly parsed email:", parsed);

    //Get Headers
    const headersArray = parsed.headerLines.concat([]) || [];
    const filteredHeaders = extractDesiredHeaders(headersArray);

    const filteredEmail = {
      headers: filteredHeaders,
      attachments: parsed.attachments.map((att) => ({
        contentType: att.contentType,
        filename: att.filename,
        attachmentId: att.cid,
      })),
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
  };
}

// async function processPayload(
//   payload: gmail_v1.Schema$MessagePart | gmail_v1.Schema$MessagePartBody
// ) {
//   let bodyText = "";
//   let bodyHTML = "";
//   let attachments: Attachment[] = [];

//   if (payload.parts && payload.parts.length) {
//     for (const part of payload.parts) {
//       if (part.mimeType && part.mimeType.startsWith("multipart/")) {
//         const nested = await processPayload(part);
//         bodyText += nested.bodyText;
//         bodyHTML += nested.bodyHTML;
//         attachments = attachments.concat(nested.attachments);
//       } else if (part.mimeType === "message/rfc822") {
//         // Forwarded message: parse the nested message
//         const nested = await processPayload(part.body ? part.body : part);
//         bodyText += nested.bodyText;
//         bodyHTML += nested.bodyHTML;
//         attachments = attachments.concat(nested.attachments);
//       } else if (part.mimeType === "text/plain") {
//         if (part.body && part.body.data) {
//           const text = Buffer.from(part.body.data, "base64").toString("utf8");
//           bodyText += text + "\n";
//         }
//       } else if (part.mimeType === "text/html") {
//         if (part.body && part.body.data) {
//           const html = Buffer.from(part.body.data, "base64").toString("utf8");
//           bodyHTML += html;
//         }
//       } else {
//         if (part.body && part.body.attachmentId) {
//           attachments.push({
//             filename: part.filename || "",
//             attachmentId: part.body.attachmentId,
//           });
//         }
//       }
//     }
//   } else {
//     if (
//       payload.mimeType === "text/plain" &&
//       payload.body &&
//       payload.body.data
//     ) {
//       bodyText = Buffer.from(payload.body.data, "base64").toString("utf8");
//     } else if (
//       payload.mimeType === "text/html" &&
//       payload.body &&
//       payload.body.data
//     ) {
//       bodyHTML = Buffer.from(payload.body.data, "base64").toString("utf8");
//     }
//   }
//   return { bodyText, bodyHTML, attachments };
// }
