import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// PATCH: Edit the outreach email before sending
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brand = await prisma.brand.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true },
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const { subject, body } = await req.json();

  if (!subject || !body) {
    return NextResponse.json(
      { error: "Subject and body are required" },
      { status: 400 }
    );
  }

  await prisma.brand.update({
    where: { id: params.id },
    data: {
      outreachEmail: {
        subject,
        body,
        videoLinks: ((await prisma.brand.findUnique({
          where: { id: params.id },
          select: { outreachEmail: true },
        }))?.outreachEmail as any)?.videoLinks || [],
      },
    },
  });

  return NextResponse.json({ success: true });
}

// POST: Send the outreach email via Resend
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check plan (free users can't send)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, lifetimePlan: true, name: true },
  });

  const userPlan = user?.lifetimePlan || user?.plan || "free";
  if (userPlan === "free") {
    return NextResponse.json(
      { error: "Upgrade to Pro to send emails via Dealbird" },
      { status: 403 }
    );
  }

  const brand = await prisma.brand.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: {
      id: true,
      name: true,
      outreachEmail: true,
    },
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const email = brand.outreachEmail as any;
  if (!email?.subject || !email?.body) {
    return NextResponse.json(
      { error: "No outreach email generated for this brand" },
      { status: 400 }
    );
  }

  const { recipientEmail } = await req.json();
  if (!recipientEmail) {
    return NextResponse.json(
      { error: "Recipient email is required" },
      { status: 400 }
    );
  }

  // Send via Resend
  const result = await sendEmail({
    to: recipientEmail,
    subject: email.subject,
    html: `<div style="font-family: sans-serif; line-height: 1.6; max-width: 600px;">${email.body.replace(/\n/g, "<br>")}</div>`,
    fromName: user?.name || "Creator",
    userId: session.user.id,
    type: "OUTREACH_EMAIL",
  });

  if (!result.success) {
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }

  // Mark brand as email_sent
  await prisma.brand.update({
    where: { id: params.id },
    data: { status: "email_sent" },
  });

  return NextResponse.json({ success: true, emailId: result.id });
}
