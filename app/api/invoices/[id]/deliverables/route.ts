import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { deliverables } = await request.json();

        if (!Array.isArray(deliverables)) {
            return NextResponse.json({ error: "Invalid format" }, { status: 400 });
        }

        // Verify the user owns this invoice
        const invoice = await prisma.invoice.findFirst({
            where: { id: params.id, userId: session.user.id },
        });

        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found or unauthorized" }, { status: 404 });
        }

        // Update the invoice with new deliverables
        await prisma.invoice.update({
            where: { id: params.id },
            data: { deliverables: deliverables as any }, // Prisma JSON
        });

        return NextResponse.json({ success: true, deliverables });
    } catch (error) {
        console.error("Error saving deliverables:", error);
        return NextResponse.json({ error: "Failed to save deliverables" }, { status: 500 });
    }
}
