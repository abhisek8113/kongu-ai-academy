-- Kongu AI Academy — activity log (run once in Supabase → SQL Editor, after schema.sql)

create table if not exists public.activity_log (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  actor text,                -- name or email shown in the admin feed
  action text not null,      -- signup, login, logout, lab_open, colab_open, lab_complete, lab_undo, enquiry, enrol_request, admin_*
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists activity_log_created_idx on public.activity_log (created_at desc);
create index if not exists activity_log_user_idx on public.activity_log (user_id, created_at desc);
create index if not exists activity_log_action_idx on public.activity_log (action);

-- last time each person was seen
alter table public.profiles add column if not exists last_seen_at timestamptz;
alter table public.profiles add column if not exists email text;

-- keep the email on the profile so the admin can see it
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, institution, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone',
          new.raw_user_meta_data->>'institution', new.email);
  insert into public.activity_log (user_id, actor, action, meta)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'signup',
          jsonb_build_object('institution', new.raw_user_meta_data->>'institution'));
  return new;
end; $$;

update public.profiles p set email = u.email from auth.users u where u.id = p.id and p.email is null;

alter table public.activity_log enable row level security;

-- anyone may add an event about themselves (or an anonymous one, e.g. a demo request)
create policy "insert own activity" on public.activity_log for insert
  with check (user_id is null or user_id = auth.uid());
-- only admins read the log
create policy "admin reads activity" on public.activity_log for select using (public.is_admin());

-- signed-in users update their own last_seen_at (the role guard trigger still blocks role changes)
