import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Mail, ShoppingBag, Calendar } from "lucide-react";
import { AudienceTable } from "../audience/AudienceTable";
import { CustomersTabs } from "./CustomersTabs";
import { redirect } from "next/navigation";

interface Customer {
    email: string;
    name: string | null;
    totalSpent: number;
    ordersCount: number;
    lastOrderDate: Date;
}

export default async function CustomersPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    // Fetch all orders with product info (needed for audience tab)
    const orders = await prisma.order.findMany({
        where: {
            userId: session.user.id,
            status: "PAID"
        },
        include: { product: true },
        orderBy: { createdAt: 'desc' }
    });

    // === Customers tab data ===
    const customersMap = new Map<string, Customer>();
    for (const order of orders) {
        if (!customersMap.has(order.buyerEmail)) {
            customersMap.set(order.buyerEmail, {
                email: order.buyerEmail,
                name: order.buyerName,
                totalSpent: 0,
                ordersCount: 0,
                lastOrderDate: order.createdAt
            });
        }
        const customer = customersMap.get(order.buyerEmail)!;
        customer.totalSpent += order.amount;
        customer.ordersCount += 1;
        if (order.createdAt > customer.lastOrderDate) {
            customer.lastOrderDate = order.createdAt;
        }
    }
    const customers = Array.from(customersMap.values()).sort((a, b) => b.lastOrderDate.getTime() - a.lastOrderDate.getTime());

    // === Audience tab data ===
    const allProductTitles = Array.from(new Set(orders.map(o => o.product.title)));
    const audienceMap = new Map<string, any>();
    orders.forEach((order) => {
        const email = order.buyerEmail;
        if (!email) return;
        if (!audienceMap.has(email)) {
            audienceMap.set(email, {
                email,
                name: order.buyerName || "Unknown",
                totalSpend: 0,
                orders: 0,
                lastOrder: order.createdAt,
                products: new Set(),
            });
        }
        const c = audienceMap.get(email);
        c.totalSpend += order.amount;
        c.orders += 1;
        c.products.add(order.product.title);
        if (new Date(order.createdAt) > new Date(c.lastOrder)) {
            c.lastOrder = order.createdAt;
        }
    });
    const audienceData = Array.from(audienceMap.values()).map(c => ({
        email: c.email,
        name: c.name,
        totalSpend: c.totalSpend / 100,
        orders: c.orders,
        lastOrder: new Date(c.lastOrder).toISOString(),
        products: Array.from(c.products).join(", "),
        tags: [] as string[],
    }));

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight mb-1">Customers</h1>
                <p className="text-gray-500">People who have purchased your products.</p>
            </div>

            <CustomersTabs>
                {/* Tab 1: Customers (simple table) */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    {customers.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            No customers yet. Share your store link to get started!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-gray-500">Customer</th>
                                        <th className="px-6 py-4 font-bold text-gray-500 text-center">Orders</th>
                                        <th className="px-6 py-4 font-bold text-gray-500 text-right">Total Spent</th>
                                        <th className="px-6 py-4 font-bold text-gray-500 text-right">Last Seen</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {customers.map((customer) => (
                                        <tr key={customer.email} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{customer.name || "Guest"}</div>
                                                <div className="flex items-center gap-1.5 text-gray-500 mt-0.5">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    <a href={`mailto:${customer.email}`} className="hover:text-blue-500 hover:underline">
                                                        {customer.email}
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-bold text-xs">
                                                    <ShoppingBag className="w-3 h-3" />
                                                    {customer.ordersCount}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900">
                                                ${(customer.totalSpent / 100).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-500">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 opacity-50" />
                                                    {customer.lastOrderDate.toLocaleDateString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Tab 2: Audience (rich table with filters, tags, export) */}
                <AudienceTable data={audienceData} allProducts={allProductTitles} />
            </CustomersTabs>
        </div>
    );
}
