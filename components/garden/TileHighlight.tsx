"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TileHighlightProps {
  variant: "hover" | "valid" | "invalid" | "glow";
}

export function TileHighlight({ variant }: TileHighlightProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "pointer-events-none absolute inset-0 rounded-md ring-2",
        variant === "hover" && "ring-white/70",
        variant === "valid" && "ring-bloom-accent/70 bg-bloom-accent/10",
        variant === "invalid" && "ring-red-400/70 bg-red-400/10",
        variant === "glow" && "ring-bloom-accent bg-bloom-accent/20 shadow-[0_0_16px_2px_rgba(245,166,35,0.45)]"
      )}
      aria-hidden
    />
  );
}
