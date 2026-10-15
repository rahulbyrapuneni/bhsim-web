
const API_BASE =
  "https://bhsim-api-rb1997-ongole-q76d.onrender.com";

// ---SERVER-SIDE HEALTH CHECK---
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      detail: "Method not allowed",
    });
  }

  try {
    const response = await fetch(`${API_BASE}/health`, {
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return res.status(502).json({
        detail: "BHSim API is unavailable",
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch {
    return res.status(502).json({
      detail: "Unable to reach BHSim API",
    });
  }
}
