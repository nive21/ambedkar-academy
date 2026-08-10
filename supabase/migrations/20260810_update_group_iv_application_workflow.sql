alter table public.group_iv_applications_2026
  alter column mother_occupation drop not null,
  alter column father_occupation drop not null;

update public.group_iv_applications_2026
set
  mother_occupation = nullif(trim(mother_occupation), ''),
  father_occupation = nullif(trim(father_occupation), '');

alter table public.group_iv_applications_2026
  add column if not exists shortlist_status text not null default 'pending'
    check (shortlist_status in ('pending', 'shortlisted', 'rejected')),
  add column if not exists interview_date date;

alter table public.group_iv_applications_2026
  drop constraint if exists group_iv_applications_shortlist_date_check;

alter table public.group_iv_applications_2026
  add constraint group_iv_applications_shortlist_date_check
  check (
    (shortlist_status = 'shortlisted' and interview_date is not null)
    or (shortlist_status in ('pending', 'rejected') and interview_date is null)
  );
