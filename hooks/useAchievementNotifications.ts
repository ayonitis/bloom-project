"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AchievementUnlockResult } from "@/types/achievement";

const DISPLAY_DURATION_MS = 4500;

/**
 * A user can unlock several achievements from one habit completion (e.g.
 * "First Step" and a streak achievement at once). Showing them all at
 * once would be exactly the intrusive, workflow-interrupting behavior the
 * product principle warns against — so this queues them and shows one at
 * a time, each auto-dismissing before the next appears.
 */
export function useAchievementNotifications() {
  const [queue, setQueue] = useState<AchievementUnlockResult[]>([]);
  const timeoutRef = useRef<number | undefined>(undefined);

  const enqueue = useCallback((achievements: AchievementUnlockResult[]) => {
    if (achievements.length === 0) return;
    setQueue((prev) => [...prev, ...achievements]);
  }, []);

  const dismissCurrent = useCallback(() => {
    window.clearTimeout(timeoutRef.current);
    setQueue((prev) => prev.slice(1));
  }, []);

  const current = queue[0] ?? null;

  useEffect(() => {
    if (!current) return;
    timeoutRef.current = window.setTimeout(() => {
      setQueue((prev) => prev.slice(1));
    }, DISPLAY_DURATION_MS);
    return () => window.clearTimeout(timeoutRef.current);
  }, [current]);

  return { current, enqueue, dismissCurrent };
}
