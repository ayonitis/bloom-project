import type { Habit, PlantSpeciesId } from "@/types/habit";

/** What a single grid tile is made of. "building" is reserved for a future
 *  expansion (structures) — it renders as empty ground today so the layout
 *  and inventory model don't need to change when it's implemented. */
export type GardenTileKind =
  | "empty"
  | "grass"
  | "plant"
  | "decoration"
  | "stone"
  | "path"
  | "water"
  | "building";

export type GrowthStage =
  | "seed"
  | "sprout"
  | "youngPlant"
  | "growingPlant"
  | "blooming"
  | "mature"
  | "legendary";

export const GROWTH_STAGE_SEQUENCE: GrowthStage[] = [
  "seed",
  "sprout",
  "youngPlant",
  "growingPlant",
  "blooming",
  "mature",
  "legendary",
];

export const GROWTH_STAGE_LABELS: Record<GrowthStage, string> = {
  seed: "Seed",
  sprout: "Sprout",
  youngPlant: "Young Plant",
  growingPlant: "Growing Plant",
  blooming: "Blooming",
  mature: "Mature",
  legendary: "Legendary",
};

export type PlantRarity = "common" | "uncommon" | "rare" | "legendary";

/** A live plant instance growing in the garden — one per habit, forever. */
export interface GardenPlant {
  id: string;
  habitId: string;
  name: string;
  species: PlantSpeciesId;
  growthStage: GrowthStage;
  growthPercent: number;
  health: number;
  rarity: PlantRarity;
  currentAnimation: "idle" | "growing" | "blooming" | "wilting";
  assignedHabit: Habit;
  createdDate: string;
  lastGrowth: string;
  /** Index into the garden grid this plant currently occupies. */
  tileIndex: number;
}

export type Season = "spring" | "summer" | "autumn" | "winter";
export type Weather = "sunny" | "cloudy" | "rain" | "night";

export type DecorationCategory =
  | "seed"
  | "decoration"
  | "path"
  | "bench"
  | "tree"
  | "fountain"
  | "lantern"
  | "rock"
  | "flowerPot";

export interface InventoryItem {
  id: string;
  name: string;
  category: DecorationCategory;
  icon: string;
  /** Total ever owned — unaffected by placing/moving/removing. */
  owned: number;
  /** Currently placed somewhere in the Garden. */
  placed: number;
  /** owned - placed — what actually gates placing another one. */
  available: number;
  /** Which tile kind placing this item results in. */
  placesAs: Extract<GardenTileKind, "decoration" | "path" | "stone">;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

/** A decoration the player has placed on a tile, referencing their inventory. */
export interface PlacedDecoration {
  tileIndex: number;
  itemId: string;
  rotation: 0 | 90 | 180 | 270;
}

export interface GardenTileState {
  index: number;
  x: number;
  y: number;
  kind: GardenTileKind;
  /** Set when kind === "plant". */
  plantId?: string;
}

export interface GardenSpiritAction {
  type: "walk" | "stop" | "water" | "wave" | "sit" | "look" | "celebrate";
  tileIndex: number;
}

/**
 * A single source of truth for what the garden is currently doing.
 * Exactly one mode is ever active — there is no combination of booleans
 * that can represent "inspecting AND moving" at once, which is what
 * previously let the details panel and Move Mode fight over the screen.
 * Decorations mirror the plant modes exactly (inspecting/moving), just
 * keyed by tile position instead of a plant id, since a decoration has no
 * independent identity outside where it's placed.
 */
export type GardenInteractionState =
  | { mode: "idle" }
  | { mode: "inspecting"; plantId: string; anchor: HTMLElement }
  | { mode: "moving"; plantId: string }
  | { mode: "placing"; itemId: string }
  | { mode: "inspectingDecoration"; tileIndex: number; anchor: HTMLElement }
  | { mode: "movingDecoration"; tileIndex: number };
