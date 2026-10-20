import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GardenLayout } from "@/components/garden/GardenLayout";

export const metadata: Metadata = {
  title: "My Garden — Bloom",
  description: "Your habits, alive and growing — walk through your garden and watch it bloom.",
};

export default function MyGardenPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-bloom-text sm:text-3xl">
          My Garden
        </h1>
        <p className="mt-1 text-sm text-bloom-muted">
          Every habit grows a plant of its own. Tend them, and watch your garden fill in.
        </p>

        <div className="mt-6">
          {/* GardenLayout reads ?place=<itemId> via useSearchParams (for
              Inventory's "Place in Garden" deep link), which requires a
              Suspense boundary in the App Router. */}
          <Suspense fallback={null}>
            <GardenLayout />
          </Suspense>
        </div>
      </div>
    </DashboardLayout>
  );
}
