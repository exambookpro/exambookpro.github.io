-- ExamBook Pro permanent question metadata rules
-- Run/keep in sync with the production schema.

alter table public.questions
  add column if not exists question_type text not null default 'exam_level',
  add column if not exists exam_year integer,
  add column if not exists source_exam text;

alter table public.questions
  drop constraint if exists questions_question_type_check;
alter table public.questions
  add constraint questions_question_type_check
  check (question_type in ('exam_level','pyq','practice'));

alter table public.questions
  drop constraint if exists questions_exam_year_check;
alter table public.questions
  add constraint questions_exam_year_check
  check (exam_year is null or (exam_year >= 1900 and exam_year <= 2100));

alter table public.questions
  drop constraint if exists questions_source_metadata_check;
alter table public.questions
  add constraint questions_source_metadata_check
  check (
    (question_type = 'exam_level' and source_exam is not null and length(trim(source_exam)) > 0)
    or (question_type = 'pyq' and source_exam is not null and length(trim(source_exam)) > 0 and exam_year is not null)
    or (question_type = 'practice')
  );

alter table public.questions
  drop constraint if exists questions_question_nonempty;
alter table public.questions
  add constraint questions_question_nonempty check (length(trim(question)) > 0);

alter table public.questions
  drop constraint if exists questions_options_nonempty;
alter table public.questions
  add constraint questions_options_nonempty check (
    length(trim(option_a)) > 0 and length(trim(option_b)) > 0
    and length(trim(option_c)) > 0 and length(trim(option_d)) > 0
  );

comment on column public.questions.question_type is 'exam_level = real competitive-exam pattern; pyq = verified previous-year question; practice = practice question.';
comment on column public.questions.source_exam is 'Source competitive exam name, e.g. SSC CGL, CTET, RRB JE.';
comment on column public.questions.exam_year is 'Source exam year for PYQ questions.';
