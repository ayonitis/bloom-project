"use client";

import { motion } from "framer-motion";
import { DIFFICULTY_OPTIONS } from "@/lib/habitCatalog";
import { cn } from "@/lib/utils";
import type { HabitDifficulty } from "@/types/habit";

interface DifficultySelectorProps {
  selected: HabitDifficulty;
  onSelect: (difficulty: HabitDifficulty) => void;
}

export function DifficultySelector({ selected, onSelect }: DifficultySelectorProps) {
  return (
    <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Habit difficulty">
      {DIFFICULTY_OPTIONS.map((option, index) => {
        const isSelected = selected === option.id;
        return (
          <motion.button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(option.id)}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "focus-ring flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-colors duration-200",
              isSelected
                ? "border-bloom-accent/50 bg-bloom-accent/10"
                : "border-black/5 bg-white/60 hover:border-bloom-accent/30 hover:bg-white/80"
            )}
          >
            <div>
              <p className="font-[family-name:var(--font-heading)] text-sm font-medium text-bloom-text">
                {option.label}
              </p>
              <p className="text-xs text-bloom-muted">{option.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-0.5" aria-hidden="true">
                {Array.from({ length: 3 }, (_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      i < option.dots ? "bg-bloom-primary" : "bg-bloom-text/15"
                    )}
                  />
                ))}
              </span>
              <span className="rounded-full bg-bloom-primary/10 px-2 py-1 text-xs font-medium text-bloom-primary-dark">
                +{option.xpReward} XP
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
