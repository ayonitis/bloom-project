import {
  HeartPulse,
  Dumbbell,
  BookOpen,
  Target,
  Wind,
  Palette,
  Sparkles,
} from "lucide-react";
import type { GoalOption } from "@/types/onboarding";

export const GOAL_OPTIONS: GoalOption[] = [
  {
    id: "health",
    label: "Health",
    description: "Sleep, nutrition, and feeling good day to day",
    icon: HeartPulse,
  },
  {
    id: "fitness",
    label: "Fitness",
    description: "Movement, strength, and showing up for your body",
    icon: Dumbbell,
  },
  {
    id: "learning",
    label: "Learning",
    description: "New skills, reading, and steady curiosity",
    icon: BookOpen,
  },
  {
    id: "productivity",
    label: "Productivity",
    description: "Focus, follow-through, and less scattered days",
    icon: Target,
  },
  {
    id: "mindfulness",
    label: "Mindfulness",
    description: "Calm, presence, and a quieter mind",
    icon: Wind,
  },
  {
    id: "creativity",
    label: "Creativity",
    description: "Making things and keeping that spark alive",
    icon: Palette,
  },
  {
    id: "custom",
    label: "Custom Goal",
    description: "Something else you're growing toward",
    icon: Sparkles,
  },
];
