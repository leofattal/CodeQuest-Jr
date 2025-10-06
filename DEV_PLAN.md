# CodeQuest Jr. - Development Plan

**Status:** Phase 1 - Sprint 1
**Last Updated:** October 4, 2025
**Current Completion:** 5% (Infrastructure Only)

---

## 📋 Overview

This document provides a detailed, actionable development plan for building CodeQuest Jr. MVP over 3 months (12 weeks).

### Development Approach
- **Methodology:** Agile with 1-week sprints
- **Focus:** Iterative development, test early and often
- **Priority:** Core features first, polish later

---

## 🎯 Phase 1: MVP Development (12 Weeks)

### Sprint Schedule

| Sprint | Week | Focus | Deliverables |
|--------|------|-------|--------------|
| 1 | 1 | Landing Page & Navigation | Homepage, Header, Footer |
| 2 | 2 | Authentication Foundation | Supabase auth, Login/Signup |
| 3 | 3 | Profile & User Data | User profiles, Coin display |
| 4 | 4 | World Map & Navigation | World selection, Progress tracking |
| 5 | 5 | Lesson Engine - Part 1 | Lesson viewer, Instructions |
| 6 | 6 | Lesson Engine - Part 2 | Monaco editor, Live preview |
| 7 | 7 | Code Validation & Coins | Answer checking, Coin rewards |
| 8 | 8 | First World Content | HTML Basics (5 lessons) |
| 9 | 9 | Mini-Game Framework | Game engine, First mini-game |
| 10 | 10 | Shop & Unlocks | Shop UI, Purchase flow |
| 11 | 11 | Additional Content | CSS & JS worlds |
| 12 | 12 | Polish & Launch Prep | Bug fixes, Testing, Deploy |

---

## 🚀 Sprint 1: Landing Page & Navigation (Week 1)

### Goals
- Replace default Next.js page with CodeQuest Jr. homepage
- Build core navigation structure
- Implement design system components

### Tasks

#### Day 1: Setup & Planning
- [x] Review PRD and create development plan
- [ ] Set up Supabase project
- [ ] Configure environment variables
- [ ] Create component library structure

#### Day 2: Core UI Components
- [ ] Build `Header` component
  - Logo/branding
  - Navigation menu
  - Coin counter (placeholder)
  - Profile icon
- [ ] Build `Footer` component
  - Links (About, Help, Terms, Privacy)
  - Social media links
  - Copyright

#### Day 3: Homepage Layout
- [ ] Create hero section
  - Catchy headline: "Learn to Code. Play. Earn Rewards!"
  - CTA button: "Start Your Adventure"
  - Animated background with gradient
- [ ] Build feature highlights section
  - 3 key benefits (Learn, Play, Earn)
  - Icons and descriptions

#### Day 4: Navigation & Routing
- [ ] Set up app routes structure
  ```
  /                    → Homepage
  /login               → Login page
  /signup              → Signup page
  /dashboard           → User dashboard
  /worlds              → World map
  /worlds/[id]         → World details
  /lessons/[id]        → Lesson viewer
  /shop                → Shop
  /profile             → User profile
  ```
- [ ] Create route protection (placeholder)
- [ ] Add loading states

#### Day 5: Polish & Testing
- [ ] Add animations (Framer Motion)
  - Page transitions
  - Button hover effects
  - Card animations
- [ ] Responsive testing (mobile, tablet, desktop)
- [ ] Playwright tests for homepage
- [ ] Deploy to Vercel preview

### Deliverables
- ✅ CodeQuest Jr. branded homepage
- ✅ Header with navigation
- ✅ Footer with links
- ✅ Basic routing structure
- ✅ Responsive design
- ✅ Deployed preview

### Success Metrics
- [ ] Homepage loads in < 1.5s
- [ ] All links functional
- [ ] Mobile responsive (375px)
- [ ] 0 console errors

---

## 🔐 Sprint 2: Authentication Foundation (Week 2)

### Goals
- Implement Supabase authentication
- Build login/signup flows
- Create session management

### Tasks

#### Day 1: Supabase Setup
- [ ] Create Supabase project
- [ ] Set up authentication tables
- [ ] Configure Row Level Security (RLS)
- [ ] Add auth providers (email/password)

#### Day 2: Auth Components
- [ ] Build `LoginForm` component
  - Email input
  - Password input
  - Submit button
  - "Forgot password" link
