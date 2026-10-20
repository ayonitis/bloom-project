import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Your Garden — Bloom",
  description: "Today's habits and your garden, all in one place.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
