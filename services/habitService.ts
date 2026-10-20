import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { habits, plants } from "@/lib/db/schema";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { CATEGORY_MAP } from "@/lib/habitCatalog";
import { DIFFICULTY_XP, type CreateHabitInput, type UpdateHabitInput } from "@/lib/validation/habit";
import type { PlantSpeciesId } from "@/types/habit";

export type HabitRow = typeof habits.$inferSelect;

/** A habit row plus its linked plant's species — every habit has exactly
 *  one plant (see createWithPlant), but the join is LEFT so a habit never
 *  silently disappears from a listing if that invariant were ever violated;
 *  "fern" is a safe, visible fallback rather than a thrown error. */
export interface HabitWithPlantSpecies extends HabitRow {
  plantSpecies: PlantSpeciesId;
}

const FALLBACK_SPECIES: PlantSpeciesId = "fern";

async function getOwnedHabitOrThrow(userId: string, habitId: string): Promise<HabitRow> {
  const [row] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .limit(1);
  // Deliberately the same error whether the habit truly doesn't exist or
  // simply belongs to someone else — never confirm another user's data
  // exists via a different error shape (that's an IDOR information leak).
  if (!row) throw new NotFoundError("Habit");
  return row;
}

function validateFrequency(frequency: CreateHabitInput["frequency"]): void {
  if (frequency.type === "custom" && frequency.customDays.length === 0) {
    throw new ValidationError("Pick at least one day for a custom frequency.");
  }
}

export const habitService = {
  async listForUser(userId: string, options: { includeArchived?: boolean } = {}): Promise<HabitRow[]> {
    const condition = options.includeArchived
      ? eq(habits.userId, userId)
      : and(eq(habits.userId, userId), eq(habits.archived, false));
    return db.select().from(habits).where(condition).orderBy(habits.createdAt);
  },

  /** Same as listForUser, joined with each habit's plant species — this is
   *  what the Habits page and Dashboard actually render. */
  async listForUserWithPlantSpecies(
    userId: string,
    options: { includeArchived?: boolean } = {}
  ): Promise<HabitWithPlantSpecies[]> {
    const condition = options.includeArchived
      ? eq(habits.userId, userId)
      : and(eq(habits.userId, userId), eq(habits.archived, false));

    const rows = await db
      .select({ habit: habits, plantSpecies: plants.species })
      .from(habits)
      .leftJoin(plants, eq(plants.habitId, habits.id))
      .where(condition)
      .orderBy(habits.createdAt);

    return rows.map(({ habit, plantSpecies }) => ({
      ...habit,
      plantSpecies: plantSpecies ?? FALLBACK_SPECIES,
    }));
  },

  async getByIdForUser(userId: string, habitId: string): Promise<HabitRow> {
    return getOwnedHabitOrThrow(userId, habitId);
  },

  /** Inserts the habit and its linked plant together — either both exist or neither does. */
  async createWithPlant(userId: string, input: CreateHabitInput): Promise<HabitWithPlantSpecies> {
    validateFrequency(input.frequency);

    return db.transaction(async (tx) => {
      const [habit] = await tx
        .insert(habits)
        .values({
          userId,
          name: input.title,
          description: input.description,
          icon: input.iconId,
          category: input.category,
          color: CATEGORY_MAP[input.category].color,
          difficulty: input.difficulty,
          frequency: input.frequency.type,
          frequencyDays: input.frequency.type === "custom" ? input.frequency.customDays : null,
          reminderTime: input.reminderTime,
          xpReward: DIFFICULTY_XP[input.difficulty],
        })
        .returning();

      await tx.insert(plants).values({
        userId,
        habitId: habit.id,
        species: input.plantSpecies,
        name: habit.name,
      });

      return { ...habit, plantSpecies: input.plantSpecies };
    });
  },

  async update(userId: string, habitId: string, input: UpdateHabitInput): Promise<HabitWithPlantSpecies> {
    await getOwnedHabitOrThrow(userId, habitId);
    validateFrequency(input.frequency);

    return db.transaction(async (tx) => {
      const [updated] = await tx
        .update(habits)
        .set({
          name: input.title,
          description: input.description,
          icon: input.iconId,
          category: input.category,
          color: CATEGORY_MAP[input.category].color,
          difficulty: input.difficulty,
          xpReward: DIFFICULTY_XP[input.difficulty],
          frequency: input.frequency.type,
          frequencyDays: input.frequency.type === "custom" ? input.frequency.customDays : null,
          reminderTime: input.reminderTime,
          ...(input.active !== undefined && { active: input.active }),
          ...(input.archived !== undefined && { archived: input.archived }),
          updatedAt: new Date(),
        })
        .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
        .returning();

      await tx
        .update(plants)
        .set({ species: input.plantSpecies, name: updated.name, updatedAt: new Date() })
        .where(eq(plants.habitId, habitId));

      return { ...updated, plantSpecies: input.plantSpecies };
    });
  },

  async setArchived(userId: string, habitId: string, archived: boolean): Promise<HabitRow> {
    await getOwnedHabitOrThrow(userId, habitId);
    const [updated] = await db
      .update(habits)
      .set({ archived, updatedAt: new Date() })
      .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
      .returning();
    return updated;
  },

  async remove(userId: string, habitId: string): Promise<void> {
    await getOwnedHabitOrThrow(userId, habitId);
    // ON DELETE CASCADE takes care of habit_completions and the linked plant.
    await db.delete(habits).where(and(eq(habits.id, habitId), eq(habits.userId, userId)));
  },
};
