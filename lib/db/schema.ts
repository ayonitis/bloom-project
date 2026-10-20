import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const habitCategoryEnum = pgEnum("habit_category", [
  "health",
  "fitness",
  "learning",
  "productivity",
  "mindfulness",
  "creativity",
  "custom",
]);

export const habitDifficultyEnum = pgEnum("habit_difficulty", ["easy", "medium", "hard"]);

export const habitFrequencyTypeEnum = pgEnum("habit_frequency_type", [
  "daily",
  "weekdays",
  "weekends",
  "custom",
]);

export const xpTransactionReasonEnum = pgEnum("xp_transaction_reason", [
  "habit_completion",
  "streak_bonus",
  "achievement_reward",
  "seed_boost",
]);

// Bloom Coins are a SEPARATE currency from XP — XP never converts to coins
// and coins never affect level/progression math. Every reason here is
// either a durable, unlock-once event (achievement_reward, mirroring
// userAchievements' own unique constraint) or a date-scoped, once-per-day
// event (daily_first_completion, perfect_day_bonus — see coinService),
// specifically so nothing here can be farmed by completing/undoing the
// same habit repeatedly, unlike XP's existing per-completion model.
export const coinTransactionReasonEnum = pgEnum("coin_transaction_reason", [
  "daily_first_completion",
  "perfect_day_bonus",
  "achievement_reward",
  "purchase",
]);

export const plantSpeciesEnum = pgEnum("plant_species", [
  "oak",
  "sunflower",
  "lotus",
  "fern",
  "bonsai",
  "cactus",
  "clover",
]);

export const achievementCategoryEnum = pgEnum("achievement_category", [
  "growing",
  "streaks",
  "progression",
  "habits",
  "garden",
]);

export const achievementRarityEnum = pgEnum("achievement_rarity", ["common", "rare", "epic", "legendary"]);

// What real, server-computed metric an achievement's requirementValue is
// compared against — see services/achievementService.ts's
// computeUserMetrics, the one place each of these is actually calculated.
export const achievementRequirementTypeEnum = pgEnum("achievement_requirement_type", [
  "total_completions",
  "streak_days",
  "plants_fully_grown",
  "plants_owned",
  "total_xp",
  "level",
  "perfect_day",
]);

// Plants are NOT an inventory category — every plant is auto-created
// 1:1 with a habit (see the `plants` table below) and isn't something a
// user collects/uses independently. This enum is only for things that
// genuinely sit in a stack of quantity>=0 the user can place or consume.
export const inventoryCategoryEnum = pgEnum("inventory_category", ["decoration", "seed", "special"]);

// ---------------------------------------------------------------------------
// Auth.js tables
//
// Column *names* below intentionally differ from Auth.js's own defaults in a
// couple of places (e.g. the users table's `image` property maps to an
// `avatar` DB column, to match Bloom's own User spec) — Drizzle lets the JS
// property and the underlying SQL column name differ, and the adapter is
// given this schema explicitly in lib/auth/config.ts, so it only ever cares
// about the property names, not the column names.
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("avatar"),
  timezone: text("timezone").notNull().default("UTC"),
  // The authoritative spendable balance — updated atomically via a single
  // guarded UPDATE (see coinService.spend), never via read-then-write, so
  // two concurrent purchases can't both succeed against the same balance
  // (a classic lost-update race a pure sum-of-transactions ledger can't
  // prevent without much heavier isolation/retry machinery). coinTransactions
  // below is the audit trail; this column is the fast, race-proof source
  // of truth for "can this purchase go through right now".
  bloomCoins: integer("bloom_coins").notNull().default(0),
  // Null for accounts that only ever signed in via an OAuth provider.
  // Auth.js/bcrypt never sees or stores a plaintext password — see
  // lib/auth/credentials.ts for hashing.
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
}, (table) => [unique("users_email_unique").on(table.email)]);

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
    index("accounts_user_id_idx").on(table.userId),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })]
);

