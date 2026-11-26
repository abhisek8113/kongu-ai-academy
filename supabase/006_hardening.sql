-- 006: hardening + membership requests + extra issue categories.

-- notify_admins is internal (used by triggers); students must not call it directly.
revoke execute on function public.notify_admins(text, text, text) from public, anon, authenticated;

-- Signed-in students may submit for any lab they can access (including the public one).
drop policy if exists "sub own insert" on public.task_submissions;
create policy "sub own insert" on public.task_submissions for insert with check (
  user_id = auth.uid() and status in ('submitted','passed','needs_work') and feedback is null and reviewed_by is null
  and public.has_lab_access(lab_id));

-- A student asks for membership while online payments are pending; max one request per day.
create or replace function public.request_membership(plan text) returns text
language plpgsql security definer set search_path = public as $$
declare who text;
begin
  if auth.uid() is null then raise exception 'login required'; end if;
  if exists (select 1 from activity_log where user_id = auth.uid() and action = 'membership_request' and created_at > now() - interval '1 day') then
    return 'already';
  end if;
  select coalesce(full_name, email) into who from profiles where id = auth.uid();
  insert into activity_log(user_id, actor, action, meta) values (auth.uid(), who, 'membership_request', jsonb_build_object('plan', left(plan, 40)));
  perform notify_admins('Membership request', coalesce(who, 'A student') || ' requested ' || left(plan, 40), '/admin/subscriptions');
  return 'ok';
end $$;
revoke execute on function public.request_membership(text) from public, anon;
grant execute on function public.request_membership(text) to authenticated;

alter table public.support_tickets drop constraint if exists support_tickets_category_check;
alter table public.support_tickets add constraint support_tickets_category_check check (category in (
  'Laboratory not loading','Code execution failure','Incorrect output','Login problem','Logout problem','Access problem',
  'Payment issue','Dataset issue','Task submission issue','Website performance','Other technical issue','General query'));
