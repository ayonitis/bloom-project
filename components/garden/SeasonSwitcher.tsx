"use client";

import { Flower2, Leaf, Snowflake, Sun } from "lucide-react";
import { SEASON_LABELS } from "@/lib/gardenEngine";
import type { Season } from "@/types/garden";

const SEASON_ICONS: Record<Season, typeof Sun> = {
  spring: Flower2,
  summer: Sun,
  autumn: Leaf,
  winter: Snowflake,
};

interface SeasonSwitcherProps {
  season: Season;
  onCycle: () => void;
}

export function SeasonSwitcher({ season, onCycle }: SeasonSwitcherProps) {
  const Icon = SEASON_ICONS[season];

  return (
    <button
      type="button"
      onClick={onCycle}
      aria-label={`Season: ${SEASON_LABELS[season]}. Press to change.`}
      className="focus-ring flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-sm font-medium text-bloom-text shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white"
    >
      <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
      {SEASON_LABELS[season]}
    </button>
  );
}
