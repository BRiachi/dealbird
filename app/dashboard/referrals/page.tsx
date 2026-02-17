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
        select: { handle: true },
    });

    // Calculate referral stats from products settings
    const affiliateProducts = products.filter(
        (p: any) => p.settings?.affiliate?.active
    );

    const stats = {
        totalProducts: products.length,
        affiliateEnabled: affiliateProducts.length,
        totalCommissionEarned: 0, // Placeholder — will be from actual referral tracking
        activeAffiliates: 0, // Placeholder
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold">Referrals</h1>
                    <p className="text-gray-500 mt-1">Manage your affiliate program and track referral performance.</p>
                </div>
            </div>

            <ReferralDashboard
                products={products as any}
                handle={user?.handle || ""}
                stats={stats}
            />
        </div>
    );
}
