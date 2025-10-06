# Product Requirements Document: CodeQuest Jr.

## Executive Summary

CodeQuest Jr. is an adaptive, game-based learning platform that teaches children ages 8-14 to code through interactive quests, mini-games, and a rewarding coin economy. By combining the addictive gameplay mechanics of popular platforms like Roblox with educational coding content, CodeQuest Jr. transforms learning to code into an engaging adventure where every correct answer fuels progression and unlocks exciting rewards.

---

## Problem Statement

**Current State:**
- Traditional coding education for kids is often dry, text-heavy, and fails to maintain engagement
- Existing coding platforms lack the gamification depth that modern children expect from digital experiences
- Parents and teachers struggle to track meaningful progress in coding skills
- Kids lose motivation when coding feels like "work" rather than play

**Desired State:**
- Coding becomes as addictive and enjoyable as the games kids already love
- Learning happens through play, with immediate feedback and tangible rewards
- Progress is transparent and trackable for educators and parents
- Children develop real coding skills while having fun

**Impact:**
Without engaging coding education, we risk a generation of children unprepared for a tech-driven future. CodeQuest Jr. bridges the gap between entertainment and education, making coding accessible and exciting for young learners.

---

## Target Audience

### Primary Users: Children (Ages 8-14)
- **Early Learners (8-10):** Visual thinkers who need concrete examples and immediate feedback
- **Middle Learners (11-12):** Beginning to think abstractly, enjoy challenges and competition
- **Advanced Learners (13-14):** Ready for more complex logic, appreciate creative freedom

### Secondary Users: Parents & Teachers
- Want to monitor progress and ensure educational value
- Need simple dashboards showing skill development
- Desire safe, controlled learning environments

### User Personas

**Persona 1: Alex (Age 10)**
- Loves Minecraft and Roblox
- Gets bored with traditional homework
- Motivated by collecting items and leveling up
- Needs: Visual feedback, quick wins, variety in activities

**Persona 2: Maya (Age 13)**
- Interested in game design
- Wants to create her own projects
- Competitive with friends
- Needs: Creative challenges, social recognition, real-world applications

**Persona 3: Sarah (Parent/Teacher)**
- Wants educational screen time for kids
- Needs to track learning outcomes
- Limited technical knowledge
- Needs: Simple dashboards, progress reports, safety controls

---

## User Stories

### Student User Stories
1. **As a new player**, I want to create a character and start my first quest so I can begin learning immediately
2. **As a learner**, I want to solve coding puzzles that feel like games so I stay engaged and motivated
3. **As a student**, I want to earn coins for correct answers so I can unlock cool rewards
4. **As a player**, I want to customize my avatar with skins and power-ups so I can express myself
5. **As a competitive learner**, I want to see my badges and achievements so I can track my progress
6. **As a stuck student**, I want hints when I'm confused so I don't get frustrated and quit
7. **As a creative kid**, I want to share my achievements with friends so they can see what I've accomplished
8. **As an advanced learner**, I want harder challenges so I don't get bored

### Parent/Teacher User Stories
1. **As a parent**, I want to see which coding skills my child has mastered so I understand their progress
2. **As a teacher**, I want to track multiple students' progress so I can identify who needs help
3. **As a guardian**, I want to ensure safe interactions so my child is protected online
4. **As an educator**, I want to align lessons with curriculum standards so this supplements school learning

---

## Feature List & Priorities

### MVP Features (Phase 1 - 3 months)

#### Core Learning Engine
- **Adaptive Lesson System** (P0)
  - 5 coding worlds: HTML Basics, CSS Styling, JS Fundamentals, Loops & Logic, Events & Interactivity
  - Each world contains 5 progressive lessons
  - Content adapts based on student performance
  - Interactive code editor with live preview

- **Quest & Mini-Game System** (P0)
  - 1 boss mini-game per world (5 total)
  - Game types: Memory match, code shooter, pattern builder, debug race, boss fight
  - Correct code answers fuel gameplay mechanics
  - Immediate visual feedback on success/failure

- **Coin Economy** (P0)
  - 10 coins per correct answer
  - 50 coins for completing a lesson
  - 200 coins for defeating a boss
  - Coin balance persisted to database

#### Progression & Rewards
- **Player Profile System** (P0)
  - XP tracking (levels 1-50)
  - Coin wallet
  - Badge collection (15 MVP badges)
  - Skills dashboard showing mastery levels

- **Unlock Shop** (P1)
  - 10 avatar skins (50-200 coins each)
  - 5 power-ups (hint tokens, time extensions, XP boosters)
  - 3 special bonus levels

#### Technical Infrastructure
- **Authentication System** (P0)
  - Supabase Auth integration
  - Email/password signup for parents
  - Child account creation under parent control
  - Session management

- **Data Persistence** (P0)
  - User progress saved to Supabase
  - Coin balances synced
  - Lesson completion tracking
  - Real-time updates

#### UI/UX
- **Kid-Friendly Interface** (P0)
  - Bright, colorful design system
  - Large, clear buttons and text
  - Smooth animations and transitions
  - Reward celebration animations
  - Mobile-responsive (tablet priority)

### Post-MVP Features (Phase 2 - 6 months)

#### Enhanced Learning
- **AI Hint System** (P1)
  - Context-aware coding hints
  - Progressive hint levels (subtle → explicit)
  - Natural language explanations

