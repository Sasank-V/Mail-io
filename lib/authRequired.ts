import { getServerSession, Session } from "next-auth";
import { authConfig } from "@/lib/auth"; // Adjust the path as needed
import { NextRequest, NextResponse } from "next/server";

type NextCallback = (session: Session) => NextResponse | Promise<NextResponse>;

export async function requireAuth(req: NextRequest, next: NextCallback) {
  const session = await getServerSession({ req, ...authConfig });

  if (!session) {
    return NextResponse.json(
      {
        message: "Authentication Error",
        success: false,
      },
      { status: 401 }
    );
  }

  return next(session);
}

export async function requireAuthNoNext(req: NextRequest) {
  const session = await getServerSession({ req, ...authConfig });

  if (!session) {
    return NextResponse.json(
      {
        message: "Authentication Error",
        success: false,
      },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      message: "Success",
      success: true,
    },
    { status: 200 }
  );
}
