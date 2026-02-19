import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/courses/lessons - Create new lesson
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { moduleId, title } = body;

    const module = await prisma.courseModule.findUnique({
        where: { id: moduleId },
        include: { course: { include: { product: true } } },
    });

    if (!module || module.course.product.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const lastLesson = await prisma.courseLesson.findFirst({
        where: { moduleId },
        orderBy: { order: "desc" },
    });
    const newOrder = (lastLesson?.order ?? -1) + 1;

    const lesson = await prisma.courseLesson.create({
        data: {
            moduleId,
            title,
            order: newOrder,
        },
    });

    return NextResponse.json(lesson);
}

// PUT /api/courses/lessons - Update lesson
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, title, videoType, videoUrl, body: contentBody, resources, isFreePreview, order } = body;

    const lesson = await prisma.courseLesson.findUnique({
        where: { id },
        include: { module: { include: { course: { include: { product: true } } } } },
    });

    if (!lesson || lesson.module.course.product.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.courseLesson.update({
        where: { id },
        data: {
            title,
            videoType,
            videoUrl,
            body: contentBody, // 'body' is reserved keyword in some contexts, but fine here
            resources: resources !== undefined ? resources : undefined,
            isFreePreview: isFreePreview !== undefined ? isFreePreview : undefined,
            order: order !== undefined ? order : undefined,
        },
    });

    return NextResponse.json(updated);
}

// DELETE /api/courses/lessons
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const lesson = await prisma.courseLesson.findUnique({
        where: { id },
        include: { module: { include: { course: { include: { product: true } } } } },
    });

    if (!lesson || lesson.module.course.product.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.courseLesson.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
