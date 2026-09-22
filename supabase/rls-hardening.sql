-- ExamBook Pro — Supabase RLS hardening
-- Apply this in Supabase SQL Editor after confirming the three tables/columns exist.
-- Do NOT put service_role/secret keys in the website.

alter table if exists public.tests enable row level security;
alter table if exists public.questions enable row level security;
alter table if exists public.test_results enable row level security;

drop policy if exists "public can read tests" on public.tests;
create policy "public can read tests"
on public.tests for select
to anon, authenticated
using (true);

drop policy if exists "admin can insert tests" on public.tests;
create policy "admin can insert tests"
on public.tests for insert
to authenticated
with check ((select auth.jwt()->>'email') = 'aashuraj3541@gmail.com');

drop policy if exists "admin can update tests" on public.tests;
create policy "admin can update tests"
on public.tests for update
to authenticated
using ((select auth.jwt()->>'email') = 'aashuraj3541@gmail.com')
with check ((select auth.jwt()->>'email') = 'aashuraj3541@gmail.com');

drop policy if exists "admin can delete tests" on public.tests;
create policy "admin can delete tests"
on public.tests for delete
to authenticated
using ((select auth.jwt()->>'email') = 'aashuraj3541@gmail.com');

drop policy if exists "public can read questions" on public.questions;
create policy "public can read questions"
on public.questions for select
to anon, authenticated
using (true);

drop policy if exists "admin can insert questions" on public.questions;
create policy "admin can insert questions"
on public.questions for insert
to authenticated
with check ((select auth.jwt()->>'email') = 'aashuraj3541@gmail.com');

drop policy if exists "admin can update questions" on public.questions;
create policy "admin can update questions"
on public.questions for update
to authenticated
using ((select auth.jwt()->>'email') = 'aashuraj3541@gmail.com')
with check ((select auth.jwt()->>'email') = 'aashuraj3541@gmail.com');

drop policy if exists "admin can delete questions" on public.questions;
create policy "admin can delete questions"
on public.questions for delete
to authenticated
using ((select auth.jwt()->>'email') = 'aashuraj3541@gmail.com');

drop policy if exists "users can insert own results" on public.test_results;
create policy "users can insert own results"
on public.test_results for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "users can read own results" on public.test_results;
create policy "users can read own results"
on public.test_results for select
to authenticated
using ((select auth.uid()) = user_id or (select auth.jwt()->>'email') = 'aashuraj3541@gmail.com');

drop policy if exists "admin can delete results" on public.test_results;
create policy "admin can delete results"
on public.test_results for delete
to authenticated
using ((select auth.jwt()->>'email') = 'aashuraj3541@gmail.com');

-- Recommended: revoke broad client grants if your app does not need them,
-- then grant only the operations represented by the policies above.
