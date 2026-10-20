import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { gardenTiles, habits, inventoryItems, userInventory, xpTransactions } from "@/lib/db/schema";
import { ConflictError, NotFoundError, ValidationError, isUniqueViolation } from "@/lib/errors";
import { gardenCoordinateSchema } from "@/lib/validation/habit";
import { INVENTORY_CATALOG } from "@/lib/progression/inventory";
import { buildGardenTiles } from "@/lib/gardenEngine";
import { habitService } from "@/services/habitService";
import { plantService } from "@/services/plantService";
import { toFrontendHabit } from "@/lib/mappers/habit";
import type { InventoryCategory, InventoryRarity } from "@/lib/progression/inventory";

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbOrTx = typeof db | DbTransaction;

export interface InventoryItemView {
  id: string;
  key: string;
  name: string;
  description: string;
  category: InventoryCategory;
  icon: string;
  rarity: InventoryRarity;
  placesAsTileType: "decoration" | "path" | "stone" | null;
  seedGrowthBoostXP: number | null;
  /** Total ever owned. Only purchases and seed-use change this — placing,
   *  moving, or removing a decoration never does (see the module comment
   *  below on why). */
  quantity: number;
  /** How many of this item are currently placed somewhere in the Garden. */
  placed: number;
  /** quantity - placed. */
  available: number;
  priceCoins: number | null;
}

export interface GardenPlacementView {
  x: number;
  y: number;
  itemId: string;
  itemKey: string;
  rotation: number;
}

/**
 * Ownership model for decorations: `userInventory.quantity` is the total a
 * user has ever owned (changed only by purchases), and how many are
 * "placed" is derived live by counting garden_tiles rows — never a second
 * stored number that could drift from the truth. Placing/removing a
 * decoration therefore never touches `userInventory` at all; only the
 * garden_tiles row changes. This is what makes "move" trivial and correct
 * (no inventory mutation needed) and matches the explicit product
 * requirement that placing an already-owned item should never require
 * buying it again.
 */
export async function getPlacedCounts(executor: DbOrTx, userId: string): Promise<Map<string, number>> {
  const rows = await executor
    .select({ itemId: gardenTiles.decorationItemId, count: sql<number>`count(*)`.mapWith(Number) })
    .from(gardenTiles)
    .where(and(eq(gardenTiles.userId, userId), sql`${gardenTiles.decorationItemId} is not null`))
    .groupBy(gardenTiles.decorationItemId);

  const counts = new Map<string, number>();
  for (const row of rows) {
    if (row.itemId) counts.set(row.itemId, row.count);
  }
  return counts;
}

/** A brand-new user has zero userInventory rows. The very first time their
 *  inventory is read, grant every catalog item's `starterQuantity` — this
 *  is intentionally NOT run at signup/onboarding (a completed, untouched
 *  system) so this phase stays self-contained; "no rows yet" is itself a
 *  reliable, idempotent signal that starter provisioning hasn't happened,
 *  since every later mutation only ever increments/decrements existing
 *  rows and never deletes the last one down to zero rows again. */
async function ensureStarterInventory(userId: string): Promise<void> {
  const existing = await db
    .select({ id: userInventory.id })
    .from(userInventory)
    .where(eq(userInventory.userId, userId))
    .limit(1);
  if (existing.length > 0) return;

  const catalog = await db.select().from(inventoryItems);
  const starterRows = catalog
    .map((item) => {
      const seed = INVENTORY_CATALOG.find((entry) => entry.key === item.key);
      const quantity = seed?.starterQuantity ?? 0;
      return quantity > 0 ? { userId, itemId: item.id, quantity } : null;
    })
    .filter((row): row is { userId: string; itemId: string; quantity: number } => row !== null);

  if (starterRows.length === 0) return;
  // onConflictDoNothing guards the (extremely unlikely but possible) race
  // of two requests both seeing zero rows and both trying to provision —
  // the unique (userId, itemId) constraint means only one wins per item.
  await db.insert(userInventory).values(starterRows).onConflictDoNothing({
    target: [userInventory.userId, userInventory.itemId],
  });
}

