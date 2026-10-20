import type { Metadata } from "next";
import { InventoryPageClient } from "@/components/inventory/InventoryPageClient";

export const metadata: Metadata = {
  title: "Inventory — Bloom",
  description: "Everything you've collected for your garden.",
};

export default function InventoryPage() {
  return <InventoryPageClient />;
}
