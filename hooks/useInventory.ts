"use client";

import { useCallback, useEffect, useState } from "react";
import { getInventoryAction, consumeSeedAction } from "@/app/actions/inventory";
import type { InventoryItemView } from "@/types/inventory";

export function useInventory() {
  const [items, setItems] = useState<InventoryItemView[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    const result = await getInventoryAction();
    if (result.ok) {
      setItems(result.data);
    } else {
      setLoadError(result.error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const useSeed = useCallback(async (itemId: string, habitId: string) => {
    const result = await consumeSeedAction(itemId, habitId);
    if (result.ok) {
      setItems((prev) =>
        prev
          ? prev.map((item) => (item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item))
          : prev
      );
    }
    return result;
  }, []);

  return { items, isLoading, loadError, refresh, useSeed };
}
