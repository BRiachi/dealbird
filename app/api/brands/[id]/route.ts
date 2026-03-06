import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Full brand detail
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brand = await prisma.brand.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      videoMentions: {
        include: {
          video: {
            select: {
              id: true,
              title: true,
              url: true,
              thumbnailUrl: true,
              viewCount: true,
              publishedAt: true,
              platform: true,
            },
          },
        },
      },
      scan: {
        select: { platform: true, handle: true, videoCount: true },
      },
    },
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  // Check free tier access
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, lifetimePlan: true },
  });

  const userPlan = user?.lifetimePlan || user?.plan || "free";
  const isFreeTier = userPlan === "free";

  if (isFreeTier && !brand.isFreeTier) {
    return NextResponse.json(
      {
        error: "Upgrade to Pro to access this brand's details",
        locked: true,
        brand: {
          id: brand.id,
          rank: brand.rank,
          name: brand.name.charAt(0) + "***",
        },
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    id: brand.id,
    name: brand.name,
    logoUrl: brand.logoUrl,
    website: brand.website,
    industry: brand.industry,
    rank: brand.rank,
    confidence: brand.confidence,
    matchReason: brand.matchReason,
    estimatedSpend: brand.estimatedSpend,
    avgDealSize: brand.avgDealSize,
    platforms: brand.platforms,
    recentCampaigns: brand.recentCampaigns,
    recentNews: brand.recentNews,
    outreachEmail: brand.outreachEmail,
    carouselSlides: brand.carouselSlides,
    status: brand.status,
    videos: brand.videoMentions.map((m) => ({
      ...m.video,
      mentionContext: m.context,
    })),
    scan: brand.scan,
  });
}
