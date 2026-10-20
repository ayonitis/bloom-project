import { z } from "zod";
import { XP_CONFIG } from "@/lib/progression/xp";

const CATEGORY_VALUES = [
  "health",
  "fitness",
  "learning",
  "productivity",
  "mindfulness",
  "creativity",
  "custom",
] as const;

const DIFFICULTY_VALUES = ["easy", "medium", "hard"] as const;
const FREQUENCY_VALUES = ["daily", "weekdays", "weekends", "custom"] as const;
const PLANT_SPECIES_VALUES = [
  "oak",
  "sunflower",
  "lotus",
  "fern",
  "bonsai",
  "cactus",
  "clover",
] as const;

// Difficulty is the only input that determines XP — the client never sends
// an XP value directly, so there's nothing to validate-or-trust there.
// The actual numbers live in lib/progression/xp.ts (the one place XP
// balance is tuned) — re-exported here under the name callers already use.
export const DIFFICULTY_XP = XP_CONFIG.baseByDifficulty;

const timeOfDay = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const habitFrequencySchema = z
  .object({
    type: z.enum(FREQUENCY_VALUES),
    customDays: z.array(z.number().int().min(0).max(6)).max(7).default([]),
  })
  .refine((value) => value.type !== "custom" || value.customDays.length > 0, {
    message: "Pick at least one day for a custom frequency.",
    path: ["customDays"],
  });

export const createHabitSchema = z.object({
  title: z.string().trim().min(1, "Give the habit a name.").max(50),
  description: z.string().trim().max(140).default(""),
  iconId: z.string().trim().min(1).max(40),
  category: z.enum(CATEGORY_VALUES),
  difficulty: z.enum(DIFFICULTY_VALUES),
  frequency: habitFrequencySchema,
  reminderTime: z
    .string()
    .regex(timeOfDay, "Reminder time must be in HH:MM form.")
    .nullable()
    .default(null),
  plantSpecies: z.enum(PLANT_SPECIES_VALUES),
});

export const updateHabitSchema = createHabitSchema.extend({
  active: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export const gardenCoordinateSchema = z.object({
  x: z.number().int().min(0).max(63),
  y: z.number().int().min(0).max(63),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
