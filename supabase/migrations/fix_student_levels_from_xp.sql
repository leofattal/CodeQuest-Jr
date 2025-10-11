-- Fix student levels based on their current XP
-- Formula: Level = largest L where 50 * L * (L - 1) <= XP

-- Create a function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level_from_xp(xp_amount INTEGER)
RETURNS INTEGER AS $$
DECLARE
  level INTEGER := 1;
BEGIN
  -- Keep incrementing level while the next level's XP requirement is met
  WHILE (50 * (level + 1) * level) <= xp_amount LOOP
    level := level + 1;
  END LOOP;

  RETURN level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update all student levels based on their current XP
UPDATE public.students
SET level = calculate_level_from_xp(xp);

-- Add comment
COMMENT ON FUNCTION calculate_level_from_xp IS 'Calculate student level from total XP earned. Formula: 50 * level * (level - 1)';
