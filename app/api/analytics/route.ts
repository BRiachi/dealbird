import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const userId = session.user.id;

    // 1. Fetch all paid orders
    const orders = await prisma.order.findMany({
        where: { userId, status: "PAID" },
        select: { amount: true, createdAt: true }
    });
    // 2. Fetch all products for view count
    const products = await prisma.product.findMany({
        where: { userId },
        select: { clicks: true }
    });

    // 3. Aggregate totals
    const totalRevenue = orders.reduce((acc, o) => acc + o.amount, 0);
    const totalSales = orders.length;
    const totalViews = products.reduce((acc, p) => acc + p.clicks, 0);

    // 4. Generate 30-day Chart Data
    const chartDataMap = new Map<string, number>();
    const today = new Date();

    // Initialize last 30 days with 0
    for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
        chartDataMap.set(key, 0);
    }

    // Fill actual data
    orders.forEach(o => {
        const key = o.createdAt.toISOString().split('T')[0];
        if (chartDataMap.has(key)) {
            chartDataMap.set(key, chartDataMap.get(key)! + o.amount);
        }
    });

    const chartData = Array.from(chartDataMap.entries()).map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        revenue: revenue / 100 // Convert to dollars
    }));

    return NextResponse.json({
        totalRevenue: totalRevenue / 100,
        totalSales,
        totalViews,
        chartData
    });
}
