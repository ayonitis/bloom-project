"use client";

import { useCallback, useEffect, useState } from "react";
import { getStatisticsAction } from "@/app/actions/statistics";
import type { StatisticsData, StatsRange } from "@/types/statistics";

export function useStatistics(initialRange: StatsRange = "30d") {
  const [range, setRange] = useState<StatsRange>(initialRange);
  const [data, setData] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async (targetRange: StatsRange) => {
    setIsLoading(true);
    setLoadError(null);
    const result = await getStatisticsAction(targetRange);
    if (result.ok) {
      setData(result.data);
    } else {
      setLoadError(result.error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh(range);
  }, [range, refresh]);

  return { range, setRange, data, isLoading, loadError, refresh: () => refresh(range) };
}
