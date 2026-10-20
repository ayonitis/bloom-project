import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { achievements, habitCompletions, habits, plants, userAchievements, xpTransactions, users } from "@/lib/db/schema";
import { isRequiredDay } from "@/lib/progression/streak";
import { calculateLevelFromXP } from "@/lib/progression/xp";
import { calculatePlantGrowthPercent } from "@/lib/progression/plantGrowth";
import { completionService, localDateString } from "@/services/completionService";
import { habitService } from "@/services/habitService";
import { coinService } from "@/services/coinService";
import type { AchievementRequirementType, AchievementUnlockResult, AchievementView } from "@/types/achievement";
import type { WeekdayIndex } from "@/types/habit";

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

type AchievementRow = typeof achievements.$inferSelect;

/**
 * Every metric an achievement's requirementValue can be compared against,
 * computed once per evaluation from real data — nothing here is stored or
 * cached, so it's never possible for this to disagree with the Habits page,
 * the Dashboard, or the Garden, all of which derive from the same tables.
 *
 * Deliberately does NOT scan a user's full history for anything except
 * `perfect_day`, and even that only ever looks at *today* — see that
 * branch below for why a full historical scan isn't needed.
 */
async function computeUserMetrics(userId: string): Promise<Record<AchievementRequirementType, number>> {
  const [totalCompletionsRow, totalXPRow, activeHabits, allPlants, userRow] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(habitCompletions)
      .where(eq(habitCompletions.userId, userId)),
    db
      .select({ total: sql<number>`coalesce(sum(${xpTransactions.amount}), 0)`.mapWith(Number) })
      .from(xpTransactions)
      .where(eq(xpTransactions.userId, userId)),
    habitService.listForUser(userId, { includeArchived: false }),
    db
      .select({
        difficulty: habits.difficulty,
        totalXP: sql<number>`coalesce(sum(${xpTransactions.amount}), 0)`.mapWith(Number),
      })
      .from(plants)
      .leftJoin(habits, eq(habits.id, plants.habitId))
      .leftJoin(xpTransactions, eq(xpTransactions.habitId, plants.habitId))
      .where(eq(plants.userId, userId))
      .groupBy(plants.id, habits.difficulty),
    db.select({ timezone: users.timezone }).from(users).where(eq(users.id, userId)).limit(1),
  ]);

  const totalCompletions = totalCompletionsRow[0]?.count ?? 0;
  const totalXPValue = totalXPRow[0]?.total ?? 0;
  const plantsOwned = allPlants.length;
  const plantsFullyGrown = allPlants.filter(
    (plant) => calculatePlantGrowthPercent(plant.totalXP, plant.difficulty ?? "easy") >= 100
  ).length;

  // Best currently-running streak across the user's active habits — the
  // same "one meaningful number" simplification progressionService already
  // uses for the Dashboard, reused here rather than redefined.
  const statsByHabit = await completionService.getStatsForHabits(userId, activeHabits);
  let bestCurrentStreak = 0;
  for (const stats of statsByHabit.values()) {
    bestCurrentStreak = Math.max(bestCurrentStreak, stats.currentStreak);
  }

  // Perfect day: only ever checked against *today*, not the user's whole
  // history. A habit only counts if its frequency actually requires it
  // today (a "weekdays" habit doesn't block a Saturday perfect day). Zero
  // habits scheduled today is not a perfect day — there must be at least
  // one, and all of them completed.
  const timezone = userRow[0]?.timezone ?? "UTC";
  const today = localDateString(timezone);
  const scheduledToday = activeHabits.filter((habit) =>
    isRequiredDay(today, { type: habit.frequency, customDays: (habit.frequencyDays ?? []) as WeekdayIndex[] })
  );
  const scheduledIds = scheduledToday.map((habit) => habit.id);
  const allScheduledCompleted =
    scheduledIds.length > 0 && scheduledIds.every((id) => statsByHabit.get(id)?.completedToday);

  return {
    total_completions: totalCompletions,
    streak_days: bestCurrentStreak,
    plants_fully_grown: plantsFullyGrown,
    plants_owned: plantsOwned,
    total_xp: totalXPValue,
    level: calculateLevelFromXP(totalXPValue),
    perfect_day: allScheduledCompleted ? 1 : 0,
  };
}

function toUnlockResult(row: AchievementRow, unlockedAt: Date): AchievementUnlockResult {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    category: row.category,
    icon: row.icon,
    rarity: row.rarity,
    rewardXP: row.rewardXP,
    rewardCoins: row.rewardCoins,
    unlockedAt: unlockedAt.toISOString(),
  };
}

/** Attempts to unlock one achievement for one user. Safe to call even if
 *  it's already unlocked, or if two requests race to unlock it
 *  simultaneously — `onConflictDoNothing` against the unique
 *  (userId, achievementId) constraint means only the first ever actually
 *  inserts a row or awards XP; every other caller gets `null` back. */
async function tryUnlock(
  tx: DbTransaction,
  userId: string,
  achievement: AchievementRow,
  currentValue: number
): Promise<AchievementUnlockResult | null> {
  const [inserted] = await tx
    .insert(userAchievements)
    .values({ userId, achievementId: achievement.id, progressValue: currentValue })
    .onConflictDoNothing({ target: [userAchievements.userId, userAchievements.achievementId] })
    .returning();

  if (!inserted) return null; // already unlocked (this call or a previous one)

  if (achievement.rewardXP > 0) {
    await tx.insert(xpTransactions).values({
      userId,
      achievementId: achievement.id,
      amount: achievement.rewardXP,
      reason: "achievement_reward",
    });
  }
  await coinService.awardAchievementCoins(tx, userId, achievement.id, achievement.rewardCoins);

  return toUnlockResult(achievement, inserted.unlockedAt);
}

