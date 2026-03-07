import { prisma } from "../services/database";
import Exa from "exa-js";

const exa = new Exa(process.env.EXA_API_KEY);

/**
 * Lead Enricher Agent
 *
 * Uses Exa to find brand contact emails for outreach.
 * Runs after brand matching to enrich brand profiles with:
 * - Partnership/influencer marketing team emails
 * - PR contact information
 * - Recent sponsorship activity
 */

interface EnrichResult {
  enriched: number;
  skipped: number;
  errors: string[];
}

export async function runLeadEnricher(scanId: string): Promise<EnrichResult> {
  const result: EnrichResult = { enriched: 0, skipped: 0, errors: [] };

  const brands = await prisma.brand.findMany({
    where: { scanId, status: "ready" },
    select: {
      id: true,
      name: true,
      website: true,
      industry: true,
    },
    orderBy: { rank: "asc" },
    take: 50, // Enrich top 50 brands
  });

  console.log(
    `[LeadEnricher] Enriching ${brands.length} brands from scan ${scanId}`
  );

  for (const brand of brands) {
    try {
      // Search for brand's influencer/partnership contact info
      const contactSearch = await exa.searchAndContents(
        `"${brand.name}" influencer partnerships contact email marketing team`,
        {
          numResults: 3,
          type: "auto",
          text: true,
        }
      );

      // Extract email addresses from results
      const emails = extractEmails(contactSearch.results);
      const partnershipEmail = findBestContactEmail(emails, brand.name);

      if (partnershipEmail) {
        // Store the contact email — this will be used as toEmail in outreach
        // We store it in the brand's outreachEmail JSON for now
        const existing = (await prisma.brand.findUnique({
          where: { id: brand.id },
          select: { outreachEmail: true },
        }))?.outreachEmail as any;

        if (existing) {
          await prisma.brand.update({
            where: { id: brand.id },
            data: {
              outreachEmail: {
                ...existing,
                contactEmail: partnershipEmail,
              },
            },
          });
        }

        result.enriched++;
        console.log(
          `[LeadEnricher] Found contact for ${brand.name}: ${partnershipEmail}`
        );
      } else {
        result.skipped++;
      }
    } catch (err: any) {
      result.errors.push(`${brand.name}: ${err.message}`);
      result.skipped++;
    }
  }

  console.log(
    `[LeadEnricher] Done: ${result.enriched} enriched, ${result.skipped} skipped`
  );

  return result;
}

/**
 * Extract email addresses from Exa search results.
 */
function extractEmails(results: any[]): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = new Set<string>();

  for (const result of results) {
    const text = (result.text || "") + " " + (result.title || "");
    const matches = text.match(emailRegex) || [];
    for (const email of matches) {
      // Filter out common non-contact emails
      const lower = email.toLowerCase();
      if (
        !lower.includes("noreply") &&
        !lower.includes("no-reply") &&
        !lower.includes("unsubscribe") &&
        !lower.includes("example.com") &&
        !lower.includes("test@")
      ) {
        emails.add(lower);
      }
    }
  }

  return Array.from(emails);
}

/**
 * Find the best contact email for brand outreach.
 * Prioritizes: partnerships@ > marketing@ > pr@ > info@ > generic
 */
function findBestContactEmail(
  emails: string[],
  brandName: string
): string | null {
  if (emails.length === 0) return null;

  const brandDomain = brandName.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Priority prefixes for outreach
  const priorities = [
    "partnerships",
    "partner",
    "influencer",
    "creator",
    "collab",
    "marketing",
    "brand",
    "sponsor",
    "pr",
    "press",
    "media",
    "hello",
    "hi",
    "contact",
    "info",
  ];

  // Try to find email from the brand's domain first
  const brandEmails = emails.filter((e) =>
    e.includes(brandDomain) || e.split("@")[1]?.includes(brandDomain)
  );

  const targetEmails = brandEmails.length > 0 ? brandEmails : emails;

  for (const prefix of priorities) {
    const match = targetEmails.find((e) => e.startsWith(prefix));
    if (match) return match;
  }

  // Return first brand-domain email, or first email overall
  return targetEmails[0] || emails[0] || null;
}
