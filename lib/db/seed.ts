import { config } from "dotenv";

config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import * as schema from "@/lib/db/schema";

/**
 * Development-only seed data. Never required for production — a brand new
 * production database is expected to start with zero rows beyond what
 * migrations create, and the app works fine that way (empty habit list →
 * the existing EmptyState UI, unrelated to this seed script).
 */

const DEV_USER_EMAIL = "dev@bloom.local";
const DEV_USER_PASSWORD = "bloom-dev-password"; // dev-only, never used in production

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local first.");
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to run seed data against a production environment.");
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  console.log("Seeding development data…");

  // Idempotent: wipe any previous run for this dev user first (cascades
  // clean up habits/completions/plants/tiles via ON DELETE CASCADE).
  await db.delete(schema.users).where(eq(schema.users.email, DEV_USER_EMAIL));

  const passwordHash = await bcrypt.hash(DEV_USER_PASSWORD, 12);
  const [user] = await db
    .insert(schema.users)
    .values({
      name: "Dev Gardener",
      email: DEV_USER_EMAIL,
      passwordHash,
      timezone: "America/New_York",
    })
    .returning();

  const habitSeeds = [
    {
      name: "Drink Water",
      description: "8 glasses spread through the day.",
      icon: "droplet",
      category: "health" as const,
      color: "#3BB273",
      difficulty: "easy" as const,
      xpReward: 10,
      frequency: "daily" as const,
      reminderTime: "09:00",
      plantSpecies: "fern" as const,
      completionPattern: "streak", // completed every day for the last 12 days
    },
    {
      name: "Read 20 Minutes",
      description: "Fiction or non-fiction, just keep the pages turning.",
      icon: "book-open",
      category: "learning" as const,
      color: "#5AA9FF",
      difficulty: "medium" as const,
      xpReward: 20,
      frequency: "daily" as const,
      reminderTime: "21:00",
      plantSpecies: "oak" as const,
      completionPattern: "mostly", // completed most days, a couple of gaps
    },
    {
      name: "Workout",
      description: "Strength or cardio — anything that gets the heart rate up.",
      icon: "dumbbell",
      category: "fitness" as const,
      color: "#F5A623",
      difficulty: "hard" as const,
      xpReward: 35,
      frequency: "weekdays" as const,
      reminderTime: "07:00",
      plantSpecies: "sunflower" as const,
      completionPattern: "weekdays",
    },
    {
      name: "Meditate",
      description: "Ten quiet minutes before the day gets loud.",
      icon: "wind",
      category: "mindfulness" as const,
      color: "#8B7FD6",
      difficulty: "easy" as const,
      xpReward: 10,
      frequency: "daily" as const,
      reminderTime: "06:30",
      plantSpecies: "lotus" as const,
      completionPattern: "streak",
    },
    {
      name: "Journal",
      description: "A few honest sentences about the day.",
      icon: "pen-line",
      category: "creativity" as const,
      color: "#FF9E7D",
      difficulty: "medium" as const,
      xpReward: 20,
      frequency: "custom" as const,
      frequencyDays: [0, 2, 4, 6],
      reminderTime: "22:00",
      plantSpecies: "clover" as const,
      completionPattern: "sparse",
    },
  ];

  const today = new Date();
  function dateString(daysAgo: number): string {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  }

  for (const seed of habitSeeds) {
    const [habit] = await db
      .insert(schema.habits)
      .values({
        userId: user.id,
        name: seed.name,
        description: seed.description,
        icon: seed.icon,
        category: seed.category,
        color: seed.color,
        difficulty: seed.difficulty,
        xpReward: seed.xpReward,
        frequency: seed.frequency,
        frequencyDays: "frequencyDays" in seed ? seed.frequencyDays : null,
        reminderTime: seed.reminderTime,
      })
      .returning();

    await db.insert(schema.plants).values({
      userId: user.id,
      habitId: habit.id,
      species: seed.plantSpecies,
      name: habit.name,
    });

    const completionDays: number[] = (() => {
      switch (seed.completionPattern) {
        case "streak":
          return Array.from({ length: 12 }, (_, i) => i); // today .. 11 days ago
        case "mostly":
          return [0, 1, 2, 4, 5, 6, 8, 9, 10, 11, 13, 14];
        case "weekdays":
          return Array.from({ length: 21 }, (_, i) => i).filter((daysAgo) => {
            const d = new Date(today);
            d.setDate(d.getDate() - daysAgo);
            const day = d.getDay();
            return day !== 0 && day !== 6;
          });
        case "sparse":
          return [1, 4, 9];
        default:
          return [];
      }
    })();

    for (const daysAgo of completionDays) {
      await db.insert(schema.habitCompletions).values({
        habitId: habit.id,
        userId: user.id,
        completionDate: dateString(daysAgo),
        xpEarned: seed.xpReward,
      });
    }
  }

  // A couple of garden customizations, matching the frontend's sparse
  // tile-override model.
  await db.insert(schema.gardenTiles).values([
    { userId: user.id, x: 2, y: 4, decorationId: "lamp" },
    { userId: user.id, x: 6, y: 1, decorationId: "flower" },
  ]);

  console.log(`Seed complete: user ${user.email}, ${habitSeeds.length} habits.`);
  console.log(`Dev login — email: ${DEV_USER_EMAIL}  password: ${DEV_USER_PASSWORD}`);

  await client.end();
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