export const achievementService = {
  /**
   * Call this after a meaningful event — currently only "a habit was
   * completed" (see completeHabitAction). Undoing a completion never calls
   * this: every requirement here is monotonically increasing, so an undo
   * can only ever move a user further from a threshold, never newly cross
   * one — there is nothing an undo could unlock.
   *
   * A plant crossing 100% or a level-up are NOT separate call sites: both
   * are pure functions of the same XP a completion just changed, so this
   * one evaluation already covers them. XP awarded by an unlock in this
   * pass is not re-evaluated against XP-based achievements in the same
   * pass (metrics are computed once, up front) — a user who crosses two XP
   * thresholds in the same completion resolves the second one on their
   * *next* completion, not immediately. This is an intentional, documented
   * simplification, not a bug: it only ever delays a chained unlock by one
   * event, never loses it.
   */
  async evaluateAndUnlock(userId: string): Promise<AchievementUnlockResult[]> {
    const [metrics, catalog, alreadyUnlockedRows] = await Promise.all([
      computeUserMetrics(userId),
      db.select().from(achievements),
      db
        .select({ achievementId: userAchievements.achievementId })
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId)),
    ]);

    const alreadyUnlocked = new Set(alreadyUnlockedRows.map((row) => row.achievementId));
    const candidates = catalog.filter(
      (achievement) =>
        !alreadyUnlocked.has(achievement.id) && metrics[achievement.requirementType] >= achievement.requirementValue
    );
    if (candidates.length === 0) return [];

    return db.transaction(async (tx) => {
      const results: AchievementUnlockResult[] = [];
      for (const achievement of candidates) {
        const result = await tryUnlock(tx, userId, achievement, metrics[achievement.requirementType]);
        if (result) results.push(result);
      }
      return results;
    });
  },

  /** Every achievement in the catalog, with this user's unlock state and —
   *  for locked, non-secret ones — live progress. Powers both the
   *  /achievements page and the Dashboard's summary widget. Read-only: no
   *  unlocking side effects happen here, so viewing the page can never
   *  itself grant XP. */
  async getUserAchievementsView(userId: string): Promise<AchievementView[]> {
    const [catalog, unlockedRows, metrics] = await Promise.all([
      db.select().from(achievements).orderBy(achievements.category, achievements.requirementValue),
      db.select().from(userAchievements).where(eq(userAchievements.userId, userId)),
      computeUserMetrics(userId),
    ]);

    const unlockedByAchievement = new Map(unlockedRows.map((row) => [row.achievementId, row]));

    return catalog.map((achievement) => {
      const unlocked = unlockedByAchievement.get(achievement.id);
      const isUnlocked = Boolean(unlocked);

      // A locked secret achievement gives away nothing beyond "this
      // exists" — no name, description, requirement, or progress.
      if (achievement.isSecret && !isUnlocked) {
        return {
          id: achievement.id,
          key: achievement.key,
          name: "???",
          description: "Something special is waiting.",
          category: achievement.category,
          icon: "help-circle",
          rarity: achievement.rarity,
          rewardXP: achievement.rewardXP,
          rewardCoins: achievement.rewardCoins,
          isSecret: true,
          isUnlocked: false,
          unlockedAt: null,
        };
      }

      const currentValue = metrics[achievement.requirementType];
      return {
        id: achievement.id,
        key: achievement.key,
        name: achievement.name,
        description: achievement.description,
        category: achievement.category,
        icon: achievement.icon,
        rarity: achievement.rarity,
        rewardXP: achievement.rewardXP,
          rewardCoins: achievement.rewardCoins,
        isSecret: achievement.isSecret,
        isUnlocked,
        unlockedAt: unlocked ? unlocked.unlockedAt.toISOString() : null,
        progress: isUnlocked
          ? undefined
          : {
              currentValue: Math.min(currentValue, achievement.requirementValue),
              targetValue: achievement.requirementValue,
              percent: Math.min(100, Math.round((currentValue / achievement.requirementValue) * 100)),
            },
      };
    });
  },

  async getSummary(
    userId: string,
    recentLimit = 3
  ): Promise<{ unlockedCount: number; totalCount: number; recent: AchievementView[] }> {
    const [totalCountRow, unlockedCountRow, recentRows] = await Promise.all([
      db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(achievements),
      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId)),
      db
        .select({ achievement: achievements, unlockedAt: userAchievements.unlockedAt })
        .from(userAchievements)
        .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
        .where(eq(userAchievements.userId, userId))
        .orderBy(desc(userAchievements.unlockedAt))
        .limit(recentLimit),
    ]);

    const recent: AchievementView[] = recentRows.map(({ achievement, unlockedAt }) => ({
      id: achievement.id,
      key: achievement.key,
      name: achievement.name,
      description: achievement.description,
      category: achievement.category,
      icon: achievement.icon,
      rarity: achievement.rarity,
      rewardXP: achievement.rewardXP,
          rewardCoins: achievement.rewardCoins,
      isSecret: achievement.isSecret,
      isUnlocked: true,
      unlockedAt: unlockedAt.toISOString(),
    }));

    return {
      unlockedCount: unlockedCountRow[0]?.count ?? 0,
      totalCount: totalCountRow[0]?.count ?? 0,
      recent,
    };
  },
};
