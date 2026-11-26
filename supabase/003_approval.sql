-- Kongu AI Academy — single admin + admin approval for every new account

alter table public.profiles add column if not exists status text not null default 'pending'
  check (status in ('pending','approved','rejected'));
update public.profiles set status = 'approved' where role = 'admin';

-- Only one admin can exist, ever.
create unique index if not exists one_admin_only on public.profiles ((role)) where role = 'admin';

create or replace function public.is_approved() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'approved');
$$;

-- Users can never change their own role or approval status; only the admin can.
create or replace function public.protect_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.status := old.status;
  end if;
  return new;
end; $$;

-- Only approved accounts may record progress or request enrolment.
drop policy if exists "own progress" on public.lab_progress;
create policy "own progress read" on public.lab_progress for select using (user_id = auth.uid());
create policy "own progress write" on public.lab_progress for insert with check (user_id = auth.uid() and public.is_approved());
create policy "own progress delete" on public.lab_progress for delete using (user_id = auth.uid() and public.is_approved());
create policy "own progress update" on public.lab_progress for update using (user_id = auth.uid() and public.is_approved());

drop policy if exists "own enrolment request" on public.enrolments;
create policy "own enrolment request" on public.enrolments for insert
  with check (user_id = auth.uid() and status = 'Requested' and public.is_approved());
