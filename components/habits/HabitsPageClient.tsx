"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { HabitStats } from "@/components/habits/HabitStats";
import { SearchBar } from "@/components/habits/SearchBar";
import { FilterBar } from "@/components/habits/FilterBar";
import { HabitList } from "@/components/habits/HabitList";
import { HabitListSkeleton } from "@/components/habits/HabitListSkeleton";
import { HabitModal } from "@/components/habits/HabitModal";
import { EmptyState } from "@/components/habits/EmptyState";
import { useHabits } from "@/hooks/useHabits";
import { useAchievementNotifications } from "@/hooks/useAchievementNotifications";
import { AchievementNotification } from "@/components/achievements/AchievementNotification";
import { ActionErrorToast } from "@/components/shared/ActionErrorToast";
import { DEFAULT_FILTERS } from "@/types/habit";
import type { Habit, HabitDraft, HabitFilters, HabitStatusFilter } from "@/types/habit";

function matchesFilters(habit: Habit, filters: HabitFilters): boolean {
  if (filters.status === "all" && !habit.active) return false;
  if (filters.status === "completed" && !(habit.active && habit.completedToday)) return false;
  if (filters.status === "pending" && !(habit.active && !habit.completedToday)) return false;
  if (filters.status === "archived" && habit.active) return false;

  if (filters.category !== "all" && habit.category !== filters.category) return false;
  if (filters.difficulty !== "all" && habit.difficulty !== filters.difficulty) return false;
  if (filters.frequency !== "all" && habit.frequency.type !== filters.frequency) return false;

  const query = filters.search.trim().toLowerCase();
  if (query) {
    const haystack = `${habit.title} ${habit.description}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }

  return true;
}

export function HabitsPageClient() {
  const {
    habits,
    isLoading,
    loadError,
    pendingIds,
    refresh,
    addHabit,
    editHabit,
    deleteHabit,
    archiveHabit,
    unarchiveHabit,
    toggleComplete,
    reorderHabits,
  } = useHabits();
  const { current: currentAchievement, enqueue: enqueueAchievements, dismissCurrent } = useAchievementNotifications();

  const [filters, setFilters] = useState<HabitFilters>(DEFAULT_FILTERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  async function handleToggleComplete(id: string) {
    const result = await toggleComplete(id);
    if (!result.ok) {
      // Surface the real reason instead of letting the checkbox silently
      // revert with no explanation — see useHabits.toggleComplete, which
      // already rolled the optimistic flip back by the time we get here.
      setToggleError(result.error ?? "Couldn't save that. Please try again.");
      return;
    }
    if (result.newlyUnlockedAchievements) enqueueAchievements(result.newlyUnlockedAchievements);
  }

  function updateFilters(patch: Partial<HabitFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  function openCreateModal() {
    setEditingHabit(null);
    setIsModalOpen(true);
  }

  function openEditModal(habit: Habit) {
    setEditingHabit(habit);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  async function handleSubmit(draft: HabitDraft) {
    return editingHabit ? editHabit(editingHabit.id, draft) : addHabit(draft);
  }

  const counts: Record<HabitStatusFilter, number> = useMemo(
    () => ({
      all: habits.filter((h) => h.active).length,
      completed: habits.filter((h) => h.active && h.completedToday).length,
      pending: habits.filter((h) => h.active && !h.completedToday).length,
      archived: habits.filter((h) => !h.active).length,
    }),
    [habits]
  );

  const filteredHabits = useMemo(
    () => habits.filter((habit) => matchesFilters(habit, filters)),
    [habits, filters]
  );

  const isUnfiltered =
    filters.status === "all" &&
    filters.category === "all" &&
    filters.difficulty === "all" &&
    filters.frequency === "all" &&
    filters.search.trim() === "";

  return (
    <>
      <AchievementNotification achievement={currentAchievement} onDismiss={dismissCurrent} />
      <ActionErrorToast message={toggleError} onDismiss={() => setToggleError(null)} />
      <DashboardLayout>
      <div className="flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-bloom-text sm:text-3xl">
              Your Habits
            </h1>
            <p className="mt-1 text-sm text-bloom-muted">
              Every habit here is tied to a plant that grows as you keep it up.
            </p>
          </div>
          {!isLoading && habits.length > 0 && (
            <motion.button
              type="button"
              onClick={openCreateModal}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="focus-ring flex items-center gap-2 rounded-full bg-bloom-primary px-5 py-2.5 font-[family-name:var(--font-heading)] text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(245,166,35,0.55)] transition-shadow duration-300 hover:shadow-[0_14px_32px_-8px_rgba(245,166,35,0.7)]"
            >
              <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
              New Habit
            </motion.button>
          )}
        </motion.div>

        {isLoading ? (
          <HabitListSkeleton />
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-black/5 bg-white/70 px-6 py-14 text-center shadow-[0_20px_50px_-30px_rgba(38,54,58,0.22)]">
            <p className="font-[family-name:var(--font-heading)] text-base font-semibold text-bloom-text">
              Couldn&apos;t load your habits
            </p>
            <p className="max-w-xs text-sm text-bloom-muted">{loadError}</p>
            <button
              type="button"
              onClick={refresh}
              className="focus-ring mt-1 flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-bloom-text transition-colors hover:bg-black/[0.03]"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : (
          <>
            {habits.length > 0 && <HabitStats habits={habits} />}

            {habits.length === 0 ? (
              <EmptyState onCreateHabit={openCreateModal} />
            ) : (
              <>
                <div className="flex flex-col gap-4 rounded-[2rem] border border-black/5 bg-white/60 p-4 backdrop-blur-sm sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <SearchBar value={filters.search} onChange={(search) => updateFilters({ search })} />
                  </div>
                  <FilterBar filters={filters} onChange={updateFilters} counts={counts} />
                </div>

                {filteredHabits.length === 0 ? (
                  <EmptyState onCreateHabit={openCreateModal} isFiltered />
                ) : (
                  <HabitList
                    habits={filteredHabits}
                    canReorder={isUnfiltered}
                    onReorder={reorderHabits}
                    pendingIds={pendingIds}
                    onToggleComplete={handleToggleComplete}
                    onEdit={openEditModal}
                    onArchive={archiveHabit}
                    onUnarchive={unarchiveHabit}
                    onDelete={deleteHabit}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>

      <HabitModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        editingHabit={editingHabit}
      />
      </DashboardLayout>
    </>
  );
}
