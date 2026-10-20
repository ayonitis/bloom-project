import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { gardenTiles } from "@/lib/db/schema";
import { gardenCoordinateSchema } from "@/lib/validation/habit";

export type GardenTileRow = typeof gardenTiles.$inferSelect;

export const gardenService = {
  /** Only tiles the player has customized — see the schema comment on why this is sparse. */
  async listForUser(userId: string): Promise<GardenTileRow[]> {
    return db.select().from(gardenTiles).where(eq(gardenTiles.userId, userId));
  },

  async placeDecoration(userId: string, x: number, y: number, decorationId: string): Promise<GardenTileRow> {
    const coords = gardenCoordinateSchema.parse({ x, y });

    const [row] = await db
      .insert(gardenTiles)
      .values({ userId, x: coords.x, y: coords.y, decorationId, plantId: null })
      .onConflictDoUpdate({
        target: [gardenTiles.userId, gardenTiles.x, gardenTiles.y],
        set: { decorationId, plantId: null, updatedAt: new Date() },
      })
      .returning();
    return row;
  },

  async placePlant(userId: string, x: number, y: number, plantId: string): Promise<GardenTileRow> {
    const coords = gardenCoordinateSchema.parse({ x, y });

    const [row] = await db
      .insert(gardenTiles)
      .values({ userId, x: coords.x, y: coords.y, plantId, decorationId: null })
      .onConflictDoUpdate({
        target: [gardenTiles.userId, gardenTiles.x, gardenTiles.y],
        set: { plantId, decorationId: null, updatedAt: new Date() },
      })
      .returning();
    return row;
  },

  async clearTile(userId: string, x: number, y: number): Promise<void> {
    const coords = gardenCoordinateSchema.parse({ x, y });
    await db
      .delete(gardenTiles)
      .where(and(eq(gardenTiles.userId, userId), eq(gardenTiles.x, coords.x), eq(gardenTiles.y, coords.y)));
  },
};
