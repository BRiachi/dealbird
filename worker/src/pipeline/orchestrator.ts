import { prisma } from "../services/database";
import { runScraping } from "./scraper";
import { runAnalysis } from "./analyzer";
import { runResearch } from "./researcher";
import { runEmailGeneration } from "./emailWriter";
import { updateProgress, markFailed } from "../utils/progress";

/**
 * Main pipeline orchestrator.
 * Runs the full brand intelligence pipeline:
 *   Scrape → Analyze → Research → Generate Emails
 *
 * Carousels are generated on-demand, not part of this pipeline.
 */
export async function runPipeline(scanId: string) {
  const scan = await prisma.brandScan.findUnique({
    where: { id: scanId },
    include: {
      user: { select: { id: true, name: true, plan: true, lifetimePlan: true } },
    },
  });

  if (!scan) {
    throw new Error(`Scan ${scanId} not found`);
  }

  const userId = scan.userId;
  const creatorName = scan.user.name || "Creator";
  const platform = scan.platform;
  const handle = scan.handle;
  const userPlan = scan.user.lifetimePlan || scan.user.plan;

  console.log(
    `Starting pipeline for scan ${scanId}: ${platform}:${handle} (user: ${userId}, plan: ${userPlan})`
  );

  try {
    // ── Step 1: Scrape Videos ──
    const videoCount = await runScraping(
      scanId,
      userId,
      platform,
      handle
    );
    console.log(`Step 1 complete: ${videoCount} videos scraped`);

    if (videoCount === 0) {
      throw new Error(
        "No videos found on this channel. Please check the handle and try again."
      );
    }

    // ── Step 2: AI Brand Matching ──
    const { brandCount, niche } = await runAnalysis(
      scanId,
      userId,
      platform,
      creatorName
    );
    console.log(`Step 2 complete: ${brandCount} brands matched`);

    if (brandCount === 0) {
      throw new Error(
        "AI could not identify any brand matches from the video content."
      );
    }

    // ── Step 3: Brand Research via Exa ──
    await runResearch(scanId);
    console.log("Step 3 complete: brand research done");

    // ── Step 4: Email Generation ──
    await runEmailGeneration(scanId, userId, creatorName, niche);
    console.log("Step 4 complete: emails generated");

    // ── Step 5: Mark Complete + Free Tier Gating ──
    const isFreeTier = userPlan === "free";
    if (isFreeTier) {
      // Mark top 5 brands as free tier accessible
      const topBrands = await prisma.brand.findMany({
        where: { scanId },
        orderBy: { rank: "asc" },
        take: 5,
        select: { id: true },
      });
      await prisma.brand.updateMany({
        where: { id: { in: topBrands.map((b) => b.id) } },
        data: { isFreeTier: true },
      });
    }

    await updateProgress(
      scanId,
      "completed",
      100,
      `Done! ${brandCount} brands ready${isFreeTier ? " (5 unlocked on free plan)" : ""}`
    );

    console.log(`Pipeline complete for scan ${scanId}`);
  } catch (error: any) {
    console.error(`Pipeline failed for scan ${scanId}:`, error);
    await markFailed(scanId, error.message || "Unknown pipeline error");
    throw error;
  }
}
