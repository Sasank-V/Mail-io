import { User, IUser } from "@/models/User";
import { connect_DB } from "@/utils/DB";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchURlParams = request.nextUrl.searchParams;
    const user_id = searchURlParams.get("user_id");
    const message_id = searchURlParams.get("message_id");
    const category = searchURlParams.get("category");
    if (!user_id || !message_id || !category) {
      return Response.json({
        success: false,
        message: "user_id or message_id or category",
      });
    }
    await connect_DB();
    const user = await User.findOne<IUser>({ google_id: user_id });
    if (!user) {
      return Response.json({
        success: false,
        message: "User not found",
      });
    }
    const msg = user.messages.find((msg) => msg.id == message_id);
    user.messages = user.messages.filter((msg) => msg.id !== message_id);
    if (msg) {
      msg.category = category;
      user.messages.push(msg);
    } else {
      return Response.json({
        success: false,
        message: "Message not found with the message_id",
      });
    }
    await user.save();
    return Response.json({
      success: true,
      message: "Category updated for the mail",
    });
  } catch (error) {
    console.log("Error while error update email: ", error);
    return Response.json({
      success: false,
      error,
    });
  }
}
