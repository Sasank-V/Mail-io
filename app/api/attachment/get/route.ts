import { google } from "googleapis";
import { NextRequest } from "next/server";
import { oauth2Client, refresh_access_token } from "@/lib/auth";
import { connect_DB } from "@/utils/DB";
import { IUser, User } from "@/models/User";
import { requireAuthNoNext } from "@/lib/authRequired";
import path from "path";
import fs from "fs";
import { getOrSetCache } from "@/utils/redis-cache";

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
    const attachment_id = searchUrlParams.get("attachment_id");
    const filename = searchUrlParams.get("filename");
    if (!user_id || !attachment_id || !message_id || !filename) {
      return Response.json({
        success: false,
        message:
          "user_id or message_id or attachment_id or filename does not exist in params",
      });
    }

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    await connect_DB();
    const user = await User.findOne<IUser>({ google_id: user_id });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not Found",
        },
        {
          status: 404,
        }
      );
    }
    await refresh_access_token(user);
    oauth2Client.setCredentials({
      access_token: user.access_token,
    });
    const cacheKey = `attachments:${user_id}:${attachment_id}`;
    const fileBuffer = getOrSetCache(cacheKey, 2 * 60 * 60, async () =>
      getAttachmentData(gmail, message_id, attachment_id)
    );
    const tempDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    const localFilePath = path.join(tempDir, filename);
    fs.writeFileSync(localFilePath, fileBuffer);
    return Response.json({
      success: true,
      message: `Attachment Saved in path : ${localFilePath}`,
      filePath: localFilePath,
    });
  } catch (error) {
    console.log("Error while fetching Attachment: ", error);
    return Response.json({
      success: false,
      message: "Error while fetching and Creating Attachement",
    });
  }
}

async function getAttachmentData(gmail, message_id, attachment_id) {
  const attachmentRes = await gmail.users.messages.attachments.get({
    userId: "me",
    messageId: message_id,
    id: attachment_id,
  });
  const base64Data = attachmentRes.data.data;
  return Buffer.from(base64Data!, "base64");
}
