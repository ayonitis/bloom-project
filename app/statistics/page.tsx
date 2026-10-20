import type { Metadata } from "next";
import { StatisticsPageClient } from "@/components/statistics/StatisticsPageClient";

export const metadata: Metadata = {
  title: "Statistics — Bloom",
  description: "A closer look at how your habits and garden are growing.",
};

export default function StatisticsPage() {
  return <StatisticsPageClient />;
}
