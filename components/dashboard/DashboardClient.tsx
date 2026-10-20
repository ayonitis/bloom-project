"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GreetingCard } from "@/components/dashboard/GreetingCard";
import { QuoteCard } from "@/components/dashboard/QuoteCard";
import { GardenView } from "@/components/dashboard/GardenView";
import { HabitList } from "@/components/dashboard/HabitList";
import { GardenSpiritPanel } from "@/components/dashboard/GardenSpiritPanel";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { ActionGrid } from "@/components/dashboard/ActionGrid";
import { AchievementSummaryCard } from "@/components/dashboard/AchievementSummaryCard";
import { useHabits } from "@/hooks/useHabits";
import { useProgression } from "@/hooks/useProgression";
import { useAchievementNotifications } from "@/hooks/useAchievementNotifications";
import { AchievementNotification } from "@/components/achievements/AchievementNotification";
import { ActionErrorToast } from "@/components/shared/ActionErrorToast";
import { toDashboardHabit } from "@/lib/mappers/habit";
import { getXPForNextLevel } from "@/lib/progression/xp";
import { PLAYER_STATS } from "@/lib/mockData";

// A neutral "hasn't loaded yet" placeholder — 0 XP at level 1 rather than
// the previous mock numbers, so nothing false is ever shown even for the
// one round trip before real progression arrives.
const NEUTRAL_LEVEL = getXPForNextLevel(0);

export function DashboardClient() {
  // Same real, DB-backed source of truth as the Habits page — the
  // Dashboard just renders it through its own (unchanged) simpler card
  // components. Coins/garden-health/weekly-progress stay mock for now;
  // those belong to later phases (shop, plant growth) — see README.
  const { habits: allHabits, isLoading, toggleComplete, bloomCoins } = useHabits();
  const { progression, refresh: refreshProgression } = useProgression();
  const { current: currentAchievement, enqueue: enqueueAchievements, dismissCurrent } = useAchievementNotifications();
  const [toggleError, setToggleError] = useState<string | null>(null);

  const activeHabits = useMemo(() => allHabits.filter((h) => h.active), [allHabits]);
  const todaysHabits = useMemo(() => activeHabits.map(toDashboardHabit), [activeHabits]);

  const remainingHabits = useMemo(
    () => activeHabits.filter((h) => !h.completedToday).length,
    [activeHabits]
  );
  const completionPercent = useMemo(
    () =>
      activeHabits.length === 0
        ? 0
        : Math.round(
            ((activeHabits.length - remainingHabits) / activeHabits.length) * 100
          ),
    [activeHabits, remainingHabits]
  );

  async function handleToggle(id: string) {
    const result = await toggleComplete(id);
    if (!result.ok) {
      setToggleError(result.error ?? "Couldn't save that. Please try again.");
      return;
    }
    if (result.newlyUnlockedAchievements) enqueueAchievements(result.newlyUnlockedAchievements);
    // Completing/undoing changes XP and possibly level — refresh the real
    // progression numbers rather than letting them go stale until reload.
    refreshProgression();
  }

  const stats = {
    name: PLAYER_STATS.name,
    coins: bloomCoins ?? 0,
    gardenHealth: PLAYER_STATS.gardenHealth,
    weeklyProgress: PLAYER_STATS.weeklyProgress,
    level: progression?.level ?? NEUTRAL_LEVEL.level,
    xp: progression?.xpIntoLevel ?? NEUTRAL_LEVEL.xpIntoLevel,
    xpToNextLevel: progression?.xpNeededForLevel ?? NEUTRAL_LEVEL.xpNeededForLevel,
    currentStreak: progression?.currentStreak ?? 0,
    longestStreak: progression?.bestStreak ?? 0,
  };

  return (
    <>
      <AchievementNotification achievement={currentAchievement} onDismiss={dismissCurrent} />
      <ActionErrorToast message={toggleError} onDismiss={() => setToggleError(null)} />
      <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <GreetingCard name={PLAYER_STATS.name} />
          <QuoteCard />
        </div>

        <GardenView />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {!isLoading && activeHabits.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-[2rem] border border-black/5 bg-white/70 px-6 py-10 text-center shadow-[0_20px_50px_-30px_rgba(38,54,58,0.22)]">
                <p className="font-[family-name:var(--font-heading)] text-sm font-semibold text-bloom-text">
                  No habits yet
                </p>
                <p className="text-sm text-bloom-muted">
                  Plant your first one and it&apos;ll show up here every day.
                </p>
                <Link
                  href="/habits"
                  className="focus-ring mt-2 rounded-full bg-bloom-primary px-4 py-2 text-sm font-medium text-white transition-shadow hover:shadow-[0_8px_20px_-8px_rgba(245,166,35,0.6)]"
                >
                  Go to Habits
                </Link>
              </div>
            ) : (
              <HabitList habits={todaysHabits} onToggle={handleToggle} />
            )}
          </div>
          <GardenSpiritPanel
            remainingHabits={remainingHabits}
            totalHabits={activeHabits.length}
            currentStreak={stats.currentStreak}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <QuickStats stats={stats} completionPercent={completionPercent} />
          </div>
          <AchievementSummaryCard />
        </div>

        <ActionGrid />
      </div>
      </DashboardLayout>
    </>
  );
}
