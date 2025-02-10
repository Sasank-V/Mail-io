//Onlt supports the Emails Which are Classified as Events or Have some Event data in the Email
//Future work: If the email does not contain the event data such as start time , end time , User will send.

import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { oauth2Client, refresh_access_token } from "@/lib/auth";
import { IUser, User } from "@/models/User";
import { connect_DB } from "@/utils/DB";
import { askGemini, getEventSummaryPrompt } from "@/utils/gemini";
import { getParsedEmail } from "@/utils/mail-parser";
import { NextRequest } from "next/server";
import { requireAuthNoNext } from "@/lib/authRequired";
import { Attachment } from "@/lib/types";

export async function GET(request: NextRequest) {
  const authResult = await requireAuthNoNext(request);
  const authRes = await authResult.json();
  if (!authRes.success) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchUrlParams = request.nextUrl.searchParams;
    const user_id = searchUrlParams.get("user_id");
    const message_id = searchUrlParams.get("message_id");
    if (!user_id || !message_id) {
      return Response.json({
        success: false,
        message: "user_id or message_id does not exist in params",
      });
    }

    await connect_DB();
    const user = await User.findOne<IUser>({ google_id: user_id });
    if (!user) {
      return Response.json(
        { success: false, message: "User Not Found" },
        { status: 404 }
      );
    }
    if (!user.access_token) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const msg = user.messages.find((msg) => msg.id == message_id);
    if (msg?.marked) {
      return Response.json({
        success: false,
        message: "The Email is Already Marked in the Calendar",
      });
    }
    await refresh_access_token(user);
    oauth2Client.setCredentials({ access_token: user.access_token });

    const email = await getParsedEmail(message_id);
    if (!email) {
      return Response.json(
        {
          success: false,
          message: "Error in getting Parsed mail",
        },
        { status: 500 }
      );
    }
    const eventPrompt = getEventSummaryPrompt(JSON.stringify(email));

    const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];
    const imageAttachments =
      email.attachments && Array.isArray(email.attachments)
        ? email.attachments.filter((att) => {
            if (!att.filename) return false;
            const lowerFilename = att.filename.toLowerCase();
            return allowedImageExtensions.some((ext) =>
              lowerFilename.endsWith(ext)
            );
          })
        : null;

    if (imageAttachments) {
      for (const attachment of imageAttachments) {
        await markEventInCalendarWithAttachment(
          message_id,
          attachment,
          eventPrompt
        );
      }
    } else {
      const result = await askGemini(eventPrompt);
      result.reminders = {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 20 },
        ],
      };
      await markCalendar(result);
    }

    user.messages = user.messages.filter((msg) => msg.id != message_id);
    if (msg) {
      msg.marked = true;
    }
    user.messages.push(msg!);
    await user.save();

    return Response.json({
      success: true,
      message: "Event added to the Calendar successfully",
    });
  } catch (error) {
    console.error("Error while processing event:", error);
    return Response.json({ success: false, error }, { status: 500 });
  }
}

export async function markEventInCalendarWithAttachment(
  message_id: string,
  attachment: Attachment,
  eventPrompt: string
) {
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const attachmentRes = await gmail.users.messages.attachments.get({
    userId: "me",
    messageId: message_id,
    id: attachment.attachmentId,
  });
  console.log("Got the Attachment Buffer");
  const base64Data = attachmentRes.data.data;
  const fileBuffer = Buffer.from(base64Data, "base64");
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  const localFilePath = path.join(tempDir, attachment.filename);
  fs.writeFileSync(localFilePath, fileBuffer);
  // console.log(attachment);
  const result = await askGemini(
    eventPrompt,
    attachment.filename,
    "image/jpeg",
    localFilePath
  );
  result.reminders = {
    useDefault: false,
    overrides: [
      { method: "email", minutes: 24 * 60 },
      { method: "popup", minutes: 20 },
    ],
  };

  await markCalendar(result);
  if (localFilePath) {
    await fs.promises.unlink(localFilePath);
    console.log(`Deleted file at ${localFilePath}`);
  }
  console.log("Event with Attachment Added to Calendar");
  return true;
}

export async function markCalendar(result) {
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const eventInsertPromise = new Promise((resolve, reject) => {
    calendar.events.insert(
      {
        calendarId: "primary",
        resource: result,
      },
      (err, event) => {
        if (err) {
          reject(err);
        } else {
          resolve(event);
        }
      }
    );
  });
  await eventInsertPromise;
}
