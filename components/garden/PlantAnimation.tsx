"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { GrowthStage } from "@/types/garden";

const STAGE_SCALE: Record<GrowthStage, number> = {
  seed: 0.55,
  sprout: 0.68,
  youngPlant: 0.8,
  growingPlant: 0.92,
  blooming: 1.02,
  mature: 1.1,
  legendary: 1.2,
};

const STAGE_GLOW: Record<GrowthStage, number> = {
  seed: 0,
  sprout: 0,
  youngPlant: 0.08,
  growingPlant: 0.14,
  blooming: 0.24,
  mature: 0.3,
  legendary: 0.45,
};

interface PlantAnimationProps {
  stage: GrowthStage;
  isCelebrating?: boolean;
  children: ReactNode;
}

/** Wraps a rendered plant with stage-appropriate scale + glow, and animates
 *  smoothly whenever the growth stage itself changes (the "evolution"). */
export function PlantAnimation({ stage, isCelebrating, children }: PlantAnimationProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const glow = STAGE_GLOW[stage];

  return (
    <div className="relative flex h-full w-full items-end justify-center">
      {glow > 0 && (
        <div
          className="pointer-events-none absolute inset-0 rounded-full blur-md"
          style={{ background: `radial-gradient(circle, rgba(245,166,35,${glow}) 0%, transparent 70%)` }}
          aria-hidden
        />
      )}

      <motion.div
        key={stage}
        initial={prefersReducedMotion ? undefined : { scale: STAGE_SCALE[stage] * 0.85, opacity: 0.5 }}
        animate={{ scale: STAGE_SCALE[stage], opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        style={{ transformOrigin: "bottom center" }}
        className="relative"
      >
        {children}

        {stage === "legendary" && !prefersReducedMotion && (
          <motion.div
            className="pointer-events-none absolute -inset-2 rounded-full"
            animate={{ opacity: [0.15, 0.5, 0.15] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ boxShadow: "0 0 18px 4px rgba(245,166,35,0.5)" }}
            aria-hidden
          />
        )}
      </motion.div>

      <AnimatePresence>
        {isCelebrating && !prefersReducedMotion && (
          <motion.div
            className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-bloom-accent-dark"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: -10 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          >
            ✦ Grew!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
