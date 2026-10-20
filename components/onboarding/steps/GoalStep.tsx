"use client";

import { QuestionCard } from "@/components/onboarding/QuestionCard";
import { GoalSelector } from "@/components/onboarding/GoalSelector";
import { PrimaryButton } from "@/components/onboarding/PrimaryButton";
import { SecondaryButton } from "@/components/onboarding/SecondaryButton";
import type { GoalId } from "@/types/onboarding";

interface GoalStepProps {
  goal: GoalId | null;
  onGoalChange: (goal: GoalId) => void;
  customGoal: string;
  onCustomGoalChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function GoalStep({
  goal,
  onGoalChange,
  customGoal,
  onCustomGoalChange,
  onNext,
  onBack,
}: GoalStepProps) {
  const canContinue = goal !== null && (goal !== "custom" || customGoal.trim().length > 0);

  return (
    <QuestionCard
      eyebrow="Set your direction"
      title="What do you want to improve?"
      description="Pick the one that matters most right now — you can always plant more later."
      footer={
        <div className="flex items-center justify-center gap-3">
          <SecondaryButton type="button" onClick={onBack}>
            Back
          </SecondaryButton>
          <PrimaryButton type="button" onClick={onNext} disabled={!canContinue}>
            Continue
          </PrimaryButton>
        </div>
      }
    >
      <GoalSelector
        selected={goal}
        onSelect={onGoalChange}
        customGoal={customGoal}
        onCustomGoalChange={onCustomGoalChange}
      />
    </QuestionCard>
  );
}
