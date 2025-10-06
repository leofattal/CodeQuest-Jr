import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";

/**
 * Homepage for CodeQuest Jr.
 * Main landing page with hero section and features
 */
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Features />
    </div>
  );
}
