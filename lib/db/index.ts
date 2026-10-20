import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and fill in a Postgres connection string."
  );
}

// A module-level singleton, reused across hot reloads in dev and across
// invocations of the same serverless function instance in production —
// Next.js dev's fast refresh would otherwise open a fresh connection pool
// on every edit.
declare global {
  var __bloomPostgresClient: ReturnType<typeof postgres> | undefined;
}

const client =
  global.__bloomPostgresClient ??
  postgres(connectionString, {
    // Serverless-friendly: a small per-instance pool rather than the
    // default 10, since many short-lived function instances will each
    // hold their own pool.
    max: process.env.NODE_ENV === "production" ? 1 : 10,
  });

if (process.env.NODE_ENV !== "production") {
  global.__bloomPostgresClient = client;
}

export const db = drizzle(client, { schema });
export type Database = typeof db;
