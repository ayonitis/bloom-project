import type { LucideIcon } from "lucide-react";

export type GoalId =
  | "health"
  | "fitness"
  | "learning"
  | "productivity"
  | "mindfulness"
  | "creativity"
  | "custom";

export interface GoalOption {
  id: GoalId;
  label: string;
  description: string;
  icon: LucideIcon;
}

export type AuthMethod = "google" | "github" | "email";

export interface OnboardingData {
  name: string;
  goal: GoalId | null;
  customGoal: string;
  habitCount: number;
  authMethod: AuthMethod | null;
  email: string;
}

export const RECOMMENDED_HABIT_COUNT = 3;
export const MIN_HABIT_COUNT = 1;
export const MAX_HABIT_COUNT = 6;

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  name: "",
  goal: null,
  customGoal: "",
  habitCount: RECOMMENDED_HABIT_COUNT,
  authMethod: null,
  email: "",
};
