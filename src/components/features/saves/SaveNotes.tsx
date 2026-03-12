"use client";

import { useState, useRef } from "react";

export function SaveNotes({ itemId, initialNotes }: { itemId: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleBlur() {
    if (notes === initialNotes) return;
    setSaving(true);
    try {
      await fetch(`/api/saves/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      setSaved(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setSaved(false), 2000);
    } catch {
      // silent fail
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        onBlur={handleBlur}
        placeholder="Add your own notes..."
        rows={4}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: "12px",
          border: "1px solid rgba(0,0,0,0.12)",
          fontSize: "14px",
          color: "#333",
          resize: "none",
          outline: "none",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          lineHeight: 1.5,
          boxSizing: "border-box",
        }}
      />
      {(saving || saved) && (
        <span style={{ position: "absolute", bottom: "10px", right: "12px", fontSize: "11px", color: "#999" }}>
          {saving ? "Saving…" : "Saved"}
        </span>
      )}
    </div>
  );
}
