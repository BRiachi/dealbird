import { prisma } from "../services/database";
import { matchBrands } from "../services/anthropic";
import { updateProgress } from "../utils/progress";

/**
 * Step 2: Use Claude to analyze videos and identify top 100 brands.
 * Validates all video references against the database.
 */
export async function runAnalysis(
  scanId: string,
  userId: string,
  platform: string,
  creatorName: string
) {
  await updateProgress(
    scanId,
    "analyzing",
    28,
    "Loading video library for AI analysis..."
  );

  // Load all videos for this user+platform
  const videos = await prisma.video.findMany({
    where: { userId, platform },
    select: {
      platformVideoId: true,
      title: true,
      description: true,
      tags: true,
      viewCount: true,
    },
  });

  if (videos.length === 0) {
    throw new Error("No videos found to analyze. Scraping may have failed.");
  }

  await updateProgress(
    scanId,
    "analyzing",
    32,
    `Analyzing ${videos.length} videos with AI...`
  );

  // Send to Claude for brand matching
  const result = await matchBrands(creatorName, platform, videos);

  await updateProgress(
    scanId,
    "analyzing",
    38,
    `Found ${result.brands.length} brands. Validating video references...`
  );

  // Build a set of valid platformVideoIds from our DB
  const validVideoIds = new Set(videos.map((v) => v.platformVideoId));

  // Build a map of platformVideoId → Video.id for creating mentions
  const videoIdMap = new Map<string, string>();
  const dbVideos = await prisma.video.findMany({
    where: { userId, platform },
    select: { id: true, platformVideoId: true },
  });
  for (const v of dbVideos) {
    videoIdMap.set(v.platformVideoId, v.id);
  }

  // Save brands and create validated BrandVideoMention records
  let savedCount = 0;
  for (const brand of result.brands) {
    // Validate video references — only keep IDs that exist in our DB
    const validMentions = brand.mentionedInVideos.filter((vid) =>
      validVideoIds.has(vid)
    );
    const invalidCount =
      brand.mentionedInVideos.length - validMentions.length;
    if (invalidCount > 0) {
      console.warn(
        `Brand "${brand.name}": stripped ${invalidCount} invalid video references`
      );
    }

    try {
      const dbBrand = await prisma.brand.create({
        data: {
          userId,
          scanId,
          name: brand.name,
          industry: brand.industry,
          rank: brand.rank,
          matchReason: brand.matchReason,
          confidence: brand.confidence,
          platforms: [],
          status: "researching",
        },
      });

      // Create BrandVideoMention records for validated references
      for (const platformVideoId of validMentions) {
        const videoDbId = videoIdMap.get(platformVideoId);
        if (videoDbId) {
          await prisma.brandVideoMention.create({
            data: {
              brandId: dbBrand.id,
              videoId: videoDbId,
              context: brand.mentionType === "direct"
                ? "title mention"
                : brand.mentionType === "competitor"
                ? "competitor mention"
                : "category relevance",
            },
          });
        }
      }

      savedCount++;
    } catch (err) {
      console.error(`Failed to save brand "${brand.name}":`, err);
    }
  }

  await prisma.brandScan.update({
    where: { id: scanId },
    data: { brandCount: savedCount },
  });

  await updateProgress(
    scanId,
    "analyzing",
    45,
    `Identified ${savedCount} target brands`
  );

  return { brandCount: savedCount, niche: result.creatorNiche };
}
