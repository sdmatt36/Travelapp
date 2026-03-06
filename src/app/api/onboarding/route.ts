import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z, ZodError } from "zod";
import { DietaryReq, InterestCategory } from "@prisma/client";

const MemberSchema = z.object({
  role: z.enum(["ADULT", "CHILD"]),
  birthDate: z.string().optional(),
  dietaryRequirements: z.array(z.nativeEnum(DietaryReq)),
});

const OnboardingSchema = z.object({
  familyName: z.string().optional(),
  homeCity: z.string().min(1),
  homeCountry: z.string().min(1),
  travelFrequency: z.enum(["ONE_TWO", "THREE_FIVE", "SIX_PLUS"]),
  members: z.array(MemberSchema),
  interestKeys: z.array(z.string()).min(3),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = OnboardingSchema.parse(body);

    // Upsert user record (sync with Clerk)
    const user = await db.user.upsert({
      where: { clerkId: userId },
      create: { clerkId: userId, email: "" },
      update: {},
    });

    // Create family profile with members and interests
    const familyProfile = await db.familyProfile.create({
      data: {
        userId: user.id,
        familyName: data.familyName ?? null,
        homeCity: data.homeCity,
        homeCountry: data.homeCountry,
        travelFrequency: data.travelFrequency,
        members: {
          create: data.members.map((m) => ({
            role: m.role,
            birthDate: m.birthDate ? new Date(m.birthDate) : null,
            dietaryRequirements: m.dietaryRequirements,
          })),
        },
        interests: {
          create: data.interestKeys.map((key) => ({
            interestKey: key,
            category: getCategoryForKey(key),
            tier: "SIGNUP" as const,
            weight: 1.0,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, familyProfileId: familyProfile.id });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function getCategoryForKey(key: string): InterestCategory {
  const map: Record<string, InterestCategory> = {
    street_food: "FOOD", local_markets: "FOOD", fine_dining: "FOOD",
    food_tours: "FOOD", cooking_classes: "FOOD", cafes: "FOOD",
    hiking: "OUTDOOR", beaches: "OUTDOOR", national_parks: "OUTDOOR",
    cycling: "OUTDOOR", water_sports: "OUTDOOR", wildlife: "OUTDOOR",
    museums: "CULTURE", history: "CULTURE", art: "CULTURE",
    architecture: "CULTURE", local_festivals: "CULTURE", music: "CULTURE",
    theme_parks: "KIDS", playgrounds: "KIDS", zoos: "KIDS",
    educational: "KIDS", sports: "KIDS", hands_on: "KIDS",
    shows: "ENTERTAINMENT", sports_events: "ENTERTAINMENT", nightlife: "ENTERTAINMENT", movies: "ENTERTAINMENT",
    boutiques: "SHOPPING", vintage: "SHOPPING", souvenirs: "SHOPPING", antiques: "SHOPPING",
    spas: "WELLNESS", yoga: "WELLNESS", hot_springs: "WELLNESS", slow_travel: "WELLNESS",
    luxury: "STYLE", budget_travel: "STYLE", off_beaten_path: "STYLE",
    photography: "STYLE", road_trips: "STYLE", multi_generational: "STYLE",
  };
  return map[key] ?? "STYLE";
}
