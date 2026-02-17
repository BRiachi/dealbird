
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.findMany();
    console.log("Users:", users.map(u => ({ email: u.email, handle: u.handle, id: u.id })));
}
main();
