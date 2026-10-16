
import { Readable } from "node:stream";
import { verifyDownloadToken } from "../../../lib/downloadToken.js";

const API_BASE =
  "https://bhsim-api-rb1997-ongole-q76d.onrender.com";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ---SECURE DATASET DOWNLOAD---
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      detail: "Method not allowed",
    });
  }

  // ---VALIDATE DATASET ID---
  const datasetId = req.query.datasetId;
  const token = req.query.token;

  if (
    typeof datasetId !== "string" ||
    !UUID_PATTERN.test(datasetId) ||
    !verifyDownloadToken(datasetId, token)
  ) {
    return res.status(403).json({
      detail: "Invalid or expired download link",
    });
  }

  // ---CHECK API CONFIGURATION---
  const apiKey = process.env.BHSIM_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      detail: "Dataset service is not configured",
    });
  }

  // ---FETCH DATABASE FROM RENDER---
  try {
    const response = await fetch(
      `${API_BASE}/v1/datasets/${datasetId}/download`,
      {
        headers: {
          "X-API-Key": apiKey,
        },
        signal: AbortSignal.timeout(90000),
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        detail:
          response.status === 404
            ? "Dataset file is no longer available. Please generate a new dataset."
            : "Unable to download dataset",
      });
    }

    if (!response.body) {
      return res.status(502).json({
        detail: "Dataset download returned no file",
      });
    }

    // ---STREAM SQLITE FILE---
    res.setHeader("Content-Type", "application/vnd.sqlite3");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="bhsim-${datasetId}.db"`
    );
    res.setHeader("Cache-Control", "private, no-store");

    await new Promise((resolve, reject) => {
      const stream = Readable.fromWeb(response.body);

      stream.on("error", reject);
      res.on("error", reject);
      res.on("finish", resolve);

      stream.pipe(res);
    });
  } catch (error) {
    console.error("Dataset download failed:", error.message);

    if (!res.headersSent) {
      return res.status(502).json({
        detail: "Unable to retrieve dataset file",
      });
    }

    res.destroy(error);
  }
}
