import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const stripe = getStripe();
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    try {
        let accountId = user.stripeConnectId;

        // 1. Create Express Account if not exists
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: "express",
                email: user.email || undefined,
                country: "US", // Default to US for now, can be dynamic
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });

            accountId = account.id;

            await prisma.user.update({
                where: { id: user.id },
                data: { stripeConnectId: accountId },
            });
        }

        // 2. Create Account Link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe_connect=refresh`,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe_connect=return`,
            type: "account_onboarding",
        });

        return NextResponse.json({ url: accountLink.url });
    } catch (error: any) {
        console.error("[STRIPE_CONNECT_ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user?.stripeConnectId) {
        return NextResponse.json({ enabled: false });
    }

    const stripe = getStripe();
    try {
        const account = await stripe.accounts.retrieve(user.stripeConnectId);

        const isEnabled = account.charges_enabled && account.payouts_enabled;

        // Update local DB if status changed
        if (isEnabled !== user.stripeConnectEnabled) {
            await prisma.user.update({
                where: { id: user.id },
                data: { stripeConnectEnabled: isEnabled }
            });
        }

        return NextResponse.json({
            enabled: isEnabled,
            details_submitted: account.details_submitted
        });
    } catch (error) {
        return NextResponse.json({ enabled: false, error });
    }
}
