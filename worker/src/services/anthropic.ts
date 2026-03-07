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

    // Keep first 600 chars of description to catch more brand mentions
    const trimmedBatch = batch.map((v) => ({
      platformVideoId: v.platformVideoId,
      title: v.title || "",
      description: v.description?.substring(0, 600) || "",
      tags: v.tags.slice(0, 15),
      viewCount: v.viewCount,
    }));

    const prompt = `You are a brand deal matchmaker helping a SMALL/MID-SIZE content creator find REALISTIC sponsorship targets. The creator is NOT a mega-influencer — they need brands that actually respond to cold outreach from creators with 10K-500K followers.

Creator: ${creatorName}
Platform: ${platform}
Videos in this batch: ${batch.length} (batch ${batchNum} of ${totalBatches}, total ${videos.length} videos)

Here are the videos (JSON):
${JSON.stringify(trimmedBatch)}

STEP 1 — NICHE ANALYSIS:
Determine the creator's EXACT niche. Be very specific: "SEO tools and affiliate marketing" or "budget home gym equipment" — not just "tech" or "fitness."

STEP 2 — FIND BRANDS MENTIONED:
Scan every title, description, and tag for:
- Specific brand names, product names, tools, apps, or services mentioned
- Affiliate links or sponsorship disclosures
- Products being reviewed, demonstrated, or recommended

STEP 3 — EXPAND TO REALISTIC SPONSOR TARGETS:
For each brand found, add competitors that ACTIVELY SPONSOR CREATORS. Then add brands known for influencer marketing in this niche.

THE GOLDEN RULE: Only include brands that a small/mid-size creator can REALISTICALLY get a deal with. This means:
- DTC (direct-to-consumer) brands that depend on creator marketing
- SaaS tools with affiliate/ambassador/creator programs (e.g., Notion, Canva, Skillshare, NordVPN, Squarespace)
- Mid-market companies that actively seek YouTube/TikTok/Instagram sponsorships
- Brands you see sponsoring creators in YouTube mid-rolls and podcast ads
- E-commerce brands, supplement brands, course platforms, productivity tools

STEP 4 — RANK BY SPONSORSHIP FIT (top 100):
1. Brands DIRECTLY mentioned/used in videos (rank 1-20, mentionType: "direct")
2. Direct competitors of those brands that sponsor creators (rank 21-40, mentionType: "competitor")
3. Brands with KNOWN creator sponsorship programs in this niche (rank 41-70, mentionType: "category")
4. Adjacent niche brands with active creator partnerships (rank 71-100, mentionType: "category")

HARD BLOCKLIST — NEVER include these regardless of context:
OpenAI, Anthropic, Google, Google Cloud, Microsoft, Azure, Amazon, AWS, Apple, Meta, Facebook, IBM, Oracle, Salesforce, SAP, Cisco, Intel, NVIDIA, AMD, Palantir, Snowflake, Databricks, Tesla, Twitter/X, Netflix (the platform), Spotify (the platform), Uber, Lyft, Airbnb, Stripe, Twilio

NEVER INCLUDE:
- ANY company valued over $50B that does NOT have a well-known creator sponsorship program
- ANY enterprise B2B company that sells to other businesses (not consumers/creators)
- Cloud infrastructure companies, data platforms, chip manufacturers
- Government agencies, universities, hospitals, non-profits
- Brands that would NEVER respond to a cold email from a small creator

ALWAYS PREFER:
1. Brands with KNOWN creator/influencer programs (Skillshare, Squarespace, NordVPN, HelloFresh, Ridge Wallet, Athletic Greens, etc.)
2. DTC brands and SaaS tools with affiliate programs
3. Mid-market brands ($10M-$1B revenue) that actively market through creators
4. Niche tools and services the creator's audience would actually buy

Every brand MUST have a SPECIFIC matchReason tied to the creator's content — not "aligns with audience."
The "mentionedInVideos" array must contain ONLY platformVideoIds from the input data.
Do NOT invent video IDs. If a brand has no direct mention, use an empty array.

Return ONLY valid JSON (no markdown, no code fences):
{
  "creatorNiche": "very specific niche description",
  "brands": [
    {
      "name": "Brand Name",
      "rank": 1,
      "confidence": 0.95,
      "matchReason": "Specific reason: e.g. 'Creator reviewed their Keyword Explorer tool in 3 videos — Ahrefs has an active affiliate program paying $200/signup'",
      "mentionedInVideos": ["videoId1", "videoId2"],
      "mentionType": "direct",
      "industry": "Industry Name"
    }
  ]
}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      temperature: 0.3,
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

  // Hard blocklist — remove enterprise companies the prompt may still return
  const BLOCKLIST = new Set([
    "openai", "anthropic", "google", "google cloud", "google cloud ai",
    "microsoft", "microsoft azure", "azure", "amazon", "aws", "amazon web services",
    "apple", "meta", "facebook", "ibm", "oracle", "salesforce", "sap",
    "cisco", "intel", "nvidia", "amd", "palantir", "snowflake", "databricks",
    "tesla", "twitter", "x", "netflix", "spotify", "uber", "lyft", "airbnb",
    "stripe", "twilio", "servicenow", "workday", "vmware", "dell",
    "hewlett packard", "hp", "samsung", "sony", "toshiba", "lenovo",
    "qualcomm", "broadcom", "adobe systems",
  ]);

  const filteredBrands = allBrands.filter((brand) => {
    const name = brand.name.toLowerCase().trim();
    if (BLOCKLIST.has(name)) {
      console.log(`[BrandMatch] Blocked enterprise company: ${brand.name}`);
      return false;
    }
    return true;
  });

  // Deduplicate brands by name (in case multiple batches found the same brand)
  const brandMap = new Map<string, BrandMatch>();
  for (const brand of filteredBrands) {
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
