"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RangeSelector } from "@/components/statistics/RangeSelector";
import { OverviewCards } from "@/components/statistics/OverviewCards";
import { CompletionTrendChart } from "@/components/statistics/CompletionTrendChart";
import { ActivityHeatmap } from "@/components/statistics/ActivityHeatmap";
import { HabitPerformanceList } from "@/components/statistics/HabitPerformanceList";
import { InsightsCard } from "@/components/statistics/InsightsCard";
import { GardenAndAchievementStats } from "@/components/statistics/GardenAndAchievementStats";
import { useStatistics } from "@/hooks/useStatistics";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-[family-name:var(--font-heading)] text-lg font-semibold text-bloom-text">{title}</h2>
      {children}
    </section>
  );
}

function StatisticsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/50" />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-2xl bg-white/50" />
      <div className="h-40 animate-pulse rounded-2xl bg-white/50" />
    </div>
  );
}

export function StatisticsPageClient() {
  const { range, setRange, data, isLoading, loadError, refresh } = useStatistics();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-bloom-text sm:text-3xl">
              Statistics
            </h1>
            <p className="mt-1 text-sm text-bloom-muted">A closer look at how your habits and garden are growing.</p>
          </div>
        </motion.div>

        <RangeSelector value={range} onChange={setRange} />

        {isLoading ? (
          <StatisticsSkeleton />
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
        ) : !data || !data.overview.hasAnyData ? (
          <div className="flex flex-col items-center gap-1.5 rounded-[2rem] border border-black/5 bg-white/60 px-6 py-16 text-center">
            <p className="font-[family-name:var(--font-heading)] text-lg font-semibold text-bloom-text">
              Your garden is just getting started 🌱
            </p>
            <p className="max-w-sm text-sm text-bloom-muted">
              Complete a few more habits and your first insights will appear here.
            </p>
          </div>
        ) : (
          <>
            <Section title="Overview">
              <OverviewCards overview={data.overview} />
            </Section>

            <Section title="Habit Completion Trend">
              <CompletionTrendChart dailyActivity={data.dailyActivity} />
            </Section>

            <Section title="Daily Activity">
              <ActivityHeatmap dailyActivity={data.dailyActivity} />
            </Section>

            <Section title="Habit Performance">
              <HabitPerformanceList habits={data.habitPerformance} />
            </Section>

            <Section title="Insights">
              <InsightsCard
                strongestHabit={data.strongestHabit}
                weakestHabit={data.weakestHabit}
                comparison={data.comparison}
                insights={data.insights}
              />
            </Section>

            <Section title="Garden & Achievements">
              <GardenAndAchievementStats garden={data.garden} achievements={data.achievements} />
            </Section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
