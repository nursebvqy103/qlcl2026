-- Enforce one test submission per full_name + unit.
-- Run after resolving any existing duplicate rows with the same normalized values.
CREATE UNIQUE INDEX IF NOT EXISTS kq_test_one_submission_per_person_unit_quiz
ON public.kq_test (
  lower(btrim(full_name)),
  lower(btrim(unit))
);
