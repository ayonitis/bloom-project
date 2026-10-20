import type { HabitPerformance } from "@/types/statistics";

interface HabitPerformanceListProps {
  habits: HabitPerformance[];
}

export function HabitPerformanceList({ habits }: HabitPerformanceListProps) {
  if (habits.length === 0) {
    return <p className="text-sm text-bloom-muted">No active habits yet.</p>;
  }

  return (
    <ul className="flex list-none flex-col gap-2.5 p-0">
      {habits.map((habit) => (
        <li
          key={habit.habitId}
          className="flex flex-col gap-2 rounded-2xl border border-black/5 bg-white/70 p-3.5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-bloom-text">{habit.title}</p>
            <p className="text-xs text-bloom-muted">
              {habit.categoryLabel} · 🔥 {habit.currentStreak}-day streak · {habit.totalCompletions} total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-black/5">
              <div className="h-full rounded-full bg-bloom-accent" style={{ width: `${habit.completionRate}%` }} />
            </div>
            <span className="w-10 text-right text-sm font-semibold text-bloom-text">{habit.completionRate}%</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
