import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_USER_IDS = [process.env.ADMIN_CLERK_USER_ID ?? ""];

async function isAdmin(userId: string): Promise<boolean> {
  if (ADMIN_USER_IDS.filter(Boolean).includes(userId)) return true;
  const user = await db.user.findFirst({ where: { clerkId: userId } });
  return user?.email?.endsWith("@flokktravel.com") ?? false;
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdmin(userId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const status = req.nextUrl.searchParams.get("status") ?? "pending";
  const type = req.nextUrl.searchParams.get("type") ?? "all";

  const [articles, videos] = await Promise.all([
    db.article.findMany({
      where: {
        status,
        ...(type !== "all" ? { contentType: type } : {}),
      },
      orderBy: { submittedAt: "desc" },
      take: 50,
    }),
    db.travelVideo.findMany({
      where: {
        status,
        ...(type !== "all" ? { contentType: type } : {}),
      },
      orderBy: { submittedAt: "desc" },
      take: 50,
    }),
  ]);

  return NextResponse.json({ articles, videos });
}
