import { cn } from "@/lib/utils";
import { getInventoryIcon } from "@/components/inventory/inventoryIcons";
import type { InventoryItemView, InventoryRarity } from "@/types/inventory";

const RARITY_STYLES: Record<InventoryRarity, { ring: string; badge: string; label: string }> = {
  common: { ring: "ring-black/5", badge: "bg-bloom-muted/15 text-bloom-muted", label: "Common" },
  rare: { ring: "ring-sky-400/30", badge: "bg-sky-100 text-sky-700", label: "Rare" },
  epic: { ring: "ring-bloom-primary/30", badge: "bg-bloom-primary/15 text-bloom-primary-dark", label: "Epic" },
  legendary: { ring: "ring-bloom-accent/40", badge: "bg-bloom-accent/15 text-bloom-accent-dark", label: "Legendary" },
};

interface ItemCardProps {
  item: InventoryItemView;
  onClick: () => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const Icon = getInventoryIcon(item.icon);
  const rarity = RARITY_STYLES[item.rarity];
  const owned = item.quantity > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "focus-ring flex flex-col gap-3 rounded-2xl border border-black/5 p-4 text-left shadow-[0_16px_36px_-26px_rgba(38,54,58,0.2)] transition-all hover:-translate-y-0.5",
        owned ? cn("bg-white/80 ring-1", rarity.ring) : "bg-white/50 opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
            owned ? "bg-bloom-accent/15 text-bloom-accent-dark" : "bg-black/5 text-bloom-muted"
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", rarity.badge)}>{rarity.label}</span>
      </div>

      <div className="min-w-0">
        <p
          className={cn(
            "truncate font-[family-name:var(--font-heading)] text-base font-semibold",
            owned ? "text-bloom-text" : "text-bloom-text/70"
          )}
        >
          {item.name}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-bloom-muted">{item.description}</p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-1 text-xs">
        <span className={owned ? "font-medium text-bloom-text" : "text-bloom-muted"}>
          {owned ? `×${item.quantity} owned` : "None yet"}
        </span>
        {item.seedGrowthBoostXP && (
          <span className="font-medium text-bloom-accent-dark">+{item.seedGrowthBoostXP} XP</span>
        )}
      </div>

      {item.category === "decoration" && owned && (
        <div className="flex items-center gap-1.5 text-[11px] text-bloom-muted">
          <span className="rounded-full bg-black/5 px-2 py-0.5">Owned {item.quantity}</span>
          <span className="rounded-full bg-black/5 px-2 py-0.5">Placed {item.placed}</span>
          <span className="rounded-full bg-bloom-accent/10 px-2 py-0.5 font-medium text-bloom-accent-dark">
            Available {item.available}
          </span>
        </div>
      )}
    </button>
  );
}
