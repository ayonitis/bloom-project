"use server";

import { requireUserId } from "@/lib/auth/requireUserId";
import { toActionResult, type ActionResult } from "@/lib/errors";
import { achievementService } from "@/services/achievementService";
import type { AchievementsPageData, AchievementSummary } from "@/types/achievement";

export async function getAchievementsPageDataAction(): Promise<ActionResult<AchievementsPageData>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const achievements = await achievementService.getUserAchievementsView(userId);
    const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
    return { achievements, unlockedCount, totalCount: achievements.length };
  });
}

export async function getAchievementSummaryAction(): Promise<ActionResult<AchievementSummary>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    return achievementService.getSummary(userId);
  });
}
