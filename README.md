<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e88e250e-5fa8-4a15-9dc7-9bfac17a472f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Supabase order date tracking

Apply [`supabase/migrations/20261002000000_add_order_fulfillment_timestamps.sql`](./supabase/migrations/20261002000000_add_order_fulfillment_timestamps.sql) to the Supabase database before deploying this version. The app records `shipped_at` when an order is shipped and `delivered_at` when delivery and payment receipt are confirmed. Existing orders keep these fields empty because their historical fulfillment dates cannot be reliably inferred; they remain visible in Orders, but are not assigned to a dated analytics period.
