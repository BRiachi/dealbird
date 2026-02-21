import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { productIds } = await request.json();

        if (!Array.isArray(productIds)) {
            return NextResponse.json({ error: "Invalid productIds format" }, { status: 400 });
        }

        // Update each product's order sequentially based on its index in the array
        await prisma.$transaction(
            productIds.map((id, index) =>
                prisma.product.update({
                    where: { id, userId: session.user.id },
                    data: { order: index },
                })
            )
        );

        return NextResponse.json({ success: true, message: "Products reordered successfully" });
    } catch (error) {
        console.error("Error reordering products:", error);
        return NextResponse.json({ error: "Failed to reorder products" }, { status: 500 });
    }
}
