import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getHistoryOwner(): Promise<string | null> {
  const token = (await cookies()).get("auth_token")?.value;
  const secret = process.env.SALT;

  if (!token || !secret) return null;

  try {
    const payload = jwt.verify(token, secret);
    return typeof payload === "object" && typeof payload.username === "string"
      ? payload.username
      : null;
  } catch {
    return null;
  }
}
