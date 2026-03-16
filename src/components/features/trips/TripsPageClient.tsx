"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Calendar, Plus, Map } from "lucide-react";

type Trip = {
  id: string;
  title: string;
  destinationCity: string | null;
  destinationCountry: string | null;
  startDate: string | null;
  endDate: string | null;
  status: "PLANNING" | "ACTIVE" | "COMPLETED";
  heroImageUrl: string | null;
  savedCount: number;
};

const DEFAULT_HERO = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80";

const STATUS_LABEL: Record<string, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active now",
  COMPLETED: "Completed",
};
const STATUS_COLOR: Record<string, string> = {
  PLANNING: "#6B8F71",
  ACTIVE: "#C4664A",
  COMPLETED: "#717171",
};

function formatDateRange(start: string | null, end: string | null) {
  if (!start) return null;
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = new Date(start).toLocaleDateString("en-US", opts);
  if (!end) return startStr;
  const endStr = new Date(end).toLocaleDateString("en-US", { ...opts, year: "numeric" });
  return `${startStr} – ${endStr}`;
}

function TripCard({ trip }: { trip: Trip }) {
  const hero = trip.heroImageUrl ?? DEFAULT_HERO;
  const dateRange = formatDateRange(trip.startDate, trip.endDate);
  const statusColor = STATUS_COLOR[trip.status] ?? "#717171";

  return (
    <Link href={`/trips/${trip.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "20px", overflow: "hidden", border: "1.5px solid #EEEEEE", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", transition: "box-shadow 0.15s" }}>
        {/* Hero image */}
        <div style={{ height: "140px", position: "relative", overflow: "hidden", backgroundImage: `url('${hero}')`, backgroundSize: "cover", backgroundPosition: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)" }} />
          {/* Trip title */}
          <div style={{ position: "absolute", bottom: "12px", left: "16px", right: "60px", zIndex: 2 }}>
            <p style={{ fontSize: "20px", fontWeight: 800, color: "#fff", lineHeight: 1.2, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
              {trip.title}
            </p>
          </div>
          {/* Status pill */}
          <div style={{ position: "absolute", top: "12px", right: "12px", zIndex: 2, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: "20px", padding: "3px 10px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: statusColor }}>
              {STATUS_LABEL[trip.status]}
            </span>
          </div>
        </div>

        {/* Details */}
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {(trip.destinationCity || trip.destinationCountry) && (
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <MapPin size={12} style={{ color: "#C4664A", flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: "#2d2d2d", fontWeight: 600 }}>
                  {[trip.destinationCity, trip.destinationCountry].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
            {dateRange && (
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Calendar size={12} style={{ color: "#717171", flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: "#717171" }}>{dateRange}</span>
              </div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "20px", fontWeight: 800, color: "#C4664A", lineHeight: 1 }}>
              {trip.savedCount}
            </p>
            <p style={{ fontSize: "11px", color: "#717171", marginTop: "2px" }}>
              {trip.savedCount === 1 ? "place" : "places"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function TripsPageClient({ trips }: { trips: Trip[] }) {
  const now = new Date();
  const upcoming = trips.filter((t) => t.status !== "COMPLETED");
  const past = trips.filter((t) => t.status === "COMPLETED");

  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const displayed = tab === "upcoming" ? upcoming : past;

  const tabStyle = (active: boolean) => ({
    paddingTop: "10px",
    paddingBottom: "12px",
    paddingLeft: "16px",
    paddingRight: "16px",
    fontSize: "14px",
    fontWeight: active ? 700 : 500,
    color: active ? "#C4664A" : "#717171",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: active ? "2.5px solid #C4664A" : "2.5px solid transparent",
    marginBottom: "-1px",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF", paddingBottom: "80px" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "32px 24px 0" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#1a1a1a", marginBottom: "4px" }}>
              Your trips
            </h1>
            <p style={{ fontSize: "14px", color: "#717171" }}>
              {trips.length > 0
                ? `${trips.length} ${trips.length === 1 ? "trip" : "trips"} total`
                : "Plan your next adventure."}
            </p>
          </div>
          <Link
            href="/trips/new"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#C4664A",
              color: "#fff",
              borderRadius: "20px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              flexShrink: 0,
              marginTop: "4px",
            }}
          >
            <Plus size={15} />
            New trip
          </Link>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,0.08)", marginBottom: "20px" }}>
          <button onClick={() => setTab("upcoming")} style={tabStyle(tab === "upcoming")}>
            Upcoming {upcoming.length > 0 && <span style={{ marginLeft: "4px", fontSize: "12px", color: tab === "upcoming" ? "#C4664A" : "#aaa" }}>({upcoming.length})</span>}
          </button>
          <button onClick={() => setTab("past")} style={tabStyle(tab === "past")}>
            Past {past.length > 0 && <span style={{ marginLeft: "4px", fontSize: "12px", color: tab === "past" ? "#C4664A" : "#aaa" }}>({past.length})</span>}
          </button>
        </div>

        {/* Trip cards */}
        {displayed.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {displayed.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div style={{ backgroundColor: "#F5F5F5", borderRadius: "20px", borderLeft: "4px solid #C4664A", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "32px 24px" }}>
            <Map size={32} style={{ color: "#C4664A", marginBottom: "12px" }} />
            <p style={{ fontSize: "18px", fontWeight: 700, color: "#1a1a1a", marginBottom: "6px" }}>
              {tab === "upcoming" ? "No upcoming trips" : "No past trips yet"}
            </p>
            <p style={{ fontSize: "14px", fontStyle: "italic", color: "#C4664A", marginBottom: "8px" }}>
              Because 47 browser tabs isn&apos;t a plan.
            </p>
            <p style={{ fontSize: "14px", color: "#717171", lineHeight: 1.5, marginBottom: "16px" }}>
              {tab === "upcoming"
                ? "Add a destination, dates, and your saved places."
                : "Your completed trips will appear here."}
            </p>
            {tab === "upcoming" && (
              <Link
                href="/trips/new"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#C4664A", color: "#fff", borderRadius: "20px", padding: "8px 20px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}
              >
                <Plus size={14} />
                Plan a trip
              </Link>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