- **Additional Content** (P1)
  - 5 more worlds (Arrays, Functions, Objects, DOM Manipulation, Projects)
  - Advanced mini-games
  - Creative sandbox mode

#### Social & Community
- **Safe Social Features** (P1)
  - Read-only achievement sharing
  - Friend badges (no direct messaging)
  - Classroom leaderboards (opt-in)
  - "Inspire Others" showcase

#### Parent/Teacher Tools
- **Progress Dashboard** (P1)
  - Detailed skill mastery reports
  - Time-on-task analytics
  - Strengths/weaknesses visualization
  - Weekly progress emails

- **Teacher Portal** (P2)
  - Class management
  - Assignment creation
  - Student progress comparison
  - Curriculum alignment tools

### Future Roadmap (Phase 3 - 12+ months)

- **Mobile Apps** (P2)
  - iOS and Android native apps
  - Offline mode for lessons

- **Advanced Languages** (P2)
  - Python fundamentals
  - Block-based coding option for younger kids

- **Content Creation** (P3)
  - Student-built mini-games
  - Share-your-code gallery
  - Remix other students' projects

- **Multiplayer** (P3)
  - Co-op coding challenges
  - Code competitions
  - Team quests

---

## Technical Approach

### Architecture Overview

```
┌─────────────────────────────────────┐
│       Frontend (Next.js 14+)        │
│  - React Server Components          │
│  - App Router                       │
│  - API Routes                       │
│  - UI Components                    │
│  - Game Engine (Phaser/Canvas)      │
│  - Code Editor (Monaco/CodeMirror)  │
└─────────────────┬───────────────────┘
                  │
                  │ REST/GraphQL/Server Actions
                  │
┌─────────────────▼───────────────────┐
│         Supabase Backend            │
│  - Auth (JWT)                       │
│  - PostgreSQL Database              │
│  - Real-time Subscriptions          │
│  - Storage (avatars/assets)         │
└─────────────────────────────────────┘
```

### Technology Stack

#### Frontend (MVP)
- **Framework:** Next.js 14+ with TypeScript
  - App Router for modern routing patterns
  - React Server Components for optimal performance
  - Server Actions for mutations
  - API Routes for backend logic
- **Styling:** Tailwind CSS + Framer Motion for animations
- **Code Editor:** Monaco Editor (VS Code engine) or CodeMirror
- **Game Engine:** Phaser 3 or HTML5 Canvas for mini-games
- **State Management:** React Context API + Zustand (lightweight alternative to Redux)
- **Form Handling:** React Hook Form + Zod for validation

#### Backend
- **BaaS:** Supabase
  - Authentication & user management
  - PostgreSQL database with Row Level Security
  - Real-time subscriptions for live updates
  - Storage for user avatars and assets

#### Database Schema (Key Tables)

```sql
-- Users
users (
  id uuid PRIMARY KEY,
  email text,
  parent_email text,
  created_at timestamp,
  is_child boolean
)

-- Player Profiles
profiles (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users,
  username text,
  avatar_skin text,
  total_coins integer DEFAULT 0,
  total_xp integer DEFAULT 0,
  level integer DEFAULT 1
)

-- Progress Tracking
lesson_progress (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users,
  world_id text,
  lesson_id text,
  completed boolean,
  stars_earned integer,
  completed_at timestamp
)

-- Coin Transactions
transactions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users,
  amount integer,
  type text, -- 'earn' or 'spend'
  source text, -- 'lesson', 'boss', 'purchase'
  created_at timestamp
)

-- Unlockables
user_unlocks (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users,
  item_type text, -- 'skin', 'powerup', 'level'
  item_id text,
  unlocked_at timestamp
)
```

#### Game Logic Architecture
- **Hybrid Approach:** Leverage Next.js server/client split
  - **Client Components:** Interactive game UI, animations, code editor
  - **Server Components:** Static content, lesson data, leaderboards
  - **Server Actions:** Coin transactions, progress updates, purchases
  - **API Routes:** Code validation, real-time game state
- **Validation:** Server-side coin earning validation to prevent cheating
- **Adaptive Logic:** Simple algorithm tracking success rate per lesson
  - < 60% correct: Offer hints, slow progression
  - 60-85% correct: Normal progression
  - > 85% correct: Skip optional content, harder challenges

### Hosting & Deployment
- **Frontend Hosting:** Vercel (recommended for Next.js, auto-deploy from Git)
  - Edge functions for globally distributed API routes
  - Automatic preview deployments for PRs
  - Built-in analytics and monitoring
- **CDN:** Vercel Edge Network (included) or Cloudflare for additional asset optimization
- **Domain:** codequestjr.com
- **SSL:** Automatic via hosting provider

### Security Considerations
- Row-level security (RLS) on all Supabase tables
- Child accounts linked to parent emails
- No direct child-to-child communication
- Input sanitization on code editor
- Rate limiting on coin earning endpoints
- COPPA compliance for users under 13

### Performance Targets
- **Core Web Vitals (Next.js optimized):**
  - Largest Contentful Paint (LCP) < 2.5s
  - First Input Delay (FID) < 100ms
  - Cumulative Layout Shift (CLS) < 0.1
- **Additional Targets:**
  - First Contentful Paint < 1.5s
  - Time to Interactive < 3s
  - 60fps for all game animations
  - < 100ms response time for code validation
  - Support 10,000 concurrent users (future)

