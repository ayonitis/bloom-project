import type { HabitDifficulty } from "@/types/habit";

/**
 * The single source of truth for every XP/level number in the app. Tune
 * balance here — nothing else should hardcode an XP or level value.
 */
export const XP_CONFIG = {
  /** Base XP for completing a habit, by difficulty. */
  baseByDifficulty: {
    easy: 10,
    medium: 20,
    hard: 35,
  } satisfies Record<HabitDifficulty, number>,
  streakBonus: {
    /** A bonus tier unlocks every N days of streak. */
    intervalDays: 7,
    /** XP added per tier unlocked. */
    incrementPerInterval: 5,
    /** Hard cap — keeps this a modest nudge, not a runaway multiplier. */
    maxBonus: 15,
  },
} as const;

export const LEVEL_CONFIG = {
  /** XP required to go from level 1 to level 2. */
  baseXP: 100,
  /** Each subsequent level requires this much more than the last. */
  growthRate: 1.25,
} as const;

export interface HabitCompletionXP {
  base: number;
  streakBonus: number;
  total: number;
}

/** A modest, capped bonus — encourages consistency without exponential farming. */
export function calculateStreakBonus(streakAfterCompletion: number): number {
  const { intervalDays, incrementPerInterval, maxBonus } = XP_CONFIG.streakBonus;
  const tiersUnlocked = Math.floor(streakAfterCompletion / intervalDays);
  return Math.min(maxBonus, tiersUnlocked * incrementPerInterval);
}

/** `streakAfterCompletion` is the habit's current streak *including* the
 *  completion this XP is being calculated for. */
export function calculateHabitCompletionXP(
  difficulty: HabitDifficulty,
  streakAfterCompletion: number
): HabitCompletionXP {
  const base = XP_CONFIG.baseByDifficulty[difficulty];
  const streakBonus = calculateStreakBonus(streakAfterCompletion);
  return { base, streakBonus, total: base + streakBonus };
}

/** Cumulative XP required to *reach* `level` starting from 0 at level 1. */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let current = 2; current <= level; current++) {
    total += Math.round(LEVEL_CONFIG.baseXP * Math.pow(LEVEL_CONFIG.growthRate, current - 2));
  }
  return total;
}

export function calculateLevelFromXP(totalXP: number): number {
  let level = 1;
  // Levels are small integers in practice (this is not meant to scale to
  // thousands) — a linear scan here is simpler and plenty fast.
  while (getXPForLevel(level + 1) <= totalXP) {
    level += 1;
  }
  return level;
}

export interface NextLevelProgress {
  level: number;
  /** XP earned within the current level (what a progress bar should fill with). */
  xpIntoLevel: number;
  /** XP required to complete the current level (the progress bar's denominator). */
  xpNeededForLevel: number;
  progressPercent: number;
}

export function getXPForNextLevel(totalXP: number): NextLevelProgress {
  const level = calculateLevelFromXP(totalXP);
  const currentLevelFloor = getXPForLevel(level);
  const nextLevelFloor = getXPForLevel(level + 1);
  const xpIntoLevel = totalXP - currentLevelFloor;
  const xpNeededForLevel = nextLevelFloor - currentLevelFloor;
  const progressPercent =
    xpNeededForLevel <= 0 ? 100 : Math.round((xpIntoLevel / xpNeededForLevel) * 100);

  return { level, xpIntoLevel, xpNeededForLevel, progressPercent };
}
