"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import { useLongPress } from "@/hooks/useLongPress";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { DECORATION_ICONS } from "@/components/garden/decorationIcons";
import type { InventoryItem, PlacedDecoration } from "@/types/garden";

interface DecorationProps {
  decoration: PlacedDecoration;
  item: InventoryItem;
  tileIndex: number;
  isSelected: boolean;
  isMoving: boolean;
  /** True while some other interaction (a different move, a placement) has the garden locked. */
  interactionLocked: boolean;
  onSelect: (tileIndex: number, anchor: HTMLElement) => void;
  onStartMove: (tileIndex: number) => void;
}

function DecorationComponent({
  decoration,
  item,
  tileIndex,
  isSelected,
  isMoving,
  interactionLocked,
  onSelect,
  onStartMove,
}: DecorationProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const Icon = DECORATION_ICONS[item.icon];

  const longPress = useLongPress<HTMLDivElement>({
    disabled: interactionLocked,
    onLongPress: () => {
      setIsPressing(false);
      onStartMove(tileIndex);
    },
    onClick: (event) => onSelect(tileIndex, event.currentTarget),
  });

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (interactionLocked) return;
    if (event.key === "Enter") {
      event.preventDefault();
      onSelect(tileIndex, event.currentTarget);
    } else if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      onStartMove(tileIndex);
    }
  }

  if (!Icon) return null;

  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        role="button"
        tabIndex={0}
        data-decoration-tile={tileIndex}
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
        aria-label={`${item.name}. Press Enter for details, or Space to move.${
          isMoving ? " Currently in move mode." : ""
        }`}
        className="focus-ring group relative flex h-full w-full select-none items-center justify-center rounded-md touch-none"
        style={{ cursor: isMoving ? "grabbing" : interactionLocked ? "default" : "pointer" }}
      >
        <motion.div
          animate={
            isMoving
              ? { y: [-2, -5, -2], scale: 1.08 }
              : isPressing
                ? { scale: 0.92 }
                : isHovered && !interactionLocked && !prefersReducedMotion
                  ? { scale: 1.05 }
                  : { y: 0, scale: 1 }
          }
          transition={
            isMoving
              ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              : { type: "spring", stiffness: 320, damping: 20 }
          }
          style={{
            transform: `rotate(${decoration.rotation}deg)`,
            filter: isMoving ? "drop-shadow(0 8px 12px rgba(38,54,58,0.3))" : undefined,
          }}
        >
          <Icon className="h-[55%] w-[55%] text-bloom-text/70" strokeWidth={1.75} />
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
    </div>
  );
}

export const Decoration = memo(DecorationComponent);
