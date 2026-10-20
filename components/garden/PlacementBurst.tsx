"use client";

import { motion } from "framer-motion";

const SPARKLES = [
  { x: -14, y: -10, delay: 0 },
  { x: 12, y: -14, delay: 0.05 },
  { x: -10, y: 10, delay: 0.1 },
  { x: 14, y: 8, delay: 0.08 },
  { x: 0, y: -16, delay: 0.03 },
];

/** Purely decorative — safe to render unconditionally when triggered since
 *  it's a short, self-contained one-shot animation. */
export function PlacementBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      <motion.div
        className="absolute h-6 w-6 rounded-full bg-bloom-accent/30"
        initial={{ scale: 0.2, opacity: 0.6 }}
        animate={{ scale: 2.2, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      {SPARKLES.map((sparkle, index) => (
        <motion.span
          key={index}
          className="absolute text-[10px]"
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
          animate={{ x: sparkle.x, y: sparkle.y, opacity: [0, 1, 0], scale: 1 }}
          transition={{ duration: 0.55, delay: sparkle.delay, ease: "easeOut" }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  );
}
