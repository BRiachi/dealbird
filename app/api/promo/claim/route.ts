import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { code?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.code || typeof body.code !== "string") {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const code = body.code.trim().toUpperCase();

  const promo = await prisma.promoCode.findUnique({ where: { code } });

  if (!promo || !promo.isActive) {
    return NextResponse.json({ error: "Invalid or expired promo code" }, { status: 404 });
  }

  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return NextResponse.json({ error: "This code has expired" }, { status: 400 });
  }

  if (promo.maxUses !== null && promo.usesCount >= promo.maxUses) {
    return NextResponse.json({ error: "This code has reached its usage limit" }, { status: 400 });
  }

  const existing = await prisma.promoCodeClaim.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) {
    return NextResponse.json({ error: "You have already redeemed a promo code" }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.promoCodeClaim.create({
      data: { promoCodeId: promo.id, userId: session.user.id },
    }),
    prisma.promoCode.update({
      where: { id: promo.id },
      data: { usesCount: { increment: 1 } },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { plan: promo.plan, lifetimePlan: promo.plan },
    }),
  ]);

  return NextResponse.json({ success: true, plan: promo.plan });
}
