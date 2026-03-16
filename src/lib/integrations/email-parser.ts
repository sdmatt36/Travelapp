// ============================================
// EMAIL PARSING INTEGRATION
// ============================================
//
// CONCEPT: Forward any booking confirmation
// email to trips@[appname].com and the app
// automatically extracts and adds it to the
// relevant trip.
//
// INSPIRATION: TripIt's core mechanic —
// the most-loved feature in travel apps.
// Nobody has done this well for family travel.
//
// INBOUND EMAIL FLOW:
//   1. User forwards confirmation email to
//      trips@[appname].com
//      OR connects Gmail/Outlook for auto-scan
//
//   2. Email received via Resend inbound webhook
//      (Resend supports inbound email parsing)
//      OR via Gmail API with push notifications
//
//   3. Inngest job fires: parse_booking_email
//
//   4. Claude extracts structured data:
//      Input: email subject + body (text)
//      Output JSON:
//      {
//        booking_type: "flight" | "hotel" |
//          "restaurant" | "activity" | "car_rental",
//        vendor_name: string,
//        confirmation_number: string,
//        start_datetime: ISO string | null,
//        end_datetime: ISO string | null,
//        location: string | null,
//        total_cost: number | null,
//        currency: string | null,
//        passenger_names: string[] | null,
//        room_type: string | null,
//        flight_number: string | null,
//        origin: string | null,
//        destination: string | null,
//        confidence: number
//      }
//
//   5. Match to existing trip by destination
//      and dates
//
//   6. If match found (confidence > 0.8):
//      - Create SavedItem with extracted data
//      - Mark as status: 'booked'
//      - Create calendar event
//      - Push notification:
//        "We found your JAL booking — added
//         to Okinawa May '25"
//
//   7. If no match or low confidence:
//      - Create unassigned SavedItem
//      - Notify: "New booking found — which
//        trip does this belong to?"
//
// AUTO-SCAN OPTION (Gmail integration):
//   - OAuth scope:
//     https://www.googleapis.com/auth/gmail.readonly
//   - Query for booking confirmation patterns:
//     subject:(confirmation OR booking OR
//     reservation OR itinerary OR "your trip")
//     from:(airlines, hotel chains, OTAs)
//   - Run on trip creation for date range
//   - User must explicitly opt in
//   - Privacy: process server-side,
//     never store raw email content
//
// SUPPORTED VENDORS (initial list):
//   Airlines: JAL, ANA, United, Delta, AA,
//             Southwest, Lufthansa, BA, Emirates
//   Hotels: Marriott, Hilton, IHG, Hyatt,
//           Booking.com, Expedia, Airbnb
//   Activities: Viator, GetYourGuide,
//               OpenTable, Resy
//   Car rental: Hertz, Enterprise, Budget
//
// PRIVACY & TRUST REQUIREMENTS:
//   - Explicit opt-in required
//   - Clear explanation of what is read
//   - Raw email content never stored
//   - Only structured extracted data stored
//   - User can revoke access at any time
//   - Show exactly what was extracted before saving
//
// PRISMA SCHEMA ADDITIONS:
//   On User:
//     gmail_connected: Boolean default false
//     gmail_scan_enabled: Boolean default false
//     gmail_token: String? (encrypted)
//     email_parse_address: String?
//     (unique trips@[appname].com subdomain)
//
// PRIORITY: Phase 2 — high impact,
//           medium complexity
// EFFORT: ~4 weeks solo development
// NOTE: This is a major differentiator.
//       TripIt charges $49/year for this alone.
//       Bundling it into the family travel
//       context makes it dramatically more
//       valuable.
