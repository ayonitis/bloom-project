import type { HabitCategory, HabitDifficulty } from "@/types/dashboard";

export const CATEGORY_META: Record<
  HabitCategory,
  { label: string; color: string; bg: string }
> = {
  health: { label: "Health", color: "#3BB273", bg: "rgba(59,178,115,0.12)" },
  fitness: { label: "Fitness", color: "#F5A623", bg: "rgba(245,166,35,0.12)" },
  learning: { label: "Learning", color: "#5AA9FF", bg: "rgba(90,169,255,0.12)" },
  productivity: { label: "Productivity", color: "#D97757", bg: "rgba(217,119,87,0.12)" },
  mindfulness: { label: "Mindfulness", color: "#8B7FD6", bg: "rgba(139,127,214,0.12)" },
  creativity: { label: "Creativity", color: "#FF9E7D", bg: "rgba(255,158,125,0.12)" },
  custom: { label: "Custom", color: "#7A8A91", bg: "rgba(122,138,145,0.12)" },
};

export const DIFFICULTY_META: Record<
  HabitDifficulty,
  { label: string; dots: number }
> = {
  easy: { label: "Easy", dots: 1 },
  medium: { label: "Medium", dots: 2 },
  hard: { label: "Hard", dots: 3 },
};
