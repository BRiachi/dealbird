import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(email: string | null | undefined): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !email) return false;
  return email === adminEmail;
}

// GET /api/admin/promo — list all codes with claims
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const codes = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      claims: {
        include: {
          user: { select: { email: true, name: true } },
        },
        orderBy: { claimedAt: "desc" },
      },
    },
  });

  return NextResponse.json(codes);
}

// POST /api/admin/promo — create a new code
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { code?: unknown; plan?: unknown; maxUses?: unknown; expiresAt?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { code: rawCode, plan, maxUses, expiresAt } = body;

  if (!rawCode || typeof rawCode !== "string") {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const code = rawCode.trim().toUpperCase();

  if (!/^[A-Z0-9_-]+$/.test(code)) {
    return NextResponse.json(
      { error: "Code may only contain letters, numbers, dashes, and underscores" },
      { status: 400 }
    );
  }

  if (plan !== "pro" && plan !== "agency") {
    return NextResponse.json({ error: "Plan must be 'pro' or 'agency'" }, { status: 400 });
  }

  const maxUsesValue =
    maxUses !== undefined && maxUses !== null && maxUses !== ""
      ? Number(maxUses)
      : null;

  if (maxUsesValue !== null && (isNaN(maxUsesValue) || maxUsesValue < 1)) {
    return NextResponse.json({ error: "Max uses must be a positive number" }, { status: 400 });
  }

  let expiresAtValue: Date | null = null;
  if (expiresAt && expiresAt !== "") {
    expiresAtValue = new Date(expiresAt as string);
    if (isNaN(expiresAtValue.getTime()) || expiresAtValue <= new Date()) {
      return NextResponse.json({ error: "Expiry date must be in the future" }, { status: 400 });
    }
  }

  const existing = await prisma.promoCode.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: "A code with this name already exists" }, { status: 409 });
  }

  const promo = await prisma.promoCode.create({
    data: {
      code,
      plan: plan as string,
      maxUses: maxUsesValue,
      expiresAt: expiresAtValue,
    },
  });

  return NextResponse.json(promo, { status: 201 });
}
