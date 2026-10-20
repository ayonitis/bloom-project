"use client";

import { useState } from "react";
import type { DailyActivity } from "@/types/statistics";

interface ActivityHeatmapProps {
  dailyActivity: DailyActivity[];
}

function intensityClass(day: DailyActivity): string {
  if (day.scheduled === 0) return "bg-black/5";
  const rate = day.completed / day.scheduled;
  if (rate <= 0) return "bg-black/5";
  if (rate < 0.5) return "bg-bloom-accent/25";
  if (rate < 1) return "bg-bloom-accent/55";
  return "bg-bloom-accent";
}

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function ActivityHeatmap({ dailyActivity }: ActivityHeatmapProps) {
  const [selected, setSelected] = useState<DailyActivity | null>(null);

  // Show at most the most recent ~18 weeks so the grid stays a
  // reasonable, glanceable size regardless of how long the selected
  // range is — the trend chart above already covers the full range's
  // totals in text form.
  const visibleDays = dailyActivity.slice(-126);

  // Pad the front so the grid starts on a Sunday, matching how weeks read
  // left-to-right, top-to-bottom.
  const firstDay = visibleDays[0] ? new Date(`${visibleDays[0].date}T00:00:00`).getDay() : 0;
  const padding: null[] = new Array(firstDay).fill(null);
  const padded: Array<DailyActivity | null> = [...padding, ...visibleDays];

  return (
    <div>
      <div
        className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-1"
        role="img"
        aria-label="Daily habit activity heatmap"
      >
        {padded.map((day, index) =>
          day ? (
            <button
              key={day.date}
              type="button"
              onClick={() => setSelected(day)}
              onMouseEnter={() => setSelected(day)}
              title={`${formatDate(day.date)}: ${day.completed} of ${day.scheduled} habits completed, ${day.xpEarned} XP earned`}
              className={`focus-ring h-3 w-3 rounded-[3px] transition-transform hover:scale-125 ${intensityClass(day)}`}
            />
          ) : (
            <div key={`pad-${index}`} className="h-3 w-3" aria-hidden />
          )
        )}
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-bloom-muted">
        <span>Less</span>
        <span className="h-3 w-3 rounded-[3px] bg-black/5" />
        <span className="h-3 w-3 rounded-[3px] bg-bloom-accent/25" />
        <span className="h-3 w-3 rounded-[3px] bg-bloom-accent/55" />
        <span className="h-3 w-3 rounded-[3px] bg-bloom-accent" />
        <span>More</span>
      </div>

      {/* Accessible, always-visible text for whichever day is hovered/selected. */}
      <p className="mt-2 min-h-[1.25rem] text-sm text-bloom-text" aria-live="polite">
        {selected
          ? `${formatDate(selected.date)}: ${selected.completed} of ${selected.scheduled} habits completed, ${selected.xpEarned} XP earned.`
          : "Hover or tap a day to see details."}
      </p>
    </div>
  );
}
