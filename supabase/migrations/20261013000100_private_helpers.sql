-- The role checks the policies use (is_admin, is_writer, is_member) move out of
-- the API's schema: policies keep calling them, but they're no longer reachable
-- as /rest/v1/rpc/… (Supabase's security advisor, lint 0028/0029).
create schema if not exists private;
grant usage on schema private to anon, authenticated;
alter function public.is_admin() set schema private;
alter function public.is_writer() set schema private;
alter function public.is_member() set schema private;
-- guard_profile calls is_admin() by name: let it find it in its new home.
alter function public.guard_profile() set search_path = public, private;
