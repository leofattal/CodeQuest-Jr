"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/common/PageTransition";
import { createClient } from "@/lib/supabase/client";
import {
  Trophy,
  Medal,
  Award,
  Coins,
  Zap,
  TrendingUp
} from "lucide-react";

interface LeaderboardEntry {
  id: string;
  display_name: string;
  avatar_url: string | null;
  coins: number;
  xp: number;
  level: number;
  rank?: number;
}

type SortBy = "xp" | "coins" | "level";

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

  const sortOptions = [
    { id: "xp" as SortBy, name: "Total XP", icon: Zap, color: "text-purple-500" },
    { id: "coins" as SortBy, name: "Coins", icon: Coins, color: "text-yellow-500" },
    { id: "level" as SortBy, name: "Level", icon: TrendingUp, color: "text-blue-500" },
  ];

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const supabase = createClient();

        // Fetch top 100 students sorted by selected metric
        const { data, error } = await supabase
          .from("students")
          .select("id, display_name, avatar_url, coins, xp, level")
          .order(sortBy, { ascending: false })
          .limit(100);

        if (error) {
          console.error("Error fetching leaderboard:", error);
          return;
        }

        // Add rank to each entry
        const rankedData = (data || []).map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

        setLeaders(rankedData);

        // Find current user's rank if logged in
        if (user) {
          const userEntry = rankedData.find(entry => entry.id === user.id);
          if (userEntry) {
            setUserRank(userEntry);
          } else {
            // User not in top 100, fetch their individual stats
            const { data: userData } = await supabase
              .from("students")
              .select("id, display_name, avatar_url, coins, xp, level")
              .eq("id", user.id)
              .single();

            if (userData) {
              // Get user's rank by counting how many have higher scores
              const { count } = await supabase
                .from("students")
                .select("*", { count: "exact", head: true })
                .gt(sortBy, userData[sortBy]);

              setUserRank({
                ...userData,
                rank: (count || 0) + 1,
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
  }, [sortBy, user]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return { icon: "🥇", color: "text-yellow-400" };
    if (rank === 2) return { icon: "🥈", color: "text-gray-400" };
    if (rank === 3) return { icon: "🥉", color: "text-amber-600" };
    return { icon: rank.toString(), color: "text-muted-foreground" };
  };

  const getStatValue = (entry: LeaderboardEntry) => {
    switch (sortBy) {
      case "xp":
        return `${entry.xp.toLocaleString()} XP`;
      case "coins":
        return `${entry.coins.toLocaleString()} Coins`;
      case "level":
        return `Level ${entry.level}`;
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
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See where you rank among top coders!
            </p>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    sortBy === option.id
                      ? "bg-primary text-primary-foreground shadow-lg scale-105"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${sortBy === option.id ? "" : option.color}`} />
                  <span>{option.name}</span>
                </button>
              );
            })}
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
                  <div className="text-sm text-gray-700">{getStatValue(leaders[1])}</div>
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
                  <div className="text-sm text-gray-700">{getStatValue(leaders[0])}</div>
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
                  <div className="text-sm text-amber-100">{getStatValue(leaders[2])}</div>
                </div>
              </div>
            </div>
          )}

          {/* Rankings List (4-100) */}
          <div className="bg-background rounded-xl border border-border overflow-hidden">
            {leaders.slice(3).map((entry) => {
              const rankIcon = getRankIcon(entry.rank!);
              const isCurrentUser = user?.id === entry.id;

              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 border-b border-border last:border-b-0 ${
                    isCurrentUser ? "bg-primary/5 border-l-4 border-l-primary" : ""
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold flex-shrink-0 ${rankIcon.color}`}>
                      {typeof rankIcon.icon === "string" && rankIcon.icon.length <= 2 ? (
                        <span className="text-xl">{rankIcon.icon}</span>
                      ) : (
                        <span className="text-sm">{rankIcon.icon}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {entry.avatar_url ? (
                        <img
                          src={entry.avatar_url}
                          alt={entry.display_name}
                          className="w-10 h-10 rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl flex-shrink-0">
                          👤
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-bold truncate">
                          {entry.display_name}
                          {isCurrentUser && <span className="text-primary ml-2">(You)</span>}
                        </div>
                        <div className="text-sm text-muted-foreground">Level {entry.level}</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="font-bold">{getStatValue(entry)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {leaders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No rankings available yet.</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
