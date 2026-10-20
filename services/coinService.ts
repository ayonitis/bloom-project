import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { coinTransactions, users } from "@/lib/db/schema";
import { ConflictError } from "@/lib/errors";
import { COIN_REWARDS } from "@/lib/progression/coins";
import { completionService, localDateString } from "@/services/completionService";
import { habitService } from "@/services/habitService";
import { isRequiredDay } from "@/lib/progression/streak";
import type { WeekdayIndex } from "@/types/habit";

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbOrTx = typeof db | DbTransaction;

async function getUserTimezone(executor: DbOrTx, userId: string): Promise<string> {
  const [row] = await executor.select({ timezone: users.timezone }).from(users).where(eq(users.id, userId)).limit(1);
  return row?.timezone ?? "UTC";
}

/** Grants a one-time, date-scoped bonus. Inserts the ledger row FIRST,
 *  guarded by the (userId, referenceDate, reason) unique constraint —
 *  only if that insert actually lands (not a conflict, meaning this is
 *  genuinely the first time today) does the balance get incremented. This
 *  ordering is what makes the whole thing race-proof: two concurrent
 *  requests can't both increment the balance, because at most one of
 *  their inserts can ever succeed. */
async function grantDailyBonus(
  executor: DbOrTx,
  userId: string,
  reason: "daily_first_completion" | "perfect_day_bonus",
  referenceDate: string,
  amount: number
): Promise<boolean> {
  const [inserted] = await executor
    .insert(coinTransactions)
    .values({ userId, amount, reason, referenceDate })
    .onConflictDoNothing({ target: [coinTransactions.userId, coinTransactions.referenceDate, coinTransactions.reason] })
    .returning({ id: coinTransactions.id });

  if (!inserted) return false; // already granted today

  await executor
    .update(users)
    .set({ bloomCoins: sql`${users.bloomCoins} + ${amount}`, updatedAt: new Date() })
    .where(eq(users.id, userId));
  return true;
}

export const coinService = {
  async getBalance(userId: string): Promise<number> {
    const [row] = await db.select({ bloomCoins: users.bloomCoins }).from(users).where(eq(users.id, userId)).limit(1);
    return row?.bloomCoins ?? 0;
  },

  /**
   * Called after every successful habit completion (never after an undo —
   * these bonuses are date-scoped, not completion-scoped, so undoing and
   * re-completing the same or a different habit later the same day simply
   * hits the same already-claimed unique constraint and grants nothing
   * further; there is no way to claim either bonus twice in one day no
   * matter how many times habits are toggled).
   */
  async awardCompletionBonuses(userId: string): Promise<{ dailyFirstCompletion: boolean; perfectDay: boolean }> {
    const timezone = await getUserTimezone(db, userId);
    const today = localDateString(timezone);

    const dailyFirstCompletion = await grantDailyBonus(
      db,
      userId,
      "daily_first_completion",
      today,
      COIN_REWARDS.dailyFirstCompletion
    );

    // Perfect day: every ACTIVE habit actually scheduled for today (per its
    // own frequency) must be completed — same rule achievementService's
    // "perfect_day" metric uses, computed independently here since coin
    // bonuses and achievement unlocks are deliberately separate concerns
    // that both happen to read the same underlying completion data.
    const activeHabits = await habitService.listForUser(userId, { includeArchived: false });
    const statsByHabit = await completionService.getStatsForHabits(userId, activeHabits);
    const scheduledToday = activeHabits.filter((habit) =>
      isRequiredDay(today, { type: habit.frequency, customDays: (habit.frequencyDays ?? []) as WeekdayIndex[] })
    );
    const allScheduledCompleted =
      scheduledToday.length > 0 && scheduledToday.every((habit) => statsByHabit.get(habit.id)?.completedToday);

    const perfectDay = allScheduledCompleted
      ? await grantDailyBonus(db, userId, "perfect_day_bonus", today, COIN_REWARDS.perfectDayBonus)
      : false;

    return { dailyFirstCompletion, perfectDay };
  },

  /** Awards achievement coin rewards — called from achievementService's
   *  own unlock transaction, using the SAME transaction handle so the
   *  unlock row, the XP transaction, the coin ledger row, and the balance
   *  update all commit or roll back together. */
  async awardAchievementCoins(tx: DbTransaction, userId: string, achievementId: string, amount: number): Promise<void> {
    if (amount <= 0) return;
    await tx.insert(coinTransactions).values({ userId, achievementId, amount, reason: "achievement_reward" });
    await tx
      .update(users)
      .set({ bloomCoins: sql`${users.bloomCoins} + ${amount}`, updatedAt: new Date() })
      .where(eq(users.id, userId));
  },

  /**
   * Atomically deducts `amount` coins, but ONLY if the user actually has
   * enough — a single conditional UPDATE, not a separate read-then-write,
   * so two concurrent purchases can never both succeed against a balance
   * that only covers one of them. Throws ConflictError (0 rows updated)
   * rather than allowing a negative balance.
   */
  async spend(
    tx: DbTransaction,
    userId: string,
    amount: number,
    reason: "purchase",
    metadata: { itemId?: string; quantity?: number }
  ): Promise<number> {
    const [updated] = await tx
      .update(users)
      .set({ bloomCoins: sql`${users.bloomCoins} - ${amount}`, updatedAt: new Date() })
      .where(and(eq(users.id, userId), sql`${users.bloomCoins} >= ${amount}`))
      .returning({ bloomCoins: users.bloomCoins });

    if (!updated) throw new ConflictError("You don't have enough Bloom Coins for this.");

    await tx.insert(coinTransactions).values({
      userId,
      amount: -amount,
      reason,
      itemId: metadata.itemId,
      quantity: metadata.quantity,
    });

    return updated.bloomCoins;
  },
};
