import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, handle, bio } = await req.json();

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, handle, bio },
  });

  return NextResponse.json({ success: true, user });
}
