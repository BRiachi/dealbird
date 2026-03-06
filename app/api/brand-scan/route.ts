import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const WORKER_URL = process.env.RAILWAY_WORKER_URL;
const WORKER_SECRET = process.env.RAILWAY_WORKER_SECRET || "";

// GET: List all scans for the current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scans = await prisma.brandScan.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      platform: true,
      handle: true,
      status: true,
      progress: true,
      progressMsg: true,
      videoCount: true,
      brandCount: true,
      error: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(scans);
}

// POST: Start a new brand scan
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

  if (!WORKER_URL) {
    return NextResponse.json(
      { error: "Worker service not configured" },
      { status: 500 }
    );
  }

  // Check for existing in-progress scan
  const existingScan = await prisma.brandScan.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ["queued", "scraping", "analyzing", "researching", "generating"] },
    },
  });

  if (existingScan) {
    return NextResponse.json(
      { error: "A scan is already in progress. Please wait for it to complete." },
      { status: 409 }
    );
  }

  // Check plan-based scan limits
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, lifetimePlan: true },
  });

  const userPlan = user?.lifetimePlan || user?.plan || "free";

  // Count scans this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const scansThisMonth = await prisma.brandScan.count({
    where: {
      userId: session.user.id,
      createdAt: { gte: startOfMonth },
      status: "completed",
    },
  });

  const scanLimits: Record<string, number> = {
    free: 1,
    pro: 3,
    agency: 999,
  };

  if (scansThisMonth >= (scanLimits[userPlan] || 1)) {
    return NextResponse.json(
      {
        error: `You've used all ${scanLimits[userPlan]} scans for this month. Upgrade your plan for more.`,
      },
      { status: 403 }
    );
  }

  // Create the scan record
  const scan = await prisma.brandScan.create({
    data: {
      userId: session.user.id,
      platform,
      handle: handle.trim(),
      status: "queued",
    },
  });

  // Sign the request to the worker
  const payload = JSON.stringify({ scanId: scan.id });
  const signature = crypto
    .createHmac("sha256", WORKER_SECRET)
    .update(payload)
    .digest("hex");

  // Trigger the worker (fire and forget)
  try {
    await fetch(`${WORKER_URL}/api/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-signature": signature,
      },
      body: payload,
    });
  } catch (err) {
    console.error("Failed to trigger worker:", err);
    await prisma.brandScan.update({
      where: { id: scan.id },
      data: { status: "failed", error: "Failed to connect to processing service" },
    });
    return NextResponse.json(
      { error: "Failed to start scan. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ scanId: scan.id, status: "queued" });
}
