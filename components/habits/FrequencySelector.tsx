"use client";

import { motion } from "framer-motion";
import { FREQUENCY_OPTIONS, WEEKDAY_FULL_LABELS, WEEKDAY_LABELS } from "@/lib/habitCatalog";
import { cn } from "@/lib/utils";
import type { HabitFrequency, WeekdayIndex } from "@/types/habit";

interface FrequencySelectorProps {
  frequency: HabitFrequency;
  onChange: (frequency: HabitFrequency) => void;
}

export function FrequencySelector({ frequency, onChange }: FrequencySelectorProps) {
  function toggleDay(day: WeekdayIndex) {
    const has = frequency.customDays.includes(day);
    const customDays = has
      ? frequency.customDays.filter((d) => d !== day)
      : [...frequency.customDays, day].sort((a, b) => a - b);
    onChange({ type: "custom", customDays });
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Habit frequency">
        {FREQUENCY_OPTIONS.map((option, index) => {
          const isSelected = frequency.type === option.id;
          return (
            <motion.button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() =>
                onChange({
                  type: option.id,
                  customDays: option.id === "custom" ? frequency.customDays : [],
                })
              }
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "focus-ring flex flex-col items-start gap-1 rounded-2xl border px-4 py-3.5 text-left transition-colors duration-200",
                isSelected
                  ? "border-bloom-accent/50 bg-bloom-accent/10"
                  : "border-black/5 bg-white/60 hover:border-bloom-accent/30 hover:bg-white/80"
              )}
            >
              <span className="font-[family-name:var(--font-heading)] text-sm font-medium text-bloom-text">
                {option.label}
              </span>
              <span className="text-xs text-bloom-muted">{option.description}</span>
            </motion.button>
          );
        })}
      </div>

      {frequency.type === "custom" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mt-4 overflow-hidden"
        >
          <p className="text-xs font-medium text-bloom-muted">Pick the days</p>
          <div className="mt-2 flex justify-between gap-1.5">
            {WEEKDAY_LABELS.map((label, day) => {
              const isSelected = frequency.customDays.includes(day as WeekdayIndex);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day as WeekdayIndex)}
                  aria-pressed={isSelected}
                  aria-label={WEEKDAY_FULL_LABELS[day]}
                  className={cn(
                    "focus-ring flex h-9 w-9 items-center justify-center rounded-full border text-xs font-medium transition-colors duration-200",
                    isSelected
                      ? "border-bloom-accent bg-bloom-accent text-white"
                      : "border-black/10 bg-white/70 text-bloom-text/70 hover:border-bloom-accent/40"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