// ---------------------------------------------------------------------------
// Achievements
//
// The catalog itself (name/description/requirement/reward) is static
// reference data seeded once via `npm run db:seed-achievements` (see
// lib/db/seedAchievements.ts) — every user shares the same rows here, only
// `userAchievements` (declared after xpTransactions below, since it also
// needs habits/users) varies per user. Declared here, before every table
// that references it, since Postgres requires a referenced table to exist
// first.
// ---------------------------------------------------------------------------

export const achievements = pgTable(
  "achievements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Stable, human-readable identifier the seed script upserts by — lets
    // the catalog be edited/re-seeded without ever duplicating a row.
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: achievementCategoryEnum("category").notNull(),
    // A lucide-react icon name, resolved in the UI's icon map — same
    // convention as habits.icon in lib/habitCatalog.ts.
    icon: text("icon").notNull(),
    requirementType: achievementRequirementTypeEnum("requirement_type").notNull(),
    requirementValue: integer("requirement_value").notNull(),
    rewardXP: integer("reward_xp").notNull().default(0),
    rewardCoins: integer("reward_coins").notNull().default(0),
    rarity: achievementRarityEnum("rarity").notNull().default("common"),
    // Hidden achievements show as "???" until unlocked (see
    // components/achievements/AchievementCard.tsx) — the requirement is
    // never sent to the client for these until after they unlock.
    isSecret: boolean("is_secret").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [unique("achievements_key_unique").on(table.key)]
);

// ---------------------------------------------------------------------------
// Inventory
//
// Same shape as achievements above: `inventoryItems` is a static, shared
// catalog seeded once (see lib/db/seedInventory.ts); `userInventory` is the
// only per-user table, one row per (user, item) pair holding a quantity.
// Plants are deliberately NOT here — see inventoryCategoryEnum's comment.
// ---------------------------------------------------------------------------

export const inventoryItems = pgTable(
  "inventory_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: inventoryCategoryEnum("category").notNull(),
    // A lucide-react icon name, resolved in the UI's icon map — same
    // convention as achievements.icon.
    icon: text("icon").notNull(),
    rarity: achievementRarityEnum("rarity").notNull().default("common"),
    // Only meaningful for category="decoration": which garden_tiles.tileType
    // placing this item results in (e.g. "decoration", "path", "stone").
    placesAsTileType: text("places_as_tile_type"),
    // Only meaningful for category="seed": using it awards this many XP,
    // as a real xp_transactions row (reason="seed_boost"), to a habit the
    // player chooses — reuses the existing XP/growth pipeline rather than
    // inventing a second one.
    seedGrowthBoostXP: integer("seed_growth_boost_xp"),
    // Null = not for sale (e.g. reserved for a future non-Shop source like
    // an achievement reward). Never trust a price from the client — this
    // column, read fresh at purchase time, is the only price that matters.
    priceCoins: integer("price_coins"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [unique("inventory_items_key_unique").on(table.key)]
);

export const userInventory = pgTable(
  "user_inventory",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    itemId: uuid("item_id")
      .notNull()
      .references(() => inventoryItems.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(0),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    // The actual guarantee that a user can't end up with two rows for the
    // same item (which "place"/"use" decrementing could otherwise race
    // into) — enforced by Postgres, not application logic.
    unique("user_inventory_user_item_unique").on(table.userId, table.itemId),
    index("user_inventory_user_id_idx").on(table.userId),
  ]
);

// ---------------------------------------------------------------------------
// Habits
// ---------------------------------------------------------------------------

export const habits = pgTable(
  "habits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    icon: text("icon").notNull(),
    category: habitCategoryEnum("category").notNull(),
    color: text("color").notNull(),
    difficulty: habitDifficultyEnum("difficulty").notNull(),
    frequency: habitFrequencyTypeEnum("frequency").notNull().default("daily"),
    // Only populated when frequency = "custom": 0 (Sun) – 6 (Sat).
    frequencyDays: smallint("frequency_days").array(),
    reminderTime: text("reminder_time"), // "HH:MM", nullable
    xpReward: integer("xp_reward").notNull(),
    active: boolean("active").notNull().default(true),
    archived: boolean("archived").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("habits_user_id_idx").on(table.userId),
    // The dashboard/habits list's most common query: "this user's
    // non-archived habits" — worth its own composite index.
    index("habits_user_active_idx").on(table.userId, table.active, table.archived),
  ]
);

