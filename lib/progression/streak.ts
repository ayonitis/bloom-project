import type { HabitFrequencyType, WeekdayIndex } from "@/types/habit";

export interface StreakFrequency {
  type: HabitFrequencyType;
  customDays: WeekdayIndex[];
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function dateToUTCms(dateStr: string): number {
  return Date.parse(`${dateStr}T00:00:00Z`);
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateToUTCms(dateStr));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Whether `dateStr` (a "YYYY-MM-DD" calendar day) is one this habit's
 *  frequency actually requires — the day the streak can be broken by. */
export function isRequiredDay(dateStr: string, frequency: StreakFrequency): boolean {
  const dayOfWeek = new Date(dateToUTCms(dateStr)).getUTCDay(); // 0 Sun .. 6 Sat
  switch (frequency.type) {
    case "daily":
      return true;
    case "weekdays":
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case "weekends":
      return dayOfWeek === 0 || dayOfWeek === 6;
    case "custom":
      return frequency.customDays.includes(dayOfWeek as WeekdayIndex);
    default:
      return true;
  }
}

/**
 * Frequency-aware streak calculation — this is not "count consecutive
 * rows". It walks the actual calendar from the earliest completion up to
 * `today`, and only a *required* day (per the habit's frequency) can break
 * the streak: a missed Saturday on a "weekdays" habit doesn't reset
 * anything, but a missed Tuesday does. `today` not being completed yet
 * never breaks the streak by itself — the day isn't over — only a
 * required day that has already fully passed without a completion does.
 *
 * Bounded and cheap: the walk only ever spans (first completion → today),
 * a few hundred iterations at most for any realistic habit history.
 */
export function calculateStreaks(
  completionDates: string[],
  today: string,
  frequency: StreakFrequency
): StreakResult {
  if (completionDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const completed = new Set(completionDates);
  const firstDate = [...completionDates].sort()[0];

  let longest = 0;
  let running = 0;
  let cursor = firstDate;
  const todayMs = dateToUTCms(today);

  while (dateToUTCms(cursor) <= todayMs) {
    if (isRequiredDay(cursor, frequency)) {
      if (completed.has(cursor)) {
        running += 1;
        longest = Math.max(longest, running);
      } else if (cursor !== today) {
        running = 0;
      }
      // else: today, required, not completed yet — leave `running` as-is;
      // the day still has time left to be completed.
    }
    cursor = addDays(cursor, 1);
  }

  return { currentStreak: running, longestStreak: longest };
}

/** Exported for completeness/tests — daysBetween on plain "YYYY-MM-DD" dates. */
export function daysBetween(a: string, b: string): number {
  return Math.round((dateToUTCms(a) - dateToUTCms(b)) / ONE_DAY_MS);
}