async function getOwnedItemWithQuantity(
  executor: DbOrTx,
  userId: string,
  itemId: string
): Promise<{ item: typeof inventoryItems.$inferSelect; quantity: number }> {
  const [row] = await executor
    .select({ item: inventoryItems, quantity: userInventory.quantity })
    .from(inventoryItems)
    .leftJoin(userInventory, and(eq(userInventory.itemId, inventoryItems.id), eq(userInventory.userId, userId)))
    .where(eq(inventoryItems.id, itemId))
    .limit(1);
  if (!row) throw new NotFoundError("Item");
  return { item: row.item, quantity: row.quantity ?? 0 };
}

/** Only for genuine consumption (seed use, purchases) — decorations never
 *  call this; see the module comment above. */
export async function adjustQuantity(executor: DbOrTx, userId: string, itemId: string, delta: number): Promise<void> {
  await executor
    .insert(userInventory)
    .values({ userId, itemId, quantity: Math.max(0, delta) })
    .onConflictDoUpdate({
      target: [userInventory.userId, userInventory.itemId],
      set: { quantity: sql`greatest(0, ${userInventory.quantity} + ${delta})`, updatedAt: new Date() },
    });
}

async function getTileOwnedByUser(executor: DbOrTx, userId: string, x: number, y: number) {
  const [tile] = await executor
    .select()
    .from(gardenTiles)
    .where(and(eq(gardenTiles.userId, userId), eq(gardenTiles.x, x), eq(gardenTiles.y, y)))
    .limit(1);
  return tile ?? null;
}

/**
 * Checks a tile against the SAME deterministic layout the client uses,
 * accounting for every plant's real persisted position (see
 * plantService.getPositionOverrides) — not just the default fallback tile
 * a never-moved plant would sit on.
 */
async function isPlantOccupiedTile(userId: string, x: number, y: number): Promise<boolean> {
  const [habitRows, overrides] = await Promise.all([
    habitService.listForUserWithPlantSpecies(userId, { includeArchived: false }),
    plantService.getPositionOverrides(userId),
  ]);
  const activeHabits = habitRows.map((row) => toFrontendHabit(row)).filter((habit) => habit.active);
  const tiles = buildGardenTiles(activeHabits, overrides);
  const tile = tiles.find((candidate) => candidate.x === x && candidate.y === y);
  return tile?.kind === "plant";
}

