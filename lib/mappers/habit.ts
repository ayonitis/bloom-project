import { ICON_MAP } from "@/lib/habitCatalog";
import type { HabitStats } from "@/services/completionService";
import type { HabitWithPlantSpecies } from "@/services/habitService";
import type { Habit, WeekdayIndex } from "@/types/habit";
import type { Habit as DashboardHabit } from "@/types/dashboard";

const ZERO_STATS: HabitStats = {
  currentStreak: 0,
  longestStreak: 0,
  totalCompletions: 0,
  completedToday: false,
};

/** The single place a DB habit row becomes the shape every Habit
 *  Management component already expects. Keeping this in one function
 *  means the frontend `Habit` type and the database schema can drift in
 *  their internal field names (e.g. `name` vs `title`) without that leaking
 *  into more than one place. */
export function toFrontendHabit(
  row: HabitWithPlantSpecies,
  stats: HabitStats = ZERO_STATS,
  totalXP = 0
): Habit {
  return {
    id: row.id,
    title: row.name,
    description: row.description,
    iconId: row.icon,
    category: row.category,
    color: row.color,
    difficulty: row.difficulty,
    frequency: {
      type: row.frequency,
      customDays: (row.frequencyDays ?? []) as WeekdayIndex[],
    },
    reminderTime: row.reminderTime,
    xpReward: row.xpReward,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    createdDate: row.createdAt.toISOString(),
    completedToday: stats.completedToday,
    totalCompletions: stats.totalCompletions,
    totalXP,
    // The frontend model only has one boolean ("is this in the active
    // list or the archived list"); the DB additionally has `active`,
    // reserved for a future pause-without-archiving feature the current
    // UI doesn't expose yet — so only `archived` factors in here.
    active: !row.archived,
    plantSpecies: row.plantSpecies,
  };
}

/** The Dashboard's "Today's Habits" card uses an older, simpler Habit
 *  shape (types/dashboard.ts) than the full Habit Management model above —
 *  this adapts one to the other so the Dashboard's existing components
 *  don't need to change at all to render real data. */
export function toDashboardHabit(habit: Habit): DashboardHabit {
  const icon = ICON_MAP[habit.iconId]?.icon;
  return {
    id: habit.id,
    title: habit.title,
    category: habit.category,
    difficulty: habit.difficulty,
    xpReward: habit.xpReward,
    icon: icon ?? ICON_MAP["book-open"].icon,
    completed: habit.completedToday,
  };
}
