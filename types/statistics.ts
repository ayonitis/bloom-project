import type { NextLevelProgress } from "@/lib/progression/xp";

export type StatsRange = "7d" | "30d" | "90d" | "year" | "all";

export const STATS_RANGE_LABELS: Record<StatsRange, string> = {
  "7d": "7 Days",
  "30d": "30 Days",
  "90d": "90 Days",
  year: "This Year",
  all: "All Time",
};

export interface DailyActivity {
  /** "YYYY-MM-DD", in the user's own timezone. */
  date: string;
  completed: number;
  scheduled: number;
  /** Sum of habitCompletions.xpEarned for this day — habit-completion XP
   *  specifically (streak bonuses included), not achievement/seed XP. */
  xpEarned: number;
}

export interface HabitPerformance {
  habitId: string;
  title: string;
  categoryLabel: string;
  /** 0–100, over the selected range only. */
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  /** XP earned by this habit within the selected range. */
  xpEarnedInRange: number;
}

export interface PeriodComparison {
  available: boolean;
  currentRate: number;
  previousRate: number;
  /** currentRate - previousRate, in percentage points. */
  deltaPoints: number;
}

export type XPProgress = NextLevelProgress;

export interface StatisticsOverview {
  hasAnyData: boolean;
  completionRate: number;
  totalCompletedInRange: number;
  totalScheduledInRange: number;
  bestCurrentStreak: number;
  bestLongestStreak: number;
  totalCompletionsAllTime: number;
  totalXPAllTime: number;
  xpEarnedInRange: number;
  level: number;
  xpProgress: XPProgress;
  achievementsUnlocked: number;
  totalAchievements: number;
}

export interface GardenStatistics {
  plantsGrown: number;
  fullyGrownPlants: number;
  averageGrowthPercent: number;
  decorationsOwned: number;
  decorationsPlaced: number;
}

export interface AchievementMilestone {
  name: string;
  currentValue: number;
  targetValue: number;
  percent: number;
}

export interface AchievementStatistics {
  unlocked: number;
  total: number;
  recentName: string | null;
  nextMilestone: AchievementMilestone | null;
}

export interface HabitInsight {
  habitTitle: string;
  completionRate: number;
}

export interface StatisticsData {
  range: StatsRange;
  overview: StatisticsOverview;
  /** Capped to at most ~1 year of days even when range is "all" — the
   *  overview's all-time numbers above are unaffected by this cap. */
  dailyActivity: DailyActivity[];
  habitPerformance: HabitPerformance[];
  strongestHabit: HabitInsight | null;
  weakestHabit: HabitInsight | null;
  comparison: PeriodComparison;
  garden: GardenStatistics;
  achievements: AchievementStatistics;
  /** Deterministic, plain-language observations generated from the data
   *  above — never a model call, and never a claim the data doesn't
   *  actually support (see statisticsService's own note). */
  insights: string[];
}
