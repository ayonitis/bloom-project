"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface TreeConfig {
  id: number;
  left: string;
  scale: number;
  hue: string;
  delay: number;
}

const TREES: TreeConfig[] = [
  { id: 1, left: "4%", scale: 0.85, hue: "#2C9560", delay: 0 },
  { id: 2, left: "14%", scale: 1.1, hue: "#3BB273", delay: 0.4 },
  { id: 3, left: "82%", scale: 1.2, hue: "#2C9560", delay: 0.2 },
  { id: 4, left: "92%", scale: 0.8, hue: "#3BB273", delay: 0.6 },
];

function TreeShape({ hue }: { hue: string }) {
  return (
    <svg width="90" height="130" viewBox="0 0 90 130" fill="none">
      <rect x="40" y="80" width="10" height="50" rx="4" fill="#8A6448" />
      <circle cx="45" cy="55" r="42" fill={hue} opacity="0.9" />
      <circle cx="24" cy="72" r="26" fill={hue} opacity="0.85" />
      <circle cx="66" cy="70" r="28" fill={hue} opacity="0.85" />
    </svg>
  );
}

function TreesComponent() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[16%] -z-10 h-[36%]" aria-hidden>
      {TREES.map((tree) => (
        <motion.div
          key={tree.id}
          className="absolute bottom-0 origin-bottom"
          style={{ left: tree.left, transform: `scale(${tree.scale})` }}
          animate={prefersReducedMotion ? undefined : { rotate: [-1.5, 1.5, -1.5] }}
          transition={{
            duration: 7,
            delay: tree.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <TreeShape hue={tree.hue} />
        </motion.div>
      ))}
    </div>
  );
}

export const Trees = memo(TreesComponent);
