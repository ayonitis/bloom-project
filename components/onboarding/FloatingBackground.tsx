"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { FloatingDust } from "@/components/shared/FloatingDust";

function useLeaves(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: 6 + ((i * 41) % 88),
        delay: (i % 5) * 2.4,
        duration: 16 + (i % 6) * 3,
        scale: 0.6 + ((i * 7) % 5) * 0.1,
        hue: i % 2 === 0 ? "#3BB273" : "#F5A623",
      })),
    [count]
  );
}

function LeafShape({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M9 1c6 2 9 7 7 14C9 17 2 13 1 7 3 3 6 1 9 1Z"
        fill={color}
        opacity="0.55"
      />
    </svg>
  );
}

export function FloatingBackground() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const leaves = useLeaves(7);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bloom-bg" aria-hidden>
      {/* Base wash — same warm gradient family as the landing hero */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(255,224,169,0.55) 0%, rgba(255,253,248,0) 60%), radial-gradient(55% 45% at 85% 90%, rgba(90,169,255,0.18) 0%, rgba(255,253,248,0) 70%), radial-gradient(55% 45% at 10% 85%, rgba(59,178,115,0.16) 0%, rgba(255,253,248,0) 70%)",
        }}
      />

      {/* Light rays */}
      <div className="absolute inset-x-0 top-0 h-full opacity-40">
        <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMin slice">
          <g opacity="0.35">
            <polygon points="620,-40 760,-40 900,900 480,900" fill="#FFE3B3" opacity="0.5" />
            <polygon points="780,-40 880,-40 1020,900 700,900" fill="#FFEFD6" opacity="0.4" />
          </g>
        </svg>
      </div>

      {/* Drifting leaves */}
      {!prefersReducedMotion &&
        leaves.map((leaf) => (
          <motion.div
            key={leaf.id}
            className="absolute top-0"
            style={{ left: `${leaf.left}%`, transform: `scale(${leaf.scale})` }}
            initial={{ y: "-8vh", rotate: 0, opacity: 0 }}
            animate={{
              y: "108vh",
              rotate: [0, 40, -30, 20, 0],
              opacity: [0, 0.8, 0.8, 0],
            }}
            transition={{
              duration: leaf.duration,
              delay: leaf.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <LeafShape color={leaf.hue} />
          </motion.div>
        ))}

      {/* Floating pollen */}
      <FloatingDust count={16} colorClassName="bg-bloom-primary/40" driftX={0} driftY={-18} />
    </div>
  );
}
