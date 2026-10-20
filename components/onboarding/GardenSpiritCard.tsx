"use client";

import { useMousePosition } from "@/hooks/useMousePosition";
import { GardenSpirit } from "@/components/scene/GardenSpirit";
import { SpeechBubble } from "@/components/scene/SpeechBubble";

interface GardenSpiritCardProps {
  message: string;
  isHappy?: boolean;
}

export function GardenSpiritCard({ message, isHappy = false }: GardenSpiritCardProps) {
  const mouse = useMousePosition();

  return (
    <div className="flex flex-col items-center">
      <SpeechBubble message={message} />
      <div className="mt-2">
        <GardenSpirit mouse={mouse} isCtaHovered={isHappy} />
      </div>
    </div>
  );
}
