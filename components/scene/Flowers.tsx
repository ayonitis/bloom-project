"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import type { Point } from "@/types";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface FlowerConfig {
  id: number;
  left: string;
  scale: number;
  petals: string;
  center: string;
  swayDelay: number;
}

const FLOWERS: FlowerConfig[] = [
  { id: 1, left: "8%", scale: 0.9, petals: "#F5A623", center: "#FFF3D6", swayDelay: 0 },
  { id: 2, left: "18%", scale: 0.65, petals: "#5AA9FF", center: "#FFFFFF", swayDelay: 0.5 },
  { id: 3, left: "30%", scale: 1, petals: "#FF9E7D", center: "#FFF3D6", swayDelay: 0.2 },
  { id: 4, left: "70%", scale: 0.8, petals: "#5AA9FF", center: "#FFFFFF", swayDelay: 0.7 },
  { id: 5, left: "83%", scale: 1.05, petals: "#F5A623", center: "#FFF3D6", swayDelay: 0.3 },
  { id: 6, left: "92%", scale: 0.7, petals: "#FF9E7D", center: "#FFFFFF", swayDelay: 0.1 },
];

function FlowerShape({ petals, center }: { petals: string; center: string }) {
  return (
    <svg width="44" height="70" viewBox="0 0 44 70" fill="none">
      <rect x="20" y="30" width="4" height="40" rx="2" fill="#3BB273" />
      <path d="M22 32 Q10 26 8 36" stroke="#3BB273" strokeWidth="3" strokeLinecap="round" fill="none" />
      <g transform="translate(22,18)">
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse
            key={angle}
            cx="0"
            cy="-9"
            rx="6"
            ry="10"
            fill={petals}
            transform={`rotate(${angle})`}
          />
        ))}
        <circle r="6" fill={center} />
      </g>
    </svg>
  );
}

export function Flowers({ mouse }: { mouse: Point }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const leanX = useMemo(() => mouse.x * 6, [mouse.x]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[10%] -z-0 h-[22%]" aria-hidden>
      {FLOWERS.map((flower) => (
        <motion.div
          key={flower.id}
          className="absolute bottom-0 origin-bottom"
          style={{ left: flower.left, transform: `scale(${flower.scale})` }}
          animate={
            prefersReducedMotion
              ? undefined
              : { rotate: [leanX - 3, leanX + 3, leanX - 3] }
          }
          transition={{
            rotate: {
              duration: 3.5,
              delay: flower.swayDelay,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <FlowerShape petals={flower.petals} center={flower.center} />
        </motion.div>
      ))}
    </div>
  );
}
