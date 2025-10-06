import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageTransition } from "@/components/common/PageTransition";

/**
 * Leaderboard Page - Coming Soon
 * Placeholder page for global leaderboard
 */
export default function LeaderboardPage() {
  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto flex items-center justify-center">
            <span className="text-4xl">🏆</span>
          </div>
          <h1 className="text-4xl font-bold">Leaderboard</h1>
          <p className="text-xl text-muted-foreground max-w-md">
            Leaderboard coming soon! Compete with coders worldwide and climb the ranks.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