- [ ] Build `SignupForm` component
  - Email, password, confirm password
  - Parent email field
  - Terms acceptance checkbox

#### Day 3: Auth Logic
- [ ] Implement login function
- [ ] Implement signup function
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Session handling (cookies)

#### Day 4: Protected Routes
- [ ] Create auth middleware
- [ ] Protect dashboard routes
- [ ] Redirect logic (logged in → dashboard, logged out → login)
- [ ] Add loading states

#### Day 5: Testing & Polish
- [ ] Test auth flows end-to-end
- [ ] Error handling (wrong password, email exists, etc.)
- [ ] Add form validation (Zod)
- [ ] Playwright tests for auth

### Deliverables
- ✅ Working login/signup
- ✅ Session management
- ✅ Protected routes
- ✅ Email verification

---

## 👤 Sprint 3: Profile & User Data (Week 3)

### Goals
- Create user profile system
- Display coins and XP
- Build profile page

### Tasks

#### Day 1: Database Schema
- [ ] Create `profiles` table
- [ ] Create `transactions` table
- [ ] Set up RLS policies
- [ ] Seed initial data

#### Day 2: Profile Creation
- [ ] Auto-create profile on signup
- [ ] Profile fields (username, avatar, coins, XP, level)
- [ ] Profile fetching logic
- [ ] Zustand store integration

#### Day 3: Profile UI
- [ ] Build `ProfileCard` component
- [ ] Display username, level, XP bar
- [ ] Show total coins
- [ ] Avatar display
- [ ] Edit profile button (future)

#### Day 4: Coin System
- [ ] Create `CoinCounter` component (header)
- [ ] Display real-time coin balance
- [ ] Coin animation on update
- [ ] Transaction history view

#### Day 5: Testing & Integration
- [ ] Test profile creation flow
- [ ] Verify coin updates
- [ ] Check Zustand state management
- [ ] Playwright tests

### Deliverables
- ✅ User profiles
- ✅ Coin counter in header
- ✅ Profile page
- ✅ XP and leveling system

---

## 🗺️ Sprint 4: World Map & Navigation (Week 4)

### Goals
- Build interactive world map
- Show progress on each world
- Enable world selection

### Tasks

#### Day 1: World Data Structure
- [ ] Create `worlds` data file
  ```typescript
  {
    id: "html-basics",
    title: "HTML Basics",
    description: "Learn to build web pages",
    icon: "🏗️",
    color: "#8B5CF6",
    lessons: 5,
    locked: false
  }
  ```
- [ ] Add all 5 worlds

#### Day 2: World Map UI
- [ ] Build `WorldMap` component
- [ ] Grid layout for worlds
- [ ] `WorldCard` component
  - Icon, title, description
  - Progress bar (X/5 lessons)
  - Lock icon if locked
  - "Start" or "Continue" button

#### Day 3: Progress Tracking
- [ ] Create `lesson_progress` table
- [ ] Fetch user progress per world
- [ ] Calculate completion percentage
- [ ] Lock/unlock logic

#### Day 4: World Navigation
- [ ] Click world → navigate to world detail
- [ ] Show lesson list for selected world
- [ ] "Back to map" button
- [ ] Breadcrumb navigation

#### Day 5: Polish & Testing
- [ ] Animations (world cards pop in)
- [ ] Hover effects
- [ ] Responsive design
- [ ] Playwright tests

### Deliverables
- ✅ Interactive world map
- ✅ 5 worlds displayed
- ✅ Progress tracking
- ✅ World selection working

---

## 📚 Sprint 5-6: Lesson Engine (Weeks 5-6)

### Goals
- Build lesson viewer interface
- Integrate Monaco code editor
- Add live HTML preview

### Sprint 5 Tasks

#### Day 1-2: Lesson Data Structure
- [ ] Create lesson schema
- [ ] Build first HTML lesson content
- [ ] Instructions, starter code, validation rules

#### Day 3-4: Lesson Viewer UI
- [ ] Build `LessonViewer` component
- [ ] Left panel: Instructions
- [ ] Right panel: Code editor + preview
- [ ] Top bar: Lesson title, progress, coins

#### Day 5: Testing
- [ ] Test lesson loading
- [ ] Navigation between lessons
- [ ] Responsive layout

### Sprint 6 Tasks

#### Day 1-2: Monaco Editor Integration
- [ ] Install Monaco Editor
- [ ] Configure for HTML/CSS/JS
- [ ] Syntax highlighting
- [ ] Auto-completion

