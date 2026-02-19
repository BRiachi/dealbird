import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import StorefrontClient from "./components/StorefrontClient";

interface Props {
    params: { handle: string };
}

// Generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const user = await prisma.user.findFirst({
        where: { handle: { equals: params.handle, mode: "insensitive" } },
    });

    if (!user) return { title: "User Not Found" };

    return {
        title: `${user.name || user.handle} | DealBird`,
        description: user.bio || `Check out ${user.handle}'s store on DealBird.`,
        openGraph: {
            images: user.avatar || user.image || [],
        },
    };
}

export default async function PublicStorePage({ params }: Props) {
    // Fetch user and products
    const user = await prisma.user.findFirst({
        where: { handle: { equals: params.handle, mode: "insensitive" } },
        include: {
            products: {
                where: { archived: false },
                orderBy: { order: "asc" },
            },
        },
    });

    if (!user) notFound();

    return <StorefrontClient user={user as any} />;
}
