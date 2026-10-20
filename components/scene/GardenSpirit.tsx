"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Point } from "@/types";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface GardenSpiritProps {
  mouse: Point;
  isCtaHovered: boolean;
}

type Expression = "idle" | "surprised" | "happy";

export function GardenSpirit({ mouse, isCtaHovered }: GardenSpiritProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [expression, setExpression] = useState<Expression>("idle");
  const [isBlinking, setIsBlinking] = useState(false);
  const bodyControls = useAnimationControls();

  // Pupils track the cursor within a small, believable range.
  const pupil = useMemo(
    () => ({ x: mouse.x * 3.2, y: mouse.y * 2.4 }),
    [mouse.x, mouse.y]
  );
  const headTilt = useMemo(() => mouse.x * 5, [mouse.x]);

  // Periodic blink.
  useEffect(() => {
    if (prefersReducedMotion) return;
    let cancelled = false;

    function scheduleBlink() {
      const delay = 2400 + Math.random() * 2600;
      const timeout = window.setTimeout(() => {
        if (cancelled) return;
        setIsBlinking(true);
        window.setTimeout(() => {
          if (!cancelled) setIsBlinking(false);
        }, 140);
        scheduleBlink();
      }, delay);
      return timeout;
    }

    const timeout = scheduleBlink();
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [prefersReducedMotion]);

  // Occasional wave, only when idle.
  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = window.setInterval(() => {
      bodyControls.start({ rotate: [0, -4, 3, -2, 0] });
    }, 9000);
    return () => window.clearInterval(interval);
  }, [bodyControls, prefersReducedMotion]);

  useEffect(() => {
    setExpression(isCtaHovered ? "happy" : "idle");
  }, [isCtaHovered]);

  const handleClick = useCallback(() => {
    setExpression("surprised");
    window.setTimeout(() => setExpression("idle"), 900);
  }, []);

  const eyeScaleY = isBlinking ? 0.1 : expression === "surprised" ? 1.3 : 1;

  return (
    <div className="relative flex items-center justify-center">
      {/* Soft glow */}
      <div
        className="absolute h-40 w-40 rounded-full bg-bloom-primary/40 blur-3xl animate-pulse-glow"
        aria-hidden
      />

      <motion.button
        type="button"
        onClick={handleClick}
        aria-label="Say hello to the Garden Spirit"
        className="focus-ring relative cursor-pointer rounded-full"
        animate={
          prefersReducedMotion
            ? undefined
            : { y: [0, -10, 0] }
        }
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          style={{ rotate: prefersReducedMotion ? 0 : headTilt }}
          animate={bodyControls}
        >
          {/* leaf arms */}
          <motion.path
            d="M60 118 C36 118 26 100 34 84"
            stroke="#3BB273"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
            animate={
              expression === "happy" && !prefersReducedMotion
                ? { d: ["M60 118 C36 118 26 100 34 84", "M60 118 C30 108 18 86 30 68", "M60 118 C36 118 26 100 34 84"] }
                : undefined
            }
            transition={{ duration: 1.1, repeat: expression === "happy" ? Infinity : 0, ease: "easeInOut" }}
          />
          <motion.path
            d="M120 118 C144 118 154 100 146 84"
            stroke="#3BB273"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
            animate={
              expression === "happy" && !prefersReducedMotion
                ? { d: ["M120 118 C144 118 154 100 146 84", "M120 118 C150 108 162 86 150 68", "M120 118 C144 118 154 100 146 84"] }
                : undefined
            }
            transition={{ duration: 1.1, repeat: expression === "happy" ? Infinity : 0, ease: "easeInOut" }}
          />

          {/* body */}
          <motion.g
            animate={prefersReducedMotion ? undefined : { scaleY: [1, 1.03, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "90px 130px" }}
          >
            <ellipse cx="90" cy="112" rx="52" ry="48" fill="#3BB273" />
            <ellipse cx="90" cy="128" rx="36" ry="28" fill="#4FC788" opacity="0.7" />
          </motion.g>

          {/* sprout leaf on head */}
          <path d="M90 62 C78 40 92 24 108 30 C104 48 100 58 90 62 Z" fill="#2C9560" />
          <path d="M90 62 C90 44 76 32 62 36 C68 52 76 60 90 62 Z" fill="#3BB273" />

          {/* face */}
          <g>
            {/* eyes */}
            <motion.ellipse
              cx={78 + pupil.x}
              cy={104 + pupil.y}
              rx="9"
              ry={9 * eyeScaleY}
              fill="#263238"
            />
            <motion.ellipse
              cx={102 + pupil.x}
              cy={104 + pupil.y}
              rx="9"
              ry={9 * eyeScaleY}
              fill="#263238"
            />
            <circle cx={81 + pupil.x} cy={101 + pupil.y} r="2.2" fill="white" opacity="0.9" />
            <circle cx={105 + pupil.x} cy={101 + pupil.y} r="2.2" fill="white" opacity="0.9" />

            {/* mouth */}
            {expression === "surprised" ? (
              <circle cx="90" cy="122" r="6" fill="#263238" />
            ) : expression === "happy" ? (
              <path
                d="M76 120 Q90 134 104 120"
                stroke="#263238"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <path
                d="M80 120 Q90 127 100 120"
                stroke="#263238"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            )}

            {/* blush */}
            <ellipse cx="66" cy="114" rx="6" ry="3.5" fill="#F5A623" opacity="0.35" />
            <ellipse cx="114" cy="114" rx="6" ry="3.5" fill="#F5A623" opacity="0.35" />
          </g>
        </motion.svg>
      </motion.button>
    </div>
  );
}
