"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface AnimatedTransitionProps {
  stepKey: string | number;
  children: ReactNode;
  className?: string;
}

const variants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -18, scale: 0.98 },
};

export function AnimatedTransition({
  stepKey,
  children,
  className,
}: AnimatedTransitionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      key={stepKey}
      initial={prefersReducedMotion ? { opacity: 0 } : variants.initial}
      animate={prefersReducedMotion ? { opacity: 1 } : variants.animate}
      exit={prefersReducedMotion ? { opacity: 0 } : variants.exit}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
