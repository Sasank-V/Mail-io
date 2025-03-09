import { oauth2Client, refresh_access_token } from "@/lib/auth";
import { requireAuthNoNext } from "@/lib/authRequired";
import { IUser, User } from "@/models/User";
import { connect_DB } from "@/utils/DB";
import { getOrSetCache } from "@/utils/redis-cache";
import { google } from "googleapis";
import { NextRequest } from "next/server";
import { Calendar } from "lucide-react";

export async function GET(request: NextRequest) {
  const authResult = await requireAuthNoNext(request);
  const authRes = await authResult.json();
  if (!authRes.success) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchUrlParams = request.nextUrl.searchParams;
  const start_time = searchUrlParams.get("start_time");
  const end_time = searchUrlParams.get("end_time");
  const user_id = searchUrlParams.get("user_id");
  try {
    if (!user_id) {
      return Response.json(
        {
          success: false,
          message: "User Id not Found",
        },
        {
          status: 400,
        }
      );
    }
    if (!start_time || !end_time) {
      return Response.json(
        {
          success: false,
          message:
            "Missing required query parameters: start_time and end_time must be provided in RFC3339 format.",
        },
        { status: 400 }
      );
    }
    connect_DB();
    const user = await User.findOne<IUser>({ google_id: user_id });
    if (!user) {
      return Response.json({
        success: false,
        message: "User not found",
      });
    }
    await refresh_access_token(user);
    oauth2Client.setCredentials({
      access_token: user.access_token,
    });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const cacheKey = `events:${user_id}:${start_time}:${end_time}`;
    const events = await getOrSetCache(cacheKey, 2 * 60, () =>
      getEvents(calendar, start_time, end_time)
    );
    return Response.json({
      success: true,
      events,
    });
  } catch (error) {
    console.log("Error while Fetching Events from Calendar: ", error);
    return Response.json({
      success: false,
      error,
    });
  }
}

async function getEvents(calendar, start_time, end_time) {
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: start_time,
    timeMax: end_time,
    singleEvents: true,
    orderBy: "startTime",
  });
  const events = [];
  if (res.data && res.data.items) {
    for (const item of res.data?.items) {
      events.push({
        summary: item.summary || "",
        description: item.description || "",
        location: item.location || "",
        start_time: item.start?.dateTime,
        end_time: item.end?.dateTime,
        id: item.id,
      });
    }
  }
}
