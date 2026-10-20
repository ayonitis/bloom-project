"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ItemCard } from "@/components/inventory/ItemCard";
import { ItemDetailPanel } from "@/components/inventory/ItemDetailPanel";
import { PlantCollectionCard } from "@/components/inventory/PlantCollectionCard";
import { useInventory } from "@/hooks/useInventory";
import { useHabits } from "@/hooks/useHabits";
import { INVENTORY_CATEGORY_LABELS } from "@/types/inventory";
import type { InventoryCategory, InventoryItemView } from "@/types/inventory";

type Tab = "plants" | InventoryCategory;

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-[2rem] border border-black/5 bg-white/60 px-6 py-14 text-center">
      <p className="font-[family-name:var(--font-heading)] text-base font-semibold text-bloom-text">{title}</p>
      <p className="max-w-xs text-sm text-bloom-muted">{subtitle}</p>
    </div>
  );
}

function InventorySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/50" />
      ))}
    </div>
  );
}

export function InventoryPageClient() {
  const { items, isLoading, loadError, refresh, useSeed } = useInventory();
  const { habits } = useHabits();
  const activeHabits = useMemo(() => habits.filter((habit) => habit.active), [habits]);

  const [tab, setTab] = useState<Tab>("plants");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const categorized = useMemo(() => {
    const groups: Record<InventoryCategory, InventoryItemView[]> = { decoration: [], seed: [], special: [] };
    for (const item of items ?? []) groups[item.category].push(item);
    return groups;
  }, [items]);

  // Only show tabs for categories the catalog actually has entries for —
  // "special" stays hidden entirely until something in the app can
  // actually produce one, rather than showing a permanently-empty tab.
  const availableTabs = useMemo(() => {
    const tabs: Tab[] = ["plants"];
    if (categorized.decoration.length > 0) tabs.push("decoration");
    if (categorized.seed.length > 0) tabs.push("seed");
    if (categorized.special.length > 0) tabs.push("special");
    return tabs;
  }, [categorized]);

  const selectedItem = items?.find((item) => item.id === selectedItemId) ?? null;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-bloom-text sm:text-3xl">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-bloom-muted">Everything you&apos;ve collected for your garden.</p>
        </motion.div>

        <div className="flex flex-wrap gap-2">
          {availableTabs.map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setTab(tabKey)}
              className={`focus-ring rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === tabKey
                  ? "bg-bloom-primary text-white"
                  : "border border-black/10 bg-white/70 text-bloom-text hover:bg-white"
              }`}
            >
              {tabKey === "plants" ? "Plants" : INVENTORY_CATEGORY_LABELS[tabKey]}
            </button>
          ))}
        </div>

        {tab === "plants" ? (
          activeHabits.length === 0 ? (
            <EmptyState
              title="No plants yet"
              subtitle="Every habit you create grows a plant of its own — add a habit to start your collection."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {activeHabits.map((habit) => (
                <PlantCollectionCard key={habit.id} habit={habit} />
              ))}
            </div>
          )
        ) : isLoading ? (
          <InventorySkeleton />
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
        ) : categorized[tab].length === 0 ? (
          <EmptyState
            title={
              tab === "seed"
                ? "No seeds yet"
                : tab === "decoration"
                  ? "Your decoration collection is empty"
                  : "No special items unlocked yet"
            }
            subtitle="Keep tending your habits — new items show up here as you go."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categorized[tab].map((item) => (
              <ItemCard key={item.id} item={item} onClick={() => setSelectedItemId(item.id)} />
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <ItemDetailPanel
          item={selectedItem}
          activeHabits={activeHabits}
          onClose={() => setSelectedItemId(null)}
          onUseSeed={useSeed}
        />
      )}
    </DashboardLayout>
  );
}
