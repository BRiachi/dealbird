import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReferralDashboard } from "./ReferralDashboard";

export default async function ReferralsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    // Fetch user's products that have affiliate enabled
    const products = await prisma.product.findMany({
        where: { userId: session.user.id },
        select: {
            id: true,
            title: true,
            type: true,
            price: true,
            settings: true,
            sales: true,
        },
    });

    // Fetch user handle for link generation
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            handle: true,
            stripeConnectEnabled: true
        },
    });

    // Calculate referral stats from products settings
    const affiliateProducts = products.filter(
        (p: any) => p.settings?.affiliate?.active
    );


    // Fetch orders where user is the affiliate (Earnings)
    const affiliateOrders = await prisma.order.findMany({
        where: {
            affiliateUserId: session.user.id,
            status: "PAID"
        },
        include: {
            product: {
                select: {
                    settings: true
                }
            }
        }
    });

    // Calculate total earnings
    let totalCommissionEarned = 0;
    affiliateOrders.forEach(order => {
        const settings = (order.product.settings as any) || {};
        const commissionRate = settings.affiliate?.commission || 20; // Default 20%
        totalCommissionEarned += (order.amount * (commissionRate / 100));
    });

    // Fetch users referred by this user (Lifetime)
    const lifetimeReferrals = await prisma.user.count({
        where: { referredById: session.user.id }
    });

    // Fetch orders for user's own products that had an affiliate (Active Affiliates)
    const myProductOrders = await prisma.order.findMany({
        where: {
            userId: session.user.id,
            affiliateUserId: { not: null },
            status: "PAID"
        },
        select: { affiliateUserId: true }
    });

    const activeAffiliatesCount = new Set(myProductOrders.map(o => o.affiliateUserId)).size;

    const stats = {
        totalProducts: products.length,
        affiliateEnabled: affiliateProducts.length,
        totalCommissionEarned: totalCommissionEarned / 100, // Convert to dollars
        activeAffiliates: activeAffiliatesCount,
        lifetimeReferrals: lifetimeReferrals
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold">Referrals</h1>
                    <p className="text-gray-500 mt-1">Manage your affiliate program and track your earnings.</p>
                </div>
            </div>

            <ReferralDashboard
                products={products as any}
                handle={user?.handle || ""}
                stats={stats}
                payoutsEnabled={user?.stripeConnectEnabled || false}
            />
        </div>
    );
}
