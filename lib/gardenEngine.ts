import {
  calculatePlantGrowthPercent,
  estimateDaysUntilNextStage,
  getPlantGrowthStage,
  getNextPlantGrowthStage,
  getPercentToNextPlantStage,
} from "@/lib/progression/plantGrowth";
import type { Habit, PlantSpeciesId } from "@/types/habit";
import type {
  DecorationCategory,
  GardenPlant,
  GardenTileKind,
  GardenTileState,
  GrowthStage,
  PlantRarity,
  Season,
  Weather,
} from "@/types/garden";

/** 7-stage growth model, canonically defined in lib/progression/plantGrowth.ts
 *  (the same module the server's plantService uses) — re-exported here
 *  under their original names so every existing import in this codebase
 *  keeps working unchanged. */
export const getGrowthStage = getPlantGrowthStage;
export const getNextGrowthStage = getNextPlantGrowthStage;
export const getPercentToNextStage = getPercentToNextPlantStage;

export const GARDEN_GRID_COLUMNS = 10;
export const GARDEN_GRID_ROWS = 7;
export const GARDEN_TILE_COUNT = GARDEN_GRID_COLUMNS * GARDEN_GRID_ROWS;

/** Small deterministic string hash so layout/rarity are stable across
 *  reloads without needing to persist anything. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getPlantRarity(species: PlantSpeciesId, growthPercent: number): PlantRarity {
  if (growthPercent >= 100) return "legendary";
  const rareSpecies: PlantSpeciesId[] = ["bonsai", "lotus"];
  if (rareSpecies.includes(species) && growthPercent >= 65) return "rare";
  if (growthPercent >= 45) return "uncommon";
  return "common";
}

/** Deterministically lays each habit's plant onto the grid (in a loose
 *  planting-bed pattern with paths and water for atmosphere), then applies
 *  any manual moves the player has made. Pure function of its inputs so it
 *  can be recomputed any time the habit list changes. */
export function buildGardenTiles(
  habits: Habit[],
  plantPositions: Record<string, number>
): GardenTileState[] {
  const tiles: GardenTileState[] = Array.from({ length: GARDEN_TILE_COUNT }, (_, index) => {
    const x = index % GARDEN_GRID_COLUMNS;
    const y = Math.floor(index / GARDEN_GRID_COLUMNS);
    let kind: GardenTileKind = "grass";

    // A gentle winding path and a small pond, purely decorative scaffolding.
    if (y === 3 && x !== 0 && x !== GARDEN_GRID_COLUMNS - 1) kind = "path";
    if ((x === 8 && y >= 4) || (x === 9 && y >= 4)) kind = "water";
    if (x === 1 && y === 0) kind = "stone";
    if (x === 6 && y === 6) kind = "stone";

    return { index, x, y, kind };
  });

  const takenTiles = new Set<number>();
  const plantableTiles = tiles
    .map((tile) => tile.index)
    .filter((index) => tiles[index].kind === "grass");

  for (const habit of habits) {
    const manualIndex = plantPositions[habit.id];
    let tileIndex: number | undefined;

    if (manualIndex !== undefined && !takenTiles.has(manualIndex)) {
      tileIndex = manualIndex;
    } else {
      // Deterministic-but-scattered fallback placement.
      const startOffset = hashString(habit.id) % plantableTiles.length;
      for (let i = 0; i < plantableTiles.length; i += 1) {
        const candidate = plantableTiles[(startOffset + i) % plantableTiles.length];
        if (!takenTiles.has(candidate)) {
          tileIndex = candidate;
          break;
        }
      }
    }

    if (tileIndex === undefined) continue;
    takenTiles.add(tileIndex);
    tiles[tileIndex] = { ...tiles[tileIndex], kind: "plant", plantId: habit.id };
  }

  return tiles;
}

export function buildGardenPlants(
  habits: Habit[],
  tiles: GardenTileState[]
): GardenPlant[] {
  const tileByPlantId = new Map(
    tiles.filter((tile) => tile.kind === "plant" && tile.plantId).map((tile) => [tile.plantId as string, tile])
  );

  return habits
    .map((habit) => {
      const tile = tileByPlantId.get(habit.id);
      if (!tile) return null;
      const growthPercent = calculatePlantGrowthPercent(habit.totalXP, habit.difficulty);
      const plant: GardenPlant = {
        id: `plant-${habit.id}`,
        habitId: habit.id,
        name: habit.title,
        species: habit.plantSpecies,
        growthStage: getGrowthStage(growthPercent),
        growthPercent,
        health: habit.active ? 100 : 70,
        rarity: getPlantRarity(habit.plantSpecies, growthPercent),
        currentAnimation: habit.completedToday ? "growing" : "idle",
        assignedHabit: habit,
        createdDate: habit.createdDate,
        lastGrowth: habit.completedToday ? new Date().toISOString() : habit.createdDate,
        tileIndex: tile.index,
      };
      return plant;
    })
    .filter((plant): plant is GardenPlant => plant !== null);
}

/** A short deterministic "growth history" sparkline. There's no real
 *  per-day completion log yet, so this is mock data derived from the
 *  habit's real current growth — purely a decorative trend visualization,
 *  not an authoritative number (growthPercent itself is 100% real). A
 *  future backend endpoint recording daily growth snapshots could replace
 *  this without changing the chart component's props. */
export function getMockGrowthHistory(habit: Habit): number[] {
  const seed = hashString(habit.id);
  const currentGrowth = calculatePlantGrowthPercent(habit.totalXP, habit.difficulty);
  const points: number[] = [];
  let value = Math.max(4, currentGrowth - 24);
  for (let i = 0; i < 10; i += 1) {
    const wiggle = ((seed >> i) % 5) - 2;
    value = Math.min(100, Math.max(0, value + 2.4 + wiggle));
    points.push(Math.round(value));
  }
  points[points.length - 1] = currentGrowth;
  return points;
}

