import { oauth2Client } from "@/lib/auth";
import { IUser, User } from "@/models/User";
import { connect_DB } from "@/utils/DB";
import { google } from "googleapis";
import { NextRequest } from "next/server";
// import { Calendar } from "lucide-react";
import { requireAuthNoNext } from "@/lib/authRequired";

export async function GET(request: NextRequest) {
  const authResult = await requireAuthNoNext(request);
  const authRes = await authResult.json();
  if (!authRes.success) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchUrlParams = request.nextUrl.searchParams;
    const user_id = searchUrlParams.get("user_id");
    const event_id = searchUrlParams.get("event_id");
    await connect_DB();
    const user = await User.findOne<IUser>({ google_id: user_id });
    if (!user) {
      return Response.json({
        success: false,
        message: "User Not Found",
      });
    }
    if (!event_id) {
      return Response.json({
        success: false,
        message: "Event Id not found",
      });
    }
    oauth2Client.setCredentials({ access_token: user.access_token });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    await calendar.events.delete({
      calendarId: "primary",
      eventId: event_id,
    });
    const msg = user.messages.find((msg) => msg.event_ids.includes(event_id));
    user.messages = user.messages.filter(
      (msg) => !msg.event_ids.includes(event_id)
    );
    if (msg) {
      if (msg.event_ids.length == 1) {
        msg.event_ids = [];
        msg.marked = false;
      } else {
        msg.event_ids = msg?.event_ids.filter((id) => id != event_id);
      }
      user.messages.push(msg);
    }
    await user.save();
    return Response.json({
      success: true,
      message: "Event Deleted Successfully",
    });
  } catch (error) {
    console.log("Error while deleting event:", error);
    return Response.json({
      success: false,
      error,
    });
  }
}
