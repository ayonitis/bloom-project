# Bloom — Landing Page

A living-garden landing page for **Bloom**, a gamified habit tracker where
every completed habit helps grow a virtual garden. Built with Next.js 15
(App Router), React 19, TypeScript, Tailwind CSS v4, and Framer Motion.

## What's here

Only the landing page, structured so the rest of the app (dashboard, auth,
garden state, etc.) can be added later without a rewrite.

```
app/
  layout.tsx        Root layout, fonts (Poppins/Inter), metadata
  page.tsx           Composes the landing page
  globals.css        Tailwind v4 theme tokens + Bloom color palette
components/
  layout/            Navbar, Footer
  scene/             The garden itself — sky, clouds, mountains, trees,
                      grass, flowers, butterflies, pollen, the Garden
                      Spirit companion, speech bubble, and the
                      scroll-triggered sections below the hero
  ui/                Reusable primitives (Button)
hooks/
  useMousePosition.ts        normalized pointer position (for eye/flower tracking)
  useTimeOfDay.ts            local-time sky palette (morning/afternoon/evening/night)
  usePrefersReducedMotion.ts respects the OS reduced-motion setting
lib/
  quotes.ts          104 motivational quotes, one shown at random per visit
  utils.ts           `cn()` class-merge helper
types/
  index.ts           Shared types
```

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
npm run start
```

This project fetches Poppins and Inter from Google Fonts at build time via
`next/font/google`, so `npm run build` needs outbound network access (this
is the default on Vercel; if you're building somewhere network-restricted,
swap the font block in `app/layout.tsx` for local fonts or system fonts).

## Deploying to Vercel

Push this to a Git repo and import it in Vercel with the defaults — no
extra configuration is required. `next.config.ts` and `tsconfig.json` are
already set up for a standard App Router deployment.

## Onboarding flow

`/onboarding` is a 7-step cinematic flow reached from every "Start Growing"
button on the landing page:

1. **Welcome** — the Garden Spirit greets the visitor
2. **Name** — "What's your name?"
3. **Goal** — Health, Fitness, Learning, Productivity, Mindfulness,
   Creativity, or a custom goal
4. **Habit count** — a stepper defaulting to the recommended 3 habits
5. **Meet your Garden Spirit** — a personalized greeting using the name
   from step 2
6. **Sign up** — mock "Continue with Google / GitHub / Email" (no auth is
   wired up; see below)
7. **First seed** — the Garden Spirit plants a tiny sprout, then "Enter
   Garden" leads to `/garden`, a placeholder that greets the visitor by
   name

Structure:

```
components/onboarding/
  OnboardingFlow.tsx       Orchestrator — step state, validation, transitions
  OnboardingLayout.tsx     Shared chrome: background, logo, progress, ambient quote
  ProgressIndicator.tsx    "Step X of 6" + filling pill bar
  QuestionCard.tsx         Generic glass card for a single question
  GoalSelector.tsx         Goal grid + custom-goal field
  HabitSelector.tsx        Habit-count stepper
  GardenSpiritCard.tsx     Garden Spirit + personalized speech bubble
  AnimatedTransition.tsx   Shared enter/exit transition between steps
  FloatingBackground.tsx   Ambient leaves, pollen, and light rays
  QuoteGenerator.tsx       Small rotating quote in the footer
  PrimaryButton.tsx / SecondaryButton.tsx   Continue / Back affordances
  steps/                   One component per step (Welcome, Name, Goal, …)
