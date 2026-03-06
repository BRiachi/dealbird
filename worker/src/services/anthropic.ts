import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface VideoData {
  platformVideoId: string;
  title?: string | null;
  description?: string | null;
  tags: string[];
  viewCount: number;
}

interface BrandMatch {
  name: string;
  rank: number;
  confidence: number;
  matchReason: string;
  mentionedInVideos: string[]; // platformVideoIds
  mentionType: "direct" | "competitor" | "category";
  industry: string;
}

interface AnalysisResult {
  creatorNiche: string;
  brands: BrandMatch[];
}

/**
 * Use Claude to analyze a creator's video library and identify top 100 brands to pitch.
 * Videos are sent in batches to stay within context limits.
 */
export async function matchBrands(
  creatorName: string,
  platform: string,
  videos: VideoData[]
): Promise<AnalysisResult> {
  // For very large libraries, batch into groups of 200
  const BATCH_SIZE = 200;
  const allBrands: BrandMatch[] = [];
  let creatorNiche = "";

  for (let i = 0; i < videos.length; i += BATCH_SIZE) {
    const batch = videos.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(videos.length / BATCH_SIZE);

    console.log(
      `Claude brand matching: batch ${batchNum}/${totalBatches} (${batch.length} videos)`
    );

    // Trim descriptions to save tokens (keep first 300 chars)
    const trimmedBatch = batch.map((v) => ({
      platformVideoId: v.platformVideoId,
      title: v.title || "",
      description: v.description?.substring(0, 300) || "",
      tags: v.tags.slice(0, 10),
      viewCount: v.viewCount,
    }));

    const prompt = `You are analyzing a creator's video library to identify brands they should pitch for paid sponsorship deals.

Creator: ${creatorName}
Platform: ${platform}
Videos in this batch: ${batch.length} (batch ${batchNum} of ${totalBatches}, total ${videos.length} videos)

Here are the videos (JSON):
${JSON.stringify(trimmedBatch)}

Tasks:
1. Find every brand, product, or company mentioned in titles, descriptions, or tags
2. Identify COMPETITORS of mentioned brands (if they review Nike shoes → Adidas, New Balance are targets)
3. Identify product CATEGORIES to find category-relevant brands (if they do skincare → CeraVe, The Ordinary, etc.)
4. Rank the top 100 brands by sponsorship fit:
   - Direct mentions = highest priority
   - Competitor of mentioned brand = high priority
   - Category relevance = medium priority
   - Brand's likely marketing budget (Fortune 500 > small DTC) = tiebreaker

CRITICAL: The "mentionedInVideos" array must contain ONLY platformVideoIds from the input data above.
Do NOT invent video IDs. If a brand is a category/competitor match with no direct mention, use an empty array.

Return ONLY valid JSON (no markdown, no code fences):
{
  "creatorNiche": "string describing their niche",
  "brands": [
    {
      "name": "Brand Name",
      "rank": 1,
      "confidence": 0.95,
      "matchReason": "Why this brand is a fit",
      "mentionedInVideos": ["videoId1", "videoId2"],
      "mentionType": "direct",
      "industry": "Industry Name"
    }
  ]
}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    try {
      const parsed: AnalysisResult = JSON.parse(text);
      if (parsed.creatorNiche) creatorNiche = parsed.creatorNiche;
      allBrands.push(...parsed.brands);
    } catch (e) {
      // Try extracting JSON from markdown code fences
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        const parsed: AnalysisResult = JSON.parse(jsonMatch[1]);
        if (parsed.creatorNiche) creatorNiche = parsed.creatorNiche;
        allBrands.push(...parsed.brands);
      } else {
        console.error("Failed to parse Claude response:", text.substring(0, 200));
        throw new Error("Claude returned invalid JSON for brand matching");
      }
    }
  }

  // Deduplicate brands by name (in case multiple batches found the same brand)
  const brandMap = new Map<string, BrandMatch>();
  for (const brand of allBrands) {
    const key = brand.name.toLowerCase().trim();
    const existing = brandMap.get(key);
    if (!existing || brand.confidence > existing.confidence) {
      // Merge video mentions if both exist
      if (existing) {
        brand.mentionedInVideos = [
          ...new Set([
            ...existing.mentionedInVideos,
            ...brand.mentionedInVideos,
          ]),
        ];
      }
      brandMap.set(key, brand);
    }
  }

  // Sort by confidence and take top 100
  const sorted = Array.from(brandMap.values())
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 100)
    .map((brand, i) => ({ ...brand, rank: i + 1 }));

  return { creatorNiche, brands: sorted };
}
