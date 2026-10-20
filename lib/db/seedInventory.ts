import { config } from "dotenv";

config({ path: ".env.local" });

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";
import { INVENTORY_CATALOG } from "@/lib/progression/inventory";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local first.");
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  console.log(`Seeding ${INVENTORY_CATALOG.length} inventory items…`);

  for (const item of INVENTORY_CATALOG) {
    await db
      .insert(schema.inventoryItems)
      .values({
        key: item.key,
        name: item.name,
        description: item.description,
        category: item.category,
        icon: item.icon,
        rarity: item.rarity,
        placesAsTileType: item.placesAsTileType ?? null,
        seedGrowthBoostXP: item.seedGrowthBoostXP ?? null,
        priceCoins: item.priceCoins ?? null,
      })
      .onConflictDoUpdate({
        target: schema.inventoryItems.key,
        set: {
          name: item.name,
          description: item.description,
          category: item.category,
          icon: item.icon,
          rarity: item.rarity,
          placesAsTileType: item.placesAsTileType ?? null,
          seedGrowthBoostXP: item.seedGrowthBoostXP ?? null,
          priceCoins: item.priceCoins ?? null,
        },
      });
  }

  // Catalog rows removed from INVENTORY_CATALOG (not just edited) are left
  // in place rather than deleted — a user's existing owned/placed items
  // should never disappear just because a later phase reworked the catalog.
  const [{ count }] = await db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(schema.inventoryItems);
  console.log(`Done. ${count} total inventory item rows in the database.`);

  await client.end();
}

main().catch((error) => {
  console.error("Inventory seed failed:", error);
  process.exit(1);
});
