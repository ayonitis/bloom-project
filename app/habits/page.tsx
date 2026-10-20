import type { Metadata } from "next";
import { HabitsPageClient } from "@/components/habits/HabitsPageClient";

export const metadata: Metadata = {
  title: "Your Habits — Bloom",
  description: "Create, tend, and grow the habits behind your garden.",
};

export default function HabitsPage() {
  return <HabitsPageClient />;
}
