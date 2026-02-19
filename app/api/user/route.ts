import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, handle, bio, paypalEmail } = body;

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (handle !== undefined) data.handle = handle;
  if (bio !== undefined) data.bio = bio;
  if (paypalEmail !== undefined) data.paypalEmail = paypalEmail;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
  });

  return NextResponse.json({ success: true, user });
}
