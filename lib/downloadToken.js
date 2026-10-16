
import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_LIFETIME_SECONDS = 30 * 60;

// ---CREATE DOWNLOAD TOKEN---
export function createDownloadToken(datasetId) {
  const secret = process.env.RATE_LIMIT_SECRET;

  if (!secret) {
    throw new Error("Download token secret is not configured");
  }

  const expires = Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS;
  const payload = `${datasetId}.${expires}`;

  const signature = createHmac("sha256", secret)
    .update(`bhsim-download:${payload}`)
    .digest("hex");

  return `${expires}.${signature}`;
}

// ---VERIFY DOWNLOAD TOKEN---
export function verifyDownloadToken(datasetId, token) {
  const secret = process.env.RATE_LIMIT_SECRET;

  if (!secret || typeof token !== "string") {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return false;
  }

  const [expiresText, signature] = parts;
  const expires = Number(expiresText);

  if (
    !Number.isSafeInteger(expires) ||
    expires <= Math.floor(Date.now() / 1000) ||
    expires > Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS ||
    !/^[a-f0-9]{64}$/.test(signature)
  ) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`bhsim-download:${datasetId}.${expiresText}`)
    .digest();

  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
