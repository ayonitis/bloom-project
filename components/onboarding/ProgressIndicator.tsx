"use client";

import { motion } from "framer-motion";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  return (
    <div className="mx-auto w-full max-w-xs">
      <div className="flex items-center justify-between text-xs font-medium text-bloom-muted">
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span aria-hidden>{Math.round((currentStep / totalSteps) * 100)}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Onboarding step ${currentStep} of ${totalSteps}`}
        className="mt-2 flex gap-1.5"
      >
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-bloom-text/10"
          >
            {step <= currentStep && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
                className="h-full w-full rounded-full bg-bloom-accent"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
