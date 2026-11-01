import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getHistoryOwner } from "@/lib/history-auth";

export const runtime = "nodejs";

const INPUT_KEYS = ["day", "month", "year", "birthName", "schoolName", "currentName", "houseNumber"] as const;

function hasSafeInputs(value: unknown): value is Record<(typeof INPUT_KEYS)[number], string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const inputs = value as Record<string, unknown>;
  return INPUT_KEYS.every((key) => typeof inputs[key] === "string" && inputs[key].length <= 200);
}

export async function GET() {
  const owner = await getHistoryOwner();
  if (!owner) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { rows } = await db.query(
    `SELECT id, inputs, result, created_at
     FROM numero_history
     WHERE owner_username = $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [owner],
  );

  return NextResponse.json({ history: rows.map((row) => ({
    id: String(row.id),
    inputs: row.inputs,
    result: row.result,
    createdAt: row.created_at,
  })) });
}

export async function POST(request: NextRequest) {
  const owner = await getHistoryOwner();
  if (!owner) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!hasSafeInputs(body?.inputs) || !body?.result || typeof body.result !== "object" || Array.isArray(body.result)) {
    return NextResponse.json({ message: "Invalid history payload" }, { status: 400 });
  }

  const { rows } = await db.query(
    `INSERT INTO numero_history (owner_username, inputs, result)
     VALUES ($1, $2::jsonb, $3::jsonb)
     RETURNING id, created_at`,
    [owner, JSON.stringify(body.inputs), JSON.stringify(body.result)],
  );

  return NextResponse.json({ id: String(rows[0].id), createdAt: rows[0].created_at }, { status: 201 });
}
