import { auth, currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { ChevronRight, LogOut } from "lucide-react";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const initials = ((user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "")).toUpperCase() || "?";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FAFAFA", paddingBottom: "96px" }}>

      {/* Header */}
      <div style={{ backgroundColor: "#fff", padding: "32px 24px 24px", borderBottom: "1px solid #EEEEEE" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#C4664A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: "22px", fontWeight: 700, color: "#fff" }}>{initials}</span>
          </div>
          <div>
            <p style={{ fontSize: "20px", fontWeight: 800, color: "#1a1a1a", margin: 0 }}>{fullName}</p>
            <p style={{ fontSize: "14px", color: "#717171", margin: "2px 0 0" }}>{email}</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div style={{ padding: "16px" }}>
        <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #EEEEEE", overflow: "hidden" }}>

          <Link
            href="/profile/interests"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px",
              borderBottom: "1px solid #F5F5F5",
              textDecoration: "none",
              color: "#1a1a1a",
            }}
          >
            <span style={{ fontSize: "15px", fontWeight: 500 }}>Travel interests</span>
            <ChevronRight size={18} style={{ color: "#AAAAAA" }} />
          </Link>

          <Link
            href="/family"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px",
              textDecoration: "none",
              color: "#1a1a1a",
            }}
          >
            <span style={{ fontSize: "15px", fontWeight: 500 }}>Family profile</span>
            <ChevronRight size={18} style={{ color: "#AAAAAA" }} />
          </Link>

        </div>

        {/* Sign out */}
        <div style={{ marginTop: "16px", backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #EEEEEE", overflow: "hidden" }}>
          <SignOutButton redirectUrl="/">
            <button
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px",
                width: "100%",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#e53e3e",
                fontSize: "15px",
                fontWeight: 600,
                textAlign: "left",
              }}
            >
              <LogOut size={18} />
              Sign out
            </button>
          </SignOutButton>
        </div>

      </div>
    </div>
  );
}
