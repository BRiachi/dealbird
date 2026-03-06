import { prisma } from "../services/database";
import { generateCarouselText, generateCarouselImage } from "../services/openai";

/**
 * On-demand carousel generation for a specific brand.
 * Called when creator clicks "Generate Carousel" on brand detail page.
 * NOT part of the main scan pipeline (saves ~$8 per scan).
 */
export async function generateCarousel(brandId: string) {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    include: {
      user: { select: { name: true } },
      scan: { select: { platform: true } },
    },
  });

  if (!brand) {
    throw new Error(`Brand ${brandId} not found`);
  }

  console.log(`Generating carousel for brand: ${brand.name}`);

  // Step 1: Generate slide text with GPT-4o
  const slides = await generateCarouselText({
    creatorName: brand.user.name || "Creator",
    brandName: brand.name,
    matchReason: brand.matchReason || "",
    niche: brand.industry || "",
  });

  // Step 2: Generate images for each slide with DALL-E 3
  const carouselSlides: { imageUrl: string; headline: string; body: string }[] =
    [];

  for (const slide of slides) {
    try {
      const imageUrl = await generateCarouselImage(
        slide.headline,
        slide.body,
        brand.name
      );

      carouselSlides.push({
        imageUrl,
        headline: slide.headline,
        body: slide.body,
      });
    } catch (err) {
      console.error(
        `Failed to generate image for slide "${slide.headline}":`,
        err
      );
      // Still save the text even if image fails
      carouselSlides.push({
        imageUrl: "",
        headline: slide.headline,
        body: slide.body,
      });
    }
  }

  // Save carousel to brand record
  await prisma.brand.update({
    where: { id: brandId },
    data: { carouselSlides },
  });

  console.log(
    `Carousel generated: ${carouselSlides.length} slides for ${brand.name}`
  );
  return carouselSlides;
}
