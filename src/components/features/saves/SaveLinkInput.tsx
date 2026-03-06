"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SaveLinkInput() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/saves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      setUrl("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh(); // re-fetch server component data
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste a link from Instagram, TikTok, Google Maps..."
          className="flex-1 h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 placeholder:text-gray-400"
          disabled={saving}
        />
        <button
          onClick={handleSave}
          disabled={saving || !url.trim()}
          className="h-12 px-5 bg-gray-900 text-white font-semibold rounded-xl text-sm hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && (
        <p className="text-green-600 text-sm font-medium">Saved! ✓</p>
      )}

      <p className="text-xs text-gray-400">
        Works with Instagram, TikTok, Google Maps, Airbnb, Booking.com, and
        most links.
      </p>
    </div>
  );
}
