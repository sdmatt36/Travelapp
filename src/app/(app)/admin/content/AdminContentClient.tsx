"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ContentItem = {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  destination?: string | null;
  contentType?: string | null;
  ageGroup?: string | null;
  status: string;
  submittedAt: string;
  submittedBy?: string | null;
  rejectionReason?: string | null;
  sourceUrl?: string | null;
  videoUrl?: string | null;
  itemType: "article" | "video";
};

const APPROVAL_CHECKLIST = [
  "Relevant to family travel planning",
  "Real experience — not generic or AI-written",
  "Not promotional or affiliate-first",
  "Destination is clearly identified",
  "Appropriate for families with children",
  "Content is reasonably current (post-2020)",
];

export function AdminContentClient() {
  const [items, setItems] = useState<{ articles: ContentItem[]; videos: ContentItem[] }>({
    articles: [],
    videos: [],
  });
  const [status, setStatus] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<ContentItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isActing, setIsActing] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsLoading(true);
    setActiveItem(null);
    fetch(`/api/admin/content?status=${status}`)
      .then((r) => r.json())
      .then((d) => {
        setItems({
          articles: (d.articles ?? []).map((a: ContentItem) => ({ ...a, itemType: "article" })),
          videos: (d.videos ?? []).map((v: ContentItem) => ({ ...v, itemType: "video" })),
        });
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [status]);

  const allItems = [
    ...items.articles,
    ...items.videos,
  ].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  function selectItem(item: ContentItem) {
    setActiveItem(item);
    setRejectionReason("");
    setChecklist({});
  }

  async function handleAction(action: "approve" | "reject") {
    if (!activeItem) return;
    if (action === "reject" && !rejectionReason.trim()) {
      alert("Please add a rejection reason before rejecting.");
      return;
    }
    setIsActing(true);
    try {
      const res = await fetch(`/api/admin/content/${activeItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          type: activeItem.itemType,
          rejectionReason: action === "reject" ? rejectionReason : null,
        }),
      });
      if (!res.ok) throw new Error("action failed");
      setItems((prev) => ({
        articles: prev.articles.filter((a) => a.id !== activeItem.id),
        videos: prev.videos.filter((v) => v.id !== activeItem.id),
      }));
      setActiveItem(null);
      setRejectionReason("");
      setChecklist({});
    } catch {
      alert("Something went wrong. Try again.");
    } finally {
      setIsActing(false);
    }
  }

  const pendingCount = allItems.length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#1B3A5C", padding: "20px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
              Flokk Admin
            </p>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", margin: 0 }}>Content Queue</h1>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", margin: "4px 0 0" }}>
              Review and approve submitted articles and videos
            </p>
          </div>
          <Link href="/home" style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
            ← Exit admin
          </Link>
        </div>
      </div>

      {/* Status tabs */}
      <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #E8E8E8" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "flex", gap: "0" }}>
          {(["pending", "approved", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              style={{
                padding: "14px 20px",
                fontSize: "13px",
                fontWeight: status === s ? 700 : 500,
                color: status === s ? "#1B3A5C" : "#888",
                background: "none",
                border: "none",
                borderBottom: status === s ? "2px solid #1B3A5C" : "2px solid transparent",
                cursor: "pointer",
                textTransform: "capitalize",
                fontFamily: "inherit",
                marginBottom: "-1px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {s}
              {s === "pending" && pendingCount > 0 && (
                <span style={{ backgroundColor: "#C4664A", color: "#fff", fontSize: "11px", fontWeight: 700, borderRadius: "999px", padding: "1px 7px" }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "340px 1fr", gap: "20px", alignItems: "start" }}>

        {/* Left — item list */}
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #E8E8E8", overflow: "hidden" }}>
          {isLoading ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ color: "#717171", fontSize: "14px" }}>Loading…</p>
            </div>
          ) : allItems.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ fontSize: "32px", marginBottom: "12px" }}>✓</p>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a", marginBottom: "4px" }}>Queue empty</p>
              <p style={{ fontSize: "13px", color: "#717171" }}>No {status} content</p>
            </div>
          ) : (
            <div>
              {allItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => selectItem(item)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "14px 16px",
                    background: activeItem?.id === item.id ? "rgba(27,58,92,0.05)" : "none",
                    borderTop: "none",
                    borderRight: "none",
                    borderBottom: "1px solid #F0F0F0",
                    borderLeft: activeItem?.id === item.id ? "3px solid #1B3A5C" : "3px solid transparent",
                    cursor: "pointer",
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    fontFamily: "inherit",
                    transition: "background 0.1s",
                  }}
                >
                  <div style={{ width: "52px", height: "52px", borderRadius: "8px", backgroundColor: "#F0F0F0", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "22px" }}>{item.itemType === "video" ? "🎬" : "📄"}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a1a", margin: 0, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.title}
                    </p>
                    <div style={{ display: "flex", gap: "6px", marginTop: "5px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "10px", fontWeight: 600, backgroundColor: item.itemType === "video" ? "rgba(196,102,74,0.1)" : "rgba(27,58,92,0.08)", color: item.itemType === "video" ? "#C4664A" : "#1B3A5C", borderRadius: "999px", padding: "2px 7px" }}>
                        {item.itemType}
                      </span>
                      {item.destination && (
                        <span style={{ fontSize: "10px", color: "#717171" }}>📍 {item.destination}</span>
                      )}
                    </div>
                    <p style={{ fontSize: "11px", color: "#AAAAAA", margin: "4px 0 0" }}>
                      {new Date(item.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — review panel */}
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #E8E8E8", overflow: "hidden", position: "sticky", top: "24px" }}>
          {!activeItem ? (
            <div style={{ padding: "80px 24px", textAlign: "center" }}>
              <p style={{ fontSize: "32px", marginBottom: "12px" }}>👈</p>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a", marginBottom: "4px" }}>Select an item</p>
              <p style={{ fontSize: "13px", color: "#717171" }}>Choose an item from the list to review it</p>
            </div>
          ) : (
            <div>
              {activeItem.thumbnailUrl && (
                <div style={{ height: "200px", overflow: "hidden" }}>
                  <img src={activeItem.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}

              <div style={{ padding: "24px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#1a1a1a", margin: "0 0 12px", lineHeight: 1.3 }}>
                  {activeItem.title}
                </h2>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, backgroundColor: activeItem.itemType === "video" ? "rgba(196,102,74,0.1)" : "rgba(27,58,92,0.08)", color: activeItem.itemType === "video" ? "#C4664A" : "#1B3A5C", borderRadius: "999px", padding: "3px 10px" }}>
                    {activeItem.itemType}
                  </span>
                  {activeItem.contentType && (
                    <span style={{ fontSize: "11px", fontWeight: 600, backgroundColor: "#F5F5F5", color: "#717171", borderRadius: "999px", padding: "3px 10px" }}>
                      {activeItem.contentType}
                    </span>
                  )}
                  {activeItem.destination && (
                    <span style={{ fontSize: "11px", color: "#717171", backgroundColor: "#F5F5F5", borderRadius: "999px", padding: "3px 10px" }}>
                      📍 {activeItem.destination}
                    </span>
                  )}
                  {activeItem.ageGroup && (
                    <span style={{ fontSize: "11px", color: "#717171", backgroundColor: "#F5F5F5", borderRadius: "999px", padding: "3px 10px" }}>
                      👨‍👩‍👧 {activeItem.ageGroup}
                    </span>
                  )}
                </div>

                {(activeItem.sourceUrl ?? activeItem.videoUrl) && (
                  <a
                    href={activeItem.sourceUrl ?? activeItem.videoUrl ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-block", fontSize: "13px", color: "#C4664A", fontWeight: 600, marginBottom: "20px", textDecoration: "none" }}
                  >
                    Open original →
                  </a>
                )}

                {activeItem.status === "pending" && (
                  <div style={{ backgroundColor: "#F9F9F9", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: "#1B3A5C", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 12px" }}>
                      Approval checklist
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {APPROVAL_CHECKLIST.map((criterion) => (
                        <label key={criterion} style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={!!checklist[criterion]}
                            onChange={(e) =>
                              setChecklist((prev) => ({ ...prev, [criterion]: e.target.checked }))
                            }
                            style={{ marginTop: "2px", accentColor: "#1B3A5C", flexShrink: 0 }}
                          />
                          <span style={{ fontSize: "13px", color: "#1a1a1a", lineHeight: 1.4 }}>{criterion}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {activeItem.status !== "pending" && (
                  <div style={{ backgroundColor: activeItem.status === "approved" ? "rgba(27,58,92,0.05)" : "rgba(196,102,74,0.06)", borderRadius: "10px", padding: "14px", marginBottom: "20px", border: `1px solid ${activeItem.status === "approved" ? "rgba(27,58,92,0.12)" : "rgba(196,102,74,0.15)"}` }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: activeItem.status === "approved" ? "#1B3A5C" : "#C4664A", margin: "0 0 4px" }}>
                      {activeItem.status === "approved" ? "✓ Approved" : "✗ Rejected"}
                    </p>
                    {activeItem.rejectionReason && (
                      <p style={{ fontSize: "12px", color: "#717171", margin: 0, lineHeight: 1.5 }}>
                        Reason: {activeItem.rejectionReason}
                      </p>
                    )}
                  </div>
                )}

                {activeItem.status === "pending" && (
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#717171", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>
                      Rejection reason <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(required if rejecting)</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Promotional content, not family-focused, outdated destination info…"
                      rows={3}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E5E5", borderRadius: "10px", fontSize: "13px", color: "#1a1a1a", resize: "vertical", outline: "none", lineHeight: 1.5, boxSizing: "border-box", fontFamily: "inherit" }}
                    />
                  </div>
                )}

                {activeItem.status === "pending" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <button
                      onClick={() => handleAction("reject")}
                      disabled={isActing}
                      style={{ padding: "12px", borderRadius: "10px", border: "1.5px solid #E5E5E5", backgroundColor: "#fff", color: "#C4664A", fontSize: "14px", fontWeight: 700, cursor: isActing ? "not-allowed" : "pointer", opacity: isActing ? 0.5 : 1, fontFamily: "inherit", transition: "opacity 0.15s" }}
                    >
                      ✗ Reject
                    </button>
                    <button
                      onClick={() => handleAction("approve")}
                      disabled={isActing}
                      style={{ padding: "12px", borderRadius: "10px", border: "none", backgroundColor: "#1B3A5C", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: isActing ? "not-allowed" : "pointer", opacity: isActing ? 0.5 : 1, fontFamily: "inherit", transition: "opacity 0.15s" }}
                    >
                      ✓ Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
