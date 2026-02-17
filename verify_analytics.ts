
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    let user = await prisma.user.findUnique({ where: { email: "admin@dealbird.dev" } });
    if (!user) {
        console.log("Admin user not found, falling back to first user.");
        user = await prisma.user.findFirst();
    }
    if (!user) throw new Error("No user found");
    console.log("Seeding analytics for user:", user.email);

    const product = await prisma.product.findFirst({ where: { userId: user.id } });
    if (!product) throw new Error("No product found");

    // Create orders in the past
    const dates = [5, 12, 18, 25];

    for (const daysAgo of dates) {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);

        await prisma.order.create({
            data: {
                userId: user.id,
                productId: product.id,
                amount: product.price > 0 ? product.price : 1500,
                status: "PAID",
                stripeSessionId: `mock_sess_${daysAgo}`,
                buyerEmail: `buyer${daysAgo}@test.com`,
                buyerName: `Buyer ${daysAgo}`,
                createdAt: d
            }
        });
        console.log(`Created order for ${daysAgo} days ago`);
    }

    // Update views
    await prisma.product.update({
        where: { id: product.id },
        data: { clicks: { increment: 50 } }
    });

    console.log("Analytics data seeded.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
