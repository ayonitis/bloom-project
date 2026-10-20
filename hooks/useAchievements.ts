"use client";

import { useCallback, useEffect, useState } from "react";
import { getAchievementsPageDataAction } from "@/app/actions/achievements";
import type { AchievementsPageData } from "@/types/achievement";

export function useAchievements() {
  const [data, setData] = useState<AchievementsPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    const result = await getAchievementsPageDataAction();
    if (result.ok) {
      setData(result.data);
    } else {
      setLoadError(result.error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, isLoading, loadError, refresh };
}
