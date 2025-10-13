"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/common/PageTransition";
import { createClient } from "@/lib/supabase/client";
import {
  Trophy,
  Coins,
  Zap,
  TrendingUp,
  Flame,
  Calendar,
  Award,
  Users,
  Target
} from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requirement_type: string;
  requirement_value: number;
}

interface StudentBadge {
  badge_id: string;
  badges: Badge | Badge[] | null;
}

interface LeaderboardEntry {
  id: string;
  display_name: string;
  avatar_url: string | null;
  coins: number;
  xp: number;
  level: number;
  current_streak: number | null;
  rank?: number;
  lessons_completed?: number;
  badges?: StudentBadge[];
}

type SortBy = "xp" | "coins" | "level" | "current_streak";
type TimeFilter = "all_time" | "this_month" | "this_week";

/**
 * Leaderboard Page
 * Global rankings showing top students
 */
export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>("xp");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all_time");
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalXP: 0,
    totalLessonsCompleted: 0,
    totalCoins: 0
  });

  const sortOptions = [
    { id: "xp" as SortBy, name: "Total XP", icon: Zap, color: "text-purple-500" },
    { id: "coins" as SortBy, name: "Coins", icon: Coins, color: "text-yellow-500" },
    { id: "level" as SortBy, name: "Level", icon: TrendingUp, color: "text-blue-500" },
    { id: "current_streak" as SortBy, name: "Streak", icon: Flame, color: "text-orange-500" },
  ];

  const timeFilterOptions = [
    { id: "all_time" as TimeFilter, name: "All Time", icon: Trophy },
    { id: "this_month" as TimeFilter, name: "This Month", icon: Calendar },
    { id: "this_week" as TimeFilter, name: "This Week", icon: Award },
  ];

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const supabase = createClient();

        // Calculate date filter
        let dateFilter = null;
        if (timeFilter === "this_week") {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          dateFilter = weekAgo.toISOString();
        } else if (timeFilter === "this_month") {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          dateFilter = monthAgo.toISOString();
        }

        let data;
        let error;

        if (timeFilter === "all_time") {
          // Fetch all-time leaderboard with tie-breaking
          const result = await supabase
            .from("students")
            .select("id, display_name, avatar_url, coins, xp, level, current_streak")
            .order(sortBy, { ascending: false })
            .order("xp", { ascending: false }) // Secondary sort by XP
            .order("level", { ascending: false }) // Tertiary sort by level
            .order("created_at", { ascending: true }) // Tie-breaker: oldest user wins
            .limit(100);
          data = result.data;
          error = result.error;
        } else {
          // For time-based filters, we need to aggregate from student_progress
          const { data: studentsData, error: studentsError } = await supabase
            .from("students")
            .select("id, display_name, avatar_url, level, current_streak");

          if (studentsError) {
            console.error("Error fetching students:", studentsError);
            return;
          }

          // Fetch progress data within time range
          const { data: progressData } = await supabase
            .from("student_progress")
            .select("student_id, coins_earned, xp_earned, completed_at")
            .eq("completed", true)
            .gte("completed_at", dateFilter!);

          // Aggregate stats per student
          const studentStats = new Map<string, { coins: number; xp: number }>();

          progressData?.forEach((progress) => {
            const current = studentStats.get(progress.student_id) || { coins: 0, xp: 0 };
            studentStats.set(progress.student_id, {
              coins: current.coins + (progress.coins_earned || 0),
              xp: current.xp + (progress.xp_earned || 0),
            });
          });

          // Combine student data with aggregated stats
          data = studentsData
            .map((student) => {
              const stats = studentStats.get(student.id) || { coins: 0, xp: 0 };
              return {
                ...student,
                coins: stats.coins,
                xp: stats.xp,
              };
            })
            .sort((a, b) => {
              // Primary sort by selected metric
              const aValue = a[sortBy] || 0;
              const bValue = b[sortBy] || 0;
              if (bValue !== aValue) return bValue - aValue;

              // Tie-breaker 1: XP
              if (b.xp !== a.xp) return b.xp - a.xp;

              // Tie-breaker 2: Level
              if (b.level !== a.level) return b.level - a.level;

              // Tie-breaker 3: Coins
              return b.coins - a.coins;
            })
            .slice(0, 100);
        }

        if (error) {
          console.error("Error fetching leaderboard:", error);
          return;
        }

        // Fetch lessons completed count and badges for each student
        const studentsWithLessons = await Promise.all(
          (data || []).map(async (entry) => {
            const { count } = await supabase
              .from("student_progress")
              .select("*", { count: "exact", head: true })
              .eq("student_id", entry.id)
              .eq("completed", true);

            // Fetch badges for this student
            const { data: badgesData } = await supabase
              .from("student_badges")
              .select(`
                badge_id,
                badges (
                  id,
                  name,
                  description,
                  emoji,
                  requirement_type,
                  requirement_value
                )
              `)
              .eq("student_id", entry.id);

            return {
              ...entry,
              lessons_completed: count || 0,
              badges: badgesData || [],
            };
          })
        );

        // Add rank to each entry
        const rankedData = studentsWithLessons.map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

        console.log('Leaderboard data:', rankedData);
        setLeaders(rankedData);

        // Fetch global stats
        const { data: allStudentsData } = await supabase
          .from("students")
          .select("xp, coins");

        const { count: totalStudentsCount } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true });

        const { count: totalLessonsCount } = await supabase
          .from("student_progress")
          .select("*", { count: "exact", head: true })
          .eq("completed", true);

        const totalXP = allStudentsData?.reduce((sum, student) => sum + (student.xp || 0), 0) || 0;
        const totalCoins = allStudentsData?.reduce((sum, student) => sum + (student.coins || 0), 0) || 0;

        setStats({
          totalStudents: totalStudentsCount || 0,
          totalXP,
          totalLessonsCompleted: totalLessonsCount || 0,
          totalCoins
        });

        // Find current user's rank if logged in
        if (user) {
          const userEntry = rankedData.find(entry => entry.id === user.id);
          if (userEntry) {
            setUserRank(userEntry);
          } else {
            // User not in top 100, fetch their individual stats
            const { data: userData } = await supabase
              .from("students")
              .select("id, display_name, avatar_url, coins, xp, level, current_streak")
              .eq("id", user.id)
              .single();

            if (userData) {
              // Get user's rank by counting how many have higher scores
              const sortValue = userData[sortBy as keyof typeof userData];
              const { count } = await supabase
                .from("students")
                .select("*", { count: "exact", head: true })
                .gt(sortBy, sortValue);

              // Fetch lessons completed
              const { count: lessonsCount } = await supabase
                .from("student_progress")
                .select("*", { count: "exact", head: true })
                .eq("student_id", user.id)
                .eq("completed", true);

              setUserRank({
                ...userData,
                rank: (count || 0) + 1,
                lessons_completed: lessonsCount || 0,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [sortBy, timeFilter, user]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return { icon: "🥇", color: "text-yellow-400" };
    if (rank === 2) return { icon: "🥈", color: "text-gray-400" };
    if (rank === 3) return { icon: "🥉", color: "text-amber-600" };
    return { icon: rank.toString(), color: "text-muted-foreground" };
  };

  const getBadge = (studentBadge: StudentBadge): Badge | null => {
    if (!studentBadge.badges) return null;
    if (Array.isArray(studentBadge.badges)) {
      return studentBadge.badges[0] || null;
    }
    return studentBadge.badges;
  };

  const getStatValue = (entry: LeaderboardEntry) => {
    switch (sortBy) {
      case "xp":
        return `${entry.xp.toLocaleString()} XP`;
      case "coins":
        return `${entry.coins.toLocaleString()} Coins`;
      case "level":
        return `Level ${entry.level}`;
      case "current_streak":
        return `${entry.current_streak || 0} day${(entry.current_streak || 0) !== 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-10 h-10 text-yellow-500" />
              <h1 className="text-4xl md:text-5xl font-bold">Leaderboard</h1>
            </div>
            <p className="text-xl font-semibold text-foreground/90 max-w-2xl mx-auto mb-6">
              See where you rank among top coders!
            </p>

            {/* Global Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-muted-foreground">Total Students</span>
                </div>
                <div className="text-3xl font-bold text-blue-500">{stats.totalStudents.toLocaleString()}</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-muted-foreground">Total XP Earned</span>
                </div>
                <div className="text-3xl font-bold text-purple-500">{stats.totalXP.toLocaleString()}</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium text-muted-foreground">Total Coins</span>
                </div>
                <div className="text-3xl font-bold text-yellow-500">{stats.totalCoins.toLocaleString()}</div>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-muted-foreground">Lessons Done</span>
                </div>
                <div className="text-3xl font-bold text-green-500">{stats.totalLessonsCompleted.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-muted/30 rounded-2xl p-2 mb-8">
            {/* Time Filter Row */}
            <div className="flex flex-wrap gap-2 mb-2 justify-center">
              {timeFilterOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setTimeFilter(option.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      timeFilter === option.id
                        ? "bg-secondary text-secondary-foreground shadow-md"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="h-px bg-border my-2" />

            {/* Sort Tabs */}
            <div className="flex flex-wrap gap-1 justify-center">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className={`flex-1 min-w-[140px] px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      sortBy === option.id
                        ? "bg-gradient-to-br from-primary to-secondary text-white shadow-lg scale-105"
                        : "bg-background/50 hover:bg-background hover:shadow-md"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${sortBy === option.id ? "" : option.color}`} />
                    <span>{option.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User's Rank Card (if logged in and not in top 3) */}
          {user && userRank && userRank.rank && userRank.rank > 3 && (
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 mb-6 border-2 border-primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                    #{userRank.rank}
                  </div>
                  <div className="flex items-center gap-3">
                    {userRank.avatar_url ? (
                      <img
                        src={userRank.avatar_url}
                        alt={userRank.display_name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                        👤
                      </div>
                    )}
                    <div>
                      <div className="font-bold">{userRank.display_name}</div>
                      <div className="text-sm text-muted-foreground">Your Rank</div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{getStatValue(userRank)}</div>
                  <div className="text-sm text-muted-foreground">Level {userRank.level}</div>
                </div>
              </div>
            </div>
          )}

          {/* Top 3 Podium */}
          {leaders.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 2nd Place */}
              <div className="pt-8">
                <div className={`bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl p-6 text-center ${
                  user?.id === leaders[1]?.id ? "ring-4 ring-primary" : ""
                }`}>
                  <div className="text-4xl mb-2">🥈</div>
                  <div className="w-16 h-16 rounded-full bg-white mx-auto mb-3 flex items-center justify-center overflow-hidden">
                    {leaders[1]?.avatar_url ? (
                      <img src={leaders[1].avatar_url} alt={leaders[1].display_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">👤</span>
                    )}
                  </div>
                  <div className="font-bold mb-1 truncate">{leaders[1]?.display_name}</div>
                  <div className="text-sm text-gray-700 mb-2">{getStatValue(leaders[1])}</div>
                  {leaders[1]?.badges && leaders[1].badges.length > 0 && (
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      {leaders[1].badges.slice(0, 3).map((studentBadge) => {
                        const badge = getBadge(studentBadge);
                        if (!badge) return null;
                        return (
                          <span key={studentBadge.badge_id} className="text-lg" title={badge.name}>
                            {badge.emoji}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* 1st Place */}
              <div>
                <div className={`bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-xl p-6 text-center ${
                  user?.id === leaders[0]?.id ? "ring-4 ring-primary" : ""
                }`}>
                  <div className="text-5xl mb-2">🥇</div>
                  <div className="w-20 h-20 rounded-full bg-white mx-auto mb-3 flex items-center justify-center overflow-hidden">
                    {leaders[0]?.avatar_url ? (
                      <img src={leaders[0].avatar_url} alt={leaders[0].display_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">👤</span>
                    )}
                  </div>
                  <div className="font-bold text-lg mb-1 truncate">{leaders[0]?.display_name}</div>
                  <div className="text-sm text-gray-700 mb-2">{getStatValue(leaders[0])}</div>
                  {leaders[0]?.badges && leaders[0].badges.length > 0 && (
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      {leaders[0].badges.slice(0, 3).map((studentBadge) => {
                        const badge = getBadge(studentBadge);
                        if (!badge) return null;
                        return (
                          <span key={studentBadge.badge_id} className="text-xl" title={badge.name}>
                            {badge.emoji}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* 3rd Place */}
              <div className="pt-8">
                <div className={`bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl p-6 text-center text-white ${
                  user?.id === leaders[2]?.id ? "ring-4 ring-primary" : ""
                }`}>
                  <div className="text-4xl mb-2">🥉</div>
                  <div className="w-16 h-16 rounded-full bg-white mx-auto mb-3 flex items-center justify-center overflow-hidden">
                    {leaders[2]?.avatar_url ? (
                      <img src={leaders[2].avatar_url} alt={leaders[2].display_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">👤</span>
                    )}
                  </div>
                  <div className="font-bold mb-1 truncate">{leaders[2]?.display_name}</div>
                  <div className="text-sm text-amber-100 mb-2">{getStatValue(leaders[2])}</div>
                  {leaders[2]?.badges && leaders[2].badges.length > 0 && (
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      {leaders[2].badges.slice(0, 3).map((studentBadge) => {
                        const badge = getBadge(studentBadge);
                        if (!badge) return null;
                        return (
                          <span key={studentBadge.badge_id} className="text-lg" title={badge.name}>
                            {badge.emoji}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Rankings List (4-100 or all if less than 3) */}
          <div className="space-y-3">
            {(leaders.length < 3 ? leaders : leaders.slice(3)).map((entry) => {
              const rankIcon = getRankIcon(entry.rank!);
              const isCurrentUser = user?.id === entry.id;

              return (
                <div
                  key={entry.id}
                  className={`bg-background rounded-xl border-2 transition-all hover:shadow-lg ${
                    isCurrentUser
                      ? "border-primary shadow-md"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  {/* Main Card Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center font-bold flex-shrink-0 ${rankIcon.color} shadow-sm`}>
                        {typeof rankIcon.icon === "string" && rankIcon.icon.length <= 2 ? (
                          <span className="text-2xl">{rankIcon.icon}</span>
                        ) : (
                          <span className="text-lg">{rankIcon.icon}</span>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {entry.avatar_url ? (
                          <img
                            src={entry.avatar_url}
                            alt={entry.display_name}
                            className="w-14 h-14 rounded-full border-2 border-border flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl flex-shrink-0 border-2 border-border">
                            👤
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg truncate">
                              {entry.display_name}
                            </h3>
                            {isCurrentUser && (
                              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Level {entry.level} • {entry.lessons_completed || 0} lessons completed
                          </div>
                          {/* Badges */}
                          {entry.badges && entry.badges.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap mt-1">
                              {entry.badges.slice(0, 5).map((studentBadge) => {
                                const badge = getBadge(studentBadge);
                                if (!badge) return null;
                                return (
                                  <div
                                    key={studentBadge.badge_id}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-full text-xs"
                                    title={badge.description}
                                  >
                                    <span>{badge.emoji}</span>
                                    <span className="font-medium text-yellow-600">{badge.name}</span>
                                  </div>
                                );
                              })}
                              {entry.badges.length > 5 && (
                                <span className="text-xs text-muted-foreground">
                                  +{entry.badges.length - 5} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Main Stat */}
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          {getStatValue(entry)}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          {sortOptions.find(opt => opt.id === sortBy)?.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div className="border-t border-border bg-muted/20 px-5 py-3">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">XP</div>
                        <div className="font-semibold text-sm flex items-center justify-center gap-1">
                          <Zap className="w-3 h-3 text-purple-500" />
                          {entry.xp.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Coins</div>
                        <div className="font-semibold text-sm flex items-center justify-center gap-1">
                          <Coins className="w-3 h-3 text-yellow-500" />
                          {entry.coins.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Level</div>
                        <div className="font-semibold text-sm flex items-center justify-center gap-1">
                          <TrendingUp className="w-3 h-3 text-blue-500" />
                          {entry.level}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Streak</div>
                        <div className="font-semibold text-sm flex items-center justify-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          {entry.current_streak || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {leaders.length === 0 && !loading && (
            <div className="text-center py-12 bg-muted/20 rounded-xl border border-border">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg mb-2">No students found</p>
              <p className="text-sm text-muted-foreground">
                Be the first to complete lessons and climb the leaderboard!
              </p>
            </div>
          )}

          {loading && leaders.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground mt-4">Loading leaderboard...</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
