import { prisma } from "../services/database";
import { generateOutreachEmail } from "../services/openai";
import { validateEmailLinks } from "../utils/linkValidator";
import { updateProgress } from "../utils/progress";

/**
 * Step 4: Generate outreach emails for each brand.
 * Uses ONLY verified video URLs from the database.
 */
export async function runEmailGeneration(
  scanId: string,
  userId: string,
  creatorName: string,
  niche: string
) {
  const brands = await prisma.brand.findMany({
    where: { scanId },
    include: {
      scan: { select: { platform: true } },
      videoMentions: {
        include: {
          video: {
            select: { url: true, title: true, viewCount: true },
          },
        },
      },
    },
    orderBy: { rank: "asc" },
  });

  // Get total video stats for creator context
  const videoStats = await prisma.video.aggregate({
    where: { userId },
    _count: true,
    _sum: { viewCount: true },
  });

  await updateProgress(
    scanId,
    "generating",
    72,
    `Writing outreach emails for ${brands.length} brands...`
  );

  const CONCURRENCY = 10;
  let completed = 0;
  let totalStripped = 0;

  for (let i = 0; i < brands.length; i += CONCURRENCY) {
    const batch = brands.slice(i, i + CONCURRENCY);

    await Promise.all(
      batch.map(async (brand) => {
        try {
          // Get real video URLs from BrandVideoMention → Video join
          const relevantVideos = brand.videoMentions.map((m) => ({
            url: m.video.url,
            title: m.video.title || "Untitled",
            viewCount: m.video.viewCount,
          }));

          // Build campaign summary from Exa data
          const campaigns = (brand.recentCampaigns as any[]) || [];
          const campaignSummary = campaigns
            .slice(0, 3)
            .map((c) => c.title)
            .join("; ");

          const email = await generateOutreachEmail({
            creatorName,
            platform: brand.scan?.platform || "youtube",
            videoCount: videoStats._count || 0,
            totalViews: videoStats._sum.viewCount || 0,
            niche,
            brandName: brand.name,
            industry: brand.industry || "Unknown",
            matchReason: brand.matchReason || "",
            recentCampaigns: campaignSummary,
            avgDealSize: brand.avgDealSize || "Unknown",
            relevantVideos,
          });

          // CRITICAL: Validate all links in the email body
          const { cleanedBody, strippedCount } = await validateEmailLinks(
            email.body,
            userId
          );
          totalStripped += strippedCount;

          // Also validate videoLinks array
          const validVideoUrls = new Set(
            relevantVideos.map((v) => v.url)
          );
          const validatedVideoLinks = email.videoLinks.filter((link) =>
            validVideoUrls.has(link.url)
          );

          await prisma.brand.update({
            where: { id: brand.id },
            data: {
              outreachEmail: {
                subject: email.subject,
                body: cleanedBody,
                videoLinks: validatedVideoLinks,
              },
              status: "ready",
            },
          });

          completed++;
        } catch (err) {
          console.error(
            `Email generation failed for brand "${brand.name}":`,
            err
          );
          completed++;
        }
      })
    );

    const pct = Math.round(72 + (completed / brands.length) * 18);
    await updateProgress(
      scanId,
      "generating",
      pct,
      `Generated ${completed}/${brands.length} outreach emails...`
    );
  }

  if (totalStripped > 0) {
    console.warn(
      `Total stripped fake URLs across all emails: ${totalStripped}`
    );
  }

  await updateProgress(
    scanId,
    "generating",
    90,
    `All ${completed} outreach emails generated`
  );
}