```

All onboarding state lives in `OnboardingFlow` via `useState` — there's no
backend or database. On completing step 6, the collected answers are
written to `localStorage` through `lib/onboardingStorage.ts`, purely so
`/garden` can say hello by name. That file is intentionally the only place
that touches storage — swap its two functions for real API calls once
auth exists and nothing else needs to change.

## Dashboard

`/dashboard` is the app's home screen after onboarding — mock data only,
no auth, no backend. It opens on the garden, not a stats table:

- **Garden view** — a hand-arranged tile grid (trees, flowers, a path,
  water, one open plot) with drifting cloud shadows, birds, butterflies,
  and pollen layered on top
- **Today's Habits** — 5 mock habits (Drink Water, Read 20 Minutes,
  Workout, Meditate, Journal), each with a category badge, difficulty
  dots, and an XP reward; completing one plays a sparkle + confetti +
  "+XP" burst
- **Garden Spirit panel** — reuses the same companion from the landing
  page and onboarding; its line changes based on how many habits are
  left today and the current streak
- **Quick Stats** — streaks, level/XP, coins, garden health and today's
  completion as progress rings, and a 7-day bar chart
- **Quick Actions** — Create Habit, Visit Shop, Achievements, Statistics,
  Customize Garden, Inventory — shown as "Soon" since only the dashboard
  itself is built; the sidebar's other nav items (Habits, Garden,
  Achievements, …) are the same

Structure:

```
components/dashboard/
  DashboardLayout.tsx     Desktop sidebar rail + mobile top bar/drawer
  Sidebar.tsx              Nav list (shared by the rail and the drawer)
  GreetingCard.tsx         Time-of-day greeting ("Good Morning, Alex 🌤️")
  QuoteCard.tsx             Today's quote (stable per calendar day)
  GardenView.tsx            The tile-grid garden + its ambient layers
  GardenTile.tsx             One tile (grass, flower, tree, water, …)
  GardenAnimation.tsx        Cloud shadows + birds over the garden
  GardenButterflies.tsx      Butterflies scoped to the garden container
  FloatingParticles.tsx      Pollen scoped to a container
  GardenSpiritPanel.tsx     Companion + a message driven by today's progress
  HabitList.tsx / HabitCard.tsx   Today's habits + completion animation
  QuickStats.tsx            Streaks, level, coins, health, weekly chart
  LevelCard.tsx / XPBar.tsx / ProgressRing.tsx   Small reusable primitives
  ActionGrid.tsx             Quick action tiles
