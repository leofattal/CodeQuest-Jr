/**
 * Badge Unlock System
 * Checks if student has met conditions to unlock badges
 */

import { createClient } from "@/lib/supabase/client";

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlock_condition: {
    type: string;
    count?: number;
    amount?: number;
    level?: number;
    world_slug?: string;
    minutes?: number;
    days?: number;
    hour_after?: number;
    hour_before?: number;
  };
}

interface UnlockResult {
  unlockedBadges: string[];
  newBadges: Badge[];
}

/**
 * Check and unlock badges for a student
 * Call this after key events like completing lessons, earning XP/coins, etc.
 */
export async function checkAndUnlockBadges(studentId: string): Promise<UnlockResult> {
  const supabase = createClient();
  const unlockedBadges: string[] = [];
  const newBadges: Badge[] = [];

  try {
    // Fetch all badges
    const { data: allBadges, error: badgesError } = await supabase
      .from("badges")
      .select("*");

    if (badgesError) {
      console.error("Error fetching badges:", badgesError);
      return { unlockedBadges, newBadges };
    }

    // Fetch already unlocked badges
    const { data: studentBadges, error: studentBadgesError } = await supabase
      .from("student_badges")
      .select("badge_id")
      .eq("student_id", studentId);

    if (studentBadgesError) {
      console.error("Error fetching student badges:", studentBadgesError);
      return { unlockedBadges, newBadges };
    }

    const unlockedBadgeIds = new Set(studentBadges?.map(sb => sb.badge_id) || []);

    // Fetch student data
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    if (studentError || !student) {
      console.error("Error fetching student:", studentError);
      return { unlockedBadges, newBadges };
    }

    // Fetch student progress data
    const { data: progress, error: progressError } = await supabase
      .from("student_progress")
      .select("*")
      .eq("student_id", studentId);

    if (progressError) {
      console.error("Error fetching progress:", progressError);
    }

    const completedLessons = progress?.filter(p => p.completed) || [];
    const completedLessonIds = new Set(completedLessons.map(p => p.lesson_id));

    // Check each badge
    for (const badge of allBadges || []) {
      // Skip already unlocked badges
      if (unlockedBadgeIds.has(badge.id)) {
        continue;
      }

      const condition = badge.unlock_condition;
      let shouldUnlock = false;

      switch (condition.type) {
        case "lessons_completed":
          shouldUnlock = completedLessons.length >= (condition.count || 0);
          break;

        case "total_xp":
          shouldUnlock = student.xp >= (condition.amount || 0);
          break;

        case "total_coins":
          shouldUnlock = student.coins >= (condition.amount || 0);
          break;

        case "level_reached":
          shouldUnlock = student.level >= (condition.level || 0);
          break;

        case "world_completed":
          if (condition.world_slug) {
            // Fetch all lessons in this world
            const { data: worldLessons } = await supabase
              .from("lessons")
              .select("id, world_id")
              .eq("world_id", (
                await supabase
                  .from("worlds")
                  .select("id")
                  .eq("slug", condition.world_slug)
                  .single()
              ).data?.id || "");

            if (worldLessons && worldLessons.length > 0) {
              shouldUnlock = worldLessons.every(lesson =>
                completedLessonIds.has(lesson.id)
              );
            }
          }
          break;

        case "perfect_lessons":
          const perfectLessons = completedLessons.filter(p =>
            p.score === 100 && !p.hints_used
          );
          shouldUnlock = perfectLessons.length >= (condition.count || 0);
          break;

        case "lesson_speed":
          // Check if any lesson was completed under the time limit
          const fastLessons = completedLessons.filter(p => {
            if (!p.time_spent || !condition.minutes) return false;
            return p.time_spent < condition.minutes * 60; // Convert minutes to seconds
          });
          shouldUnlock = fastLessons.length > 0;
          break;

        case "streak":
          // Check current streak (this would need to be tracked in student table)
          shouldUnlock = (student.current_streak || 0) >= (condition.days || 0);
          break;

        case "time_based":
          if (condition.hour_after || condition.hour_before) {
            // Count lessons completed in time range
            const lessonsInTimeRange = completedLessons.filter(p => {
              if (!p.completed_at) return false;
              const hour = new Date(p.completed_at).getHours();

              if (condition.hour_after) {
                return hour >= condition.hour_after;
              }
              if (condition.hour_before) {
                return hour < condition.hour_before;
              }
              return false;
            });
            shouldUnlock = lessonsInTimeRange.length >= (condition.count || 0);
          }
          break;

        case "weekend_lessons":
          const weekendLessons = completedLessons.filter(p => {
            if (!p.completed_at) return false;
            const day = new Date(p.completed_at).getDay();
            return day === 0 || day === 6; // Sunday or Saturday
          });
          shouldUnlock = weekendLessons.length >= (condition.count || 0);
          break;

        case "worlds_explored":
          // Count unique worlds where student has completed at least one lesson
          const uniqueWorldIds = new Set<string>();
          for (const p of completedLessons) {
            const { data: lesson } = await supabase
              .from("lessons")
              .select("world_id")
              .eq("id", p.lesson_id)
              .single();
            if (lesson) {
              uniqueWorldIds.add(lesson.world_id);
            }
          }
          shouldUnlock = uniqueWorldIds.size >= (condition.count || 0);
          break;

        case "shop_purchases":
          const { data: inventory } = await supabase
            .from("student_inventory")
            .select("id")
            .eq("student_id", studentId);
          shouldUnlock = (inventory?.length || 0) >= (condition.count || 0);
          break;

        default:
          // Unknown badge type
          break;
      }

      // Unlock the badge if condition is met
      if (shouldUnlock) {
        const { error: insertError } = await supabase
          .from("student_badges")
          .insert({
            student_id: studentId,
            badge_id: badge.id,
          });

        if (!insertError) {
          unlockedBadges.push(badge.id);
          newBadges.push(badge);
        }
      }
    }

    return { unlockedBadges, newBadges };
  } catch (error) {
    console.error("Error checking badge unlocks:", error);
    return { unlockedBadges, newBadges };
  }
}
