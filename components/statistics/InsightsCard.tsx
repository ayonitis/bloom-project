import { TrendingDown, TrendingUp } from "lucide-react";
import type { HabitInsight, PeriodComparison } from "@/types/statistics";

interface InsightsCardProps {
  strongestHabit: HabitInsight | null;
  weakestHabit: HabitInsight | null;
  comparison: PeriodComparison;
  insights: string[];
}

export function InsightsCard({ strongestHabit, weakestHabit, comparison, insights }: InsightsCardProps) {
  return (
    <div className="flex flex-col gap-4">
      {(strongestHabit || weakestHabit) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {strongestHabit && (
            <div className="rounded-2xl border border-black/5 bg-bloom-accent/10 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-bloom-accent-dark">🌱 Strongest Habit</p>
              <p className="mt-1 text-sm text-bloom-text">
                &ldquo;{strongestHabit.habitTitle}&rdquo; — {strongestHabit.completionRate}% consistency
              </p>
            </div>
          )}
          {weakestHabit && (
            <div className="rounded-2xl border border-black/5 bg-black/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-bloom-muted">🌧 Habit to Improve</p>
              <p className="mt-1 text-sm text-bloom-text">
                &ldquo;{weakestHabit.habitTitle}&rdquo; could use a little more attention — {weakestHabit.completionRate}%
                this period.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-bloom-muted">Compared to previous period</p>
        {comparison.available ? (
          <div className="mt-1.5 flex items-center gap-2">
            {comparison.deltaPoints >= 0 ? (
              <TrendingUp className="h-4 w-4 text-bloom-primary" strokeWidth={2} aria-hidden />
            ) : (
              <TrendingDown className="h-4 w-4 text-bloom-muted" strokeWidth={2} aria-hidden />
            )}
            <p className="text-sm text-bloom-text">
              {comparison.currentRate}% vs {comparison.previousRate}% previously (
              {comparison.deltaPoints >= 0 ? "+" : ""}
              {comparison.deltaPoints} points)
            </p>
          </div>
        ) : (
          <p className="mt-1.5 text-sm text-bloom-muted">Not enough data for comparison yet.</p>
        )}
      </div>

      {insights.length > 0 && (
        <ul className="flex list-none flex-col gap-2 p-0">
          {insights.map((insight) => (
            <li key={insight} className="flex gap-2 text-sm text-bloom-text/85">
              <span aria-hidden>✦</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
