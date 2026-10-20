import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export const metadata: Metadata = {
  title: "Plant your first seed — Bloom",
  description:
    "A short, magical walk through planting your first habits in Bloom.",
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
