"use client";

import { motion } from "framer-motion";
import { useMousePosition } from "@/hooks/useMousePosition";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { GardenSpirit } from "@/components/scene/GardenSpirit";
import { SpeechBubble } from "@/components/scene/SpeechBubble";
import { ButtonLink } from "@/components/ui/ButtonLink";

function TinySprout() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <svg width="90" height="90" viewBox="0 0 90 90" aria-hidden>
      <ellipse cx="45" cy="76" rx="32" ry="8" fill="#2C9560" opacity="0.25" />
      <motion.g
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{
          delay: prefersReducedMotion ? 0 : 0.6,
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ transformOrigin: "45px 76px" }}
      >
        <rect x="43" y="46" width="4" height="30" rx="2" fill="#3BB273" />
        <path d="M45 54 C32 50 26 38 30 28 C42 30 48 42 45 54 Z" fill="#3BB273" />
        <path d="M45 58 C58 55 65 44 62 34 C49 35 43 47 45 58 Z" fill="#4FC788" />
      </motion.g>
      <motion.circle
        cx="45"
        cy="30"
        r="5"
        fill="#F5A623"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0.6], scale: [0, 1.3, 1] }}
        transition={{ delay: prefersReducedMotion ? 0 : 1.4, duration: 0.6 }}
      />
    </svg>
  );
}

export function FinalStep() {
  const mouse = useMousePosition();

  return (
    <div className="flex flex-col items-center text-center">
      <SpeechBubble message="I planted it myself. Watch what you grow from here." />

      <div className="mt-2 flex items-end gap-4">
        <GardenSpirit mouse={mouse} isCtaHovered />
        <div className="mb-1">
          <TinySprout />
        </div>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.6, ease: "easeOut" }}
        className="mt-6 text-balance font-[family-name:var(--font-heading)] text-3xl font-semibold text-bloom-text sm:text-4xl"
      >
        Your journey begins today.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.85, duration: 0.6, ease: "easeOut" }}
        className="mx-auto mt-3 max-w-sm text-balance text-bloom-muted"
      >
        One seed is in the ground. Everything you do from here helps it
        grow.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6, ease: "easeOut" }}
        className="mt-8"
      >
        <ButtonLink href="/dashboard">Enter Garden</ButtonLink>
      </motion.div>
    </div>
  );
}
