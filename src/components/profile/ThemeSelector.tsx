"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, Lock, Coins as CoinsIcon } from "lucide-react";

interface Theme {
  id: string;
  name: string;
  description: string;
  preview_colors: {
    primary: string;
    secondary: string;
    background: string;
  };
  is_premium: boolean;
  coin_cost: number;
}

interface ThemeSelectorProps {
  studentId: string;
  currentCoins: number;
  selectedThemeId: string | null;
  onThemeSelect: (themeId: string) => void;
}

export function ThemeSelector({ studentId, currentCoins, selectedThemeId, onThemeSelect }: ThemeSelectorProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [purchasedThemeIds, setPurchasedThemeIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchThemes() {
      const supabase = createClient();

      // Fetch all themes
      const { data, error } = await supabase
        .from("themes")
        .select("*")
        .order("coin_cost", { ascending: true });

      if (error) {
        console.error("Error fetching themes:", error);
      } else {
        setThemes(data || []);
      }

      // Fetch purchased themes
      const { data: purchasesData } = await supabase
        .from("student_purchases")
        .select("item_id")
        .eq("student_id", studentId)
        .eq("item_type", "theme");

      if (purchasesData) {
        setPurchasedThemeIds(new Set(purchasesData.map(p => p.item_id)));
      }

      setLoading(false);
    }

    fetchThemes();
  }, [studentId]);

  const handleThemeSelect = async (theme: Theme) => {
    const isOwned = purchasedThemeIds.has(theme.id);

    // If not owned and costs coins, purchase it
    if (!isOwned && theme.coin_cost > 0) {
      if (currentCoins < theme.coin_cost) {
        alert(`You need ${theme.coin_cost - currentCoins} more coins to unlock this theme!`);
        return;
      }

      const supabase = createClient();

      // Deduct coins, record purchase, and select theme
      const { error: coinsError } = await supabase
        .from("students")
        .update({
          coins: currentCoins - theme.coin_cost,
          selected_theme_id: theme.id
        })
        .eq("id", studentId);

      if (coinsError) {
        console.error("Error updating coins:", coinsError);
        alert("Failed to purchase theme. Please try again.");
        return;
      }

      // Record the purchase
      await supabase
        .from("student_purchases")
        .insert({
          student_id: studentId,
          item_type: "theme",
          item_id: theme.id
        });

      // Update local state
      setPurchasedThemeIds(prev => new Set(prev).add(theme.id));
    } else {
      // Already owned or free, just select it
      const supabase = createClient();
      const { error } = await supabase
        .from("students")
        .update({ selected_theme_id: theme.id })
        .eq("id", studentId);

      if (error) {
        console.error("Error selecting theme:", error);
        alert("Failed to select theme. Please try again.");
        return;
      }
    }

    onThemeSelect(theme.id);
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading themes...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {themes.map((theme) => {
        const isSelected = theme.id === selectedThemeId;
        const isOwned = purchasedThemeIds.has(theme.id);
        const canAfford = currentCoins >= theme.coin_cost;
        const isLocked = !isOwned && theme.coin_cost > 0 && !canAfford;

        return (
          <button
            key={theme.id}
            onClick={() => handleThemeSelect(theme)}
            disabled={isLocked}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              isSelected
                ? "border-primary shadow-lg scale-105"
                : isLocked
                ? "border-muted opacity-50 cursor-not-allowed"
                : "border-border hover:border-primary hover:shadow-md"
            }`}
          >
            {/* Theme Preview */}
            <div className="mb-3 h-20 rounded-lg overflow-hidden flex">
              <div
                className="flex-1"
                style={{ backgroundColor: theme.preview_colors.primary }}
              />
              <div
                className="flex-1"
                style={{ backgroundColor: theme.preview_colors.secondary }}
              />
              <div
                className="flex-1"
                style={{ backgroundColor: theme.preview_colors.background }}
              />
            </div>

            {/* Theme Info */}
            <div className="text-left">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-bold">{theme.name}</h3>
                {isSelected && <Check className="w-5 h-5 text-green-500" />}
              </div>
              <p className="text-xs text-muted-foreground mb-2">{theme.description}</p>

              {/* Cost/Status */}
              <div className="flex items-center justify-between">
                {isOwned ? (
                  <span className="text-xs text-green-600 font-medium">✓ Owned</span>
                ) : theme.coin_cost > 0 ? (
                  <div className={`flex items-center gap-1 text-sm ${canAfford ? "text-yellow-600" : "text-muted-foreground"}`}>
                    <CoinsIcon className="w-4 h-4" />
                    <span>{theme.coin_cost}</span>
                  </div>
                ) : (
                  <span className="text-xs text-green-600">Free</span>
                )}
                {theme.is_premium && (
                  <span className="text-xs bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-0.5 rounded-full">
                    Premium
                  </span>
                )}
              </div>
            </div>

            {/* Lock Overlay */}
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
