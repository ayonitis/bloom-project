"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/requireUserId";
import { toActionResult, type ActionResult } from "@/lib/errors";
import { shopService } from "@/services/shopService";
import { coinService } from "@/services/coinService";
import type { PurchaseSuccess, ShopItemView } from "@/types/shop";

export async function getShopItemsAction(): Promise<ActionResult<ShopItemView[]>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    return shopService.listShopItems(userId);
  });
}

export async function getCoinBalanceAction(): Promise<ActionResult<number>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    return coinService.getBalance(userId);
  });
}

export async function purchaseItemAction(itemId: string, quantity = 1): Promise<ActionResult<PurchaseSuccess>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const result = await shopService.purchaseItem(userId, itemId, quantity);
    revalidatePath("/shop");
    revalidatePath("/inventory");
    revalidatePath("/my-garden");
    revalidatePath("/dashboard");
    return result;
  });
}
