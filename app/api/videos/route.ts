import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List all indexed videos for the current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const videos = await prisma.video.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      platform: true,
      title: true,
      url: true,
      thumbnailUrl: true,
      viewCount: true,
      likeCount: true,
      publishedAt: true,
      _count: {
        select: { brandMentions: true },
      },
    },
    orderBy: { viewCount: "desc" },
  });

  return NextResponse.json({ videos, total: videos.length });
}
