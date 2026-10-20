"use client";

import { getPercentToNextStage } from "@/lib/gardenEngine";
import { GROWTH_STAGE_LABELS } from "@/types/garden";
import type { GardenPlant } from "@/types/garden";

interface PlantTooltipProps {
  plant: GardenPlant;
}

export function PlantTooltip({ plant }: PlantTooltipProps) {
  const { nextStage, percentRemaining } = getPercentToNextStage(plant.growthPercent);
  const xpEarned = plant.assignedHabit.totalCompletions * plant.assignedHabit.xpReward;

  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-44 -translate-x-1/2 rounded-xl border border-black/5 bg-white/95 p-2.5 text-left shadow-[0_20px_45px_-20px_rgba(38,54,58,0.35)] backdrop-blur-sm"
    >
      <p className="truncate text-xs font-semibold text-bloom-text">{plant.name}</p>
      <p className="truncate text-[11px] text-bloom-muted">{plant.assignedHabit.title}</p>

      <div className="mt-1.5 flex items-center justify-between text-[11px] text-bloom-muted">
        <span>{GROWTH_STAGE_LABELS[plant.growthStage]}</span>
        <span className="font-medium text-bloom-accent-dark">{plant.growthPercent}%</span>
      </div>

      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
        <div
          className="h-full rounded-full bg-bloom-accent"
          style={{ width: `${plant.growthPercent}%` }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[10px] text-bloom-muted">
        <span>🔥 {plant.assignedHabit.currentStreak}-day streak</span>
        <span>{xpEarned} XP</span>
      </div>

      {nextStage && (
        <p className="mt-1 text-[10px] text-bloom-muted">
          {percentRemaining}% to {GROWTH_STAGE_LABELS[nextStage]}
        </p>
      )}
    </div>
  );
}