```

All state (habit completion, derived streak/completion numbers) is local
`useState`/`useMemo` in `app/dashboard/page.tsx`. `lib/mockData.ts` is the
single source of mock habits, player stats, the garden layout, and nav/
action items — that's the file to point at a real API later.

## Staff engineering review (latest pass)

A follow-up review pass focused on correctness and performance without
changing any visual design:

- **Bug fix — sky cross-fade:** `SkyBackground`'s time-of-day gradient had
  a Framer Motion `transition` prop with no matching `animate`, so it did
  nothing; the gradient snapped instantly instead of the smooth "cinematic"
  crossfade the design called for. Fixed with an `AnimatePresence`-driven
  opacity crossfade.
- **Performance — pointer tracking:** `useMousePosition` set React state on
  every raw `pointermove` event, which can fire far more often than the
  screen repaints. It's now coalesced to one state update per animation
  frame via `requestAnimationFrame`, cutting re-renders of everything that
  tracks the cursor (the Garden Spirit, the flowers) to display refresh rate.
- **Performance — grass:** `Grass` animated the SVG `d` attribute directly
  for 26 blades, which forces the browser to recompute path geometry on the
  main thread every frame (not GPU-accelerated). Rewritten to sway each
  blade with a `rotate` transform instead — same visual, compositor-driven.
- **Performance — re-render isolation:** the 48-tile garden grid and other
  static decorative layers (`GardenView`, `GardenTile`, `ActionGrid`,
  `GardenAnimation`, `GardenButterflies`, `Clouds`, `Trees`, `FloatingDust`)
  are wrapped in `React.memo`, so toggling a habit checkbox on the
  dashboard no longer re-renders the entire garden subtree.
- **Duplicate code removed:** the butterfly SVG was hand-copied in two
  files — extracted to `components/shared/ButterflyShape.tsx`. The
  floating-pollen pattern existed three times (landing hero, dashboard,
  onboarding) — extracted to `components/shared/FloatingDust.tsx`. The
  `Button`/`ButtonLink` inner markup (icon, children, hover underline) was
  duplicated — extracted to `components/ui/ButtonContent.tsx`. Net effect:
  the landing page's own JS dropped from ~57 kB to ~8 kB in the production
  build, with more shared across routes.
- **Next.js 15 best practice:** `/dashboard` was a Client Component and
  therefore couldn't export `metadata`. Split into a server
  `app/dashboard/page.tsx` (exports metadata) rendering a client
  `DashboardClient` — the same pattern `/onboarding` already used.
- **Framer Motion API:** `useAnimation` (a deprecated alias) swapped for
  `useAnimationControls` in `GardenSpirit`.
- **Accessibility:**
  - The landing navbar hid `Features`/`About`/`Roadmap`/`Community` below
    `md` with no alternative — added an accessible mobile menu
    (`aria-expanded`, `aria-controls`, focus-visible styling).
  - Sidebar navigation and the dashboard habit list now use semantic
    `<nav><ul><li>` markup, and the active sidebar link carries
    `aria-current="page"` instead of relying on color alone.
  - Decorative icons sitting next to visible text labels (goal cards, quick
    actions, sign-up provider buttons) are marked `aria-hidden="true"` so
    screen readers don't announce them redundantly.
- **TypeScript / hydration:** both were already clean on review — strict
  mode compiles with zero errors or `any`s, and every value that can
  legitimately differ between server and client render (random quotes,
  local time of day, reduced-motion preference) was already deferred to a
  post-mount `useEffect`, so there's nothing that produces a hydration
  mismatch.

## Habit Management

`/habits` is the full CRUD habit module — local state only, no backend,
reached from the sidebar's "Habits" link (now marked available) or the
empty-state CTA on first visit.

- **Create / edit** — a 6-step modal (`HabitModal`): name & description,
  category, icon, frequency (+ optional reminder time), difficulty (which
  sets XP reward automatically), and finally a plant assignment with a
  live growth preview. Step dots let you jump between already-visited
  steps; editing an existing habit unlocks free jumping since every field
  already has a valid value. Picking a category auto-suggests a matching
  plant (Reading → Oak, Workout → Sunflower, Meditation → Lotus, …)
  unless you've already chosen one deliberately.
- **Plants** — `PlantVisual` is a generative renderer, not seven separate
  hand-drawn assets: each of the 7 species has a distinct "full grown"
  shape, and growth (derived from `totalCompletions`, capped at 30) moves
  it through seed → sprout → full stages.
- **Complete / undo** — the same checkbox toggles both directions; the
  reducer adjusts `currentStreak`, `longestStreak`, and
  `totalCompletions` accordingly either way.
- **Archive / restore / delete** — a small per-card menu (`role="menu"`,
  Escape + click-outside to close, focus returns to the trigger). Delete
  asks for confirmation since it's the only irreversible action.
- **Reorder** — drag-and-drop via Framer Motion's built-in `Reorder`,
  using a dedicated grip handle (`useDragControls` + `dragListener={false}`)
  so dragging never fights with the checkbox or menu button. Only enabled
  in the fully unfiltered "All" view, where card order unambiguously
  matches the underlying array — reordering a filtered/searched subset
  would be confusing, so those views render a plain list instead.
- **Filter & search** — status tabs (All/Completed/Pending/Archived) with
  live counts, plus category/difficulty/frequency dropdowns and a search
  box, all combinable.
- **Empty states** — no habits at all shows the Garden Spirit with
  "Let's plant your very first habit."; a filtered view with no matches
  shows a quieter "Nothing matches yet" instead.

Structure:

```
types/habit.ts            Full Habit model, filters, and the create/edit draft shape
lib/habitCatalog.ts       Icons, categories, plants, difficulty/frequency metadata + helpers
lib/habitMockData.ts      Realistic seed data (8 habits, 2 archived)
lib/habitsReducer.ts      Pure reducer — the seam to swap for a real API later
lib/habitStorage.ts       Mock localStorage persistence (mirrors lib/onboardingStorage.ts)
hooks/useHabits.ts        Wraps the reducer + storage, exposes CRUD/complete/reorder
components/habits/
  HabitsPageClient.tsx     Orchestrator — filtering, modal state, layout
  HabitModal.tsx            6-step create/edit modal
  CategorySelector.tsx / IconSelector.tsx / FrequencySelector.tsx /
  DifficultySelector.tsx / PlantSelector.tsx   One selector per modal step
  PlantVisual.tsx            Generative plant renderer (seed/sprout/full × 7 species)
  HabitCard.tsx / HabitList.tsx   List rendering + drag-and-drop reordering
  CompletionAnimation.tsx    Sparkle + XP + confetti burst on completion
  SearchBar.tsx / FilterBar.tsx / HabitStats.tsx / EmptyState.tsx
