"use client";

import { FloatingDust } from "@/components/shared/FloatingDust";

export function FloatingParticles({ count = 14 }: { count?: number }) {
  return (
    <FloatingDust count={count} colorClassName="bg-white/70" driftX={0} driftY={-14} />
  );
}
