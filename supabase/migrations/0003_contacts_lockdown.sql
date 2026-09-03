-- Lock down the contacts table. RLS is enabled with no policies (deny-all for the
-- public API roles), and these revokes strip the leftover default grants so the
-- table is fully sealed to anon/authenticated. Writes happen only via the API
-- server using the service-role key, which sits behind the honeypot + rate limit.
-- This also clears the pg_graphql_*_table_exposed advisories for contacts.
revoke all on table public.contacts from anon, authenticated;
