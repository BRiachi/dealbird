
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst();
    if (!user) throw new Error("No user found");

    const products = await prisma.product.findMany({ where: { userId: user.id } });
    if (products.length === 0) throw new Error("No products found");

    const product = products[0];

    // Create Order
    const order = await prisma.order.create({
        data: {
            userId: user.id,
            productId: product.id,
            buyerEmail: "test@example.com",
            buyerName: "Test Buyer",
            amount: 1000,
            status: "PAID",
            stripeSessionId: "test-session-123",
        },
    });

    console.log("Created dummy order:", order.id);
    console.log("Visit: http://localhost:3000/orders/success?session_id=test-session-123");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
