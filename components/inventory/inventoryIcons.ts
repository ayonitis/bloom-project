import {
  Armchair,
  Droplets,
  Flower,
  Flower2,
  HelpCircle,
  Lamp,
  Mountain,
  Route,
  Sparkles,
  Sprout,
  Trees,
  type LucideIcon,
} from "lucide-react";

export const INVENTORY_ICON_MAP: Record<string, LucideIcon> = {
  lamp: Lamp,
  armchair: Armchair,
  droplets: Droplets,
  route: Route,
  mountain: Mountain,
  flower: Flower,
  "flower-2": Flower2,
  trees: Trees,
  sprout: Sprout,
  sparkles: Sparkles,
};

export function getInventoryIcon(iconName: string): LucideIcon {
  return INVENTORY_ICON_MAP[iconName] ?? HelpCircle;
}
