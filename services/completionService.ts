import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { habitCompletions, habits, users } from "@/lib/db/schema";
import { ConflictError, NotFoundError, isUniqueViolation } from "@/lib/errors";
import { calculateStreaks, type StreakFrequency } from "@/lib/progression/streak";
import { calculateHabitCompletionXP } from "@/lib/progression/xp";
import { xpService } from "@/services/xpService";
import type { HabitFrequencyType, WeekdayIndex } from "@/types/habit";

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completedToday: boolean;
}

export interface HabitCompletionResult extends HabitStats {
  /** Total XP this specific completion earned (base + any streak bonus). */
  xpAwarded: number;
}

/** "YYYY-MM-DD" for the given instant, in the given IANA timezone. Used
 *  consistently everywhere a completion's "which day does this count for"
 *  is decided — never a bare `new Date()` — so frontend, server, and the
 *  stored `completion_date` column always agree. */
export function localDateString(timezone: string, at: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD, which is exactly the form completionDate
  // is stored in and lets us compare/sort as plain strings.
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(at);
}

function toStreakFrequency(row: {
  frequency: HabitFrequencyType;
  frequencyDays: number[] | null;
}): StreakFrequency {
  return { type: row.frequency, customDays: (row.frequencyDays ?? []) as WeekdayIndex[] };
}

function statsFromDates(dates: string[], today: string, frequency: StreakFrequency): HabitStats {
  const { currentStreak, longestStreak } = calculateStreaks(dates, today, frequency);
  return {
    currentStreak,
    longestStreak,
    totalCompletions: dates.length,
    completedToday: dates.includes(today),
  };
}

async function getOwnedActiveHabit(userId: string, habitId: string) {
  const [habit] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .limit(1);
  if (!habit) throw new NotFoundError("Habit");
  return habit;
}

async function getUserTimezone(userId: string): Promise<string> {
  const [row] = await db.select({ timezone: users.timezone }).from(users).where(eq(users.id, userId)).limit(1);
  return row?.timezone ?? "UTC";
}

export const completionService = {
  /**
   * The full completion flow, atomically: insert the completion (the
   * unique (habitId, completionDate) constraint is what actually prevents
   * a duplicate — a second concurrent request fails here and never reaches
   * the XP step), compute the resulting streak with the habit's real
   * frequency, calculate XP from that streak, record it, and persist the
   * total onto the completion row. Everything either all happens or none
   * of it does.
   */
  async completeHabit(userId: string, habitId: string): Promise<HabitCompletionResult> {
    const habit = await getOwnedActiveHabit(userId, habitId);
    if (!habit.active || habit.archived) {
      throw new ConflictError("This habit is archived and can't be completed.");
    }
    const timezone = await getUserTimezone(userId);
    const today = localDateString(timezone);
    const frequency = toStreakFrequency(habit);

    const xpAwarded = await db.transaction(async (tx) => {
      let completionId: string;
      try {
        const [inserted] = await tx
          .insert(habitCompletions)
          .values({
            habitId,
            userId,
            completionDate: today,
            // Placeholder — replaced below once the post-completion streak
            // (and therefore the real XP total) is known. Never read by
            // anything until this transaction commits.
            xpEarned: 0,
          })
          .returning({ id: habitCompletions.id });
        completionId = inserted.id;
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new ConflictError("This habit is already marked complete for today.");
        }
        throw error;
      }

      const rows = await tx
        .select({ completionDate: habitCompletions.completionDate })
        .from(habitCompletions)
        .where(eq(habitCompletions.habitId, habitId));
      const { currentStreak } = calculateStreaks(
        rows.map((r) => r.completionDate),
        today,
        frequency
      );

      const xp = calculateHabitCompletionXP(habit.difficulty, currentStreak);

      await tx
        .update(habitCompletions)
        .set({ xpEarned: xp.total })
        .where(eq(habitCompletions.id, completionId));

      await xpService.recordHabitCompletionXP(tx, {
        userId,
        habitId,
        completionId,
        base: xp.base,
        streakBonus: xp.streakBonus,
      });

      return xp.total;
    });

    const stats = await completionService.getStats(userId, habitId);
    return { ...stats, xpAwarded };
  },

  /** Deletes today's completion. Its XP transactions cascade-delete with
   *  it (see the FK on xp_transactions.completionId) — no separate XP
   *  cleanup code needed. Only ever touches *today's* row; there is no
   *  path to undo a past date's completion. */
  async undoCompletion(userId: string, habitId: string): Promise<HabitStats> {
    await getOwnedActiveHabit(userId, habitId);
    const timezone = await getUserTimezone(userId);
    const today = localDateString(timezone);

    await db
      .delete(habitCompletions)
      .where(and(eq(habitCompletions.habitId, habitId), eq(habitCompletions.completionDate, today)));

    return completionService.getStats(userId, habitId);
  },

  async getStats(userId: string, habitId: string): Promise<HabitStats> {
    const habit = await getOwnedActiveHabit(userId, habitId);
    const timezone = await getUserTimezone(userId);
    const today = localDateString(timezone);

    const rows = await db
      .select({ completionDate: habitCompletions.completionDate })
      .from(habitCompletions)
      .where(eq(habitCompletions.habitId, habit.id))
      .orderBy(habitCompletions.completionDate);

    return statsFromDates(
      rows.map((r) => r.completionDate),
      today,
      toStreakFrequency(habit)
    );
  },

  /** Same as calling getStats() once per habit, but in one query instead of
   *  N. Each habit's own frequency is required for a correct streak, so
   *  the caller passes the habit rows it already has (from
   *  habitService.listForUserWithPlantSpecies) rather than this
   *  re-querying habits it was just given. */
  async getStatsForHabits(
    userId: string,
    habitList: { id: string; frequency: HabitFrequencyType; frequencyDays: number[] | null }[]
  ): Promise<Map<string, HabitStats>> {
    const result = new Map<string, HabitStats>();
    if (habitList.length === 0) return result;

    const timezone = await getUserTimezone(userId);
    const today = localDateString(timezone);
    const habitIds = habitList.map((h) => h.id);

    const rows = await db
      .select({ habitId: habitCompletions.habitId, completionDate: habitCompletions.completionDate })
      .from(habitCompletions)
      .where(and(eq(habitCompletions.userId, userId), inArray(habitCompletions.habitId, habitIds)));

    const datesByHabit = new Map<string, string[]>();
    for (const row of rows) {
      const list = datesByHabit.get(row.habitId) ?? [];
      list.push(row.completionDate);
      datesByHabit.set(row.habitId, list);
    }

    for (const habit of habitList) {
      result.set(
        habit.id,
        statsFromDates(datesByHabit.get(habit.id) ?? [], today, toStreakFrequency(habit))
      );
    }
    return result;
  },
};
