"use client";

import { FloatingDust } from "@/components/shared/FloatingDust";

export function Pollen() {
  return (
    <FloatingDust
      count={18}
      colorClassName="bg-bloom-primary/50"
      driftX={10}
      driftY={-22}
      className="-z-0"
    />
  );
}
