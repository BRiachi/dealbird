import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/bookings/[id] — cancel a booking
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const booking = await prisma.booking.findUnique({
        where: { id: params.id },
        include: { profile: { include: { product: true } } },
    });

    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (booking.profile.product.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.booking.update({
        where: { id: params.id },
        data: { status: "CANCELLED" },
    });

    return NextResponse.json(updated);
}