### Next.js-Specific Optimizations
- **Image Optimization:** Next.js `<Image>` component for automatic WebP/AVIF conversion
- **Font Optimization:** Next.js font loading with `next/font` to eliminate layout shift
- **Code Splitting:** Automatic route-based code splitting
- **Prefetching:** Smart prefetching of lesson content on world map hover
- **Streaming SSR:** Stream lesson content for faster perceived load times
- **Edge Caching:** Cache static lesson content at CDN edge locations

---

## Monetization Strategy

### Revenue Model: Freemium + Optional Premium

#### Free Tier (Core Product)
- Access to all 5 MVP worlds (25 lessons)
- All 5 boss mini-games
- Basic avatar customization (5 free skins)
- Core coin earning and spending
- Basic progress tracking

**Goal:** Maximize user acquisition and engagement

#### Premium Unlocks (Microtransactions)
- **Cosmetic Shop**
  - Premium avatar skins: $0.99 - $2.99 each
  - Animated effects/emotes: $1.99
  - Exclusive themes: $2.99

- **Power-Up Packs**
  - Hint Token Bundle (10 hints): $1.99
  - XP Booster (2x for 7 days): $3.99
  - Coin Doubler (24 hours): $2.99

- **Premium Worlds**
  - Advanced content packs: $4.99 each
  - Specialty tracks (game dev, web dev): $9.99

#### Parent/Teacher Subscription
- **"Parent Insights" - $4.99/month or $49/year**
  - Detailed progress dashboards
  - Weekly skill reports via email
  - Learning recommendations
  - Up to 3 child accounts

- **"Teacher Edition" - $19.99/month or $199/year**
  - Up to 30 student accounts
  - Class management tools
  - Assignment creation
  - Standards alignment reports
  - Priority support

