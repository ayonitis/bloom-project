import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { habits, xpTransactions, plants, gardenTiles } from "@/lib/db/schema";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { gardenCoordinateSchema } from "@/lib/validation/habit";
import {
  calculatePlantGrowthPercent,
  getPlantGrowthStage,
  getPercentToNextPlantStage,
  type NextStageInfo,
} from "@/lib/progression/plantGrowth";
import { GARDEN_GRID_COLUMNS, buildGardenTiles } from "@/lib/gardenEngine";
import { habitService } from "@/services/habitService";
import { toFrontendHabit } from "@/lib/mappers/habit";
import type { GrowthStage } from "@/types/garden";
import type { HabitDifficulty } from "@/types/habit";

// A plant can never reference a deleted/foreign habit (habits.id cascades
// onto plants.habitId), but the join is still LEFT rather than INNER for
// the same defensive reason habitService's plant join is LEFT: a listing
// should never silently drop a row just because one side is unexpectedly
// missing. "easy" is a safe, visible fallback difficulty, never used to
// silently overstate growth.
const FALLBACK_DIFFICULTY: HabitDifficulty = "easy";

export interface PlantWithGrowth {
  id: string;
  habitId: string;
  species: (typeof plants.$inferSelect)["species"];
  name: string;
  health: number;
  rarity: string;
  positionX: number | null;
  positionY: number | null;
  rotation: number;
  /** The real, server-computed value everything else here is derived from. */
  totalXP: number;
  growthPercent: number;
  growthStage: GrowthStage;
  nextStage: NextStageInfo;
}

function withGrowth(row: {
  id: string;
  habitId: string;
  species: (typeof plants.$inferSelect)["species"];
  name: string;
  health: number;
  rarity: string;
  positionX: number | null;
  positionY: number | null;
  rotation: number;
  totalXP: number;
  difficulty: HabitDifficulty | null;
}): PlantWithGrowth {
  const growthPercent = calculatePlantGrowthPercent(row.totalXP, row.difficulty ?? FALLBACK_DIFFICULTY);
  const growthStage = getPlantGrowthStage(growthPercent);
  return {
    id: row.id,
    habitId: row.habitId,
    species: row.species,
    name: row.name,
    health: row.health,
    rarity: row.rarity,
    positionX: row.positionX,
    positionY: row.positionY,
    rotation: row.rotation,
    totalXP: row.totalXP,
    growthPercent,
    growthStage,
    nextStage: getPercentToNextPlantStage(growthPercent),
  };
}

