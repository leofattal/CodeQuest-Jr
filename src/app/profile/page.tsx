"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/common/PageTransition";
import { BadgesPanel } from "@/components/profile/BadgesPanel";
import { ThemeSelector } from "@/components/profile/ThemeSelector";
import { AvatarSelector } from "@/components/profile/AvatarSelector";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Coins,
  Trophy,
  Star,
  Target,
  Award,
  Flame,
  BookOpen,
  Palette,
  Smile,
  Calendar,
  Clock,
  TrendingUp,
  MapPin,
  Zap
} from "lucide-react";

/**
 * Profile Page
 * Displays user stats, achievements, and badges
 */
export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"stats" | "customize">("stats");
  const [stats, setStats] = useState({
    lessonsCompleted: 0,
    worldsUnlocked: 0,
    badgesEarned: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [skillLevels, setSkillLevels] = useState({
    html: 0,
    css: 0,
    javascript: 0
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    completed_at: string;
    coins_earned: number;
    xp_earned: number;
    lesson: { title: string; id: string };
    world: { name: string; icon: string };
  }>>([]);
  const [worldProgress, setWorldProgress] = useState<Array<{
    id: string;
    name: string;
    icon: string;
    totalLessons: number;
    completedLessons: number;
    percentage: number;
  }>>([]);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;

      try {
        const supabase = createClient();

        // Fetch completed lessons count
        const { count: lessonsCount } = await supabase
          .from("student_progress")
          .select("*", { count: "exact", head: true })
          .eq("student_id", user.id)
          .eq("completed", true);

        // Fetch unlocked worlds (worlds with at least one completed lesson)
        const { data: worldsData } = await supabase
          .from("student_progress")
          .select("world_id")
          .eq("student_id", user.id)
          .eq("completed", true);

        const uniqueWorldsCount = worldsData
          ? new Set(worldsData.map(w => w.world_id)).size
          : 0;

        // Fetch earned badges count
        const { count: badgesCount } = await supabase
          .from("student_badges")
          .select("*", { count: "exact", head: true })
          .eq("student_id", user.id);

        setStats({
          lessonsCompleted: lessonsCount || 0,
          worldsUnlocked: uniqueWorldsCount,
          badgesEarned: badgesCount || 0
        });

        // Fetch skill levels based on completed lessons by world
        const { data: htmlLessons } = await supabase
          .from("student_progress")
          .select("lesson_id")
          .eq("student_id", user.id)
          .eq("completed", true)
          .in("world_id", [
            (await supabase.from("worlds").select("id").eq("slug", "html-world").single()).data?.id || ""
          ]);

        const { data: cssLessons } = await supabase
          .from("student_progress")
          .select("lesson_id")
          .eq("student_id", user.id)
          .eq("completed", true)
          .in("world_id", [
            (await supabase.from("worlds").select("id").eq("slug", "css-world").single()).data?.id || ""
          ]);

        const { data: jsLessons } = await supabase
          .from("student_progress")
          .select("lesson_id")
          .eq("student_id", user.id)
          .eq("completed", true)
          .in("world_id", [
            (await supabase.from("worlds").select("id").eq("slug", "javascript-world").single()).data?.id || ""
          ]);

        // Each world has 15 lessons, 3 lessons = 1 skill level
        setSkillLevels({
          html: Math.min(5, Math.floor((htmlLessons?.length || 0) / 3)),
          css: Math.min(5, Math.floor((cssLessons?.length || 0) / 3)),
          javascript: Math.min(5, Math.floor((jsLessons?.length || 0) / 3))
        });

        // Fetch recent activity (last 5 completed lessons)
        const { data: recentData } = await supabase
          .from("student_progress")
          .select(`
            completed_at,
            coins_earned,
            xp_earned,
            lesson_id,
            world_id
          `)
          .eq("student_id", user.id)
          .eq("completed", true)
          .order("completed_at", { ascending: false })
          .limit(5);

        if (recentData) {
          // Fetch lesson and world details for each activity
          const activityWithDetails = await Promise.all(
            recentData.map(async (activity) => {
              const { data: lessonData } = await supabase
                .from("lessons")
                .select("title, id")
                .eq("id", activity.lesson_id)
                .single();

              const { data: worldData } = await supabase
                .from("worlds")
                .select("name, icon")
                .eq("id", activity.world_id)
                .single();

              return {
                completed_at: activity.completed_at,
                coins_earned: activity.coins_earned,
                xp_earned: activity.xp_earned,
                lesson: lessonData || { title: "Unknown", id: "" },
                world: worldData || { name: "Unknown", icon: "📚" }
              };
            })
          );
          setRecentActivity(activityWithDetails);
        }

        // Fetch world progress
        const { data: allWorlds } = await supabase
          .from("worlds")
          .select("*")
          .order("order_index");

        if (allWorlds) {
          const progressData = await Promise.all(
            allWorlds.map(async (world) => {
              const { count: totalLessons } = await supabase
                .from("lessons")
                .select("*", { count: "exact", head: true })
                .eq("world_id", world.id);

              const { count: completedLessons } = await supabase
                .from("student_progress")
                .select("*", { count: "exact", head: true })
                .eq("student_id", user.id)
                .eq("world_id", world.id)
                .eq("completed", true);

              return {
                ...world,
                totalLessons: totalLessons || 0,
                completedLessons: completedLessons || 0,
                percentage: totalLessons ? Math.round(((completedLessons || 0) / totalLessons) * 100) : 0
              };
            })
          );
          setWorldProgress(progressData);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </PageTransition>
    );
  }

  if (!user || !profile) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <p className="text-muted-foreground">Please log in to view your profile</p>
        </div>
      </PageTransition>
    );
  }

  // Calculate XP required for levels using the same formula as lesson completion
  // Formula: XP = 50 * level * (level - 1)
  const getXPForLevel = (level: number): number => {
    return 50 * level * (level - 1);
  };

  const currentLevelXP = getXPForLevel(profile.level);
  const nextLevelXP = getXPForLevel(profile.level + 1);
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
  const currentLevelProgress = profile.xp - currentLevelXP;
  const xpProgress = (currentLevelProgress / xpNeededForNextLevel) * 100;

  const handleThemeSelect = async () => {
    // Refresh profile to get updated coins
    await refreshProfile();
  };

  const handleAvatarSelect = async () => {
    // Refresh profile to get updated coins and avatar
    await refreshProfile();
  };

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Tab Navigation */}
          <div className="flex gap-2 bg-muted/50 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === "stats"
                  ? "bg-background shadow-sm"
                  : "hover:bg-background/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Stats & Achievements
              </div>
            </button>
            <button
              onClick={() => setActiveTab("customize")}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === "customize"
                  ? "bg-background shadow-sm"
                  : "hover:bg-background/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Customize
              </div>
            </button>
          </div>

          {/* Header Section */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 border border-border">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                {/* Level Badge */}
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-primary to-secondary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-background">
                  {profile.level}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{profile.display_name}</h1>
                <p className="text-muted-foreground mb-4">{profile.email}</p>

                {/* XP Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level {profile.level}</span>
                    <span className="text-muted-foreground">Level {profile.level + 1}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center md:text-left">
                    {Math.max(0, currentLevelProgress)} / {xpNeededForNextLevel} XP to next level
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex md:flex-col gap-4">
                <div className="flex items-center gap-2 bg-background/50 rounded-lg px-4 py-2">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold">{profile.coins}</div>
                    <div className="text-xs text-muted-foreground">Coins</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-background/50 rounded-lg px-4 py-2">
                  <Trophy className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold">{profile.xp}</div>
                    <div className="text-xs text-muted-foreground">Total XP</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === "stats" ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={<Star className="w-6 h-6" />}
                  title="Lessons Completed"
                  value={loadingStats ? "..." : stats.lessonsCompleted.toString()}
                  gradient="from-yellow-500 to-orange-500"
                />
                <StatCard
                  icon={<Target className="w-6 h-6" />}
                  title="Worlds Unlocked"
                  value={loadingStats ? "..." : stats.worldsUnlocked.toString()}
                  gradient="from-blue-500 to-cyan-500"
                />
                <StatCard
                  icon={<Flame className="w-6 h-6" />}
                  title="Current Streak"
                  value={loadingStats ? "..." : `${profile.current_streak || 0} ${(profile.current_streak || 0) === 1 ? 'day' : 'days'}`}
                  gradient="from-red-500 to-pink-500"
                />
                <StatCard
                  icon={<Award className="w-6 h-6" />}
                  title="Badges Earned"
                  value={loadingStats ? "..." : stats.badgesEarned.toString()}
                  gradient="from-purple-500 to-indigo-500"
                />
              </div>

              {/* Badges Panel */}
              {user && <BadgesPanel userId={user.id} />}

              {/* Skills Overview */}
              <div className="bg-muted/30 rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Skills</h2>
                </div>

                <div className="space-y-4">
                  <SkillBar skill="HTML" level={skillLevels.html} maxLevel={5} color="from-orange-500 to-red-500" />
                  <SkillBar skill="CSS" level={skillLevels.css} maxLevel={5} color="from-blue-500 to-cyan-500" />
                  <SkillBar skill="JavaScript" level={skillLevels.javascript} maxLevel={5} color="from-yellow-500 to-amber-500" />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-muted/30 rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Recent Activity</h2>
                </div>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border hover:shadow-md transition-shadow"
                      >
                        <div className="text-2xl">{activity.world?.icon || "📚"}</div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.lesson?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.world?.name} • {new Date(activity.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1 text-yellow-500">
                            <Coins className="w-4 h-4" />
                            +{activity.coins_earned}
                          </span>
                          <span className="flex items-center gap-1 text-purple-500">
                            <Zap className="w-4 h-4" />
                            +{activity.xp_earned}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No activity yet. Start completing lessons!
                  </p>
                )}
              </div>

              {/* Learning Progress by World */}
              <div className="bg-muted/30 rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">World Progress</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {worldProgress.map((world) => (
                    <div
                      key={world.id}
                      className="bg-background rounded-xl p-4 border border-border hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">{world.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{world.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {world.completedLessons}/{world.totalLessons} lessons
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                          style={{ width: `${world.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right mt-1">
                        {world.percentage}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Streak Calendar */}
              <div className="bg-muted/30 rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Learning Streak</h2>
                </div>
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl px-8 py-6 mb-4">
                    <Flame className="w-12 h-12" />
                    <div className="text-left">
                      <div className="text-4xl font-bold">{profile.current_streak || 0}</div>
                      <div className="text-sm opacity-90">Day Streak</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Keep it up! Complete a lesson every day to maintain your streak.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Longest streak: {profile.longest_streak || 0} days
                  </p>
                </div>
              </div>

              {/* Quick Stats Summary */}
              <div className="bg-muted/30 rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Progress Summary</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-background rounded-lg border border-border">
                    <div className="text-2xl font-bold text-primary">{stats.lessonsCompleted}</div>
                    <div className="text-xs text-muted-foreground mt-1">Lessons Done</div>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg border border-border">
                    <div className="text-2xl font-bold text-purple-500">{profile.xp}</div>
                    <div className="text-xs text-muted-foreground mt-1">Total XP</div>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg border border-border">
                    <div className="text-2xl font-bold text-yellow-500">{profile.coins}</div>
                    <div className="text-xs text-muted-foreground mt-1">Coins Earned</div>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg border border-border">
                    <div className="text-2xl font-bold text-green-500">{stats.badgesEarned}</div>
                    <div className="text-xs text-muted-foreground mt-1">Badges Unlocked</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Avatar Customization */}
              <div className="bg-muted/30 rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <Smile className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Choose Your Avatar</h2>
                </div>
                <AvatarSelector
                  studentId={user.id}
                  currentCoins={profile.coins}
                  selectedAvatarId={profile.selected_avatar_id}
                  onAvatarSelect={handleAvatarSelect}
                />
              </div>

              {/* Theme Customization */}
              <div className="bg-muted/30 rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <Palette className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Choose Your Theme</h2>
                </div>
                <ThemeSelector
                  studentId={user.id}
                  currentCoins={profile.coins}
                  selectedThemeId={profile.selected_theme_id}
                  onThemeSelect={handleThemeSelect}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

function StatCard({ icon, title, value, gradient }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  gradient: string;
}) {
  return (
    <div className="bg-background rounded-xl p-6 border border-border hover:shadow-lg transition-shadow">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </div>
  );
}

function SkillBar({ skill, level, maxLevel, color }: {
  skill: string;
  level: number;
  maxLevel: number;
  color: string;
}) {
  const percentage = (level / maxLevel) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">{skill}</span>
        <span className="text-sm text-muted-foreground">Level {level}/{maxLevel}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
