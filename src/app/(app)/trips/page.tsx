import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { TripsPageClient } from "@/components/features/trips/TripsPageClient";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      familyProfile: {
        include: {
          trips: {
            orderBy: { startDate: "asc" },
            include: {
              _count: { select: { savedItems: true } },
            },
          },
        },
      },
    },
  });

  if (!user?.familyProfile) redirect("/onboarding");

  const trips = user.familyProfile.trips.map((t) => ({
    id: t.id,
    title: t.title,
    destinationCity: t.destinationCity,
    destinationCountry: t.destinationCountry,
    startDate: t.startDate ? t.startDate.toISOString() : null,
    endDate: t.endDate ? t.endDate.toISOString() : null,
    status: t.status as "PLANNING" | "ACTIVE" | "COMPLETED",
    heroImageUrl: t.heroImageUrl,
    savedCount: t._count.savedItems,
  }));

  return <TripsPageClient trips={trips} />;
}
