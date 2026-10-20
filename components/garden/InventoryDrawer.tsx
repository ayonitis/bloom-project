"use client";

import { useId } from "react";
import { X } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { DECORATION_ICONS } from "@/components/garden/decorationIcons";
import { DECORATION_CATEGORY_LABELS } from "@/lib/gardenEngine";
import type { InventoryItem } from "@/types/garden";

interface InventoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onSelectItem: (itemId: string) => void;
}

export function InventoryDrawer({ isOpen, onClose, inventory, onSelectItem }: InventoryDrawerProps) {
  const titleId = useId();

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId={titleId} className="max-w-lg">
      <div className="p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="font-[family-name:var(--font-heading)] text-xl font-semibold text-bloom-text">
            Inventory
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close inventory"
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-bloom-text"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        <p className="mt-1 text-sm text-bloom-muted">Pick an item, then tap an open tile in the garden to place it.</p>

        <ul className="mt-5 grid list-none grid-cols-2 gap-2.5 p-0 sm:grid-cols-3">
          {inventory.map((item) => {
            const Icon = DECORATION_ICONS[item.icon];
            const disabled = item.available <= 0;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onSelectItem(item.id);
                    onClose();
                  }}
                  className="focus-ring flex w-full flex-col items-start gap-1.5 rounded-2xl border border-black/5 bg-white/70 p-3 text-left transition-all hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bloom-accent/12 text-bloom-accent-dark">
                    {Icon && <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />}
                  </span>
                  <span className="text-sm font-medium text-bloom-text">{item.name}</span>
                  <span className="text-[11px] text-bloom-muted">
                    {DECORATION_CATEGORY_LABELS[item.category]} · ×{item.available} available
                    {item.placed > 0 && ` (${item.placed} placed)`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
}
