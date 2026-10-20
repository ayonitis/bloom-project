"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { GOAL_OPTIONS } from "@/lib/goals";
import { cn } from "@/lib/utils";
import type { GoalId } from "@/types/onboarding";

interface GoalSelectorProps {
  selected: GoalId | null;
  onSelect: (goal: GoalId) => void;
  customGoal: string;
  onCustomGoalChange: (value: string) => void;
}

export function GoalSelector({
  selected,
  onSelect,
  customGoal,
  onCustomGoalChange,
}: GoalSelectorProps) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {GOAL_OPTIONS.map((goal, index) => {
          const isSelected = selected === goal.id;
          return (
            <motion.button
              key={goal.id}
              type="button"
              onClick={() => onSelect(goal.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              aria-pressed={isSelected}
              className={cn(
                "focus-ring relative flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center transition-colors duration-200",
                isSelected
                  ? "border-bloom-accent/50 bg-bloom-accent/10"
                  : "border-black/5 bg-white/60 hover:border-bloom-accent/30 hover:bg-white/80"
              )}
            >
              {isSelected && (
                <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-bloom-accent text-white">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
              )}
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  isSelected
                    ? "bg-bloom-accent/20 text-bloom-accent-dark"
                    : "bg-bloom-primary/10 text-bloom-primary-dark"
                )}
              >
                <goal.icon className="h-4.5 w-4.5" strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="font-[family-name:var(--font-heading)] text-sm font-medium text-bloom-text">
                {goal.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {selected === "custom" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mt-4 overflow-hidden"
        >
          <input
            type="text"
            value={customGoal}
            onChange={(event) => onCustomGoalChange(event.target.value)}
            placeholder="What are you hoping to grow?"
            aria-label="Describe your custom goal"
            maxLength={60}
            autoFocus
            className="focus-ring w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-bloom-text placeholder:text-bloom-muted/70"
          />
        </motion.div>
      )}
    </div>
  );
}
