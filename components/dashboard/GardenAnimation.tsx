"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

function BirdShape() {
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden>
      <path
        d="M1 7 C4 2 8 2 11 6 C14 2 18 2 21 7"
        stroke="#263238"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
    </svg>
  );
}

function GardenAnimationComponent() {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Cloud shadows drifting across the garden */}
      <motion.div
        className="absolute h-24 w-40 rounded-full bg-bloom-text/5 blur-2xl"
        style={{ top: "10%" }}
        initial={{ x: "-20%" }}
        animate={{ x: "120%" }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute h-16 w-28 rounded-full bg-bloom-text/5 blur-2xl"
        style={{ top: "55%" }}
        initial={{ x: "-20%" }}
        animate={{ x: "120%" }}
        transition={{ duration: 34, repeat: Infinity, ease: "linear", delay: 6 }}
      />

      {/* Birds crossing occasionally */}
      <motion.div
        className="absolute"
        style={{ top: "16%" }}
        initial={{ x: "-10%", y: 0 }}
        animate={{ x: "115%", y: [0, -10, 4, 0] }}
        transition={{ duration: 9, repeat: Infinity, repeatDelay: 14, ease: "easeInOut" }}
      >
        <BirdShape />
      </motion.div>
      <motion.div
        className="absolute"
        style={{ top: "24%" }}
        initial={{ x: "-6%", y: 0 }}
        animate={{ x: "112%", y: [0, -6, 2, 0] }}
        transition={{ duration: 9, repeat: Infinity, repeatDelay: 14, delay: 0.6, ease: "easeInOut" }}
      >
        <BirdShape />
      </motion.div>
    </div>
  );
}

export const GardenAnimation = memo(GardenAnimationComponent);
