import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addMinutes, format, parse, isBefore, startOfDay, endOfDay } from "date-fns";

// GET /api/appointments/[productId]/slots?date=2024-01-01&timezone=UTC
export async function GET(
    req: NextRequest,
    { params }: { params: { productId: string } }
) {
    try {
        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get("date"); // YYYY-MM-DD
        const timeZone = searchParams.get("timezone") || "UTC";

        if (!dateStr) {
            return NextResponse.json({ error: "Date required" }, { status: 400 });
        }

        const { productId } = params;

        // 1. Get Profile
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { appointmentProfile: true },
        });

        if (!product || !product.appointmentProfile) {
            return NextResponse.json({ error: "Appointment profile not found" }, { status: 404 });
        }

        const profile = product.appointmentProfile;
        const duration = profile.duration; // minutes

        // 2. Determine Day of Week (mon, tue, etc.)
        const targetDate = parse(dateStr, "yyyy-MM-dd", new Date());
        const dayOfWeek = format(targetDate, "EEE").toLowerCase(); // mon, tue...

        // 3. Get Availability Rules
        // availability is Json, verify type
        const availability = (profile.availability || {}) as Record<string, string[]>;
        const daySlots = availability[dayOfWeek];

        if (!daySlots || !Array.isArray(daySlots) || daySlots.length === 0) {
            return NextResponse.json({ slots: [] }); // Closed today
        }

        if (daySlots.length === 0) {
            return NextResponse.json({ slots: [] }); // Closed today
        }

        // 4. Get Existing Bookings
        const start = startOfDay(targetDate);
        const end = endOfDay(targetDate);

        const bookings = await prisma.booking.findMany({
            where: {
                profileId: profile.id,
                startTime: {
                    gte: start,
                    lte: end,
                },
                status: { not: "CANCELLED" }
            },
        });

        // 5. Generate Slots
        const availableSlots: string[] = [];

        for (const range of daySlots) {
            const [startStr, endStr] = range.split("-"); // "09:00-17:00"
            if (!startStr || !endStr) continue;

            let current = parse(startStr, "HH:mm", targetDate);
            const rangeEnd = parse(endStr, "HH:mm", targetDate);

            while (isBefore(current, rangeEnd)) {
                const slotEnd = addMinutes(current, duration);

                if (isBefore(slotEnd, rangeEnd) || slotEnd.getTime() === rangeEnd.getTime()) {
                    // Check collision
                    const isBooked = bookings.some(booking => {
                        return (
                            (current >= booking.startTime && current < booking.endTime) ||
                            (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
                            (current <= booking.startTime && slotEnd >= booking.endTime)
                        );
                    });

                    if (!isBooked) {
                        availableSlots.push(format(current, "HH:mm"));
                    }
                }

                current = addMinutes(current, duration);
            }
        }

        return NextResponse.json({ slots: availableSlots });
    } catch (error: any) {
        console.error("[API] Error fetching slots:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
