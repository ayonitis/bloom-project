import { cn } from "@/lib/utils";
import { getInventoryIcon } from "@/components/inventory/inventoryIcons";
import type { InventoryRarity } from "@/types/inventory";
import type { ShopItemView } from "@/types/shop";

const RARITY_STYLES: Record<InventoryRarity, { ring: string; badge: string; label: string }> = {
  common: { ring: "ring-black/5", badge: "bg-bloom-muted/15 text-bloom-muted", label: "Common" },
  rare: { ring: "ring-sky-400/30", badge: "bg-sky-100 text-sky-700", label: "Rare" },
  epic: { ring: "ring-bloom-primary/30", badge: "bg-bloom-primary/15 text-bloom-primary-dark", label: "Epic" },
  legendary: { ring: "ring-bloom-accent/40", badge: "bg-bloom-accent/15 text-bloom-accent-dark", label: "Legendary" },
};

interface ShopItemCardProps {
  item: ShopItemView;
  canAfford: boolean;
  isPurchasing: boolean;
  onBuy: () => void;
}

export function ShopItemCard({ item, canAfford, isPurchasing, onBuy }: ShopItemCardProps) {
  const Icon = getInventoryIcon(item.icon);
  const rarity = RARITY_STYLES[item.rarity];

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-black/5 bg-white/80 p-4 shadow-[0_16px_36px_-26px_rgba(38,54,58,0.2)] ring-1",
        rarity.ring
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bloom-accent/15 text-bloom-accent-dark">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", rarity.badge)}>{rarity.label}</span>
      </div>

      <div className="min-w-0">
        <p className="truncate font-[family-name:var(--font-heading)] text-base font-semibold text-bloom-text">
          {item.name}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-bloom-muted">{item.description}</p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-1">
        <span className="text-sm font-medium text-bloom-accent-dark">🌱 {item.priceCoins.toLocaleString()}</span>
        {item.quantity > 0 && <span className="text-xs text-bloom-muted">Owned ×{item.quantity}</span>}
      </div>

      <button
        type="button"
        onClick={onBuy}
        disabled={!canAfford || isPurchasing}
        className="focus-ring w-full rounded-full bg-bloom-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {isPurchasing ? "Purchasing…" : canAfford ? "Buy" : "Not enough coins"}
      </button>
    </div>
  );
}
