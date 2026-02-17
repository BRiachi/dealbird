import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AudienceTable } from "./AudienceTable";

export default async function AudiencePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    try {
        // Fetch all orders for this user
        const orders = await prisma.order.findMany({
            where: { userId: session.user.id, status: "PAID" },
            include: { product: true },
            orderBy: { createdAt: "desc" },
        });

        // Get all product titles for the filter dropdown
        const allProductTitles = Array.from(new Set(orders.map(o => o.product.title)));

        // Aggregate unique customers
        const customersMap = new Map<string, any>();

        orders.forEach((order) => {
            const email = order.buyerEmail;
            if (!email) return;

            if (!customersMap.has(email)) {
                customersMap.set(email, {
                    email,
                    name: order.buyerName || "Unknown",
                    totalSpend: 0,
                    orders: 0,
                    lastOrder: order.createdAt,
                    products: new Set(),
                });
            }

            const customer = customersMap.get(email);
            customer.totalSpend += order.amount;
            customer.orders += 1;
            customer.products.add(order.product.title);
            if (new Date(order.createdAt) > new Date(customer.lastOrder)) {
                customer.lastOrder = order.createdAt;
            }
        });

        const customers = Array.from(customersMap.values()).map(c => {
            const productsList = Array.from(c.products).join(", ");
            const spend = c.totalSpend / 100;
            const dateStr = new Date(c.lastOrder).toISOString();

            return {
                email: c.email,
                name: c.name,
                totalSpend: spend,
                orders: c.orders,
                lastOrder: dateStr,
                products: productsList,
                tags: [] as string[],
            };
        });

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold">Audience</h1>
                        <p className="text-gray-500 mt-1">Manage your customers, leads, and segments.</p>
                    </div>
                </div>

                <AudienceTable data={customers} allProducts={allProductTitles} />
            </div>
        );
    } catch (e) {
        console.error("Audience Page Error:", e);
        return (
            <div className="p-10 text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <div className="text-gray-600 font-semibold">Something went wrong loading your audience</div>
                <div className="text-gray-400 text-sm mt-1">Please try refreshing the page</div>
            </div>
        );
    }
}
