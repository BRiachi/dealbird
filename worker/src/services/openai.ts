import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface VideoLink {
  url: string;
  title: string;
  viewCount: number;
}

interface GeneratedEmail {
  subject: string;
  body: string;
  videoLinks: { url: string; title: string; relevance: string }[];
}

/**
 * Generate a personalized outreach email from creator to brand.
 * ONLY uses provided video URLs — never invents links.
 */
export async function generateOutreachEmail(opts: {
  creatorName: string;
  platform: string;
  videoCount: number;
  totalViews: number;
  niche: string;
  brandName: string;
  industry: string;
  matchReason: string;
  recentCampaigns: string;
  avgDealSize: string;
  relevantVideos: VideoLink[];
}): Promise<GeneratedEmail> {
  const videoList = opts.relevantVideos
    .map((v) => `- "${v.title}" | ${v.url} | ${v.viewCount.toLocaleString()} views`)
    .join("\n");

  const prompt = `Write a cold outreach email from a content creator to a brand's influencer marketing team.

CREATOR INFO:
- Name: ${opts.creatorName}
- Platform: ${opts.platform}
- Total videos: ${opts.videoCount}
- Total views: ${opts.totalViews.toLocaleString()}
- Niche: ${opts.niche}

BRAND INFO:
- Brand: ${opts.brandName}
- Industry: ${opts.industry}
- Why this brand: ${opts.matchReason}
- Their recent campaigns: ${opts.recentCampaigns || "Not available"}
- Estimated deal sizes: ${opts.avgDealSize || "Unknown"}

CREATOR'S RELEVANT VIDEOS (these are REAL, VERIFIED URLs — use them exactly as written):
${videoList}

RULES:
- Write a professional, warm, confident email
- Reference 2-3 specific videos by embedding their EXACT URLs from above
- Reference the brand's recent campaign work if available
- Position the creator as a strategic fit, not just asking for free stuff
- Include a clear CTA (book a call, reply with rates, etc.)
- Subject line should be compelling and specific
- Keep body under 200 words
- DO NOT invent, modify, or guess any URLs — use ONLY what's provided above

Return ONLY valid JSON (no markdown, no code fences):
{
  "subject": "string",
  "body": "string (with URLs embedded naturally in the text)",
  "videoLinks": [{"url": "exact url from list above", "title": "string", "relevance": "why this video matters"}]
}`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content || "";

  try {
    return JSON.parse(text) as GeneratedEmail;
  } catch {
    // Try extracting from code fences
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]) as GeneratedEmail;
    }
    throw new Error("GPT-4o returned invalid JSON for email generation");
  }
}

/**
 * Generate carousel slide text for a brand.
 */
export async function generateCarouselText(opts: {
  creatorName: string;
  brandName: string;
  matchReason: string;
  niche: string;
}): Promise<{ headline: string; body: string }[]> {
  const prompt = `Create 4-5 carousel slide copy for an Instagram/LinkedIn carousel post.

The creator "${opts.creatorName}" (niche: ${opts.niche}) is creating content about "${opts.brandName}".
Context: ${opts.matchReason}

Each slide should:
- Have a punchy headline (5-10 words)
- Have a body text (20-40 words)
- Build a narrative across slides (hook → value → CTA)
- Be professional but engaging
- Reference the brand naturally

Return ONLY valid JSON (no markdown, no code fences):
[
  { "headline": "string", "body": "string" },
  ...
]`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content || "";
  const parsed = JSON.parse(text);
  // Handle both direct array and wrapped object responses
  return Array.isArray(parsed) ? parsed : parsed.slides || parsed.carousel || [];
}

/**
 * Generate a carousel slide image using DALL-E 3.
 */
export async function generateCarouselImage(
  headline: string,
  body: string,
  brandName: string
): Promise<string> {
  const response = await client.images.generate({
    model: "dall-e-3",
    prompt: `Create a clean, modern carousel slide for social media. The slide should have:
- Headline text: "${headline}"
- Body text: "${body}"
- Brand reference: ${brandName}
- Style: Professional, minimal, with bold typography
- Colors: Modern gradient background (dark blue to purple)
- No logos or copyrighted imagery
- Square format (1080x1080)`,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });

  return response.data?.[0]?.url || "";
}
