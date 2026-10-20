"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

interface FloatingDustProps {
  count?: number;
  colorClassName?: string;
  driftX?: number;
  driftY?: number;
  /** Wrapper positioning — override when the parent isn't already `relative`/`absolute`. */
  className?: string;
}

function FloatingDustComponent({
  count = 16,
  colorClassName = "bg-white/70",
  driftX = 10,
  driftY = -18,
  className,
}: FloatingDustProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: (i * 43) % 100,
        top: 10 + ((i * 31) % 80),
        size: 2 + (i % 3),
        duration: 8 + (i % 8),
        delay: (i % 7) * 0.5,
      })),
    [count]
  );

  if (prefersReducedMotion) return null;

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className={cn("absolute rounded-full", colorClassName)}
          style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
          animate={{
            y: [0, driftY, 0],
            x: driftX ? [0, driftX, 0] : undefined,
            opacity: [0.15, 0.6, 0.15],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export const FloatingDust = memo(FloatingDustComponent);
