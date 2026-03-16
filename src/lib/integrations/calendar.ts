// ============================================
// CALENDAR INTEGRATION
// ============================================
//
// OUTBOUND (app → Calendar):
//   When a SavedItem or trip component is marked
//   as "Booked", auto-create a rich calendar event:
//
//   Event structure:
//   {
//     title: "[Item name] — [Trip name]",
//     startTime: date + slot time (morning=9am,
//                afternoon=1pm, evening=6pm),
//     endTime: startTime + duration_minutes,
//     location: address from SavedItem,
//     notes: [
//       "Confirmation: [booking_reference]",
//       "Cost: [price]",
//       "App link: [deep_link_to_item]",
//       "Family: [dietary notes if restaurant]"
//     ],
//     url: affiliate_url or booking_url
//   }
//
//   For FLIGHTS specifically:
//   {
//     title: "✈️ [Airline] [flight_number]
//             [origin] → [destination]",
//     startTime: departure_datetime,
//     endTime: arrival_datetime,
//     location: departure_airport,
//     notes: [
//       "Confirmation: [PNR]",
//       "Terminal: [if known]",
//       "Seats: [if known]",
//       "Check-in opens: 24hrs before"
//     ]
//   }
//
//   For HOTELS:
//   {
//     title: "🏨 Check-in: [Hotel name]",
//     startTime: check_in_date + 15:00,
//     endTime: check_out_date + 11:00,
//     location: hotel_address,
//     notes: [
//       "Confirmation: [booking_ref]",
//       "Rate: [price_per_night]/night",
//       "Check-out: [date]"
//     ]
//   }
//
// GOOGLE CALENDAR IMPLEMENTATION:
//   - OAuth scope:
//     https://www.googleapis.com/auth/calendar
//   - Create events via Calendar API v3
//   - Store in dedicated calendar:
//     "Flokk Trips" (create if not exists)
//   - Inngest job: create_calendar_event
//     triggered when item status → 'booked'
//
// APPLE CALENDAR (iCal) IMPLEMENTATION:
//   - Generate .ics file for each event
//   - Offer download or "Add to Calendar" link
//   - Works cross-platform without OAuth
//   - Fallback for non-Google users
//
// INBOUND (Calendar → app):
//   Read existing travel bookings that email
//   clients auto-add to calendar:
//   - Flight bookings (Gmail → Google Calendar)
//   - Hotel confirmations
//   - Restaurant reservations (OpenTable, Resy)
//
//   On trip creation, offer:
//   "Scan your calendar for existing bookings
//    between [start] and [end] dates?"
//
//   If yes: fetch calendar events in date range,
//   pass to Claude for classification:
//   "Is this a travel booking? Extract:
//    type, name, location, confirmation number"
//
//   Pre-populate trip with confirmed bookings.
//   This is the "we already know your flight"
//   magic moment.
//
// PRISMA SCHEMA ADDITIONS:
//   On Trip:
//     google_calendar_id: String?
//     (ID of "Flokk Trips" calendar)
//
//   On SavedItem:
//     calendar_event_id: String?
//     booking_reference: String?
//     departure_datetime: DateTime?
//     arrival_datetime: DateTime?
//
// PRIORITY: Phase 2
// EFFORT: ~3 weeks solo development
