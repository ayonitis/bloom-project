import "server-only";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { habitCompletions, users } from "@/lib/db/schema";
import { CATEGORY_MAP } from "@/lib/habitCatalog";
import { addDays, daysBetween, isRequiredDay } from "@/lib/progression/streak";
import { getXPForNextLevel } from "@/lib/progression/xp";
import { localDateString } from "@/services/completionService";
import { completionService } from "@/services/completionService";
import { habitService } from "@/services/habitService";
import { xpService } from "@/services/xpService";
import { plantService } from "@/services/plantService";
import { inventoryService } from "@/services/inventoryService";
import { achievementService } from "@/services/achievementService";
import type {
  DailyActivity,
  HabitInsight,
  HabitPerformance,
  PeriodComparison,
  StatisticsData,
  StatsRange,
} from "@/types/statistics";
import type { WeekdayIndex } from "@/types/habit";

/** The heatmap/trend chart never needs more than roughly a year of days
 *  to be useful (this is exactly how GitHub's own contribution graph
 *  bounds itself) — capping this keeps the response small and the
 *  per-day loop cheap even for a multi-year "All Time" account. The
 *  overview's all-time totals are computed separately and are never
 *  affected by this cap. */
const MAX_DAILY_ACTIVITY_DAYS = 371;

function toFrequency(habit: { frequency: string; frequencyDays: number[] | null }): {
  type: "daily" | "weekdays" | "weekends" | "custom";
  customDays: WeekdayIndex[];
} {
  return {
    type: habit.frequency as "daily" | "weekdays" | "weekends" | "custom",
    customDays: (habit.frequencyDays ?? []) as WeekdayIndex[],
  };
}

async function getUserTimezone(userId: string): Promise<string> {
  const [row] = await db.select({ timezone: users.timezone }).from(users).where(eq(users.id, userId)).limit(1);
  return row?.timezone ?? "UTC";
}

/** The first date this user ever completed anything — the natural lower
 *  bound for "All Time" and for deciding whether a period comparison has
 *  enough history behind it to be meaningful. */
async function getEarliestCompletionDate(userId: string): Promise<string | null> {
  const [row] = await db
    .select({ earliest: sql<string | null>`min(${habitCompletions.completionDate})` })
    .from(habitCompletions)
    .where(eq(habitCompletions.userId, userId));
  return row?.earliest ?? null;
}

function getRangeStart(range: StatsRange, today: string, earliestDate: string | null): string {
  if (range === "7d") return addDays(today, -6);
  if (range === "30d") return addDays(today, -29);
  if (range === "90d") return addDays(today, -89);
  if (range === "year") return `${today.slice(0, 4)}-01-01`;
  return earliestDate ?? today;
}

/** For the period-over-period comparison: the same number of days,
 *  immediately preceding the current range. */
function getPreviousRangeBounds(currentStart: string, currentEnd: string): { start: string; end: string } {
  const spanDays = daysBetween(currentStart, currentEnd) + 1;
  const end = addDays(currentStart, -1);
  const start = addDays(end, -(spanDays - 1));
  return { start, end };
}

interface CompletionRow {
  habitId: string;
  completionDate: string;
  xpEarned: number;
}

async function getCompletionsInRange(userId: string, start: string, end: string): Promise<CompletionRow[]> {
  return db
    .select({
      habitId: habitCompletions.habitId,
      completionDate: habitCompletions.completionDate,
      xpEarned: habitCompletions.xpEarned,
    })
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.userId, userId),
        gte(habitCompletions.completionDate, start),
        lte(habitCompletions.completionDate, end)
      )
    );
}

function computeRangeCompletionRate(
  habits: Array<{ id: string; frequency: string; frequencyDays: number[] | null; createdAt: Date }>,
  completions: CompletionRow[],
  start: string,
  end: string,
  filterHabitId?: string
): { completed: number; scheduled: number } {
  const relevantHabits = filterHabitId ? habits.filter((h) => h.id === filterHabitId) : habits;
  const completionsByDate = new Map<string, Set<string>>();
  for (const row of completions) {
    if (filterHabitId && row.habitId !== filterHabitId) continue;
    if (!completionsByDate.has(row.completionDate)) completionsByDate.set(row.completionDate, new Set());
    completionsByDate.get(row.completionDate)!.add(row.habitId);
  }

  let completed = 0;
  let scheduled = 0;
  const days = daysBetween(start, end) + 1;
  for (let i = 0; i < days; i += 1) {
    const day = addDays(start, i);
    const completedHabitIds = completionsByDate.get(day);
    for (const habit of relevantHabits) {
      // A habit scheduled before it existed isn't "missed" — only count
      // days on or after the habit was created.
      if (new Date(habit.createdAt) > new Date(`${day}T23:59:59`)) continue;
      if (!isRequiredDay(day, toFrequency(habit))) continue;
      scheduled += 1;
      if (completedHabitIds?.has(habit.id)) completed += 1;
    }
  }
  return { completed, scheduled };
}

