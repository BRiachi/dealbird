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
    // We need to fetch ALL bookings for this user's products
    // Since Booking is linked to Order, and Order is linked to User (Seller), we can find bookings where order.userId = session.user.id

    // However, the Booking model doesn't have a direct link to User.
    // Booking -> Order -> User (Seller)
    // So we can query Booking where order.userId = session.user.id
    const bookings = await prisma.booking.findMany({
        where: {
            order: {
                userId: session.user.id
            }
        },
        include: {
            order: true,
            profile: {
                include: {
                    product: true
                }
            }
        },
        orderBy: {
            startTime: "desc"
        }
    });

    const serializedBookings = bookings.map(b => ({
        id: b.id,
        buyerName: b.order.buyerName || "Unknown",
        buyerEmail: b.order.buyerEmail || "",
        productTitle: b.profile.product.title,
        amount: b.order.amount / 100,
        createdAt: b.order.createdAt.toISOString(),
        startTime: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
        status: b.status,
        meetingUrl: b.meetingUrl
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
