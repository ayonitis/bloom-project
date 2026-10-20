"use client";

import { motion } from "framer-motion";
import { buttonVariants, type ButtonVariant } from "@/lib/buttonStyles";
import { ButtonContent } from "@/components/ui/ButtonContent";
import type { ButtonHTMLAttributes } from "react";

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
>;

interface ButtonProps extends NativeButtonProps {
  variant?: ButtonVariant;
  /** Show the small animated sprout icon. Defaults to true for the primary variant. */
  showIcon?: boolean;
}

export function Button({
  variant = "primary",
  showIcon,
  className,
  children,
  ...props
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const shouldShowIcon = showIcon ?? isPrimary;

  return (
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={buttonVariants(variant, className)}
      {...props}
    >
      <ButtonContent variant={variant} showIcon={shouldShowIcon}>
        {children}
      </ButtonContent>
    </motion.button>
  );
}
