-- Rate limiting for the contact form.
--
-- One tiny table + one function. The function does an ATOMIC check-and-increment
-- (single statement, protected by a Postgres row lock), so a burst of concurrent
-- requests cannot all slip through the check before incrementing — they serialize
-- into 1, 2, 3, … and everything past the limit is rejected. No check-then-act race.
--
-- Apply this in the Supabase SQL editor (or `supabase db push`).

create table if not exists public.rate_limits (
  key          text primary key,
  count        integer     not null default 0,
  window_start timestamptz not null default now()
);

-- Lock the table down: with RLS on and NO policies, the anon/public roles cannot
-- read or write it directly. Only the SECURITY DEFINER function below can touch it.
alter table public.rate_limits enable row level security;

-- Atomic "register one hit against p_key" within a fixed window of p_window_seconds.
-- Returns whether the caller is allowed, and how many seconds until the window resets.
create or replace function public.rl_hit(
  p_key            text,
  p_limit          integer,
  p_window_seconds integer
)
returns table(allowed boolean, retry_after integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_start timestamptz;
begin
  insert into public.rate_limits(key, count, window_start)
    values (p_key, 1, now())
  on conflict (key) do update
    set
      -- If the previous window has expired, start a fresh one at 1; otherwise +1.
      count = case
        when public.rate_limits.window_start
             < now() - make_interval(secs => p_window_seconds)
        then 1
        else public.rate_limits.count + 1
      end,
      window_start = case
        when public.rate_limits.window_start
             < now() - make_interval(secs => p_window_seconds)
        then now()
        else public.rate_limits.window_start
      end
  returning count, window_start into v_count, v_start;

  if v_count > p_limit then
    return query
      select false,
             ceil(extract(epoch from
               (v_start + make_interval(secs => p_window_seconds) - now())))::integer;
  else
    return query select true, 0;
  end if;
end;
$$;

-- anon can EXECUTE the function (that's how the API server, using the anon key,
-- registers hits) but has no direct access to the table.
revoke all on function public.rl_hit(text, integer, integer) from public;
grant execute on function public.rl_hit(text, integer, integer) to anon, authenticated, service_role;

-- Optional housekeeping: rows for IPs that never return just sit idle. If you have
-- pg_cron enabled you can sweep them, otherwise it's harmless (one row per IP/window):
--   select cron.schedule('rl-sweep', '0 * * * *',
--     $$delete from public.rate_limits where window_start < now() - interval '1 day'$$);