export const inventoryService = {
  /** The full catalog, with this user's real owned/placed/available merged
   *  in (0 for anything they don't own) — provisions the starter kit first
   *  if this is the user's first-ever inventory read. */
  async listForUser(userId: string): Promise<InventoryItemView[]> {
    await ensureStarterInventory(userId);

    const [rows, placedCounts] = await Promise.all([
      db
        .select({ item: inventoryItems, quantity: userInventory.quantity })
        .from(inventoryItems)
        .leftJoin(userInventory, and(eq(userInventory.itemId, inventoryItems.id), eq(userInventory.userId, userId)))
        .orderBy(inventoryItems.category, inventoryItems.name),
      getPlacedCounts(db, userId),
    ]);

    return rows.map(({ item, quantity }) => {
      const owned = quantity ?? 0;
      const placed = placedCounts.get(item.id) ?? 0;
      return {
        id: item.id,
        key: item.key,
        name: item.name,
        description: item.description,
        category: item.category,
        icon: item.icon,
        rarity: item.rarity,
        placesAsTileType: item.placesAsTileType as InventoryItemView["placesAsTileType"],
        seedGrowthBoostXP: item.seedGrowthBoostXP,
        quantity: owned,
        placed,
        available: Math.max(0, owned - placed),
        priceCoins: item.priceCoins,
      };
    });
  },

  /** Every tile this user has customized with a decoration — the Garden
   *  reads this instead of keeping its own local copy, so Inventory and
   *  Garden can never disagree about what's placed where. */
  async listGardenPlacements(userId: string): Promise<GardenPlacementView[]> {
    return db
      .select({
        x: gardenTiles.x,
        y: gardenTiles.y,
        rotation: gardenTiles.rotation,
        itemId: inventoryItems.id,
        itemKey: inventoryItems.key,
      })
      .from(gardenTiles)
      .innerJoin(inventoryItems, eq(inventoryItems.id, gardenTiles.decorationItemId))
      .where(eq(gardenTiles.userId, userId));
  },

  /** Places a decoration on a tile from Inventory. Ownership is checked
   *  against the derived `available` count (owned minus already-placed),
   *  never against `userInventory.quantity` directly, and no inventory row
   *  is written here at all — only the garden_tiles row. */
  async placeDecoration(userId: string, x: number, y: number, itemId: string): Promise<GardenPlacementView> {
    const coords = gardenCoordinateSchema.parse({ x, y });

    return db.transaction(async (tx) => {
      const { item, quantity } = await getOwnedItemWithQuantity(tx, userId, itemId);
      if (item.category !== "decoration") throw new ValidationError("That item can't be placed in the garden.");

      const placedCounts = await getPlacedCounts(tx, userId);
      const available = quantity - (placedCounts.get(itemId) ?? 0);
      if (available <= 0) throw new ConflictError("You don't have any of this item left to place.");

      const existingTile = await getTileOwnedByUser(tx, userId, coords.x, coords.y);
      if (existingTile?.plantId) throw new ConflictError("That tile already has a plant on it.");
      if (existingTile?.decorationItemId) throw new ConflictError("That tile is already decorated.");
      if (await isPlantOccupiedTile(userId, coords.x, coords.y)) {
        throw new ConflictError("That tile already has a plant on it.");
      }

      await tx
        .insert(gardenTiles)
        .values({
          userId,
          x: coords.x,
          y: coords.y,
          tileType: item.placesAsTileType ?? "decoration",
          decorationItemId: item.id,
          rotation: 0,
          plantId: null,
        })
        .onConflictDoUpdate({
          target: [gardenTiles.userId, gardenTiles.x, gardenTiles.y],
          set: {
            tileType: item.placesAsTileType ?? "decoration",
            decorationItemId: item.id,
            rotation: 0,
            plantId: null,
            updatedAt: new Date(),
          },
        });

      return { x: coords.x, y: coords.y, itemId: item.id, itemKey: item.key, rotation: 0 };
    });
  },

  /** Moves an already-placed decoration to a different tile — no
   *  inventory quantity change at all (it was never decremented on
   *  placement), just relocating the same garden_tiles row. The
   *  destination's own unique (userId, x, y) constraint is the final,
   *  race-proof guard against two concurrent moves landing on the same
   *  tile, even though we also check it up front for a friendlier error
   *  in the common case. */
  async moveDecoration(
    userId: string,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): Promise<GardenPlacementView> {
    const from = gardenCoordinateSchema.parse({ x: fromX, y: fromY });
    const to = gardenCoordinateSchema.parse({ x: toX, y: toY });

    try {
      return await db.transaction(async (tx) => {
        const sourceTile = await getTileOwnedByUser(tx, userId, from.x, from.y);
        if (!sourceTile?.decorationItemId) throw new NotFoundError("Decoration");

        const destinationTile = await getTileOwnedByUser(tx, userId, to.x, to.y);
        if (destinationTile?.plantId) throw new ConflictError("That tile already has a plant on it.");
        if (destinationTile?.decorationItemId) throw new ConflictError("That tile is already decorated.");
        if (await isPlantOccupiedTile(userId, to.x, to.y)) {
          throw new ConflictError("That tile already has a plant on it.");
        }

        const [item] = await tx
          .select({ id: inventoryItems.id, key: inventoryItems.key })
          .from(inventoryItems)
          .where(eq(inventoryItems.id, sourceTile.decorationItemId))
          .limit(1);
        if (!item) throw new NotFoundError("Item");

        if (destinationTile) {
          // A grass/path/etc. tile the Garden already has a row for —
          // update it in place rather than inserting a duplicate.
          await tx
            .update(gardenTiles)
            .set({
              tileType: sourceTile.tileType,
              decorationItemId: sourceTile.decorationItemId,
              rotation: sourceTile.rotation,
              updatedAt: new Date(),
            })
            .where(and(eq(gardenTiles.userId, userId), eq(gardenTiles.x, to.x), eq(gardenTiles.y, to.y)));
        } else {
          await tx.insert(gardenTiles).values({
            userId,
            x: to.x,
            y: to.y,
            tileType: sourceTile.tileType,
            decorationItemId: sourceTile.decorationItemId,
            rotation: sourceTile.rotation,
            plantId: null,
          });
        }

        await tx
          .delete(gardenTiles)
          .where(and(eq(gardenTiles.userId, userId), eq(gardenTiles.x, from.x), eq(gardenTiles.y, from.y)));

        return { x: to.x, y: to.y, itemId: item.id, itemKey: item.key, rotation: sourceTile.rotation };
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictError("Someone just took that tile — try another spot.");
      }
      throw error;
    }
  },

  /** Clears a decorated tile. No inventory mutation — the item was never
   *  decremented when placed, so there's nothing to "return". A no-op
   *  (not an error) if the tile has no decoration — the Garden may call
   *  this speculatively when a tile's exact state is ambiguous client-side. */
  async removeDecoration(userId: string, x: number, y: number): Promise<void> {
    const coords = gardenCoordinateSchema.parse({ x, y });

    const tile = await getTileOwnedByUser(db, userId, coords.x, coords.y);
    if (!tile?.decorationItemId) return;

    await db
      .delete(gardenTiles)
      .where(and(eq(gardenTiles.userId, userId), eq(gardenTiles.x, coords.x), eq(gardenTiles.y, coords.y)));
  },

  async rotateDecoration(userId: string, x: number, y: number): Promise<number> {
    const coords = gardenCoordinateSchema.parse({ x, y });

    const tile = await getTileOwnedByUser(db, userId, coords.x, coords.y);
    if (!tile?.decorationItemId) throw new NotFoundError("Decoration");

    const nextRotation = (tile.rotation + 90) % 360;
    await db
      .update(gardenTiles)
      .set({ rotation: nextRotation, updatedAt: new Date() })
      .where(and(eq(gardenTiles.userId, userId), eq(gardenTiles.x, coords.x), eq(gardenTiles.y, coords.y)));
    return nextRotation;
  },

  /** Consumes one seed, awarding its growth boost as a real XP transaction
   *  on the chosen habit — the exact same ledger plant growth already
   *  reads from, so the boost shows up immediately, nothing new to keep in
   *  sync. Seeds have no "placed" concept — using one is real consumption,
   *  unlike decorations, so this is the one place adjustQuantity is still
   *  correct to call for a non-purchase reason. */
  async useSeed(userId: string, itemId: string, habitId: string): Promise<{ xpAwarded: number }> {
    return db.transaction(async (tx) => {
      const { item, quantity } = await getOwnedItemWithQuantity(tx, userId, itemId);
      if (item.category !== "seed" || !item.seedGrowthBoostXP) {
        throw new ValidationError("That item can't be used this way.");
      }
      if (quantity <= 0) throw new ConflictError("You don't have any of this item left.");

      const [habit] = await tx
        .select({ id: habits.id })
        .from(habits)
        .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
        .limit(1);
      if (!habit) throw new NotFoundError("Habit");

      await adjustQuantity(tx, userId, itemId, -1);
      await tx.insert(xpTransactions).values({
        userId,
        habitId,
        amount: item.seedGrowthBoostXP,
        reason: "seed_boost",
      });

      return { xpAwarded: item.seedGrowthBoostXP };
    });
  },
};
