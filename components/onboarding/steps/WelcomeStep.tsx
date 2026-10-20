"use client";

import { motion } from "framer-motion";
import { useMousePosition } from "@/hooks/useMousePosition";
import { GardenSpirit } from "@/components/scene/GardenSpirit";
import { SpeechBubble } from "@/components/scene/SpeechBubble";
import { PrimaryButton } from "@/components/onboarding/PrimaryButton";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const mouse = useMousePosition();

  return (
    <div className="flex flex-col items-center text-center">
      <SpeechBubble />
      <div className="mt-2">
        <GardenSpirit mouse={mouse} isCtaHovered={false} />
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
        className="mt-6 text-balance font-[family-name:var(--font-heading)] text-3xl font-semibold text-bloom-text sm:text-4xl"
      >
        Welcome to your garden.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        className="mx-auto mt-3 max-w-sm text-balance text-bloom-muted"
      >
        It&apos;s empty right now, but that&apos;s the whole point. Everything
        you plant here starts today, with you.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
        className="mt-8"
      >
        <PrimaryButton onClick={onNext}>Begin</PrimaryButton>
      </motion.div>
    </div>
  );
}
