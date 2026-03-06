import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { INTERESTS } from "@/types";

function getGreeting() {
  const hour = new Date().getUTCHours() + 9; // JST offset
  const h = hour % 24;
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      familyProfile: {
        include: {
          members: true,
          interests: true,
          trips: {
            where: { status: { in: ["PLANNING", "ACTIVE"] } },
            orderBy: { startDate: "asc" },
            take: 1,
          },
          savedItems: {
            orderBy: { savedAt: "desc" },
            take: 3,
          },
        },
      },
    },
  });

  const profile = user?.familyProfile;

  // If onboarding not done, send them back
  if (!profile) redirect("/onboarding");

  const greeting = getGreeting();
  const displayName = profile.familyName ? `${profile.familyName} family` : "there";
  const activeTrip = profile.trips[0] ?? null;
  const recentSaves = profile.savedItems;

  const adultCount = profile.members.filter((m) => m.role === "ADULT").length;
  const kidCount = profile.members.filter((m) => m.role === "CHILD").length;

  // Map declared interests back to full Interest objects for display
  const interestKeys = profile.interests.map((i) => i.interestKey);
  const myInterests = INTERESTS.filter((i) => interestKeys.includes(i.key));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-6 py-8 space-y-8 pb-28">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 font-medium">{greeting}</p>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">{displayName} ✈️</h1>
          </div>
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
            {adultCount + kidCount}
          </div>
        </div>

        {/* Active / next trip card */}
        {activeTrip ? (
          <div className="bg-gray-900 text-white rounded-3xl p-6 space-y-1">
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
              {activeTrip.status === "ACTIVE" ? "Now traveling" : "Up next"}
            </p>
            <p className="text-xl font-semibold">{activeTrip.title}</p>
            {activeTrip.destinationCity && (
              <p className="text-gray-400 text-sm">
                {activeTrip.destinationCity}
                {activeTrip.destinationCountry ? `, ${activeTrip.destinationCountry}` : ""}
              </p>
            )}
            <div className="pt-3">
              <Link
                href={`/trips/${activeTrip.id}`}
                className="inline-block bg-white text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors"
              >
                View trip →
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 text-white rounded-3xl p-6 space-y-2">
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
              No active trip
            </p>
            <p className="text-xl font-semibold">Where to next?</p>
            <div className="pt-1">
              <button className="bg-white text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors">
                + Create a trip
              </button>
            </div>
          </div>
        )}

        {/* Your interests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Your interests</h2>
            <span className="text-sm text-gray-400">{myInterests.length} selected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {myInterests.map((interest) => (
              <span
                key={interest.key}
                className="flex items-center gap-1.5 bg-white border border-gray-100 shadow-sm px-3 py-1.5 rounded-full text-sm font-medium text-gray-700"
              >
                <span>{interest.emoji}</span>
                {interest.label}
              </span>
            ))}
          </div>
        </div>

        {/* Family snapshot */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Your family</h2>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{adultCount}</p>
              <p className="text-xs text-gray-400">{adultCount === 1 ? "Adult" : "Adults"}</p>
            </div>
            {kidCount > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{kidCount}</p>
                <p className="text-xs text-gray-400">{kidCount === 1 ? "Kid" : "Kids"}</p>
              </div>
            )}
            {profile.homeCity && (
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">{profile.homeCity}</p>
                <p className="text-xs text-gray-400">Home base</p>
              </div>
            )}
            {profile.travelFrequency && (
              <div className="text-center ml-auto">
                <p className="text-sm font-semibold text-gray-900">
                  {profile.travelFrequency === "ONE_TWO"
                    ? "1–2x/yr"
                    : profile.travelFrequency === "THREE_FIVE"
                    ? "3–5x/yr"
                    : "6+/yr"}
                </p>
                <p className="text-xs text-gray-400">Travel freq</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent saves */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent saves</h2>
            <Link href="/saves" className="text-sm text-gray-400 hover:text-gray-600">
              See all
            </Link>
          </div>
          {recentSaves.length > 0 ? (
            <div className="space-y-3">
              {recentSaves.map((save) => (
                <div
                  key={save.id}
                  className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl">
                    {save.sourceType === "INSTAGRAM"
                      ? "📸"
                      : save.sourceType === "TIKTOK"
                      ? "🎬"
                      : save.sourceType === "GOOGLE_MAPS"
                      ? "📍"
                      : "📌"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {save.rawTitle ?? "Untitled save"}
                    </p>
                    {save.destinationCity && (
                      <p className="text-sm text-gray-400">{save.destinationCity}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-dashed border-gray-200 text-center space-y-2">
              <p className="text-2xl">📌</p>
              <p className="text-gray-600 font-medium">Nothing saved yet</p>
              <p className="text-sm text-gray-400">
                Share a link from Instagram, TikTok, or Google Maps to save it here.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-8 py-3">
        <div className="max-w-lg mx-auto flex justify-around">
          {[
            { label: "Home", emoji: "🏠", href: "/home" },
            { label: "Saves", emoji: "📌", href: "/saves" },
            { label: "Trips", emoji: "✈️", href: "/trips" },
            { label: "Profile", emoji: "👤", href: "/profile" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors"
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
