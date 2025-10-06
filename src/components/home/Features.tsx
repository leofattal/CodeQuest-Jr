"use client";

import { Code, Gamepad2, Trophy, Sparkles, Users, Shield } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Features Section for CodeQuest Jr. Homepage
 * Highlights key benefits and features
 */

const features = [
  {
    icon: Code,
    title: "Learn Real Coding",
    description: "Master HTML, CSS, and JavaScript through interactive lessons designed for kids ages 8-14.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Gamepad2,
    title: "Play Mini-Games",
    description: "Battle bosses, solve puzzles, and unlock achievements. Every lesson feels like a game!",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: Trophy,
    title: "Earn Rewards",
    description: "Get 10 coins for every correct answer. Unlock skins, power-ups, and special levels!",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Sparkles,
    title: "Level Up",
    description: "Track your progress with XP, levels, and badges. Show off your achievements!",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Users,
    title: "Parent Dashboard",
    description: "Parents and teachers can track progress, view reports, and ensure safe learning.",
    color: "text-purple-500",
    bgColor: "bg-purple-100",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "COPPA compliant with parent controls. No chat, ads, or inappropriate content.",
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
          >
            Why Kids <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Love</span> CodeQuest Jr.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Learning to code has never been this fun! Our unique approach combines education with entertainment.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
              >
                <div className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
