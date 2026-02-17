import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function AnalyticsPage() {
    const session = await getServerSession(authOptions);
    const userId = session!.user.id;

    const [products, orders, user, proposalViews] = await Promise.all([
        prisma.product.findMany({
            where: { userId },
            select: {
                id: true,
                title: true,
                type: true,
                clicks: true,
                views: true,
                sales: true,
                revenue: true,
                createdAt: true,
            },
            orderBy: { revenue: "desc" },
        }),
        prisma.order.findMany({
            where: { userId, status: "PAID" },
            select: { amount: true, createdAt: true, productId: true },
        }),
        prisma.user.findUnique({
            where: { id: userId },
            select: { profileViews: true, handle: true },
        }),
        prisma.proposalView.findMany({
            where: { proposal: { userId } },
            select: { viewedAt: true },
        }),
    ]);

    // Summary stats
    const totalViews = (user?.profileViews || 0) + products.reduce((s, p) => s + p.clicks, 0);
    const totalRevenue = orders.reduce((s, o) => s + o.amount, 0);
    const totalSales = orders.length;
    const conversionRate = totalViews > 0 ? ((totalSales / totalViews) * 100).toFixed(1) : "0.0";

    // Daily visits/sales for last 30 days
    const today = new Date();
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(day.getDate() - i);
        const dateStr = day.toISOString().split("T")[0];
        const daySales = orders.filter((o) => o.createdAt.toISOString().split("T")[0] === dateStr);
        const dayViews = proposalViews.filter((v) => v.viewedAt.toISOString().split("T")[0] === dateStr);
        dailyData.push({
            date: day.toLocaleDateString("default", { month: "short", day: "numeric" }),
            revenue: daySales.reduce((s, o) => s + o.amount, 0),
            sales: daySales.length,
            views: dayViews.length,
        });
    }

    // Top products by revenue
    const topProducts = products
        .filter((p) => p.revenue > 0 || p.clicks > 0)
        .slice(0, 10);

    // Product type breakdown
    const typeBreakdown = products.reduce((acc, p) => {
        const type = p.type || "OTHER";
        if (!acc[type]) acc[type] = { count: 0, revenue: 0, sales: 0 };
        acc[type].count += 1;
        acc[type].revenue += p.revenue;
        acc[type].sales += p.sales;
        return acc;
    }, {} as Record<string, { count: number; revenue: number; sales: number }>);

    const maxDailyRevenue = Math.max(...dailyData.map((d) => d.revenue), 1);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight mb-1">Analytics</h1>
                <p className="text-gray-500">Track your store performance and growth.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Views", value: totalViews.toLocaleString(), icon: "👁️", accent: "text-blue-600" },
                    { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: "💰", accent: "text-green-600" },
                    { label: "Total Sales", value: totalSales.toLocaleString(), icon: "🛒", accent: "text-purple-600" },
                    { label: "Conversion Rate", value: `${conversionRate}%`, icon: "📈", accent: "text-orange-600" },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-black/[0.07] p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{s.icon}</span>
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{s.label}</span>
                        </div>
                        <div className={`text-2xl font-extrabold tracking-tight ${s.accent}`}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Revenue Chart (30 days) */}
            <div className="bg-white rounded-2xl border border-black/[0.07] p-6 mb-8">
                <h3 className="font-bold text-base mb-1">Revenue — Last 30 Days</h3>
                <p className="text-xs text-gray-400 mb-5">Daily revenue from product sales</p>
                <div className="flex items-end gap-[3px] h-36">
                    {dailyData.map((d, i) => {
                        const height = (d.revenue / maxDailyRevenue) * 100;
                        return (
                            <div
                                key={i}
                                className="flex-1 rounded-sm transition-all hover:opacity-80 group relative"
                                style={{
                                    height: `${Math.max(height, 2)}%`,
                                    backgroundColor: d.revenue > 0 ? "#C8FF00" : "#F3F4F6",
                                    minHeight: "3px",
                                }}
                                title={`${d.date}: ${formatCurrency(d.revenue)} (${d.sales} sales)`}
                            />
                        );
                    })}
                </div>
                <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-gray-400">{dailyData[0]?.date}</span>
                    <span className="text-[10px] text-gray-400">{dailyData[dailyData.length - 1]?.date}</span>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_340px] gap-6">
                {/* Product Performance */}
                <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
                    <h3 className="font-bold text-base mb-5">Product Performance</h3>
                    {topProducts.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            <p className="text-2xl mb-2">📊</p>
                            <p>No product data yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {topProducts.map((p) => {
                                const maxRev = Math.max(...topProducts.map((t) => t.revenue), 1);
                                const barWidth = (p.revenue / maxRev) * 100;
                                const prodConversion = p.clicks > 0 ? ((p.sales / p.clicks) * 100).toFixed(1) : "0.0";
                                return (
                                    <div key={p.id} className="relative">
                                        <div className="flex items-center justify-between mb-1">
                                            <div>
                                                <span className="font-semibold text-sm">{p.title}</span>
                                                <span className="text-[10px] ml-2 text-gray-400 uppercase">{p.type}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs">
                                                <span className="text-gray-400">
                                                    {p.clicks} views → {p.sales} sales ({prodConversion}%)
                                                </span>
                                                <span className="font-mono font-bold">{formatCurrency(p.revenue)}</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-[#C8FF00]"
                                                style={{ width: `${Math.max(barWidth, 2)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Product Type Breakdown */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
                        <h3 className="font-bold text-base mb-4">By Product Type</h3>
                        {Object.keys(typeBreakdown).length === 0 ? (
                            <p className="text-sm text-gray-400">No products yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {Object.entries(typeBreakdown).map(([type, data]) => (
                                    <div key={type} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${type === "DIGITAL" ? "bg-blue-400" :
                                                    type === "COACHING" ? "bg-purple-400" :
                                                        type === "COURSE" ? "bg-orange-400" :
                                                            type === "MEMBERSHIP" ? "bg-pink-400" :
                                                                type === "COLLECT_EMAIL" ? "bg-green-400" :
                                                                    "bg-gray-400"
                                                }`} />
                                            <span className="text-xs font-semibold capitalize">
                                                {type.toLowerCase().replace("_", " ")}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {data.count} products · {data.sales} sales · {formatCurrency(data.revenue)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
                        <h3 className="font-bold text-base mb-4">Quick Stats</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Store Visits</span>
                                <span className="font-bold">{user?.profileViews?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Active Products</span>
                                <span className="font-bold">{products.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Proposal Views</span>
                                <span className="font-bold">{proposalViews.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Avg Order Value</span>
                                <span className="font-bold">
                                    {totalSales > 0 ? formatCurrency(Math.round(totalRevenue / totalSales)) : "$0.00"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
