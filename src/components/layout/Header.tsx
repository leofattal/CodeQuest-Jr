"use client";

import Link from "next/link";
import { Coins, User, Menu, X, LogOut, Trophy, Star, Calendar } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

/**
 * Header Component for CodeQuest Jr.
 * Displays logo, navigation, coin counter, and user profile
 */
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
  };

  const userCoins = profile?.coins ?? 0;
  const isLoggedIn = !!user;

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/80">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <span className="text-2xl">🎮</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CodeQuest Jr.
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/worlds"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Worlds
            </Link>
            <Link
              href="/challenges"
              className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-1"
            >
              <Calendar className="w-4 h-4" />
              Daily
            </Link>
            <Link
              href="/shop"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Shop
            </Link>
            <Link
              href="/leaderboard"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Leaderboard
            </Link>
          </div>

          {/* Right side: Stats & Profile */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                {/* Level */}
                <div className="flex items-center space-x-1.5 bg-purple-500/20 px-3 py-1.5 rounded-full border border-purple-500/30">
                  <Star className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-bold text-purple-700 dark:text-purple-300">Lv {profile?.level ?? 1}</span>
                </div>

                {/* XP */}
                <div className="flex items-center space-x-1.5 bg-blue-500/20 px-3 py-1.5 rounded-full border border-blue-500/30">
                  <Trophy className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{profile?.xp ?? 0} XP</span>
                </div>

                {/* Coins */}
                <div className="flex items-center space-x-1.5 bg-yellow-500/20 px-3 py-1.5 rounded-full border border-yellow-500/30">
                  <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                  <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">{userCoins}</span>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    aria-label="Profile menu"
                  >
                    <User className="w-5 h-5 text-white" />
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-semibold truncate">{profile?.display_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center space-x-2 text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border animate-in slide-in-from-top">
            {isLoggedIn && (
              <div className="space-y-2 px-2">
                {/* Level */}
                <div className="flex items-center justify-between py-2 px-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Level</span>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-purple-500" />
                    <span className="font-bold text-purple-700 dark:text-purple-300">{profile?.level ?? 1}</span>
                  </div>
                </div>

                {/* XP */}
                <div className="flex items-center justify-between py-2 px-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">XP</span>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-blue-700 dark:text-blue-300">{profile?.xp ?? 0}</span>
                  </div>
                </div>

                {/* Coins */}
                <div className="flex items-center justify-between py-2 px-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Coins</span>
                  <div className="flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                    <span className="font-bold text-yellow-700 dark:text-yellow-300">{userCoins}</span>
                  </div>
                </div>
              </div>
            )}

            <Link
              href="/worlds"
              className="block px-2 py-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Worlds
            </Link>
            <Link
              href="/challenges"
              className="block px-2 py-2 rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Calendar className="w-4 h-4" />
              Daily Challenges
            </Link>
            <Link
              href="/shop"
              className="block px-2 py-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/leaderboard"
              className="block px-2 py-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Leaderboard
            </Link>

            {isLoggedIn ? (
              <div className="space-y-2 pt-2 border-t border-border">
                <Link
                  href="/profile"
                  className="block px-2 py-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-2 py-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-2 py-2 rounded-lg hover:bg-muted transition-colors flex items-center space-x-2 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-border">
                <Link
                  href="/login"
                  className="block px-2 py-2 text-center rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="block px-2 py-2 text-center rounded-lg bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-opacity"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
