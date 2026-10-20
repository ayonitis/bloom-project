import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { inventoryItems, userInventory } from "@/lib/db/schema";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { coinService } from "@/services/coinService";
import { adjustQuantity, getPlacedCounts } from "@/services/inventoryService";
import type { InventoryItemView } from "@/services/inventoryService";
import type { ShopItemView, PurchaseSuccess } from "@/types/shop";

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

function isForSale(item: InventoryItemView): item is InventoryItemView & { priceCoins: number } {
  return item.priceCoins !== null;
}

function toShopItemView(item: InventoryItemView & { priceCoins: number }): ShopItemView {
  return { ...item, priceCoins: item.priceCoins };
}

export const shopService = {
  /** Every catalog item that has a price — the client never decides what's
   *  "for sale"; the presence of a non-null priceCoins row does. */
  async listShopItems(userId: string): Promise<ShopItemView[]> {
    const [catalog, ownedRows, placedCounts] = await Promise.all([
      db.select().from(inventoryItems),
      db
        .select({ itemId: userInventory.itemId, quantity: userInventory.quantity })
        .from(userInventory)
        .where(eq(userInventory.userId, userId)),
      getPlacedCounts(db, userId),
    ]);

    const owned = new Map(ownedRows.map((row) => [row.itemId, row.quantity]));

    const views: InventoryItemView[] = catalog.map((item) => {
      const ownedQuantity = owned.get(item.id) ?? 0;
      const placed = placedCounts.get(item.id) ?? 0;
      return {
        id: item.id,
        key: item.key,
        name: item.name,
        description: item.description,
        category: item.category,
        icon: item.icon,
        rarity: item.rarity,
        placesAsTileType: item.placesAsTileType as InventoryItemView["placesAsTileType"],
        seedGrowthBoostXP: item.seedGrowthBoostXP,
        priceCoins: item.priceCoins,
        quantity: ownedQuantity,
        placed,
        available: Math.max(0, ownedQuantity - placed),
      };
    });

    return views.filter(isForSale).map(toShopItemView);
  },

  /**
   * The full purchase flow, server-authoritative end to end: price comes
   * from the catalog row read inside this same transaction (never from the
   * client), the balance check+deduction is one atomic guarded UPDATE
   * (coinService.spend — see its own note on why this, not a plain sum,
   * is what makes concurrent double-purchases safe), and the inventory
   * grant reuses inventoryService's exact same quantity-adjustment helper
   * used by placing/using items — there is only one inventory system.
   */
  async purchaseItem(userId: string, itemId: string, quantity: number): Promise<PurchaseSuccess> {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ValidationError("Invalid quantity.");
    }

    return db.transaction(async (tx: DbTransaction) => {
      const [item] = await tx.select().from(inventoryItems).where(eq(inventoryItems.id, itemId)).limit(1);
      if (!item) throw new NotFoundError("Item");
      if (item.priceCoins === null) throw new ValidationError("That item isn't for sale.");
      // Narrowed by the check above — TypeScript can't see through the
      // reassigned `item.priceCoins` after the throw, so bind it once here.
      const priceCoins = item.priceCoins;

      const totalCost = priceCoins * quantity;
      const newBalance = await coinService.spend(tx, userId, totalCost, "purchase", { itemId, quantity });
      await adjustQuantity(tx, userId, itemId, quantity);

      const [updatedRow] = await tx
        .select({ quantity: userInventory.quantity })
        .from(userInventory)
        .where(and(eq(userInventory.userId, userId), eq(userInventory.itemId, itemId)))
        .limit(1);
      const newQuantity = updatedRow?.quantity ?? quantity;
      const placedCounts = await getPlacedCounts(tx, userId);
      const placed = placedCounts.get(itemId) ?? 0;

      const view: ShopItemView = {
        id: item.id,
        key: item.key,
        name: item.name,
        description: item.description,
        category: item.category,
        icon: item.icon,
        rarity: item.rarity,
        placesAsTileType: item.placesAsTileType as InventoryItemView["placesAsTileType"],
        seedGrowthBoostXP: item.seedGrowthBoostXP,
        priceCoins,
        quantity: newQuantity,
        placed,
        available: Math.max(0, newQuantity - placed),
      };

      return { item: view, totalCost, newBalance, newQuantity };
    });
  },
};
