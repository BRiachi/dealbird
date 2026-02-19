import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingsList } from "./BookingsList";

export default async function BookingsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    // Fetch bookings for products owned by this user
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
            order: true // To get buyer details
        },
        orderBy: {
            startTime: 'asc'
        }
    });

    // Flag past bookings
    const now = new Date();
    const upcoming = bookings.filter(b => new Date(b.endTime) >= now);
    const past = bookings.filter(b => new Date(b.endTime) < now);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight mb-1">Bookings</h1>
                <p className="text-gray-500">Manage your scheduled appointments.</p>
            </div>

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
        </div>
    );
}
