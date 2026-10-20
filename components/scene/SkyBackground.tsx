"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

function useStars(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: (i * 37) % 100,
        top: ((i * 53) % 60) + 2,
        delay: (i % 10) * 0.35,
        size: 1 + (i % 3),
      })),
    [count]
  );
}

function useFireflies(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: 10 + ((i * 61) % 80),
        top: 40 + ((i * 29) % 45),
        delay: (i % 6) * 0.6,
        duration: 6 + (i % 4),
      })),
    [count]
  );
}

export function SkyBackground() {
  const sky = useTimeOfDay();
  const prefersReducedMotion = usePrefersReducedMotion();
  const stars = useStars(40);
  const fireflies = useFireflies(10);

  return (
    <div className="absolute inset-0 -z-30 overflow-hidden" aria-hidden>
      {/* Cross-fades between time-of-day palettes via opacity only — cheap,
          GPU-composited, and (unlike animating the `background` shorthand
          directly) actually interpolates instead of snapping instantly. */}
      <AnimatePresence>
        <motion.div
          key={sky.label}
          className="absolute inset-0"
          style={{ background: sky.gradient }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
      </AnimatePresence>

      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 8%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)",
        }}
      />

      {sky.showStars && (
        <div className="absolute inset-0 transition-opacity duration-1000">
          {stars.map((star) => (
            <span
              key={star.id}
              className={prefersReducedMotion ? "absolute rounded-full bg-white/80" : "absolute rounded-full bg-white/80 animate-twinkle"}
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: star.size,
                height: star.size,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {sky.showFireflies && !prefersReducedMotion && (
        <div className="absolute inset-0">
          {fireflies.map((fly) => (
            <motion.span
              key={fly.id}
              className="absolute h-1.5 w-1.5 rounded-full bg-bloom-primary shadow-[0_0_8px_3px_rgba(245,166,35,0.55)]"
              style={{ left: `${fly.left}%`, top: `${fly.top}%` }}
              animate={{
                x: [0, 18, -12, 6, 0],
                y: [0, -14, 10, -6, 0],
                opacity: [0.2, 1, 0.5, 1, 0.2],
              }}
              transition={{
                duration: fly.duration,
                delay: fly.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
