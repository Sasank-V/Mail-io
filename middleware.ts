import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { navs } from "./lib/constants";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const protectedRoutes = navs.filter((nav) => nav.auth === true).map((nav) => nav.link);
  const isProtected = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route));

  if (isProtected && !token) {
    const url = new URL("/", req.url);
    url.searchParams.append("auth", "required");

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Apply middleware only to protected routes
export const config = {
  matcher: navs.filter((nav) => nav.auth === true).map((nav) => nav.link+"/:path*"), // Adjust for your app
};
