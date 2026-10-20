"use client";

import { motion } from "framer-motion";
import { Sprout } from "lucide-react";
import type { ButtonVariant } from "@/lib/buttonStyles";
import type { ReactNode } from "react";

interface ButtonContentProps {
  variant: ButtonVariant;
  showIcon: boolean;
  children: ReactNode;
}

/** Shared visual content for `Button` and `ButtonLink` so the two stay in sync. */
export function ButtonContent({ variant, showIcon, children }: ButtonContentProps) {
  const isPrimary = variant === "primary";

  return (
    <>
      {showIcon && (
        <motion.span
          aria-hidden
          className="inline-flex"
          initial={{ rotate: -8 }}
          animate={{ rotate: [-8, 6, -8] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sprout className="h-4 w-4" strokeWidth={2.25} />
        </motion.span>
      )}
      {children}
      {!isPrimary && (
        <span className="absolute -bottom-0.5 left-7 right-7 h-px scale-x-0 bg-bloom-text/40 transition-transform duration-300 group-hover:scale-x-100" />
      )}
    </>
  );
}