export const statisticsService = {
  async getStatistics(userId: string, range: StatsRange): Promise<StatisticsData> {
    const timezone = await getUserTimezone(userId);
    const today = localDateString(timezone);
    const earliestDate = await getEarliestCompletionDate(userId);

    const rangeStart = getRangeStart(range, today, earliestDate);
    const [activeHabits, allCompletionsInRange, totalCompletionsAllTimeRow, totalXPAllTime] = await Promise.all([
      habitService.listForUserWithPlantSpecies(userId, { includeArchived: false }),
      getCompletionsInRange(userId, rangeStart, today),
      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(habitCompletions)
        .where(eq(habitCompletions.userId, userId)),
      xpService.getTotalXP(userId),
    ]);
    const statsByHabit = await completionService.getStatsForHabits(userId, activeHabits);

    const hasAnyData = (totalCompletionsAllTimeRow[0]?.count ?? 0) > 0;

    // ---- Daily activity (trend + heatmap), capped for payload size ----
    const fullDayCount = daysBetween(rangeStart, today) + 1;
    const chartStart =
      fullDayCount > MAX_DAILY_ACTIVITY_DAYS ? addDays(today, -(MAX_DAILY_ACTIVITY_DAYS - 1)) : rangeStart;
    const completionsForChart =
      chartStart === rangeStart ? allCompletionsInRange : await getCompletionsInRange(userId, chartStart, today);

    const byDate = new Map<string, { completed: number; xp: number }>();
    for (const row of completionsForChart) {
      const entry = byDate.get(row.completionDate) ?? { completed: 0, xp: 0 };
      entry.completed += 1;
      entry.xp += row.xpEarned;
      byDate.set(row.completionDate, entry);
    }
    const chartDays = daysBetween(chartStart, today) + 1;
    const dailyActivity: DailyActivity[] = Array.from({ length: chartDays }, (_, i) => {
      const day = addDays(chartStart, i);
      const scheduled = activeHabits.filter(
        (habit) => new Date(habit.createdAt) <= new Date(`${day}T23:59:59`) && isRequiredDay(day, toFrequency(habit))
      ).length;
      const entry = byDate.get(day);
      return { date: day, completed: entry?.completed ?? 0, scheduled, xpEarned: entry?.xp ?? 0 };
    });

    // ---- Overview completion rate, for the SELECTED range exactly ----
    const { completed: totalCompletedInRange, scheduled: totalScheduledInRange } = computeRangeCompletionRate(
      activeHabits,
      allCompletionsInRange,
      rangeStart,
      today
    );
    const completionRate =
      totalScheduledInRange > 0 ? Math.round((totalCompletedInRange / totalScheduledInRange) * 100) : 0;

    let bestCurrentStreak = 0;
    let bestLongestStreak = 0;
    for (const stats of statsByHabit.values()) {
      bestCurrentStreak = Math.max(bestCurrentStreak, stats.currentStreak);
      bestLongestStreak = Math.max(bestLongestStreak, stats.longestStreak);
    }

    const xpEarnedInRange = allCompletionsInRange.reduce((sum, row) => sum + row.xpEarned, 0);
    const xpProgress = getXPForNextLevel(totalXPAllTime);

    const [achievementsView, achievementSummary] = await Promise.all([
      achievementService.getUserAchievementsView(userId),
      achievementService.getSummary(userId),
    ]);

    // ---- Per-habit performance, over the selected range ----
    const rangeStatsByHabitId = new Map<string, { completed: number; scheduled: number }>();
    for (const habit of activeHabits) {
      rangeStatsByHabitId.set(
        habit.id,
        computeRangeCompletionRate(activeHabits, allCompletionsInRange, rangeStart, today, habit.id)
      );
    }

    const habitPerformance: HabitPerformance[] = activeHabits.map((habit) => {
      const { completed, scheduled } = rangeStatsByHabitId.get(habit.id) ?? { completed: 0, scheduled: 0 };
      const stats = statsByHabit.get(habit.id);
      const xpEarnedInRangeForHabit = allCompletionsInRange
        .filter((row) => row.habitId === habit.id)
        .reduce((sum, row) => sum + row.xpEarned, 0);
      return {
        habitId: habit.id,
        title: habit.name,
        categoryLabel: CATEGORY_MAP[habit.category]?.label ?? habit.category,
        completionRate: scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0,
        currentStreak: stats?.currentStreak ?? 0,
        longestStreak: stats?.longestStreak ?? 0,
        totalCompletions: stats?.totalCompletions ?? 0,
        xpEarnedInRange: xpEarnedInRangeForHabit,
      };
    });

    // Only meaningful with a handful of scheduled days behind them, and
    // only worth contrasting "strongest" vs. "weakest" with 2+ habits.
    const qualifying = habitPerformance.filter((habit) => (rangeStatsByHabitId.get(habit.habitId)?.scheduled ?? 0) >= 3);
    let strongestHabit: HabitInsight | null = null;
    let weakestHabit: HabitInsight | null = null;
    if (qualifying.length >= 2) {
      const sorted = [...qualifying].sort((a, b) => b.completionRate - a.completionRate);
      strongestHabit = { habitTitle: sorted[0].title, completionRate: sorted[0].completionRate };
      weakestHabit = {
        habitTitle: sorted[sorted.length - 1].title,
        completionRate: sorted[sorted.length - 1].completionRate,
      };
    }

    // ---- Period-over-period comparison ----
    let comparison: PeriodComparison = {
      available: false,
      currentRate: completionRate,
      previousRate: 0,
      deltaPoints: 0,
    };
    if (range !== "all") {
      const { start: prevStart, end: prevEnd } = getPreviousRangeBounds(rangeStart, today);
      const enoughHistory = earliestDate !== null && earliestDate <= prevStart;
      if (enoughHistory) {
        const previousCompletions = await getCompletionsInRange(userId, prevStart, prevEnd);
        const { completed: prevCompleted, scheduled: prevScheduled } = computeRangeCompletionRate(
          activeHabits,
          previousCompletions,
          prevStart,
          prevEnd
        );
        const previousRate = prevScheduled > 0 ? Math.round((prevCompleted / prevScheduled) * 100) : 0;
        comparison = {
          available: true,
          currentRate: completionRate,
          previousRate,
          deltaPoints: completionRate - previousRate,
        };
      }
    }

    // ---- Garden ----
    const [plants, inventoryItems] = await Promise.all([
      plantService.listForUser(userId),
      inventoryService.listForUser(userId),
    ]);
    const decorationItems = inventoryItems.filter((item) => item.category === "decoration");
    const garden = {
      plantsGrown: plants.length,
      fullyGrownPlants: plants.filter((plant) => plant.growthPercent >= 100).length,
      averageGrowthPercent:
        plants.length > 0 ? Math.round(plants.reduce((sum, p) => sum + p.growthPercent, 0) / plants.length) : 0,
      decorationsOwned: decorationItems.reduce((sum, item) => sum + item.quantity, 0),
      decorationsPlaced: decorationItems.reduce((sum, item) => sum + item.placed, 0),
    };

    // ---- Achievements ----
    const nextLocked = achievementsView
      .filter((a) => !a.isUnlocked && !a.isSecret && a.progress)
      .sort((a, b) => (b.progress?.percent ?? 0) - (a.progress?.percent ?? 0))[0];
    const achievements = {
      unlocked: achievementSummary.unlockedCount,
      total: achievementSummary.totalCount,
      recentName: achievementSummary.recent[0]?.name ?? null,
      nextMilestone: nextLocked?.progress
        ? {
            name: nextLocked.name,
            currentValue: nextLocked.progress.currentValue,
            targetValue: nextLocked.progress.targetValue,
            percent: nextLocked.progress.percent,
          }
        : null,
    };

    // ---- Motivational insights: deterministic, only ever stated when supported ----
    const insights: string[] = [];
    if (hasAnyData) {
      if (comparison.available && comparison.deltaPoints > 0) {
        insights.push(`Your completion rate improved ${comparison.deltaPoints} points over the previous period.`);
      } else if (comparison.available && comparison.deltaPoints < 0) {
        insights.push(
          `Your completion rate dipped ${Math.abs(comparison.deltaPoints)} points from the previous period.`
        );
      }
      if (strongestHabit) {
        insights.push(`You're most consistent with "${strongestHabit.habitTitle}" at ${strongestHabit.completionRate}%.`);
      }
      if (bestCurrentStreak >= 3) {
        insights.push(`You're on a ${bestCurrentStreak}-day streak right now — keep it going.`);
      }
      if (xpProgress.xpNeededForLevel - xpProgress.xpIntoLevel > 0 && xpProgress.progressPercent >= 60) {
        insights.push(
          `You're only ${xpProgress.xpNeededForLevel - xpProgress.xpIntoLevel} XP away from Level ${xpProgress.level + 1}.`
        );
      }
      if (garden.fullyGrownPlants > 0) {
        insights.push(
          `You've fully grown ${garden.fullyGrownPlants} plant${garden.fullyGrownPlants === 1 ? "" : "s"} so far.`
        );
      }
      if (achievements.nextMilestone) {
        const remaining = achievements.nextMilestone.targetValue - achievements.nextMilestone.currentValue;
        if (remaining > 0) {
          insights.push(`You're ${remaining} away from unlocking "${achievements.nextMilestone.name}".`);
        }
      }
    }

    return {
      range,
      overview: {
        hasAnyData,
        completionRate,
        totalCompletedInRange,
        totalScheduledInRange,
        bestCurrentStreak,
        bestLongestStreak,
        totalCompletionsAllTime: totalCompletionsAllTimeRow[0]?.count ?? 0,
        totalXPAllTime,
        xpEarnedInRange,
        level: xpProgress.level,
        xpProgress,
        achievementsUnlocked: achievements.unlocked,
        totalAchievements: achievements.total,
      },
      dailyActivity,
      habitPerformance,
      strongestHabit,
      weakestHabit,
      comparison,
      garden,
      achievements,
      insights,
    };
  },
};
