export type InventoryCategory = "decoration" | "seed" | "special";
export type InventoryRarity = "common" | "rare" | "epic" | "legendary";

export interface InventoryItemView {
  id: string;
  key: string;
  name: string;
  description: string;
  category: InventoryCategory;
  icon: string;
  rarity: InventoryRarity;
  placesAsTileType: "decoration" | "path" | "stone" | null;
  seedGrowthBoostXP: number | null;
  /** Total ever owned — never changes when a decoration is placed/moved/
   *  removed, only when purchased or (for seeds) used. */
  quantity: number;
  /** Decorations only: how many are currently placed somewhere in the
   *  Garden right now. Always 0 for seeds/special items. */
  placed: number;
  /** quantity - placed — how many are free to place right now. This is
   *  what gates the "Place in Garden" / drawer selection actions, not
   *  `quantity` itself, so an already-placed decoration still shows as
   *  owned without letting you place a second copy you don't have. */
  available: number;
  priceCoins: number | null;
}

export interface GardenPlacementView {
  x: number;
  y: number;
  itemId: string;
  itemKey: string;
  rotation: number;
}

export const INVENTORY_CATEGORY_LABELS: Record<InventoryCategory, string> = {
  decoration: "Decorations",
  seed: "Seeds",
  special: "Special Items",
};
