-- Kongu AI Academy — support tickets, announcements, notifications, lab executions, lab publishing.
-- Safe to run more than once.

-- Accounts can now also be suspended by the admin.
alter table public.profiles drop constraint if exists profiles_status_check;
alter table public.profiles add constraint profiles_status_check check (status in ('pending','approved','rejected','suspended'));
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- Students may read their own activity (recently opened labs on the dashboard).
drop policy if exists "own activity read" on public.activity_log;
create policy "own activity read" on public.activity_log for select using (user_id = auth.uid());

-- ───────────── Lab publishing ─────────────
create table if not exists public.lab_settings (
  lab_id text primary key,                 -- e.g. classical-ml/lab-04-knn-iris, ai-03, playground/python
  published boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.lab_settings enable row level security;
drop policy if exists "lab settings readable" on public.lab_settings;
create policy "lab settings readable" on public.lab_settings for select using (true);
drop policy if exists "admin lab settings" on public.lab_settings;
create policy "admin lab settings" on public.lab_settings for all using (public.is_admin()) with check (public.is_admin());

-- ───────────── Code executions (in-browser playgrounds) ─────────────
create table if not exists public.lab_executions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  lab_id text not null,
  ok boolean not null,
  error text,
  duration_ms int,
  created_at timestamptz not null default now()
);
create index if not exists lab_exec_lab_idx on public.lab_executions (lab_id, created_at desc);
create index if not exists lab_exec_fail_idx on public.lab_executions (ok, created_at desc);
alter table public.lab_executions enable row level security;
drop policy if exists "own executions" on public.lab_executions;
create policy "own executions" on public.lab_executions for insert with check (user_id = auth.uid());
drop policy if exists "own executions read" on public.lab_executions;
create policy "own executions read" on public.lab_executions for select using (user_id = auth.uid() or public.is_admin());

-- ───────────── Support tickets ─────────────
create table if not exists public.support_tickets (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  student_name text,
  lab text,
  category text not null check (category in ('Laboratory not loading','Code execution failure','Incorrect output','Login problem','Access problem','Website performance','Other technical issue')),
  severity text not null default 'Medium' check (severity in ('Low','Medium','High','Critical')),
  description text not null check (char_length(description) between 5 and 4000),
  error_message text check (char_length(error_message) <= 4000),
  browser text check (char_length(browser) <= 400),
  page_url text check (char_length(page_url) <= 400),
  status text not null default 'New' check (status in ('New','Under Review','In Progress','Waiting for Student','Resolved','Closed')),
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists tickets_status_idx on public.support_tickets (status, created_at desc);
create index if not exists tickets_user_idx on public.support_tickets (user_id, created_at desc);
alter table public.support_tickets enable row level security;
drop policy if exists "own tickets read" on public.support_tickets;
create policy "own tickets read" on public.support_tickets for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "own tickets create" on public.support_tickets;
create policy "own tickets create" on public.support_tickets for insert with check (user_id = auth.uid() and status = 'New' and assigned_to is null);
drop policy if exists "admin tickets" on public.support_tickets;
create policy "admin tickets" on public.support_tickets for update using (public.is_admin()) with check (public.is_admin());

create table if not exists public.support_ticket_messages (
  id bigint generated always as identity primary key,
  ticket_id bigint not null references public.support_tickets(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_name text,
  body text not null check (char_length(body) between 1 and 4000),
  internal boolean not null default false,       -- admin-only notes, never shown to students
  created_at timestamptz not null default now()
);
create index if not exists ticket_msgs_idx on public.support_ticket_messages (ticket_id, created_at);
alter table public.support_ticket_messages enable row level security;
drop policy if exists "read ticket messages" on public.support_ticket_messages;
create policy "read ticket messages" on public.support_ticket_messages for select using (
  public.is_admin() or (internal = false and exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid())));
drop policy if exists "student reply" on public.support_ticket_messages;
create policy "student reply" on public.support_ticket_messages for insert with check (
  author_id = auth.uid() and internal = false and exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid()));
drop policy if exists "admin messages" on public.support_ticket_messages;
create policy "admin messages" on public.support_ticket_messages for insert with check (public.is_admin() and author_id = auth.uid());