export const plantService = {
  /** Every plant the user owns, with growth computed from each plant's
   *  linked habit's real, accumulated XP (services/xpService is the XP
   *  ledger's source of truth; this only sums it, never stores a copy). */
  async listForUser(userId: string): Promise<PlantWithGrowth[]> {
    const rows = await db
      .select({
        id: plants.id,
        habitId: plants.habitId,
        species: plants.species,
        name: plants.name,
        health: plants.health,
        rarity: plants.rarity,
        positionX: plants.positionX,
        positionY: plants.positionY,
        rotation: plants.rotation,
        difficulty: habits.difficulty,
        totalXP: sql<number>`coalesce(sum(${xpTransactions.amount}), 0)`.mapWith(Number),
      })
      .from(plants)
      .leftJoin(habits, eq(habits.id, plants.habitId))
      .leftJoin(xpTransactions, eq(xpTransactions.habitId, plants.habitId))
      .where(eq(plants.userId, userId))
      .groupBy(plants.id, habits.difficulty);

    return rows.map(withGrowth);
  },

  /** A single plant, by its owning habit — used to refresh just the one
   *  plant a completion/undo/move affected, instead of refetching the
   *  whole garden (see completeHabitAction / undoCompletionAction). */
  async getForHabit(userId: string, habitId: string): Promise<PlantWithGrowth | null> {
    const [row] = await db
      .select({
        id: plants.id,
        habitId: plants.habitId,
        species: plants.species,
        name: plants.name,
        health: plants.health,
        rarity: plants.rarity,
        positionX: plants.positionX,
        positionY: plants.positionY,
        rotation: plants.rotation,
        difficulty: habits.difficulty,
        totalXP: sql<number>`coalesce(sum(${xpTransactions.amount}), 0)`.mapWith(Number),
      })
      .from(plants)
      .leftJoin(habits, eq(habits.id, plants.habitId))
      .leftJoin(xpTransactions, eq(xpTransactions.habitId, plants.habitId))
      .where(and(eq(plants.userId, userId), eq(plants.habitId, habitId)))
      .groupBy(plants.id, habits.difficulty)
      .limit(1);

    return row ? withGrowth(row) : null;
  },

  async updatePlacement(
    userId: string,
    plantId: string,
    placement: { positionX: number | null; positionY: number | null; rotation?: number }
  ): Promise<void> {
    const [owned] = await db
      .select({ id: plants.id })
      .from(plants)
      .where(and(eq(plants.id, plantId), eq(plants.userId, userId)))
      .limit(1);
    if (!owned) throw new NotFoundError("Plant");

    await db
      .update(plants)
      .set({
        positionX: placement.positionX,
        positionY: placement.positionY,
        ...(placement.rotation !== undefined && { rotation: placement.rotation }),
        updatedAt: new Date(),
      })
      .where(and(eq(plants.id, plantId), eq(plants.userId, userId)));
  },

  /** Same as updatePlacement, but keyed by the habit a plant belongs to —
   *  what the Garden actually has on hand when a user moves a plant (a
   *  plant's own id isn't otherwise surfaced to the client interaction
   *  layer, which only ever deals in habits). */
  async updatePlacementByHabit(
    userId: string,
    habitId: string,
    placement: { positionX: number | null; positionY: number | null }
  ): Promise<void> {
    const [owned] = await db
      .select({ id: plants.id })
      .from(plants)
      .where(and(eq(plants.habitId, habitId), eq(plants.userId, userId)))
      .limit(1);
    if (!owned) throw new NotFoundError("Plant");

    await db
      .update(plants)
      .set({ positionX: placement.positionX, positionY: placement.positionY, updatedAt: new Date() })
      .where(and(eq(plants.id, owned.id), eq(plants.userId, userId)));
  },

  /** Every plant this user has manually repositioned, as a habitId →
   *  tileIndex map — the same shape buildGardenTiles already expects for
   *  its `plantPositions` override argument, so the server can compute the
   *  exact same tile layout the client would (used by
   *  inventoryService's decoration-collision check, and by the Garden
   *  action layer to return the real layout on load). Plants that have
   *  never been moved (positionX/Y still null) are simply absent — their
   *  tile is whatever buildGardenTiles' own deterministic fallback picks. */
  async getPositionOverrides(userId: string): Promise<Record<string, number>> {
    const rows = await db
      .select({ habitId: plants.habitId, positionX: plants.positionX, positionY: plants.positionY })
      .from(plants)
      .where(eq(plants.userId, userId));

    const overrides: Record<string, number> = {};
    for (const row of rows) {
      if (row.positionX === null || row.positionY === null) continue;
      overrides[row.habitId] = row.positionY * GARDEN_GRID_COLUMNS + row.positionX;
    }
    return overrides;
  },

  /** Validated move: rejects a destination that's already decorated or
   *  already has a different plant on it (computed the same deterministic
   *  way the client lays plants out, using every OTHER habit's current
   *  override — or fallback tile if it's never been moved — so this
   *  can't be fooled by a plant that's still sitting on its default tile). */
  async movePlant(userId: string, habitId: string, x: number, y: number): Promise<void> {
    const coords = gardenCoordinateSchema.parse({ x, y });

    const [decoratedTile] = await db
      .select({ decorationItemId: gardenTiles.decorationItemId })
      .from(gardenTiles)
      .where(and(eq(gardenTiles.userId, userId), eq(gardenTiles.x, coords.x), eq(gardenTiles.y, coords.y)))
      .limit(1);
    if (decoratedTile?.decorationItemId) throw new ConflictError("That tile is already decorated.");

    const [habitRows, overrides] = await Promise.all([
      habitService.listForUserWithPlantSpecies(userId, { includeArchived: false }),
      this.getPositionOverrides(userId),
    ]);
    const activeHabits = habitRows.map((row) => toFrontendHabit(row)).filter((habit) => habit.active);
    const tiles = buildGardenTiles(activeHabits, overrides);
    const collision = tiles.find(
      (tile) => tile.x === coords.x && tile.y === coords.y && tile.kind === "plant" && tile.plantId !== habitId
    );
    if (collision) throw new ConflictError("That tile already has another plant on it.");

    await this.updatePlacementByHabit(userId, habitId, { positionX: coords.x, positionY: coords.y });
  },

  async resetPlantPosition(userId: string, habitId: string): Promise<void> {
    await this.updatePlacementByHabit(userId, habitId, { positionX: null, positionY: null });
  },
};
