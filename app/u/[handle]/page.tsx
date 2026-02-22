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
        select: { name: true, handle: true, bio: true, avatar: true, image: true },
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

// Only select fields needed for the public storefront — never leak internal IDs or billing data
const STOREFRONT_USER_SELECT = {
    name: true,
    handle: true,
    image: true,
    avatar: true,
    bio: true,
    theme: true,
    accentColor: true,
    font: true,
    buttonStyle: true,
    backgroundType: true,
    backgroundValue: true,
    layout: true,
    socialLinks: true,
    pixels: true,
} as const;

const STOREFRONT_PRODUCT_SELECT = {
    id: true,
    title: true,
    description: true,
    price: true,
    image: true,
    type: true,
    currency: true,
    order: true,
    settings: true,
} as const;

export default async function PublicStorePage({ params }: Props) {
    const user = await prisma.user.findFirst({
        where: { handle: { equals: params.handle, mode: "insensitive" } },
        select: {
            ...STOREFRONT_USER_SELECT,
            products: {
                where: { archived: false },
                orderBy: { order: "asc" },
                select: STOREFRONT_PRODUCT_SELECT,
            },
        },
    });

    if (!user) notFound();

    return <StorefrontClient user={user as any} />;
}
