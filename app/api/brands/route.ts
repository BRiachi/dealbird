import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List all brands from the latest completed scan
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const scanId = searchParams.get("scanId");
  const industry = searchParams.get("industry");
  const sortBy = searchParams.get("sortBy") || "rank";

  // Get user's plan to determine access level
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, lifetimePlan: true },
  });

  const userPlan = user?.lifetimePlan || user?.plan || "free";
  const isFreeTier = userPlan === "free";

  // Find the scan to query from
  let targetScanId = scanId;
  if (!targetScanId) {
    const latestScan = await prisma.brandScan.findFirst({
      where: { userId: session.user.id, status: "completed" },
      orderBy: { completedAt: "desc" },
      select: { id: true },
    });
    targetScanId = latestScan?.id || null;
  }

  if (!targetScanId) {
    return NextResponse.json({ brands: [], total: 0 });
  }

  // Build query filters
  const where: any = {
    scanId: targetScanId,
    userId: session.user.id,
  };
  if (industry) {
    where.industry = { contains: industry, mode: "insensitive" };
  }

  // Build sort
  const orderBy: any =
    sortBy === "confidence"
      ? { confidence: "desc" }
      : sortBy === "name"
      ? { name: "asc" }
      : { rank: "asc" };

  const brands = await prisma.brand.findMany({
    where,
    select: {
      id: true,
      name: true,
      logoUrl: true,
      website: true,
      industry: true,
      rank: true,
      estimatedSpend: true,
      avgDealSize: true,
      platforms: true,
      confidence: true,
      matchReason: true,
      status: true,
      isFreeTier: true,
      _count: {
        select: { videoMentions: true },
      },
    },
    orderBy,
  });

  // For free tier: return full data for top 5, blurred summary for rest
  const processedBrands = brands.map((brand) => {
    const isLocked = isFreeTier && !brand.isFreeTier;
    if (isLocked) {
      return {
        id: brand.id,
        rank: brand.rank,
        industry: brand.industry,
        confidence: brand.confidence,
        locked: true,
        // Blur the important fields
        name: brand.name.charAt(0) + "***",
        logoUrl: null,
        website: null,
        estimatedSpend: null,
        avgDealSize: null,
        platforms: brand.platforms,
        matchReason: null,
        status: brand.status,
        videoMentionCount: 0,
      };
    }

    return {
      id: brand.id,
      name: brand.name,
      logoUrl: brand.logoUrl,
      website: brand.website,
      industry: brand.industry,
      rank: brand.rank,
      estimatedSpend: brand.estimatedSpend,
      avgDealSize: brand.avgDealSize,
      platforms: brand.platforms,
      confidence: brand.confidence,
      matchReason: brand.matchReason,
      status: brand.status,
      locked: false,
      videoMentionCount: brand._count.videoMentions,
    };
  });

  return NextResponse.json({
    brands: processedBrands,
    total: brands.length,
    unlockedCount: isFreeTier ? 5 : brands.length,
  });
}
