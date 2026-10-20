"use client";

import { useCallback, useEffect, useState } from "react";
import {
  archiveHabitAction,
  completeHabitAction,
  createHabitAction,
  deleteHabitAction,
  listMyHabitsAction,
  unarchiveHabitAction,
  undoCompletionAction,
  updateHabitAction,
} from "@/app/actions/habits";
import { getCoinBalanceAction } from "@/app/actions/shop";
import type { Habit, HabitDraft } from "@/types/habit";
import type { AchievementUnlockResult } from "@/types/achievement";

export interface MutationResult {
  ok: boolean;
  error?: string;
}

export interface ToggleCompleteResult extends MutationResult {
  newlyUnlockedAchievements?: AchievementUnlockResult[];
  coinsEarned?: number;
}

/**
 * The single source of habit data for the Habits page, Dashboard, and
 * Garden (via useGarden, which reads this hook's `habits`). Every mutator
 * calls a Server Action — nothing here talks to the database directly —
 * and returns a result the caller can react to instead of failing
 * silently (see HabitModal, which keeps itself open and shows the error
 * rather than losing what the person typed).
 */
export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [bloomCoins, setBloomCoins] = useState<number | null>(null);
  // Coins are fetched/updated alongside habits (not in a separate hook)
  // because every mutation that changes them — completing a habit — is
  // already happening right here; keeping them colocated avoids a second
  // component needing to independently refetch after the same action.

  const markPending = useCallback((id: string, pending: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    const [habitsResult, coinsResult] = await Promise.all([listMyHabitsAction(), getCoinBalanceAction()]);
    if (habitsResult.ok) {
      setHabits(habitsResult.data);
    } else {
      setLoadError(habitsResult.error);
    }
    if (coinsResult.ok) setBloomCoins(coinsResult.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addHabit = useCallback(async (draft: HabitDraft): Promise<MutationResult> => {
    const result = await createHabitAction(draft);
    if (!result.ok) return { ok: false, error: result.error };
    setHabits((prev) => [result.data, ...prev]);
    return { ok: true };
  }, []);

  const editHabit = useCallback(async (id: string, draft: HabitDraft): Promise<MutationResult> => {
    const result = await updateHabitAction(id, draft);
    if (!result.ok) return { ok: false, error: result.error };
    setHabits((prev) => prev.map((habit) => (habit.id === id ? result.data : habit)));
    return { ok: true };
  }, []);

  const deleteHabit = useCallback(
    async (id: string): Promise<MutationResult> => {
      markPending(id, true);
      const result = await deleteHabitAction(id);
      markPending(id, false);
      if (!result.ok) return { ok: false, error: result.error };
      setHabits((prev) => prev.filter((habit) => habit.id !== id));
      return { ok: true };
    },
    [markPending]
  );

  const archiveHabit = useCallback(
    async (id: string): Promise<MutationResult> => {
      markPending(id, true);
      const result = await archiveHabitAction(id);
      markPending(id, false);
      if (!result.ok) return { ok: false, error: result.error };
      setHabits((prev) => prev.map((habit) => (habit.id === id ? { ...habit, active: false } : habit)));
      return { ok: true };
    },
    [markPending]
  );

  const unarchiveHabit = useCallback(
    async (id: string): Promise<MutationResult> => {
      markPending(id, true);
      const result = await unarchiveHabitAction(id);
      markPending(id, false);
      if (!result.ok) return { ok: false, error: result.error };
      setHabits((prev) => prev.map((habit) => (habit.id === id ? { ...habit, active: true } : habit)));
      return { ok: true };
    },
    [markPending]
  );

  const toggleComplete = useCallback(
    async (id: string): Promise<ToggleCompleteResult> => {
      // React runs a functional setState's updater synchronously (even
      // though the resulting render is deferred), so `wasCompleted` below
      // is populated by the time we read it right after — this lets the
      // checkbox flip optimistically without needing `habits` in this
      // callback's own dependencies (which would otherwise recreate it,
      // and everything memoized against it, on every completion).
      let wasCompleted = false;
      let previousTotal = 0;
      setHabits((prev) =>
        prev.map((habit) => {
          if (habit.id !== id) return habit;
          wasCompleted = habit.completedToday;
          previousTotal = habit.totalCompletions;
          return {
            ...habit,
            completedToday: !habit.completedToday,
            totalCompletions: habit.totalCompletions + (habit.completedToday ? -1 : 1),
          };
        })
      );

      markPending(id, true);
      const result = wasCompleted ? await undoCompletionAction(id) : await completeHabitAction(id);
      markPending(id, false);

      if (result.ok) {
        const stats = result.data;
        setHabits((prev) =>
          prev.map((habit) =>
            habit.id === id
              ? {
                  ...habit,
                  currentStreak: stats.currentStreak,
                  longestStreak: stats.longestStreak,
                  totalCompletions: stats.totalCompletions,
                  completedToday: stats.completedToday,
                  totalXP: stats.totalXP,
                }
              : habit
          )
        );
        setBloomCoins(stats.bloomCoins);
        return { ok: true, newlyUnlockedAchievements: stats.newlyUnlockedAchievements, coinsEarned: stats.coinsEarned };
      }

      // Roll back the optimistic flip.
      setHabits((prev) =>
        prev.map((habit) =>
          habit.id === id
            ? { ...habit, completedToday: wasCompleted, totalCompletions: previousTotal }
            : habit
        )
      );
      return { ok: false, error: result.error };
    },
    [markPending]
  );

  // Visual-only: there's no persisted sort-order column in the schema yet,
  // so this reorders the in-memory list only and resets to creation order
  // on next load. Persisting order is a small, separate follow-up (a
  // `sortOrder` column + a reorder Server Action), intentionally out of
  // scope for this data-migration pass.
  const reorderHabits = useCallback((orderedIds: string[]) => {
    setHabits((prev) => {
      const byId = new Map(prev.map((habit) => [habit.id, habit]));
      const reordered = orderedIds
        .map((id) => byId.get(id))
        .filter((habit): habit is Habit => habit !== undefined);
      const remaining = prev.filter((habit) => !orderedIds.includes(habit.id));
      return [...reordered, ...remaining];
    });
  }, []);

  return {
    habits,
    isLoading,
    loadError,
    pendingIds,
    bloomCoins,
    refresh,
    addHabit,
    editHabit,
    deleteHabit,
    archiveHabit,
    unarchiveHabit,
    toggleComplete,
    reorderHabits,
  };
}
