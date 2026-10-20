"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { getAchievementSummaryAction } from "@/app/actions/achievements";
import { getAchievementIcon } from "@/components/achievements/achievementIcons";
import type { AchievementSummary } from "@/types/achievement";

export function AchievementSummaryCard() {
  const [summary, setSummary] = useState<AchievementSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAchievementSummaryAction().then((result) => {
      if (!cancelled && result.ok) setSummary(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link
      href="/achievements"
      className="focus-ring flex flex-col gap-3 rounded-2xl border border-black/5 bg-white/70 p-4 shadow-[0_16px_36px_-26px_rgba(38,54,58,0.2)] transition-shadow hover:shadow-[0_20px_44px_-24px_rgba(38,54,58,0.28)]"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-sm font-semibold text-bloom-text">
          <Trophy className="h-4 w-4 text-bloom-accent-dark" strokeWidth={2} />
          Achievements
        </span>
        {summary && (
          <span className="text-xs text-bloom-muted">
            {summary.unlockedCount} / {summary.totalCount}
          </span>
        )}
      </div>

      {summary && summary.recent.length > 0 ? (
        <ul className="flex list-none flex-col gap-2 p-0">
          {summary.recent.map((achievement) => {
            const Icon = getAchievementIcon(achievement.icon);
            return (
              <li key={achievement.id} className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bloom-accent/15 text-bloom-accent-dark">
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                <span className="truncate text-sm text-bloom-text">{achievement.name}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-bloom-muted">Complete a habit to earn your first achievement.</p>
      )}
    </Link>
  );
}
