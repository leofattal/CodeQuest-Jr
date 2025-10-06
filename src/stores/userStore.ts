import { create } from "zustand";
import type { Profile, User } from "@/types";

/**
 * User state management with Zustand
 * Handles user profile, coins, XP, and level
 */

interface UserState {
  user: User | null;
  profile: Profile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addXP: (amount: number) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  profile: null,

  setUser: (user) => set({ user }),

  setProfile: (profile) => set({ profile }),

  addCoins: (amount) =>
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, total_coins: state.profile.total_coins + amount }
        : null,
    })),

  spendCoins: (amount) => {
    const { profile } = get();
    if (!profile || profile.total_coins < amount) return false;

    set({
      profile: { ...profile, total_coins: profile.total_coins - amount },
    });
    return true;
  },

  addXP: (amount) =>
    set((state) => {
      if (!state.profile) return state;

      const newXP = state.profile.total_xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1; // Simple leveling: 100 XP per level

      return {
        profile: {
          ...state.profile,
          total_xp: newXP,
          level: newLevel,
        },
      };
    }),
}));
