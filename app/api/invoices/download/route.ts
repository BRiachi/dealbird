import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/invoices/download?slug=X&key=Y
// Validates invoice is PAID before redirecting to file URL
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const key = req.nextUrl.searchParams.get("key");

  if (!slug || !key) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { slug },
    select: { status: true, deliverables: true },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (invoice.status !== "PAID") {
    return NextResponse.json({ error: "Payment required to download files" }, { status: 403 });
  }

  const deliverables = (invoice.deliverables as any[]) || [];
  const file = deliverables.find((d: any) => d.key === key);

  if (!file?.url) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return NextResponse.redirect(file.url);
}
