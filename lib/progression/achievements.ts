import type { AchievementCategory, AchievementRarity, AchievementRequirementType } from "@/types/achievement";

export interface AchievementSeed {
  key: string;
  name: string;
  description: string;
  category: AchievementCategory;
  /** A lucide-react icon name — resolved in components/achievements/achievementIcons.ts. */
  icon: string;
  requirementType: AchievementRequirementType;
  requirementValue: number;
  rewardXP: number;
  /** Bloom Coins awarded alongside the XP — a separate currency (see
   *  lib/progression/coins.ts) used for the Shop, never for leveling. */
  rewardCoins: number;
  rarity: AchievementRarity;
  isSecret: boolean;
}

/**
 * ~20 achievements across all 5 categories. Every requirement is a
 * monotonically-increasing real metric (see services/achievementService.ts's
 * computeUserMetrics) compared with `>=`, so nothing here can become
 * impossible or contradictory as a user's data changes — completing more
 * habits, growing more plants, or earning more XP can only ever move a
 * user *toward* unlocking, never away from it.
 *
 * Tune rewardXP/rewardCoins/requirementValue here — nothing else hardcodes
 * these. rewardCoins is currently set to roughly half of rewardXP, a
 * simple starting ratio that's easy to rebalance later.
 */
export const ACHIEVEMENT_CATALOG: readonly AchievementSeed[] = [
  // --- Habits (total_completions, perfect_day) ---------------------------
  {
    key: "first_step",
    name: "First Step",
    description: "Every garden starts with one seed.",
    category: "habits",
    icon: "footprints",
    requirementType: "total_completions",
    requirementValue: 1,
    rewardXP: 10,
    rewardCoins: 5,
    rarity: "common",
    isSecret: false,
  },
  {
    key: "perfect_day",
    name: "Perfect Day",
    description: "Complete every habit you had scheduled for a single day.",
    category: "habits",
    icon: "sun",
    requirementType: "perfect_day",
    requirementValue: 1,
    rewardXP: 25,
    rewardCoins: 12,
    rarity: "rare",
    isSecret: false,
  },
  {
    key: "consistent",
    name: "Consistent",
    description: "Complete 50 habits.",
    category: "habits",
    icon: "check-check",
    requirementType: "total_completions",
    requirementValue: 50,
    rewardXP: 60,
    rewardCoins: 30,
    rarity: "rare",
    isSecret: false,
  },
  {
    key: "dedicated",
    name: "Dedicated",
    description: "Complete 100 habits.",
    category: "habits",
    icon: "medal",
    requirementType: "total_completions",
    requirementValue: 100,
    rewardXP: 120,
    rewardCoins: 60,
    rarity: "epic",
    isSecret: false,
  },

  // --- Streaks (streak_days) ----------------------------------------------
  {
    key: "keep_going",
    name: "Keep Going",
    description: "Maintain a 3-day streak.",
    category: "streaks",
    icon: "flame",
    requirementType: "streak_days",
    requirementValue: 3,
    rewardXP: 15,
    rewardCoins: 8,
    rarity: "common",
    isSecret: false,
  },
  {
    key: "week_one",
    name: "Week One",
    description: "Maintain a 7-day streak.",
    category: "streaks",
    icon: "flame",
    requirementType: "streak_days",
    requirementValue: 7,
    rewardXP: 30,
    rewardCoins: 15,
    rarity: "common",
    isSecret: false,
  },
  {
    key: "two_weeks_strong",
    name: "Two Weeks Strong",
    description: "Maintain a 14-day streak.",
    category: "streaks",
    icon: "flame",
    requirementType: "streak_days",
    requirementValue: 14,
    rewardXP: 50,
    rewardCoins: 25,
    rarity: "rare",
    isSecret: false,
  },
  {
    key: "month_of_momentum",
    name: "Month of Momentum",
    description: "Maintain a 30-day streak.",
    category: "streaks",
    icon: "flame",
    requirementType: "streak_days",
    requirementValue: 30,
    rewardXP: 100,
    rewardCoins: 50,
    rarity: "epic",
    isSecret: false,
  },
  {
    key: "unbreakable",
    name: "Unbreakable",
    description: "Maintain a 60-day streak. Some habits become who you are.",
    category: "streaks",
    icon: "flame",
    requirementType: "streak_days",
    requirementValue: 60,
    rewardXP: 150,
    rewardCoins: 75,
    rarity: "legendary",
    isSecret: true,
  },

  // --- Growing (plants_fully_grown) ---------------------------------------
  {
    key: "first_bloom",
    name: "First Bloom",
    description: "Grow your first plant to 100%.",
    category: "growing",
    icon: "flower",
    requirementType: "plants_fully_grown",
    requirementValue: 1,
    rewardXP: 40,
    rewardCoins: 20,
    rarity: "common",
    isSecret: false,
  },
  {
    key: "gardener",
    name: "Gardener",
    description: "Grow 3 plants to full bloom.",
    category: "growing",
    icon: "sprout",
    requirementType: "plants_fully_grown",
    requirementValue: 3,
    rewardXP: 80,
    rewardCoins: 40,
    rarity: "rare",
    isSecret: false,
  },
  {
    key: "green_thumb",
    name: "Green Thumb",
    description: "Grow 5 plants to full bloom.",
    category: "growing",
    icon: "leaf",
    requirementType: "plants_fully_grown",
    requirementValue: 5,
    rewardXP: 150,
    rewardCoins: 75,
    rarity: "epic",
    isSecret: false,
  },
  {
    key: "botanist",
    name: "Botanist",
    description: "Grow 8 plants to full bloom.",
    category: "growing",
    icon: "trees",
    requirementType: "plants_fully_grown",
    requirementValue: 8,
    rewardXP: 250,
    rewardCoins: 125,
    rarity: "legendary",
    isSecret: false,
  },

  // --- Progression (total_xp, level) --------------------------------------
  {
    key: "level_up",
    name: "Level Up",
    description: "Reach Level 5.",
    category: "progression",
    icon: "trending-up",
    requirementType: "level",
    requirementValue: 5,
    rewardXP: 40,
    rewardCoins: 20,
    rarity: "common",
    isSecret: false,
  },
  {
    key: "century",
    name: "Century",
    description: "Earn 1,000 total XP.",
    category: "progression",
    icon: "star",
    requirementType: "total_xp",
    requirementValue: 1000,
    rewardXP: 50,
    rewardCoins: 25,
    rarity: "rare",
    isSecret: false,
  },
  {
    key: "rising",
    name: "Rising",
    description: "Reach Level 10.",
    category: "progression",
    icon: "rocket",
    requirementType: "level",
    requirementValue: 10,
    rewardXP: 100,
    rewardCoins: 50,
    rarity: "epic",
    isSecret: false,
  },
  {
    key: "xp_master",
    name: "XP Master",
    description: "Earn 5,000 total XP.",
    category: "progression",
    icon: "sparkles",
    requirementType: "total_xp",
    requirementValue: 5000,
    rewardXP: 300,
    rewardCoins: 150,
    rarity: "legendary",
    isSecret: true,
  },

  // --- Garden (plants_owned) -----------------------------------------------
  {
    key: "full_garden",
    name: "Full Garden",
    description: "Plant 5 different habits in your garden.",
    category: "garden",
    icon: "flower-2",
    requirementType: "plants_owned",
    requirementValue: 5,
    rewardXP: 60,
    rewardCoins: 30,
    rarity: "rare",
    isSecret: false,
  },
  {
    key: "sprawling_garden",
    name: "Sprawling Garden",
    description: "Plant 8 different habits in your garden.",
    category: "garden",
    icon: "trees",
    requirementType: "plants_owned",
    requirementValue: 8,
    rewardXP: 120,
    rewardCoins: 60,
    rarity: "epic",
    isSecret: false,
  },
] as const;