// ---------------------------------------------------------------------------
// Habit completions
//
// currentStreak / longestStreak / totalCompletions / "completed today" are
// intentionally NOT stored anywhere — they're derived from this table (see
// services/completionService.ts). This table is the one source of truth;
// storing running totals elsewhere would just create a second value that
// can drift out of sync with reality.
// ---------------------------------------------------------------------------

export const habitCompletions = pgTable(
  "habit_completions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    habitId: uuid("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    // Denormalized copy of habits.userId. This IS a deliberate exception to
    // the "don't duplicate data" rule: every completion query is already
    // scoped "for this user", and copying userId here means that
    // authorization check (and the user-scoped history/stats queries) never
    // need a join back to `habits` just to confirm ownership. It's set once
    // at insert time from the parent habit and never updated.
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Exact moment the completion was recorded.
    completedAt: timestamp("completed_at", { mode: "date" }).notNull().defaultNow(),
    // The logical calendar day it counts toward, in the user's own
    // timezone, as a plain date — this is what streaks/undo key off, and is
    // what the unique constraint below enforces one-per-day against.
    completionDate: text("completion_date").notNull(), // "YYYY-MM-DD"
    xpEarned: integer("xp_earned").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    // A habit can only be completed once per calendar day — this is also
    // exactly what "undo completion" deletes.
    unique("habit_completions_habit_date_unique").on(table.habitId, table.completionDate),
    index("habit_completions_user_id_idx").on(table.userId),
    index("habit_completions_habit_id_idx").on(table.habitId),
    // Streak calculations scan a single habit's rows ordered by date.
    index("habit_completions_habit_date_idx").on(table.habitId, table.completionDate),
  ]
);

// ---------------------------------------------------------------------------
// XP transactions
//
// The one source of truth for XP — a user's total XP is
// SUM(amount) WHERE userId = X, computed on read (services/xpService.ts),
// never stored as a mutable running total. Each habit completion writes
// one "habit_completion" row and, when a streak bonus applies, a second
// "streak_bonus" row — both tagged with the completion that earned them.
// `completionId` cascades from habit_completions, so undoing a completion
// (which deletes that row) automatically removes the XP it earned; no
// separate cleanup code is needed for that.
// ---------------------------------------------------------------------------

export const xpTransactions = pgTable(
  "xp_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    habitId: uuid("habit_id").references(() => habits.id, { onDelete: "set null" }),
    completionId: uuid("completion_id").references(() => habitCompletions.id, {
      onDelete: "cascade",
    }),
    // Only set for reason="achievement_reward" rows — habitId/completionId
    // stay null for those, exactly like habitId already stays null for
    // non-habit XP.
    achievementId: uuid("achievement_id").references(() => achievements.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    reason: xpTransactionReasonEnum("reason").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    // At most one "habit_completion" row and one "streak_bonus" row per
    // completion — the idempotency guarantee that a completion can never
    // accidentally award XP twice, even under a retried request.
    unique("xp_transactions_completion_reason_unique").on(table.completionId, table.reason),
    index("xp_transactions_user_id_idx").on(table.userId),
    // "Today's XP" and "Total XP" both scan a user's rows.
    index("xp_transactions_user_created_idx").on(table.userId, table.createdAt),
  ]
);

// ---------------------------------------------------------------------------
// Bloom Coins
//
// The audit trail / purchase history — the actual spendable balance lives
// on users.bloomCoins (see its comment). Every row here should correspond
// to a change coinService already applied to that column in the same
// transaction; this table is never summed to compute a balance the way
// xpTransactions is for XP, specifically because coins can be *spent*
// (decremented) and need race-proof guarding that a pure sum can't give
// without much heavier isolation.
// ---------------------------------------------------------------------------

