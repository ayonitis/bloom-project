export type InventoryCategory = "decoration" | "seed" | "special";
export type InventoryRarity = "common" | "rare" | "epic" | "legendary";

export interface InventoryItemSeed {
  key: string;
  name: string;
  description: string;
  category: InventoryCategory;
  /** A lucide-react icon name — resolved in components/inventory/inventoryIcons.ts. */
  icon: string;
  rarity: InventoryRarity;
  /** Decorations only: which garden_tiles.tileType placing this results in. */
  placesAsTileType?: "decoration" | "path" | "stone";
  /** Seeds only: using it awards this many XP (a real xp_transactions row,
   *  reason="seed_boost") to a habit the player picks. */
  seedGrowthBoostXP?: number;
  /** How many of this item a brand-new user starts with. 0 means it exists
   *  in the catalog (so it CAN show up, e.g. as a Shop-only item) but
   *  isn't handed out for free. */
  starterQuantity: number;
  /** Bloom Coins price in the Shop. Omitted = not for sale (not currently
   *  used by anything in the catalog, but kept optional for a future
   *  achievement-only or event-only item). */
  priceCoins?: number;
}

/**
 * Decorations/seeds below the "--- Shop exclusives ---" line are the same
 * set introduced in the Inventory phase (nothing about the Garden's
 * visuals changes — only where the data lives); they now also carry a
 * price so a player who's placed or used up their starter supply can buy
 * more. The three Shop-exclusive items give the Shop content of its own
 * ("Start with a small but polished collection") without touching the
 * starter kit. "special" has exactly one real item now (a collectible with
 * no place/use action) — the Inventory page only shows a "special" tab at
 * all once the catalog has something in it, and it does now.
 */
export const INVENTORY_CATALOG: readonly InventoryItemSeed[] = [
  // --- Decorations ---------------------------------------------------------
  {
    key: "lantern-paper",
    name: "Paper Lantern",
    description: "Glows softly once night falls over the garden.",
    category: "decoration",
    icon: "lamp",
    rarity: "common",
    placesAsTileType: "decoration",
    starterQuantity: 3,
    priceCoins: 20,
  },
  {
    key: "bench-wood",
    name: "Wooden Bench",
    description: "A quiet place for the Garden Spirit to sit and rest.",
    category: "decoration",
    icon: "armchair",
    rarity: "common",
    placesAsTileType: "decoration",
    starterQuantity: 2,
    priceCoins: 30,
  },
  {
    key: "fountain-stone",
    name: "Stone Fountain",
    description: "A centerpiece with a gentle, endless trickle of water.",
    category: "decoration",
    icon: "droplets",
    rarity: "rare",
    placesAsTileType: "decoration",
    starterQuantity: 1,
    priceCoins: 90,
  },
  {
    key: "path-gravel",
    name: "Gravel Path",
    description: "Lay a path so the Spirit — and your eye — always knows the way.",
    category: "decoration",
    icon: "route",
    rarity: "common",
    placesAsTileType: "path",
    starterQuantity: 6,
    priceCoins: 10,
  },
  {
    key: "rock-mossy",
    name: "Mossy Rock",
    description: "A weathered rock, quietly claimed by moss.",
    category: "decoration",
    icon: "mountain",
    rarity: "common",
    placesAsTileType: "stone",
    starterQuantity: 5,
    priceCoins: 15,
  },
  {
    key: "pot-terracotta",
    name: "Terracotta Pot",
    description: "A little extra color between the beds.",
    category: "decoration",
    icon: "flower",
    rarity: "common",
    placesAsTileType: "decoration",
    starterQuantity: 3,
    priceCoins: 20,
  },
  {
    key: "tree-sapling",
    name: "Ornamental Sapling",
    description: "Purely decorative — doesn't grow with a habit, just adds shade.",
    category: "decoration",
    icon: "trees",
    rarity: "rare",
    placesAsTileType: "decoration",
    starterQuantity: 2,
    priceCoins: 70,
  },

  // --- Seeds -----------------------------------------------------------------
  {
    key: "seed-common",
    name: "Common Seed",
    description: "A small burst of extra growth for any one habit's plant.",
    category: "seed",
    icon: "sprout",
    rarity: "common",
    seedGrowthBoostXP: 30,
    starterQuantity: 3,
    priceCoins: 25,
  },
  {
    key: "seed-golden",
    name: "Golden Seed",
    description: "A rarer seed — a noticeably bigger boost of growth for one plant.",
    category: "seed",
    icon: "sparkles",
    rarity: "epic",
    seedGrowthBoostXP: 120,
    starterQuantity: 0,
    priceCoins: 150,
  },

  // --- Shop exclusives (starterQuantity: 0 — only ever obtained by purchase) ---
  {
    key: "golden-sunflower",
    name: "Golden Sunflower",
    description: "A decorative garden flower that catches the light beautifully.",
    category: "decoration",
    icon: "flower-2",
    rarity: "rare",
    placesAsTileType: "decoration",
    starterQuantity: 0,
    priceCoins: 80,
  },
  {
    key: "crystal-bloom",
    name: "Crystal Bloom",
    description: "A rare keepsake, not placed in the garden — just something beautiful to have.",
    category: "special",
    icon: "sparkles",
    rarity: "epic",
    starterQuantity: 0,
    priceCoins: 200,
  },
  {
    key: "ancient-lantern",
    name: "Ancient Lantern",
    description: "Said to have lit the very first garden. The rarest lantern there is.",
    category: "decoration",
    icon: "lamp",
    rarity: "legendary",
    placesAsTileType: "decoration",
    starterQuantity: 0,
    priceCoins: 450,
  },
] as const;
