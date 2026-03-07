import express from "express";
import { verifySignature } from "./utils/auth";
import { runPipeline } from "./pipeline/orchestrator";
import { generateCarousel } from "./pipeline/carouselGen";
import { runOutreachAgent } from "./agents/outreach-runner";
import { runLeadEnricher } from "./agents/lead-enricher";
import { runReplyChecker } from "./agents/reply-checker";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "dealbird-worker",
    version: "2.1.0",
    agents: ["brand-scout", "outreach-runner", "lead-enricher", "reply-checker"],
  });
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

// ─── BRAND SCOUT AGENT (triggered by HTTP) ───

/**
 * POST /api/scan
 * Trigger the Brand Scout agent for a full brand intelligence scan.
 */
app.post("/api/scan", authMiddleware, async (req, res) => {
  const { scanId } = req.body;

  if (!scanId) {
    return res.status(400).json({ error: "scanId is required" });
  }

  // Respond immediately, run pipeline in background
  res.json({ status: "started", scanId, agent: "brand-scout" });

  // Brand Scout Agent: Scrape → Analyze → Research → Email Gen
  runPipeline(scanId)
    .then(() => {
      // After pipeline, run Lead Enricher to find contact emails
      return runLeadEnricher(scanId);
    })
    .catch((err) => {
      console.error(`[BrandScout] Pipeline failed for scan ${scanId}:`, err);
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

// ─── OUTREACH RUNNER AGENT (triggered by heartbeat or HTTP) ───

/**
 * POST /api/outreach/process
 * Trigger the Outreach Runner agent to process scheduled emails.
 * Called by Vercel cron or internal heartbeat.
 */
app.post("/api/outreach/process", authMiddleware, async (_req, res) => {
  try {
    const result = await runOutreachAgent();
    res.json({ status: "ok", ...result });
  } catch (err: any) {
    console.error("[OutreachRunner] Agent error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/leads/enrich
 * Trigger Lead Enricher agent for a specific scan.
 */
app.post("/api/leads/enrich", authMiddleware, async (req, res) => {
  const { scanId } = req.body;

  if (!scanId) {
    return res.status(400).json({ error: "scanId is required" });
  }

  try {
    const result = await runLeadEnricher(scanId);
    res.json({ status: "ok", ...result });
  } catch (err: any) {
    console.error("[LeadEnricher] Agent error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/replies/check
 * Trigger Reply Checker agent to scan for brand replies.
 */
app.post("/api/replies/check", authMiddleware, async (_req, res) => {
  try {
    const result = await runReplyChecker();
    res.json({ status: "ok", ...result });
  } catch (err: any) {
    console.error("[ReplyChecker] Agent error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── HEARTBEAT (self-scheduling agent loop) ───

let heartbeatTimer: NodeJS.Timeout | null = null;
let heartbeatCount = 0;

function startHeartbeat() {
  console.log(
    `[Heartbeat] Starting autonomous heartbeat (every ${HEARTBEAT_INTERVAL / 1000}s)`
  );

  heartbeatTimer = setInterval(async () => {
    heartbeatCount++;

    // Run outreach agent every cycle (5 min)
    try {
      const result = await runOutreachAgent();
      if (result.sent > 0 || result.failed > 0) {
        console.log(
          `[Heartbeat] Outreach: ${result.sent} sent, ${result.failed} failed`
        );
      }
    } catch (err) {
      console.error("[Heartbeat] Outreach agent error:", err);
    }

    // Run reply checker every 3rd cycle (~15 min)
    if (heartbeatCount % 3 === 0) {
      try {
        const result = await runReplyChecker();
        if (result.repliesDetected > 0) {
          console.log(
            `[Heartbeat] Replies: ${result.repliesDetected} detected across ${result.accountsChecked} accounts`
          );
        }
      } catch (err) {
        console.error("[Heartbeat] Reply checker error:", err);
      }
    }
  }, HEARTBEAT_INTERVAL);
}

// ─── START ───

app.listen(PORT, () => {
  console.log(`Dealbird Worker v2.0.0 running on port ${PORT}`);
  console.log("Agents: brand-scout, outreach-runner, lead-enricher, reply-checker");

  // Start the heartbeat for autonomous outreach processing
  startHeartbeat();
});
