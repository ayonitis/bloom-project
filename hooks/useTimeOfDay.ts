"use client";

import { useEffect, useState } from "react";
import type { SkyPalette, TimeOfDay } from "@/types";

const SKY_PALETTES: Record<TimeOfDay, SkyPalette> = {
  morning: {
    label: "morning",
    gradient: "linear-gradient(180deg, #FFE3B3 0%, #FFD9A0 22%, #FFEFD6 55%, #FFFDF8 100%)",
    showStars: false,
    showFireflies: false,
  },
  afternoon: {
    label: "afternoon",
    gradient: "linear-gradient(180deg, #BFE3FF 0%, #DCEFFF 30%, #FFFAF0 65%, #FFFDF8 100%)",
    showStars: false,
    showFireflies: false,
  },
  evening: {
    label: "evening",
    gradient: "linear-gradient(180deg, #FF9E7D 0%, #F5A623 28%, #FFD59E 55%, #FFF3E0 100%)",
    showStars: false,
    showFireflies: true,
  },
  night: {
    label: "night",
    gradient: "linear-gradient(180deg, #1B2140 0%, #2C3454 35%, #3A4266 70%, #4B4E77 100%)",
    showStars: true,
    showFireflies: true,
  },
};

function resolveTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}

/**
 * Returns the sky palette for the visitor's current local hour, updating
 * every few minutes so a long-open tab still drifts through the day.
 */
export function useTimeOfDay(): SkyPalette {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("morning");

  useEffect(() => {
    function update() {
      setTimeOfDay(resolveTimeOfDay(new Date().getHours()));
    }

    update();
    const interval = setInterval(update, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return SKY_PALETTES[timeOfDay];
}
