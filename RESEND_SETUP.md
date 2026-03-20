# Resend Inbound Email Setup

## Webhook URL
Set in Resend dashboard → Domains → flokktravel.com
→ Inbound → Webhook URL:
  https://flokktravel.com/api/webhooks/email-inbound

## Email Address
trips@flokktravel.com → routes to webhook above

## DNS Records (already configured via auto-setup)
MX record pointing to Resend's inbound servers

## Inngest Webhook URL
Set in Inngest dashboard → Apps → Register URL:
  https://flokktravel.com/api/webhooks/inngest

## Environment Variables Required
All of these must be set in Vercel → Settings → Environment Variables:

  INNGEST_EVENT_KEY=        (from Inngest dashboard → Settings)
  INNGEST_SIGNING_KEY=      (from Inngest dashboard → Settings)
  ANTHROPIC_API_KEY=        (from console.anthropic.com → API Keys)
  RESEND_API_KEY=           (already set)

## Test the pipeline
Once deployed, forward a booking confirmation to trips@flokktravel.com
and check:
  1. Inngest dashboard → Functions → parse-booking-email for the triggered event
  2. Trip page — hotel or flight should appear automatically
  3. Vault → Key Info for confirmation number
  4. Vault → Contacts for hotel contact

## Test via curl
curl -X POST https://flokktravel.com/api/webhooks/email-inbound \
  -H "Content-Type: application/json" \
  -d '{
    "from": "your@email.com",
    "subject": "Your Booking Confirmation",
    "text": "Hotel: Vessel Hotel Campana Okinawa. Confirmation: ABC123. Check-in: May 4, 2026. Check-out: May 8, 2026."
  }'
