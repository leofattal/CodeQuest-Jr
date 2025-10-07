"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/common/PageTransition";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Lock, Play, CheckCircle, Star, Clock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface World {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
  color: string;
  is_locked: boolean;
  unlock_requirement: string | null;
}

interface Lesson {
  id: string;
  world_id: string;
  title: string;
  description: string;
  order_index: number;
  coin_reward: number;
  xp_reward: number;
  estimated_minutes: number;
}

interface Progress {
  lesson_id: string;
  completed: boolean;
  score: number | null;
}

/**
 * World Detail Page
 * Shows all lessons in a specific world with progress tracking
 */
export default function WorldDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [world, setWorld] = useState<World | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  const slug = params?.slug as string;

  useEffect(() => {
    async function fetchWorldData() {
      try {
        const supabase = createClient();

        // Fetch world details
        const { data: worldData, error: worldError } = await supabase
          .from("worlds")
          .select("*")
          .eq("slug", slug)
          .single();

        if (worldError) {
          console.error("Error fetching world:", worldError);
          return;
        }

        setWorld(worldData);

        // Fetch lessons for this world
        const { data: lessonsData, error: lessonsError } = await supabase
          .from("lessons")
          .select("*")
          .eq("world_id", worldData.id)
          .order("order_index", { ascending: true });

        if (lessonsError) {
          console.error("Error fetching lessons:", lessonsError);
          return;
        }

        setLessons(lessonsData || []);

        // Fetch user progress if logged in
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from("student_progress")
            .select("lesson_id, completed, score")
            .eq("student_id", user.id)
            .eq("world_id", worldData.id);

          if (progressError) {
            console.error("Error fetching progress:", progressError);
          } else {
            setProgress(progressData || []);
          }
        }
      } catch (error) {
        console.error("Error fetching world data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchWorldData();
    }
  }, [slug, user]);

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <p className="text-muted-foreground">Loading world...</p>
        </div>
      </PageTransition>
    );
  }

  if (!world) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">World not found</p>
            <Link
              href="/worlds"
              className="text-primary hover:underline flex items-center gap-2 justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Worlds
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (world.is_locked) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center max-w-md">
            <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-2">{world.name}</h1>
            <p className="text-muted-foreground mb-6">
              {world.unlock_requirement || "Complete previous worlds to unlock this world"}
            </p>
            <Link
              href="/worlds"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Worlds
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  const gradientClass = world.color.includes("from-")
    ? world.color
    : `from-${world.color}-500 to-${world.color}-600`;

  const completedLessons = progress.filter(p => p.completed).length;
  const totalLessons = lessons.length;
  const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Link
            href="/worlds"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Worlds
          </Link>

          {/* World Header */}
          <div className={`bg-gradient-to-br ${gradientClass} rounded-2xl p-8 mb-8 text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <div className="flex items-start gap-6 mb-4">
                <div className="text-6xl">{world.icon}</div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-2">{world.name}</h1>
                  <p className="text-white/90 text-lg mb-4">{world.description}</p>

                  {/* Progress Bar */}
                  <div className="bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                    <div
                      className="h-full bg-white/90 transition-all duration-500"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <p className="text-white/80 text-sm mt-2">
                    {completedLessons} of {totalLessons} lessons completed ({completionPercentage}%)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lessons List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Lessons</h2>

            {lessons.length === 0 ? (
              <div className="bg-muted/30 rounded-xl p-8 text-center border border-border">
                <p className="text-muted-foreground">
                  No lessons available yet. Check back soon!
                </p>
              </div>
            ) : (
              lessons.map((lesson, index) => {
                const lessonProgress = progress.find(p => p.lesson_id === lesson.id);
                const isCompleted = lessonProgress?.completed || false;
                const score = lessonProgress?.score || null;

                return (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    index={index}
                    isCompleted={isCompleted}
                    score={score}
                    gradient={gradientClass}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function LessonCard({
  lesson,
  index,
  isCompleted,
  score,
  gradient,
}: {
  lesson: Lesson;
  index: number;
  isCompleted: boolean;
  score: number | null;
  gradient: string;
}) {
  return (
    <Link
      href={`/lessons/${lesson.id}`}
      className="group block bg-background rounded-xl p-6 border-2 border-border hover:border-primary hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        {/* Lesson Number */}
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
          {index + 1}
        </div>

        {/* Lesson Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
              {lesson.title}
            </h3>
            {isCompleted && (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            )}
          </div>

          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {lesson.description}
          </p>

          {/* Lesson Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{lesson.estimated_minutes} min</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">🪙</span>
              <span>{lesson.coin_reward} coins</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-purple-500" />
              <span>{lesson.xp_reward} XP</span>
            </div>
            {score !== null && (
              <div className="flex items-center gap-1">
                <span className="font-medium text-foreground">Score: {score}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Icon */}
        <div className="flex-shrink-0">
          {isCompleted ? (
            <div className="text-green-500 font-medium text-sm">
              Completed
            </div>
          ) : (
            <Play className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          )}
        </div>
      </div>
    </Link>
  );
}
