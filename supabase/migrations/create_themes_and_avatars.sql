-- Create themes table
CREATE TABLE IF NOT EXISTS public.themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  preview_colors JSONB NOT NULL, -- {primary: "#color", secondary: "#color", background: "#color"}
  is_premium BOOLEAN DEFAULT false,
  unlock_requirement TEXT, -- e.g., "Reach level 5", "Complete HTML World"
  coin_cost INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create avatars table
CREATE TABLE IF NOT EXISTS public.avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT NOT NULL, -- The emoji character (e.g., "🦊", "🐼", "🤖")
  category TEXT, -- e.g., "Animals", "Characters", "Objects"
  is_premium BOOLEAN DEFAULT false,
  unlock_requirement TEXT,
  coin_cost INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add selected_theme_id and selected_avatar_id to students table
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS selected_theme_id UUID REFERENCES public.themes(id),
ADD COLUMN IF NOT EXISTS selected_avatar_id UUID REFERENCES public.avatars(id);

-- Insert default themes
INSERT INTO public.themes (name, description, preview_colors, is_premium, coin_cost) VALUES
('Ocean Blue', 'Cool and calming blue tones', '{"primary": "#3b82f6", "secondary": "#06b6d4", "background": "#f0f9ff"}', false, 0),
('Forest Green', 'Fresh and natural green theme', '{"primary": "#10b981", "secondary": "#22c55e", "background": "#f0fdf4"}', false, 50),
('Sunset Orange', 'Warm and energetic orange theme', '{"primary": "#f59e0b", "secondary": "#f97316", "background": "#fff7ed"}', false, 100),
('Royal Purple', 'Elegant and mysterious purple', '{"primary": "#8b5cf6", "secondary": "#a855f7", "background": "#faf5ff"}', false, 150),
('Rose Pink', 'Sweet and playful pink theme', '{"primary": "#ec4899", "secondary": "#f472b6", "background": "#fdf2f8"}', false, 200),
('Midnight Dark', 'Sleek dark mode theme', '{"primary": "#6366f1", "secondary": "#818cf8", "background": "#1e1b4b"}', true, 500),
('Golden Luxury', 'Premium gold and black theme', '{"primary": "#fbbf24", "secondary": "#f59e0b", "background": "#78350f"}', true, 1000);

-- Insert default avatars
INSERT INTO public.avatars (name, emoji, category, is_premium, coin_cost) VALUES
-- Free Animals
('Fox', '🦊', 'Animals', false, 0),
('Panda', '🐼', 'Animals', false, 0),
('Lion', '🦁', 'Animals', false, 0),
('Koala', '🐨', 'Animals', false, 0),
('Tiger', '🐯', 'Animals', false, 50),
('Bear', '🐻', 'Animals', false, 50),
('Rabbit', '🐰', 'Animals', false, 50),
('Frog', '🐸', 'Animals', false, 50),
-- Characters
('Robot', '🤖', 'Characters', false, 100),
('Alien', '👽', 'Characters', false, 100),
('Ninja', '🥷', 'Characters', false, 150),
('Wizard', '🧙', 'Characters', false, 150),
('Superhero', '🦸', 'Characters', false, 200),
('Pirate', '🏴‍☠️', 'Characters', false, 200),
-- Premium
('Dragon', '🐉', 'Premium', true, 500),
('Unicorn', '🦄', 'Premium', true, 500),
('Phoenix', '🔥🦅', 'Premium', true, 750),
('Crown', '👑', 'Premium', true, 1000);

-- Enable RLS
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Everyone can view themes and avatars
CREATE POLICY "Anyone can view themes"
  ON public.themes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view avatars"
  ON public.avatars FOR SELECT
  USING (true);

-- Add comments
COMMENT ON TABLE public.themes IS 'Available color themes for student customization';
COMMENT ON TABLE public.avatars IS 'Available avatar options for student profiles';
COMMENT ON COLUMN public.students.selected_theme_id IS 'Currently selected theme for the student';
COMMENT ON COLUMN public.students.selected_avatar_id IS 'Currently selected avatar for the student';
