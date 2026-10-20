import { ZodError } from "zod";

/**
 * A small set of typed errors every service/action throws instead of raw
 * database or validation errors. Server Actions and Route Handlers catch
 * these (see lib/errors.ts's `toActionResult` below) and turn them into a
 * safe `{ ok: false, error }` shape — raw database error messages (which
 * can leak schema/column names) never reach the client.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "UNAUTHORIZED"
      | "NOT_FOUND"
      | "VALIDATION"
      | "CONFLICT"
      | "DATABASE"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "You must be signed in to do that.") {
    super(message, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found.`, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION");
    this.name = "ValidationError";
  }
}

/** e.g. a duplicate completion for the same habit/day, a unique-email conflict. */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT");
    this.name = "ConflictError";
  }
}

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; code: AppError["code"] };

/**
 * Postgres unique-constraint violations (error code 23505). The `postgres`
 * driver's error sometimes arrives wrapped in Drizzle's own error type with
 * the real Postgres error nested one level down at `.cause` — notably when
 * the failure happens inside a `db.transaction()` callback rather than a
 * bare query — so both places are checked rather than assuming a fixed shape.
 */
export function isUniqueViolation(error: unknown): boolean {
  function codeOf(value: unknown): string | undefined {
    return typeof value === "object" && value !== null && "code" in value
      ? (value as { code?: string }).code
      : undefined;
  }
  if (codeOf(error) === "23505") return true;
  const cause = error instanceof Error ? error.cause : undefined;
  return codeOf(cause) === "23505";
}

/**
 * Wraps a service/action call so every Server Action returns a consistent,
 * client-safe shape instead of throwing across the server/client boundary.
 * Unrecognized errors are logged (server-side only) and reported to the
 * client as a generic message — never the raw error, which could contain
 * database internals.
 */
export async function toActionResult<T>(work: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await work();
    return { ok: true, data };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, error: error.message, code: error.code };
    }
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "Invalid input.";
      return { ok: false, error: message, code: "VALIDATION" };
    }
    console.error("Unexpected server error:", error);
    return { ok: false, error: "Something went wrong. Please try again.", code: "DATABASE" };
  }
}
