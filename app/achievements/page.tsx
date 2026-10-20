import type { Metadata } from "next";
import { AchievementsPageClient } from "@/components/achievements/AchievementsPageClient";

export const metadata: Metadata = {
  title: "Achievements — Bloom",
  description: "Small milestones. Big growth.",
};

export default function AchievementsPage() {
  return <AchievementsPageClient />;
}
