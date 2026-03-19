import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId } = await params;

  const flights = await db.flight.findMany({
    where: { tripId },
    orderBy: [{ departureDate: "asc" }, { departureTime: "asc" }],
  });

  return NextResponse.json(flights);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tripId } = await params;

  const body = await request.json();
  const {
    type,
    airline,
    flightNumber,
    fromAirport,
    fromCity,
    toAirport,
    toCity,
    departureDate,
    departureTime,
    arrivalDate,
    arrivalTime,
    duration,
    cabinClass,
    confirmationCode,
    seatNumbers,
    notes,
    dayIndex,
  } = body;

  if (!airline || !flightNumber || !fromAirport || !toAirport || !departureDate || !departureTime || !arrivalDate || !arrivalTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const flight = await db.flight.create({
    data: {
      tripId,
      type: type ?? "outbound",
      airline,
      flightNumber,
      fromAirport,
      fromCity: fromCity ?? fromAirport,
      toAirport,
      toCity: toCity ?? toAirport,
      departureDate,
      departureTime,
      arrivalDate,
      arrivalTime,
      duration: duration ?? null,
      cabinClass: cabinClass ?? "economy",
      confirmationCode: confirmationCode ?? null,
      seatNumbers: seatNumbers ?? null,
      notes: notes ?? null,
      dayIndex: dayIndex ?? null,
    },
  });

  return NextResponse.json(flight, { status: 201 });
}
