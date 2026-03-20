import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

function detectPlatform(url: string): string {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("vimeo.com")) return "vimeo";
  return "other";
}

function isVideoUrl(url: string): boolean {
  return (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("tiktok.com") ||
    url.includes("instagram.com/reel") ||
    url.includes("vimeo.com")
  );
}

function extractYouTubeId(url: string): string {
  const match =
    url.match(/[?&]v=([^&]+)/) ??
    url.match(/youtu\.be\/([^?]+)/) ??
    url.match(/embed\/([^?]+)/);
  return match?.[1] ?? "";
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { url, title, description, destination, contentType, ageGroup } = body;

  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

  let extractedTitle: string = title ?? "";
  let extractedThumb: string | null = null;

  try {
    if (!extractedTitle) {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(5000),
      });
      const html = await res.text();
      const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1];
      const ogImage = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1];
      extractedTitle = ogTitle ?? url;
      extractedThumb = ogImage ?? null;
    }
  } catch {
    // extraction is optional
  }

  if (isVideoUrl(url)) {
    const platform = detectPlatform(url);
    const embedId = platform === "youtube" ? extractYouTubeId(url) : "";
    const video = await db.travelVideo.create({
      data: {
        title: extractedTitle || url,
        videoUrl: url,
        platform,
        embedId,
        thumbnailUrl: extractedThumb,
        destination: destination ?? null,
        contentType: contentType ?? "creator",
        ageGroup: ageGroup ?? "all",
        status: "pending",
        submittedBy: userId,
        submittedAt: new Date(),
      },
    });
    return NextResponse.json({ success: true, type: "video", id: video.id });
  } else {
    // Article — requires slug, excerpt, content (provide safe defaults for community submissions)
    const slugBase = (extractedTitle || url)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 80);
    const slug = `${slugBase}-${Date.now()}`;

    const article = await db.article.create({
      data: {
        title: extractedTitle || url,
        slug,
        excerpt: description ?? extractedTitle ?? url,
        content: "",
        thumbnailUrl: extractedThumb,
        sourceUrl: url,
        destination: destination ?? null,
        contentType: contentType ?? "community",
        ageGroup: ageGroup ?? "all",
        status: "pending",
        submittedBy: userId,
        submittedAt: new Date(),
        authorType: "community",
      },
    });
    return NextResponse.json({ success: true, type: "article", id: article.id });
  }
}
