"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, X } from "lucide-react";

type Trip = { id: string; title: string; startDate: string | null; endDate: string | null };

type ExtractedCard = {
  title: string;
  location: string;
  tags: string[];
  img: string;
  source: string;
  description: string;
  lat?: number;
  lng?: number;
};

const SAVE_LATER = "__later__";

function generateDayPills(startDate: string | null, endDate: string | null): { dayIndex: number; label: string }[] {
  if (!startDate) return [];
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;
  const numDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Array.from({ length: numDays }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { dayIndex: i + 1, label: `Day ${i + 1} · ${dateStr}` };
  });
}

const CATEGORY_OPTIONS = ["Culture", "Food", "Kids", "Lodging", "Outdoor", "Shopping", "Transportation"];

function mockExtract(url: string): ExtractedCard {
  const lower = url.toLowerCase();
  if (/instagram/.test(lower)) {
    return {
      title: "Dotonbori Street Food Walk",
      location: "Osaka, Japan",
      tags: ["Food", "Street Food"],
      img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
      source: "Instagram",
      description: "Night market walk along the famous Dotonbori canal — takoyaki, ramen, and more.",
      lat: 34.6687,
      lng: 135.5011,
    };
  }
  if (/tiktok/.test(lower)) {
    return {
      title: "Hidden Waterfall Trail",
      location: "Bali, Indonesia",
      tags: ["Outdoor", "Activity"],
      img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
      source: "TikTok",
      description: "Off-the-beaten-path waterfall hike most tourists miss. 45 min from Ubud.",
      lat: -8.5069,
      lng: 115.2625,
    };
  }
  if (/maps\.google|maps\.app|goo\.gl/.test(lower)) {
    return {
      title: "Fushimi Inari Taisha",
      location: "Kyoto, Japan",
      tags: ["Culture", "History"],
      img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80",
      source: "Google Maps",
      description: "Iconic shrine with thousands of vermilion torii gates — best visited at dawn.",
      lat: 34.9671,
      lng: 135.7727,
    };
  }
  if (/airbnb/.test(lower)) {
    return {
      title: "Traditional Machiya Townhouse",
      location: "Kyoto, Japan",
      tags: ["Lodging"],
      img: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80",
      source: "Airbnb",
      description: "Restored 100-year-old machiya in Gion district. Private courtyard, sleeps 4.",
      lat: 35.0116,
      lng: 135.7681,
    };
  }
  return {
    title: "Local Hidden Gem",
    location: "Tokyo, Japan",
    tags: ["Activity"],
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
    source: "Web",
    description: "Saved from the web — details auto-extracted and ready to review.",
  };
}

type Step = "input" | "loading" | "preview";