export const PLANT_FACTS: Record<PlantSpeciesId, string[]> = {
  oak: [
    "Oaks are famously slow growers — patience today becomes shade decades from now.",
    "A single oak can support hundreds of other species once it matures.",
  ],
  sunflower: [
    "Young sunflowers track the sun across the sky, a trick called heliotropism.",
    "Sunflowers can grow noticeably taller in just a single week of good conditions.",
  ],
  lotus: [
    "Lotus flowers close at night and reopen at dawn, blooming again each day.",
    "Lotus seeds are famously resilient — some have sprouted after centuries dormant.",
  ],
  fern: [
    "Ferns have no flowers or seeds — they spread with spores instead.",
    "Some fern species are among the oldest plant lineages still alive today.",
  ],
  bonsai: [
    "A bonsai isn't a species — it's any tree shaped patiently, over years, into miniature form.",
    "The art of bonsai treats small, consistent care as the whole point, not a shortcut.",
  ],
  cactus: [
    "Cacti store water in their stems, letting them thrive on very little for a long time.",
    "Many cacti only bloom for a single day, making that bloom feel especially earned.",
  ],
  clover: [
    "Four-leaf clovers are rare mutations — about 1 in 5,000 by some counts.",
    "Clover quietly enriches the soil it grows in, helping everything planted nearby.",
  ],
};

export function getDaysUntilNextStage(percentRemaining: number, habit: Habit): number {
  return estimateDaysUntilNextStage(percentRemaining, habit.difficulty, habit.xpReward);
}

export function getMotivationalMessage(
  stage: GrowthStage,
  habitName: string,
  streak: number,
  nextStageLabel: string | null
): string {
  const streakClause =
    streak > 0
      ? `has grown every day for ${streak} day${streak === 1 ? "" : "s"}`
      : "is ready for its first day of growth";

  if (!nextStageLabel) {
    return `Your ${habitName} ${streakClause}. It has reached its final form — Legendary.`;
  }

  const encouragement: Record<GrowthStage, string> = {
    seed: "Keep going to unlock its Sprout stage.",
    sprout: "Keep going to unlock its Young Plant stage.",
    youngPlant: "Keep going to unlock its Growing Plant stage.",
    growingPlant: "Keep going to unlock its Blooming stage.",
    blooming: "Keep going to unlock its Mature stage.",
    mature: `Keep going to unlock its ${nextStageLabel} form.`,
    legendary: "",
  };

  return `Your ${habitName} ${streakClause}. ${encouragement[stage]}`;
}

export const SEASON_LABELS: Record<Season, string> = {
  spring: "Spring",
  summer: "Summer",
  autumn: "Autumn",
  winter: "Winter",
};

export const SEASON_SEQUENCE: Season[] = ["spring", "summer", "autumn", "winter"];

export const SEASON_PALETTES: Record<
  Season,
  { grass: [string, string, string]; sky: string; particle: string; particleColor: string }
> = {
  spring: {
    grass: ["#4FC788", "#3BB273", "#5FD199"],
    sky: "linear-gradient(180deg, #DCEFFF 0%, #EAF6FF 35%, #F0FBEA 100%)",
    particle: "petal",
    particleColor: "#FFB6C9",
  },
  summer: {
    grass: ["#3BB273", "#2C9560", "#43BD7C"],
    sky: "linear-gradient(180deg, #CFEBFF 0%, #E7F6FF 35%, #F3FBEF 100%)",
    particle: "pollen",
    particleColor: "#F5D97A",
  },
  autumn: {
    grass: ["#C98A3F", "#B97A34", "#D6963F"],
    sky: "linear-gradient(180deg, #FFE3C2 0%, #FFEFDA 35%, #FBF3E4 100%)",
    particle: "leaf",
    particleColor: "#E0793B",
  },
  winter: {
    grass: ["#DCE9E5", "#CBDDD8", "#E6F0ED"],
    sky: "linear-gradient(180deg, #E4EEF9 0%, #EEF4FB 35%, #F6FAF9 100%)",
    particle: "snow",
    particleColor: "#FFFFFF",
  },
};

export const WEATHER_LABELS: Record<Weather, string> = {
  sunny: "Sunny",
  cloudy: "Cloudy",
  rain: "Rain",
  night: "Night",
};

export const WEATHER_SEQUENCE: Weather[] = ["sunny", "cloudy", "rain", "night"];

/** Maps a decoration's icon (from the real inventory catalog,
 *  lib/progression/inventory.ts) to the finer-grained display category the
 *  Garden's InventoryDrawer already renders — kept here purely for that
 *  label, since the database only needs the coarser "decoration" category
 *  to know an item is Garden-placeable. */
const ICON_TO_DECORATION_CATEGORY: Record<string, DecorationCategory> = {
  lamp: "lantern",
  armchair: "bench",
  droplets: "fountain",
  route: "path",
  mountain: "rock",
  flower: "flowerPot",
  "flower-2": "flowerPot",
  trees: "tree",
  sprout: "seed",
};

export function getDecorationCategory(icon: string): DecorationCategory {
  return ICON_TO_DECORATION_CATEGORY[icon] ?? "decoration";
}

export const DECORATION_CATEGORY_LABELS: Record<DecorationCategory, string> = {
  seed: "Seeds",
  decoration: "Decorations",
  path: "Paths",
  bench: "Benches",
  tree: "Trees",
  fountain: "Fountains",
  lantern: "Lanterns",
  rock: "Rocks",
  flowerPot: "Flower Pots",
};

export { GROWTH_STAGE_LABELS } from "@/types/garden";
