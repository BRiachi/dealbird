import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: { productId: string } }
) {
    const session = await getServerSession(authOptions);
    const { productId } = params;

    // Access control: owner, paying customer, or public free-preview check done per-lesson
    if (session?.user?.id) {
        const product = await prisma.product.findUnique({ where: { id: productId }, select: { userId: true } });
        const isOwner = product?.userId === session.user.id;

        if (!isOwner) {
            const userRecord = await prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true } });
            const hasBought = await prisma.order.findFirst({
                where: { productId, buyerEmail: userRecord?.email || "", status: "PAID" },
            });
            if (!hasBought) {
                return NextResponse.json({ error: "Purchase required" }, { status: 403 });
            }
        }
    } else {
        // Unauthenticated: only allow if the course has free preview lessons (checked client-side per lesson)
        // Return 403 to redirect to purchase
        return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    // Fetch course with progress
    const course = await prisma.course.findUnique({
        where: { productId },
        include: {
            product: {
                include: { user: true }
            },
            modules: {
                orderBy: { order: "asc" },
                include: {
                    lessons: {
                        orderBy: { order: "asc" },
                        include: {
                            // Return progress for current user if logged in
                            progress: session?.user?.id ? {
                                where: { userId: session.user.id }
                            } : false
                        }
                    },
                },
            },
        },
    });

    if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Transform data to flatten progress
    const transformedCourse = {
        ...course,
        modules: course.modules.map(mod => ({
            ...mod,
            lessons: mod.lessons.map(lesson => ({
                ...lesson,
                completed: lesson.progress.length > 0 ? lesson.progress[0].completed : false,
                progress: undefined // Remove raw array
            }))
        }))
    };

    return NextResponse.json(transformedCourse);
}
