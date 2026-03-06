import Link from "next/link";
import { Show, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">✈️ [App Name]</span>
          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <SignInButton>
                <button className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-colors">
                  Get early access
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/home" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <UserButton />
            </Show>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-sm font-medium px-4 py-2 rounded-full">
            <span>🚀</span> Early access
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Your next family trip is scattered across{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">
              11 tabs, three apps, and a spreadsheet nobody&apos;s updated.
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            [App Name] brings it all together — your saved Instagram posts, TikTok reels, Airbnb
            favorites, hotel tabs, Google Maps stars, and that email thread you keep forwarding to
            yourself. One place. Actually organized. Built around your family.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/sign-up"
              className="bg-gray-900 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-gray-700 transition-colors"
            >
              Get early access →
            </Link>
            <a
              href="#how-it-works"
              className="border border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-xl text-base hover:border-gray-400 transition-colors"
            >
              See how it works
            </a>
          </div>
          <p className="text-sm text-gray-400">Free to join. No credit card required.</p>
        </div>
      </section>

      {/* Core hook */}
      <section id="how-it-works" className="py-24 bg-gray-50 px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Save anywhere. Find it when it matters.
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              You&apos;ve been collecting the perfect trip for months. A restaurant from a TikTok. A
              hotel someone emailed you. A beach you hearted on Booking.com at midnight. They&apos;re
              all there — somewhere. We make them actually usable.
            </p>
          </div>

          {/* Demo cards */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center sm:items-start">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 w-full max-w-sm space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                <span>📍</span> 600m from your hotel
              </div>
              <div className="bg-gray-100 rounded-2xl h-40 flex items-center justify-center text-4xl">
                🍕
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Mercado de San Miguel</p>
                <p className="text-gray-400 text-sm">Madrid · Saved 4 months ago from Instagram</p>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                You saved this when you started planning. It opens at 10am — perfect before your
                museum visit. Kids aged 6+ love the churros counter.
              </p>
              <div className="flex gap-2">
                <button className="flex-1 bg-gray-900 text-white font-semibold py-2.5 rounded-xl text-sm">
                  Add to Tuesday
                </button>
                <button className="px-4 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-gray-400 transition-colors">
                  Map
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 w-full max-w-sm space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                <span>🏨</span> Saved from email
              </div>
              <div className="bg-gray-100 rounded-2xl h-40 flex items-center justify-center text-4xl">
                🏡
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Hotel Matilda</p>
                <p className="text-gray-400 text-sm">San Miguel de Allende · Saved 2 months ago</p>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                From that email thread. Family suite available for your dates. Rooftop pool — your
                kids will love it. 3 blocks from the jardín.
              </p>
              <div className="flex gap-2">
                <button className="flex-1 bg-gray-900 text-white font-semibold py-2.5 rounded-xl text-sm">
                  Add to trip
                </button>
                <button className="px-4 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-gray-400 transition-colors">
                  Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
            The travel brain your family never had
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                emoji: "📲",
                title: "Save from anywhere",
                desc: "Instagram, TikTok, Google Maps, Airbnb, Booking.com, Yelp, emails, links — share it to [App Name] the same way you'd share it to a text. We extract the location, the details, and the context automatically.",
              },
              {
                emoji: "🧠",
                title: "Knows your family, not just families",
                desc: "Recommendations filtered by your kids' actual ages, dietary needs, energy levels, and interests. Not a generic family list. Your family.",
              },
              {
                emoji: "🗂️",
                title: "One trip, not ten tabs",
                desc: "See everything for a destination in one place — your saves, smart recommendations, a day-by-day itinerary, and how far everything is from where you're staying.",
              },
              {
                emoji: "🌍",
                title: "Community you can trust",
                desc: "Real recommendations from families who've actually been there — with kids the same ages as yours, the same dietary needs, the same travel style. Not influencer content. Not TripAdvisor reviews from 2019.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-gray-50 rounded-2xl p-6 space-y-3 border border-gray-100"
              >
                <span className="text-3xl">{f.emoji}</span>
                <h3 className="font-bold text-gray-900 text-lg">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="py-24 bg-gray-900 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Stop planning in chaos.
          </h2>
          <p className="text-gray-400 text-lg">
            Most families spend 10+ hours researching every trip — across tabs, apps, spreadsheets,
            and group chats — and still feel like they&apos;re guessing. There&apos;s a better way.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-white text-gray-900 font-semibold px-8 py-4 rounded-xl text-base hover:bg-gray-100 transition-colors"
          >
            Get early access →
          </Link>
          <p className="text-gray-500 text-sm">Free to join. No credit card required.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>✈️ [App Name] — Family Travel Platform</span>
          <span>© 2026 · Confidential</span>
        </div>
      </footer>

    </div>
  );
}
