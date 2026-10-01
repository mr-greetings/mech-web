create table if not exists public.portal_state (
  id smallint primary key check (id = 1),
  payload jsonb,
  lock_token text,
  lock_expires_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.portal_state (id, payload)
values (1, null)
on conflict (id) do nothing;

alter table public.portal_state enable row level security;
revoke all on public.portal_state from anon, authenticated;
grant select, insert, update on public.portal_state to service_role;

create or replace function public.acquire_portal_state_lock(p_token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_rows integer;
begin
  update public.portal_state
  set lock_token = p_token,
      lock_expires_at = now() + interval '90 seconds'
  where id = 1
    and (lock_token is null or lock_expires_at < now());

  get diagnostics affected_rows = row_count;
  return affected_rows = 1;
end;
$$;

create or replace function public.release_portal_state_lock(p_token text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.portal_state
  set lock_token = null,
      lock_expires_at = null
  where id = 1 and lock_token = p_token;
$$;

revoke all on function public.acquire_portal_state_lock(text) from public, anon, authenticated;
revoke all on function public.release_portal_state_lock(text) from public, anon, authenticated;
grant execute on function public.acquire_portal_state_lock(text) to service_role;
grant execute on function public.release_portal_state_lock(text) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portal-uploads',
  'portal-uploads',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;