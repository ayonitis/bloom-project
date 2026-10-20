"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ButtonHTMLAttributes } from "react";

export function SecondaryButton({
  children,
  className,
  ...props
}: Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
>) {
  return (
    <Button variant="secondary" showIcon={false} className={className} {...props}>
      <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
      {children}
    </Button>
  );
}
