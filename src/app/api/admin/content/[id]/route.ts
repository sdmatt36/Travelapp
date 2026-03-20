import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_USER_IDS = [process.env.ADMIN_CLERK_USER_ID ?? ""];

async function isAdmin(userId: string): Promise<boolean> {
  if (ADMIN_USER_IDS.filter(Boolean).includes(userId)) return true;
  const user = await db.user.findFirst({ where: { clerkId: userId } });
  return user?.email?.endsWith("@flokktravel.com") ?? false;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdmin(userId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { action, type, rejectionReason, tags, destination, ageGroup } = body;

  const updateData = {
    ...(action === "approve" ? { status: "approved" } : {}),
    ...(action === "reject" ? { status: "rejected" } : {}),
    reviewedAt: new Date(),
    reviewedBy: userId,
    rejectionReason: rejectionReason ?? null,
    ...(tags ? { tags } : {}),
    ...(destination ? { destination } : {}),
    ...(ageGroup ? { ageGroup } : {}),
  };

  if (type === "video") {
    const updated = await db.travelVideo.update({ where: { id }, data: updateData });
    return NextResponse.json(updated);
  } else {
    const updated = await db.article.update({ where: { id }, data: updateData });
    return NextResponse.json(updated);
  }
}
