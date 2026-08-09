alter table public.group_iv_applications_2026
  add column if not exists annual_family_income_inr text,
  add column if not exists parent_contact_number text;

update public.group_iv_applications_2026
set
  annual_family_income_inr = coalesce(annual_family_income_inr, ''),
  parent_contact_number = coalesce(parent_contact_number, '')
where annual_family_income_inr is null
   or parent_contact_number is null;

alter table public.group_iv_applications_2026
  alter column annual_family_income_inr set not null,
  alter column parent_contact_number set not null;
