"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function ShareHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"saving" | "done" | "error">("saving");
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    const sharedUrl =
      searchParams.get("url") ??
      // Instagram puts the URL in the "text" field on iOS
      searchParams.get("text") ??
      null;

    const sharedTitle = searchParams.get("title") ?? "";
    setTitle(sharedTitle);

    if (!sharedUrl) {
      setStatus("error");
      return;
    }

    // Extract the first URL from text if Instagram sent a caption + link
    const urlMatch = sharedUrl.match(/https?:\/\/[^\s]+/);
    const urlToSave = urlMatch ? urlMatch[0] : sharedUrl;

    fetch("/api/saves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: urlToSave }),
    })
      .then((res) => {
        if (res.ok) {
          setStatus("done");
          setTimeout(() => router.push("/saves"), 1500);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-6 text-center">
      {status === "saving" && (
        <>
          <div className="text-4xl animate-pulse">📌</div>
          <p className="text-lg font-semibold text-gray-900">Saving...</p>
          {title && <p className="text-sm text-gray-400">{title}</p>}
        </>
      )}
      {status === "done" && (
        <>
          <div className="text-4xl">✅</div>
          <p className="text-lg font-semibold text-gray-900">Saved!</p>
          <p className="text-sm text-gray-400">Taking you to your saves...</p>
        </>
      )}
      {status === "error" && (
        <>
          <div className="text-4xl">⚠️</div>
          <p className="text-lg font-semibold text-gray-900">
            Couldn&apos;t save that link
          </p>
          <p className="text-sm text-gray-400">
            Make sure you&apos;re sharing a valid URL.
          </p>
          <button
            onClick={() => router.push("/saves")}
            className="mt-2 bg-gray-900 text-white font-semibold px-6 py-3 rounded-xl text-sm"
          >
            Go to saves →
          </button>
        </>
      )}
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense>
      <ShareHandler />
    </Suspense>
  );
}
