"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ButterflyShape } from "@/components/shared/ButterflyShape";

interface ButterflyConfig {
  id: number;
  top: string;
  color: string;
  duration: number;
  delay: number;
}

const BUTTERFLIES: ButterflyConfig[] = [
  { id: 1, top: "20%", color: "#F5A623", duration: 16, delay: 1 },
  { id: 2, top: "62%", color: "#5AA9FF", duration: 20, delay: 7 },
];

// Percentage-based motion (not vw/vh) since this layer is scoped to the
// garden card's bounds, not the viewport.
function GardenButterfliesComponent() {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {BUTTERFLIES.map((butterfly) => (
        <motion.div
          key={butterfly.id}
          className="absolute left-0"
          style={{ top: butterfly.top }}
          initial={{ x: "-8%", y: 0 }}
          animate={{ x: "108%", y: [0, -16, 6, -10, 0] }}
          transition={{
            duration: butterfly.duration,
            delay: butterfly.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ButterflyShape color={butterfly.color} width={18} height={14} />
        </motion.div>
      ))}
    </div>
  );
}

export const GardenButterflies = memo(GardenButterfliesComponent);
