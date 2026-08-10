# Hall Booking Setup (Supabase)

## 1. Frontend env vars
Set these in your local `.env` and deployment environment:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_BOOKING_ADMIN_EMAIL` (`admin@ambedkar-academy.in`)

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
- `BOOKING_SENDER_EMAIL` (`admin@ambedkar-academy.in`)
- `BOOKING_ADMIN_EMAIL` (`admin@ambedkar-academy.in` fallback admin email if frontend env is missing)

## 4. Admin events setup
Run migration:

- `supabase/migrations/20260329_create_admin_events.sql`

Deploy admin function:

- `supabase/functions/admin-events/index.ts`

Set function secret:

- `ADMIN_EVENTS_ACCESS_KEY` (used by `/admin` page access gate)
- `SUPABASE_SERVICE_ROLE_KEY` (required by `admin-events` function for create/update/delete)
- `RESEND_API_KEY` (required for approve/deny notification emails from admin dashboard)
- `BOOKING_SENDER_EMAIL` (`admin@ambedkar-academy.in` verified sender used by admin dashboard notifications)
- `BOOKING_ADMIN_EMAIL` (`admin@ambedkar-academy.in` fallback admin recipient for dashboard notifications)

## 5. Deliverability note
- In Resend, use `admin@ambedkar-academy.in` as the sender identity after verifying the `ambedkar-academy.in` domain.
- Add the SPF and DKIM DNS records Resend provides for `ambedkar-academy.in`; without those, mail is much more likely to land in spam or junk.

## 6. Booking rules implemented in app
- Date must be at least 7 days ahead.
- Slot options are disabled when already booked.
- Admin events with custom timings also block overlapping booking slots.
- Fully booked dates are blocked with user-facing reason.
- On submit:
  - Aadhar file uploads to `booking-documents`
  - Booking row inserts into `hall_bookings`
  - Email trigger runs for user + admin
