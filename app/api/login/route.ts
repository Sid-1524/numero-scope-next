import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  console.log("Using credentials:", { username, password });

  const validUser = process.env.LOGIN_USERNAME;
  const validPass = process.env.LOGIN_PASSWORD;

  if (username !== validUser || password !== validPass) {
    return NextResponse.json({ message: "Invalid username or password" }, { status: 401 });
  }

  const token = jwt.sign(
    { username },
    process.env.SALT || "default_salt",
    { expiresIn: "1h" }
  );

  const cookieStore = await cookies();

  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(Date.now() + 60 * 60 * 1000),
  });

  return NextResponse.json({ message: "Login successful" }, { status: 200 });
}