components/shared/Modal.tsx  Accessible dialog primitive (focus trap, Escape, portal)
```

`useHabits` is the single integration point for persistence: swap
`lib/habitStorage.ts`'s two functions for real API calls and everything
above it — the reducer, the hook's public shape, every component — stays
the same.

## Backend & authentication

This phase adds a real Postgres-backed foundation **alongside** the existing
mock-data UI — nothing on the Dashboard, Habits, or Garden pages was
rewired to the database yet (that's deliberately a later, feature-by-feature
migration). Only authentication is real end-to-end: signup, login, logout,
and session-gated routes.

### Stack

- **Database:** PostgreSQL. Recommended provider: **Neon** — serverless
  Postgres with a generous free tier, scale-to-zero, and a first-class
  Vercel integration (one click sets `DATABASE_URL` in your project). Any
  standard Postgres connection string works equally well (Supabase,
  Railway, RDS, etc.) — nothing here is Neon-specific.
- **ORM:** [Drizzle](https://orm.drizzle.team) + `drizzle-kit` for
  migrations, with the `postgres` (postgres.js) driver. Chosen over Prisma
  for a lighter runtime footprint in serverless functions (no separate
  query-engine binary), fully-inferred TypeScript types with no codegen
  step to remember to run, and SQL-shaped migrations that are easy to read
  and easy to hand-edit if needed.
- **Auth:** [Auth.js v5](https://authjs.dev) (`next-auth@beta`) with the
  Drizzle adapter. Supports Google, GitHub, and email/password
  (bcrypt-hashed, 12 rounds) — matching the three options already in the
  onboarding "How would you like to sign up?" step. Sessions are JWT-based
  (required once a Credentials provider is in the mix) and validated by
  middleware running on the Edge runtime.

### Design decisions worth knowing about

- **Derived, not stored:** current streak, longest streak, total
  completions, and "completed today" are never written to a column — they're
  computed from `habit_completions` on every read (`services/completionService.ts`).
  Likewise a plant's growth stage/percent is computed from its habit's
  completion count (`services/plantService.ts`), mirroring
  `lib/habitCatalog.ts`'s frontend logic exactly. The one deliberate
  exception is `habit_completions.userId`, which duplicates
  `habits.userId` — every completion query is already scoped "for this
  user," and copying it here means that check never needs a join back to
  `habits`.
- **Garden tiles are sparse.** `garden_tiles` only has a row for a tile the
  player has actually customized (a decoration, or a manually-moved
  plant) — not one row per grid cell. The base terrain pattern is static
  and identical for every user, so it's generated on the fly, exactly like
  `lib/gardenEngine.ts` already does on the frontend.
- **One habit ↔ one plant**, enforced with a unique constraint on
  `plants.habitId` and created together in a single transaction
  (`habitService.createWithPlant`) — either both rows exist or neither does.
- **One completion per habit per day**, enforced with a unique constraint
  on `(habitId, completionDate)`. "Undo" is just deleting that row.
- **Auth config is split in two** (`lib/auth/authConfig.ts` +
  `lib/auth/config.ts`) because `middleware.ts` runs on Vercel's Edge
  runtime, which can't load the Postgres driver, bcrypt, or the Drizzle
  adapter. The Edge-safe half only knows how to decode the session JWT and
  decide "is this route allowed"; the full config (providers, adapter,
  password verification) lives in the Node.js route handler only. This is
  the standard Auth.js v5 pattern for mixing OAuth + Credentials providers
  with middleware-based route protection.
- **Server Actions, not extra Route Handlers** — `app/actions/auth.ts` and
  `app/actions/habits.ts` are the mutation surface. The only Route Handler
  this phase adds is `app/api/auth/[...nextauth]/route.ts`, which Auth.js
  itself requires (for OAuth redirect callbacks).
- **One small necessary UI change:** the onboarding "Continue with Email"
  field gained a password input, since Credentials auth needs one — email
  alone can't create a real account. Everything else (the three-button
  layout, Google/GitHub, styling) is untouched. A new `/login` page was
  added (nothing existed there to redesign) for returning users, reusing
  the same `QuestionCard`/`ProviderButton` visual language.

### Setup

```bash
npm install

