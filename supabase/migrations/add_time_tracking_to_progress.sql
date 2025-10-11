-- Add time_spent_seconds column to student_progress table
-- This tracks how long a student spent on each lesson

ALTER TABLE public.student_progress
ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0;

-- Add a comment to document the column
COMMENT ON COLUMN public.student_progress.time_spent_seconds IS 'Time spent on the lesson in seconds';
