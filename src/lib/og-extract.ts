export interface OgData {
  title?: string;
  description?: string;
  image?: string;
}

// Microlink handles JS-rendered sites (Airbnb, Booking.com, etc.)
async function extractViaMicrolink(url: string): Promise<OgData> {
  const endpoint = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=false`;
  const res = await fetch(endpoint, {
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) return {};

  const json = await res.json();
  if (json.status !== "success") return {};

  const { data } = json;
  return {
    title: data.title ?? undefined,
    description: data.description ?? undefined,
    image: data.image?.url ?? undefined,
  };
}

// Fallback: raw OG tag scrape for simple sites
async function extractViaFetch(url: string): Promise<OgData> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) return {};

  const html = await res.text();

  const getOg = (property: string): string | undefined => {
    const a = html.match(
      new RegExp(
        `<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']+)["']`,
        "i"
      )
    );
    if (a) return a[1];
    const b = html.match(
      new RegExp(
        `<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${property}["']`,
        "i"
      )
    );
    return b?.[1];
  };

  const title =
    getOg("title") ??
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();

  return {
    title,
    description: getOg("description"),
    image: getOg("image"),
  };
}

export async function extractOgMetadata(url: string): Promise<OgData> {
  try {
    // Try microlink first — it handles JS-rendered sites
    const microlink = await extractViaMicrolink(url);
    if (microlink.title) return microlink;

    // Fall back to direct fetch for simple static sites
    return await extractViaFetch(url);
  } catch {
    return {};
  }
}
