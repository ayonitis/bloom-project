import {
  Droplet,
  BookOpen,
  Dumbbell,
  Wind,
  PenLine,
  Music,
  Code2,
  Brain,
  Sun,
  Moon,
  Heart,
  Palette,
  Coffee,
  Utensils,
  Bike,
  Camera,
  HeartPulse,
  Target,
  Sparkles,
} from "lucide-react";
import { XP_CONFIG } from "@/lib/progression/xp";
import type {
  CategoryOption,
  HabitCategoryId,
  HabitDifficulty,
  HabitFrequency,
  HabitFrequencyType,
  IconOption,
  PlantOption,
  PlantSpeciesId,
} from "@/types/habit";

export const ICON_OPTIONS: IconOption[] = [
  { id: "droplet", icon: Droplet, label: "Water" },
  { id: "book-open", icon: BookOpen, label: "Reading" },
  { id: "dumbbell", icon: Dumbbell, label: "Workout" },
  { id: "wind", icon: Wind, label: "Breathing" },
  { id: "pen-line", icon: PenLine, label: "Writing" },
  { id: "music", icon: Music, label: "Music" },
  { id: "code", icon: Code2, label: "Coding" },
  { id: "brain", icon: Brain, label: "Focus" },
  { id: "sun", icon: Sun, label: "Morning" },
  { id: "moon", icon: Moon, label: "Evening" },
  { id: "heart", icon: Heart, label: "Care" },
  { id: "palette", icon: Palette, label: "Art" },
  { id: "coffee", icon: Coffee, label: "Ritual" },
  { id: "utensils", icon: Utensils, label: "Nutrition" },
  { id: "bike", icon: Bike, label: "Cycling" },
  { id: "camera", icon: Camera, label: "Photography" },
];

export const ICON_MAP: Record<string, IconOption> = Object.fromEntries(
  ICON_OPTIONS.map((option) => [option.id, option])
);

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: "health", label: "Health", color: "#3BB273", bg: "rgba(59,178,115,0.12)", icon: HeartPulse },
  { id: "fitness", label: "Fitness", color: "#F5A623", bg: "rgba(245,166,35,0.12)", icon: Dumbbell },
  { id: "learning", label: "Learning", color: "#5AA9FF", bg: "rgba(90,169,255,0.12)", icon: BookOpen },
  { id: "productivity", label: "Productivity", color: "#D97757", bg: "rgba(217,119,87,0.12)", icon: Target },
  { id: "mindfulness", label: "Mindfulness", color: "#8B7FD6", bg: "rgba(139,127,214,0.12)", icon: Wind },
  { id: "creativity", label: "Creativity", color: "#FF9E7D", bg: "rgba(255,158,125,0.12)", icon: Palette },
  { id: "custom", label: "Custom", color: "#7A8A91", bg: "rgba(122,138,145,0.12)", icon: Sparkles },
];

export const CATEGORY_MAP: Record<HabitCategoryId, CategoryOption> = Object.fromEntries(
  CATEGORY_OPTIONS.map((option) => [option.id, option])
) as Record<HabitCategoryId, CategoryOption>;

export const PLANT_OPTIONS: PlantOption[] = [
  { id: "oak", name: "Oak Tree", goodFor: "Reading & steady routines" },
  { id: "sunflower", name: "Sunflower", goodFor: "Workouts & energy" },
  { id: "lotus", name: "Lotus", goodFor: "Meditation & calm" },
  { id: "fern", name: "Fern", goodFor: "Hydration & small daily care" },
  { id: "bonsai", name: "Bonsai", goodFor: "Focus & patient discipline" },
  { id: "cactus", name: "Cactus", goodFor: "Resilience on hard days" },
  { id: "clover", name: "Clover", goodFor: "Gratitude & little wins" },
];

export const PLANT_MAP: Record<PlantSpeciesId, PlantOption> = Object.fromEntries(
  PLANT_OPTIONS.map((option) => [option.id, option])
) as Record<PlantSpeciesId, PlantOption>;

/** A sensible default plant per category, used to pre-select step 6. */
export const CATEGORY_DEFAULT_PLANT: Record<HabitCategoryId, PlantSpeciesId> = {
  health: "fern",
  fitness: "sunflower",
  learning: "oak",
  productivity: "bonsai",
  mindfulness: "lotus",
  creativity: "clover",
  custom: "cactus",
};

export const DIFFICULTY_OPTIONS: {
  id: HabitDifficulty;
  label: string;
  description: string;
  xpReward: number;
  dots: number;
}[] = [
  { id: "easy", label: "Easy", description: "A gentle, low-friction habit", xpReward: XP_CONFIG.baseByDifficulty.easy, dots: 1 },
  { id: "medium", label: "Medium", description: "Takes some real effort", xpReward: XP_CONFIG.baseByDifficulty.medium, dots: 2 },
  { id: "hard", label: "Hard", description: "A genuine daily challenge", xpReward: XP_CONFIG.baseByDifficulty.hard, dots: 3 },
];

export const DIFFICULTY_MAP: Record<HabitDifficulty, (typeof DIFFICULTY_OPTIONS)[number]> =
  Object.fromEntries(DIFFICULTY_OPTIONS.map((option) => [option.id, option])) as Record<
    HabitDifficulty,
    (typeof DIFFICULTY_OPTIONS)[number]
  >;

export const FREQUENCY_OPTIONS: { id: HabitFrequencyType; label: string; description: string }[] = [
  { id: "daily", label: "Daily", description: "Every single day" },
  { id: "weekdays", label: "Weekdays", description: "Monday through Friday" },
  { id: "weekends", label: "Weekends", description: "Saturday and Sunday" },
  { id: "custom", label: "Custom", description: "Pick your own days" },
];

export const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;
export const WEEKDAY_FULL_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Growth math and stages now live in lib/progression/plantGrowth.ts, the
 *  single source of truth the server (plantService) and the client
 *  (gardenEngine, HabitCard, PlantVisual) all import from — see that file
 *  for calculatePlantGrowthPercent / getPlantGrowthStage / getPlantVisualTier. */

export function formatFrequency(frequency: HabitFrequency): string {
  if (frequency.type === "custom") {
    if (frequency.customDays.length === 0) return "Custom";
    if (frequency.customDays.length === 7) return "Every day";
    return frequency.customDays
      .slice()
      .sort((a, b) => a - b)
      .map((day) => WEEKDAY_LABELS[day])
      .join(" ");
  }
  const match = FREQUENCY_OPTIONS.find((option) => option.id === frequency.type);
  return match?.label ?? "Daily";
}