export function DropLinkModal({
  trips,
  onClose,
  onSaved,
  initialTripId,
}: {
  trips: Trip[];
  onClose: () => void;
  onSaved: (tripTitle: string | null) => void;
  initialTripId?: string;
}) {
  const [step, setStep] = useState<Step>("input");
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [extracted, setExtracted] = useState<ExtractedCard | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  // Pre-select initialTripId if provided, otherwise first trip, otherwise save-later
  const [selectedId, setSelectedId] = useState<string>(initialTripId ?? trips[0]?.id ?? SAVE_LATER);
  const [pulseId, setPulseId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [checkinDate, setCheckinDate] = useState<string>("");
  const [checkoutDate, setCheckoutDate] = useState<string>("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function animateClose(cb?: () => void) {
    setVisible(false);
    setTimeout(() => {
      onClose();
      cb?.();
    }, 220);
  }

  // ── Step 1: URL submission ──────────────────────────────────────────────────
  function handleSubmitUrl() {
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError("Please paste a link first.");
      return;
    }
    const normalised = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    setUrl(normalised);
    setUrlError("");
    setStep("loading");
    setTimeout(() => {
      const card = mockExtract(normalised);
      setExtracted(card);
      setEditedTitle(card.title);
      setSelectedCategory(card.tags[0] ?? "");
      // Pre-populate check-in/check-out from URL params
      try {
        const parsed = new URL(normalised);
        const ci = parsed.searchParams.get("check_in") || parsed.searchParams.get("checkin") || parsed.searchParams.get("arrival") || "";
        const co = parsed.searchParams.get("check_out") || parsed.searchParams.get("checkout") || parsed.searchParams.get("departure") || "";
        if (ci) setCheckinDate(ci);
        if (co) setCheckoutDate(co);
      } catch { /* ignore invalid URLs */ }
      setStep("preview");
    }, 1500);
  }

  // ── Step 3: Save ────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!extracted) return;
    setSaving(true);
    const isLater = selectedId === SAVE_LATER;
    const tripTitle = isLater ? null : (trips.find((t) => t.id === selectedId)?.title ?? null);

    try {
      const res = await fetch("/api/saves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          tripId: isLater ? undefined : selectedId,
          title: editedTitle,
          description: extracted.description,
          thumbnailUrl: extracted.img,
          tags: selectedCategory ? [selectedCategory] : extracted.tags,
          lat: extracted.lat,
          lng: extracted.lng,
          dayIndex: selectedDayIndex ?? undefined,
          extractedCheckin: isLodging && checkinDate ? checkinDate : undefined,
          extractedCheckout: isLodging && checkoutDate ? checkoutDate : undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Save failed:", res.status, body);
        setSaving(false);
        return;
      }

      // Fire toast BEFORE closing so parent state is set while modal still exists
      onSaved(tripTitle);
      // Close modal with animation
      animateClose(() => {
        // Refresh server data after modal fully unmounts
        window.dispatchEvent(new Event("flokk:refresh"));
      });
    } catch (err) {
      console.error("Save error:", err);
      setSaving(false);
    }
  }

  const urlLower = url.toLowerCase();
  const isLodging =
    /airbnb\.com|booking\.com|hotels\.com|vrbo\.com/.test(urlLower) ||
    extracted?.source === "Airbnb" ||
    extracted?.tags?.includes("Lodging") ||
    selectedCategory === "Lodging" ||
    selectedCategory?.toLowerCase().includes("lodg") ||
    selectedCategory?.toLowerCase().includes("hotel");

  const selectedTrip = trips.find((t) => t.id === selectedId);
  const ctaLabel = saving
    ? "Saving..."
    : selectedId === SAVE_LATER
      ? "Save for later →"
      : selectedDayIndex !== null
        ? `Save to Day ${selectedDayIndex} · ${selectedTrip?.title ?? ""} →`
        : `Save to ${selectedTrip?.title ?? ""} →`;

  return (
    <div
      className="flex items-end md:items-center md:justify-center md:p-4"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.45)",
        zIndex: 200,
        display: "flex",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.22s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) animateClose(); }}
    >
      <div
        className="w-full md:max-w-[520px] rounded-t-[20px] md:rounded-[20px]"
        style={{
          backgroundColor: "#fff",
          maxHeight: "calc(100vh - 60px)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 32px rgba(0,0,0,0.12)",
          overflow: "hidden",
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "transform 0.22s ease, opacity 0.22s ease",
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Header — fixed inside modal */}
        <div style={{ padding: "20px 24px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2 }}>
                Drop a link
              </p>
              {step === "input" && (
                <p style={{ fontSize: "14px", color: "#717171", marginTop: "4px" }}>
                  Paste anything — Instagram, TikTok, Google Maps, Airbnb, anywhere.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => animateClose()}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#999", flexShrink: 0, marginLeft: "16px" }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ padding: "20px 24px 24px", overflowY: "auto" }}>

          {/* ── STEP 1 ── */}
          {step === "input" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setUrlError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmitUrl(); }}
                placeholder="Paste a link..."
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  fontSize: "15px",
                  border: urlError ? "1.5px solid #e53e3e" : "1.5px solid #E0E0E0",
                  borderRadius: "12px",
                  outline: "none",
                  color: "#1a1a1a",
                  backgroundColor: "#FAFAFA",
                  boxSizing: "border-box",
                }}
              />
              {urlError && (
                <p style={{ fontSize: "13px", color: "#e53e3e", marginTop: "-4px" }}>{urlError}</p>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleSubmitUrl(); }}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: "#C4664A",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "15px",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
              >
                Save it →
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); animateClose(); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#999", textAlign: "center", padding: "4px" }}
              >
                Cancel
              </button>
            </div>
          )}


          {/* ── STEP 2 ── */}
          {step === "loading" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "32px 0" }}>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: "3px solid #EEEEEE",
                borderTopColor: "#C4664A",
                animation: "droplinkSpin 0.8s linear infinite",
              }} />
              <p style={{ fontSize: "14px", color: "#717171" }}>Pulling out the details...</p>
              <style>{`@keyframes droplinkSpin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === "preview" && extracted && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Card preview */}
              <div style={{ border: "1px solid #EEEEEE", borderRadius: "14px", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={extracted.img}
                  alt={extracted.title}
                  style={{ width: "100%", height: "160px", objectFit: "cover", display: "block" }}
                />
                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{
                    alignSelf: "flex-start",
                    fontSize: "11px",
                    fontWeight: 700,
                    backgroundColor: "rgba(196,102,74,0.1)",
                    color: "#C4664A",
                    borderRadius: "20px",
                    padding: "3px 10px",
                  }}>
                    {extracted.source}
                  </span>

                  {/* Editable title */}
                  {editingTitle ? (
                    <input
                      ref={titleInputRef}
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onBlur={() => setEditingTitle(false)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                      autoFocus
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#1a1a1a",
                        border: "none",
                        borderBottom: "1.5px solid #C4664A",
                        outline: "none",
                        background: "transparent",
                        width: "100%",
                        padding: "2px 0",
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setEditingTitle(true); setTimeout(() => titleInputRef.current?.select(), 10); }}
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#1a1a1a",
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "text",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      {editedTitle}
                      <span style={{ fontSize: "11px", color: "#C4664A", marginLeft: "6px", fontWeight: 500 }}>edit</span>
                    </button>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={12} style={{ color: "#C4664A", flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", color: "#717171" }}>{extracted.location}</span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {extracted.tags.map((tag) => (
                      <span key={tag} style={{ fontSize: "11px", backgroundColor: "rgba(0,0,0,0.05)", color: "#666", borderRadius: "20px", padding: "3px 10px" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: "12px", color: "#999", textAlign: "center" }}>
                Looks right? You can edit any details above.
              </p>

              {/* Trip assignment */}
              <div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "10px" }}>
                  Which trip is this for?
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {trips.map((trip) => {
                    const active = selectedId === trip.id;
                    const pulsing = pulseId === trip.id;
                    return (
                      <button
                        type="button"
                        key={trip.id}
                        onClick={() => {
                          if (active) {
                            setPulseId(trip.id);
                            setTimeout(() => setPulseId(null), 200);
                          } else {
                            setSelectedId(trip.id);
                            setSelectedDayIndex(null);
                          }
                        }}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: 600,
                          border: "1.5px solid",
                          borderColor: active ? "#C4664A" : "#E0E0E0",
                          backgroundColor: active ? "#C4664A" : "#fff",
                          color: active ? "#fff" : "#555",
                          cursor: "pointer",
                          transition: pulsing ? "box-shadow 0s" : "box-shadow 0.3s ease-out, background-color 0.15s, border-color 0.15s",
                          boxShadow: pulsing ? "0 0 0 4px rgba(196,102,74,0.45)" : "0 0 0 0px rgba(196,102,74,0)",
                        }}
                      >
                        {trip.title}
                      </button>
                    );
                  })}
                  {/* Save for later */}
                  {(() => {
                    const active = selectedId === SAVE_LATER;
                    const pulsing = pulseId === SAVE_LATER;
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          if (active) {
                            setPulseId(SAVE_LATER);
                            setTimeout(() => setPulseId(null), 200);
                          } else {
                            setSelectedId(SAVE_LATER);
                          }
                        }}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: 600,
                          border: "1.5px solid",
                          borderColor: active ? "#C4664A" : "#E0E0E0",
                          backgroundColor: active ? "#C4664A" : "#fff",
                          color: active ? "#fff" : "#555",
                          cursor: "pointer",
                          transition: pulsing ? "box-shadow 0s" : "box-shadow 0.3s ease-out, background-color 0.15s, border-color 0.15s",
                          boxShadow: pulsing ? "0 0 0 4px rgba(196,102,74,0.45)" : "0 0 0 0px rgba(196,102,74,0)",
                        }}
                      >
                        Save for later
                      </button>
                    );
                  })()}
                </div>
              </div>

              {/* Lodging: check-in / check-out date pickers */}
              {isLodging && (
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "10px" }}>
                    Check-in & check-out
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ fontSize: "11px", fontWeight: 600, color: "#717171", display: "block", marginBottom: "4px" }}>Check-in</label>
                      <input
                        type="date"
                        value={checkinDate}
                        onChange={(e) => setCheckinDate(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #E0E0E0", fontSize: "14px", color: "#1a1a1a", backgroundColor: "#FAFAFA", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "11px", fontWeight: 600, color: "#717171", display: "block", marginBottom: "4px" }}>Check-out</label>
                      <input
                        type="date"
                        value={checkoutDate}
                        onChange={(e) => setCheckoutDate(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #E0E0E0", fontSize: "14px", color: "#1a1a1a", backgroundColor: "#FAFAFA", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Day selection — only shown when non-lodging, trip selected, trip has dates */}
              {!isLodging && selectedId !== SAVE_LATER && (() => {
                const trip = trips.find(t => t.id === selectedId);
                const dayPills = trip ? generateDayPills(trip.startDate, trip.endDate) : [];
                if (dayPills.length === 0) return null;
                return (
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "10px" }}>
                      Which day?
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {/* No specific day pill */}
                      <button
                        type="button"
                        onClick={() => setSelectedDayIndex(null)}
                        style={{
                          padding: "7px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 600,
                          border: "1.5px solid",
                          borderColor: selectedDayIndex === null ? "#C4664A" : "#E0E0E0",
                          backgroundColor: selectedDayIndex === null ? "#C4664A" : "#fff",
                          color: selectedDayIndex === null ? "#fff" : "#555",
                          cursor: "pointer",
                        }}
                      >
                        No specific day
                      </button>
                      {dayPills.map(({ dayIndex, label }) => (
                        <button
                          type="button"
                          key={dayIndex}
                          onClick={() => setSelectedDayIndex(dayIndex)}
                          style={{
                            padding: "7px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 600,
                            border: "1.5px solid",
                            borderColor: selectedDayIndex === dayIndex ? "#C4664A" : "#E0E0E0",
                            backgroundColor: selectedDayIndex === dayIndex ? "#C4664A" : "#fff",
                            color: selectedDayIndex === dayIndex ? "#fff" : "#555",
                            cursor: "pointer",
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Category */}
              <div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "10px" }}>
                  Category
                </p>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "10px",
                    border: "1.5px solid #E0E0E0", fontSize: "14px", color: "#1a1a1a",
                    backgroundColor: "#FAFAFA", outline: "none", cursor: "pointer",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23717171' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center",
                  }}
                >
                  <option value="">No category</option>
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Save CTA */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: saving ? "#e0a090" : "#C4664A",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "15px",
                  border: "none",
                  borderRadius: "12px",
                  cursor: saving ? "not-allowed" : "pointer",
                  transition: "background-color 0.15s",
                }}
              >
                {ctaLabel}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
