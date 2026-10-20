"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/requireUserId";
import { toActionResult, type ActionResult } from "@/lib/errors";
import { createHabitSchema, updateHabitSchema } from "@/lib/validation/habit";
import { habitService } from "@/services/habitService";
import { completionService, type HabitCompletionResult, type HabitStats } from "@/services/completionService";
import { progressionService, type DashboardProgression } from "@/services/progressionService";
import { xpService } from "@/services/xpService";
import { achievementService } from "@/services/achievementService";
import { coinService } from "@/services/coinService";
import { COIN_REWARDS } from "@/lib/progression/coins";
import { toFrontendHabit } from "@/lib/mappers/habit";
import type { Habit } from "@/types/habit";
import type { AchievementUnlockResult } from "@/types/achievement";

function revalidateHabitPaths() {
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  revalidatePath("/my-garden");
  revalidatePath("/achievements");
}

export async function listMyHabitsAction(): Promise<ActionResult<Habit[]>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const rows = await habitService.listForUserWithPlantSpecies(userId, { includeArchived: true });
    const [statsByHabit, xpByHabit] = await Promise.all([
      completionService.getStatsForHabits(userId, rows),
      xpService.getTotalXPByHabit(userId, rows.map((row) => row.id)),
    ]);
    return rows.map((row) => toFrontendHabit(row, statsByHabit.get(row.id), xpByHabit.get(row.id) ?? 0));
  });
}

export async function createHabitAction(input: unknown): Promise<ActionResult<Habit>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const parsed = createHabitSchema.parse(input);
    const row = await habitService.createWithPlant(userId, parsed);
    revalidateHabitPaths();
    // A brand-new habit has no completions yet, so its plant starts at 0 XP.
    return toFrontendHabit(row);
  });
}

export async function updateHabitAction(habitId: string, input: unknown): Promise<ActionResult<Habit>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const parsed = updateHabitSchema.parse(input);
    const row = await habitService.update(userId, habitId, parsed);
    const [stats, totalXP] = await Promise.all([
      completionService.getStats(userId, habitId),
      xpService.getTotalXPForHabit(userId, habitId),
    ]);
    revalidateHabitPaths();
    return toFrontendHabit(row, stats, totalXP);
  });
}

export async function archiveHabitAction(habitId: string): Promise<ActionResult<null>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    await habitService.setArchived(userId, habitId, true);
    revalidateHabitPaths();
    return null;
  });
}

export async function unarchiveHabitAction(habitId: string): Promise<ActionResult<null>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    await habitService.setArchived(userId, habitId, false);
    revalidateHabitPaths();
    return null;
  });
}

export async function deleteHabitAction(habitId: string): Promise<ActionResult<null>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    await habitService.remove(userId, habitId);
    revalidateHabitPaths();
    return null;
  });
}

export async function completeHabitAction(
  habitId: string
): Promise<
  ActionResult<
    HabitCompletionResult & {
      totalXP: number;
      newlyUnlockedAchievements: AchievementUnlockResult[];
      coinsEarned: number;
      bloomCoins: number;
    }
  >
> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    // The core completion: insert the completion row, award XP, recompute
    // streak. This is the one part of this action that MUST succeed or
    // fail as a whole — completionService.completeHabit is already its
    // own transaction (see that service).
    const result = await completionService.completeHabit(userId, habitId);

    // Everything below this line is enrichment on top of an already
    // successful, already-committed completion: none of it may cause this
    // action to report failure to the client. If it did, useHabits.
    // toggleComplete would roll back the checkbox and "Completed Today"
    // count for a completion that actually succeeded and is sitting in the
    // database — that mismatch (DB says done, UI says it failed and
    // reverts) is exactly the bug where a checkmark flashes on and then
    // disappears a moment later.
    const totalXP = await xpService.getTotalXPForHabit(userId, habitId);

    let newlyUnlockedAchievements: AchievementUnlockResult[] = [];
    try {
      // Achievements are evaluated after every completion (never after an
      // undo — see achievementService's own note on why) so a
      // newly-unlocked achievement can be shown immediately, in the same
      // round trip when it succeeds. This is the one step of this action
      // that's genuinely optional/best-effort rather than core to "the
      // habit was completed" — isolated in its own try/catch so a failure
      // here (e.g. the achievements tables not existing yet in a given
      // environment because a migration/seed hasn't been run) can never
      // take the already-successful completion down with it.
      newlyUnlockedAchievements = await achievementService.evaluateAndUnlock(userId);
    } catch (error) {
      console.error("completeHabitAction: achievement evaluation failed (completion still succeeded):", error);
    }

    // Bloom Coin bonuses (daily-first-completion / perfect-day) — same
    // isolation reasoning as achievements above: this is a reward layer on
    // top of an already-successful completion, never a reason to fail it.
    let coinsEarned = 0;
    try {
      const bonuses = await coinService.awardCompletionBonuses(userId);
      if (bonuses.dailyFirstCompletion) coinsEarned += COIN_REWARDS.dailyFirstCompletion;
      if (bonuses.perfectDay) coinsEarned += COIN_REWARDS.perfectDayBonus;
    } catch (error) {
      console.error("completeHabitAction: coin bonus evaluation failed (completion still succeeded):", error);
    }
    const bloomCoins = await coinService.getBalance(userId).catch(() => 0);

    revalidateHabitPaths();
    return { ...result, totalXP, newlyUnlockedAchievements, coinsEarned, bloomCoins };
  });
}

export async function undoCompletionAction(
  habitId: string
): Promise<
  ActionResult<
    HabitStats & {
      totalXP: number;
      newlyUnlockedAchievements: AchievementUnlockResult[];
      coinsEarned: number;
      bloomCoins: number;
    }
  >
> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const stats = await completionService.undoCompletion(userId, habitId);
    // The deleted completion's XP transactions cascade-deleted with it, so
    // this read already reflects the reversal — plant growth shrinks by
    // exactly what that one completion contributed, never below 0.
    const totalXP = await xpService.getTotalXPForHabit(userId, habitId);
    // Bloom Coin bonuses are date-scoped, not tied to a specific
    // completion row (see coinService.awardCompletionBonuses) — undoing a
    // completion never reverses them, intentionally: the balance is just
    // read back as-is here.
    const bloomCoins = await coinService.getBalance(userId).catch(() => 0);
    revalidateHabitPaths();
    // Undoing never unlocks anything (every requirement is monotonic — see
    // achievementService) and never earns coins — both fields stay on the
    // response shape so callers get one consistent type instead of a
    // union to narrow.
    return { ...stats, totalXP, newlyUnlockedAchievements: [], coinsEarned: 0, bloomCoins };
  });
}

export async function getDashboardProgressionAction(): Promise<ActionResult<DashboardProgression>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    return progressionService.getDashboardProgression(userId);
  });
}
