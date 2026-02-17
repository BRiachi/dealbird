
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: { _count: { select: { orders: true } } }
    });

    console.log("Users:", users.length);
    for (const u of users) {
        console.log(`User: ${u.email} (${u.id}) - Orders: ${u._count.orders}`);
        const paidOrders = await prisma.order.count({ where: { userId: u.id, status: "PAID" } });
        console.log(`  Paid Orders: ${paidOrders}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
