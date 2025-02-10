import { User } from "@/models/User";
import { NextRequest } from "next/server";
import fs from "fs";

export async function GET(request: NextRequest) {
  try {
    const searchUrlParams = request.nextUrl.searchParams;
    const filepath = searchUrlParams.get("filepath");
    const user_id = searchUrlParams.get("user_id");
    const user = await User.findOne({
      google_id: user_id,
    });
    if (!filepath || !user_id) {
      return Response.json({
        success: "false",
        message: "User id or filepath not found",
      });
    }
    if (!user) {
      return Response.json({
        success: false,
        message: "User Not Found",
      });
    }
    await fs.promises.unlink(filepath);
    return Response.json({
      success: true,
      messages: "Attachment Deleted in Buffer",
    });
  } catch (error) {
    console.log(error);
    return Response.json({
      success: false,
      error,
    });
  }
}
