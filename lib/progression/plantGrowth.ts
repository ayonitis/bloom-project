import type { HabitDifficulty } from "@/types/habit";
import type { GrowthStage } from "@/types/garden";
import { GROWTH_STAGE_LABELS, GROWTH_STAGE_SEQUENCE } from "@/types/garden";

/**
 * The single source of truth for how a habit's real activity becomes plant
 * growth. Tune balance here — nothing else should hardcode a growth number
 * or a stage threshold. Mirrors the style of lib/progression/xp.ts's
 * XP_CONFIG/LEVEL_CONFIG.
 *
 * Growth is driven by a habit's own accumulated XP (services/xpService's
 * getTotalXPForHabit), not raw completion count — XP already encodes the
 * streak bonus (lib/progression/xp.ts), so growth automatically gets a
 * "streak synergy" without a second, duplicate streak calculation here.
 *
 * `xpTarget` is chosen so every difficulty takes roughly the same *number
 * of days* of consistent completion to fully grow (~28-30 days), even
 * though harder habits earn more XP per completion — a plant should feel
 * like it rewards consistency, not a difficulty min-max choice.
 */
export const PLANT_GROWTH_CONFIG = {
  xpTarget: {
    easy: 300, // ~30 completions at the 10 XP base rate
    medium: 550, // ~27 completions at the 20 XP base rate, plus streak bonus
    hard: 900, // ~25 completions at the 35 XP base rate, plus streak bonus
  } satisfies Record<HabitDifficulty, number>,
} as const;

/** 0–100, clamped both ends. Deterministic and side-effect free — safe to
 *  call on the server (the authority) or the client (for optimistic/derived
 *  display), since both only ever do so from the same real `totalXP`. */
export function calculatePlantGrowthPercent(totalXP: number, difficulty: HabitDifficulty): number {
  const target = PLANT_GROWTH_CONFIG.xpTarget[difficulty];
  const percent = Math.round((totalXP / target) * 100);
  return Math.min(100, Math.max(0, percent));
}

/** Percent-of-the-way-to-100 required to *reach* each stage. */
const STAGE_THRESHOLDS: Record<GrowthStage, number> = {
  seed: 0,
  sprout: 8,
  youngPlant: 25,
  growingPlant: 45,
  blooming: 65,
  mature: 85,
  legendary: 100,
};

export function getPlantGrowthStage(growthPercent: number): GrowthStage {
  if (growthPercent >= 100) return "legendary";
  if (growthPercent >= STAGE_THRESHOLDS.mature) return "mature";
  if (growthPercent >= STAGE_THRESHOLDS.blooming) return "blooming";
  if (growthPercent >= STAGE_THRESHOLDS.growingPlant) return "growingPlant";
  if (growthPercent >= STAGE_THRESHOLDS.youngPlant) return "youngPlant";
  if (growthPercent >= STAGE_THRESHOLDS.sprout) return "sprout";
  return "seed";
}

export function getNextPlantGrowthStage(stage: GrowthStage): GrowthStage | null {
  const index = GROWTH_STAGE_SEQUENCE.indexOf(stage);
  if (index === -1 || index === GROWTH_STAGE_SEQUENCE.length - 1) return null;
  return GROWTH_STAGE_SEQUENCE[index + 1];
}

export interface NextStageInfo {
  nextStage: GrowthStage | null;
  percentRemaining: number;
}

export function getPercentToNextPlantStage(growthPercent: number): NextStageInfo {
  const stage = getPlantGrowthStage(growthPercent);
  const nextStage = getNextPlantGrowthStage(stage);
  if (!nextStage) return { nextStage: null, percentRemaining: 0 };
  return { nextStage, percentRemaining: Math.max(0, STAGE_THRESHOLDS[nextStage] - growthPercent) };
}

/** Rough "days until next stage" estimate, for the Plant Details panel's
 *  milestone copy — not stored anywhere, purely a display estimate from
 *  the habit's own current XP-per-completion rate. */
export function estimateDaysUntilNextStage(
  percentRemaining: number,
  difficulty: HabitDifficulty,
  typicalXpPerCompletion: number
): number {
  if (percentRemaining <= 0) return 0;
  const target = PLANT_GROWTH_CONFIG.xpTarget[difficulty];
  const percentPerCompletion = Math.max(0.01, (typicalXpPerCompletion / target) * 100);
  return Math.max(1, Math.ceil(percentRemaining / percentPerCompletion));
}

/**
 * The 7 narrative growth stages (types/garden.ts) intentionally have more
 * granularity than plant art does — this is the one place that maps stage
 * → visual tier, so PlantVisual never re-derives thresholds of its own.
 * "Do not simply scale the same icon": budding is a distinct silhouette
 * from both sprout and full, not just a bigger/smaller sprout or full.
 */
export type PlantVisualTier = "seed" | "sprout" | "budding" | "full";

const VISUAL_TIER_BY_STAGE: Record<GrowthStage, PlantVisualTier> = {
  seed: "seed",
  sprout: "sprout",
  youngPlant: "budding",
  growingPlant: "budding",
  blooming: "full",
  mature: "full",
  legendary: "full",
};

export function getPlantVisualTier(stage: GrowthStage): PlantVisualTier {
  return VISUAL_TIER_BY_STAGE[stage];
}

export { GROWTH_STAGE_LABELS };
