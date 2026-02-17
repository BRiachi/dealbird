import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppointmentsView } from "./AppointmentsView";

export default async function AppointmentsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    // Fetch coaching products and their orders (bookings)
    const coachingProducts = await prisma.product.findMany({
        where: {
            userId: session.user.id,
            type: "COACHING",
        },
        select: {
            id: true,
            title: true,
            price: true,
            settings: true,
        },
    });

    // Fetch orders for coaching products (these are bookings)
    const bookings = await prisma.order.findMany({
        where: {
            userId: session.user.id,
            status: "PAID",
            product: { type: "COACHING" },
        },
        include: { product: true },
        orderBy: { createdAt: "desc" },
    });

    const serializedBookings = bookings.map(b => ({
        id: b.id,
        buyerName: b.buyerName || "Unknown",
        buyerEmail: b.buyerEmail || "",
        productTitle: b.product.title,
        amount: b.amount / 100,
        createdAt: b.createdAt.toISOString(),
        duration: (b.product.settings as any)?.duration || 30,
        calendarUrl: (b.product.settings as any)?.url || "",
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold">Appointments</h1>
                    <p className="text-gray-500 mt-1">Manage your coaching bookings and availability.</p>
                </div>
            </div>

            <AppointmentsView
                coachingProducts={coachingProducts as any}
                bookings={serializedBookings}
            />
        </div>
    );
}
