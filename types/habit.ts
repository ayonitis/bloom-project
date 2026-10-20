import type { LucideIcon } from "lucide-react";

export type HabitCategoryId =
  | "health"
  | "fitness"
  | "learning"
  | "productivity"
  | "mindfulness"
  | "creativity"
  | "custom";

export type HabitDifficulty = "easy" | "medium" | "hard";

export type HabitFrequencyType = "daily" | "weekdays" | "weekends" | "custom";

/** 0 = Sunday … 6 = Saturday, only meaningful when frequency is "custom". */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface HabitFrequency {
  type: HabitFrequencyType;
  /** Only populated when type is "custom". */
  customDays: WeekdayIndex[];
}

export type PlantSpeciesId =
  | "oak"
  | "sunflower"
  | "lotus"
  | "fern"
  | "bonsai"
  | "cactus"
  | "clover";

export interface Habit {
  id: string;
  title: string;
  description: string;
  /** Key into ICON_OPTIONS — kept serializable rather than a component reference. */
  iconId: string;
  category: HabitCategoryId;
  /** Key into CATEGORY_OPTIONS' color, duplicated here so a habit can carry a
   *  custom color independent of its category if it ever needs to. */
  color: string;
  difficulty: HabitDifficulty;
  frequency: HabitFrequency;
  reminderTime: string | null;
  xpReward: number;
  currentStreak: number;
  longestStreak: number;
  createdDate: string;
  completedToday: boolean;
  /** Total number of times this habit has ever been completed. */
  totalCompletions: number;
  /** Real, server-computed total XP this habit has ever earned (includes
   *  every streak bonus at the time it was earned) — the single number
   *  plant growth is derived from. See lib/progression/plantGrowth.ts. */
  totalXP: number;
  active: boolean;
  plantSpecies: PlantSpeciesId;
}

export type HabitStatusFilter = "all" | "completed" | "pending" | "archived";

export interface HabitFilters {
  status: HabitStatusFilter;
  category: HabitCategoryId | "all";
  difficulty: HabitDifficulty | "all";
  frequency: HabitFrequencyType | "all";
  search: string;
}

export const DEFAULT_FILTERS: HabitFilters = {
  status: "all",
  category: "all",
  difficulty: "all",
  frequency: "all",
  search: "",
};

/** The shape collected by the multi-step create/edit modal before an id, streaks,
 *  and dates are attached. */
export interface HabitDraft {
  title: string;
  description: string;
  iconId: string;
  category: HabitCategoryId;
  difficulty: HabitDifficulty;
  frequency: HabitFrequency;
  reminderTime: string | null;
  plantSpecies: PlantSpeciesId;
}

export interface IconOption {
  id: string;
  icon: LucideIcon;
  label: string;
}

export interface CategoryOption {
  id: HabitCategoryId;
  label: string;
  color: string;
  bg: string;
  icon: LucideIcon;
}

export interface PlantOption {
  id: PlantSpeciesId;
  name: string;
  goodFor: string;
}
