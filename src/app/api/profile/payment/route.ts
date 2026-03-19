import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { familyProfile: { include: { paymentCards: true } } },
  });
  return NextResponse.json(user?.familyProfile?.paymentCards ?? []);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { cardName, cardType, network, lastFour } = body;
  if (!cardName || !cardType || !network) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { familyProfile: true },
  });
  if (!user?.familyProfile) {
    return NextResponse.json({ error: "No family profile" }, { status: 404 });
  }
  const card = await db.paymentCard.create({
    data: {
      cardName,
      cardType,
      network,
      lastFour: lastFour || null,
      familyProfileId: user.familyProfile.id,
    },
  });
  return NextResponse.json(card);
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.paymentCard.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
