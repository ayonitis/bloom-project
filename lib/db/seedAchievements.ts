import { config } from "dotenv";

config({ path: ".env.local" });

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";
import { ACHIEVEMENT_CATALOG } from "@/lib/progression/achievements";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local first.");
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  console.log(`Seeding ${ACHIEVEMENT_CATALOG.length} achievements…`);

  for (const achievement of ACHIEVEMENT_CATALOG) {
    await db
      .insert(schema.achievements)
      .values({
        key: achievement.key,
        name: achievement.name,
        description: achievement.description,
        category: achievement.category,
        icon: achievement.icon,
        requirementType: achievement.requirementType,
        requirementValue: achievement.requirementValue,
        rewardXP: achievement.rewardXP,
        rewardCoins: achievement.rewardCoins,
        rarity: achievement.rarity,
        isSecret: achievement.isSecret,
      })
      .onConflictDoUpdate({
        target: schema.achievements.key,
        set: {
          name: achievement.name,
          description: achievement.description,
          category: achievement.category,
          icon: achievement.icon,
          requirementType: achievement.requirementType,
          requirementValue: achievement.requirementValue,
          rewardXP: achievement.rewardXP,
          rewardCoins: achievement.rewardCoins,
          rarity: achievement.rarity,
          isSecret: achievement.isSecret,
        },
      });
  }

  // Catalog entries removed from ACHIEVEMENT_CATALOG (not just edited) are
  // left in place rather than deleted — a user's existing unlocked
  // achievements should never disappear from their history just because a
  // later phase reworked the catalog.
  const [{ count }] = await db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(schema.achievements);
  console.log(`Done. ${count} total achievement rows in the database.`);

  await client.end();
}

main().catch((error) => {
  console.error("Achievement seed failed:", error);
  process.exit(1);
});
