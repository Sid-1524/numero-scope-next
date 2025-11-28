import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.SALT || "default_salt");

async function verifyToken(token: string) {
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch (err) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  const isAuthPage = request.nextUrl.pathname === "/";
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/app");

  if (isAuthPage && token && (await verifyToken(token))) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  if (isProtectedRoute && (!token || !(await verifyToken(token)))) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/app/:path*"],
};
