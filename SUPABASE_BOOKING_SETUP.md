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

## 4. Booking rules implemented in app
- Date must be at least 7 days ahead.
- Slot options are disabled when already booked.
- Fully booked dates are blocked with user-facing reason.
- On submit:
  - Aadhar file uploads to `booking-documents`
  - Booking row inserts into `hall_bookings`
  - Email trigger runs for user + admin

