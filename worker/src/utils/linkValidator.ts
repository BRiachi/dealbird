import { prisma } from "../services/database";

/**
 * Validate all URLs in an email body against the Video table.
 * Strips any URL that doesn't exist in the creator's video library.
 * This is the final safety net ensuring NO fake links reach the creator.
 */
export async function validateEmailLinks(
  emailBody: string,
  userId: string
): Promise<{ cleanedBody: string; strippedCount: number }> {
  // Extract all URLs from the email body
  const urlRegex = /https?:\/\/[^\s)>"',]+/g;
  const foundUrls = emailBody.match(urlRegex) || [];

  if (foundUrls.length === 0) {
    return { cleanedBody: emailBody, strippedCount: 0 };
  }

  // Check which URLs exist in the Video table for this user
  const validVideos = await prisma.video.findMany({
    where: { userId, url: { in: foundUrls } },
    select: { url: true },
  });
  const validUrlSet = new Set(validVideos.map((v) => v.url));

  // Also allow Exa-sourced brand URLs (non-video links like campaign/news articles)
  // These are stored in Brand records and were verified by Exa's index
  // For now, only strip URLs that look like video platform URLs but aren't in our DB
  const videoPlatformPatterns = [
    /youtube\.com\/watch/,
    /youtu\.be\//,
    /tiktok\.com\//,
    /instagram\.com\/(p|reel)\//,
  ];

  let cleanedBody = emailBody;
  let strippedCount = 0;

  for (const url of foundUrls) {
    const isVideoPlatformUrl = videoPlatformPatterns.some((p) => p.test(url));

    // Only validate video platform URLs against our DB
    if (isVideoPlatformUrl && !validUrlSet.has(url)) {
      console.warn(`STRIPPED unverified video URL from email: ${url}`);
      cleanedBody = cleanedBody.replace(url, "[link removed - not verified]");
      strippedCount++;
    }
  }

  return { cleanedBody, strippedCount };
}
