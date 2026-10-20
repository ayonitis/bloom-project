"use client";

import Link from "next/link";
import { Sprout } from "lucide-react";
import { FloatingBackground } from "@/components/onboarding/FloatingBackground";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";
import { QuoteGenerator } from "@/components/onboarding/QuoteGenerator";
import type { ReactNode } from "react";

interface OnboardingLayoutProps {
  children: ReactNode;
  /** Omit on steps that shouldn't show step progress (welcome, final reveal). */
  progress?: { currentStep: number; totalSteps: number };
  quoteSeed: string | number;
}

export function OnboardingLayout({
  children,
  progress,
  quoteSeed,
}: OnboardingLayoutProps) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <FloatingBackground />

      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/" className="focus-ring flex items-center gap-2 rounded-full">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bloom-accent/15">
            <Sprout className="h-4.5 w-4.5 text-bloom-accent-dark" strokeWidth={2.25} />
          </span>
          <span className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight text-bloom-text">
            Bloom
          </span>
        </Link>

        {progress && (
          <div className="hidden sm:block">
            <ProgressIndicator
              currentStep={progress.currentStep}
              totalSteps={progress.totalSteps}
            />
          </div>
        )}
      </header>

      {progress && (
        <div className="px-6 sm:hidden">
          <ProgressIndicator
            currentStep={progress.currentStep}
            totalSteps={progress.totalSteps}
          />
        </div>
      )}

      <main className="relative flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-xl">{children}</div>
      </main>

      <footer className="px-6 pb-8">
        <QuoteGenerator seed={quoteSeed} />
      </footer>
    </div>
  );
}
