# CodeQuest Jr. 🎮

> An adaptive, game-based platform that teaches kids (ages 8–14) to code through interactive quests, mini-games, and rewards.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.58.0-3ecf8e?logo=supabase)](https://supabase.com/)

---

## 🌟 Vision

Make coding as addictive and playful as Roblox or Duolingo. Kids solve coding puzzles and mini-games to earn coins, unlock power-ups, cosmetic upgrades, and special levels—all while learning real HTML, CSS, and JavaScript.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env.local` and configure your Supabase credentials:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

---

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup guide and project structure
- **[PRD.md](./PRD.md)** - Full Product Requirements Document

---

## 🎯 Core Features (MVP)

### Adaptive Learning Engine
- 5 coding worlds: HTML Basics, CSS Styling, JS Fundamentals, Loops & Logic, Events
- Each world has 5 progressive lessons + 1 boss mini-game
- Interactive code editor with live preview

### Gamification
- **Coin Economy:** 10 coins per correct answer
- **Shop System:** Unlock skins, power-ups, and bonus levels
- **XP & Levels:** Progress from level 1 to 50
- **Badges:** 15 achievements to collect

### Boss Mini-Games
- Memory match
- Code shooter
- Pattern builder
- Debug race
- Epic boss fight

### Player Profiles
- Track XP, coins, badges, and skill levels
- Parent/teacher progress dashboards (Phase 2)

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14+ (App Router, Server Components, Server Actions) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 + Framer Motion |
| **Backend** | Supabase (Auth, PostgreSQL, Storage) |
| **State** | Zustand |
| **Code Editor** | Monaco Editor |
| **Game Engine** | Phaser 3 |
| **Forms** | React Hook Form + Zod |
| **Hosting** | Vercel |

---

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/
│   ├── ui/           # Reusable UI components
│   ├── game/         # Game components
│   └── lesson/       # Lesson components
├── lib/
│   ├── supabase/     # Supabase clients
│   └── utils/        # Utility functions
├── stores/           # Zustand state management
├── types/            # TypeScript definitions
└── data/
    ├── lessons/      # Lesson content
    └── worlds/       # World metadata
```

---

## 🎨 Design System

### Colors
- **Primary:** `#8B5CF6` (Vibrant Purple)
- **Secondary:** `#3B82F6` (Electric Blue)
- **Accent:** `#FBBF24` (Sunshine Yellow - Coins)
- **Success:** `#10B981` (Bright Green)
- **Error:** `#EF4444` (Coral Red)

### Custom Animations
- `animate-bounce-in` - Reward entrance
- `animate-coin-rain` - Coin drop effect
- `animate-wobble` - Locked item shake

---

## 📋 Roadmap

### ✅ Phase 1 (Months 1-3) - MVP
- [x] Project setup with Next.js, Tailwind, Supabase
- [ ] 5 coding worlds with 25 lessons
- [ ] 5 boss mini-games
- [ ] Coin economy & shop
- [ ] User authentication
- [ ] Profile & badges system

### 🔄 Phase 2 (Months 4-6) - Enhancement
- [ ] AI hint system
- [ ] Parent/teacher dashboards
- [ ] Social sharing features
- [ ] 5 additional worlds

### 🔮 Phase 3 (Months 7-12) - Scale
- [ ] Mobile apps (iOS, Android)
- [ ] Multiplayer features
- [ ] Content creation tools
- [ ] Internationalization

---

## 🧪 Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Run Linter
```bash
npm run lint
```

---

## 🤝 Contributing

This is a private project currently in active development. Contributions will be opened once MVP is complete.

---

## 📄 License

All rights reserved. See PRD.md for details.

---

## 🎓 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Phaser Game Engine](https://phaser.io/docs)

---

**Built with ❤️ for young coders everywhere**
