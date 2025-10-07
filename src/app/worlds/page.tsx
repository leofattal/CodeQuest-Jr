"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/common/PageTransition";
import { createClient } from "@/lib/supabase/client";
import { Lock, CheckCircle, Play } from "lucide-react";
import Link from "next/link";

interface World {
  id: string;
  name: string;
  description: string;
  slug: string;
  order_index: number;
  icon: string;
  color: string;
  is_locked: boolean;
  unlock_requirement: string | null;
}

/**
 * Worlds Page
 * Displays all coding worlds with their unlock status
 */
export default function WorldsPage() {
  const { user, profile } = useAuth();
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorlds() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("worlds")
          .select("*")
          .order("order_index", { ascending: true });

        if (error) {
          console.error("Error fetching worlds:", error);
          return;
        }

        setWorlds(data || []);
      } catch (error) {
        console.error("Error fetching worlds:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWorlds();
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <p className="text-muted-foreground">Loading worlds...</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Coding Worlds
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Master coding through 5 epic worlds. Complete challenges, defeat bosses, and unlock new adventures!
            </p>
          </div>

          {/* World Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {worlds.map((world) => (
              <WorldCard
                key={world.id}
                world={world}
              />
            ))}
          </div>

          {/* Progress Summary */}
          {user && profile && (
            <div className="mt-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">Your Progress</h3>
                  <p className="text-muted-foreground">
                    {worlds.filter(w => !w.is_locked).length} of {worlds.length} worlds unlocked
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile.level}</div>
                    <div className="text-sm text-muted-foreground">Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile.xp}</div>
                    <div className="text-sm text-muted-foreground">Total XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile.coins}</div>
                    <div className="text-sm text-muted-foreground">Coins</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

function WorldCard({ world }: { world: World }) {
  // Parse color for gradient
  const gradientClass = world.color.includes("from-")
    ? world.color
    : `from-${world.color}-500 to-${world.color}-600`;

  return (
    <Link
      href={world.is_locked ? "#" : `/worlds/${world.slug}`}
      className={`group relative bg-background rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
        world.is_locked
          ? "border-muted cursor-not-allowed opacity-70"
          : "border-border hover:border-primary hover:shadow-xl hover:scale-105"
      }`}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10 group-hover:opacity-20 transition-opacity`} />

      {/* Content */}
      <div className="relative p-6">
        {/* Icon & Status */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-3xl shadow-lg`}>
            {world.icon}
          </div>
          {world.is_locked ? (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span className="text-sm">Locked</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-green-500">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Unlocked</span>
            </div>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-2xl font-bold mb-2">{world.name}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {world.description}
        </p>

        {/* Progress Bar (placeholder) */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>0%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${gradientClass}`}
              style={{ width: "0%" }}
            />
          </div>
        </div>

        {/* Action */}
        {world.is_locked ? (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {world.unlock_requirement || "Complete previous world"}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-primary font-medium">
            <Play className="w-4 h-4" />
            <span>Start Learning</span>
          </div>
        )}
      </div>

      {/* Lock Overlay */}
      {world.is_locked && (
        <div className="absolute inset-0 backdrop-blur-[2px] pointer-events-none" />
      )}
    </Link>
  );
}
