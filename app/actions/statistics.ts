"use server";

import { requireUserId } from "@/lib/auth/requireUserId";
import { toActionResult, type ActionResult } from "@/lib/errors";
import { statisticsService } from "@/services/statisticsService";
import type { StatisticsData, StatsRange } from "@/types/statistics";

const VALID_RANGES: readonly StatsRange[] = ["7d", "30d", "90d", "year", "all"];

function parseRange(range: string): StatsRange {
  // Never trust a client-supplied string beyond checking it against the
  // fixed set of ranges the service actually knows how to compute —
  // anything else quietly falls back to a safe default rather than
  // reaching the database with an unexpected value.
  return (VALID_RANGES as readonly string[]).includes(range) ? (range as StatsRange) : "30d";
}

export async function getStatisticsAction(range: string): Promise<ActionResult<StatisticsData>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    return statisticsService.getStatistics(userId, parseRange(range));
  });
}
