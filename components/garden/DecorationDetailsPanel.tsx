"use client";

import { useId } from "react";
import { RotateCw, X } from "lucide-react";
import { AnchoredPanel } from "@/components/garden/AnchoredPanel";
import { DECORATION_ICONS } from "@/components/garden/decorationIcons";
import type { InventoryItem } from "@/types/garden";

interface DecorationDetailsPanelProps {
  item: InventoryItem;
  anchor: HTMLElement;
  onClose: () => void;
  onMove: () => void;
  onRotate: () => void;
  onRemove: () => void;
}

const RARITY_LABELS: Record<InventoryItem["rarity"], string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export function DecorationDetailsPanel({
  item,
  anchor,
  onClose,
  onMove,
  onRotate,
  onRemove,
}: DecorationDetailsPanelProps) {
  const titleId = useId();
  const Icon = DECORATION_ICONS[item.icon];

  return (
    <AnchoredPanel anchor={anchor} titleId={titleId} onClose={onClose} width={300}>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bloom-accent/15 text-bloom-accent-dark">
              {Icon && <Icon className="h-5 w-5" strokeWidth={2} />}
            </span>
            <div>
              <h2
                id={titleId}
                className="font-[family-name:var(--font-heading)] text-base font-semibold text-bloom-text"
              >
                {item.name}
              </h2>
              <p className="mt-0.5 text-xs text-bloom-muted">{RARITY_LABELS[item.rarity]}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/10 text-bloom-text"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        <p className="mt-3 text-sm leading-snug text-bloom-text/85">{item.description}</p>

        <div className="mt-3 flex items-center gap-2 text-xs text-bloom-muted">
          <span className="rounded-full bg-black/5 px-2.5 py-1">Owned ×{item.owned}</span>
          <span className="rounded-full bg-bloom-accent/10 px-2.5 py-1 font-medium text-bloom-accent-dark">
            Placed in Garden
          </span>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={onMove}
            className="focus-ring flex-1 rounded-full bg-bloom-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Move
          </button>
          <button
            type="button"
            onClick={onRotate}
            aria-label="Rotate"
            title="Rotate"
            className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 text-bloom-text transition-transform hover:-translate-y-0.5"
          >
            <RotateCw className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="focus-ring flex-1 rounded-full border border-black/10 px-4 py-2.5 text-sm font-medium text-bloom-text transition-transform hover:-translate-y-0.5"
          >
            Remove
          </button>
        </div>
      </div>
    </AnchoredPanel>
  );
}
