-- Least-privilege for the rate limiter. The SECURITY DEFINER function rl_hit()
-- is the only thing that should touch rate_limits, and only the anon role (the API
-- server's key) needs to call it.
revoke all on table public.rate_limits from anon, authenticated;
revoke execute on function public.rl_hit(text, integer, integer) from authenticated;
