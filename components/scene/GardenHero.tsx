"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useMousePosition } from "@/hooks/useMousePosition";
import { SkyBackground } from "@/components/scene/SkyBackground";
import { Clouds } from "@/components/scene/Clouds";
import { Mountains } from "@/components/scene/Mountains";
import { Trees } from "@/components/scene/Trees";
import { Flowers } from "@/components/scene/Flowers";
import { Grass } from "@/components/scene/Grass";
import { Butterflies } from "@/components/scene/Butterflies";
import { Pollen } from "@/components/scene/Pollen";
import { GardenSpirit } from "@/components/scene/GardenSpirit";
import { SpeechBubble } from "@/components/scene/SpeechBubble";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function GardenHero() {
  const mouse = useMousePosition();
  const [isCtaHovered, setIsCtaHovered] = useState(false);

  return (
    <section
      id="top"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden pt-24"
    >
      <SkyBackground />
      <Clouds />
      <Mountains />
      <Trees />
      <Butterflies />
      <Pollen />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <SpeechBubble />

        <div className="mt-2">
          <GardenSpirit mouse={mouse} isCtaHovered={isCtaHovered} />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="mt-4 max-w-2xl text-balance font-[family-name:var(--font-heading)] text-4xl font-semibold leading-tight text-bloom-text sm:text-5xl md:text-6xl"
        >
          Grow Better Habits.
          <br />
          Watch Your Garden Bloom.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-5 max-w-lg text-balance text-base text-bloom-muted sm:text-lg"
        >
          Complete small daily habits and transform an empty garden into a
          beautiful world you&apos;ll actually want to come back to.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <div
            onMouseEnter={() => setIsCtaHovered(true)}
            onMouseLeave={() => setIsCtaHovered(false)}
          >
            <ButtonLink href="/onboarding" variant="primary">
              Start Growing
            </ButtonLink>
          </div>
          <Button variant="secondary">Login</Button>
        </motion.div>
      </div>

      <Grass />
      <Flowers mouse={mouse} />

      <motion.div
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-bloom-text/40"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <ChevronDown className="h-5 w-5" />
      </motion.div>
    </section>
  );
}
