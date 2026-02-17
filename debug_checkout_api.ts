
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({ include: { products: true } });
    console.log("Total Users found:", users.length);
    users.forEach(u => console.log(`- ${u.handle || u.id}: ${u.products.length} products`));

    const validUser = users.find(u => u.products.length > 0);
    if (!validUser) throw new Error("No user with products found");

    const product = validUser.products[0];
    console.log("Testing with product:", product.id, product.title);

    // Payload
    const payload = {
        productId: product.id,
        customerEmail: "test@debug.com",
        // bumpProductId: ... (optional)
    };

    try {
        const res = await fetch("http://localhost:3000/api/checkout/product-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Response:", text);

        if (!res.ok) {
            console.error("Failed!");
        } else {
            console.log("Success! URL:", JSON.parse(text).url);
        }

    } catch (e) {
        console.error("Fetch failed:", e);
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
