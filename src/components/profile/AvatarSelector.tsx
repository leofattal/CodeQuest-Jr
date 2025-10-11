"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, Lock, Coins as CoinsIcon } from "lucide-react";

interface Avatar {
  id: string;
  name: string;
  emoji: string;
  category: string;
  is_premium: boolean;
  coin_cost: number;
}

interface AvatarSelectorProps {
  studentId: string;
  currentCoins: number;
  selectedAvatarId: string | null;
  onAvatarSelect: (avatarId: string) => void;
}

export function AvatarSelector({ studentId, currentCoins, selectedAvatarId, onAvatarSelect }: AvatarSelectorProps) {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [purchasedAvatarIds, setPurchasedAvatarIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    async function fetchAvatars() {
      const supabase = createClient();

      // Fetch all avatars
      const { data, error } = await supabase
        .from("avatars")
        .select("*")
        .order("coin_cost", { ascending: true });

      if (error) {
        console.error("Error fetching avatars:", error);
      } else {
        setAvatars(data || []);
      }

      // Fetch purchased avatars
      const { data: purchasesData } = await supabase
        .from("student_purchases")
        .select("item_id")
        .eq("student_id", studentId)
        .eq("item_type", "avatar");

      if (purchasesData) {
        setPurchasedAvatarIds(new Set(purchasesData.map(p => p.item_id)));
      }

      setLoading(false);
    }

    fetchAvatars();
  }, [studentId]);

  const handleAvatarSelect = async (avatar: Avatar) => {
    const isOwned = purchasedAvatarIds.has(avatar.id);

    // If not owned and costs coins, purchase it
    if (!isOwned && avatar.coin_cost > 0) {
      if (currentCoins < avatar.coin_cost) {
        alert(`You need ${avatar.coin_cost - currentCoins} more coins to unlock this avatar!`);
        return;
      }

      const supabase = createClient();

      // Deduct coins, record purchase, and select avatar
      const { error: coinsError } = await supabase
        .from("students")
        .update({
          coins: currentCoins - avatar.coin_cost,
          selected_avatar_id: avatar.id
        })
        .eq("id", studentId);

      if (coinsError) {
        console.error("Error updating coins:", coinsError);
        alert("Failed to purchase avatar. Please try again.");
        return;
      }

      // Record the purchase
      await supabase
        .from("student_purchases")
        .insert({
          student_id: studentId,
          item_type: "avatar",
          item_id: avatar.id
        });

      // Update local state
      setPurchasedAvatarIds(prev => new Set(prev).add(avatar.id));
    } else {
      // Already owned or free, just select it
      const supabase = createClient();
      const { error } = await supabase
        .from("students")
        .update({ selected_avatar_id: avatar.id })
        .eq("id", studentId);

      if (error) {
        console.error("Error selecting avatar:", error);
        alert("Failed to select avatar. Please try again.");
        return;
      }
    }

    onAvatarSelect(avatar.id);
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading avatars...</div>;
  }

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(avatars.map(a => a.category)))];

  // Filter avatars by category
  const filteredAvatars = selectedCategory === "All"
    ? avatars
    : avatars.filter(a => a.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {filteredAvatars.map((avatar) => {
          const isSelected = avatar.id === selectedAvatarId;
          const isOwned = purchasedAvatarIds.has(avatar.id);
          const canAfford = currentCoins >= avatar.coin_cost;
          const isLocked = !isOwned && avatar.coin_cost > 0 && !canAfford;

          return (
            <button
              key={avatar.id}
              onClick={() => handleAvatarSelect(avatar)}
              disabled={isLocked}
              title={avatar.name}
              className={`relative aspect-square p-3 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-primary shadow-lg scale-105"
                  : isLocked
                  ? "border-muted opacity-50 cursor-not-allowed"
                  : "border-border hover:border-primary hover:shadow-md"
              }`}
            >
              {/* Avatar Emoji */}
              <div className="text-4xl mb-1">{avatar.emoji}</div>

              {/* Selected Check */}
              {isSelected && (
                <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Cost or Owned Badge */}
              {!isSelected && (
                <div className="absolute bottom-1 left-1 right-1 flex items-center justify-center gap-0.5 text-xs">
                  {isOwned ? (
                    <span className="text-green-600 font-medium">✓</span>
                  ) : avatar.coin_cost > 0 ? (
                    <div className={`flex items-center gap-0.5 ${canAfford ? "text-yellow-600" : "text-muted-foreground"}`}>
                      <CoinsIcon className="w-3 h-3" />
                      <span>{avatar.coin_cost}</span>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Lock Overlay */}
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
                  <Lock className="w-6 h-6 text-muted-foreground" />
                </div>
              )}

              {/* Premium Badge */}
              {avatar.is_premium && !isLocked && (
                <div className="absolute top-1 left-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full w-4 h-4 flex items-center justify-center">
                  <span className="text-[8px]">⭐</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
