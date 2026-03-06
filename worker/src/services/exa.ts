import Exa from "exa-js";

const exa = new Exa(process.env.EXA_API_KEY);

interface ExaResult {
  title: string;
  url: string;
  publishedDate?: string;
  snippet: string;
}

/**
 * Research a brand's influencer marketing campaigns via Exa.
 * Returns real, verified URLs — no AI fabrication possible.
 */
export async function researchBrandCampaigns(
  brandName: string
): Promise<ExaResult[]> {
  try {
    const results = await exa.searchAndContents(
      `${brandName} influencer marketing campaign creator sponsorship`,
      {
        numResults: 10,
        type: "auto",
        startPublishedDate: "2024-01-01",
        text: { maxCharacters: 500 },
      }
    );

    return (results.results || []).map((r: any) => ({
      title: r.title || "",
      url: r.url,
      publishedDate: r.publishedDate,
      snippet: r.text || "",
    }));
  } catch (error) {
    console.error(`Exa campaign research failed for ${brandName}:`, error);
    return [];
  }
}

/**
 * Research what platforms a brand prioritizes and their estimated spend.
 */
export async function researchBrandSpend(
  brandName: string
): Promise<ExaResult[]> {
  try {
    const results = await exa.searchAndContents(
      `${brandName} sponsored content creator partnership deal`,
      {
        numResults: 5,
        type: "auto",
        startPublishedDate: "2024-01-01",
        text: { maxCharacters: 500 },
      }
    );

    return (results.results || []).map((r: any) => ({
      title: r.title || "",
      url: r.url,
      publishedDate: r.publishedDate,
      snippet: r.text || "",
    }));
  } catch (error) {
    console.error(`Exa spend research failed for ${brandName}:`, error);
    return [];
  }
}

/**
 * Get recent news about a brand.
 */
export async function getBrandNews(
  brandName: string
): Promise<ExaResult[]> {
  try {
    const results = await exa.searchAndContents(
      `${brandName} latest news`,
      {
        numResults: 5,
        type: "neural",
        startPublishedDate: "2025-12-01",
        text: { maxCharacters: 300 },
      }
    );

    return (results.results || []).map((r: any) => ({
      title: r.title || "",
      url: r.url,
      publishedDate: r.publishedDate,
      snippet: r.text || "",
    }));
  } catch (error) {
    console.error(`Exa news failed for ${brandName}:`, error);
    return [];
  }
}

/**
 * Find a brand's official website.
 */
export async function findBrandWebsite(
  brandName: string
): Promise<string | null> {
  try {
    const results = await exa.search(`${brandName} official website`, {
      numResults: 1,
      type: "keyword",
    });

    return results.results?.[0]?.url || null;
  } catch (error) {
    console.error(`Exa website search failed for ${brandName}:`, error);
    return null;
  }
}
