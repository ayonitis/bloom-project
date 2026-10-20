import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { habitCompletions, xpTransactions } from "@/lib/db/schema";

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbOrTx = typeof db | DbTransaction;

export const xpService = {
  /** Writes the XP earned by a single completion — one "habit_completion"
   *  row, and a second "streak_bonus" row only when a bonus applies. Takes
   *  an optional transaction handle so it can be called as part of
   *  completionService's atomic completeHabit. The unique constraint on
   *  (completionId, reason) means calling this twice for the same
   *  completion fails rather than double-awarding — see completionService
   *  for why that path is never actually taken twice in practice. */
  async recordHabitCompletionXP(
    executor: DbOrTx,
    params: {
      userId: string;
      habitId: string;
      completionId: string;
      base: number;
      streakBonus: number;
    }
  ): Promise<void> {
    const rows = [
      {
        userId: params.userId,
        habitId: params.habitId,
        completionId: params.completionId,
        amount: params.base,
        reason: "habit_completion" as const,
      },
      ...(params.streakBonus > 0
        ? [
            {
              userId: params.userId,
              habitId: params.habitId,
              completionId: params.completionId,
              amount: params.streakBonus,
              reason: "streak_bonus" as const,
            },
          ]
        : []),
    ];
    await executor.insert(xpTransactions).values(rows);
  },

  async getTotalXP(userId: string): Promise<number> {
    const [row] = await db
      .select({ total: sql<number>`coalesce(sum(${xpTransactions.amount}), 0)`.mapWith(Number) })
      .from(xpTransactions)
      .where(eq(xpTransactions.userId, userId));
    return row?.total ?? 0;
  },

  /** XP earned from completions dated `dateString` (a "YYYY-MM-DD" in the
   *  user's own timezone, from completionService's localDateString) — used
   *  for "Today's XP". Joining against habit_completions.completionDate
   *  reuses that already-correct timezone-local date instead of redoing
   *  UTC-offset arithmetic here. */
  async getXPEarnedForCompletionDate(userId: string, dateString: string): Promise<number> {
    const [row] = await db
      .select({ total: sql<number>`coalesce(sum(${xpTransactions.amount}), 0)`.mapWith(Number) })
      .from(xpTransactions)
      .innerJoin(habitCompletions, eq(habitCompletions.id, xpTransactions.completionId))
      .where(and(eq(xpTransactions.userId, userId), eq(habitCompletions.completionDate, dateString)));
    return row?.total ?? 0;
  },

  /** Total XP a single habit has ever earned its owner — this IS the
   *  number plant growth is derived from (see lib/progression/plantGrowth.ts).
   *  Scoped to `userId` as well as `habitId` so a caller can never read
   *  another user's habit XP by guessing an id. */
  async getTotalXPForHabit(userId: string, habitId: string): Promise<number> {
    const [row] = await db
      .select({ total: sql<number>`coalesce(sum(${xpTransactions.amount}), 0)`.mapWith(Number) })
      .from(xpTransactions)
      .where(and(eq(xpTransactions.userId, userId), eq(xpTransactions.habitId, habitId)));
    return row?.total ?? 0;
  },

  /** Same as calling getTotalXPForHabit once per habit, but in one query —
   *  used by listMyHabitsAction so every habit's plant growth is available
   *  without an N+1 query per habit. Habits with no XP yet simply aren't in
   *  the returned map; callers should default a missing key to 0. */
  async getTotalXPByHabit(userId: string, habitIds: string[]): Promise<Map<string, number>> {
    const result = new Map<string, number>();
    if (habitIds.length === 0) return result;

    const rows = await db
      .select({
        habitId: xpTransactions.habitId,
        total: sql<number>`coalesce(sum(${xpTransactions.amount}), 0)`.mapWith(Number),
      })
      .from(xpTransactions)
      .where(and(eq(xpTransactions.userId, userId), inArray(xpTransactions.habitId, habitIds)))
      .groupBy(xpTransactions.habitId);

    for (const row of rows) {
      if (row.habitId) result.set(row.habitId, row.total);
    }
    return result;
  },
};
