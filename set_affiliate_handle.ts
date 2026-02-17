
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    await prisma.user.update({
        where: { email: "b.riachi@gmail.com" },
        data: { handle: "affiliate_bob" }
    });
    console.log("Updated b.riachi@gmail.com handle to affiliate_bob");
}
main();
