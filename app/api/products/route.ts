import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

// GET /api/products - List user products
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
        where: { userId: session.user.id, archived: false },
        orderBy: { order: "asc" },
    });

    return NextResponse.json(products);
}

// POST /api/products - Create new product
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, title, url, price, settings } = body;

    // Get current max order
    const lastProduct = await prisma.product.findFirst({
        where: { userId: session.user.id, archived: false },
        orderBy: { order: "desc" },
    });
    const newOrder = (lastProduct?.order ?? -1) + 1;

    // Construct settings based on type
    let finalSettings = settings || {};
    if (type === "URL" && url) {
        finalSettings = { url, ...finalSettings };
    }

    const product = await prisma.product.create({
        data: {
            userId: session.user.id,
            type: type || "URL",
            title,
            slug: generateSlug(), // Use our existing utils
            price: price || 0,
            settings: finalSettings,
            order: newOrder,
        },
    });

    return NextResponse.json(product);
}

// PUT /api/products - Reorder or update
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Batch Reorder
    if (Array.isArray(body)) {
        const updates = body.map((item: any) =>
            prisma.product.update({
                where: { id: item.id, userId: session.user.id },
                data: { order: item.order },
            })
        );
        await Promise.all(updates);
        return NextResponse.json({ success: true });
    }

    // Single Update
    const { id, title, subtitle, image, buttonText, price, settings, archived } = body;

    const product = await prisma.product.update({
        where: { id, userId: session.user.id },
        data: {
            title,
            subtitle,
            image,
            buttonText,
            price,
            settings: settings !== undefined ? settings : undefined,
            archived: archived !== undefined ? archived : undefined,
        },
    });

    return NextResponse.json(product);
}

// DELETE /api/products
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.product.delete({
        where: { id, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
}
