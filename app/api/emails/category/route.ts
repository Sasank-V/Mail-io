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
  } catch (error) {}
}
