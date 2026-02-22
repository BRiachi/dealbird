import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingsList } from "./BookingsList";
import { AppointmentsView } from "../appointments/AppointmentsView";
import { BookingsTabs } from "./BookingsTabs";
import { redirect } from "next/navigation";

export default async function BookingsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    // === Bookings tab data ===
    const bookings = await prisma.booking.findMany({
        where: {
            profile: {
                product: {
                    userId: session.user.id
                }
            }
        },
        include: {
            profile: {
                include: {
                    product: true
                }
            },
            order: true
        },
        orderBy: {
            startTime: 'asc'
        }
    });

    const now = new Date();
    const upcoming = bookings.filter(b => new Date(b.endTime) >= now);
    const past = bookings.filter(b => new Date(b.endTime) < now);

    // === Appointments tab data ===
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

    const appointmentBookings = await prisma.booking.findMany({
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

    const serializedBookings = appointmentBookings.map(b => ({
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
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight mb-1">Bookings</h1>
                <p className="text-gray-500">Manage your scheduled appointments and coaching sessions.</p>
            </div>

            <BookingsTabs>
                {/* Tab 1: Bookings (upcoming/past cards) */}
                <div className="space-y-10">
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-xl font-bold">Upcoming</h2>
                            <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full">{upcoming.length}</span>
                        </div>
                        {upcoming.length === 0 ? (
                            <div className="p-8 text-center border-2 border-dashed rounded-2xl text-gray-400">
                                No upcoming bookings.
                            </div>
                        ) : (
                            <BookingsList bookings={upcoming} type="upcoming" />
                        )}
                    </section>

                    {past.length > 0 && (
                        <section className="opacity-60 hover:opacity-100 transition-opacity">
                            <h2 className="text-xl font-bold mb-4">Past</h2>
                            <BookingsList bookings={past} type="past" />
                        </section>
                    )}
                </div>

                {/* Tab 2: Appointments (stats, coaching products, searchable table) */}
                <AppointmentsView
                    coachingProducts={coachingProducts as any}
                    bookings={serializedBookings}
                />
            </BookingsTabs>
        </div>
    );
}