#### Day 3-4: Live Preview
- [ ] Create iframe for preview
- [ ] Update preview on code change
- [ ] Sandbox security
- [ ] Error handling

#### Day 5: Testing & Polish
- [ ] Test editor functionality
- [ ] Preview updates correctly
- [ ] Handle edge cases
- [ ] Playwright tests

### Deliverables
- ✅ Lesson viewer
- ✅ Monaco editor integrated
- ✅ Live preview working
- ✅ Instructions display

---

## ✅ Sprint 7: Code Validation & Coins (Week 7)

### Goals
- Implement code validation
- Award coins for correct answers
- Add hint system

### Tasks

#### Day 1-2: Validation Engine
- [ ] HTML validator (check for specific tags)
- [ ] CSS validator (check for properties)
- [ ] JS validator (check for syntax/logic)
- [ ] Pattern matching for requirements

#### Day 3: Coin Rewards
- [ ] "Submit" button functionality
- [ ] Validate code on submit
- [ ] Award 10 coins per correct answer
- [ ] Update coin balance in database
- [ ] Trigger coin animation

#### Day 4: Hint System
- [ ] Hint button (shows after 30s or 2 failures)
- [ ] Progressive hints (subtle → explicit)
- [ ] Deduct coins for hints (optional)
- [ ] Store hint usage

#### Day 5: Testing
- [ ] Test validation logic
- [ ] Verify coin awards
- [ ] Test hint system
- [ ] Playwright tests

### Deliverables
- ✅ Code validation working
- ✅ Coins awarded correctly
- ✅ Hint system functional
- ✅ Database updates

---

## 📖 Sprint 8: First World Content (Week 8)

### Goals
- Create all 5 HTML Basics lessons
- Write lesson content
- Test learning flow

### Tasks

#### Day 1: Lesson Planning
- [ ] Outline 5 HTML lessons
  1. First Web Page (h1, p)
  2. Links & Images
  3. Lists (ul, ol, li)
  4. Tables
  5. Forms

#### Day 2-4: Content Creation
- [ ] Write lesson instructions (kid-friendly)
- [ ] Create starter code
- [ ] Define validation rules
- [ ] Add helpful hints
- [ ] Test each lesson

#### Day 5: Polish & Testing
- [ ] User testing (try each lesson)
- [ ] Adjust difficulty
- [ ] Fix bugs
- [ ] Add screenshots to instructions

### Deliverables
- ✅ 5 HTML lessons complete
- ✅ All lessons tested
- ✅ Validation working
- ✅ Proper progression

---

## 🎮 Sprint 9: Mini-Game Framework (Week 9)

### Goals
- Build first boss mini-game
- Integrate Phaser 3
- Award coins on victory

### Tasks

#### Day 1-2: Phaser Setup
- [ ] Install Phaser 3
- [ ] Create game canvas component
- [ ] Basic game loop
- [ ] Asset loading

#### Day 3-4: Memory Match Game
- [ ] Design: Match HTML tags with descriptions
- [ ] 8 cards (4 pairs)
- [ ] Click to flip
- [ ] Match logic
- [ ] Win condition (all matched)

#### Day 5: Rewards & Integration
- [ ] Award 200 coins on victory
- [ ] Unlock next world
- [ ] Victory animation
- [ ] Replay button

### Deliverables
- ✅ First mini-game working
- ✅ Phaser integrated
- ✅ Coin rewards on win
- ✅ World unlock logic

---

## 🛒 Sprint 10: Shop & Unlocks (Week 10)

### Goals
- Build shop interface
- Implement purchase flow
- Add unlockable items

### Tasks

#### Day 1: Shop Data
- [ ] Create shop items (10 skins, 5 power-ups)
- [ ] Item properties (id, name, price, type, icon)
- [ ] Create `user_unlocks` table

#### Day 2-3: Shop UI
- [ ] Build `Shop` page
- [ ] Item grid with cards
- [ ] Show price, "Buy" or "Owned" status
- [ ] Filter by category (skins, power-ups)

#### Day 4: Purchase Logic
- [ ] Check if user has enough coins
- [ ] Deduct coins on purchase
- [ ] Add item to user_unlocks
- [ ] Update UI immediately

#### Day 5: Testing
- [ ] Test purchase flow
- [ ] Verify coin deduction
- [ ] Check unlock persistence
- [ ] Playwright tests

