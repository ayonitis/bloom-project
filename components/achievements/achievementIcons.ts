import {
  CheckCheck,
  Flame,
  Flower,
  Flower2,
  Footprints,
  HelpCircle,
  Leaf,
  Medal,
  Rocket,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Trees,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export const ACHIEVEMENT_ICON_MAP: Record<string, LucideIcon> = {
  footprints: Footprints,
  sun: Sun,
  "check-check": CheckCheck,
  medal: Medal,
  flame: Flame,
  flower: Flower,
  sprout: Sprout,
  leaf: Leaf,
  trees: Trees,
  "trending-up": TrendingUp,
  star: Star,
  rocket: Rocket,
  sparkles: Sparkles,
  "flower-2": Flower2,
  "help-circle": HelpCircle,
};

export function getAchievementIcon(iconName: string): LucideIcon {
  return ACHIEVEMENT_ICON_MAP[iconName] ?? HelpCircle;
}
