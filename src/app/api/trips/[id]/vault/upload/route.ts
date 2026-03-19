import { NextResponse } from "next/server";

// R2 file storage not yet configured
// Enable once CLOUDFLARE_R2_PUBLIC_DOMAIN is set in environment
export async function POST() {
  return NextResponse.json(
    {
      error: "File upload not yet available",
      message: "Coming soon",
    },
    { status: 503 }
  );
}
