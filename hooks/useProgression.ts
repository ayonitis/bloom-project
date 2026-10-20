"use client";

import { useCallback, useEffect, useState } from "react";
import { getDashboardProgressionAction } from "@/app/actions/habits";
import type { DashboardProgression } from "@/services/progressionService";

export function useProgression() {
  const [progression, setProgression] = useState<DashboardProgression | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const result = await getDashboardProgressionAction();
    if (result.ok) setProgression(result.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { progression, isLoading, refresh };
}
