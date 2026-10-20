"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { buttonVariants, type ButtonVariant } from "@/lib/buttonStyles";
import { ButtonContent } from "@/components/ui/ButtonContent";
import type { AnchorHTMLAttributes } from "react";

const MotionLink = motion.create(Link);

type NativeLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "href"
>;

interface ButtonLinkProps extends NativeLinkProps {
  href: string;
  variant?: ButtonVariant;
  showIcon?: boolean;
}

export function ButtonLink({
  href,
  variant = "primary",
  showIcon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  const isPrimary = variant === "primary";
  const shouldShowIcon = showIcon ?? isPrimary;

  return (
    <MotionLink
      href={href}
      whileHover={{ y: -3 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={buttonVariants(variant, className)}
      {...props}
    >
      <ButtonContent variant={variant} showIcon={shouldShowIcon}>
        {children}
      </ButtonContent>
    </MotionLink>
  );
}
