"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface CloudConfig {
  id: number;
  top: string;
  scale: number;
  opacity: number;
  duration: number;
  delay: number;
}

const CLOUDS: CloudConfig[] = [
  { id: 1, top: "8%", scale: 1.1, opacity: 0.9, duration: 55, delay: 0 },
  { id: 2, top: "16%", scale: 0.75, opacity: 0.7, duration: 70, delay: -20 },
  { id: 3, top: "5%", scale: 0.6, opacity: 0.6, duration: 85, delay: -45 },
  { id: 4, top: "22%", scale: 0.9, opacity: 0.5, duration: 65, delay: -10 },
];

function CloudShape() {
  return (
    <svg width="160" height="60" viewBox="0 0 160 60" fill="none">
      <ellipse cx="40" cy="38" rx="40" ry="20" fill="white" />
      <ellipse cx="80" cy="26" rx="34" ry="26" fill="white" />
      <ellipse cx="118" cy="36" rx="32" ry="18" fill="white" />
    </svg>
  );
}

function CloudsComponent() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden" aria-hidden>
      {CLOUDS.map((cloud) => (
        <motion.div
          key={cloud.id}
          className="absolute left-0"
          style={{ top: cloud.top, opacity: cloud.opacity }}
          initial={{ x: "-15vw" }}
          animate={prefersReducedMotion ? undefined : { x: "115vw" }}
          transition={{
            duration: cloud.duration,
            delay: cloud.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div style={{ transform: `scale(${cloud.scale})` }}>
            <CloudShape />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export const Clouds = memo(CloudsComponent);
