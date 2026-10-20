"use client";

import { motion } from "framer-motion";
import { HabitCard } from "@/components/dashboard/HabitCard";
import type { Habit } from "@/types/dashboard";

interface HabitListProps {
  habits: Habit[];
  onToggle: (id: string) => void;
}

export function HabitList({ habits, onToggle }: HabitListProps) {
  const completedCount = habits.filter((h) => h.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
      className="rounded-[2rem] border border-black/5 bg-white/70 p-5 shadow-[0_20px_50px_-30px_rgba(38,54,58,0.22)] backdrop-blur-sm sm:p-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-bloom-text">
          Today&apos;s Habits
        </h2>
        <span className="rounded-full bg-bloom-accent/10 px-3 py-1 text-xs font-medium text-bloom-accent-dark">
          {completedCount} of {habits.length} done
        </span>
      </div>

      <ul className="mt-4 flex list-none flex-col gap-2.5 p-0">
        {habits.map((habit) => (
          <li key={habit.id}>
            <HabitCard habit={habit} onToggle={onToggle} />
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
