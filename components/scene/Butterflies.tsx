"use client";

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
  { id: 1, top: "38%", color: "#F5A623", duration: 22, delay: 2 },
  { id: 2, top: "52%", color: "#5AA9FF", duration: 26, delay: 10 },
];

export function Butterflies() {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden" aria-hidden>
      {BUTTERFLIES.map((butterfly) => (
        <motion.div
          key={butterfly.id}
          className="absolute left-0"
          style={{ top: butterfly.top }}
          initial={{ x: "-10vw", y: 0 }}
          animate={{
            x: "110vw",
            y: [0, -30, 10, -20, 0],
          }}
          transition={{
            duration: butterfly.duration,
            delay: butterfly.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ButterflyShape color={butterfly.color} />
        </motion.div>
      ))}
    </div>
  );
}
