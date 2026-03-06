import { prisma } from "../services/database";
import { scrapeChannel } from "../services/apify";
import { updateProgress } from "../utils/progress";

/**
 * Step 1: Scrape all videos from a creator's channel.
 * Stores results in the Video table with canonical URLs.
 */
export async function runScraping(
  scanId: string,
  userId: string,
  platform: string,
  handle: string
) {
  await updateProgress(scanId, "scraping", 5, `Connecting to ${platform}...`);

  // Ensure SocialConnection exists
  const connection = await prisma.socialConnection.upsert({
    where: { userId_platform: { userId, platform } },
    create: { userId, platform, handle, status: "scanning" },
    update: { handle, status: "scanning" },
  });

  await updateProgress(
    scanId,
    "scraping",
    10,
    `Scanning ${platform} channel: ${handle}...`
  );

  // Call Apify to scrape all videos
  const videos = await scrapeChannel(platform, handle);

  await updateProgress(
    scanId,
    "scraping",
    18,
    `Saving ${videos.length} videos to database...`
  );

  // Upsert videos into database
  let savedCount = 0;
  for (const video of videos) {
    try {
      await prisma.video.upsert({
        where: {
          userId_platform_platformVideoId: {
            userId,
            platform,
            platformVideoId: video.platformVideoId,
          },
        },
        create: {
          socialConnectionId: connection.id,
          userId,
          platform,
          platformVideoId: video.platformVideoId,
          title: video.title,
          description: video.description,
          tags: video.tags,
          url: video.url, // Canonical URL from Apify — source of truth
          thumbnailUrl: video.thumbnailUrl,
          viewCount: video.viewCount,
          likeCount: video.likeCount,
          commentCount: video.commentCount,
          duration: video.duration,
          publishedAt: video.publishedAt,
        },
        update: {
          title: video.title,
          description: video.description,
          tags: video.tags,
          url: video.url,
          thumbnailUrl: video.thumbnailUrl,
          viewCount: video.viewCount,
          likeCount: video.likeCount,
          commentCount: video.commentCount,
          duration: video.duration,
          publishedAt: video.publishedAt,
        },
      });
      savedCount++;
    } catch (err) {
      console.error(
        `Failed to save video ${video.platformVideoId}:`,
        err
      );
    }
  }

  // Update connection and scan records
  await prisma.socialConnection.update({
    where: { id: connection.id },
    data: {
      status: "completed",
      videoCount: savedCount,
      lastScannedAt: new Date(),
    },
  });

  await prisma.brandScan.update({
    where: { id: scanId },
    data: { videoCount: savedCount },
  });

  await updateProgress(
    scanId,
    "scraping",
    25,
    `Scraped ${savedCount} videos from ${platform}`
  );

  return savedCount;
}
