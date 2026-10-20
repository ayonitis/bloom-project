"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ActionErrorToast } from "@/components/shared/ActionErrorToast";
import { ShopItemCard } from "@/components/shop/ShopItemCard";
import { CoinBalanceBadge } from "@/components/shop/CoinBalanceBadge";
import { useShop } from "@/hooks/useShop";
import { getDecorationCategory } from "@/lib/gardenEngine";
import type { ShopItemView } from "@/types/shop";

type ShopTab = "flowers" | "trees" | "decorations" | "seed" | "special";

const TAB_LABELS: Record<ShopTab, string> = {
  flowers: "🌸 Flowers",
  trees: "🌳 Trees",
  decorations: "🪑 Decorations",
  seed: "🌱 Seeds",
  special: "✨ Special",
};

function getShopTab(item: ShopItemView): ShopTab {
  if (item.category === "seed") return "seed";
  if (item.category === "special") return "special";
  const decorationCategory = getDecorationCategory(item.icon);
  if (decorationCategory === "flowerPot") return "flowers";
  if (decorationCategory === "tree") return "trees";
  return "decorations";
}

function ShopSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-44 animate-pulse rounded-2xl bg-white/50" />
      ))}
    </div>
  );
}

export function ShopPageClient() {
  const { items, balance, isLoading, loadError, refresh, purchase } = useShop();
  const [tab, setTab] = useState<ShopTab | null>(null);
  const [pendingItem, setPendingItem] = useState<ShopItemView | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const groups: Record<ShopTab, ShopItemView[]> = {
      flowers: [],
      trees: [],
      decorations: [],
      seed: [],
      special: [],
    };
    for (const item of items ?? []) groups[getShopTab(item)].push(item);
    return groups;
  }, [items]);

  const availableTabs = useMemo(
    () => (Object.keys(TAB_LABELS) as ShopTab[]).filter((key) => grouped[key].length > 0),
    [grouped]
  );
  const activeTab = tab && availableTabs.includes(tab) ? tab : availableTabs[0];

  function needsConfirmation(item: ShopItemView): boolean {
    return item.rarity !== "common" || item.priceCoins >= 100;
  }

  async function runPurchase(item: ShopItemView) {
    setPurchasingId(item.id);
    setPurchaseError(null);
    const result = await purchase(item.id);
    setPurchasingId(null);
    if (!result.ok) {
      setPurchaseError(result.error);
    }
  }

  function handleBuyClick(item: ShopItemView) {
    if (needsConfirmation(item)) {
      setConfirmError(null);
      setPendingItem(item);
    } else {
      runPurchase(item);
    }
  }

  async function handleConfirmPurchase() {
    if (!pendingItem) return;
    setPurchasingId(pendingItem.id);
    setConfirmError(null);
    const result = await purchase(pendingItem.id);
    setPurchasingId(null);
    if (result.ok) {
      setPendingItem(null);
    } else {
      setConfirmError(result.error);
    }
  }

  const balanceAfterPurchase = pendingItem && balance !== null ? balance - pendingItem.priceCoins : null;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <ActionErrorToast message={purchaseError} onDismiss={() => setPurchaseError(null)} />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-bloom-text sm:text-3xl">
              Shop
            </h1>
            <p className="mt-1 text-sm text-bloom-muted">Spend the coins your habits have earned on your garden.</p>
          </div>
          <CoinBalanceBadge balance={balance} />
        </motion.div>

        {!isLoading && availableTabs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {availableTabs.map((tabKey) => (
              <button
                key={tabKey}
                type="button"
                onClick={() => setTab(tabKey)}
                className={`focus-ring rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tabKey
                    ? "bg-bloom-primary text-white"
                    : "border border-black/10 bg-white/70 text-bloom-text hover:bg-white"
                }`}
              >
                {TAB_LABELS[tabKey]}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <ShopSkeleton />
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-black/5 bg-white/70 px-6 py-14 text-center shadow-[0_20px_50px_-30px_rgba(38,54,58,0.22)]">
            <p className="text-sm text-bloom-muted">{loadError}</p>
            <button
              type="button"
              onClick={refresh}
              className="focus-ring flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-bloom-text"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
              Try again
            </button>
          </div>
        ) : !activeTab ? (
          <div className="flex flex-col items-center gap-1.5 rounded-[2rem] border border-black/5 bg-white/60 px-6 py-14 text-center">
            <p className="font-[family-name:var(--font-heading)] text-base font-semibold text-bloom-text">
              No items available right now.
            </p>
            <p className="max-w-xs text-sm text-bloom-muted">Check back soon for new additions to the Shop.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {grouped[activeTab].map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                canAfford={balance !== null && balance >= item.priceCoins}
                isPurchasing={purchasingId === item.id}
                onBuy={() => handleBuyClick(item)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={pendingItem !== null}
        title={`Purchase ${pendingItem?.name ?? ""}?`}
        description={
          pendingItem
            ? `🌱 ${pendingItem.priceCoins.toLocaleString()} Bloom Coins${
                balanceAfterPurchase !== null
                  ? ` — 🌱 ${balanceAfterPurchase.toLocaleString()} Bloom Coins left after this purchase.`
                  : "."
              }`
            : ""
        }
        confirmLabel="Purchase"
        confirmingLabel="Purchasing…"
        isConfirming={purchasingId === pendingItem?.id}
        error={confirmError}
        onConfirm={handleConfirmPurchase}
        onCancel={() => setPendingItem(null)}
      />
    </DashboardLayout>
  );
}
