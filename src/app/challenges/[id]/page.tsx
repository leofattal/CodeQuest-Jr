"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/common/PageTransition";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Clock,
  Coins as CoinsIcon,
  Zap,
  Trophy,
  Award
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  instructions: string;
  starter_code: string;
  expected_output: string;
  xp_reward: number;
  coin_reward: number;
  bonus_xp: number;
  time_limit_minutes: number;
  challenge_date: string;
}

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const challengeId = params?.id as string;

  useEffect(() => {
    async function fetchChallenge() {
      try {
        const supabase = createClient();

        // Fetch challenge
        const { data: challengeData, error } = await supabase
          .from("daily_challenges")
          .select("*")
          .eq("id", challengeId)
          .single();

        if (error) {
          console.error("Error fetching challenge:", error);
          return;
        }

        setChallenge(challengeData);
        setCode(challengeData.starter_code || "");

        // Check if user has completed this challenge
        if (user) {
          const { data: completionData } = await supabase
            .from("student_challenge_completions")
            .select("*")
            .eq("student_id", user.id)
            .eq("challenge_id", challengeId)
            .single();

          if (completionData) {
            setIsCompleted(true);
          } else {
            setIsTimerRunning(true);
          }
        }
      } catch (error) {
        console.error("Error fetching challenge:", error);
      } finally {
        setLoading(false);
      }
    }

    if (challengeId) {
      fetchChallenge();
    }
  }, [challengeId, user]);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && !isCompleted) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning, isCompleted]);

  // Update preview when code changes
  useEffect(() => {
    if (iframeRef.current && code) {
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body {
                  font-family: system-ui, -apple-system, sans-serif;
                  padding: 20px;
                  margin: 0;
                }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              ${code}
            </body>
          </html>
        `);
        iframeDoc.close();
      }
    }
  }, [code]);

  const validateChallenge = () => {
    if (!challenge) return;

    setIsValidating(true);
    setValidationResult(null);

    // Simple validation - check if code is not empty and different from starter
    setTimeout(() => {
      const isValid = code.trim() !== "" && code !== challenge.starter_code;

      if (isValid) {
        setValidationResult({
          success: true,
          message: "Great work! Your solution looks good!"
        });
        completeChallenge();
      } else {
        setValidationResult({
          success: false,
          message: "Please write some code to complete the challenge!"
        });
      }

      setIsValidating(false);
    }, 500);
  };

  const completeChallenge = async () => {
    if (!user || !profile || !challenge) return;

    try {
      const supabase = createClient();
      const timeTakenSeconds = elapsedTime;
      const timeLimitSeconds = challenge.time_limit_minutes * 60;
      const earnedBonus = timeTakenSeconds <= timeLimitSeconds;

      // Calculate rewards
      const xpEarned = challenge.xp_reward + (earnedBonus ? challenge.bonus_xp : 0);
      const coinsEarned = challenge.coin_reward;

      // Update student coins and xp
      const { error: updateError } = await supabase
        .from("students")
        .update({
          coins: profile.coins + coinsEarned,
          xp: profile.xp + xpEarned
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating student:", updateError);
        return;
      }

      // Record completion
      const { error: completionError } = await supabase
        .from("student_challenge_completions")
        .insert({
          student_id: user.id,
          challenge_id: challenge.id,
          time_taken_seconds: timeTakenSeconds,
          earned_bonus: earnedBonus,
          code_submitted: code
        });

      if (completionError) {
        console.error("Error recording completion:", completionError);
        return;
      }

      setIsCompleted(true);
      setIsTimerRunning(false);
      await refreshProfile();

      // Show success message
      alert(`Challenge completed! You earned ${xpEarned} XP and ${coinsEarned} coins!${earnedBonus ? " 🎉 Bonus XP earned for completing quickly!" : ""}`);
    } catch (error) {
      console.error("Error completing challenge:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <p className="text-muted-foreground">Loading challenge...</p>
        </div>
      </PageTransition>
    );
  }

  if (!challenge) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Challenge not found</p>
            <Link href="/challenges" className="text-primary hover:underline">
              Back to challenges
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/challenges"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{challenge.title}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty.toUpperCase()}
                </span>
                {isCompleted && (
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Completed
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">{challenge.description}</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-xs text-muted-foreground">Time</div>
                <div className="font-bold">{formatTime(elapsedTime)}</div>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-xs text-muted-foreground">XP Reward</div>
                <div className="font-bold">{challenge.xp_reward} XP</div>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-2">
              <CoinsIcon className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-xs text-muted-foreground">Coins</div>
                <div className="font-bold">{challenge.coin_reward}</div>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-xs text-muted-foreground">Bonus XP</div>
                <div className="font-bold">+{challenge.bonus_xp}</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Instructions & Code */}
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-background rounded-xl border border-border p-6">
                <h2 className="text-xl font-bold mb-3">Instructions</h2>
                <p className="text-muted-foreground whitespace-pre-line">{challenge.instructions}</p>
              </div>

              {/* Expected Output */}
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
                <h2 className="text-xl font-bold mb-3">Expected Result</h2>
                <p className="text-muted-foreground">{challenge.expected_output}</p>
              </div>

              {/* Code Editor */}
              <div className="bg-background rounded-xl border border-border overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b border-border">
                  <h3 className="font-semibold">Code Editor</h3>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-64 p-4 font-mono text-sm bg-background resize-none focus:outline-none"
                  placeholder="Write your code here..."
                  spellCheck={false}
                  disabled={isCompleted}
                />
              </div>

              {/* Submit Button */}
              {!isCompleted && (
                <button
                  onClick={validateChallenge}
                  disabled={isValidating || !user}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isValidating ? (
                    "Checking..."
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Submit Challenge
                    </>
                  )}
                </button>
              )}

              {/* Validation Result */}
              {validationResult && (
                <div
                  className={`rounded-lg p-4 ${
                    validationResult.success
                      ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                      : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {validationResult.success ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Award className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="font-medium">{validationResult.message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Preview */}
            <div className="space-y-6">
              <div className="bg-background rounded-xl border border-border overflow-hidden sticky top-4">
                <div className="bg-muted px-4 py-2 border-b border-border">
                  <h3 className="font-semibold">Live Preview</h3>
                </div>
                <div className="aspect-video bg-white">
                  <iframe
                    ref={iframeRef}
                    className="w-full h-full border-0"
                    title="Preview"
                    sandbox="allow-scripts"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
