// ============================================
// GOOGLE MAPS INTEGRATION
// ============================================
//
// TWO-WAY SYNC ARCHITECTURE:
//
// OUTBOUND (app → Google Maps):
//   When user finalizes a day's itinerary,
//   offer "Export Day to Google Maps" which:
//   1. Takes all SavedItems assigned to that day
//      in order (by itinerary slot)
//   2. Creates a Google Maps route via:
//      https://www.google.com/maps/dir/?api=1
//      with waypoints for each item's lat/lng
//   3. Opens in Google Maps app on mobile
//      OR new tab on desktop
//   4. Optional: save as named list via
//      Google Maps My Maps API (requires OAuth)
//
// INBOUND (Google Maps → app):
//   When user connects Google account:
//   1. Read saved places via Google Maps
//      Places API (requires user OAuth consent)
//   2. Import as SavedItems with:
//      source_type: 'google_maps'
//      raw_title: place name
//      lat/lng: from Places data
//   3. Run through normal extraction pipeline
//      (Claude classification, interest mapping)
//   4. Surface in saves screen with
//      "from Google Maps" source badge
//
// REAL-TIME SYNC:
//   - Webhook or polling (every 6 hours) for
//     new Google Maps saves
//   - Inngest job: sync_google_maps_saves
//   - Only sync if user has granted permission
//   - De-duplicate against existing SavedItems
//     by lat/lng proximity (within 50 meters)
//
// TECHNICAL REQUIREMENTS:
//   - Google OAuth 2.0 scope:
//     https://www.googleapis.com/auth/maps
//   - Google Places API key (separate from
//     geocoding key in extraction pipeline)
//   - Store Google refresh token on User model:
//     google_maps_token: String? (encrypted)
//   - Rate limit: 100 requests/day free tier
//
// PRIORITY: Phase 2
// EFFORT: ~2 weeks solo development

// ============================================
// APPLE MAPS INTEGRATION (lighter touch)
// ============================================
//
// Apple Maps has limited API access compared
// to Google Maps. Realistic integration:
//
// OUTBOUND ONLY (app → Apple Maps):
//   Use Apple Maps URL scheme:
//   maps://? or https://maps.apple.com/?
//   with daddr= for destination
//   and waypoints for multi-stop days
//
//   On iOS: opens Apple Maps natively
//   On Android/desktop: falls back to Google Maps
//
// No inbound sync available via public API.
// Users can manually share Apple Maps links
// to the app via the save-anywhere mechanism.
//
// PRIORITY: Phase 2 (outbound only)
// EFFORT: ~2 days
