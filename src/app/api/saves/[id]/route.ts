import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z, ZodError } from "zod";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { familyProfile: true },
    });
    if (!user?.familyProfile) return NextResponse.json({ error: "No profile" }, { status: 400 });

    const item = await db.savedItem.findUnique({
      where: { id },
      include: { trip: { select: { id: true, title: true } } },
    });

    if (!item || item.familyProfileId !== user.familyProfile.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const PatchSchema = z.object({ notes: z.string() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { notes } = PatchSchema.parse(body);

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { familyProfile: true },
    });
    if (!user?.familyProfile) return NextResponse.json({ error: "No profile" }, { status: 400 });

    const item = await db.savedItem.findUnique({ where: { id } });
    if (!item || item.familyProfileId !== user.familyProfile.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await db.savedItem.update({ where: { id }, data: { notes } });
    return NextResponse.json({ success: true, notes: updated.notes });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: error.issues }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
