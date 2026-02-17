
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const handle = "testuser";
    console.log("Querying for handle:", handle);
    const user = await prisma.user.findFirst({
        where: { handle: { equals: handle, mode: "insensitive" } },
        include: {
            products: {
                where: { archived: false },
                orderBy: { order: "asc" },
            },
        },
    });
    console.log("Result:", user ? user.email : "Not Found");
}
main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
