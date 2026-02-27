import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail || session?.user?.email !== adminEmail) {
    redirect("/dashboard");
  }

  const codes = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      claims: {
        include: {
          user: { select: { email: true, name: true } },
        },
        orderBy: { claimedAt: "desc" },
      },
    },
  });

  return <AdminClient codes={JSON.parse(JSON.stringify(codes))} />;
}
