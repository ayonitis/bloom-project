import type { StatisticsOverview } from "@/types/statistics";

interface OverviewCardsProps {
  overview: StatisticsOverview;
}

interface StatCard {
  label: string;
  value: string;
  sub?: string;
}

export function OverviewCards({ overview }: OverviewCardsProps) {
  const cards: StatCard[] = [
    {
      label: "Completion Rate",
      value: `${overview.completionRate}%`,
      sub: `${overview.totalCompletedInRange} / ${overview.totalScheduledInRange} scheduled`,
    },
    { label: "Best Current Streak", value: `${overview.bestCurrentStreak} day${overview.bestCurrentStreak === 1 ? "" : "s"}` },
    { label: "Best Longest Streak", value: `${overview.bestLongestStreak} day${overview.bestLongestStreak === 1 ? "" : "s"}` },
    { label: "Total Completions", value: overview.totalCompletionsAllTime.toLocaleString(), sub: "all time" },
    {
      label: "Level",
      value: `${overview.level}`,
      sub: `${overview.xpProgress.xpIntoLevel} / ${overview.xpProgress.xpNeededForLevel} XP`,
    },
    {
      label: "Total XP",
      value: overview.totalXPAllTime.toLocaleString(),
      sub: `${overview.xpEarnedInRange.toLocaleString()} this period`,
    },
    { label: "Achievements", value: `${overview.achievementsUnlocked} / ${overview.totalAchievements}` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-black/5 bg-white/70 p-4 shadow-[0_16px_36px_-26px_rgba(38,54,58,0.2)]"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-bloom-muted">{card.label}</p>
          <p className="mt-1.5 font-[family-name:var(--font-heading)] text-2xl font-semibold text-bloom-text">
            {card.value}
          </p>
          {card.sub && <p className="mt-0.5 text-xs text-bloom-muted">{card.sub}</p>}
        </div>
      ))}
    </div>
  );
}
