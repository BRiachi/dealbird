
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst();
    if (!user) throw new Error("No user found");

    // 1. Digital Product
    let digitalProduct = await prisma.product.findFirst({ where: { userId: user.id, type: "DIGITAL" } });
    if (!digitalProduct) {
        digitalProduct = await prisma.product.create({
            data: {
                userId: user.id,
                type: "DIGITAL",
                title: "Test E-Book",
                slug: "test-ebook-" + Date.now(),
                price: 1000,
                order: 99,
                settings: {
                    fileUrl: "https://example.com/download.pdf",
                    fileName: "My_Ebook.pdf"
                }
            }
        });
    } else {
        await prisma.product.update({
            where: { id: digitalProduct.id },
            data: {
                settings: {
                    ...digitalProduct.settings as any,
                    fileUrl: "https://example.com/download.pdf",
                    fileName: "My_Ebook.pdf"
                }
            }
        });
    }

    // 2. Coaching Product
    let coachingProduct = await prisma.product.findFirst({ where: { userId: user.id, type: "COACHING" } });
    if (!coachingProduct) {
        coachingProduct = await prisma.product.create({
            data: {
                userId: user.id,
                type: "COACHING",
                title: "Test Call",
                slug: "test-call-" + Date.now(),
                price: 5000,
                order: 100,
                settings: {
                    url: "https://calendly.com/test/30min"
                }
            }
        });
    } else {
        await prisma.product.update({
            where: { id: coachingProduct.id },
            data: {
                settings: {
                    ...coachingProduct.settings as any,
                    url: "https://calendly.com/test/30min"
                }
            }
        });
    }

    // 3. Create Orders
    const sessionDigital = "sess_digital_123";
    const sessionCoaching = "sess_coaching_123";

    await prisma.order.create({
        data: {
            userId: user.id,
            productId: digitalProduct!.id,
            amount: 1000,
            status: "PAID",
            stripeSessionId: sessionDigital,
            buyerEmail: "test@test.com",
            buyerName: "Test User"
        }
    });

    await prisma.order.create({
        data: {
            userId: user.id,
            productId: coachingProduct!.id,
            amount: 5000,
            status: "PAID",
            stripeSessionId: sessionCoaching,
            buyerEmail: "test@test.com",
            buyerName: "Test User"
        }
    });

    console.log("Digital Success:", `http://localhost:3000/orders/success?session_id=${sessionDigital}`);
    console.log("Coaching Success:", `http://localhost:3000/orders/success?session_id=${sessionCoaching}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
