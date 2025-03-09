import { requireAuth } from "@/lib/authRequired";
import { IUser, User } from "@/models/User";
import { connect_DB } from "@/utils/DB";
import { getOrSetCache } from "@/utils/redis-cache";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return requireAuth(request, async () => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const user_id = searchParams.get("user_id");

      await connect_DB();
      const user = await User.findOne<IUser>({ google_id: user_id });
      if (!user) {
        return Response.json(
          {
            success: false,
            message: "User not Found",
          },
          { status: 404 }
        );
      }
      const cacheKey = `categories:${user_id}`;
      const data = await getOrSetCache(cacheKey, 60 * 60, async () => {
        return getCategories(user);
      });
      return Response.json({
        success: true,
        categories: data,
      });
    } catch (error) {
      console.log("Error while fetching Categories");
      return Response.json(
        {
          success: false,
          error,
        },
        { status: 500 }
      );
    }
  });
}

const getCategories = (user: IUser) => {
  return user.categories;
};
