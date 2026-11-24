-- Kongu AI Academy portal — run this once in Supabase → SQL Editor.

-- Profiles (one per auth user)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  institution text,
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, institution)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone', new.raw_user_meta_data->>'institution');
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Public enquiries / demo requests (leads)
create table if not exists public.enquiries (
  id bigint generated always as identity primary key,
  name text not null,
  phone text not null,
  email text,
  institution text not null,
  interest text not null,
  participants int,
  message text,
  status text not null default 'New' check (status in ('New','Contacted','Demo booked','Proposal sent','Won','Lost')),
  created_at timestamptz not null default now()
);

-- Batches (a scheduled programme run)
create table if not exists public.batches (
  id bigint generated always as identity primary key,
  title text not null,
  track text not null,
  institution text,
  starts_on date,
  ends_on date,
  seats int default 60,
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

-- Enrolments of students into batches
create table if not exists public.enrolments (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  batch_id bigint not null references public.batches(id) on delete cascade,
  status text not null default 'Requested' check (status in ('Requested','Confirmed','Completed','Cancelled')),
  created_at timestamptz not null default now(),
  unique (user_id, batch_id)
);

-- Lab progress (lab ids come from lib/labs.ts)
create table if not exists public.lab_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lab_id text not null,
  completed_at timestamptz not null default now(),
  submission_url text,
  primary key (user_id, lab_id)
);

-- Certificates
create table if not exists public.certificates (
  id text primary key,                      -- e.g. KAA-2026-000123
  user_id uuid references auth.users(id) on delete set null,
  recipient_name text not null,
  programme text not null,
  institution text,
  issued_on date not null default current_date,
  created_at timestamptz not null default now()
);

-- Row-level security
alter table public.profiles enable row level security;
alter table public.enquiries enable row level security;
alter table public.batches enable row level security;
alter table public.enrolments enable row level security;
alter table public.lab_progress enable row level security;
alter table public.certificates enable row level security;

create policy "own profile read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "own profile update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Students cannot promote themselves: only admins may change a role
create or replace function public.protect_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end; $$;
drop trigger if exists protect_role on public.profiles;
create trigger protect_role before update on public.profiles
  for each row execute function public.protect_role();
create policy "admin profile all" on public.profiles for all using (public.is_admin());

create policy "anyone can enquire" on public.enquiries for insert with check (true);
create policy "admin enquiries" on public.enquiries for all using (public.is_admin());

create policy "batches readable" on public.batches for select using (true);
create policy "admin batches" on public.batches for all using (public.is_admin());

create policy "own enrolments read" on public.enrolments for select using (user_id = auth.uid() or public.is_admin());
create policy "own enrolment request" on public.enrolments for insert with check (user_id = auth.uid() and status = 'Requested');
create policy "admin enrolments" on public.enrolments for all using (public.is_admin());

create policy "own progress" on public.lab_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin progress read" on public.lab_progress for select using (public.is_admin());

create policy "certificates verifiable" on public.certificates for select using (true);
create policy "admin certificates" on public.certificates for all using (public.is_admin());

-- After you sign up on the site, make yourself admin:
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'abhisekmurugesan@gmail.com');
