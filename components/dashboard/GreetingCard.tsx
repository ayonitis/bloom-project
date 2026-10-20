"use client";

import { motion } from "framer-motion";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import type { TimeOfDay } from "@/types";

const GREETINGS: Record<TimeOfDay, { text: string; emoji: string }> = {
  morning: { text: "Good Morning", emoji: "🌤️" },
  afternoon: { text: "Good Afternoon", emoji: "☀️" },
  evening: { text: "Good Evening", emoji: "🌇" },
  night: { text: "Good Night", emoji: "🌙" },
};

export function GreetingCard({ name }: { name: string }) {
  const sky = useTimeOfDay();
  const greeting = GREETINGS[sky.label];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <h1 className="text-balance font-[family-name:var(--font-heading)] text-2xl font-semibold text-bloom-text sm:text-3xl">
        {greeting.text}, {name} <span aria-hidden>{greeting.emoji}</span>
      </h1>
      <p className="mt-1 text-sm text-bloom-muted sm:text-base">
        Welcome back. Your garden missed you.
      </p>
    </motion.div>
  );
}
