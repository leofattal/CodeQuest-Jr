"use client";

import Link from "next/link";
import { PageTransition } from "@/components/common/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Target, Coins, TrendingUp } from "lucide-react";

/**
 * Dashboard Page
 * Shows user's progress, stats, and quick actions
 */
export default function DashboardPage() {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)] px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {profile.display_name}! 🎉
            </h1>
            <p className="text-muted-foreground text-lg">
              Ready to continue your coding adventure?
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-accent" />
                </div>
                <span className="text-3xl font-bold">{profile.coins}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Coins</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <span className="text-3xl font-bold">{profile.xp}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total XP</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-secondary" />
                </div>
                <span className="text-3xl font-bold">{profile.level}</span>
              </div>
              <p className="text-sm text-muted-foreground">Level</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-success" />
                </div>
                <span className="text-3xl font-bold">0</span>
              </div>
              <p className="text-sm text-muted-foreground">Lessons Completed</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/worlds"
              className="group bg-gradient-to-br from-primary to-secondary p-8 rounded-2xl text-white hover:opacity-90 transition-opacity"
            >
              <h2 className="text-2xl font-bold mb-2">Continue Learning</h2>
              <p className="text-white/90 mb-4">
                Pick up where you left off in your coding worlds
              </p>
              <span className="inline-flex items-center text-sm font-medium group-hover:translate-x-2 transition-transform">
                Start Coding →
              </span>
            </Link>

            <Link
              href="/shop"
              className="group bg-card border-2 border-border p-8 rounded-2xl hover:border-accent transition-colors"
            >
              <h2 className="text-2xl font-bold mb-2">Visit the Shop</h2>
              <p className="text-muted-foreground mb-4">
                Spend your {profile.coins} coins on awesome rewards!
              </p>
              <span className="inline-flex items-center text-sm font-medium text-accent group-hover:translate-x-2 transition-transform">
                Browse Shop →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
