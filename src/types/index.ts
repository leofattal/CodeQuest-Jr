/**
 * Type definitions for CodeQuest Jr.
 */

export interface User {
  id: string;
  email: string;
  parent_email?: string;
  is_child: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_skin: string;
  total_coins: number;
  total_xp: number;
  level: number;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  world_id: string;
  lesson_id: string;
  completed: boolean;
  stars_earned: number;
  completed_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: "earn" | "spend";
  source: "lesson" | "boss" | "purchase" | "daily_streak" | "badge" | "share" | "world";
  created_at: string;
}

export interface UserUnlock {
  id: string;
  user_id: string;
  item_type: "skin" | "powerup" | "level";
  item_id: string;
  unlocked_at: string;
}

export interface Lesson {
  id: string;
  world_id: string;
  title: string;
  description: string;
  order: number;
  content: LessonContent;
  validation: LessonValidation;
}

export interface LessonContent {
  intro: string;
  concept: string;
  guided_practice: {
    instructions: string;
    starter_code: string;
    expected_output?: string;
  };
  challenge: {
    instructions: string;
    hints?: string[];
  };
}

export interface LessonValidation {
  type: "html" | "css" | "javascript";
  rules: ValidationRule[];
  max_coins: number;
}

export interface ValidationRule {
  description: string;
  pattern?: string;
  coins: number;
}

export interface World {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  total_lessons: number;
  boss_game?: BossGame;
}

export interface BossGame {
  id: string;
  title: string;
  type: "memory" | "shooter" | "pattern" | "debug" | "boss";
  description: string;
  challenges: GameChallenge[];
}

export interface GameChallenge {
  question: string;
  code?: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  criteria: BadgeCriteria;
}

export interface BadgeCriteria {
  type: "lesson_complete" | "world_complete" | "boss_defeat" | "perfect_score" | "speed" | "coins" | "unlocks" | "streak" | "hint_use" | "share" | "completionist";
  target: number | string;
}
