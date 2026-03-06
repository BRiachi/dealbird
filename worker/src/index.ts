import express from "express";
import { verifySignature } from "./utils/auth";
import { runPipeline } from "./pipeline/orchestrator";
import { generateCarousel } from "./pipeline/carouselGen";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "dealbird-worker" });
});

/**
 * Authentication middleware.
 * Verifies HMAC signature on all /api/* routes.
 */
function authMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const signature = req.headers["x-signature"] as string;
  if (!signature) {
    return res.status(401).json({ error: "Missing signature" });
  }

  const body = JSON.stringify(req.body);
  if (!verifySignature(body, signature)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  next();
}

/**
 * POST /api/scan
 * Trigger a full brand intelligence scan.
 * Called by the Next.js app when creator starts a scan.
 */
app.post("/api/scan", authMiddleware, async (req, res) => {
  const { scanId } = req.body;

  if (!scanId) {
    return res.status(400).json({ error: "scanId is required" });
  }

  // Respond immediately, run pipeline in background
  res.json({ status: "started", scanId });

  // Run pipeline asynchronously (don't await — HTTP response already sent)
  runPipeline(scanId).catch((err) => {
    console.error(`Background pipeline failed for scan ${scanId}:`, err);
  });
});

/**
 * POST /api/carousel
 * Generate carousel images for a specific brand (on-demand).
 */
app.post("/api/carousel", authMiddleware, async (req, res) => {
  const { brandId } = req.body;

  if (!brandId) {
    return res.status(400).json({ error: "brandId is required" });
  }

  try {
    const slides = await generateCarousel(brandId);
    res.json({ status: "completed", slides });
  } catch (err: any) {
    console.error(`Carousel generation failed for brand ${brandId}:`, err);
    res.status(500).json({ error: err.message || "Carousel generation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Dealbird Worker running on port ${PORT}`);
});
