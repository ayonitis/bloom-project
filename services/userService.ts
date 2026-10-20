import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { ConflictError, NotFoundError, isUniqueViolation } from "@/lib/errors";

export interface PublicUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  timezone: string;
}

function toPublicUser(row: typeof users.$inferSelect): PublicUser {
  return { id: row.id, name: row.name, email: row.email, image: row.image, timezone: row.timezone };
}

export const userService = {
  /**
   * Internal only — includes the password hash. Used exclusively by the
   * Credentials provider's `authorize` callback (lib/auth/config.ts). No
   * other caller should ever see a passwordHash.
   */
  async findByEmailWithPassword(email: string) {
    const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return row ?? null;
  },

  async getById(userId: string): Promise<PublicUser> {
    const [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!row) throw new NotFoundError("User");
    return toPublicUser(row);
  },

  async createWithPassword(input: { name: string; email: string; passwordHash: string }): Promise<PublicUser> {
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1);
    if (existing.length > 0) {
      throw new ConflictError("An account with that email already exists.");
    }

    try {
      const [row] = await db
        .insert(users)
        .values({ name: input.name, email: input.email, passwordHash: input.passwordHash })
        .returning();
      return toPublicUser(row);
    } catch (error) {
      // The pre-check above isn't atomic — two concurrent signups for the
      // same email could both pass it. The unique constraint on
      // users.email is the real guarantee; translate its violation into
      // the same friendly error rather than leaking a raw DB error.
      if (isUniqueViolation(error)) {
        throw new ConflictError("An account with that email already exists.");
      }
      throw error;
    }
  },

  async updateTimezone(userId: string, timezone: string): Promise<PublicUser> {
    const [row] = await db
      .update(users)
      .set({ timezone, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    if (!row) throw new NotFoundError("User");
    return toPublicUser(row);
  },
};
