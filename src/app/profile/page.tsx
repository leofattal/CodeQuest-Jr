"use client";

import { useAuth } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/common/PageTransition";
import { BadgesPanel } from "@/components/profile/BadgesPanel";
import {
  User,
  Coins,
  Trophy,
  Star,
  Target,
  Award,
  Flame,
  BookOpen
} from "lucide-react";

/**
 * Profile Page
 * Displays user stats, achievements, and badges
 */
export default function ProfilePage() {
  const { user, profile, loading } = useAuth();

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

  // Calculate progress to next level (100 XP per level)
  const xpForNextLevel = profile.level * 100;
  const xpProgress = (profile.xp % 100) / 100 * 100;

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
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
                    {profile.xp % 100} / 100 XP to next level
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Star className="w-6 h-6" />}
              title="Lessons Completed"
              value="0"
              gradient="from-yellow-500 to-orange-500"
            />
            <StatCard
              icon={<Target className="w-6 h-6" />}
              title="Worlds Unlocked"
              value="1"
              gradient="from-blue-500 to-cyan-500"
            />
            <StatCard
              icon={<Flame className="w-6 h-6" />}
              title="Current Streak"
              value="1 day"
              gradient="from-red-500 to-pink-500"
            />
            <StatCard
              icon={<Award className="w-6 h-6" />}
              title="Badges Earned"
              value="0"
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
              <SkillBar skill="HTML" level={0} maxLevel={5} color="from-orange-500 to-red-500" />
              <SkillBar skill="CSS" level={0} maxLevel={5} color="from-blue-500 to-cyan-500" />
              <SkillBar skill="JavaScript" level={0} maxLevel={5} color="from-yellow-500 to-amber-500" />
            </div>
          </div>
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

function BadgeCard({ icon, title, description, locked }: {
  icon: string;
  title: string;
  description: string;
  locked: boolean;
}) {
  return (
    <div className={`bg-background rounded-xl p-4 border border-border text-center transition-all ${
      locked ? 'opacity-50 grayscale' : 'hover:shadow-lg hover:scale-105'
    }`}>
      <div className="text-4xl mb-2">{icon}</div>
      <div className="font-semibold text-sm mb-1">{title}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
      {locked && (
        <div className="mt-2 text-xs text-muted-foreground">🔒 Locked</div>
      )}
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