export const coinTransactions = pgTable(
  "coin_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Positive for earning, negative for spending.
    amount: integer("amount").notNull(),
    reason: coinTransactionReasonEnum("reason").notNull(),
    // Set only for reason="daily_first_completion" / "perfect_day_bonus" —
    // the "YYYY-MM-DD" (in the user's own timezone) this bonus is for. The
    // unique constraint below is what actually makes each of those
    // once-per-day, not the application logic that checks it.
    referenceDate: text("reference_date"),
    achievementId: uuid("achievement_id").references(() => achievements.id, { onDelete: "set null" }),
    // Set only for reason="purchase".
    itemId: uuid("item_id").references(() => inventoryItems.id, { onDelete: "set null" }),
    quantity: integer("quantity"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    // Postgres treats NULLs as distinct in a unique index, so this only
    // ever constrains the two reasons that actually set referenceDate —
    // purchases and achievement rewards (both NULL here) are unaffected.
    unique("coin_transactions_user_date_reason_unique").on(table.userId, table.referenceDate, table.reason),
    index("coin_transactions_user_id_idx").on(table.userId),
  ]
);

// ---------------------------------------------------------------------------
// User achievements
//
// Only ever contains a row for an achievement that has ACTUALLY unlocked —
// there's deliberately no separate "in-progress" table. Progress toward a
// still-locked achievement is cheap to compute live from the same real
// data the unlock check itself uses (services/achievementService.ts), so
// storing a second, denormalized progress number here would just be a
// second value that can drift from reality for no benefit. `unlockedAt`
// being present is itself the "is this unlocked" flag.
// ---------------------------------------------------------------------------

export const userAchievements = pgTable(
  "user_achievements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievementId: uuid("achievement_id")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    // A snapshot of the metric's value at the moment of unlock, purely for
    // display ("you had a 32-day streak when this unlocked") — not read by
    // any evaluation logic, which always recomputes the live value.
    progressValue: integer("progress_value").notNull(),
    unlockedAt: timestamp("unlocked_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    // The actual idempotency guarantee: at most one unlock per user per
    // achievement, enforced by Postgres itself, not application logic.
    unique("user_achievements_user_achievement_unique").on(table.userId, table.achievementId),
    index("user_achievements_user_id_idx").on(table.userId),
  ]
);

// ---------------------------------------------------------------------------
// Plants
//
// growthStage / growthPercent are likewise NOT stored — both are pure
// functions of the linked habit's real accumulated XP (see
// services/plantService.ts, which derives them via the single canonical
// module lib/progression/plantGrowth.ts — also used by the client, so the
// server and the UI can never disagree on a threshold). `health` and
// `rarity` ARE stored: neither has a defined derivation yet (health would
// come from a future missed-day decay mechanic, rarity is assigned once at
// creation) — they're placeholders for mechanics this phase intentionally
// doesn't implement, not values duplicated from elsewhere.
// ---------------------------------------------------------------------------

export const plants = pgTable(
  "plants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // One plant per habit.
    habitId: uuid("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    species: plantSpeciesEnum("species").notNull(),
    name: text("name").notNull(),
    health: integer("health").notNull().default(100),
    rarity: text("rarity").notNull().default("common"),
    // Manual placement override on the garden grid; null until the player
    // moves it, matching the frontend's sparse-override model.
    positionX: integer("position_x"),
    positionY: integer("position_y"),
    rotation: smallint("rotation").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    unique("plants_habit_id_unique").on(table.habitId),
    index("plants_user_id_idx").on(table.userId),
  ]
);

// ---------------------------------------------------------------------------
// Garden tiles
//
// Sparse, not dense: a row only exists for a tile the player has actually
// customized (placed a decoration on, or manually repositioned a plant
// onto). The base terrain pattern (grass/path/water layout) is static,
// deterministic, and identical for every user, so — exactly like the
// current frontend's gardenEngine.ts — it's computed on the fly rather than
// duplicated as ~70 rows per user. `decorationId` has no foreign key yet
// since there's no decorations/inventory table in this phase; it's reserved
// for one.
// ---------------------------------------------------------------------------

