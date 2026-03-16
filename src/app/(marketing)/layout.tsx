import Link from "next/link";
import { Plane } from "lucide-react";
import { SiteFooter } from "@/components/ui/SiteFooter";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#fff" }}>
      {/* Simple header */}
      <header style={{ borderBottom: "1px solid #EEEEEE", padding: "0 24px", height: "60px", display: "flex", alignItems: "center" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <Plane size={18} style={{ color: "#C4664A" }} />
          <span style={{ fontSize: "18px", fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.02em" }}>Flokk</span>
        </Link>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
      <SiteFooter />
    </div>
  );
}
