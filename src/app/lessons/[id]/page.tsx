"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/common/PageTransition";
import { createClient } from "@/lib/supabase/client";
import { checkAndUnlockBadges } from "@/lib/badges/checkBadgeUnlocks";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Lightbulb,
  Award,
  Clock,
  Coins as CoinsIcon,
  RotateCcw,
  Timer
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Lesson {
  id: string;
  world_id: string;
  title: string;
  description: string;
  order_index: number;
  content: {
    introduction?: string;
    learning_objectives?: string[];
    explanation?: string;
  };
  starter_code: string;
  solution_code: string;
  validation_rules: {
    required_tags?: string[];
    tag_content?: Record<string, string>;
    min_tags?: Record<string, number>;
    required_attributes?: Record<string, string[]>;
    attribute_values?: Record<string, Record<string, string>>;
    attribute_patterns?: Record<string, Record<string, string>>;
    console_output?: string[];
    code_contains?: string[];
    case_sensitive?: boolean;
  };
  hints: string[];
  hint_1: string | null;
  hint_2: string | null;
  hint_3: string | null;
  hint_cost_coins: number;
  coin_reward: number;
  xp_reward: number;
  estimated_minutes: number;
}

interface World {
  id: string;
  name: string;
  slug: string;
  color: string;
}

/**
 * Lesson Detail Page
 * Interactive lesson with code editor and live preview
 */
