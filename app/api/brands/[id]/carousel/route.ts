import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const WORKER_URL = process.env.RAILWAY_WORKER_URL;
const WORKER_SECRET = process.env.RAILWAY_WORKER_SECRET || "";

// GET: Get existing carousel slides
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brand = await prisma.brand.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { carouselSlides: true, name: true },
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  return NextResponse.json({
    slides: brand.carouselSlides || [],
    brandName: brand.name,
  });
}

// POST: Trigger on-demand carousel generation
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check plan (free users can't generate carousels)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, lifetimePlan: true },
  });

  const userPlan = user?.lifetimePlan || user?.plan || "free";
  if (userPlan === "free") {
    return NextResponse.json(
      { error: "Upgrade to Pro to generate carousels" },
      { status: 403 }
    );
  }

  const brand = await prisma.brand.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true, carouselSlides: true },
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  if (!WORKER_URL) {
    return NextResponse.json(
      { error: "Worker service not configured" },
      { status: 500 }
    );
  }

  // Call worker to generate carousel
  const payload = JSON.stringify({ brandId: brand.id });
  const signature = crypto
    .createHmac("sha256", WORKER_SECRET)
    .update(payload)
    .digest("hex");

  try {
    const response = await fetch(`${WORKER_URL}/api/carousel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-signature": signature,
      },
      body: payload,
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(
        { error: err.error || "Carousel generation failed" },
        { status: 500 }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to trigger carousel generation:", err);
    return NextResponse.json(
      { error: "Failed to connect to processing service" },
      { status: 500 }
    );
  }
}
