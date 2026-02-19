import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/courses/modules - Create new module
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { courseId, title } = body;

    // Verify course ownership
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { product: true },
    });

    if (!course || course.product.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get last order
    const lastModule = await prisma.courseModule.findFirst({
        where: { courseId },
        orderBy: { order: "desc" },
    });
    const newOrder = (lastModule?.order ?? -1) + 1;

    const module = await prisma.courseModule.create({
        data: {
            courseId,
            title,
            order: newOrder,
        },
        include: { lessons: true },
    });

    return NextResponse.json(module);
}

// PUT /api/courses/modules - Update module
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, title, order } = body;

    const module = await prisma.courseModule.findUnique({
        where: { id },
        include: { course: { include: { product: true } } },
    });

    if (!module || module.course.product.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.courseModule.update({
        where: { id },
        data: {
            title,
            order,
        },
    });

    return NextResponse.json(updated);
}

// DELETE /api/courses/modules
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const module = await prisma.courseModule.findUnique({
        where: { id },
        include: { course: { include: { product: true } } },
    });

    if (!module || module.course.product.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.courseModule.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
