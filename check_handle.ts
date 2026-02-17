
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const user = await prisma.user.findUnique({ where: { handle: "affiliate_bob" } });
    console.log("Found affiliate user check:", user ? "success" : "failed");
}
main();
