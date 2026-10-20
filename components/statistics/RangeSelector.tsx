"use client";

import { STATS_RANGE_LABELS } from "@/types/statistics";
import type { StatsRange } from "@/types/statistics";

const RANGES: StatsRange[] = ["7d", "30d", "90d", "year", "all"];

interface RangeSelectorProps {
  value: StatsRange;
  onChange: (range: StatsRange) => void;
}

export function RangeSelector({ value, onChange }: RangeSelectorProps) {
  return (
    <div role="tablist" aria-label="Statistics time range" className="flex flex-wrap gap-2">
      {RANGES.map((range) => (
        <button
          key={range}
          type="button"
          role="tab"
          aria-selected={value === range}
          onClick={() => onChange(range)}
          className={`focus-ring rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            value === range
              ? "bg-bloom-primary text-white"
              : "border border-black/10 bg-white/70 text-bloom-text hover:bg-white"
          }`}
        >
          {STATS_RANGE_LABELS[range]}
        </button>
      ))}
    </div>
  );
}
