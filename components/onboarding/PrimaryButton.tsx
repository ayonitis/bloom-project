"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ButtonHTMLAttributes } from "react";

interface PrimaryButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
  > {
  hideArrow?: boolean;
}

export function PrimaryButton({
  children,
  hideArrow,
  className,
  ...props
}: PrimaryButtonProps) {
  return (
    <Button variant="primary" showIcon={false} className={className} {...props}>
      {children}
      {!hideArrow && <ArrowRight className="h-4 w-4" strokeWidth={2.25} />}
    </Button>
  );
}
