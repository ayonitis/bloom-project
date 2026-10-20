import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { habitService } from "@/services/habitService";
import { completionService, localDateString } from "@/services/completionService";
import { xpService } from "@/services/xpService";
import { getXPForNextLevel } from "@/lib/progression/xp";

export interface UserProgression {
  totalXP: number;
  xpToday: number;
  level: number;
  xpIntoLevel: number;
  xpNeededForLevel: number;
  levelProgressPercent: number;
}

export interface DashboardProgression extends UserProgression {
  completedToday: number;
  totalActiveHabits: number;
  /** The longest currently-running streak across the user's active habits. */
  currentStreak: number;
  /** The longest streak any habit has ever reached. */
  bestStreak: number;
}

async function getUserTimezone(userId: string): Promise<string> {
  const [row] = await db.select({ timezone: users.timezone }).from(users).where(eq(users.id, userId)).limit(1);
  return row?.timezone ?? "UTC";
}

export const progressionService = {
  async getUserProgression(userId: string): Promise<UserProgression> {
    const timezone = await getUserTimezone(userId);
    const today = localDateString(timezone);

    const [totalXP, xpToday] = await Promise.all([
      xpService.getTotalXP(userId),
      xpService.getXPEarnedForCompletionDate(userId, today),
    ]);
    const { level, xpIntoLevel, xpNeededForLevel, progressPercent } = getXPForNextLevel(totalXP);

    return {
      totalXP,
      xpToday,
      level,
      xpIntoLevel,
      xpNeededForLevel,
      levelProgressPercent: progressPercent,
    };
  },

  /** Everything the Dashboard's stats need in one call: real XP/level plus
   *  habit-derived aggregates. "Current streak" and "best streak" are
   *  necessarily a simplification now that every habit has its own — this
   *  takes the strongest currently-running streak and the best ever
   *  reached across the user's active habits, the simplest meaningful
   *  single number without inventing a new, more complex cross-habit
   *  metric this phase doesn't call for. */
  async getDashboardProgression(userId: string): Promise<DashboardProgression> {
    const [progression, activeHabits] = await Promise.all([
      progressionService.getUserProgression(userId),
      habitService.listForUser(userId, { includeArchived: false }),
    ]);

    const statsByHabit = await completionService.getStatsForHabits(userId, activeHabits);

    let completedToday = 0;
    let currentStreak = 0;
    let bestStreak = 0;
    for (const habit of activeHabits) {
      const stats = statsByHabit.get(habit.id);
      if (!stats) continue;
      if (stats.completedToday) completedToday += 1;
      currentStreak = Math.max(currentStreak, stats.currentStreak);
      bestStreak = Math.max(bestStreak, stats.longestStreak);
    }

    return {
      ...progression,
      completedToday,
      totalActiveHabits: activeHabits.length,
      currentStreak,
      bestStreak,
    };
  },
};
