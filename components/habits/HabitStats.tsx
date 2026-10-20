import { Flame, Sparkles, Target, TrendingUp } from "lucide-react";
import type { Habit } from "@/types/habit";

interface HabitStatsProps {
  habits: Habit[];
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-black/5 bg-white/70 px-4 py-3 shadow-[0_16px_36px_-24px_rgba(38,54,58,0.18)] backdrop-blur-sm">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bloom-accent/10 text-bloom-accent-dark">
        {icon}
      </span>
      <div>
        <p className="text-[11px] text-bloom-muted">{label}</p>
        <p className="font-[family-name:var(--font-heading)] text-sm font-semibold text-bloom-text">
          {value}
        </p>
      </div>
    </div>
  );
}

export function HabitStats({ habits }: HabitStatsProps) {
  const active = habits.filter((h) => h.active);
  const completedToday = active.filter((h) => h.completedToday).length;
  const avgStreak =
    active.length === 0
      ? 0
      : Math.round(active.reduce((sum, h) => sum + h.currentStreak, 0) / active.length);
  const xpToday = active
    .filter((h) => h.completedToday)
    .reduce((sum, h) => sum + h.xpReward, 0);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatPill
        icon={<Target className="h-4 w-4" strokeWidth={2} />}
        label="Active Habits"
        value={String(active.length)}
      />
      <StatPill
        icon={<TrendingUp className="h-4 w-4" strokeWidth={2} />}
        label="Completed Today"
        value={`${completedToday} / ${active.length}`}
      />
      <StatPill
        icon={<Flame className="h-4 w-4" strokeWidth={2} />}
        label="Avg. Streak"
        value={`${avgStreak} days`}
      />
      <StatPill
        icon={<Sparkles className="h-4 w-4" strokeWidth={2} />}
        label="XP Today"
        value={String(xpToday)}
      />
    </div>
  );
}
