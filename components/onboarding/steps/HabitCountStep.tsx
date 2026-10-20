"use client";

import { QuestionCard } from "@/components/onboarding/QuestionCard";
import { HabitSelector } from "@/components/onboarding/HabitSelector";
import { PrimaryButton } from "@/components/onboarding/PrimaryButton";
import { SecondaryButton } from "@/components/onboarding/SecondaryButton";

interface HabitCountStepProps {
  habitCount: number;
  onHabitCountChange: (value: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export function HabitCountStep({
  habitCount,
  onHabitCountChange,
  onNext,
  onBack,
}: HabitCountStepProps) {
  return (
    <QuestionCard
      eyebrow="Plant the first seeds"
      title="How many habits do you want to begin with?"
      description="Fewer habits, kept consistently, grow a stronger garden than many kept for a week."
      footer={
        <div className="flex items-center justify-center gap-3">
          <SecondaryButton type="button" onClick={onBack}>
            Back
          </SecondaryButton>
          <PrimaryButton type="button" onClick={onNext}>
            Continue
          </PrimaryButton>
        </div>
      }
    >
      <HabitSelector value={habitCount} onChange={onHabitCountChange} />
    </QuestionCard>
  );
}