-- ───────────── Announcements ─────────────
create table if not exists public.announcements (
  id bigint generated always as identity primary key,
  title text not null check (char_length(title) between 3 and 160),
  body text not null check (char_length(body) between 1 and 4000),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.announcements enable row level security;
drop policy if exists "read announcements" on public.announcements;
create policy "read announcements" on public.announcements for select using ((published and auth.uid() is not null) or public.is_admin());
drop policy if exists "admin announcements" on public.announcements;
create policy "admin announcements" on public.announcements for all using (public.is_admin()) with check (public.is_admin());

-- ───────────── In-app notifications ─────────────
create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notif_user_idx on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;
drop policy if exists "own notifications" on public.notifications;
create policy "own notifications" on public.notifications for select using (user_id = auth.uid());
drop policy if exists "own notifications read mark" on public.notifications;
create policy "own notifications read mark" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Helper: notify the admin(s)
create or replace function public.notify_admins(t text, b text, l text) returns void
language sql security definer set search_path = public as $$
  insert into public.notifications (user_id, title, body, link)
  select id, t, b, l from public.profiles where role = 'admin';
$$;

-- New registration → admin + welcome note to the student
create or replace function public.on_profile_created() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role <> 'admin' then
    perform public.notify_admins('New student registration', coalesce(new.full_name, new.email, 'A new student') || ' signed up and is awaiting approval.', '/admin/students?sort=pending');
    insert into public.notifications (user_id, title, body, link)
    values (new.id, 'Welcome to Kongu AI Academy', 'Your account has been created and is awaiting approval. You can read every lesson meanwhile.', '/dashboard');
  end if;
  return new;
end; $$;
drop trigger if exists profile_created_notify on public.profiles;
create trigger profile_created_notify after insert on public.profiles for each row execute function public.on_profile_created();

-- Approval / suspension → tell the student
create or replace function public.on_profile_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status and public.is_admin() then
    insert into public.notifications (user_id, title, body, link) values (new.id,
      case new.status when 'approved' then 'Your account is approved' when 'suspended' then 'Your account has been suspended'
                      when 'rejected' then 'Your account was not approved' else 'Account status updated' end,
      case new.status when 'approved' then 'You now have access to all published labs.' else 'Contact us on WhatsApp +91 95145 24599 if you have questions.' end,
      '/dashboard');
  end if;
  new.updated_at := now();
  return new;
end; $$;
drop trigger if exists profile_status_notify on public.profiles;
create trigger profile_status_notify before update on public.profiles for each row execute function public.on_profile_status();

-- New ticket → admin
create or replace function public.on_ticket_created() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_admins(
    case when new.severity in ('High','Critical') then '⚠ ' else '' end || 'New issue #' || new.id || ': ' || new.category,
    coalesce(new.student_name, 'A student') || coalesce(' · ' || new.lab, ''), '/admin/issues/' || new.id);
  return new;
end; $$;
drop trigger if exists ticket_created_notify on public.support_tickets;
create trigger ticket_created_notify after insert on public.support_tickets for each row execute function public.on_ticket_created();

-- Ticket status change → student; keep resolved_at / updated_at right
create or replace function public.on_ticket_updated() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if new.status in ('Resolved','Closed') and old.status not in ('Resolved','Closed') then new.resolved_at := now(); end if;
  if new.status not in ('Resolved','Closed') then new.resolved_at := null; end if;
  if new.status is distinct from old.status then
    insert into public.notifications (user_id, title, body, link)
    values (new.user_id, 'Issue #' || new.id || ' is now ' || new.status, new.category, '/dashboard/issues/' || new.id);
  end if;
  return new;
end; $$;
drop trigger if exists ticket_updated on public.support_tickets;
create trigger ticket_updated before update on public.support_tickets for each row execute function public.on_ticket_updated();

-- New message → the other side (internal notes notify nobody)
create or replace function public.on_ticket_message() returns trigger
language plpgsql security definer set search_path = public as $$
declare owner uuid;
begin
  if new.internal then return new; end if;
  select user_id into owner from public.support_tickets where id = new.ticket_id;
  if new.author_id = owner then
    perform public.notify_admins('New reply on issue #' || new.ticket_id, left(new.body, 140), '/admin/issues/' || new.ticket_id);
  else
    insert into public.notifications (user_id, title, body, link)
    values (owner, 'Kongu AI Academy replied to issue #' || new.ticket_id, left(new.body, 140), '/dashboard/issues/' || new.ticket_id);
  end if;
  update public.support_tickets set updated_at = now() where id = new.ticket_id;
  return new;
end; $$;
drop trigger if exists ticket_message_notify on public.support_ticket_messages;
create trigger ticket_message_notify after insert on public.support_ticket_messages for each row execute function public.on_ticket_message();

-- Repeated failures in a lab → admin alert (5 failures across students within 10 minutes)
create or replace function public.on_execution() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not new.ok and (select count(*) from public.lab_executions where lab_id = new.lab_id and not ok and created_at > now() - interval '10 minutes') = 5 then
    perform public.notify_admins('⚠ Repeated failures in ' || new.lab_id, '5 failed runs in the last 10 minutes.', '/admin/labs');
  end if;
  return new;
end; $$;
drop trigger if exists execution_alert on public.lab_executions;
create trigger execution_alert after insert on public.lab_executions for each row execute function public.on_execution();
