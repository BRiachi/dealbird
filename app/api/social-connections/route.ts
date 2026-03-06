import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List all social connections for the current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connections = await prisma.socialConnection.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      platform: true,
      handle: true,
      lastScannedAt: true,
      videoCount: true,
      status: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(connections);
}

// POST: Connect a new social platform
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platform, handle } = await req.json();

  if (!platform || !handle) {
    return NextResponse.json(
      { error: "Platform and handle are required" },
      { status: 400 }
    );
  }

  const validPlatforms = ["youtube", "tiktok", "instagram"];
  if (!validPlatforms.includes(platform)) {
    return NextResponse.json(
      { error: "Invalid platform. Must be youtube, tiktok, or instagram" },
      { status: 400 }
    );
  }

  // Sanitize handle
  const cleanHandle = handle.trim();
  if (cleanHandle.length < 1 || cleanHandle.length > 200) {
    return NextResponse.json(
      { error: "Handle must be between 1 and 200 characters" },
      { status: 400 }
    );
  }

  const connection = await prisma.socialConnection.upsert({
    where: {
      userId_platform: {
        userId: session.user.id,
        platform,
      },
    },
    create: {
      userId: session.user.id,
      platform,
      handle: cleanHandle,
    },
    update: {
      handle: cleanHandle,
    },
  });

  return NextResponse.json(connection);
}
