"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkle } from "lucide-react";

const CONFETTI_COLORS = ["#F5A623", "#5AA9FF", "#3BB273", "#FF9E7D"];

interface CompletionAnimationProps {
  active: boolean;
  xpReward: number;
}

/** Purely decorative — pointer-events-none so it never blocks the checkbox underneath. */
export function CompletionAnimation({ active, xpReward }: CompletionAnimationProps) {
  return (
    <AnimatePresence>
      {active && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <motion.span
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -28, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap font-[family-name:var(--font-heading)] text-xs font-semibold text-bloom-accent-dark"
          >
            +{xpReward} XP
          </motion.span>
          <motion.span
            initial={{ opacity: 1, scale: 0.4, rotate: 0 }}
            animate={{ opacity: 0, scale: 1.4, rotate: 25 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute -right-1.5 -top-1.5 text-bloom-primary"
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
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
