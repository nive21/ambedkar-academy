alter table if exists public.hall_bookings
  add column if not exists rejection_reason text,
  add column if not exists payment_received boolean not null default false,
  add column if not exists payment_received_at timestamptz;
