import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
  } catch (error) {
    console.log(error);
    return Response.json({
      success: false,
      error,
    });
  }
}
