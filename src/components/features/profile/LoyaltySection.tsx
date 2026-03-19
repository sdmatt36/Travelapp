"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const AIRLINES = [
  "United MileagePlus", "Delta SkyMiles", "American AAdvantage",
  "British Airways Avios", "Southwest Rapid Rewards", "Air Canada Aeroplan",
  "Emirates Skywards", "Alaska Mileage Plan",
];

const HOTELS = [
  "Marriott Bonvoy", "Hilton Honors", "World of Hyatt",
  "IHG One Rewards", "Wyndham Rewards", "Choice Privileges", "Best Western Rewards",
];

const CAR_RENTAL = [
  "Hertz Gold Plus", "National Emerald Club", "Enterprise Plus",
  "Avis Preferred", "Budget Fastbreak", "Alamo Insiders",
];

interface LoyaltyEntry {
  id: string;
  program: string;
  memberNumber: string;
  programType: string;
}

interface CategoryState {
  added: LoyaltyEntry[];
  search: string;
}

function LoyaltyCategory({
  title,
  programs,
  programType,
  state,
  onChange,
  onAdd,
  onRemove,
  onUpdateNumber,
}: {
  title: string;
  programs: string[];
  programType: string;
  state: CategoryState;
  onChange: (s: CategoryState) => void;
  onAdd: (name: string, memberNumber: string, programType: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onUpdateNumber: (id: string, memberNumber: string) => void;
}) {
  const addedNames = new Set(state.added.map((e) => e.program));

  async function addProgram(name: string) {
    if (addedNames.has(name)) return;
    await onAdd(name, "", programType);
  }

  async function handleAdd() {
    const name = state.search.trim();
    if (!name) return;
    onChange({ ...state, search: "" });
    await onAdd(name, "", programType);
  }

  return (
    <div style={{ marginBottom: "32px" }}>
      <p style={{ fontSize: "15px", fontWeight: 600, color: "#1B3A5C", marginBottom: "12px" }}>{title}</p>

      {state.added.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
          {state.added.map((entry) => (
            <div key={entry.id} style={{
              display: "flex", alignItems: "center", gap: "12px",
              backgroundColor: "#fff", border: "1px solid #E8E8E8",
              borderRadius: "8px", padding: "10px 14px",
            }}>
              <span style={{ flex: "0 0 auto", fontSize: "14px", fontWeight: 500, color: "#1B3A5C", minWidth: "160px" }}>
                {entry.program}
              </span>
              <input
                value={entry.memberNumber}
                onChange={(e) => onUpdateNumber(entry.id, e.target.value)}
                onBlur={async (e) => {
                  // PATCH member number on blur
                  await fetch(`/api/profile/loyalty?id=${entry.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ memberNumber: e.target.value }),
                  });
                }}
                placeholder="Member number (optional)"
                style={{
                  flex: 1, border: "none", outline: "none", fontSize: "14px",
                  color: "#1a1a1a", backgroundColor: "transparent",
                }}
              />
              <button onClick={() => onRemove(entry.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>
                <X size={15} style={{ color: "#717171" }} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
        {programs.filter((p) => !addedNames.has(p)).map((p) => (
          <button
            key={p}
            onClick={() => addProgram(p)}
            style={{
              border: "1px solid #E8E8E8", borderRadius: "999px",
              padding: "5px 12px", fontSize: "13px", color: "#717171",
              backgroundColor: "#fff", cursor: "pointer",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <input
          value={state.search}
          onChange={(e) => onChange({ ...state, search: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Search programs..."
          style={{
            flex: 1, padding: "8px 12px", border: "1px solid #E8E8E8",
            borderRadius: "8px", fontSize: "14px", color: "#1a1a1a", outline: "none",
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: "8px 16px", backgroundColor: "#1B3A5C", color: "#fff",
            border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer",
          }}
        >
          + Add
        </button>
      </div>
    </div>
  );
}

const emptyState = (): CategoryState => ({ added: [], search: "" });

export function LoyaltySection() {
  const [airlines, setAirlines] = useState<CategoryState>(emptyState);
  const [hotels, setHotels] = useState<CategoryState>(emptyState);
  const [cars, setCars] = useState<CategoryState>(emptyState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile/loyalty")
      .then((r) => r.json())
      .then((data: Array<{ id: string; programName: string; memberNumber: string; programType: string }>) => {
        if (!Array.isArray(data)) return;
        const toEntry = (p: { id: string; programName: string; memberNumber: string; programType: string }): LoyaltyEntry => ({
          id: p.id,
          program: p.programName,
          memberNumber: p.memberNumber,
          programType: p.programType,
        });
        setAirlines((s) => ({ ...s, added: data.filter((p) => p.programType === "airline").map(toEntry) }));
        setHotels((s) => ({ ...s, added: data.filter((p) => p.programType === "hotel").map(toEntry) }));
        setCars((s) => ({ ...s, added: data.filter((p) => p.programType === "car").map(toEntry) }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(programName: string, memberNumber: string, programType: string) {
    const res = await fetch("/api/profile/loyalty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ programName, memberNumber, programType }),
    });
    if (!res.ok) return;
    const saved = await res.json();
    const entry: LoyaltyEntry = {
      id: saved.id,
      program: saved.programName,
      memberNumber: saved.memberNumber,
      programType: saved.programType,
    };
    if (programType === "airline") setAirlines((s) => ({ ...s, added: [...s.added, entry] }));
    else if (programType === "hotel") setHotels((s) => ({ ...s, added: [...s.added, entry] }));
    else setCars((s) => ({ ...s, added: [...s.added, entry] }));
  }

  async function handleRemove(id: string) {
    await fetch(`/api/profile/loyalty?id=${id}`, { method: "DELETE" });
    const removeById = (s: CategoryState): CategoryState => ({
      ...s, added: s.added.filter((e) => e.id !== id),
    });
    setAirlines(removeById);
    setHotels(removeById);
    setCars(removeById);
  }

  function handleUpdateNumber(id: string, memberNumber: string) {
    const update = (s: CategoryState): CategoryState => ({
      ...s, added: s.added.map((e) => e.id === id ? { ...e, memberNumber } : e),
    });
    setAirlines(update);
    setHotels(update);
    setCars(update);
  }

  if (loading) return <p style={{ color: "#717171", fontSize: "14px" }}>Loading...</p>;

  const sharedProps = {
    onAdd: handleAdd,
    onRemove: handleRemove,
    onUpdateNumber: handleUpdateNumber,
  };

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #E8E8E8", padding: "24px" }}>
      <LoyaltyCategory title="Airlines" programs={AIRLINES} programType="airline" state={airlines} onChange={setAirlines} {...sharedProps} />
      <LoyaltyCategory title="Hotels" programs={HOTELS} programType="hotel" state={hotels} onChange={setHotels} {...sharedProps} />
      <LoyaltyCategory title="Car Rental" programs={CAR_RENTAL} programType="car" state={cars} onChange={setCars} {...sharedProps} />
    </div>
  );
}
