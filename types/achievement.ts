export type AchievementCategory = "growing" | "streaks" | "progression" | "habits" | "garden";

export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export type AchievementRequirementType =
  | "total_completions"
  | "streak_days"
  | "plants_fully_grown"
  | "plants_owned"
  | "total_xp"
  | "level"
  | "perfect_day";

export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  growing: "Growing",
  streaks: "Streaks",
  progression: "Progression",
  habits: "Habits",
  garden: "Garden",
};

export const ACHIEVEMENT_CATEGORY_EMOJI: Record<AchievementCategory, string> = {
  growing: "🌱",
  streaks: "🔥",
  progression: "⭐",
  habits: "✓",
  garden: "🌳",
};

/** What the client actually receives — a locked, secret achievement never
 *  has its real name/description/requirement sent over the wire at all
 *  (see achievementService.getUserAchievementsView), so there's nothing to
 *  inspect in devtools to spoil it. */
export interface AchievementView {
  id: string;
  key: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rarity: AchievementRarity;
  rewardXP: number;
  rewardCoins: number;
  isSecret: boolean;
  isUnlocked: boolean;
  unlockedAt: string | null;
  /** Omitted entirely for a still-locked secret achievement. */
  progress?: {
    currentValue: number;
    targetValue: number;
    percent: number;
  };
}

export interface AchievementUnlockResult {
  id: string;
  key: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rarity: AchievementRarity;
  rewardXP: number;
  rewardCoins: number;
  unlockedAt: string;
}

export interface AchievementsPageData {
  achievements: AchievementView[];
  unlockedCount: number;
  totalCount: number;
}

export interface AchievementSummary {
  unlockedCount: number;
  totalCount: number;
  recent: AchievementView[];
}
