"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkle } from "lucide-react";
import { CATEGORY_META, DIFFICULTY_META } from "@/lib/dashboardMeta";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types/dashboard";

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
}

const CONFETTI_COLORS = ["#F5A623", "#5AA9FF", "#3BB273", "#FF9E7D"];

export function HabitCard({ habit, onToggle }: HabitCardProps) {
  const [celebrate, setCelebrate] = useState(false);
  const category = CATEGORY_META[habit.category];
  const difficulty = DIFFICULTY_META[habit.difficulty];

  useEffect(() => {
    if (!celebrate) return;
    const timeout = window.setTimeout(() => setCelebrate(false), 900);
    return () => window.clearTimeout(timeout);
  }, [celebrate]);

  function handleToggle() {
    if (!habit.completed) setCelebrate(true);
    onToggle(habit.id);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition-colors duration-300",
        habit.completed
          ? "border-bloom-accent/25 bg-bloom-accent/[0.06]"
          : "border-black/5 bg-white/70 hover:bg-white/90"
      )}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: category.bg, color: category.color }}
      >
        <habit.icon className="h-4.5 w-4.5" strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate font-[family-name:var(--font-heading)] text-sm font-medium text-bloom-text sm:text-base",
            habit.completed && "text-bloom-text/60 line-through decoration-bloom-accent/50"
          )}
        >
          {habit.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-bloom-muted">
          <span
            className="rounded-full px-2 py-0.5 font-medium"
            style={{ backgroundColor: category.bg, color: category.color }}
          >
            {category.label}
          </span>
          <span className="flex items-center gap-0.5" aria-label={`Difficulty: ${difficulty.label}`}>
            {Array.from({ length: 3 }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  i < difficulty.dots ? "bg-bloom-primary" : "bg-bloom-text/15"
                )}
              />
            ))}
          </span>
          <span>+{habit.xpReward} XP</span>
        </div>
      </div>

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={handleToggle}
          aria-pressed={habit.completed}
          aria-label={`Mark "${habit.title}" as ${habit.completed ? "not done" : "done"}`}
          className={cn(
            "focus-ring flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors duration-300",
            habit.completed
              ? "border-bloom-accent bg-bloom-accent text-white"
              : "border-bloom-text/15 bg-white text-transparent hover:border-bloom-accent/50"
          )}
        >
          <motion.span
            initial={false}
            animate={{ scale: habit.completed ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </motion.span>
        </button>

        <AnimatePresence>
          {celebrate && (
            <>
              <motion.span
                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                animate={{ opacity: 0, y: -26, scale: 1.1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap font-[family-name:var(--font-heading)] text-xs font-semibold text-bloom-accent-dark"
              >
                +{habit.xpReward} XP
              </motion.span>
              <motion.span
                initial={{ opacity: 1, scale: 0.4, rotate: 0 }}
                animate={{ opacity: 0, scale: 1.4, rotate: 25 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="pointer-events-none absolute -right-1.5 -top-1.5 text-bloom-primary"
              >
                <Sparkle className="h-4 w-4" fill="currentColor" />
              </motion.span>
              {CONFETTI_COLORS.map((color, i) => (
                <motion.span
                  key={color}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  animate={{
                    opacity: 0,
                    x: (i % 2 === 0 ? 1 : -1) * (10 + i * 4),
                    y: -18 - i * 4,
                    scale: 0.5,
                  }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.03 }}
                  className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
