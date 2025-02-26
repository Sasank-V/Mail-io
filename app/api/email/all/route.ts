import { oauth2Client, refresh_access_token } from "@/lib/auth";
import { connect_DB } from "@/utils/DB";
import { IUser, User } from "@/models/User";
import { NextRequest } from "next/server";
import { askGemini, getEmailClassifyPrompt } from "@/utils/ai-stuff";
import { getParsedEmail, Header } from "@/utils/mail-parser";
import { requireAuthNoNext } from "@/lib/authRequired";
import { google } from "googleapis";
import { Attachment } from "@/lib/types";

// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export async function GET(request: NextRequest) {
  const authResult = await requireAuthNoNext(request);
  const authRes = await authResult.json();
  if (!authRes.success) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const user_id = searchParams.get("user_id");
  const page_token = searchParams.get("page_token");

  await connect_DB();
  const user = await User.findOne<IUser>({ google_id: user_id });
  if (!user) {
    return Response.json({ success: false, message: "User not found" });
  }
  if (!user?.access_token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  await refresh_access_token(user);
  const baseUrl = "https://gmail.googleapis.com/gmail/v1/users/me/messages";
  const url = new URL(baseUrl);
  if (page_token) {
    url.searchParams.append("pageToken", page_token);
  }
  url.searchParams.append("maxResults", "15");
  url.searchParams.append("q", "in:inbox -in:sent");
  oauth2Client.setCredentials({
    access_token: user.access_token,
  });

  const listResponse = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${user.access_token}`,
    },
  });
  const data = await listResponse.json();
  // console.log(data);
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const threadsVisited: string[] = [];
  const classificationPromises = data.messages.map(async (message) => {
    if (threadsVisited.includes(message.threadId)) return null;
    threadsVisited.push(message.threadId);

    // Fetch the entire thread in parallel
    const threadRes = await gmail.users.threads.get({
      userId: "me",
      id: message.threadId,
    });

    const combinedEmail = {
      snippet: "",
      headers: [] as Header[],
      body: "",
      attachments: [] as Attachment[],
      bodyHTML: "",
    };

    // Parse each message in the thread concurrently
    const parsePromises = threadRes.data.messages!.map(async (msg) => {
      const res = await getParsedEmail(msg.id!);
      if (res) {
        combinedEmail.headers.push(res.headers);
        combinedEmail.body += res.text;
        combinedEmail.attachments.push(...res.attachments);
        combinedEmail.bodyHTML += res.html;
      }
    });

    await Promise.all(parsePromises); // Wait for all messages in the thread to be parsed

    let category;
    const foundMessage = user.messages.find((msg) => msg.id === message.id);
    if (foundMessage) {
      category = foundMessage.category;
    } else {
      const prompt = getEmailClassifyPrompt(
        combinedEmail.body,
        user.categories
      );
      const response = await askGemini(prompt);
      if (!response) return null;

      category = response.type;
      user.messages.push({
        id: message.id,
        category,
        marked: false,
        event_ids: [],
      });
    }

    return {
      ...combinedEmail,
      category,
      message_id: message.id,
    };
  });

  // Execute all classification tasks concurrently
  const classifiedEmails = (await Promise.all(classificationPromises)).filter(
    Boolean
  );

  await user.save();
  return Response.json({
    success: true,
    next_page_token: data.nextPageToken,
    messages: classifiedEmails,
  });
}
