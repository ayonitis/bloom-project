"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useMousePosition } from "@/hooks/useMousePosition";
import { GardenSpirit } from "@/components/scene/GardenSpirit";
import { SpeechBubble } from "@/components/scene/SpeechBubble";

interface EmptyStateProps {
  onCreateHabit: () => void;
  isFiltered?: boolean;
}

export function EmptyState({ onCreateHabit, isFiltered = false }: EmptyStateProps) {
  const mouse = useMousePosition();

  if (isFiltered) {
    return (
      <div className="flex flex-col items-center rounded-[2rem] border border-black/5 bg-white/70 px-6 py-16 text-center shadow-[0_20px_50px_-30px_rgba(38,54,58,0.22)] backdrop-blur-sm">
        <p className="font-[family-name:var(--font-heading)] text-lg font-semibold text-bloom-text">
          Nothing matches yet
        </p>
        <p className="mt-2 max-w-xs text-sm text-bloom-muted">
          Try a different search or clear a filter to see more of your garden.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center rounded-[2rem] border border-black/5 bg-white/70 px-6 py-14 text-center shadow-[0_20px_50px_-30px_rgba(38,54,58,0.22)] backdrop-blur-sm"
    >
      <SpeechBubble message="Let's plant your very first habit." />
      <div className="mt-2">
        <GardenSpirit mouse={mouse} isCtaHovered />
      </div>

      <p className="mx-auto mt-6 max-w-sm text-balance text-bloom-muted">
        Every habit you plant here grows into something real — a streak, a
        little more XP, a plant that only exists because you kept showing up.
      </p>

      <motion.button
        type="button"
        onClick={onCreateHabit}
        whileHover={{ y: -3 }}
        whileTap={{ y: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="focus-ring mt-7 inline-flex items-center gap-2 rounded-full bg-bloom-primary px-7 py-3.5 font-[family-name:var(--font-heading)] text-[15px] font-medium text-white shadow-[0_8px_24px_-8px_rgba(245,166,35,0.55)] transition-shadow duration-300 hover:shadow-[0_14px_32px_-8px_rgba(245,166,35,0.7)]"
      >
        <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
        Plant Your First Habit
      </motion.button>
    </motion.div>
  );
}
