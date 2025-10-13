"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/common/PageTransition";
import { createClient } from "@/lib/supabase/client";
import {
  ShoppingBag,
  Coins,
  Check,
  Sparkles,
  Palette,
  Smile
} from "lucide-react";

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

interface Avatar {
  id: string;
  name: string;
  emoji: string;
  category: string;
  is_premium: boolean;
  coin_cost: number;
}

/**
 * Shop Page
 * Browse and purchase themes and avatars with earned coins
 */
export default function ShopPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [purchasingItemId, setPurchasingItemId] = useState<string | null>(null);
  const [purchasedThemeIds, setPurchasedThemeIds] = useState<Set<string>>(new Set());
  const [purchasedAvatarIds, setPurchasedAvatarIds] = useState<Set<string>>(new Set());

  const categories = [
    { id: "all", name: "All Items", icon: "🛍️" },
    { id: "avatars", name: "Avatars", icon: "👤" },
    { id: "themes", name: "Themes", icon: "🎨" },
  ];

  useEffect(() => {
    async function fetchShopData() {
      try {
        const supabase = createClient();

        // Fetch themes
        const { data: themesData, error: themesError } = await supabase
          .from("themes")
          .select("*")
          .order("coin_cost");

        if (themesError) {
          console.error("Error fetching themes:", themesError);
        } else {
          setThemes(themesData || []);
        }

        // Fetch avatars
        const { data: avatarsData, error: avatarsError } = await supabase
          .from("avatars")
          .select("*")
          .order("coin_cost");

        if (avatarsError) {
          console.error("Error fetching avatars:", avatarsError);
        } else {
          setAvatars(avatarsData || []);
        }

        // Fetch purchased items for the current user
        if (user) {
          const { data: purchasesData, error: purchasesError } = await supabase
            .from("student_purchases")
            .select("theme_id, avatar_id")
            .eq("student_id", user.id);

          if (purchasesError) {
            console.error("Error fetching purchases:", purchasesError);
          } else if (purchasesData) {
            const themeIds = new Set(
              purchasesData
                .filter((p) => p.theme_id)
                .map((p) => p.theme_id!)
            );
            const avatarIds = new Set(
              purchasesData
                .filter((p) => p.avatar_id)
                .map((p) => p.avatar_id!)
            );
            setPurchasedThemeIds(themeIds);
            setPurchasedAvatarIds(avatarIds);
          }
        }
      } catch (error) {
        console.error("Error fetching shop data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchShopData();
  }, [user]);

  const purchaseTheme = async (theme: Theme) => {
    if (!user || !profile) {
      alert("Please log in to purchase items!");
      return;
    }

    if (profile.coins < theme.coin_cost) {
      alert(`Not enough coins! You need ${theme.coin_cost - profile.coins} more coins.`);
      return;
    }

    if (purchasedThemeIds.has(theme.id)) {
      alert("You already own this theme!");
      return;
    }

    setPurchasingItemId(theme.id);

    try {
      const supabase = createClient();

      // Deduct coins and select theme
      const { error: updateError } = await supabase
        .from("students")
        .update({
          coins: profile.coins - theme.coin_cost,
          selected_theme_id: theme.id
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error purchasing theme:", updateError);
        alert("Purchase failed. Please try again.");
        return;
      }

      // Record purchase in student_purchases table
      const { error: insertError } = await supabase
        .from("student_purchases")
        .insert({
          student_id: user.id,
          theme_id: theme.id,
          purchased_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("Error recording purchase:", insertError);
        // Don't alert here since the main purchase succeeded
      }

      // Update local state
      setPurchasedThemeIds(new Set([...purchasedThemeIds, theme.id]));

      alert(`${theme.name} purchased and equipped!`);
      await refreshProfile();
    } catch (error) {
      console.error("Error purchasing theme:", error);
      alert("Purchase failed. Please try again.");
    } finally {
      setPurchasingItemId(null);
    }
  };

  const purchaseAvatar = async (avatar: Avatar) => {
    if (!user || !profile) {
      alert("Please log in to purchase items!");
      return;
    }

    if (profile.coins < avatar.coin_cost) {
      alert(`Not enough coins! You need ${avatar.coin_cost - profile.coins} more coins.`);
      return;
    }

    if (purchasedAvatarIds.has(avatar.id)) {
      alert("You already own this avatar!");
      return;
    }

    setPurchasingItemId(avatar.id);

    try {
      const supabase = createClient();

      // Deduct coins and select avatar
      const { error: updateError } = await supabase
        .from("students")
        .update({
          coins: profile.coins - avatar.coin_cost,
          selected_avatar_id: avatar.id
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error purchasing avatar:", updateError);
        alert("Purchase failed. Please try again.");
        return;
      }

      // Record purchase in student_purchases table
      const { error: insertError } = await supabase
        .from("student_purchases")
        .insert({
          student_id: user.id,
          avatar_id: avatar.id,
          purchased_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("Error recording purchase:", insertError);
        // Don't alert here since the main purchase succeeded
      }

      // Update local state
      setPurchasedAvatarIds(new Set([...purchasedAvatarIds, avatar.id]));

      alert(`${avatar.name} purchased and equipped!`);
      await refreshProfile();
    } catch (error) {
      console.error("Error purchasing avatar:", error);
      alert("Purchase failed. Please try again.");
    } finally {
      setPurchasingItemId(null);
    }
  };

  // Filter items based on category
  const filteredThemes = selectedCategory === "all" || selectedCategory === "themes" ? themes : [];
  const filteredAvatars = selectedCategory === "all" || selectedCategory === "avatars" ? avatars : [];

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <p className="text-muted-foreground">Loading shop...</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <ShoppingBag className="w-10 h-10 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold">Shop</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Spend your hard-earned coins on awesome themes and avatars!
            </p>
          </div>

          {/* User Coins Display */}
          {user && profile && (
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-2xl p-6 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Coins className="w-12 h-12" />
                <div>
                  <div className="text-sm opacity-90">Your Balance</div>
                  <div className="text-3xl font-bold">{profile.coins} Coins</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">Level {profile.level}</div>
                <div className="text-lg">Keep learning to earn more!</div>
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Themes Section */}
          {filteredThemes.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Themes</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredThemes.map((theme) => {
                  const isPurchased = purchasedThemeIds.has(theme.id);
                  const isEquipped = profile?.selected_theme_id === theme.id;
                  const canAfford = profile ? profile.coins >= theme.coin_cost : false;
                  const isPurchasing = purchasingItemId === theme.id;

                  return (
                    <div
                      key={theme.id}
                      className={`bg-background rounded-xl border-2 overflow-hidden transition-all ${
                        isEquipped
                          ? "border-green-500"
                          : isPurchased
                          ? "border-blue-500"
                          : canAfford
                          ? "border-border hover:border-primary hover:shadow-xl"
                          : "border-muted opacity-75"
                      }`}
                    >
                      {/* Theme Preview */}
                      <div className="h-24 flex">
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

                      {/* Theme Details */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg">{theme.name}</h3>
                          {isEquipped && <Check className="w-5 h-5 text-green-500 flex-shrink-0" />}
                          {!isEquipped && isPurchased && <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">
                          {theme.description}
                        </p>

                        {/* Price */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-yellow-600 font-bold">
                            <Coins className="w-4 h-4" />
                            <span>{theme.coin_cost === 0 ? "Free" : theme.coin_cost}</span>
                          </div>
                          {theme.is_premium && (
                            <span className="text-xs bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-0.5 rounded-full">
                              Premium
                            </span>
                          )}
                        </div>

                        {/* Purchase Button */}
                        {isEquipped ? (
                          <button
                            disabled
                            className="w-full py-2 rounded-lg bg-green-500 text-white font-semibold flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Equipped
                          </button>
                        ) : isPurchased ? (
                          <button
                            disabled
                            className="w-full py-2 rounded-lg bg-blue-500 text-white font-semibold flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Owned
                          </button>
                        ) : !user ? (
                          <button
                            onClick={() => window.location.href = "/login"}
                            className="w-full py-2 rounded-lg bg-muted text-muted-foreground font-semibold"
                          >
                            Log in to purchase
                          </button>
                        ) : !canAfford ? (
                          <button
                            disabled
                            className="w-full py-2 rounded-lg bg-muted text-muted-foreground font-semibold"
                          >
                            Not Enough Coins
                          </button>
                        ) : (
                          <button
                            onClick={() => purchaseTheme(theme)}
                            disabled={isPurchasing}
                            className="w-full py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                          >
                            <Sparkles className="w-4 h-4" />
                            {isPurchasing ? "Purchasing..." : "Purchase"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Avatars Section */}
          {filteredAvatars.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Smile className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Avatars</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredAvatars.map((avatar) => {
                  const isPurchased = purchasedAvatarIds.has(avatar.id);
                  const isEquipped = profile?.selected_avatar_id === avatar.id;
                  const canAfford = profile ? profile.coins >= avatar.coin_cost : false;
                  const isPurchasing = purchasingItemId === avatar.id;

                  return (
                    <div
                      key={avatar.id}
                      className={`bg-background rounded-xl border-2 p-4 transition-all text-center ${
                        isEquipped
                          ? "border-green-500"
                          : isPurchased
                          ? "border-blue-500"
                          : canAfford
                          ? "border-border hover:border-primary hover:shadow-xl"
                          : "border-muted opacity-75"
                      }`}
                    >
                      {/* Avatar Emoji */}
                      <div className="text-5xl mb-2">{avatar.emoji}</div>

                      {/* Avatar Name */}
                      <h3 className="font-bold text-sm mb-2">{avatar.name}</h3>

                      {/* Price and Status */}
                      <div className="mb-3">
                        {isEquipped ? (
                          <div className="flex items-center justify-center gap-1 text-green-500 text-sm">
                            <Check className="w-4 h-4" />
                            Equipped
                          </div>
                        ) : isPurchased ? (
                          <div className="flex items-center justify-center gap-1 text-blue-500 text-sm">
                            <Check className="w-4 h-4" />
                            Owned
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1 text-yellow-600 text-sm font-bold">
                            <Coins className="w-3 h-3" />
                            <span>{avatar.coin_cost === 0 ? "Free" : avatar.coin_cost}</span>
                          </div>
                        )}
                      </div>

                      {/* Purchase Button */}
                      {!isPurchased && user && (
                        <button
                          onClick={() => purchaseAvatar(avatar)}
                          disabled={isPurchasing || !canAfford}
                          className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-opacity ${
                            canAfford
                              ? "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                              : "bg-muted text-muted-foreground cursor-not-allowed"
                          }`}
                        >
                          {isPurchasing ? "..." : canAfford ? "Buy" : "Locked"}
                        </button>
                      )}
                      {!isPurchased && !user && (
                        <button
                          onClick={() => window.location.href = "/login"}
                          className="w-full py-1.5 rounded-lg text-xs bg-muted text-muted-foreground font-semibold"
                        >
                          Login
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredThemes.length === 0 && filteredAvatars.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No items in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
