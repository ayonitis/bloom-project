"use client";

import { motion } from "framer-motion";

interface XPBarProps {
  xp: number;
  xpToNextLevel: number;
}

export function XPBar({ xp, xpToNextLevel }: XPBarProps) {
  const percent = Math.min(100, Math.round((xp / xpToNextLevel) * 100));

  return (
    <div>
      <div className="flex items-center justify-between text-xs font-medium text-bloom-muted">
        <span>XP</span>
        <span>
          {xp} / {xpToNextLevel}
        </span>
      </div>
      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-bloom-text/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-bloom-secondary to-bloom-accent"
        />
      </div>
    </div>
  );
}
