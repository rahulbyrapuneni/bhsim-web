import { createDownloadToken } from "../lib/downloadToken.js";
import { checkPublicRateLimit } from "../lib/ratelimit.js";

const API_BASE =
  "https://bhsim-api-rb1997-ongole-q76d.onrender.com";

// ---DATASET GENERATION PROXY---
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      detail: "Method not allowed",
    });
  }

  // ---VALIDATE REQUEST---
  const { clients, employees, history_months, seed } = req.body ?? {};

  const validInteger = (value, min, max) =>
    Number.isInteger(value) && value >= min && value <= max;

  if (
    !validInteger(clients, 1, 500) ||
    !validInteger(employees, 1, 100) ||
    !validInteger(history_months, 1, 12) ||
    !Number.isSafeInteger(seed)
  ) {
    return res.status(400).json({
      detail: "Invalid dataset configuration",
    });
  }

  // ---CHECK SERVER-SIDE CREDENTIALS---
  const apiKey = process.env.BHSIM_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      detail: "Dataset service is not configured",
    });
  }
// ---ENFORCE PUBLIC RATE LIMIT---
try {
  // Use the client address provided by Vercel.
  // Never trust an arbitrary X-Forwarded-For header.
  const visitorIp = req.headers["x-vercel-forwarded-for"];

  if (typeof visitorIp !== "string" || !visitorIp.trim()) {
    return res.status(503).json({
      detail: "Unable to verify visitor identity",
    });
  }

  const limit = await checkPublicRateLimit(visitorIp.trim());

  if (!limit.allowed) {
    return res.status(429).json({
      detail: "Daily website generation limit reached. Try again tomorrow.",
    });
  }
} catch (error) {
  console.error("Public rate-limit check failed:", {
    name: error?.name,
    message: error?.message,
    code: error?.code,
    cause: error?.cause?.code,
  });

  return res.status(503).json({
    detail: "Dataset generation is temporarily unavailable",
  });
}
  // ---FORWARD REQUEST TO BHSIM API---
  try {
    const response = await fetch(`${API_BASE}/v1/datasets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        clients,
        employees,
        history_months,
        seed,
      }),
      signal: AbortSignal.timeout(90000),
    });

    const result = await response.json();

    // ---ATTACH DOWNLOAD TOKEN---
    if (response.ok && result.dataset_id) {
      const downloadToken = createDownloadToken(result.dataset_id);

      return res.status(response.status).json({
        ...result,
        download_token: downloadToken,
      });
    }

    return res.status(response.status).json(result);
  } catch {
    return res.status(502).json({
      detail: "Unable to reach BHSim API",
    });
  }
}