# 1. Get a Postgres database (Neon recommended — neon.tech, free tier).
#    Copy its connection string.
cp .env.example .env.local
# edit .env.local: paste DATABASE_URL, generate AUTH_SECRET with:
npx auth secret

# 2. Create the schema
npm run db:generate   # only needed again if you change lib/db/schema.ts
npm run db:migrate

# 3. (Optional) seed realistic development data
npm run db:seed
# → creates dev@bloom.local / bloom-dev-password with 5 habits,
#   completion history, plants, and a couple of garden decorations

npm run dev
```

`npm run db:studio` opens Drizzle Studio (a local GUI) against whatever
`DATABASE_URL` points at.

### Environment variables

All in `.env.example` (names only — copy to `.env.local` and fill in):

| Variable | Where it comes from |
|---|---|
| `DATABASE_URL` | Your Postgres provider's connection string |
| `AUTH_SECRET` | `npx auth secret` (or `openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth client ID, type "Web application" |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | [GitHub Developer Settings](https://github.com/settings/developers) → New OAuth App |

Google/GitHub are optional — if their env vars are unset, `lib/auth/config.ts`
simply omits those providers (see the `...(process.env.X ? [Provider(...)] : [])`
pattern), so email/password sign-up works with zero OAuth setup. Redirect
URIs for each provider: `http://localhost:3000/api/auth/callback/<provider>`
in development, `https://<your-domain>/api/auth/callback/<provider>` in
production.

### What's protected

`middleware.ts` gates `/dashboard`, `/habits`, and `/my-garden` — signed-out
visitors are redirected to `/login`. `/`, `/onboarding`, and `/login` stay
public. Every service function additionally re-checks ownership server-side
(never trusting a client-supplied user id), so this isn't just a UI-level
gate.

### Data access layer

```
lib/db/schema.ts       Drizzle schema — 8 tables, enums, relations, indexes
lib/db/index.ts         DB client singleton (server-only)
lib/db/migrate.ts       Migration runner (npm run db:migrate)
lib/db/seed.ts          Dev seed data (npm run db:seed)
lib/auth/authConfig.ts  Edge-safe base config (middleware)
lib/auth/config.ts       Full config — providers, adapter (route handler only)
lib/auth/password.ts     bcrypt hash/verify
lib/auth/requireUserId.ts  Session → userId, throws UnauthorizedError
lib/errors.ts            Typed AppError hierarchy + toActionResult()
lib/validation/          Zod schemas — the only place client input is trusted from
services/                userService, habitService, completionService,
                          plantService, gardenService — the only modules
                          that import lib/db directly
app/actions/              Server Actions: thin auth+validate+service wrappers
```

## Habit Management is now database-backed

The Habits page, Dashboard, and Garden no longer use mock/local data —
`hooks/useHabits.ts` now fetches and mutates through real Server Actions
over PostgreSQL. The UI is unchanged; only what's underneath it moved.

```
BEFORE                          NOW

UI                               UI
 ↓                                ↓
useReducer + localStorage        Server Action (app/actions/habits.ts)
                                   ↓
                                  service (habitService / completionService)
                                   ↓
                                  PostgreSQL
```

### What changed and why

- **Field-name mismatch fixed.** The validation schema and service layer
  had been written speculatively before the frontend's `HabitDraft` shape
  was finalized, and used `name`/`icon`/`color` where the actual UI sends
  `title`/`iconId` (and never sends `color` at all). `lib/validation/habit.ts`
  and `services/habitService.ts` now match the frontend exactly; `color`
  is derived server-side from category (`CATEGORY_MAP`) rather than trusted
  from the client.
- **One mapper, one direction.** `lib/mappers/habit.ts` is the only place a
  database row becomes the frontend `Habit` shape (`toFrontendHabit`) or the
  Dashboard's older, simpler shape (`toDashboardHabit`). Two representations
  existed before this phase (`types/habit.ts` for `/habits`, `types/dashboard.ts`
  for the Dashboard); rather than unify them (a UI-adjacent change out of
  scope here), one small mapper adapts real data to both without either
  page's components changing.
- **No N+1 on the list view.** `completionService.getStatsForHabits` fetches
  every completion for every habit being listed in a single query, computes
  streaks in memory, and returns a `Map`. `listMyHabitsAction` uses this
  instead of calling the single-habit `getStats` in a loop.
- **Optimistic completion toggling.** Checking a habit off flips instantly
  in the UI, then confirms against the server; on failure (e.g. offline,
  duplicate-completion race) it rolls back to the previous state rather
  than leaving the UI lying about what's saved.
- **A real confirmation dialog replaced `window.confirm`.** Delete now
  shows `components/shared/ConfirmDialog.tsx` (built on the existing
  accessible `Modal`) with the exact wording requested — "Delete this
  habit? Your completion history and plant progress may also be
  affected." — and surfaces the server's error inline if the delete fails,
  instead of just closing.
- **Loading and pending states throughout.** The Habits page shows a
  skeleton while the initial fetch is in flight and a retry affordance if
  it fails; the modal's submit button reads "Creating…"/"Saving…" and is
  disabled for the duration (no double-submit); a card mid-archive/
  delete/complete is dimmed and its controls disabled via a `pendingIds`
  set threaded down from the hook.
- **Dashboard reflects real habits**, mapped through the existing
  `dashboard/HabitList`/`HabitCard` components unchanged. Level/XP/coins/
  garden-health stay mock — that's the explicitly deferred streak/XP
  system, not this phase.
- **Onboarding untouched.** It never created habits (the habit-count step
  is just a number picker), so there was nothing to migrate there.
- **Garden already goes real automatically.** `useGarden.ts` was already
  built on top of `useHabits()`, so real habits now flow into the garden's
  tile/plant layout with zero changes to garden code.

### Verified against a live database

Not just compiled — actually run against Postgres through Next's real
server runtime: created a habit with the corrected field names and
confirmed `color` was correctly derived; listed habits via the new batched
query and cross-checked streak numbers against the earlier phase's
verification; updated a habit (title, category, plant, difficulty) and
confirmed the linked plant row and derived XP followed; archived and
confirmed the archived↔active inversion; confirmed cross-user access to
the created habit is still blocked after the rewrite; deleted and
confirmed cascade cleanup; called the real `createHabitAction` with no
session and confirmed it's rejected as unauthorized; confirmed the zod
schema rejects a custom-frequency habit with zero selected days and
accepts a valid one.

### Known limitation

Drag-to-reorder on the Habits page is **visual only** — there's no
persisted sort-order column in the schema yet, so a reordered list resets
to creation order on next load. Persisting it is a small, separate
follow-up (one column + one Server Action), intentionally left out of
this data-migration pass.

## Progression engine: streaks, XP, levels

Habit completion now drives a real progression system: frequency-aware
streaks, server-calculated XP (with a modest streak bonus), an XP ledger,
and a level derived from it. Plant growth visuals are the *next* phase —
this one only establishes the underlying numbers correctly.

```
User completes habit
 ↓
HabitCompletion (unique per habit+day — the idempotency gate)
 ↓
calculateStreaks()          lib/progression/streak.ts (pure, frequency-aware)
 ↓
calculateHabitCompletionXP() lib/progression/xp.ts (pure — base + streak bonus)
 ↓
xp_transactions              services/xpService.ts (the XP ledger)
 ↓
totalXP → level               calculateLevelFromXP() (derived on read, never stored)
```

### What changed and why

- **Streak calculation is now frequency-aware.** The previous algorithm
  just checked "is the gap between two completion dates exactly 1 day?" —
  which meant a "weekdays" habit's streak broke every single weekend.
  `lib/progression/streak.ts` instead walks the actual calendar from a
  habit's first completion to today, and only a day the habit's frequency
  *requires* can break the streak — a missed Saturday on a weekdays habit
  doesn't touch it, a missed Tuesday does. Verified live: a "weekdays"
  habit completed Friday and the following Monday shows a 2-day streak
  (the weekend gap doesn't break it); an isolated Tuesday three weeks
  earlier with a missed Wednesday correctly does *not* merge into that run.
- **XP is centralized and server-only.** `lib/progression/xp.ts` is the one
  place `easy/medium/hard → 10/20/35` and the level curve are defined —
  `lib/habitCatalog.ts` (the create-habit wizard's difficulty preview) and
  `lib/validation/habit.ts` (what a new habit's `xpReward` gets set to) both
  now import from here instead of each hardcoding their own copy of the
  same numbers, which they'd drifted into having.
- **A streak bonus, deliberately capped.** Every 7 days of streak unlocks
  +5 XP, capped at +15 — linear and small on purpose, not exponential.
  Tune it by changing three numbers in `XP_CONFIG.streakBonus`.
- **`xp_transactions` is the XP ledger — total XP is never stored.** A
  user's total XP is `SUM(amount)`, computed on read
  (`services/xpService.ts`). Each completion writes one `habit_completion`
  row and, only if a bonus applied, a second `streak_bonus` row, both
  tagged with the completion that earned them via `completionId`. A unique
  constraint on `(completionId, reason)` makes a completion structurally
  unable to award the same kind of XP twice.
- **Undoing a completion needs no separate XP-removal code.**
  `xp_transactions.completionId` has `ON DELETE CASCADE` back to
  `habit_completions` — deleting the completion (what undo already did)
  deletes the XP it earned automatically. Verified live: total XP dropped
  by exactly the undone completion's amount, and its XP transaction rows
  were gone.
- **Completion is atomic.** Inserting the completion, computing the
  resulting streak, calculating XP, and writing the XP transactions all
  happen inside one `db.transaction()` in `completionService.completeHabit`
  — either the whole thing lands or none of it does. The completion insert
  is also what the duplicate-completion unique constraint guards; a
  concurrent double-click's second insert fails there and the transaction
  rolls back before any XP is touched.
- **Level is a pure function of total XP**, never stored:
  `calculateLevelFromXP()` / `getXPForNextLevel()` in `lib/progression/xp.ts`.
  Each level costs 25% more XP than the last, starting at 100 for level 2 —
  two numbers (`LEVEL_CONFIG.baseXP`, `.growthRate`) control the whole curve.
- **Dashboard uses real numbers now**: Completed Today, Today's XP, Current
  Streak, Best Streak, Total XP, and Current Level all come from
  `services/progressionService.ts` via a new `getDashboardProgressionAction`.
  Coins, garden health, and the weekly bar chart stay mock — those belong
  to the shop and plant-growth phases, not this one. "Current/Best Streak"
  are necessarily a simplification now that every habit has its own streak:
  they're the strongest currently-running and best-ever streak across the
  user's active habits, the simplest meaningful single number without
  inventing a new cross-habit metric this phase didn't call for.
- **The completion burst animation still shows base XP**, not the
  bonus-inclusive total — a deliberate, documented simplification. It fires
  optimistically the instant you click, before the server (which is the
  only place that knows if a streak bonus applied) has responded; showing
  the true total would mean waiting for a round-trip before the "satisfying
  confirmation" plays. The actual awarded amount (base + bonus) is exactly
  correct everywhere it's actually stored and aggregated — the habit card's
  streak count, and the Dashboard's Today's XP / Total XP.
- **Two real bugs found via live testing, both fixed:**
  1. The unique-violation detection used to convert a duplicate-completion
     database error into a friendly message didn't account for Postgres
     errors thrown *inside* a `db.transaction()` callback, which Drizzle
     wraps with the real error nested one level down at `.cause`. Outside a
     transaction (e.g. duplicate email signup) it worked; inside one (the
     new atomic `completeHabit`) it didn't, and a raw database error would
     have leaked through. Fixed and centralized as `isUniqueViolation()` in
     `lib/errors.ts`, now shared by `completionService` and `userService`
     instead of each having its own copy.
  2. (Not a production bug, but worth recording): an early version of the
     live frequency-streak test picked "the most recent Friday", which — on
     a day when "today" itself is a Friday — computed a Monday three days
     later that lands in the *future*. The streak algorithm correctly
     refused to count a future date, which looked like a bug in the
     algorithm until the test's date math was traced and fixed.

### Verified against a live database — all 9 required scenarios

Not just compiled — actually run through `completionService`/`xpService`/
`progressionService` against real Postgres:

1. First-ever completion → completion row created, streak = 1, XP = base (no bonus yet).
2. Immediate duplicate completion attempt → rejected as a friendly conflict, zero duplicate completion or XP rows.
3. Reaching a streak-bonus tier → 6 prior consecutive days + completing today → streak 7, XP = base + the 7-day bonus tier.
4. Frequency respected → a "weekdays" habit with a weekend gap keeps its streak; a required day genuinely missed does not merge across it.
5. Undo → completion reverted, streak recalculated down, total XP dropped by exactly what that completion had earned, its XP transaction rows gone.
6. Cross-user completion attempt → blocked with the same not-found error a truly-missing habit would give (no ownership leak).
7. Client-supplied XP → structurally impossible; `completeHabitAction`'s only input is a habit id, and XP is calculated from the server-known difficulty and server-computed streak.
8. Crossing a level threshold → level correctly increments exactly at the XP boundary, not one XP before it.
9. Timezone near a day boundary → the same UTC instant resolves to different correct local calendar days in Asia/Dhaka vs. America/New_York.

## Design notes

- **Palette**: warm cream background, soft amber primary, sky blue
  secondary, leaf green accent — see the `--color-bloom-*` tokens in
  `app/globals.css`.
- **The Garden Spirit** (`components/scene/GardenSpirit.tsx`) is the
  signature element: its eyes track the cursor, it blinks and breathes on
  its own idle timers, waves periodically, smiles when the primary CTA is
  hovered, and looks surprised when clicked.
- **Time of day**: `useTimeOfDay` reads the visitor's local clock and
  smoothly swaps the sky gradient (and toggles stars/fireflies) between
  morning, afternoon, evening, and night.
- **Motion**: everything ambient (clouds, grass, pollen, butterflies,
  stars) is disabled when `prefers-reduced-motion: reduce` is set.
- **Scroll**: sections below the hero (`components/scene/ScrollGarden.tsx`)
  reveal with `whileInView`, echoing the garden "growing" as you scroll.
