"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Award, Lock } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
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
  order_index: number;
}

interface StudentBadge {
  badge_id: string;
  unlocked_at: string;
}

interface BadgesPanelProps {
  userId: string;
}

/**
 * Badges Panel Component
 * Displays achievement badges with unlock status
 */
export function BadgesPanel({ userId }: BadgesPanelProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<StudentBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBadges() {
      try {
        const supabase = createClient();

        // Fetch all badges
        const { data: badgesData, error: badgesError } = await supabase
          .from("badges")
          .select("*")
          .order("order_index");

        if (badgesError) {
          console.error("Error fetching badges:", badgesError);
          return;
        }

        setBadges(badgesData || []);

        // Fetch user's unlocked badges
        const { data: unlockedData, error: unlockedError } = await supabase
          .from("student_badges")
          .select("badge_id, unlocked_at")
          .eq("student_id", userId);

        if (unlockedError) {
          console.error("Error fetching unlocked badges:", unlockedError);
        } else {
          setUnlockedBadges(unlockedData || []);
        }
      } catch (error) {
        console.error("Error fetching badges:", error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchBadges();
    }
  }, [userId]);

  const isBadgeUnlocked = (badgeId: string) => {
    return unlockedBadges.some(ub => ub.badge_id === badgeId);
  };

  const getUnlockText = (condition: Badge["unlock_condition"]) => {
    switch (condition.type) {
      case "lessons_completed":
        return `Complete ${condition.count} lesson${condition.count !== 1 ? 's' : ''}`;
      case "world_completed":
        return `Complete all ${condition.world_slug?.replace('-', ' ')} lessons`;
      case "total_xp":
        return `Earn ${condition.amount} total XP`;
      case "total_coins":
        return `Earn ${condition.amount} total coins`;
      case "level_reached":
        return `Reach level ${condition.level}`;
      case "streak":
        return `${condition.days} day streak`;
      case "perfect_lessons":
        return `Get 100% on ${condition.count} lessons without hints`;
      case "lesson_speed":
        return `Complete a lesson in under ${condition.minutes} minutes`;
      case "time_based":
        if (condition.hour_after) {
          return `Complete ${condition.count} lessons after ${condition.hour_after}:00`;
        }
        if (condition.hour_before) {
          return `Complete ${condition.count} lessons before ${condition.hour_before}:00`;
        }
        return "Time-based achievement";
      case "weekend_lessons":
        return `Complete ${condition.count} lessons on weekends`;
      case "worlds_explored":
        return `Try all ${condition.count} coding worlds`;
      case "shop_purchases":
        return `Purchase ${condition.count} items from the shop`;
      default:
        return "Secret achievement";
    }
  };

  const unlockedCount = unlockedBadges.length;
  const totalCount = badges.length;
  const unlockPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="bg-background rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">Badges</h2>
        </div>
        <p className="text-muted-foreground">Loading badges...</p>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-xl border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">Badges</h2>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-500">
            {unlockedCount}/{totalCount}
          </div>
          <div className="text-sm text-muted-foreground">{unlockPercentage}% unlocked</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 bg-muted rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full transition-all duration-500"
          style={{ width: `${unlockPercentage}%` }}
        />
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {badges.map((badge) => {
          const unlocked = isBadgeUnlocked(badge.id);

          return (
            <div
              key={badge.id}
              className={`relative rounded-xl p-4 border-2 transition-all ${
                unlocked
                  ? "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-400 shadow-lg"
                  : "bg-muted border-muted-foreground/20 opacity-60"
              }`}
            >
              {/* Badge Icon */}
              <div className="text-center mb-2">
                <div className={`text-4xl mb-1 ${unlocked ? "" : "grayscale"}`}>
                  {unlocked ? badge.icon : "🔒"}
                </div>
              </div>

              {/* Badge Name */}
              <div className="text-center">
                <div className={`font-bold text-sm mb-1 ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                  {badge.name}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {unlocked ? badge.description : getUnlockText(badge.unlock_condition)}
                </div>
              </div>

              {/* Unlock indicator */}
              {unlocked && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
              )}

              {!unlocked && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                  <Lock className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {badges.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No badges available yet.</p>
        </div>
      )}

      {/* Motivation Text */}
      {unlockedCount === 0 && badges.length > 0 && (
        <div className="mt-6 text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            🎯 Start completing lessons to unlock your first badge!
          </p>
        </div>
      )}

      {unlockedCount > 0 && unlockedCount < totalCount && (
        <div className="mt-6 text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            🔥 Keep going! {totalCount - unlockedCount} more badge{totalCount - unlockedCount !== 1 ? 's' : ''} to unlock!
          </p>
        </div>
      )}

      {unlockedCount === totalCount && totalCount > 0 && (
        <div className="mt-6 text-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-lg border-2 border-yellow-400">
          <p className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
            🏆 Amazing! You&apos;ve unlocked all badges!
          </p>
        </div>
      )}
    </div>
  );
}
