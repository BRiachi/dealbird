import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId, completed } = await req.json();

    const progress = await prisma.userLessonProgress.upsert({
        where: {
            userId_lessonId: {
                userId: session.user.id,
                lessonId,
            },
        },
        update: { completed },
        create: {
            userId: session.user.id,
            lessonId,
            completed,
        },
    });

    return NextResponse.json(progress);
}
