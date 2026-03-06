import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { SaveLinkInput } from "@/components/features/saves/SaveLinkInput";

const SOURCE_EMOJI: Record<string, string> = {
  INSTAGRAM: "📸",
  TIKTOK: "🎬",
  GOOGLE_MAPS: "📍",
  MANUAL: "🔗",
  IN_APP: "✈️",
  EMAIL_IMPORT: "📧",
  PHOTO_IMPORT: "🖼️",
};

export default async function SavesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      familyProfile: {
        include: {
          savedItems: {
            orderBy: { savedAt: "desc" },
          },
        },
      },
    },
  });

  if (!user?.familyProfile) redirect("/onboarding");

  const saves = user.familyProfile.savedItems;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Your Saves</h1>
          <p className="text-gray-400 text-sm">
            {saves.length > 0
              ? `${saves.length} saved ${saves.length === 1 ? "place" : "places"}`
              : "Everything you save from across the web, in one place."}
          </p>
        </div>

        {/* URL input */}
        <SaveLinkInput />

        {/* Saves list */}
        {saves.length > 0 ? (
          <div className="space-y-3">
            {saves.map((save) => (
              <div
                key={save.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
              >
                {/* Thumbnail if available */}
                {save.mediaThumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={save.mediaThumbnailUrl}
                    alt={save.rawTitle ?? "Saved item"}
                    className="w-full h-36 object-cover"
                  />
                )}
                <div className="p-4 space-y-1">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5 flex-shrink-0">
                      {SOURCE_EMOJI[save.sourceType] ?? "📌"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 leading-snug">
                        {save.rawTitle ?? save.sourceUrl ?? "Untitled"}
                      </p>
                      {save.rawDescription && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                          {save.rawDescription}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-gray-400 capitalize">
                          {save.sourceType.toLowerCase().replace("_", " ")}
                        </span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400">
                          {new Date(save.savedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {save.extractionStatus === "PENDING" && (
                          <>
                            <span className="text-gray-200">·</span>
                            <span className="text-xs text-amber-500">Processing...</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {save.sourceUrl && (
                    <div className="pt-1">
                      <a
                        href={save.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-gray-600 truncate block"
                      >
                        {save.sourceUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-3">
            <p className="text-4xl">📌</p>
            <p className="text-gray-600 font-medium">No saves yet</p>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Paste a link above — from Instagram, TikTok, Google Maps, or anywhere else.
            </p>
          </div>
        )}

      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-8 py-3">
        <div className="max-w-lg mx-auto flex justify-around">
          {[
            { label: "Home", emoji: "🏠", href: "/home" },
            { label: "Saves", emoji: "📌", href: "/saves", active: true },
            { label: "Trips", emoji: "✈️", href: "/trips" },
            { label: "Profile", emoji: "👤", href: "/profile" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                item.active ? "text-gray-900" : "text-gray-400 hover:text-gray-900"
              }`}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
