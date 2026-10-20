"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SEASON_PALETTES } from "@/lib/gardenEngine";
import type { Season, Weather } from "@/types/garden";

interface AmbientEffectsProps {
  season: Season;
  weather: Weather;
}

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  drift: number;
}

function useParticles(count: number, seedOffset: number): Particle[] {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: seedOffset + i,
        left: ((i * 37 + seedOffset * 13) % 100),
        delay: (i % 7) * 0.6,
        duration: 6 + (i % 5),
        drift: ((i % 3) - 1) * 20,
      })),
    [count, seedOffset]
  );
}

function AmbientEffectsComponent({ season, weather }: AmbientEffectsProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const palette = SEASON_PALETTES[season];
  const seasonParticles = useParticles(10, 1);
  const rainDrops = useParticles(28, 2);
  const fireflies = useParticles(9, 3);
  const butterflies = useParticles(2, 4);
  const isDaytime = weather !== "night";

  if (prefersReducedMotion) {
    // Respect the user's preference — a still, ambient-free garden.
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Butterflies: drift diagonally across the garden in daylight. */}
      {isDaytime &&
        butterflies.map((butterfly) => (
          <motion.span
            key={`butterfly-${butterfly.id}`}
            className="absolute block h-1.5 w-2 rounded-full"
            style={{ top: `${15 + butterfly.id * 22}%`, background: butterfly.id % 2 ? "#F5A623" : "#7CC3FF" }}
            animate={{
              left: ["-4%", "104%"],
              top: [`${15 + butterfly.id * 22}%`, `${25 + butterfly.id * 18}%`, `${12 + butterfly.id * 20}%`],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 22 + butterfly.id * 6,
              delay: butterfly.delay * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

      {/* A bird occasionally glides through and lands briefly. */}
      {isDaytime && (
        <motion.span
          className="absolute h-1 w-2.5 rounded-full bg-bloom-text/60"
          style={{ top: "18%" }}
          animate={{ left: ["-6%", "40%", "40%", "106%"] }}
          transition={{ duration: 16, times: [0, 0.4, 0.75, 1], repeat: Infinity, repeatDelay: 6, ease: "easeInOut" }}
        />
      )}
      {/* Seasonal falling particles: petals, pollen, leaves, or snow. */}
      {seasonParticles.map((particle) => (
        <motion.span
          key={`season-${particle.id}`}
          className="absolute top-0 block rounded-full"
          style={{
            left: `${particle.left}%`,
            width: palette.particle === "leaf" ? 6 : 4,
            height: palette.particle === "leaf" ? 6 : 4,
            background: palette.particleColor,
            opacity: 0.7,
          }}
          animate={{
            y: ["0%", "320%"],
            x: [0, particle.drift, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Rain: gently "waters" the garden. */}
      {weather === "rain" &&
        rainDrops.map((drop) => (
          <motion.span
            key={`rain-${drop.id}`}
            className="absolute top-0 block w-px rounded-full bg-white/50"
            style={{ left: `${drop.left}%`, height: 14 }}
            animate={{ y: ["0%", "480%"], opacity: [0, 0.6, 0] }}
            transition={{
              duration: 0.9 + (drop.id % 3) * 0.15,
              delay: drop.delay * 0.15,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

      {/* Night: fireflies drifting over the beds. */}
      {weather === "night" &&
        fireflies.map((fly) => (
          <motion.span
            key={`firefly-${fly.id}`}
            className="absolute block h-1.5 w-1.5 rounded-full bg-amber-200"
            style={{ left: `${fly.left}%`, top: `${20 + (fly.id % 5) * 14}%`, boxShadow: "0 0 6px 2px rgba(255,220,130,0.8)" }}
            animate={{
              x: [0, 18, -12, 0],
              y: [0, -14, 10, 0],
              opacity: [0.2, 1, 0.2],
            }}
            transition={{ duration: 4 + (fly.id % 4), delay: fly.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

      {/* Cloudy: soft drifting cloud shadows. */}
      {weather === "cloudy" && (
        <motion.div
          className="absolute -top-6 h-24 w-40 rounded-full bg-black/5 blur-2xl"
          animate={{ x: ["-20%", "120%"] }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Night overlay: dims the scene. */}
      {weather === "night" && <div className="absolute inset-0 bg-[#1a2436]/25" />}
    </div>
  );
}

export const AmbientEffects = memo(AmbientEffectsComponent);
