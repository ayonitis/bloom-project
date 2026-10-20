"use client";

import { motion } from "framer-motion";
import { GardenSpiritCard } from "@/components/onboarding/GardenSpiritCard";
import { PrimaryButton } from "@/components/onboarding/PrimaryButton";

interface MeetSpiritStepProps {
  name: string;
  onNext: () => void;
}

export function MeetSpiritStep({ name, onNext }: MeetSpiritStepProps) {
  const displayName = name.trim() || "friend";

  return (
    <div className="flex flex-col items-center text-center">
      <GardenSpiritCard
        message={`Hello ${displayName}. I'm excited to grow with you.`}
        isHappy
      />

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
        className="mx-auto mt-6 max-w-sm text-balance text-bloom-muted"
      >
        This little spirit grows alongside your habits. The more you tend
        your garden, the more of this world comes alive.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6, ease: "easeOut" }}
        className="mt-8"
      >
        <PrimaryButton onClick={onNext}>Continue</PrimaryButton>
      </motion.div>
    </div>
  );
}
