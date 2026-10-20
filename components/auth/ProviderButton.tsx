"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ProviderButtonProps {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  disabled?: boolean;
}

export function ProviderButton({ onClick, icon, label, disabled }: ProviderButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className="focus-ring flex w-full items-center gap-3 rounded-xl border border-black/10 bg-white/80 px-4 py-3.5 text-left transition-colors hover:border-bloom-accent/30 hover:bg-white disabled:pointer-events-none disabled:opacity-50"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bloom-bg">
        {icon}
      </span>
      <span className="font-[family-name:var(--font-heading)] text-sm font-medium text-bloom-text">
        {label}
      </span>
    </motion.button>
  );
}
