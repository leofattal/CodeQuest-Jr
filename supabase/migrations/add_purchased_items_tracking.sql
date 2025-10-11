-- Create table to track purchased themes and avatars
CREATE TABLE IF NOT EXISTS public.student_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('theme', 'avatar')),
  item_id UUID NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, item_type, item_id)
);

-- Enable RLS
ALTER TABLE public.student_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can view their own purchases"
  ON public.student_purchases FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own purchases"
  ON public.student_purchases FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Insert free items as already purchased for all existing students
-- This ensures everyone "owns" the free theme and free avatars
INSERT INTO public.student_purchases (student_id, item_type, item_id)
SELECT
  s.id as student_id,
  'theme' as item_type,
  t.id as item_id
FROM public.students s
CROSS JOIN public.themes t
WHERE t.coin_cost = 0
ON CONFLICT (student_id, item_type, item_id) DO NOTHING;

INSERT INTO public.student_purchases (student_id, item_type, item_id)
SELECT
  s.id as student_id,
  'avatar' as item_type,
  a.id as item_id
FROM public.students s
CROSS JOIN public.avatars a
WHERE a.coin_cost = 0
ON CONFLICT (student_id, item_type, item_id) DO NOTHING;

-- Insert currently selected themes/avatars as purchased
INSERT INTO public.student_purchases (student_id, item_type, item_id)
SELECT id, 'theme', selected_theme_id
FROM public.students
WHERE selected_theme_id IS NOT NULL
ON CONFLICT (student_id, item_type, item_id) DO NOTHING;

INSERT INTO public.student_purchases (student_id, item_type, item_id)
SELECT id, 'avatar', selected_avatar_id
FROM public.students
WHERE selected_avatar_id IS NOT NULL
ON CONFLICT (student_id, item_type, item_id) DO NOTHING;

-- Add comments
COMMENT ON TABLE public.student_purchases IS 'Tracks which themes and avatars students have purchased';
COMMENT ON COLUMN public.student_purchases.item_type IS 'Type of item: theme or avatar';
COMMENT ON COLUMN public.student_purchases.item_id IS 'ID of the theme or avatar';
