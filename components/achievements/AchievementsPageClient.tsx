"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AchievementCard } from "@/components/achievements/AchievementCard";
import { useAchievements } from "@/hooks/useAchievements";
import { ACHIEVEMENT_CATEGORY_EMOJI, ACHIEVEMENT_CATEGORY_LABELS } from "@/types/achievement";
import type { AchievementCategory, AchievementView } from "@/types/achievement";

const CATEGORY_ORDER: AchievementCategory[] = ["habits", "streaks", "growing", "progression", "garden"];

function groupByCategory(achievements: AchievementView[]): Map<AchievementCategory, AchievementView[]> {
  const groups = new Map<AchievementCategory, AchievementView[]>();
  for (const category of CATEGORY_ORDER) groups.set(category, []);
  for (const achievement of achievements) {
    groups.get(achievement.category)?.push(achievement);
  }
  return groups;
}

function AchievementsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/50" />
      ))}
    </div>
  );
}

export function AchievementsPageClient() {
  const { data, isLoading, loadError, refresh } = useAchievements();

  const grouped = useMemo(() => groupByCategory(data?.achievements ?? []), [data]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-bloom-text sm:text-3xl">
            Achievements
          </h1>
          <p className="mt-1 text-sm text-bloom-muted">Small milestones. Big growth.</p>
        </motion.div>

        {!isLoading && data && (
          <div className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white/70 px-5 py-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-bloom-text">Your progress</span>
                <span className="text-bloom-muted">
                  {data.unlockedCount} / {data.totalCount}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/5">
                <div
                  className="h-full rounded-full bg-bloom-accent transition-all"
                  style={{
                    width: `${data.totalCount === 0 ? 0 : Math.round((data.unlockedCount / data.totalCount) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <AchievementsSkeleton />
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-black/5 bg-white/70 px-6 py-14 text-center shadow-[0_20px_50px_-30px_rgba(38,54,58,0.22)]">
            <p className="text-sm text-bloom-muted">{loadError}</p>
            <button
              type="button"
              onClick={refresh}
              className="focus-ring flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-bloom-text"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
              Try again
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {CATEGORY_ORDER.map((category) => {
              const items = grouped.get(category) ?? [];
              if (items.length === 0) return null;
              const unlockedInCategory = items.filter((a) => a.isUnlocked).length;

              return (
                <section key={category}>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-lg font-semibold text-bloom-text">
                      <span aria-hidden>{ACHIEVEMENT_CATEGORY_EMOJI[category]}</span>
                      {ACHIEVEMENT_CATEGORY_LABELS[category]}
                    </h2>
                    <span className="text-xs text-bloom-muted">
                      {unlockedInCategory} / {items.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
