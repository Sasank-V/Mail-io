import { oauth2Client, refresh_access_token } from "@/lib/auth";
import { connect_DB } from "@/utils/DB";
import { IUser, User } from "@/models/User";
import { NextRequest } from "next/server";
import { askGemini, getEmailClassifyPrompt } from "@/utils/gemini";
import { getParsedEmail } from "@/utils/mail-parser";
import { requireAuth, requireAuthNoNext } from "@/lib/authRequired";

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
  const classifiedEmails = [];
  for (const message of data.messages) {
    const parsedEmail = await getParsedEmail(message.id);
    const foundMessage = user.messages.find((msg) => msg.id === message.id);
    let category = foundMessage?.category;
    if (!foundMessage) {
      const prompt = getEmailClassifyPrompt(
        JSON.stringify(parsedEmail),
        user.categories
      );
      const response = await askGemini(prompt);
      user.messages.push({
        id: message.id,
        category: response.type,
        marked: false,
      });
      category = response.type;
      await delay(4000);
    }
    classifiedEmails.push({
      ...parsedEmail,
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
