"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { GARDEN_GRID_COLUMNS, GARDEN_GRID_ROWS } from "@/lib/gardenEngine";
import type { GardenLevelUpEvent } from "@/hooks/useGarden";
import type { Weather } from "@/types/garden";

type SpiritBehavior = "walk" | "water" | "wave" | "sit" | "look" | "inspect" | "celebrate" | "sleep";

interface GardenSpiritWalkerProps {
  plantTileIndexes: number[];
  levelUpEvent: GardenLevelUpEvent | null;
  weather: Weather;
}

function tileCenter(index: number): { xPercent: number; yPercent: number } {
  const x = index % GARDEN_GRID_COLUMNS;
  const y = Math.floor(index / GARDEN_GRID_COLUMNS);
  return {
    xPercent: ((x + 0.5) / GARDEN_GRID_COLUMNS) * 100,
    yPercent: ((y + 0.5) / GARDEN_GRID_ROWS) * 100,
  };
}

const IDLE_BEHAVIORS: SpiritBehavior[] = ["water", "wave", "sit", "look", "inspect"];
const SLEEP_TILE = Math.floor((GARDEN_GRID_COLUMNS * GARDEN_GRID_ROWS) / 2) + GARDEN_GRID_COLUMNS;

export function GardenSpiritWalker({ plantTileIndexes, levelUpEvent, weather }: GardenSpiritWalkerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [targetTile, setTargetTile] = useState(0);
  const [behavior, setBehavior] = useState<SpiritBehavior>("look");
  const [blink, setBlink] = useState(false);
  const lastEventId = useRef<number | null>(null);
  const timeoutRef = useRef<number | undefined>(undefined);
  const isNight = weather === "night";

  const wanderTiles = useMemo(
    () => (plantTileIndexes.length > 0 ? plantTileIndexes : [Math.floor((GARDEN_GRID_COLUMNS * GARDEN_GRID_ROWS) / 2)]),
    [plantTileIndexes]
  );

  // Natural, occasional blinking — independent of the wander/idle cycle.
  useEffect(() => {
    if (prefersReducedMotion) return;
    let blinkTimeout: number | undefined;
    function scheduleBlink() {
      blinkTimeout = window.setTimeout(() => {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 160);
        scheduleBlink();
      }, 2400 + Math.random() * 2600);
    }
    scheduleBlink();
    return () => window.clearTimeout(blinkTimeout);
  }, [prefersReducedMotion]);

  // At night, the Spirit settles down to sleep instead of wandering.
  useEffect(() => {
    if (prefersReducedMotion) return;

    if (isNight) {
      window.clearTimeout(timeoutRef.current);
      setTargetTile(SLEEP_TILE);
      setBehavior("walk");
      timeoutRef.current = window.setTimeout(() => setBehavior("sleep"), 1200);
      return () => window.clearTimeout(timeoutRef.current);
    }

    function scheduleNext(delay: number, action: () => void) {
      timeoutRef.current = window.setTimeout(action, delay);
    }

    function wander() {
      const next = wanderTiles[Math.floor(Math.random() * wanderTiles.length)];
      setTargetTile(next);
      setBehavior("walk");
      scheduleNext(2600, () => {
        setBehavior(IDLE_BEHAVIORS[Math.floor(Math.random() * IDLE_BEHAVIORS.length)]);
        scheduleNext(3200, wander);
      });
    }

    wander();
    return () => window.clearTimeout(timeoutRef.current);
  }, [prefersReducedMotion, wanderTiles, isNight]);

  // React to a plant leveling up: interrupt wandering, walk over, celebrate.
  useEffect(() => {
    if (!levelUpEvent || levelUpEvent.id === lastEventId.current || prefersReducedMotion || isNight) return;
    lastEventId.current = levelUpEvent.id;

    window.clearTimeout(timeoutRef.current);
    setTargetTile(levelUpEvent.tileIndex);
    setBehavior("walk");
    timeoutRef.current = window.setTimeout(() => setBehavior("celebrate"), 1500);
  }, [levelUpEvent, prefersReducedMotion, isNight]);

  if (prefersReducedMotion) return null;

  const { xPercent, yPercent } = tileCenter(targetTile);

  return (
    <motion.div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
      animate={{ left: `${xPercent}%`, top: `${yPercent}%` }}
      transition={{ type: "spring", stiffness: 40, damping: 14 }}
    >
      <motion.div
        animate={
          behavior === "sleep"
            ? { y: 6, scaleY: 0.7, rotate: -6 }
            : behavior === "sit"
              ? { y: 4, scaleY: 0.85 }
              : behavior === "inspect"
                ? { y: 2, rotate: [0, -4, 4, 0] }
                : behavior === "celebrate"
                  ? { y: [0, -8, 0], scale: [1, 1.12, 1] }
                  : { y: [0, -3, 0], scaleY: [1, 1.02, 1] }
        }
        transition={
          behavior === "celebrate"
            ? { duration: 0.6, repeat: 3, ease: "easeInOut" }
            : behavior === "inspect"
              ? { duration: 1.4, ease: "easeInOut" }
              : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
        }
        style={{ transformOrigin: "bottom center" }}
      >
        <svg width="30" height="34" viewBox="0 0 60 68" role="img" aria-label="Garden Spirit">
          <ellipse cx="30" cy="42" rx="20" ry="19" fill="#3BB273" />
          <ellipse cx="30" cy="49" rx="14" ry="11" fill="#4FC788" opacity="0.7" />
          <path d="M30 24 C24 14 32 6 40 9 C38 18 36 22 30 24 Z" fill="#2C9560" />
          {behavior === "sleep" || blink ? (
            <>
              <path d="M21 40 q3 -2 6 0" stroke="#263238" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M33 40 q3 -2 6 0" stroke="#263238" strokeWidth="2" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="24" cy="40" r="3" fill="#263238" />
              <circle cx="36" cy="40" r="3" fill="#263238" />
            </>
          )}
          {behavior === "wave" ? (
            <path d="M22 48 Q30 55 38 48" stroke="#263238" strokeWidth="2" strokeLinecap="round" fill="none" />
          ) : (
            <path d="M24 47 Q30 51 36 47" stroke="#263238" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          )}
          {behavior === "sleep" && (
            <text x="42" y="16" fontSize="10" fill="#2C9560" opacity="0.8">z</text>
          )}
        </svg>

        {behavior === "water" && (
          <motion.span
            className="absolute -right-1 top-2 block h-1 w-1 rounded-full bg-sky-400"
            animate={{ y: [0, 10], opacity: [1, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, ease: "easeIn" }}
            aria-hidden
          />
        )}
        {behavior === "celebrate" && (
          <motion.span
            className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px]"
            animate={{ opacity: [0, 1, 0], y: [4, -6, -12] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
            aria-hidden
          >
            ✨
          </motion.span>
        )}
        {behavior === "sleep" && (
          <motion.span
            className="absolute -top-2 right-0 text-[9px] text-bloom-text/50"
            animate={{ opacity: [0.3, 0.9, 0.3], y: [0, -4, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          >
            💤
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
}