#### Pricing Philosophy
- Core learning always free to reduce barriers
- Cosmetic items priced for impulse purchases
- Subscriptions targeted at decision-makers (parents/teachers)
- No pay-to-win mechanics (can't buy skill progression)

### Revenue Projections (Year 1)

Assumptions:
- 10,000 active users by Month 6
- 50,000 active users by Month 12
- 5% premium conversion rate
- $3 average transaction value

**Conservative Estimate:**
- Month 6: 500 paying users × $3 = $1,500/month
- Month 12: 2,500 paying users × $3 = $7,500/month
- Year 1 Total: ~$50,000

**With Subscriptions (Month 12):**
- 500 parent subs × $4.99 = $2,495/month
- 50 teacher subs × $19.99 = $1,000/month
- Total: ~$11,000/month = $132,000/year

---

## Success Metrics

### North Star Metric
**Weekly Active Learners (WAL)** - Unique students who complete at least 1 lesson per week

### Key Performance Indicators (KPIs)

#### Engagement Metrics
- **Daily Active Users (DAU):** Target 40% of registered users
- **Weekly Active Users (WAU):** Target 70% of registered users
- **Session Duration:** Target 20+ minutes average
- **Lessons per Session:** Target 2.5 lessons
- **7-Day Retention:** Target 60%
- **30-Day Retention:** Target 35%

#### Learning Metrics
- **Lesson Completion Rate:** Target 75% of started lessons
- **World Completion Rate:** Target 40% complete first world
- **Average Attempts per Lesson:** Target < 2.5 (shows appropriate difficulty)
- **Hint Usage Rate:** Track to optimize difficulty
- **Boss Battle Win Rate:** Target 60-70% on first attempt

#### Monetization Metrics
- **Conversion Rate (Free to Paid):** Target 5% within 30 days
- **Average Revenue Per User (ARPU):** Target $0.50/month
- **Average Revenue Per Paying User (ARPPU):** Target $10/month
- **Lifetime Value (LTV):** Target $25 per user
- **Customer Acquisition Cost (CAC):** Target < $15

#### Virality & Growth
- **Viral Coefficient (K-factor):** Target 0.3 (each user brings 0.3 new users)
- **Achievement Share Rate:** % of users sharing accomplishments
- **Parent Recommendation Rate (NPS):** Target 50+
- **Organic vs. Paid User Ratio:** Target 60% organic by Month 6

### Success Criteria by Phase

#### MVP Success (Month 3)
✅ 1,000 registered users
✅ 60% 7-day retention
✅ 75% lesson completion rate
✅ 3% conversion to paid

#### Growth Success (Month 6)
✅ 10,000 registered users
✅ 65% 7-day retention
✅ 25% complete first 3 worlds
✅ 5% conversion to paid
✅ $5,000 monthly revenue

#### Scale Success (Month 12)
✅ 50,000 registered users
✅ 70% WAU
✅ 40% complete all MVP worlds
✅ $100,000+ annual revenue
✅ NPS score > 50

### Analytics Implementation
- **Tools:** Mixpanel or Amplitude for event tracking
- **Key Events to Track:**
  - User signup (child vs parent)
  - Lesson start/complete
  - Code submission (correct/incorrect)
  - Coin earn/spend
  - Boss battle attempts/wins
  - Shop purchases
  - Achievement unlocks
  - Share actions

---

## User Experience & Design

### Design Principles
1. **Playful, Not Babyish:** Appeal to older kids while staying accessible for younger ones
2. **Immediate Feedback:** Every action has a visual/audio response
3. **Celebrate Success:** Rewards pop with animation and sound
4. **Clear Progression:** Always show "what's next" and "how close am I"
5. **Reduce Friction:** Minimize clicks between fun moments

### Visual Design System

#### Color Palette
- **Primary:** Vibrant Purple (#8B5CF6) - Magic/adventure theme
- **Secondary:** Electric Blue (#3B82F6) - Tech/coding feel
- **Accent:** Sunshine Yellow (#FBBF24) - Coins/rewards
- **Success:** Bright Green (#10B981) - Correct answers
- **Error:** Coral Red (#EF4444) - Wrong answers, not harsh
- **Background:** Soft gradients (purple → blue)

#### Typography
- **Headings:** Rounded sans-serif (Nunito, Quicksand)
- **Body:** Clean, readable (Inter, Open Sans)
- **Code:** Monospace (Fira Code, JetBrains Mono)
- **Sizes:** Large (minimum 16px body, 24px+ headings for kids)

#### Animation Principles
- Bounce/spring animations for rewards
- Smooth 300ms transitions
- Particle effects for coins
- Wobble animations for locked items
- Progress bars that "fill up" satisfyingly

### Key Screens & Flows

#### 1. Onboarding Flow
1. **Welcome Screen:** Animated hero, "Start Your Adventure" CTA
2. **Character Creation:** Choose avatar base (8 options)
3. **Parent Email:** "Have a parent enter their email for progress updates"
4. **Tutorial Quest:** Interactive first lesson with guide character
5. **First Coins Earned:** Big celebration, explain the shop

#### 2. Main Dashboard (Home)
- **Header:** Coins, XP bar, level indicator
- **Hero Section:** Current quest/lesson with big "Continue" button
- **World Map:** 5 worlds displayed as islands/planets with progress %
- **Quick Actions:** Shop, Profile, Achievements (bottom nav)

#### 3. Lesson/Quest Screen
- **Top Bar:** Coins, timer (if applicable), progress dots
- **Code Editor:** Left side (50% width on desktop)
- **Live Preview:** Right side (50% width)
- **Instructions:** Collapsible panel, simple language
- **Hint Button:** Available after 30 seconds or 2 failed attempts
- **Submit Button:** Large, colorful, changes based on code validity

#### 4. Mini-Game Screen
- **Example: Code Shooter Game**
  - Enemy ships approach with coding questions
  - Multiple choice answers as ammo
  - Select correct answer to shoot and destroy ship
  - Wrong answer = ship gets closer
  - 5 ships destroyed = boss battle won
  - Coins rain down at victory

#### 5. Shop/Customization
- **Avatar Preview:** Center, rotates on hover
- **Item Grid:** Cards with price, "Unlock" or "Equipped" status
- **Categories:** Skins, Power-ups, Bonus Levels
- **Balance:** Prominent coin count, pulse when updated

#### 6. Profile & Achievements
- **Stats Overview:** Total XP, Lessons completed, Bosses defeated, Streak
- **Badge Wall:** Grid of earned badges (grayed out if locked)
- **Skills Chart:** Radar/bar chart showing HTML/CSS/JS mastery
- **Share Button:** Generate achievement image for sharing

### Accessibility Considerations
- High contrast mode toggle
- Keyboard navigation support
- Screen reader compatibility for menus
- Adjustable text sizes
- Dyslexia-friendly font option
- Color-blind safe palette

---

## Go-to-Market Strategy

### Pre-Launch (Month -2 to 0)
- Build landing page with email capture
- Create demo video showing gameplay
- Reach out to 20 parent bloggers/influencers
- Partner with 3-5 teachers for beta testing
- Set up social media (Instagram, TikTok, YouTube)

### Launch (Month 0-1)
- **Product Hunt launch** - Day 1
- **Press release** to education tech publications
- **Influencer campaign:** 10 micro-influencers (parent/teacher niche)
- **Teacher outreach:** Free access for first 100 educators
- **Reddit/Facebook groups:** Post in parenting and education communities

### Growth (Month 2-6)
- **Content marketing:** SEO-optimized blog posts on "teaching kids to code"
- **YouTube tutorials:** How-to videos and student success stories
- **Referral program:** "Invite a friend, both get 100 coins"
- **School partnerships:** Pilot programs with 10 schools
- **Paid ads:** Facebook/Instagram targeting parents (start with $1,000/month)

### Channels
1. **Organic Social:** Educational content on TikTok/Instagram Reels
2. **SEO:** Target keywords like "coding games for kids," "learn JavaScript for children"
3. **Influencers:** Micro-influencers in parenting/education (50-100k followers)
4. **Schools:** Direct outreach to computer science teachers
5. **Paid Search:** Google Ads for high-intent keywords
6. **Communities:** Reddit (r/learnprogramming, r/Parenting), Facebook groups

### Acquisition Cost Targets
- Organic: $0-5 per user
- Paid Social: $10-15 per user
- Paid Search: $15-25 per user
- Blended CAC Target: < $15

---

## Development Roadmap

### Phase 1: MVP Development (Months 1-3)

**Month 1: Foundation**
- Week 1-2: Next.js 14 project setup, App Router structure, Tailwind design system, Supabase authentication
- Week 3-4: Database schema, Supabase integration, core lesson framework with Server Components

**Month 2: Core Features**
- Week 1-2: Lesson engine with Server Actions, Monaco code editor integration, 2 worlds built (HTML, CSS)
- Week 3-4: Coin system with Server Actions validation, basic shop, profile page with dynamic routes

**Month 3: Games & Polish**
- Week 1-2: 3 mini-games built (client components), remaining worlds (JS, Loops, Events)
- Week 3: Beta testing with 50 users, performance optimization (Next.js bundle analysis), bug fixes
- Week 4: Launch prep, SEO metadata, OpenGraph images, final polish, Vercel production deployment

**MVP Deliverables:**
✅ 5 coding worlds, 25 lessons total
✅ 5 boss mini-games
✅ Coin earning and shop system
✅ User authentication and progress saving
✅ Basic analytics integration

### Phase 2: Enhancement (Months 4-6)

**Month 4:**
- AI hint system integration
- 10 new premium skins
- Parent dashboard (basic version)

**Month 5:**
- 2 additional worlds (Arrays, Functions)
- Advanced mini-games
- Social sharing features

**Month 6:**
- Teacher portal (basic version)
- Mobile responsiveness optimization
- Performance improvements

### Phase 3: Scale (Months 7-12)

**Months 7-9:**
- Native mobile apps (iOS, Android)
- 5 more advanced worlds
- Multiplayer features (co-op challenges)

**Months 10-12:**
- Content creation tools (student projects)
- Advanced analytics and reporting
- Internationalization (Spanish, French)

---

## Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Supabase downtime | High | Low | Implement offline mode, use Supabase's 99.9% SLA tier |
| Game performance issues | Medium | Medium | Optimize assets, use lazy loading, performance budgets |
| Code editor compatibility | Medium | Low | Use battle-tested Monaco, extensive browser testing |
| Data loss | High | Low | Automated backups, transaction logs, version control |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low user acquisition | High | Medium | Diverse marketing channels, viral features, referral program |
| Poor retention | High | Medium | A/B test onboarding, add more content quickly, engagement hooks |
| Monetization failure | High | Medium | Multiple revenue streams, test pricing, add value before asking for money |
| Competitor launch | Medium | Medium | Focus on unique gamification, build community, iterate quickly |

### Compliance Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| COPPA violations | High | Low | Parent email verification, no child data selling, privacy policy |
| Payment processing issues | Medium | Low | Use Stripe/PayPal, comply with PCI DSS |
| Content safety | Medium | Low | Moderated sharing, no direct messaging, content filters |

---

## Team & Resources

### Required Roles (MVP)

**Engineering (3 people)**
- 1 Next.js/React Developer (frontend, games, server components)
- 1 Full-stack Developer (Next.js API routes, Supabase, backend logic)
- 1 Designer/Frontend hybrid (UI/UX + Next.js client components)

**Content & Design (2 people)**
- 1 Curriculum Designer (coding lessons)
- 1 UI/UX Designer (game feel)

**Optional:**
- 1 QA/Tester (can be part-time)
- 1 Marketing/Community Manager (post-launch)

### Budget Estimate (MVP - 3 months)

**Personnel:** $60,000 - $90,000
- 3 developers × $5,000-7,500/month × 3 months

**Tools & Services:** $1,000
- Supabase: $25/month (Pro tier)
- Vercel: $20/month (Pro tier for team features, free tier available)
- Analytics: Free tier (Vercel Analytics or Mixpanel)
- Design tools: $50/month (Figma)
- Domain/SSL: Minimal (~$15/year)

**Marketing (Pre-launch):** $2,000
- Landing page ads: $1,000
- Influencer partnerships: $1,000

**Total MVP Budget:** $63,000 - $93,000

---

## Success Criteria & Launch Checklist

### Pre-Launch Checklist
- [ ] 5 worlds with 25 lessons functional
- [ ] All 5 boss mini-games tested
- [ ] Coin economy working end-to-end
- [ ] 10 skins and 5 power-ups in shop
- [ ] Authentication and data persistence stable
- [ ] 50 beta testers completed onboarding
- [ ] 75%+ lesson completion rate in beta
- [ ] Mobile/tablet responsive on iOS and Android
- [ ] Analytics tracking all key events
- [ ] Privacy policy and terms of service published
- [ ] Payment processing tested (if monetization live)
- [ ] Customer support email set up

### Launch Day Goals
- [ ] 100 signups in first 24 hours
- [ ] < 5% error rate
- [ ] Product Hunt top 10 in Education
- [ ] 3+ media mentions

### 30-Day Post-Launch Goals
- [ ] 1,000+ registered users
- [ ] 60%+ 7-day retention
- [ ] 70%+ lesson completion rate
- [ ] 2%+ conversion to paid
- [ ] NPS score > 40

---

## Appendix

### A. Sample Lesson Structure (World 1: HTML Basics, Lesson 1)

**Title:** "Build Your First Web Page"

**Learning Objective:** Students will create a basic HTML page with heading and paragraph tags.

**Lesson Flow:**
1. **Intro (30s):** Animated character says "Let's build a website! Every site starts with HTML."
2. **Concept (1min):** Visual explanation of tags: `<h1>Heading</h1>` and `<p>Text</p>`
3. **Guided Practice (2min):**
   - Editor pre-filled: `<h1>My First Page</h1>`
   - Instructions: "Add a paragraph below using `<p>` tags"
   - Live preview updates as they type
4. **Challenge (2min):**
   - "Add 3 more paragraphs about your favorite game"
   - Submit when done
5. **Validation:**
   - Check for `<p>` tags (must have at least 1)
   - Award 10 coins per correct tag (max 50)
6. **Celebration:** Coins fly across screen, "Level Up" sound, progress bar fills

**Adaptive Logic:**
- If student struggles (3+ attempts), show hint: "Remember, paragraphs use <p> and </p>"
- If student succeeds quickly, offer bonus challenge: "Can you add a subheading with <h2>?"

### B. Sample Mini-Game (World 3: JavaScript Boss Battle)

**Game:** "Debug Dungeon Boss"

**Mechanic:** Boss has 5 shields, each with a broken JavaScript code snippet. Student must fix the code to break the shield.

**Example Shield 1:**
```javascript
// Fix this code to make x equal 10
let x = 5
x = x - 5
```

**Correct Answer:** Change `-` to `+`

**Gameplay:**
1. Boss appears with dramatic animation
2. First shield glows, code appears
3. Student edits code in mini-editor
4. Click "Attack" to submit
5. If correct: Shield breaks, damage animation, 50 coins
6. If wrong: Boss attacks back, lose 1 heart (3 hearts total)
7. Repeat for 5 shields
8. Victory: 200 bonus coins, unlock next world

### C. Coin Earning Reference

| Action | Coins Earned |
|--------|--------------|
| Correct answer (lesson) | 10 |
| Complete lesson | 50 |
| Defeat boss mini-game | 200 |
| Daily login streak (7 days) | 100 |
| Earn a badge | 25 |
| Share achievement | 20 |
| Complete a world | 500 |

### D. Initial Badge List (15 MVP Badges)

1. **First Step:** Complete your first lesson
2. **HTML Hero:** Complete HTML Basics world
3. **Style Master:** Complete CSS Styling world
4. **JS Wizard:** Complete JS Fundamentals world
5. **Loop Legend:** Complete Loops & Logic world
6. **Event Expert:** Complete Events world
7. **Boss Slayer:** Defeat your first boss
8. **Perfectionist:** Get 100% on 5 lessons
9. **Speed Runner:** Complete a lesson in under 2 minutes
10. **Rich Kid:** Earn 1,000 total coins
11. **Fashionista:** Unlock 5 skins
12. **Seven-Day Streak:** Log in 7 days in a row
13. **Helpful:** Use a hint (shows it's okay to ask for help)
14. **Social Butterfly:** Share 3 achievements
15. **Completionist:** Finish all 5 MVP worlds

### E. Competitor Analysis

| Platform | Strengths | Weaknesses | Our Advantage |
|----------|-----------|------------|---------------|
| **Scratch** | Visual, creative, large community | Not gamified, overwhelming for beginners | More guided, reward-driven |
| **Code.org** | Structured curriculum, free | Feels like school, less engaging | Game-first approach, coins/unlocks |
| **Tynker** | Gamified, good progression | Expensive, younger-skewed | Better pricing, older kid appeal |
| **Khan Academy** | Comprehensive, free | Dry presentation, no gamification | Way more fun, immediate rewards |
| **Grasshopper** | Mobile-first, bite-sized | Adult-focused, limited content | Kid-focused, deeper content |

**CodeQuest Jr. Differentiation:**
- Most game-like experience in the market
- Coin economy creates Roblox-like engagement
- Adaptive difficulty keeps all skill levels engaged
- Parent insights without feeling like "school"

---

## Conclusion

CodeQuest Jr. has the potential to revolutionize how children learn to code by making it as engaging as the games they already love. By combining solid educational content with addictive game mechanics, a rewarding economy, and transparent progress tracking, we create a win-win-win for students (fun), parents (educational value), and our business (sustainable growth).

**Next Steps:**
1. Finalize MVP feature scope and timeline
2. Assemble development team (Next.js expertise required)
3. Initialize Next.js 14 project with TypeScript and Tailwind
4. Begin design system and lesson content creation
5. Set up Supabase infrastructure and Next.js integration
6. Configure Vercel deployment pipeline
7. Launch beta program with 50 families

**Success Indicators for Green Light:**
- Beta users complete average 5+ lessons
- 60%+ return for second session
- Parents report "kids ask to use it" (unprompted engagement)

With the right execution, CodeQuest Jr. can become the default platform for kids learning to code—one quest, one coin, one celebration at a time.

---

## Technical Stack Summary

**Frontend Framework:** Next.js 14+ with TypeScript
**Styling:** Tailwind CSS + Framer Motion
**Backend:** Supabase (PostgreSQL, Auth, Storage)
**Hosting:** Vercel (optimized for Next.js)
**Key Libraries:**
- Monaco Editor (code editing)
- Phaser 3 (game engine)
- Zustand (state management)
- React Hook Form + Zod (forms & validation)

**Why Next.js?**
- **Performance:** Server Components reduce client bundle size, faster initial loads
- **SEO:** Server-side rendering improves discoverability for parent/teacher searches
- **Developer Experience:** Built-in routing, API routes, and optimizations
- **Scalability:** Edge functions and automatic code splitting
- **Vercel Integration:** Seamless deployment with analytics and monitoring
- **Future-Proof:** Easy migration path to mobile apps via React Native

---

## Development Progress Tracker

### Phase 1: MVP Development (Weeks 1-12)

#### Week 1: Landing Page & Navigation ✅ COMPLETE
- [x] Project setup and infrastructure
- [x] Design system configured
- [x] Supabase project connected and verified
  - ✅ Environment variables configured
  - ✅ MCP connection tested and working
  - ✅ Next.js app connection verified
  - ✅ RLS policies confirmed active
- [x] Build Header component (with mobile menu)
- [x] Build Footer component
- [x] Create homepage hero section (Hero + Features)
- [x] Set up routing structure (7 placeholder pages with transitions)
- [x] Responsive testing (mobile, tablet, desktop)
- [x] Page transitions with Framer Motion
- [x] Supabase connection testing page created

**Deliverables:**
- Homepage with hero, features, header, footer
- 7 routes: /, /login, /signup, /worlds, /shop, /leaderboard, /dashboard, /profile
- Mobile-responsive navigation with hamburger menu
- Smooth page transitions
- Supabase fully connected (MCP + Next.js)
- Test suite: Playwright screenshots at 3 breakpoints

**Screenshots:** Mobile (375px), Tablet (768px), Desktop (1920px), Mobile menu
**Test Page:** `/test-supabase` - Verifies environment vars, DB connection, auth status

#### Week 2: Authentication Foundation ✅ COMPLETE
- [x] **Database Schema Setup**
  - [x] Create `students` table (id, email, display_name, avatar_url, coins, xp, level, created_at)
  - [x] Create `student_progress` table (student_id, world_id, lesson_id, completed, score, attempts)
  - [x] Create `worlds` table (id, name, description, order, icon, color, is_locked)
  - [x] Create `lessons` table (id, world_id, title, description, order, content, validation_rules)
  - [x] Set up RLS policies for each table
  - [x] Create database migration files (5 migrations via Supabase MCP)
  - [x] Auto-create student trigger on signup

- [x] **Authentication Implementation**
  - [x] Build Login page with form (email + password + Google OAuth)
  - [x] Build Signup page with form (email + password + display name + Google OAuth)
  - [x] Implement Supabase Auth signup flow
  - [x] Implement Supabase Auth login flow
  - [x] Add Google OAuth integration
  - [x] Create auth context/hook for session management (AuthProvider + useAuth)
  - [x] Create OAuth callback route handler

- [x] **Protected Routes & Middleware**
  - [x] Set up Next.js middleware for auth (middleware.ts)
  - [x] Protect /dashboard, /worlds, /profile, /shop, /leaderboard routes
  - [x] Redirect unauthenticated users to /login
  - [x] Redirect authenticated users from /login to /dashboard
  - [x] Session refresh on route changes

- [x] **User Profile Setup**
  - [x] Auto-create student profile on signup (database trigger)
  - [x] Initialize with 0 coins, 0 XP, level 1
  - [x] Update Header to show real user data (coins, display name, email)
  - [x] Add profile dropdown with logout
  - [x] Mobile menu with auth state

- [x] **UI Components**
  - [x] Create reusable Input component with error states
  - [x] Create reusable Button component with loading states
  - [x] Create Zod validation schemas (loginSchema, signupSchema)
  - [x] Form validation with React Hook Form + Zod
  - [x] Error handling and display

- [x] **Testing & Validation**
  - [x] Verify auth pages render correctly
  - [x] Test Google OAuth button displays
  - [x] Verify middleware redirects work
  - [x] Screenshots captured (login + signup pages)

**Deliverables:**
- Database: 4 tables (students, worlds, lessons, student_progress) with RLS policies
- Auth: Full email/password + Google OAuth flows
- UI: Login page, Signup page, Dashboard with stats
- Protection: Middleware guarding 5 routes
- Components: Input, Button, AuthContext, validation schemas
- Migrations: 5 Supabase migrations applied
- Screenshots: login-page.png, signup-page.png

**Goal:** ✅ Users can sign up, log in with email or Google, and access protected pages with their profile data displayed.

#### Week 3: Profile & World Map ✅ COMPLETE
- [x] Build Profile page (/profile) with user stats
- [x] Display badges and achievements
- [x] Build Worlds page (/worlds) with world map UI
- [x] Fetch and display 5 worlds from database
- [x] Show world unlock status (locked/unlocked)
- [x] World card design with progress indicators
- [x] Click handler to navigate to world detail
- [x] Responsive world grid layout
- [x] World detail pages with dynamic routing
- [x] Fix AuthContext loading state issue
- [x] End-to-end testing with Playwright

**Deliverables:**
- Profile page with user info, XP progress, stats, achievements, and skills
- Worlds page displaying all 5 worlds with lock/unlock status
- World detail pages showing lessons (ready for content)
- Reusable components: StatCard, BadgeCard, SkillBar, WorldCard, LessonCard
- Fixed loading state race condition in AuthContext
- Comprehensive testing documentation (SPRINT_3_TESTING.md)

**Goal:** ✅ Users can view their profile, browse worlds, and navigate to world detail pages. All pages are responsive and ready for lesson content.

#### Weeks 5-6: Lesson Engine
- [ ] Lesson viewer UI
- [ ] Monaco editor integration
- [ ] Live preview
- [ ] Code validation

#### Week 7: Code Validation & Coins
- [ ] Validation engine
- [ ] Coin rewards
- [ ] Hint system

#### Week 8: First World Content
- [ ] 5 HTML Basics lessons
- [ ] Lesson testing
- [ ] Content polish

#### Week 9: Mini-Game Framework
- [ ] Phaser 3 integration
- [ ] First boss mini-game
- [ ] Coin rewards

#### Week 10: Shop & Unlocks
- [ ] Shop UI
- [ ] Purchase flow
- [ ] Item unlocking

#### Week 11: Additional Content
- [ ] CSS world (5 lessons)
- [ ] JS world (5 lessons)
- [ ] 2 more mini-games

#### Week 12: Polish & Launch
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Testing
- [ ] Production deployment

**Current Week:** 4 (Sprint 4: Lesson Engine - READY TO START)
**Previous Sprints:**
- Week 1: Landing Page & Navigation ✅
- Week 2: Authentication Foundation ✅
- Week 3: Profile & World Map ✅
**Overall Completion:** 45% (Foundation, UI, authentication, database, profile, worlds, and testing complete)

---

## 🚀 Recommended Next Steps

Based on the completed Sprint 1, here are the recommended next steps for Sprint 2:

### Immediate Actions (Sprint 2 - Days 1-2):

1. **Database Schema Design & Migration**
   - Create `students` table with coins, XP, level tracking
   - Create `worlds` and `lessons` tables for content structure
   - Create `student_progress` table to track completion
   - Set up proper RLS policies for each table
   - Use Supabase MCP tools to apply migrations

2. **Authentication Forms**
   - Build functional Login form at `/login` (replace placeholder)
   - Build functional Signup form at `/signup` (replace placeholder)
   - Add form validation with React Hook Form + Zod
   - Implement error handling and loading states
   - Add "Forgot Password?" flow

3. **Session Management**
   - Create auth context using React Context API
   - Implement useAuth() hook for easy access
   - Handle session persistence and refresh
   - Add logout functionality to Header

### Sprint 2 - Days 3-4:

4. **Protected Routes & Middleware**
   - Create `middleware.ts` in project root
   - Protect authenticated routes (/dashboard, /worlds, etc.)
   - Redirect logic (logged out → /login, logged in → /dashboard)
   - Handle loading states during auth checks

5. **User Profile Integration**
   - Auto-create student record on signup
   - Update Header to show real coin count from database
   - Display user's display name and avatar
   - Add profile dropdown menu (Profile, Logout)

### Sprint 2 - Day 5:

6. **Testing & Polish**
   - E2E test: Signup → Login → Protected page access
   - Test RLS policies with Playwright
   - Verify session persistence across page reloads
   - Mobile responsive testing for auth forms
   - Error state testing (wrong password, duplicate email, etc.)

### Quick Wins to Consider:

- **Social Auth:** Add Google/GitHub sign-in (Supabase makes this easy)
- **Profile Pictures:** Use Supabase Storage for avatar uploads
- **Welcome Email:** Set up email templates in Supabase
- **Loading Skeletons:** Add shimmer effects while auth checks run
- **Toast Notifications:** Success/error messages for auth actions

### Technical Recommendations:

1. **Use Supabase Auth Helpers for Next.js**
   - Already installed: `@supabase/ssr`
   - Simplifies cookie management
   - Works with App Router

2. **Form Validation**
   - Already installed: `react-hook-form`, `zod`
   - Create reusable form components
   - Consistent error messaging

3. **State Management**
   - Use Zustand (already installed) for global auth state
   - Combine with React Context for auth-specific data
   - Keep it simple - don't over-engineer

4. **Database Migrations**
   - Use Supabase MCP `apply_migration` tool
   - Name migrations clearly: `create_students_table`, `add_rls_policies`
   - Keep migrations reversible when possible

### Files to Create in Sprint 2:

```
src/
├── app/
│   ├── login/
│   │   └── page.tsx (functional login form)
│   └── signup/
│       └── page.tsx (functional signup form)
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── AuthProvider.tsx
│   └── ui/
│       ├── Input.tsx (reusable form input)
│       ├── Button.tsx (loading states)
│       └── Toast.tsx (notifications)
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── useAuth.ts
├── lib/
│   └── validations/
│       └── auth.ts (Zod schemas)
└── middleware.ts (root level)

supabase/
└── migrations/
    ├── 001_create_students_table.sql
    ├── 002_create_worlds_table.sql
    ├── 003_create_lessons_table.sql
    └── 004_create_student_progress_table.sql
```

### Success Criteria for Sprint 2:

- [ ] New users can sign up with email/password
- [ ] Users can log in and see their dashboard
- [ ] Coin count displays in Header (from database)
- [ ] Protected routes redirect correctly
- [ ] Logout works and clears session
- [ ] RLS prevents users from seeing others' data
- [ ] Mobile-responsive auth forms
- [ ] All E2E tests pass

### Estimated Sprint 2 Timeline:

- **Days 1-2:** Database schema + migrations + RLS policies (8 hours)
- **Days 3-4:** Auth forms + login/signup flows + middleware (12 hours)
- **Day 5:** Profile integration + testing + polish (6 hours)
- **Total:** ~26 hours (1 week for one developer)

See `DEV_PLAN.md` for detailed sprint breakdown.

---

**Document Version:** 1.2
**Last Updated:** 2025-10-04
**Owner:** Product Team
**Status:** Active Development - Phase 1 Started