export const gardenTiles = pgTable(
  "garden_tiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    x: smallint("x").notNull(),
    y: smallint("y").notNull(),
    tileType: text("tile_type").notNull().default("grass"),
    // Legacy/unused going forward — kept only so no historical data is
    // lost; decorationItemId (a real FK into inventoryItems, added once
    // that table existed) is what placeDecoration/removeDecoration
    // actually read and write now.
    decorationId: text("decoration_id"),
    decorationItemId: uuid("decoration_item_id").references(() => inventoryItems.id, { onDelete: "set null" }),
    rotation: smallint("rotation").notNull().default(0),
    plantId: uuid("plant_id").references(() => plants.id, { onDelete: "set null" }),
    metadata: text("metadata"), // reserved for future per-tile JSON data
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    unique("garden_tiles_user_position_unique").on(table.userId, table.x, table.y),
    index("garden_tiles_user_id_idx").on(table.userId),
  ]
);

// ---------------------------------------------------------------------------
// Relations (for Drizzle's relational query API)
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  habits: many(habits),
  plants: many(plants),
  gardenTiles: many(gardenTiles),
  xpTransactions: many(xpTransactions),
  achievements: many(userAchievements),
  inventory: many(userInventory),
  coinTransactions: many(coinTransactions),
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(users, { fields: [habits.userId], references: [users.id] }),
  completions: many(habitCompletions),
  plant: one(plants, { fields: [habits.id], references: [plants.habitId] }),
  xpTransactions: many(xpTransactions),
}));

export const habitCompletionsRelations = relations(habitCompletions, ({ one, many }) => ({
  habit: one(habits, { fields: [habitCompletions.habitId], references: [habits.id] }),
  user: one(users, { fields: [habitCompletions.userId], references: [users.id] }),
  xpTransactions: many(xpTransactions),
}));

export const xpTransactionsRelations = relations(xpTransactions, ({ one }) => ({
  user: one(users, { fields: [xpTransactions.userId], references: [users.id] }),
  habit: one(habits, { fields: [xpTransactions.habitId], references: [habits.id] }),
  completion: one(habitCompletions, {
    fields: [xpTransactions.completionId],
    references: [habitCompletions.id],
  }),
  achievement: one(achievements, {
    fields: [xpTransactions.achievementId],
    references: [achievements.id],
  }),
}));

export const coinTransactionsRelations = relations(coinTransactions, ({ one }) => ({
  user: one(users, { fields: [coinTransactions.userId], references: [users.id] }),
  achievement: one(achievements, { fields: [coinTransactions.achievementId], references: [achievements.id] }),
  item: one(inventoryItems, { fields: [coinTransactions.itemId], references: [inventoryItems.id] }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  unlockedBy: many(userAchievements),
  xpTransactions: many(xpTransactions),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, { fields: [userAchievements.userId], references: [users.id] }),
  achievement: one(achievements, { fields: [userAchievements.achievementId], references: [achievements.id] }),
}));

export const plantsRelations = relations(plants, ({ one }) => ({
  user: one(users, { fields: [plants.userId], references: [users.id] }),
  habit: one(habits, { fields: [plants.habitId], references: [habits.id] }),
}));

export const gardenTilesRelations = relations(gardenTiles, ({ one }) => ({
  user: one(users, { fields: [gardenTiles.userId], references: [users.id] }),
  plant: one(plants, { fields: [gardenTiles.plantId], references: [plants.id] }),
  decorationItem: one(inventoryItems, {
    fields: [gardenTiles.decorationItemId],
    references: [inventoryItems.id],
  }),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ many }) => ({
  ownedBy: many(userInventory),
  placedTiles: many(gardenTiles),
}));

export const userInventoryRelations = relations(userInventory, ({ one }) => ({
  user: one(users, { fields: [userInventory.userId], references: [users.id] }),
  item: one(inventoryItems, { fields: [userInventory.itemId], references: [inventoryItems.id] }),
}));
