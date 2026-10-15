
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

    return res.status(response.status).json(result);
  } catch {
    return res.status(502).json({
      detail: "Unable to reach BHSim API",
    });
  }
}
