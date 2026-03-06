import { prisma } from "../services/database";
import {
  researchBrandCampaigns,
  researchBrandSpend,
  getBrandNews,
  findBrandWebsite,
} from "../services/exa";
import { updateProgress } from "../utils/progress";

/**
 * Step 3: Research each brand via Exa (verified URLs only).
 * Parallelized with concurrency limit of 10.
 */
export async function runResearch(scanId: string) {
  const brands = await prisma.brand.findMany({
    where: { scanId },
    select: { id: true, name: true, rank: true },
    orderBy: { rank: "asc" },
  });

  await updateProgress(
    scanId,
    "researching",
    48,
    `Researching ${brands.length} brands via Exa...`
  );

  const CONCURRENCY = 10;
  let completed = 0;

  // Process brands in parallel batches
  for (let i = 0; i < brands.length; i += CONCURRENCY) {
    const batch = brands.slice(i, i + CONCURRENCY);

    await Promise.all(
      batch.map(async (brand) => {
        try {
          // Run all Exa queries in parallel for this brand
          const [campaigns, spendData, news, website] = await Promise.all([
            researchBrandCampaigns(brand.name),
            researchBrandSpend(brand.name),
            getBrandNews(brand.name),
            findBrandWebsite(brand.name),
          ]);

          // Parse campaign data to estimate spend and platforms
          const { estimatedSpend, avgDealSize, platforms } =
            analyzeSpendData(campaigns, spendData);

          // Format campaigns for storage
          const formattedCampaigns = campaigns.slice(0, 5).map((c) => ({
            title: c.title,
            url: c.url,
            publishedDate: c.publishedDate,
            snippet: c.snippet,
          }));

          // Format news for storage
          const formattedNews = news.slice(0, 5).map((n) => ({
            title: n.title,
            url: n.url,
            publishedDate: n.publishedDate,
            snippet: n.snippet,
          }));

          await prisma.brand.update({
            where: { id: brand.id },
            data: {
              website,
              recentCampaigns: formattedCampaigns,
              estimatedSpend,
              avgDealSize,
              platforms,
              recentNews: formattedNews,
            },
          });

          completed++;
        } catch (err) {
          console.error(`Research failed for brand "${brand.name}":`, err);
          completed++;
        }
      })
    );

    // Update progress
    const pct = Math.round(48 + (completed / brands.length) * 22);
    await updateProgress(
      scanId,
      "researching",
      pct,
      `Researched ${completed}/${brands.length} brands...`
    );
  }

  await updateProgress(
    scanId,
    "researching",
    70,
    `Completed research on ${completed} brands`
  );
}

/**
 * Analyze Exa results to estimate brand spend and platform preferences.
 */
function analyzeSpendData(
  campaigns: { snippet: string }[],
  spendData: { snippet: string }[]
) {
  const allText = [...campaigns, ...spendData]
    .map((r) => r.snippet.toLowerCase())
    .join(" ");

  // Estimate spend level from language cues
  let estimatedSpend = "Medium ($10-50K/mo)";
  if (
    allText.includes("million") ||
    allText.includes("massive campaign") ||
    allText.includes("global campaign")
  ) {
    estimatedSpend = "High ($50K+/mo)";
  } else if (
    allText.includes("micro-influencer") ||
    allText.includes("small budget") ||
    allText.includes("startup")
  ) {
    estimatedSpend = "Low (<$10K/mo)";
  }

  // Estimate deal sizes
  let avgDealSize = "$2,000-10,000";
  if (estimatedSpend.startsWith("High")) {
    avgDealSize = "$10,000+";
  } else if (estimatedSpend.startsWith("Low")) {
    avgDealSize = "$500-2,000";
  }

  // Detect platform preferences
  const platforms: string[] = [];
  if (allText.includes("youtube") || allText.includes("video")) {
    platforms.push("youtube");
  }
  if (allText.includes("tiktok") || allText.includes("short-form")) {
    platforms.push("tiktok");
  }
  if (allText.includes("instagram") || allText.includes("reel")) {
    platforms.push("instagram");
  }
  if (platforms.length === 0) {
    platforms.push("youtube", "tiktok", "instagram");
  }

  return { estimatedSpend, avgDealSize, platforms };
}
