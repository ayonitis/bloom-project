"use client";

import { useMemo } from "react";
import { useMousePosition } from "@/hooks/useMousePosition";
import { GardenSpirit } from "@/components/scene/GardenSpirit";
import { SpeechBubble } from "@/components/scene/SpeechBubble";
import { SPIRIT_FALLBACK_MESSAGES } from "@/lib/mockData";

interface GardenSpiritPanelProps {
  remainingHabits: number;
  totalHabits: number;
  currentStreak: number;
}

export function GardenSpiritPanel({
  remainingHabits,
  totalHabits,
  currentStreak,
}: GardenSpiritPanelProps) {
  const mouse = useMousePosition();

  const message = useMemo(() => {
    if (totalHabits > 0 && remainingHabits === 0) {
      return "Every habit tended today. Your garden is glowing.";
    }
    if (remainingHabits === 1) {
      return "Only one habit left today!";
    }
    if (currentStreak >= 10) {
      return "You've been incredibly consistent.";
    }
    const index = (remainingHabits + currentStreak) % SPIRIT_FALLBACK_MESSAGES.length;
    return SPIRIT_FALLBACK_MESSAGES[index];
  }, [remainingHabits, totalHabits, currentStreak]);

  const isHappy = remainingHabits === 0 || currentStreak >= 10;

  return (
    <div className="flex h-full flex-col items-center justify-center rounded-[2rem] border border-black/5 bg-white/70 px-6 py-8 text-center shadow-[0_20px_50px_-30px_rgba(38,54,58,0.22)] backdrop-blur-sm">
      <p className="font-[family-name:var(--font-heading)] text-xs font-semibold uppercase tracking-[0.2em] text-bloom-accent-dark">
        Garden Spirit
      </p>
      <div className="mt-3">
        <SpeechBubble message={message} className="relative flex max-w-[220px] items-end justify-center text-center" />
      </div>
      <div className="mt-1 scale-[0.72]">
        <GardenSpirit mouse={mouse} isCtaHovered={isHappy} />
      </div>
    </div>
  );
}
