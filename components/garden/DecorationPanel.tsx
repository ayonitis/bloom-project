"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Move, RotateCcw, Sprout, X } from "lucide-react";
import { DECORATION_ICONS } from "@/components/garden/decorationIcons";
import type { Ref } from "react";
import type { InventoryItem } from "@/types/garden";

interface DecorationPanelProps {
  placingItem: InventoryItem | null;
  movingPlantName: string | null;
  movingDecorationName: string | null;
  canPlaceHere: boolean;
  onPlaceHere: () => void;
  onCancel: () => void;
  onResetPosition?: () => void;
  ref?: Ref<HTMLDivElement>;
}

/**
 * The floating action bar shown while Move Mode or Placement Mode is
 * active. Stays bottom-center, large and touch-friendly, and — thanks to
 * the ref GardenLayout forwards here — is recognized as "inside" the
 * interaction by the outside-click handler, so pressing these buttons
 * never gets pre-empted by the mode cancelling itself out from under you.
 * Covers three interchangeable "something is being placed" states: a
 * plant being moved, a decoration being moved, or an inventory item being
 * placed for the first time — only the copy and icon change.
 */
export function DecorationPanel({
  placingItem,
  movingPlantName,
  movingDecorationName,
  canPlaceHere,
  onPlaceHere,
  onCancel,
  onResetPosition,
  ref,
}: DecorationPanelProps) {
  const isMovingPlant = Boolean(movingPlantName);
  const isMovingDecoration = Boolean(movingDecorationName);
  const active = placingItem ?? movingPlantName ?? movingDecorationName;
  const Icon = placingItem ? DECORATION_ICONS[placingItem.icon] : null;
  const placeLabel = isMovingPlant ? "Place Plant" : isMovingDecoration ? "Place Here" : "Place Item";

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 sm:bottom-6"
        >
          <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-[1.75rem] border border-black/10 bg-bloom-text/95 px-5 py-4 text-white shadow-[0_30px_70px_-25px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:max-w-md">
            <div className="flex w-full items-center gap-2" aria-live="polite">
              {isMovingPlant ? (
                <Sprout className="h-4 w-4 shrink-0 text-bloom-accent" strokeWidth={2} aria-hidden />
              ) : isMovingDecoration ? (
                <Move className="h-4 w-4 shrink-0 text-bloom-accent" strokeWidth={2} aria-hidden />
              ) : (
                Icon && <Icon className="h-4 w-4 shrink-0 text-bloom-accent" strokeWidth={2} aria-hidden />
              )}
              <span className="text-sm leading-snug">
                {isMovingPlant ? (
                  <>
                    <span className="font-semibold">🌱 Move Mode</span>
                    <span className="ml-1.5 text-white/75">
                      Tap an empty tile, or hover one and press Place Plant.
                    </span>
                  </>
                ) : isMovingDecoration ? (
                  <>
                    <span className="font-semibold">Moving {movingDecorationName}</span>
                    <span className="ml-1.5 text-white/75">Tap an empty tile, or hover one and press Place Here.</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold">📦 Placing {placingItem?.name}</span>
                    <span className="ml-1.5 text-white/75">Tap an open tile, or press Place Item.</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex w-full items-center gap-2" role="group" aria-label="Move mode actions">
              <button
                type="button"
                onClick={onCancel}
                className="focus-ring flex h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-white/10 text-sm font-medium transition-colors hover:bg-white/20"
              >
                <X className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                Cancel
              </button>

              {isMovingPlant && onResetPosition && (
                <button
                  type="button"
                  onClick={onResetPosition}
                  aria-label="Reset to original position"
                  title="Reset to original position"
                  className="focus-ring flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 transition-colors hover:bg-white/20"
                >
                  <RotateCcw className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                </button>
              )}

              <button
                type="button"
                onClick={onPlaceHere}
                disabled={!canPlaceHere}
                className="focus-ring flex h-12 flex-[1.4] items-center justify-center gap-1.5 rounded-2xl bg-bloom-accent text-sm font-semibold text-white transition-colors hover:bg-bloom-accent-dark disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
              >
                <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                {placeLabel}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
