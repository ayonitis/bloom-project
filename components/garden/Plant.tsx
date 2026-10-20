"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import { PlantVisual } from "@/components/habits/PlantVisual";
import { PlantAnimation } from "@/components/garden/PlantAnimation";
import { PlantTooltip } from "@/components/garden/PlantTooltip";
import { useLongPress } from "@/hooks/useLongPress";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { GardenPlant } from "@/types/garden";

interface PlantProps {
  plant: GardenPlant;
  isSelected: boolean;
  isMoving: boolean;
  isCelebrating: boolean;
  /** True while some other interaction (placement) has the garden locked. */
  interactionLocked: boolean;
  onSelect: (plantId: string, anchor: HTMLElement) => void;
  onStartMove: (plantId: string) => void;
}

function PlantComponent({
  plant,
  isSelected,
  isMoving,
  isCelebrating,
  interactionLocked,
  onSelect,
  onStartMove,
}: PlantProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const longPress = useLongPress<HTMLDivElement>({
    disabled: interactionLocked,
    onLongPress: () => {
      setIsPressing(false);
      onStartMove(plant.id);
    },
    onClick: (event) => onSelect(plant.id, event.currentTarget),
  });

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (interactionLocked) return;
    if (event.key === "Enter") {
      event.preventDefault();
      onSelect(plant.id, event.currentTarget);
    } else if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      onStartMove(plant.id);
    }
  }

  return (
    <div
      className="relative flex h-full w-full items-end justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        role="button"
        tabIndex={0}
        data-plant-id={plant.id}
        onPointerDown={(event) => {
          setIsPressing(true);
          longPress.onPointerDown(event);
        }}
        onPointerMove={longPress.onPointerMove}
        onPointerUp={(event) => {
          setIsPressing(false);
          longPress.onPointerUp(event);
        }}
        onPointerLeave={() => {
          setIsPressing(false);
          longPress.onPointerLeave();
        }}
        onPointerCancel={() => {
          setIsPressing(false);
          longPress.onPointerCancel();
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        aria-pressed={isMoving}
        aria-label={`${plant.name} — ${plant.assignedHabit.title}, ${plant.growthPercent}% grown. Press Enter for details, or Space to move.${
          isSelected ? " Currently selected." : ""
        }${isMoving ? " Currently in move mode." : ""}`}
        className="focus-ring group relative flex h-full w-full select-none items-end justify-center rounded-md touch-none"
        style={{ cursor: isMoving ? "grabbing" : interactionLocked ? "default" : "pointer" }}
      >
        <motion.div
          animate={
            isMoving
              ? { y: [-3, -7, -3], scale: 1.12 }
              : isPressing
                ? { scale: 0.94 }
                : isHovered && !interactionLocked && !prefersReducedMotion
                  ? { y: -2, scale: 1.04 }
                  : { y: 0, scale: 1 }
          }
          transition={
            isMoving
              ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
              : { type: "spring", stiffness: 320, damping: 20 }
          }
          className="relative"
          style={{ filter: isMoving ? "drop-shadow(0 10px 14px rgba(38,54,58,0.35))" : undefined }}
        >
          <PlantAnimation stage={plant.growthStage} isCelebrating={isCelebrating}>
            <PlantVisual species={plant.species} growth={plant.growthPercent} size={36} />
          </PlantAnimation>
        </motion.div>
      </div>

      {isSelected && (
        <div className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-bloom-accent" aria-hidden />
      )}
      {isMoving && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-bloom-primary"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      )}

      {isHovered && !isMoving && !interactionLocked && <PlantTooltip plant={plant} />}
    </div>
  );
}

export const Plant = memo(PlantComponent);
