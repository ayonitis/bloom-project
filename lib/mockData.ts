import {
  LayoutGrid,
  ListChecks,
  Flower2,
  Trophy,
  BarChart3,
  Backpack,
  Store,
  Settings,
  User,
  Plus,
  Sparkles,
  Palette,
} from "lucide-react";
import type {
  GardenTile,
  NavItem,
  PlayerStats,
  QuickAction,
} from "@/types/dashboard";

export const PLAYER_STATS: PlayerStats = {
  name: "Alex",
  level: 7,
  xp: 340,
  xpToNextLevel: 500,
  coins: 128,
  currentStreak: 12,
  longestStreak: 21,
  gardenHealth: 82,
  weeklyProgress: [60, 80, 40, 100, 70, 90, 50],
};

// A small hand-arranged tile grid so the garden reads as an actual place
// rather than a random scatter — path down the middle, water in one
// corner, trees anchoring the back row, flowers filling in as rewards.
const GARDEN_LAYOUT: readonly (import("@/types/dashboard").GardenTileType)[][] =
  [
    ["tree", "grass", "flowerAmber", "grass", "tree", "grass", "flowerSky", "grass"],
    ["grass", "flowerCoral", "grass", "path", "grass", "flowerAmber", "grass", "grass"],
    ["flowerSky", "grass", "grass", "path", "grass", "grass", "sprout", "flowerCoral"],
    ["grass", "grass", "rock", "path", "path", "grass", "grass", "grass"],
    ["grass", "flowerAmber", "grass", "path", "grass", "flowerSky", "grass", "water"],
    ["tree", "grass", "sprout", "grass", "flowerCoral", "grass", "grass", "water"],
  ];

export const GARDEN_TILES: GardenTile[] = GARDEN_LAYOUT.flatMap((row, y) =>
  row.map((type, x) => ({ id: `${x}-${y}`, type }))
);

export const GARDEN_COLUMNS = GARDEN_LAYOUT[0]?.length ?? 8;
export const GARDEN_ROWS = GARDEN_LAYOUT.length;

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "create-habit",
    label: "Create Habit",
    description: "Plant a new habit to grow",
    icon: Plus,
    available: false,
  },
  {
    id: "shop",
    label: "Visit Shop",
    description: "Spend coins on decorations",
    icon: Store,
    available: false,
  },
  {
    id: "achievements",
    label: "Achievements",
    description: "See what you've unlocked",
    icon: Trophy,
    available: false,
  },
  {
    id: "statistics",
    label: "Statistics",
    description: "Review your longer trends",
    icon: BarChart3,
    available: false,
  },
  {
    id: "customize",
    label: "Customize Garden",
    description: "Rearrange trees and flowers",
    icon: Palette,
    available: false,
  },
  {
    id: "inventory",
    label: "Inventory",
    description: "Seeds and items you've collected",
    icon: Backpack,
    available: false,
  },
];

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutGrid, available: true },
  { id: "habits", label: "Habits", href: "/habits", icon: ListChecks, available: true },
  { id: "garden", label: "Garden", href: "/my-garden", icon: Flower2, available: true },
  { id: "achievements", label: "Achievements", href: "/achievements", icon: Trophy, available: true },
  { id: "statistics", label: "Statistics", href: "/statistics", icon: BarChart3, available: true },
  { id: "inventory", label: "Inventory", href: "/inventory", icon: Backpack, available: true },
  { id: "shop", label: "Shop", href: "/shop", icon: Store, available: true },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings, available: false },
  { id: "profile", label: "Profile", href: "/profile", icon: User, available: false },
];

export const SPIRIT_FALLBACK_MESSAGES: string[] = [
  "Your sunflower is almost blooming!",
  "This garden feels a little brighter today.",
  "I can hear the leaves humming — something's growing well.",
];

export const SPIRIT_ICON = Sparkles;
