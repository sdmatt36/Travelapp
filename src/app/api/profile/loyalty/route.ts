import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { familyProfile: { include: { loyaltyPrograms: true } } },
  });
  return NextResponse.json(user?.familyProfile?.loyaltyPrograms ?? []);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { programName, memberNumber, programType } = body;
  if (!programName || memberNumber === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { familyProfile: true },
  });
  if (!user?.familyProfile) {
    return NextResponse.json({ error: "No family profile" }, { status: 404 });
  }
  const program = await db.loyaltyProgram.create({
    data: {
      programName,
      memberNumber: memberNumber || "",
      programType: programType ?? "airline",
      familyProfileId: user.familyProfile.id,
    },
  });
  return NextResponse.json(program);
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const body = await req.json();
  const { memberNumber } = body;
  const updated = await db.loyaltyProgram.update({
    where: { id },
    data: { memberNumber: memberNumber ?? "" },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.loyaltyProgram.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
