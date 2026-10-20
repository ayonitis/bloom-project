"use client";

import { motion } from "framer-motion";
import { Minus, Plus, Sprout } from "lucide-react";
import {
  MAX_HABIT_COUNT,
  MIN_HABIT_COUNT,
  RECOMMENDED_HABIT_COUNT,
} from "@/types/onboarding";
import { cn } from "@/lib/utils";

interface HabitSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function HabitSelector({ value, onChange }: HabitSelectorProps) {
  function step(delta: number) {
    onChange(Math.min(MAX_HABIT_COUNT, Math.max(MIN_HABIT_COUNT, value + delta)));
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={value <= MIN_HABIT_COUNT}
          aria-label="Fewer habits"
          className="focus-ring flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/70 text-bloom-text transition-colors hover:bg-white disabled:opacity-30"
        >
          <Minus className="h-4 w-4" strokeWidth={2.5} />
        </button>

        <div className="flex w-20 flex-col items-center">
          <motion.span
            key={value}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="font-[family-name:var(--font-heading)] text-4xl font-semibold text-bloom-text"
          >
            {value}
          </motion.span>
          <span className="text-xs text-bloom-muted">
            {value === 1 ? "habit" : "habits"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => step(1)}
          disabled={value >= MAX_HABIT_COUNT}
          aria-label="More habits"
          className="focus-ring flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/70 text-bloom-text transition-colors hover:bg-white disabled:opacity-30"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex items-center gap-1.5" aria-hidden>
        {Array.from({ length: MAX_HABIT_COUNT }, (_, i) => i + 1).map((seed) => (
          <Sprout
            key={seed}
            className={cn(
              "h-4 w-4 transition-colors duration-300",
              seed <= value ? "text-bloom-accent" : "text-bloom-text/15"
            )}
            strokeWidth={2.25}
          />
        ))}
      </div>

      {value !== RECOMMENDED_HABIT_COUNT && (
        <button
          type="button"
          onClick={() => onChange(RECOMMENDED_HABIT_COUNT)}
          className="focus-ring rounded-full bg-bloom-primary/10 px-3 py-1.5 text-xs font-medium text-bloom-primary-dark transition-colors hover:bg-bloom-primary/15"
        >
          Use recommended — {RECOMMENDED_HABIT_COUNT} habits
        </button>
      )}
      {value === RECOMMENDED_HABIT_COUNT && (
        <span className="rounded-full bg-bloom-accent/10 px-3 py-1.5 text-xs font-medium text-bloom-accent-dark">
          Recommended for a strong first season
        </span>
      )}
    </div>
  );
}
