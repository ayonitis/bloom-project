import type { Metadata } from "next";
import { ShopPageClient } from "@/components/shop/ShopPageClient";

export const metadata: Metadata = {
  title: "Shop — Bloom",
  description: "Spend the coins your habits have earned on your garden.",
};

export default function ShopPage() {
  return <ShopPageClient />;
}
