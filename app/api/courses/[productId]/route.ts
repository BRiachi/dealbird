import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/courses/[productId] - Get full course curriculum
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
        console.log(`[API] Fetching course for product: ${productId}`);

        // Verify ownership via Product
        const product = await prisma.product.findUnique({
            where: { id: productId, userId: session.user.id },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Fetch or create course
        let course = await prisma.course.findUnique({
            where: { productId },
            include: {
                modules: {
                    orderBy: { order: "asc" },
                    include: {
                        lessons: {
                            orderBy: { order: "asc" },
                        },
                    },
                },
            },
        });

        console.log(`[API] Course found? ${!!course}`);

        if (!course) {
            console.log(`[API] Creating new course for ${productId}`);
            course = await prisma.course.create({
                data: { productId },
                include: {
                    modules: {
                        include: { lessons: true },
                    },
                },
            });
            console.log(`[API] Created course: ${course.id}`);
        }

        return NextResponse.json(course);
    } catch (error: any) {
        console.error("[API] CRITICAL ERROR:", error);
        return NextResponse.json({ error: `Critical API Error: ${error.message}` }, { status: 500 });
    }
}
