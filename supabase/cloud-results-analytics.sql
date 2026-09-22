-- ExamBook Pro — cloud result analytics
-- Applied to production as migration: add_cloud_result_analytics

alter table public.test_results
  add column if not exists test_title text,
  add column if not exists attempted integer,
  add column if not exists correct integer,
  add column if not exists wrong integer,
  add column if not exists skipped integer,
  add column if not exists accuracy numeric(6,2),
  add column if not exists time_used_seconds integer;

alter table public.test_results
  add constraint test_results_total_questions_check check (total_questions > 0 and total_questions <= 1000),
  add constraint test_results_attempted_check check (attempted is null or (attempted >= 0 and attempted <= total_questions)),
  add constraint test_results_correct_check check (correct is null or (correct >= 0 and correct <= total_questions)),
  add constraint test_results_wrong_check check (wrong is null or (wrong >= 0 and wrong <= total_questions)),
  add constraint test_results_skipped_check check (skipped is null or (skipped >= 0 and skipped <= total_questions)),
  add constraint test_results_accuracy_check check (accuracy is null or (accuracy >= 0 and accuracy <= 100)),
  add constraint test_results_time_check check (time_used_seconds is null or (time_used_seconds >= 0 and time_used_seconds <= 86400));

create index if not exists test_results_user_created_idx
  on public.test_results(user_id, created_at desc);
