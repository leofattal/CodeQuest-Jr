"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/common/PageTransition";
import { createClient } from "@/lib/supabase/client";
import {
  Trophy,
  Zap,
  Coins,
  Clock,
  Calendar,
  Flame,
  CheckCircle,
  Play,
  Award
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  challenge_date: string;
  instructions: string;
  starter_code: string;
  expected_output: string;
  xp_reward: number;
  coin_reward: number;
  bonus_xp: number;
  time_limit_minutes: number;
  completed?: boolean;
  earned_bonus?: boolean;
}

export default function DailyChallengesPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [todayChallenge, setTodayChallenge] = useState<DailyChallenge | null>(null);
  const [upcomingChallenges, setUpcomingChallenges] = useState<DailyChallenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    currentStreak: 0,
    totalXpEarned: 0,
    totalCoinsEarned: 0
  });

  useEffect(() => {
    async function fetchChallenges() {
      try {
        const supabase = createClient();
        const today = new Date().toISOString().split('T')[0];

        // Fetch all challenges
        const { data: challenges, error } = await supabase
          .from("daily_challenges")
          .select("*")
          .order("challenge_date", { ascending: true });

        if (error) {
          console.error("Error fetching challenges:", error);
          return;
        }

        if (!challenges) return;

        // Fetch user's completions if logged in
        let completions: any[] = [];
        if (user) {
          const { data: completionsData } = await supabase
            .from("student_challenge_completions")
            .select("challenge_id, earned_bonus")
            .eq("student_id", user.id);

          completions = completionsData || [];
        }

        // Mark challenges as completed
        const challengesWithStatus = challenges.map(challenge => ({
          ...challenge,
          completed: completions.some(c => c.challenge_id === challenge.id),
          earned_bonus: completions.find(c => c.challenge_id === challenge.id)?.earned_bonus || false
        }));

        // Separate into today, upcoming, and completed
        const today_challenge = challengesWithStatus.find(c => c.challenge_date === today);
        const upcoming = challengesWithStatus.filter(c => c.challenge_date > today).slice(0, 3);
        const completed = challengesWithStatus.filter(c => c.completed);

        setTodayChallenge(today_challenge || null);
        setUpcomingChallenges(upcoming);
        setCompletedChallenges(completed);

        // Calculate stats
        if (user && completed.length > 0) {
          const totalXp = completed.reduce((sum, c) => sum + c.xp_reward + (c.earned_bonus ? c.bonus_xp : 0), 0);
          const totalCoins = completed.reduce((sum, c) => sum + c.coin_reward, 0);

          setStats({
            totalCompleted: completed.length,
            currentStreak: calculateStreak(completed),
            totalXpEarned: totalXp,
            totalCoinsEarned: totalCoins
          });
        }
      } catch (error) {
        console.error("Error fetching challenges:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchChallenges();
  }, [user]);

  const calculateStreak = (completed: DailyChallenge[]) => {
    // Simple streak calculation - count consecutive days from today backwards
    const dates = completed
      .map(c => c.challenge_date)
      .sort()
      .reverse();

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < dates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const checkDateStr = checkDate.toISOString().split('T')[0];

      if (dates.includes(checkDateStr)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "hard":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  const startChallenge = (challengeId: string) => {
    router.push(`/challenges/${challengeId}`);
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-10 h-10 text-yellow-500" />
              <h1 className="text-4xl md:text-5xl font-bold">Daily Challenges</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Complete daily coding challenges to earn bonus XP and coins!
            </p>
          </div>

          {/* Stats Cards */}
          {user && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-muted-foreground">Completed</span>
                </div>
                <div className="text-3xl font-bold text-purple-500">{stats.totalCompleted}</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium text-muted-foreground">Streak</span>
                </div>
                <div className="text-3xl font-bold text-orange-500">{stats.currentStreak} days</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-muted-foreground">XP Earned</span>
                </div>
                <div className="text-3xl font-bold text-blue-500">{stats.totalXpEarned}</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium text-muted-foreground">Coins Earned</span>
                </div>
                <div className="text-3xl font-bold text-yellow-500">{stats.totalCoinsEarned}</div>
              </div>
            </div>
          )}

          {/* Today's Challenge */}
          {todayChallenge && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Today's Challenge</h2>
              </div>

              <div className={`bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 border-2 ${
                todayChallenge.completed ? "border-green-500" : "border-primary"
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold">{todayChallenge.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(todayChallenge.difficulty)}`}>
                        {todayChallenge.difficulty.toUpperCase()}
                      </span>
                      {todayChallenge.completed && (
                        <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-4">{todayChallenge.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <span className="font-semibold">{todayChallenge.xp_reward} XP</span>
                    {todayChallenge.bonus_xp > 0 && (
                      <span className="text-sm text-green-500">(+{todayChallenge.bonus_xp} bonus)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold">{todayChallenge.coin_reward} Coins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold">{todayChallenge.time_limit_minutes} min limit</span>
                  </div>
                </div>

                {!user ? (
                  <button
                    onClick={() => router.push("/login")}
                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                  >
                    Log in to start challenge
                  </button>
                ) : todayChallenge.completed ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-lg bg-green-500 text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <Award className="w-5 h-5" />
                    Challenge Completed! {todayChallenge.earned_bonus && "🎉 Bonus Earned!"}
                  </button>
                ) : (
                  <button
                    onClick={() => startChallenge(todayChallenge.id)}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Start Challenge
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Challenges */}
          {upcomingChallenges.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Coming Soon</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="bg-background rounded-xl p-4 border border-border opacity-75"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(challenge.challenge_date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold mb-1">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-purple-500" />
                        {challenge.xp_reward}
                      </span>
                      <span className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        {challenge.coin_reward}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No challenges message */}
          {!todayChallenge && upcomingChallenges.length === 0 && (
            <div className="text-center py-12 bg-muted/20 rounded-xl border border-border">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg mb-2">No challenges available</p>
              <p className="text-sm text-muted-foreground">
                Check back tomorrow for a new daily challenge!
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
