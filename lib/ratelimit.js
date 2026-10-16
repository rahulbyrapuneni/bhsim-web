
import { createHmac } from "node:crypto";
import pg from "pg";

const { Pool } = pg;

// ---DATABASE CONNECTION---
const pool = new Pool({
  connectionString: process.env.RATE_LIMIT_DATABASE_URL,
  ssl: { rejectUnauthorized: true },
  max: 2,
  connectionTimeoutMillis: 5000,
});

// ---PUBLIC RATE LIMIT---
export async function checkPublicRateLimit(visitorIp) {
  const secret = process.env.RATE_LIMIT_SECRET;

  if (!secret || !visitorIp) {
    throw new Error("Rate limiter is not configured");
  }

  // ---HASH VISITOR IDENTIFIER---
  const visitorId = createHmac("sha256", secret)
    .update(visitorIp)
    .digest("hex");

  // ---ATOMIC DAILY QUOTA CHECK---
  const result = await pool.query(
    `
    INSERT INTO public.public_rate_limits (
      visitor_id,
      usage_date,
      request_count
    )
    VALUES ($1, (NOW() AT TIME ZONE 'UTC')::date, 1)
    ON CONFLICT (visitor_id, usage_date)
    DO UPDATE SET
      request_count = public.public_rate_limits.request_count + 1,
      updated_at = NOW()
    WHERE public.public_rate_limits.request_count < 2
    RETURNING request_count
    `,
    [visitorId]
  );

  return {
    allowed: result.rowCount === 1,
    remaining: result.rowCount === 1
      ? 2 - result.rows[0].request_count
      : 0,
  };
}
