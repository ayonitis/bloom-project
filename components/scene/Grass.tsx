"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function Grass() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const blades = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: (i / 26) * 100 + (i % 2 === 0 ? 1.5 : -1),
        height: 34 + ((i * 13) % 26),
        delay: (i % 6) * 0.15,
      })),
    []
  );

  return (
    <div className="absolute inset-x-0 bottom-0 -z-0 h-[18%] overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-t from-bloom-accent/90 via-bloom-accent/70 to-transparent" />
      <svg
        className="absolute inset-x-0 bottom-0 h-full w-full"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
      >
        {blades.map((blade) => {
          const x = blade.left * 14.4;
          const baseY = 160;
          const tipY = 160 - blade.height;
          // A single static curve, swayed with a `rotate` transform around
          // its base rather than animating the `d` attribute — transforms
          // are GPU-composited, so 26 concurrent blades stay cheap where
          // morphing 26 path strings every frame would not.
          return (
            <motion.g
              key={blade.id}
              style={{ transformOrigin: `${x}px ${baseY}px` }}
              animate={
                prefersReducedMotion
                  ? undefined
                  : { rotate: [-4, 4, -4] }
              }
              transition={{
                duration: 4,
                delay: blade.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <path
                d={`M ${x} ${baseY} Q ${x - 6} ${160 - blade.height * 0.6} ${x} ${tipY}`}
                stroke="#2C9560"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
