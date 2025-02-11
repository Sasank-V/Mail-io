import { oauth2Client, refresh_access_token } from "@/lib/auth";
import { connect_DB } from "@/utils/DB";
import { IUser, User } from "@/models/User";
import { NextRequest } from "next/server";
import {
  askGemini,
  extractJson,
  getEmailClassifyPrompt,
} from "@/utils/ai-stuff";
import { getParsedEmail } from "@/utils/mail-parser";
import { requireAuthNoNext } from "@/lib/authRequired";
import ollama from "ollama";
import { google } from "googleapis";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
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
  const classifiedEmails = [];
  const threadsVisited: string[] = [];
  for (const message of data.messages) {
    if (threadsVisited.find((th) => th == message.threadId)) continue;
    const threadRes = await gmail.users.threads.get({
      userId: "me",
      id: message.threadId,
    });
    // console.log(threadRes.data);
    threadsVisited.push(message.threadId);
    const combinedEmail = {
      snippet: "",
      headers: [],
      body: "",
      attachments: [],
      bodyHTML: "",
    };
    for (const message of threadRes.data.messages!) {
      const { headers, attachments, text, html } = await getParsedEmail(
        message.id!
      );
      combinedEmail.headers = combinedEmail.headers.concat(headers);
      combinedEmail.body += text;
      combinedEmail.attachments = combinedEmail.attachments.concat(attachments);
      combinedEmail.bodyHTML += html;
    }
    const foundMessage = user.messages.find((msg) => msg.id === message.id);
    let category = foundMessage?.category;
    if (!foundMessage) {
      const prompt = getEmailClassifyPrompt(
        combinedEmail.body,
        user.categories
      );

      // const res = await ollama.chat({
      //   model: "qwen2.5:0.5b",
      //   messages: [{ role: "user", content: prompt }],
      // });
      const response = await askGemini(prompt);
      // console.log(res.message.content);
      // const response = extractJson(res.message.content);
      if (!response) {
        return Response.json({
          success: false,
          message: "LLM Gave Shit Response, Try your luck next time",
        });
      }
      user.messages.push({
        id: message.id,
        category: response.type,
        marked: false,
        event_ids: [],
      });
      category = response.type;
    }
    classifiedEmails.push({
      ...combinedEmail,
      category,
      message_id: message.id,
    });
    console.log(classifiedEmails.length);
  }
  await user.save();
  return Response.json({
    success: true,
    next_page_token: data.nextPageToken,
    messages: classifiedEmails,
  });
}
