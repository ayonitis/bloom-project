import type { InventoryItemView } from "@/types/inventory";

/** Every ShopItemView is guaranteed to have a real price — shopService
 *  only ever returns catalog rows where priceCoins is set. */
export interface ShopItemView extends Omit<InventoryItemView, "priceCoins"> {
  priceCoins: number;
}

export interface PurchaseSuccess {
  item: ShopItemView;
  totalCost: number;
  newBalance: number;
  newQuantity: number;
}
