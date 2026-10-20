"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { getInventoryIcon } from "@/components/inventory/inventoryIcons";
import type { Habit } from "@/types/habit";
import type { InventoryItemView } from "@/types/inventory";

interface ItemDetailPanelProps {
  item: InventoryItemView;
  activeHabits: Habit[];
  onClose: () => void;
  onUseSeed: (itemId: string, habitId: string) => Promise<{ ok: boolean; error?: string }>;
}

const RARITY_LABELS: Record<InventoryItemView["rarity"], string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export function ItemDetailPanel({ item, activeHabits, onClose, onUseSeed }: ItemDetailPanelProps) {
  const titleId = useId();
  const router = useRouter();
  const [selectedHabitId, setSelectedHabitId] = useState("");
  const [isUsing, setIsUsing] = useState(false);
  const [useError, setUseError] = useState<string | null>(null);
  const [useSuccess, setUseSuccess] = useState<string | null>(null);

  const Icon = getInventoryIcon(item.icon);
  const isDecoration = item.category === "decoration";
  const isSeed = item.category === "seed";
  // Decorations are gated by `available` (owned minus already-placed) —
  // `quantity` alone would let someone "place" a copy they've already put
  // in the garden. Seeds have no placed concept, so quantity is available.
  const canAct = isDecoration ? item.available > 0 : item.quantity > 0;

  function handlePlaceInGarden() {
    router.push(`/my-garden?place=${item.id}`);
    onClose();
  }

  async function handleUseSeed() {
    if (!selectedHabitId) return;
    setIsUsing(true);
    setUseError(null);
    const result = await onUseSeed(item.id, selectedHabitId);
    setIsUsing(false);
    if (result.ok) {
      setUseSuccess(`+${item.seedGrowthBoostXP ?? 0} XP added to that habit's plant.`);
      setSelectedHabitId("");
    } else {
      setUseError(result.error ?? "Couldn't use that seed. Please try again.");
    }
  }

  return (
    <Modal isOpen onClose={onClose} titleId={titleId} className="max-w-md">
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bloom-accent/15 text-bloom-accent-dark">
              <Icon className="h-5.5 w-5.5" strokeWidth={2} />
            </span>
            <div>
              <h2 id={titleId} className="font-[family-name:var(--font-heading)] text-lg font-semibold text-bloom-text">
                {item.name}
              </h2>
              <p className="mt-0.5 text-xs text-bloom-muted">
                {RARITY_LABELS[item.rarity]} · ×{item.quantity} owned
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 text-bloom-text"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-bloom-text/85">{item.description}</p>

        {isDecoration && (
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <span className="rounded-full bg-black/5 px-2.5 py-1 text-bloom-muted">Owned {item.quantity}</span>
            <span className="rounded-full bg-black/5 px-2.5 py-1 text-bloom-muted">Placed {item.placed}</span>
            <span className="rounded-full bg-bloom-accent/10 px-2.5 py-1 font-medium text-bloom-accent-dark">
              Available {item.available}
            </span>
          </div>
        )}

        {isDecoration && (
          <div className="mt-6">
            {canAct ? (
              <button
                type="button"
                onClick={handlePlaceInGarden}
                className="focus-ring w-full rounded-full bg-bloom-accent px-4 py-3 text-sm font-medium text-white shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Place in Garden
              </button>
            ) : (
              <p className="rounded-2xl bg-black/5 px-4 py-3 text-center text-sm text-bloom-muted">
                You don&apos;t have any of these left to place.
              </p>
            )}
          </div>
        )}

        {isSeed && (
          <div className="mt-6">
            {!canAct ? (
              <p className="rounded-2xl bg-black/5 px-4 py-3 text-center text-sm text-bloom-muted">
                You don&apos;t have any of these left to use.
              </p>
            ) : useSuccess ? (
              <p className="rounded-2xl bg-bloom-accent/10 px-4 py-3 text-center text-sm font-medium text-bloom-accent-dark">
                {useSuccess}
              </p>
            ) : activeHabits.length === 0 ? (
              <p className="rounded-2xl bg-black/5 px-4 py-3 text-center text-sm text-bloom-muted">
                Add a habit first, then come back to use this seed on its plant.
              </p>
            ) : (
              <>
                <label className="text-xs font-medium uppercase tracking-wide text-bloom-muted" htmlFor="seed-habit-picker">
                  Use on
                </label>
                <select
                  id="seed-habit-picker"
                  value={selectedHabitId}
                  onChange={(event) => setSelectedHabitId(event.target.value)}
                  className="focus-ring mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-bloom-text"
                >
                  <option value="">Choose a habit&apos;s plant…</option>
                  {activeHabits.map((habit) => (
                    <option key={habit.id} value={habit.id}>
                      {habit.title}
                    </option>
                  ))}
                </select>

                {useError && <p className="mt-2 text-xs text-red-600">{useError}</p>}

                <button
                  type="button"
                  onClick={handleUseSeed}
                  disabled={!selectedHabitId || isUsing}
                  className="focus-ring mt-3 w-full rounded-full bg-bloom-accent px-4 py-3 text-sm font-medium text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isUsing ? "Using…" : `Use Seed (+${item.seedGrowthBoostXP ?? 0} XP)`}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
