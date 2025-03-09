import { IUser, User } from "@/models/User";
import { connect_DB } from "@/utils/DB";
import { getOrSetCache } from "@/utils/redis-cache";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchUrlParams = request.nextUrl.searchParams;
    const user_id = searchUrlParams.get("user_id");
    if (!user_id) {
      return Response.json({
        sucess: false,
        message: "User Id not in params",
      });
    }
    await connect_DB();
    const user = await User.findOne<IUser>({ google_id: user_id });
    if (!user) {
      return Response.json({
        success: false,
        message: "User Not Found",
      });
    }
    const catgories = user.categories;
    const email_category_count = [];
    for (const cat of catgories) {
      const count = user.messages.filter(
        (msg) => msg.category == cat.name
      ).length;
      email_category_count.push({
        name: cat.name,
        count,
      });
    }
    return Response.json({
      success: true,
      email_category_count,
    });
  } catch (error) {
    console.log("Error while getting Email Categories Count: ", error);
    return Response.json({
      success: false,
      error,
    });
  }
}
