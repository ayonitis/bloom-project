import type { LucideIcon } from "lucide-react";

export type HabitCategory =
  | "health"
  | "fitness"
  | "learning"
  | "productivity"
  | "mindfulness"
  | "creativity"
  | "custom";

export type HabitDifficulty = "easy" | "medium" | "hard";

export interface Habit {
  id: string;
  title: string;
  category: HabitCategory;
  difficulty: HabitDifficulty;
  xpReward: number;
  icon: LucideIcon;
  completed: boolean;
}

export interface PlayerStats {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  gardenHealth: number;
  /** Percent complete (0–100) for each of the last 7 days, oldest first. */
  weeklyProgress: number[];
}

export type GardenTileType =
  | "grass"
  | "flowerAmber"
  | "flowerSky"
  | "flowerCoral"
  | "tree"
  | "sprout"
  | "path"
  | "water"
  | "rock"
  | "empty";

export interface GardenTile {
  id: string;
  type: GardenTileType;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Only "dashboard" is implemented so far — everything else is a preview. */
  available: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  available: boolean;
}
