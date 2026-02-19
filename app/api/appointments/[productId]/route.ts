import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/appointments/[productId] - Get appointment profile
export async function GET(
    req: NextRequest,
    { params }: { params: { productId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { productId } = params;

        // Verify ownership
        const product = await prisma.product.findUnique({
            where: { id: productId, userId: session.user.id },
            include: { appointmentProfile: true },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product.appointmentProfile || null);
    } catch (error: any) {
        console.error("[API] Error fetching appointment profile:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/appointments/[productId] - Create/Update appointment profile
export async function POST(
    req: NextRequest,
    { params }: { params: { productId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { productId } = params;
        const body = await req.json();
        const { duration, location, availability } = body;

        console.log("[API] Updating profile:", { productId, duration, location, availability });

        // Verify ownership
        const product = await prisma.product.findUnique({
            where: { id: productId, userId: session.user.id },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Upsert profile
        const profile = await prisma.appointmentProfile.upsert({
            where: { productId },
            create: {
                productId,
                duration: parseInt(duration),
                location,
                availability,
            },
            update: {
                duration: parseInt(duration),
                location,
                availability,
            },
        });

        return NextResponse.json(profile);
    } catch (error: any) {
        console.error("[API] Error updating appointment profile:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