export default function LessonPage() {
  const params = useParams();
  const { user, profile, refreshProfile } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [world, setWorld] = useState<World | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [currentHintIndex, setCurrentHintIndex] = useState(-1);
  const [unlockedHints, setUnlockedHints] = useState<number[]>([]); // hint levels unlocked (1, 2, 3)
  const [purchasingHint, setPurchasingHint] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<Array<{ id: string; name: string; icon: string; description: string }>>([]);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<{ oldLevel: number; newLevel: number; coinsEarned: number } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const lessonId = params?.id as string;

  useEffect(() => {
    async function fetchLesson() {
      try {
        const supabase = createClient();

        // Fetch lesson
        const { data: lessonData, error: lessonError } = await supabase
          .from("lessons")
          .select("*")
          .eq("id", lessonId)
          .single();

        if (lessonError) {
          console.error("Error fetching lesson:", lessonError);
          return;
        }

        setLesson(lessonData);

        // Load saved code from localStorage or use starter code
        const savedCodeKey = `lesson_code_${lessonId}`;
        const savedCode = localStorage.getItem(savedCodeKey);
        setCode(savedCode || lessonData.starter_code || "");

        // Load saved timer from localStorage
        const savedTimerKey = `lesson_timer_${lessonId}`;
        const savedTime = localStorage.getItem(savedTimerKey);
        if (savedTime) {
          setElapsedTime(parseInt(savedTime, 10));
        }

        // Fetch world info
        const { data: worldData, error: worldError } = await supabase
          .from("worlds")
          .select("*")
          .eq("id", lessonData.world_id)
          .single();

        if (worldError) {
          console.error("Error fetching world:", worldError);
        } else {
          setWorld(worldData);
        }

        // Check if user has completed this lesson and fetch unlocked hints
        if (user) {
          const { data: progressData } = await supabase
            .from("student_progress")
            .select("completed")
            .eq("student_id", user.id)
            .eq("lesson_id", lessonId)
            .single();

          if (progressData?.completed) {
            setIsCompleted(true);
          } else {
            // Start timer if lesson is not completed
            setIsTimerRunning(true);
          }

          // Fetch unlocked hints
          const { data: hintsData } = await supabase
            .from("student_hints")
            .select("hint_level")
            .eq("student_id", user.id)
            .eq("lesson_id", lessonId);

          if (hintsData && hintsData.length > 0) {
            const levels = hintsData.map(h => h.hint_level);
            setUnlockedHints(levels);
            setCurrentHintIndex(Math.max(...levels) - 1);
          }
        }
      } catch (error) {
        console.error("Error fetching lesson:", error);
      } finally {
        setLoading(false);
      }
    }

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId, user]);

  // Timer effect - runs every second when timer is active
  useEffect(() => {
    if (isTimerRunning && !isCompleted) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 1;
          // Save to localStorage every second
          const savedTimerKey = `lesson_timer_${lessonId}`;
          localStorage.setItem(savedTimerKey, newTime.toString());
          return newTime;
        });
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
  }, [isTimerRunning, isCompleted, lessonId]);

  // Save code to localStorage when it changes
  useEffect(() => {
    if (lessonId && code) {
      const savedCodeKey = `lesson_code_${lessonId}`;
      localStorage.setItem(savedCodeKey, code);
    }
  }, [code, lessonId]);

  // Update preview when code changes
  useEffect(() => {
    if (iframeRef.current && code) {
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        // Clear previous console output
        setConsoleOutput([]);

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
              <script>
                // Capture console.log output
                window.consoleOutput = [];
                const originalLog = console.log;
                console.log = function(...args) {
                  window.consoleOutput.push(args.map(arg => String(arg)).join(' '));
                  originalLog.apply(console, args);
                  // Send to parent window
                  window.parent.postMessage({ type: 'console', output: window.consoleOutput }, '*');
                };
              </script>
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

  // Listen for console output from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'console') {
        setConsoleOutput(event.data.output);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const validateCode = () => {
    if (!lesson) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const rules = lesson.validation_rules;
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, "text/html");

      // Check for parsing errors
      const parserError = doc.querySelector("parsererror");
      if (parserError) {
        setValidationResult({
          success: false,
          message: "Your HTML has a syntax error. Check your tags!"
        });
        setIsValidating(false);
        return;
      }

      // Validate required tags
      if (rules.required_tags) {
        for (const tag of rules.required_tags) {
          const elements = doc.getElementsByTagName(tag);
          if (elements.length === 0) {
            setValidationResult({
              success: false,
              message: `Missing required tag: <${tag}>. Try again!`
            });
            setIsValidating(false);
            return;
          }
        }
      }

      // Validate tag content
      if (rules.tag_content) {
        for (const [tag, expectedContent] of Object.entries(rules.tag_content)) {
          const elements = doc.getElementsByTagName(tag);
          if (elements.length === 0) {
            setValidationResult({
              success: false,
              message: `Missing <${tag}> tag with content "${expectedContent}"`
            });
            setIsValidating(false);
            return;
          }

          const actualContent = elements[0].textContent?.trim() || "";
          const expected = expectedContent.trim();

          if (rules.case_sensitive === false) {
            if (actualContent.toLowerCase() !== expected.toLowerCase()) {
              setValidationResult({
                success: false,
                message: `The <${tag}> tag should contain "${expectedContent}"`
              });
              setIsValidating(false);
              return;
            }
          } else {
            if (actualContent !== expected) {
              setValidationResult({
                success: false,
                message: `The <${tag}> tag should contain "${expectedContent}"`
              });
              setIsValidating(false);
              return;
            }
          }
        }
      }

      // Validate minimum tag counts
      if (rules.min_tags) {
        for (const [tag, minCount] of Object.entries(rules.min_tags)) {
          const elements = doc.getElementsByTagName(tag);
          if (elements.length < minCount) {
            setValidationResult({
              success: false,
              message: `You need at least ${minCount} <${tag}> tag(s)`
            });
            setIsValidating(false);
            return;
          }
        }
      }

      // Validate required attributes
      if (rules.required_attributes) {
        for (const [tag, attrs] of Object.entries(rules.required_attributes)) {
          const elements = doc.getElementsByTagName(tag);
          if (elements.length === 0) {
            setValidationResult({
              success: false,
              message: `Missing <${tag}> tag`
            });
            setIsValidating(false);
            return;
          }

          for (const attr of attrs) {
            if (!elements[0].hasAttribute(attr)) {
              setValidationResult({
                success: false,
                message: `The <${tag}> tag needs a "${attr}" attribute`
              });
              setIsValidating(false);
              return;
            }
          }
        }
      }

      // Validate attribute values
      if (rules.attribute_values) {
        for (const [tag, attrValues] of Object.entries(rules.attribute_values)) {
          const elements = doc.getElementsByTagName(tag);
          if (elements.length === 0) continue;

          for (const [attr, expectedValue] of Object.entries(attrValues)) {
            const actualValue = elements[0].getAttribute(attr);
            if (actualValue !== expectedValue) {
              setValidationResult({
                success: false,
                message: `The ${attr} attribute should be "${expectedValue}"`
              });
              setIsValidating(false);
              return;
            }
          }
        }
      }

      // Validate attribute patterns (for CSS styles)
      if (rules.attribute_patterns) {
        for (const [tag, attrPatterns] of Object.entries(rules.attribute_patterns)) {
          const elements = doc.getElementsByTagName(tag);
          if (elements.length === 0) {
            setValidationResult({
              success: false,
              message: `Missing <${tag}> tag`
            });
            setIsValidating(false);
            return;
          }

          for (const [attr, pattern] of Object.entries(attrPatterns)) {
            const actualValue = elements[0].getAttribute(attr) || "";
            const regex = new RegExp(pattern, rules.case_sensitive === false ? 'i' : '');

            if (!regex.test(actualValue)) {
              setValidationResult({
                success: false,
                message: `The ${attr} attribute doesn't match the required pattern. Check your CSS!`
              });
              setIsValidating(false);
              return;
            }
          }
        }
      }

      // Validate console output (for JavaScript lessons)
      if (rules.console_output) {
        for (let i = 0; i < rules.console_output.length; i++) {
          const expectedOutput = rules.console_output[i];
          const actualOutput = consoleOutput[i] || "";

          if (rules.case_sensitive === false) {
            if (actualOutput.toLowerCase() !== expectedOutput.toLowerCase()) {
              setValidationResult({
                success: false,
                message: `Console output line ${i + 1} should be "${expectedOutput}", but got "${actualOutput}"`
              });
              setIsValidating(false);
              return;
            }
          } else {
            if (actualOutput !== expectedOutput) {
              setValidationResult({
                success: false,
                message: `Console output line ${i + 1} should be "${expectedOutput}", but got "${actualOutput}"`
              });
              setIsValidating(false);
              return;
            }
          }
        }
      }

      // Validate code contains specific strings (for JavaScript lessons)
      if (rules.code_contains) {
        for (const requiredString of rules.code_contains) {
          const codeToCheck = rules.case_sensitive === false ? code.toLowerCase() : code;
          const stringToFind = rules.case_sensitive === false ? requiredString.toLowerCase() : requiredString;

          if (!codeToCheck.includes(stringToFind)) {
            setValidationResult({
              success: false,
              message: `Your code should include "${requiredString}"`
            });
            setIsValidating(false);
            return;
          }
        }
      }

      // All validations passed!
      setValidationResult({
        success: true,
        message: "Perfect! You got it right! 🎉"
      });

      // Mark lesson as complete
      if (user && !isCompleted) {
        completeLesson();
      }
    } catch (error) {
      console.error("Validation error:", error);
      setValidationResult({
        success: false,
        message: "Something went wrong. Please try again."
      });
    } finally {
      setIsValidating(false);
    }
  };

  const resetCode = () => {
    if (lesson) {
      setCode(lesson.starter_code || "");
      // Clear saved code from localStorage
      const savedCodeKey = `lesson_code_${lessonId}`;
      localStorage.removeItem(savedCodeKey);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate XP required for a given level
  const getXPForLevel = (level: number): number => {
    // Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 250 XP, Level 4 = 450 XP, etc.
    // Formula: XP = 50 * level * (level - 1)
    return 50 * level * (level - 1);
  };

  // Calculate level from total XP
  const getLevelFromXP = (xp: number): number => {
    let level = 1;
    while (getXPForLevel(level + 1) <= xp) {
      level++;
    }
    return level;
  };

  const completeLesson = async () => {
    if (!user || !lesson) return;

    try {
      const supabase = createClient();

      // Insert or update progress
      const { error } = await supabase
        .from("student_progress")
        .upsert({
          student_id: user.id,
          lesson_id: lesson.id,
          world_id: lesson.world_id,
          completed: true,
          score: 100,
          attempts: 1,
          coins_earned: lesson.coin_reward,
          xp_earned: lesson.xp_reward,
          time_spent_seconds: elapsedTime,
          completed_at: new Date().toISOString(),
        });

      if (error) {
        console.error("Error saving progress:", error);
        return;
      }

      // Update student coins, XP, and streak
      const { data: studentData } = await supabase
        .from("students")
        .select("coins, xp, level, current_streak, longest_streak, last_lesson_date")
        .eq("id", user.id)
        .single();

      if (studentData) {
        // Calculate new streak
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const lastDate = studentData.last_lesson_date;
        let newStreak = studentData.current_streak || 0;

        if (!lastDate || lastDate !== today) {
          // Check if this continues the streak
          if (lastDate) {
            const lastDateTime = new Date(lastDate);
            const todayTime = new Date(today);
            const diffDays = Math.floor((todayTime.getTime() - lastDateTime.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              // Consecutive day, increase streak
              newStreak += 1;
            } else if (diffDays > 1) {
              // Streak broken, reset to 1
              newStreak = 1;
            }
            // If diffDays === 0, same day, don't change streak
          } else {
            // First lesson ever
            newStreak = 1;
          }
        }

        const newLongestStreak = Math.max(newStreak, studentData.longest_streak || 0);

        // Calculate level progression
        const oldXP = studentData.xp;
        const newXP = oldXP + lesson.xp_reward;
        const oldLevel = getLevelFromXP(oldXP);
        const newLevel = getLevelFromXP(newXP);

        // Check if player leveled up
        const levelsGained = newLevel - oldLevel;
        const levelUpCoins = levelsGained * 50; // 50 coins per level

        let totalCoins = studentData.coins + lesson.coin_reward;
        if (levelsGained > 0) {
          totalCoins += levelUpCoins;
          setLevelUpInfo({ oldLevel, newLevel, coinsEarned: levelUpCoins });
        }

        await supabase
          .from("students")
          .update({
            coins: totalCoins,
            xp: newXP,
            level: newLevel,
            current_streak: newStreak,
            longest_streak: newLongestStreak,
            last_lesson_date: today,
          })
          .eq("id", user.id);
      }

      // Check for newly unlocked badges
      const { newBadges } = await checkAndUnlockBadges(user.id);
      if (newBadges.length > 0) {
        setNewlyUnlockedBadges(newBadges);
      }

      // Stop timer and clear saved data when lesson is completed
      setIsTimerRunning(false);
      const savedCodeKey = `lesson_code_${lessonId}`;
      const savedTimerKey = `lesson_timer_${lessonId}`;
      localStorage.removeItem(savedCodeKey);
      localStorage.removeItem(savedTimerKey);

      setIsCompleted(true);
    } catch (error) {
      console.error("Error completing lesson:", error);
    }
  };

  const showNextHint = async () => {
    if (!lesson || !user || !profile) return;

    const nextHintLevel = currentHintIndex + 2; // hint levels are 1-indexed
    if (nextHintLevel > 3) return; // Max 3 hints

    // Check if user already unlocked this hint
    if (unlockedHints.includes(nextHintLevel)) {
      setCurrentHintIndex(currentHintIndex + 1);
      return;
    }

    const hintCost = lesson.hint_cost_coins || 5;

    // Check if user has enough coins
    if (profile.coins < hintCost) {
      alert(`Not enough coins! You need ${hintCost} coins to unlock this hint.`);
      return;
    }

    if (!confirm(`Unlock hint ${nextHintLevel} for ${hintCost} coins?`)) {
      return;
    }

    setPurchasingHint(true);

    try {
      const supabase = createClient();

      // Deduct coins
      const { error: updateError } = await supabase
        .from("students")
        .update({ coins: profile.coins - hintCost })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error deducting coins:", updateError);
        alert("Failed to unlock hint. Please try again.");
        return;
      }

      // Record hint unlock
      const { error: insertError } = await supabase
        .from("student_hints")
        .insert({
          student_id: user.id,
          lesson_id: lesson.id,
          hint_level: nextHintLevel
        });

      if (insertError) {
        console.error("Error recording hint unlock:", insertError);
      }

      // Update local state
      setUnlockedHints([...unlockedHints, nextHintLevel]);
      setCurrentHintIndex(currentHintIndex + 1);
      await refreshProfile();
    } catch (error) {
      console.error("Error unlocking hint:", error);
      alert("Failed to unlock hint. Please try again.");
    } finally {
      setPurchasingHint(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </PageTransition>
    );
  }

  if (!lesson) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Lesson not found</p>
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

  const gradientClass = world?.color?.includes("from-")
    ? world.color
    : world?.color ? `from-${world.color}-500 to-${world.color}-600` : "from-blue-500 to-cyan-500";

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className={`bg-gradient-to-r ${gradientClass} text-white py-6 px-4`}>
          <div className="max-w-7xl mx-auto">
            <Link
              href={world ? `/worlds/${world.slug}` : "/worlds"}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {world?.name || "Worlds"}
            </Link>

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-sm text-white/80 mb-2">
                  Lesson {lesson.order_index}
                </div>
                <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
                <p className="text-white/90">{lesson.description}</p>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {/* Timer */}
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                  <Timer className="w-4 h-4" />
                  <span className="text-sm font-mono">{formatTime(elapsedTime)}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{lesson.estimated_minutes} min</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                  <CoinsIcon className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm">{lesson.coin_reward} coins</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                  <Award className="w-4 h-4 text-purple-300" />
                  <span className="text-sm">{lesson.xp_reward} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Instructions */}
            <div className="space-y-6">
              {/* Introduction */}
              {lesson.content.introduction && (
                <div className="bg-background rounded-xl p-6 border border-border">
                  <h2 className="text-xl font-bold mb-3">Introduction</h2>
                  <p className="text-muted-foreground">{lesson.content.introduction}</p>
                </div>
              )}

              {/* Learning Objectives */}
              {lesson.content.learning_objectives && lesson.content.learning_objectives.length > 0 && (
                <div className="bg-background rounded-xl p-6 border border-border">
                  <h2 className="text-xl font-bold mb-3">What You&apos;ll Learn</h2>
                  <ul className="space-y-2">
                    {lesson.content.learning_objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Explanation */}
              {lesson.content.explanation && (
                <div className="bg-background rounded-xl p-6 border border-border">
                  <h2 className="text-xl font-bold mb-3">How It Works</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{lesson.content.explanation}</p>
                </div>
              )}

              {/* Hints */}
              {(lesson.hint_1 || lesson.hint_2 || lesson.hint_3) && (
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-600" />
                      <h2 className="text-xl font-bold">Hints</h2>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <CoinsIcon className="w-4 h-4 text-yellow-600" />
                      <span className="font-semibold text-yellow-700">{lesson.hint_cost_coins || 5} coins each</span>
                    </div>
                  </div>

                  {currentHintIndex === -1 ? (
                    <div>
                      <p className="text-muted-foreground mb-3 text-sm">Need help? Unlock hints to guide you through this lesson.</p>
                      {user ? (
                        <button
                          onClick={showNextHint}
                          disabled={purchasingHint}
                          className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium disabled:opacity-50"
                        >
                          <CoinsIcon className="w-4 h-4" />
                          {purchasingHint ? "Unlocking..." : `Unlock first hint (${lesson.hint_cost_coins || 5} coins)`}
                        </button>
                      ) : (
                        <p className="text-sm text-muted-foreground">Log in to unlock hints</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[lesson.hint_1, lesson.hint_2, lesson.hint_3].map((hint, index) => {
                        if (!hint || index > currentHintIndex) return null;
                        return (
                          <div key={index} className="flex items-start gap-2 p-3 bg-white dark:bg-background rounded-lg">
                            <span className="text-amber-600 font-bold flex-shrink-0">{index + 1}.</span>
                            <p className="text-foreground">{hint}</p>
                          </div>
                        );
                      })}
                      {currentHintIndex < 2 && [lesson.hint_1, lesson.hint_2, lesson.hint_3][currentHintIndex + 1] && (
                        <button
                          onClick={showNextHint}
                          disabled={purchasingHint}
                          className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium text-sm disabled:opacity-50"
                        >
                          <CoinsIcon className="w-4 h-4" />
                          {purchasingHint ? "Unlocking..." : `Unlock next hint (${lesson.hint_cost_coins || 5} coins)`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Code Editor & Preview */}
            <div className="space-y-4">
              {/* Code Editor */}
              <div className="bg-background rounded-xl border border-border overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold">Code Editor</h3>
                  <button
                    onClick={resetCode}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    title="Reset to starter code"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-64 p-4 font-mono text-sm bg-slate-900 text-slate-100 resize-none focus:outline-none"
                  spellCheck={false}
                  placeholder="Write your HTML code here..."
                />
              </div>

              {/* Preview */}
              <div className="bg-background rounded-xl border border-border overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b border-border">
                  <h3 className="font-semibold">Live Preview</h3>
                </div>
                <iframe
                  ref={iframeRef}
                  className="w-full h-64 bg-white"
                  title="Preview"
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>

              {/* Console Output (for JavaScript lessons) */}
              {consoleOutput.length > 0 && (
                <div className="bg-background rounded-xl border border-border overflow-hidden">
                  <div className="bg-slate-900 px-4 py-2 border-b border-slate-700">
                    <h3 className="font-semibold text-slate-100">Console Output</h3>
                  </div>
                  <div className="bg-slate-900 p-4 font-mono text-sm text-slate-100 max-h-48 overflow-y-auto">
                    {consoleOutput.map((line, index) => (
                      <div key={index} className="text-green-400">
                        → {line}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation Result */}
              {validationResult && (
                <div
                  className={`rounded-xl p-4 border-2 ${
                    validationResult.success
                      ? "bg-green-50 dark:bg-green-950/20 border-green-500 text-green-700 dark:text-green-400"
                      : "bg-red-50 dark:bg-red-950/20 border-red-500 text-red-700 dark:text-red-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {validationResult.success ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">!</div>
                    )}
                    <p className="font-medium">{validationResult.message}</p>
                  </div>

                  {validationResult.success && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <span>You earned:</span>
                      <span className="font-bold">+{lesson.coin_reward} coins</span>
                      <span>•</span>
                      <span className="font-bold">+{lesson.xp_reward} XP</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={validateCode}
                disabled={isValidating || isCompleted}
                className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                  isCompleted
                    ? "bg-green-500 text-white cursor-not-allowed"
                    : validationResult?.success
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Completed!
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    {isValidating ? "Checking..." : "Check My Code"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Level Up Modal */}
      {levelUpInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl p-8 max-w-md w-full border-2 border-purple-400 shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎊</div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Level Up!
              </h2>
              <p className="text-muted-foreground mb-6">
                You&apos;ve reached Level {levelUpInfo.newLevel}!
              </p>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 mb-6 border-2 border-purple-400">
                <div className="text-5xl font-bold mb-2 text-purple-600 dark:text-purple-400">
                  {levelUpInfo.oldLevel} → {levelUpInfo.newLevel}
                </div>
                <div className="text-sm text-muted-foreground mb-4">Level Progress</div>
                <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400">
                  <CoinsIcon className="w-6 h-6" />
                  <span className="text-2xl font-bold">+{levelUpInfo.coinsEarned}</span>
                  <span className="text-lg">coins</span>
                </div>
              </div>

              <button
                onClick={() => setLevelUpInfo(null)}
                className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-purple-400 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Badge Unlock Modal */}
      {newlyUnlockedBadges.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl p-8 max-w-md w-full border-2 border-yellow-400 shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Badge Unlocked!
              </h2>
              <p className="text-muted-foreground mb-6">
                You&apos;ve earned {newlyUnlockedBadges.length} new badge{newlyUnlockedBadges.length !== 1 ? 's' : ''}!
              </p>

              <div className="space-y-4 mb-6">
                {newlyUnlockedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-xl p-4 border-2 border-yellow-400"
                  >
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <div className="font-bold text-lg">{badge.name}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setNewlyUnlockedBadges([])}
                className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
