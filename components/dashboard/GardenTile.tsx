"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { GardenTileType } from "@/types/dashboard";

interface GardenTileProps {
  type: GardenTileType;
  delay: number;
}

const GRASS_SHADES = ["#3BB273", "#43BD7C", "#37A868"];

function TreeDecoration() {
  return (
    <svg viewBox="0 0 40 40" className="h-[85%] w-[85%]" aria-hidden>
      <rect x="18" y="24" width="4" height="12" rx="1.5" fill="#8A6448" />
      <circle cx="20" cy="18" r="13" fill="#2C9560" />
      <circle cx="12" cy="23" r="8" fill="#2C9560" opacity="0.9" />
      <circle cx="28" cy="23" r="8.5" fill="#2C9560" opacity="0.9" />
    </svg>
  );
}

function FlowerDecoration({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[55%] w-[55%]" aria-hidden>
      <rect x="11" y="14" width="2" height="8" rx="1" fill="#2C9560" />
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="12"
          cy="8"
          rx="3.4"
          ry="5"
          fill={color}
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
      <circle cx="12" cy="12" r="2.6" fill="#FFF3D6" />
    </svg>
  );
}

function SproutDecoration() {
  return (
    <svg viewBox="0 0 24 24" className="h-[45%] w-[45%]" aria-hidden>
      <rect x="11" y="14" width="2" height="8" rx="1" fill="#3BB273" />
      <path d="M12 15c-6-1-8-6-6-10 6 1 8 6 6 10Z" fill="#3BB273" />
      <path d="M12 16c6-1 9-5 7-9-6 0-9 5-7 9Z" fill="#4FC788" />
    </svg>
  );
}

function RockDecoration() {
  return (
    <svg viewBox="0 0 30 20" className="h-[55%] w-[55%]" aria-hidden>
      <ellipse cx="15" cy="13" rx="13" ry="7" fill="#B7B2A6" />
      <ellipse cx="10" cy="10" rx="7" ry="5" fill="#C7C2B4" />
    </svg>
  );
}

function GardenTileComponent({ type, delay }: GardenTileProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shade = GRASS_SHADES[(delay * 7) % GRASS_SHADES.length];

  const base = (
    <div
      className="absolute inset-0 rounded-[6px]"
      style={{
        background:
          type === "path"
            ? "#E6D3AE"
            : type === "water"
              ? "linear-gradient(135deg, #7CC3FF, #5AA9FF)"
              : type === "empty"
                ? "#DDD0B4"
                : shade,
      }}
    />
  );

  const content = (() => {
    switch (type) {
      case "tree":
        return <TreeDecoration />;
      case "flowerAmber":
        return <FlowerDecoration color="#F5A623" />;
      case "flowerSky":
        return <FlowerDecoration color="#5AA9FF" />;
      case "flowerCoral":
        return <FlowerDecoration color="#FF9E7D" />;
      case "sprout":
        return <SproutDecoration />;
      case "rock":
        return <RockDecoration />;
      default:
        return null;
    }
  })();

  const isSwayable = type === "tree" || type.startsWith("flower");

  return (
    <div className="relative aspect-square w-full">
      {base}
      {type === "water" && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-[6px] bg-white/25"
          animate={{ opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, delay: delay * 0.1, ease: "easeInOut" }}
        />
      )}
      {content && (
        <motion.div
          className={cn("absolute inset-0 flex items-end justify-center pb-0.5")}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={
            isSwayable && !prefersReducedMotion
              ? { opacity: 1, scale: 1, rotate: [-2.5, 2.5, -2.5] }
              : { opacity: 1, scale: 1 }
          }
          transition={
            isSwayable
              ? {
                  opacity: { duration: 0.4, delay: delay * 0.02 },
                  scale: { duration: 0.4, delay: delay * 0.02 },
                  rotate: {
                    duration: 3.5 + (delay % 3),
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: delay * 0.05,
                  },
                }
              : { duration: 0.4, delay: delay * 0.02 }
          }
          style={{ transformOrigin: "bottom center" }}
        >
          {content}
        </motion.div>
      )}
    </div>
  );
}

export const GardenTile = memo(GardenTileComponent);
