"use client";

import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Homepage for CodeQuest Jr.
 * Main landing page with hero section and features
 * Redirects to dashboard if user is logged in
 */
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect logged-in users to dashboard
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Show landing page for non-logged-in users
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Features />
    </div>
  );
}
