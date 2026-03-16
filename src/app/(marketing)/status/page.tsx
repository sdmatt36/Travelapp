export default function StatusPage() {
  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: "36px", fontWeight: 900, color: "#1a1a1a", marginBottom: "16px" }}>System Status</h1>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "999px", padding: "8px 16px", marginBottom: "24px" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e", display: "inline-block" }} />
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#16a34a" }}>All systems operational</span>
      </div>
      <p style={{ fontSize: "16px", color: "#717171", lineHeight: 1.7 }}>
        Real-time status monitoring is coming soon.
      </p>
    </div>
  );
}