### Deliverables
- ✅ Shop page functional
- ✅ Items can be purchased
- ✅ Coins deducted correctly
- ✅ Unlocks saved to database

---

## 📚 Sprint 11: Additional Content (Week 11)

### Goals
- Add CSS Styling world (5 lessons)
- Add JS Fundamentals world (5 lessons)
- Create 2 more mini-games

### Tasks

#### Day 1-2: CSS World
- [ ] 5 CSS lessons (colors, fonts, layout, flexbox, styling)
- [ ] Validation rules for CSS
- [ ] Memory match mini-game (CSS properties)

#### Day 3-4: JS World
- [ ] 5 JS lessons (variables, console, math, strings, if/else)
- [ ] Validation for JS code
- [ ] Code shooter mini-game

#### Day 5: Testing
- [ ] Test all lessons
- [ ] Verify progression
- [ ] Check mini-games

### Deliverables
- ✅ CSS world complete (5 lessons)
- ✅ JS world complete (5 lessons)
- ✅ 2 additional mini-games
- ✅ 15 total lessons working

---

## 🎨 Sprint 12: Polish & Launch Prep (Week 12)

### Goals
- Bug fixes
- Performance optimization
- Prepare for launch

### Tasks

#### Day 1: Bug Fixes
- [ ] Fix all known bugs
- [ ] Handle edge cases
- [ ] Error handling improvements

#### Day 2: Performance
- [ ] Lighthouse audit
- [ ] Optimize images
- [ ] Code splitting
- [ ] Reduce bundle size

#### Day 3: Testing
- [ ] Full E2E testing
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] User acceptance testing

#### Day 4: Documentation
- [ ] Update README
- [ ] User guide
- [ ] Teacher/parent docs
- [ ] API documentation

#### Day 5: Launch
- [ ] Deploy to production (Vercel)
- [ ] Set up analytics
- [ ] Monitor errors (Sentry)
- [ ] Launch announcement

### Deliverables
- ✅ All bugs fixed
- ✅ Performance optimized
- ✅ Comprehensive testing
- ✅ Production deployment
- ✅ MVP launched! 🎉

---

## 📊 Progress Tracking

### Current Status
- [x] Infrastructure setup (Week 0)
- [ ] Sprint 1: Landing Page (Week 1) - **IN PROGRESS**
- [ ] Sprint 2: Authentication (Week 2)
- [ ] Sprint 3: Profile System (Week 3)
- [ ] Sprint 4: World Map (Week 4)
- [ ] Sprint 5-6: Lesson Engine (Weeks 5-6)
- [ ] Sprint 7: Validation & Coins (Week 7)
- [ ] Sprint 8: HTML Content (Week 8)
- [ ] Sprint 9: Mini-Games (Week 9)
- [ ] Sprint 10: Shop (Week 10)
- [ ] Sprint 11: More Content (Week 11)
- [ ] Sprint 12: Polish & Launch (Week 12)

### Weekly Checkins
- **Monday:** Review sprint goals
- **Wednesday:** Mid-sprint check
- **Friday:** Sprint retrospective, plan next week

---

## 🎯 Success Metrics

### Week 4 Checkpoint
- [ ] Authentication working
- [ ] User profiles created
- [ ] World map displays
- [ ] At least 1 lesson functional

### Week 8 Checkpoint
- [ ] 5 HTML lessons complete
- [ ] Monaco editor integrated
- [ ] Coin system working
- [ ] 1 mini-game functional

### Week 12 (MVP Launch)
- [ ] 15 lessons total
- [ ] 3 mini-games
- [ ] Shop functional
- [ ] 1,000 beta users signed up
- [ ] 60% retention rate

---

## 🚨 Risk Mitigation

### Technical Risks
1. **Monaco Editor Integration** - Complex, test early
2. **Phaser Performance** - Optimize assets, lazy load
3. **Supabase Rate Limits** - Monitor usage, upgrade plan if needed

### Timeline Risks
1. **Scope Creep** - Stick to MVP, defer nice-to-haves
2. **Content Creation Takes Longer** - Parallelize, get help if needed
3. **Testing Delays** - Test continuously, not at the end

---

## 📝 Notes

- **Focus:** Build features that directly impact learning and engagement
- **Defer:** Advanced analytics, social features, mobile apps (Phase 2)
- **Iterate:** Get user feedback early, adjust based on data

**Let's build something amazing! 🚀**
