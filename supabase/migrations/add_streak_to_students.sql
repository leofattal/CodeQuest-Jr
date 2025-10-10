-- Add streak tracking to students table
-- Migration: add_streak_to_students

-- Add current_streak and longest_streak columns
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_lesson_date DATE;

-- Add comment
COMMENT ON COLUMN public.students.current_streak IS 'Current consecutive days the student has completed lessons';
COMMENT ON COLUMN public.students.longest_streak IS 'Longest streak ever achieved by the student';
COMMENT ON COLUMN public.students.last_lesson_date IS 'Date of the last completed lesson (for streak calculation)';
