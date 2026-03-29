# Hall Booking Setup (Supabase)

## 1. Frontend env vars
Set these in your local `.env` and deployment environment:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_BOOKING_ADMIN_EMAIL`

## 2. Database + storage
Run the migration:

- `supabase/migrations/20260329_create_hall_bookings.sql`

This creates:
- `hall_bookings` table
- unique active-slot constraint
- `booking-documents` storage bucket
- basic insert/select/upload policies for app usage

## 3. Email function
Deploy edge function:

- `supabase/functions/send-booking-emails/index.ts`

Set function secrets:
- `RESEND_API_KEY`
- `BOOKING_SENDER_EMAIL` (example: `noreply@yourdomain.com`)
- `BOOKING_ADMIN_EMAIL` (fallback admin email if frontend env is missing)

## 4. Admin events setup
Run migration:

- `supabase/migrations/20260329_create_admin_events.sql`

Deploy admin function:

- `supabase/functions/admin-events/index.ts`

Set function secret:

- `ADMIN_EVENTS_ACCESS_KEY` (used by `/admin-events` page access gate)
- `SUPABASE_SERVICE_ROLE_KEY` (required by `admin-events` function for create/update/delete)

## 5. Booking rules implemented in app
- Date must be at least 7 days ahead.
- Slot options are disabled when already booked.
- Admin events with custom timings also block overlapping booking slots.
- Fully booked dates are blocked with user-facing reason.
- On submit:
  - Aadhar file uploads to `booking-documents`
  - Booking row inserts into `hall_bookings`
  - Email trigger runs for user + admin
