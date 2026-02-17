import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/user/profile - Get profile settings
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            handle: true,
            bio: true,
            avatar: true,
            image: true,
            theme: true,
            accentColor: true,
            font: true,
            pixels: true,
            name: true,
        },
    });

    return NextResponse.json(user);
}

// PATCH /api/user/profile - Update profile settings
export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { handle, bio, avatar, theme, accentColor, font, pixels, name } = body;

    // If updating handle, check uniqueness
    if (handle) {
        const existing = await prisma.user.findFirst({
            where: {
                handle: { equals: handle, mode: "insensitive" },
                NOT: { id: session.user.id },
            },
        });

        if (existing) {
            return NextResponse.json({ error: "Handle already taken" }, { status: 400 });
        }
    }

    const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
            handle: handle !== undefined ? handle : undefined,
            bio: bio !== undefined ? bio : undefined,
            avatar: avatar !== undefined ? avatar : undefined,
            theme: theme !== undefined ? theme : undefined,
            accentColor: accentColor !== undefined ? accentColor : undefined,
            font: font !== undefined ? font : undefined,
            pixels: pixels !== undefined ? pixels : undefined,
            name: name !== undefined ? name : undefined,
        },
    });

    return NextResponse.json(user);
}
