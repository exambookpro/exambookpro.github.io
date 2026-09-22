-- ExamBook Pro — production RLS hardening
-- This file mirrors the production policy model applied to the Supabase project.
-- Never put service_role/secret keys in the website.

create schema if not exists private;

alter table if exists public.profiles enable row level security;
alter table if exists public.tests enable row level security;
alter table if exists public.questions enable row level security;
alter table if exists public.test_results enable row level security;

-- Admin check is kept in a non-exposed schema and is callable only by authenticated users.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and is_admin = true
  );
$function$;

revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- Profiles: users can read only their own profile. No client-side update policy is exposed,
-- because is_admin must never be writable by a normal user.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;

-- Tests: public read; authenticated admin-only writes.
drop policy if exists "tests_public_select" on public.tests;
create policy "tests_public_select"
on public.tests for select to anon, authenticated
using (true);

drop policy if exists "tests_admin_insert" on public.tests;
create policy "tests_admin_insert"
on public.tests for insert to authenticated
with check ((select private.is_admin()));

drop policy if exists "tests_admin_update" on public.tests;
create policy "tests_admin_update"
on public.tests for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "tests_admin_delete" on public.tests;
create policy "tests_admin_delete"
on public.tests for delete to authenticated
using ((select private.is_admin()));

-- Questions: public read; authenticated admin-only writes.
drop policy if exists "questions_public_select" on public.questions;
create policy "questions_public_select"
on public.questions for select to anon, authenticated
using (true);

drop policy if exists "questions_admin_insert" on public.questions;
create policy "questions_admin_insert"
on public.questions for insert to authenticated
with check ((select private.is_admin()));

drop policy if exists "questions_admin_update" on public.questions;
create policy "questions_admin_update"
on public.questions for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "questions_admin_delete" on public.questions;
create policy "questions_admin_delete"
on public.questions for delete to authenticated
using ((select private.is_admin()));

-- Results: users can create and read their own result rows.
-- Update/delete are intentionally not exposed from the browser so scores cannot be edited later.
drop policy if exists "results_insert_own" on public.test_results;
create policy "results_insert_own"
on public.test_results for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "results_select_own_or_admin" on public.test_results;
create policy "results_select_own_or_admin"
on public.test_results for select to authenticated
using ((select private.is_admin()) or (select auth.uid()) = user_id);

drop policy if exists "results_update_own" on public.test_results;
drop policy if exists "results_delete_own" on public.test_results;
drop policy if exists "results_delete_own_or_admin" on public.test_results;

-- Performance indexes used by RLS/foreign-key lookups.
create index if not exists questions_test_id_idx on public.questions(test_id);
create index if not exists test_results_user_id_idx on public.test_results(user_id);

-- Keep the user-creation trigger private from the Data API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon, authenticated;
