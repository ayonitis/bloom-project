"use client";

import { useCallback, useEffect, useState } from "react";
import { getCoinBalanceAction, getShopItemsAction, purchaseItemAction } from "@/app/actions/shop";
import type { ShopItemView } from "@/types/shop";

export function useShop() {
  const [items, setItems] = useState<ShopItemView[] | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    const [itemsResult, balanceResult] = await Promise.all([getShopItemsAction(), getCoinBalanceAction()]);
    if (itemsResult.ok) {
      setItems(itemsResult.data);
    } else {
      setLoadError(itemsResult.error);
    }
    if (balanceResult.ok) setBalance(balanceResult.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const purchase = useCallback(async (itemId: string) => {
    const result = await purchaseItemAction(itemId, 1);
    if (result.ok) {
      setBalance(result.data.newBalance);
      setItems((prev) =>
        prev
          ? prev.map((item) => (item.id === itemId ? { ...item, quantity: result.data.newQuantity } : item))
          : prev
      );
    }
    return result;
  }, []);

  return { items, balance, isLoading, loadError, refresh, purchase };
}
