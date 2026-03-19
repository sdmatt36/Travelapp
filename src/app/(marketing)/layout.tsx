import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { MarketingFooter } from "@/components/ui/MarketingFooter";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Simple public nav */}
      <header style={{ backgroundColor: "#fff", borderBottom: "1px solid #EEEEEE", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.02em", fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)" }}>Flokk</span>
          </Link>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <Link href="/how-it-works" style={{ fontSize: "14px", color: "#555", textDecoration: "none" }}>How it works</Link>
            <Link href="/pricing" style={{ fontSize: "14px", color: "#555", textDecoration: "none" }}>Pricing</Link>
            {userId ? (
              <Link href="/home" style={{ fontSize: "14px", fontWeight: 700, backgroundColor: "#C4664A", color: "#fff", padding: "8px 16px", borderRadius: "20px", textDecoration: "none" }}>Go to app</Link>
            ) : (
              <>
                <Link href="/sign-in" style={{ fontSize: "14px", color: "#555", textDecoration: "none" }}>Sign in</Link>
                <Link href="/sign-up" style={{ fontSize: "14px", fontWeight: 700, backgroundColor: "#C4664A", color: "#fff", padding: "8px 16px", borderRadius: "20px", textDecoration: "none" }}>Get started</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
