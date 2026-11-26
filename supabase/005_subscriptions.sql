-- 005: single public lab, subscription entitlements, payments, task submissions.
-- Safe to re-run.

-- Platform settings (the public lab lives here; anyone can read settings marked public).
create table if not exists public.platform_settings (
  key text primary key,
  value text not null,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.platform_settings enable row level security;
drop policy if exists "settings read public" on public.platform_settings;
create policy "settings read public" on public.platform_settings for select using (is_public or public.is_admin());
drop policy if exists "settings admin write" on public.platform_settings;
create policy "settings admin write" on public.platform_settings for all using (public.is_admin()) with check (public.is_admin());
insert into public.platform_settings(key, value, is_public) values ('public_lab', 'playground/python', true)
  on conflict (key) do nothing;

-- Plans: prices in paise, configurable by the admin.
create table if not exists public.subscription_plans (
  id text primary key,
  name text not null,
  description text not null default '',
  price_paise integer not null check (price_paise >= 0),
  period_days integer not null check (period_days > 0),
  features text[] not null default '{}',
  active boolean not null default true,
  sort int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.subscription_plans enable row level security;
drop policy if exists "plans read" on public.subscription_plans;
create policy "plans read" on public.subscription_plans for select using (active or public.is_admin());
drop policy if exists "plans admin" on public.subscription_plans;
create policy "plans admin" on public.subscription_plans for all using (public.is_admin()) with check (public.is_admin());
insert into public.subscription_plans(id, name, description, price_paise, period_days, features, sort) values
  ('monthly', 'Monthly Membership', 'Full lab access, billed every month.', 49900, 30, array['All published laboratories','Graded exercises and submissions','Progress tracking and dashboard','Issue support'], 1),
  ('quarterly', 'Quarterly Membership', 'Everything in Monthly, billed every 3 months.', 129900, 90, array['Everything in Monthly','Quarterly billing'], 2),
  ('annual', 'Annual Membership', 'Everything in Quarterly, billed yearly.', 449900, 365, array['Everything in Quarterly','Annual billing','Certificate on pathway completion'], 3)
  on conflict (id) do nothing;

-- Subscriptions. Students can only read their own; only the server (service role) or the admin writes.
create table if not exists public.subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text references public.subscription_plans(id) on delete set null,
  status text not null default 'pending'
    check (status in ('trial','active','expired','cancelled','pending','payment_failed','suspended')),
  source text not null default 'payment' check (source in ('payment','complimentary','manual')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  note text,
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists subscriptions_user_idx on public.subscriptions(user_id, ends_at desc);
alter table public.subscriptions enable row level security;
drop policy if exists "subs own read" on public.subscriptions;
create policy "subs own read" on public.subscriptions for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "subs admin write" on public.subscriptions;
create policy "subs admin write" on public.subscriptions for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.payment_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text references public.subscription_plans(id) on delete set null,
  provider text not null default 'razorpay',
  order_id text unique,
  payment_id text unique,
  amount_paise integer not null,
  currency text not null default 'INR',
  status text not null default 'created' check (status in ('created','paid','failed','refunded')),
  subscription_id bigint references public.subscriptions(id) on delete set null,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists payments_user_idx on public.payment_transactions(user_id, created_at desc);
alter table public.payment_transactions enable row level security;
drop policy if exists "pay own read" on public.payment_transactions;
create policy "pay own read" on public.payment_transactions for select using (user_id = auth.uid() or public.is_admin());

create table if not exists public.payment_webhook_events (
  event_id text primary key,
  event text not null,
  payload jsonb not null,
  received_at timestamptz not null default now()
);
alter table public.payment_webhook_events enable row level security;
drop policy if exists "webhook admin read" on public.payment_webhook_events;
create policy "webhook admin read" on public.payment_webhook_events for select using (public.is_admin());

-- Entitlement: admin, or a current trial/active subscription, and not suspended.
create or replace function public.has_active_subscription(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles p where p.id = uid and p.role = 'admin')
      or (
        not exists (select 1 from profiles p where p.id = uid and p.status in ('suspended','rejected'))
        and exists (select 1 from subscriptions s where s.user_id = uid and s.status in ('active','trial')
                    and s.starts_at <= now() and (s.ends_at is null or s.ends_at > now()))
      );
$$;
grant execute on function public.has_active_subscription(uuid) to anon, authenticated;

create or replace function public.has_lab_access(lab text)
returns boolean language sql stable security definer set search_path = public as $$
  select lab = (select value from platform_settings where key = 'public_lab')
      or (auth.uid() is not null and public.has_active_subscription(auth.uid())
          and (public.is_admin() or not exists (select 1 from lab_settings ls where ls.lab_id = lab and ls.published = false)));
$$;
grant execute on function public.has_lab_access(text) to anon, authenticated;

-- Mark expired subscriptions when read paths need it (cheap, idempotent).
create or replace function public.expire_subscriptions() returns void
language sql security definer set search_path = public as $$
  update subscriptions set status = 'expired', updated_at = now()
  where status in ('active','trial') and ends_at is not null and ends_at <= now();
$$;
grant execute on function public.expire_subscriptions() to authenticated;

-- Task submissions with automatic or manual evaluation.
create table if not exists public.task_submissions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  lab_id text not null,
  task_id text not null,
  answer text not null check (char_length(answer) <= 20000),
  output text check (char_length(output) <= 20000),
  auto_passed boolean,
  status text not null default 'submitted' check (status in ('submitted','passed','needs_work','approved','rejected')),
  feedback text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists submissions_user_idx on public.task_submissions(user_id, created_at desc);
create index if not exists submissions_status_idx on public.task_submissions(status, created_at desc);
alter table public.task_submissions enable row level security;
drop policy if exists "sub own read" on public.task_submissions;
create policy "sub own read" on public.task_submissions for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "sub own insert" on public.task_submissions;
create policy "sub own insert" on public.task_submissions for insert with check (
  user_id = auth.uid() and status in ('submitted','passed','needs_work') and feedback is null and reviewed_by is null
  and public.has_lab_access(lab_id) and lab_id <> (select value from platform_settings where key = 'public_lab'));
drop policy if exists "sub admin update" on public.task_submissions;
create policy "sub admin update" on public.task_submissions for update using (public.is_admin()) with check (public.is_admin());

-- Students notified when a submission is reviewed or a subscription changes.
create or replace function public.on_submission_reviewed() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.feedback is distinct from old.feedback or new.status is distinct from old.status then
    insert into notifications(user_id, title, body, link)
    values (new.user_id, 'Your submission was reviewed', coalesce(new.feedback, 'Status: ' || new.status), '/dashboard/submissions');
  end if;
  return new;
end $$;
drop trigger if exists on_submission_reviewed on public.task_submissions;
create trigger on_submission_reviewed after update on public.task_submissions for each row execute function public.on_submission_reviewed();

create or replace function public.on_subscription_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status or new.ends_at is distinct from old.ends_at then
    insert into notifications(user_id, title, body, link)
    values (new.user_id,
      case new.status when 'active' then 'Your membership is active' when 'trial' then 'Your trial has started'
        when 'expired' then 'Your membership has expired' when 'cancelled' then 'Your membership was cancelled'
        else 'Membership update: ' || new.status end,
      case when new.ends_at is not null then 'Access until ' || to_char(new.ends_at at time zone 'Asia/Kolkata', 'DD Mon YYYY') else null end,
      '/account/subscription');
  end if;
  return new;
end $$;
drop trigger if exists on_subscription_change on public.subscriptions;
create trigger on_subscription_change after insert or update on public.subscriptions for each row execute function public.on_subscription_change();
