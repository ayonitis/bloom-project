"use client";

import { useMemo } from "react";
import type { GardenPlant } from "@/types/garden";

interface GardenStatsProps {
  plants: GardenPlant[];
  decorationCount: number;
}

export function GardenStats({ plants, decorationCount }: GardenStatsProps) {
  const stats = useMemo(() => {
    const legendaryCount = plants.filter((plant) => plant.growthStage === "legendary").length;
    const averageGrowth = plants.length
      ? Math.round(plants.reduce((sum, plant) => sum + plant.growthPercent, 0) / plants.length)
      : 0;
    return { total: plants.length, legendaryCount, averageGrowth };
  }, [plants]);

  const items = [
    { label: "Plants", value: stats.total },
    { label: "Legendary", value: stats.legendaryCount },
    { label: "Avg. growth", value: `${stats.averageGrowth}%` },
    { label: "Decorations", value: decorationCount },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-1.5 rounded-full border border-black/5 bg-white/70 px-3 py-1.5 text-xs"
        >
          <span className="font-semibold text-bloom-text">{item.value}</span>
          <span className="text-bloom-muted">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
