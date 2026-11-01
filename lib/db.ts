import { Pool } from "pg";

declare global {
  var numeroScopePool: Pool | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to use saved history.");
}

export const db = global.numeroScopePool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});

if (process.env.NODE_ENV !== "production") {
  global.numeroScopePool = db;
}
