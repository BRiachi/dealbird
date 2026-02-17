import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { IncomeActions } from "./IncomeActions";

export default async function IncomePage() {
    const session = await getServerSession(authOptions);
    const userId = session!.user.id;

    // Fetch all orders (sales made by this user)
    const orders = await prisma.order.findMany({
        where: { userId },
        include: { product: { select: { title: true, type: true } } },
        orderBy: { createdAt: "desc" },
    });

    // Fetch all invoices
    const invoices = await prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });

    // Calculate totals
    const totalRevenue = orders
        .filter((o) => o.status === "PAID")
        .reduce((sum, o) => sum + o.amount, 0);

    const totalInvoicePaid = invoices
        .filter((i) => i.status === "PAID")
        .reduce((sum, i) => sum + i.total, 0);

    const totalInvoicePending = invoices
        .filter((i) => i.status === "PENDING")
        .reduce((sum, i) => sum + i.total, 0);

    const totalEarned = totalRevenue + totalInvoicePaid;
    const totalPending = totalInvoicePending;

    // Monthly revenue breakdown (last 6 months)
    const now = new Date();
    const monthlyData: { month: string; revenue: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const monthOrders = orders.filter(
            (o) =>
                o.status === "PAID" &&
                new Date(o.createdAt) >= month &&
                new Date(o.createdAt) < nextMonth
        );
        const monthInvoices = invoices.filter(
            (i) =>
                i.status === "PAID" &&
                i.paidAt &&
                new Date(i.paidAt) >= month &&
                new Date(i.paidAt) < nextMonth
        );
        monthlyData.push({
            month: month.toLocaleString("default", { month: "short" }),
            revenue: monthOrders.reduce((s, o) => s + o.amount, 0) + monthInvoices.reduce((s, i) => s + i.total, 0),
            orders: monthOrders.length,
        });
    }

    // Recent transactions (combine orders and invoices)
    const transactions = [
        ...orders.map((o) => ({
            id: o.id,
            type: "sale" as const,
            description: o.product.title,
            from: o.buyerName || o.buyerEmail,
            amount: o.amount,
            status: o.status,
            date: o.createdAt,
        })),
        ...invoices.map((i) => ({
            id: i.id,
            type: "invoice" as const,
            description: `Invoice ${i.number}`,
            from: i.brand,
            amount: i.total,
            status: i.status,
            date: i.createdAt,
        })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-1">Income</h1>
                    <p className="text-gray-500">Your revenue and payout overview.</p>
                </div>
                <IncomeActions transactions={transactions} />
            </div>

            {/* Revenue Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-sm">💰</div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Earned</span>
                    </div>
                    <div className="text-3xl font-extrabold tracking-tight text-green-600">
                        {formatCurrency(totalEarned)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Products + Invoices</div>
                </div>

                <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center text-sm">⏳</div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pending</span>
                    </div>
                    <div className="text-3xl font-extrabold tracking-tight text-yellow-600">
                        {formatCurrency(totalPending)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Unpaid invoices</div>
                </div>

                <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-sm">📦</div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Sales</span>
                    </div>
                    <div className="text-3xl font-extrabold tracking-tight">
                        {orders.filter((o) => o.status === "PAID").length}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Completed orders</div>
                </div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="bg-white rounded-2xl border border-black/[0.07] p-6 mb-8">
                <h3 className="font-bold text-base mb-5">Monthly Revenue</h3>
                <div className="flex items-end gap-3 h-40">
                    {monthlyData.map((d, i) => {
                        const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1);
                        const height = (d.revenue / maxRevenue) * 100;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400">
                                    {d.revenue > 0 ? formatCurrency(d.revenue) : "–"}
                                </span>
                                <div className="w-full relative" style={{ height: "120px" }}>
                                    <div
                                        className="absolute bottom-0 w-full rounded-lg transition-all"
                                        style={{
                                            height: `${Math.max(height, 4)}%`,
                                            backgroundColor: d.revenue > 0 ? "#C8FF00" : "#F3F4F6",
                                        }}
                                    />
                                </div>
                                <span className="text-[10px] font-semibold text-gray-500">{d.month}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl border border-black/[0.07] p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-base">All Transactions</h3>
                    <span className="text-xs font-semibold text-gray-400">{transactions.length} total</span>
                </div>

                {transactions.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-3xl mb-3">💸</p>
                        <p className="text-sm">No transactions yet.</p>
                        <p className="text-xs mt-1">Revenue from product sales and invoices will appear here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-black/[0.04]">
                        {transactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between py-3.5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${t.type === "sale" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                                        }`}>
                                        {t.type === "sale" ? "🛒" : "📄"}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm">{t.description}</div>
                                        <div className="text-xs text-gray-400">
                                            {t.from} · {formatDate(t.date)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold text-sm">{formatCurrency(t.amount)}</span>
                                    <StatusBadge status={t.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
