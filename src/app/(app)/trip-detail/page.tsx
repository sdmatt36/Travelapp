import { Playfair_Display } from "next/font/google";
import { TripDetailClient } from "@/components/features/trips/TripDetailClient";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "900"] });

export default function TripDetailPage() {
  return <TripDetailClient playfairClass={playfair.className} />;
}
