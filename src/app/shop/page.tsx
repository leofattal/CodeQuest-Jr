"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/common/PageTransition";
import { createClient } from "@/lib/supabase/client";
import {
  ShoppingBag,
  Coins,
  Check,
  Lock,
  Sparkles
} from "lucide-react";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  icon: string;
  required_level: number;
  is_available: boolean;
}

interface InventoryItem {
  item_id: string;
  is_equipped: boolean;
}

/**
 * Shop Page
 * Browse and purchase items with earned coins
 */
export default function ShopPage() {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [purchasingItemId, setPurchasingItemId] = useState<string | null>(null);

  const categories = [
    { id: "all", name: "All Items", icon: "🛍️" },
    { id: "avatar", name: "Avatars", icon: "👤" },
    { id: "power-up", name: "Power-ups", icon: "⚡" },
    { id: "theme", name: "Themes", icon: "🎨" },
  ];

  useEffect(() => {
    async function fetchShopData() {
      try {
        const supabase = createClient();

        // Fetch shop items
        const { data: itemsData, error: itemsError } = await supabase
          .from("shop_items")
          .select("*")
          .eq("is_available", true)
          .order("category")
          .order("price");

        if (itemsError) {
          console.error("Error fetching shop items:", itemsError);
          return;
        }

        setItems(itemsData || []);

        // Fetch user inventory if logged in
        if (user) {
          const { data: inventoryData, error: inventoryError } = await supabase
            .from("student_inventory")
            .select("item_id, is_equipped")
            .eq("student_id", user.id);

          if (inventoryError) {
            console.error("Error fetching inventory:", inventoryError);
          } else {
            setInventory(inventoryData || []);
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

  const purchaseItem = async (item: ShopItem) => {
    if (!user || !profile) {
      alert("Please log in to purchase items!");
      return;
    }

    if (profile.coins < item.price) {
      alert(`Not enough coins! You need ${item.price - profile.coins} more coins.`);
      return;
    }

    if (profile.level < item.required_level) {
      alert(`You need to reach level ${item.required_level} to purchase this item!`);
      return;
    }

    if (inventory.some(inv => inv.item_id === item.id)) {
      alert("You already own this item!");
      return;
    }

    setPurchasingItemId(item.id);

    try {
      const supabase = createClient();

      // Deduct coins from user
      const newCoins = profile.coins - item.price;
      const { error: updateError } = await supabase
        .from("students")
        .update({ coins: newCoins })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating coins:", updateError);
        alert("Purchase failed. Please try again.");
        setPurchasingItemId(null);
        return;
      }

      // Add item to inventory
      const { error: inventoryError } = await supabase
        .from("student_inventory")
        .insert({
          student_id: user.id,
          item_id: item.id,
        });

      if (inventoryError) {
        console.error("Error adding to inventory:", inventoryError);

        // Refund coins if inventory insert failed
        await supabase
          .from("students")
          .update({ coins: profile.coins })
          .eq("id", user.id);

        alert("Purchase failed. Please try again.");
        setPurchasingItemId(null);
        return;
      }

      // Update local state
      setInventory([...inventory, { item_id: item.id, is_equipped: false }]);

      // Refresh profile to update coins display
      window.location.reload();
    } catch (error) {
      console.error("Error purchasing item:", error);
      alert("Purchase failed. Please try again.");
    } finally {
      setPurchasingItemId(null);
    }
  };

  const filteredItems = selectedCategory === "all"
    ? items
    : items.filter(item => item.category === selectedCategory);

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
              Spend your hard-earned coins on awesome items!
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

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No items in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => {
                const isOwned = inventory.some(inv => inv.item_id === item.id);
                const canAfford = profile ? profile.coins >= item.price : false;
                const meetsLevel = profile ? profile.level >= item.required_level : false;
                const isPurchasing = purchasingItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`bg-background rounded-xl border-2 overflow-hidden transition-all ${
                      isOwned
                        ? "border-green-500"
                        : meetsLevel && canAfford
                        ? "border-border hover:border-primary hover:shadow-xl"
                        : "border-muted opacity-75"
                    }`}
                  >
                    {/* Item Icon */}
                    <div className={`h-32 flex items-center justify-center text-6xl ${
                      isOwned ? "bg-green-50 dark:bg-green-950/20" : "bg-muted"
                    }`}>
                      {item.icon}
                    </div>

                    {/* Item Details */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        {isOwned && (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {item.description}
                      </p>

                      {/* Category Badge */}
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1 bg-muted rounded-full text-xs font-medium capitalize">
                          {item.category}
                        </span>
                      </div>

                      {/* Price and Requirements */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-yellow-600 font-bold">
                          <Coins className="w-4 h-4" />
                          <span>{item.price}</span>
                        </div>
                        {item.required_level > 1 && (
                          <div className={`text-xs ${
                            meetsLevel ? "text-muted-foreground" : "text-red-500"
                          }`}>
                            Level {item.required_level}+
                          </div>
                        )}
                      </div>

                      {/* Purchase Button */}
                      {isOwned ? (
                        <button
                          disabled
                          className="w-full py-2 rounded-lg bg-green-500 text-white font-semibold flex items-center justify-center gap-2"
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
                      ) : !meetsLevel ? (
                        <button
                          disabled
                          className="w-full py-2 rounded-lg bg-muted text-muted-foreground font-semibold flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4" />
                          Level {item.required_level} Required
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
                          onClick={() => purchaseItem(item)}
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
          )}
        </div>
      </div>
    </PageTransition>
  );
}
