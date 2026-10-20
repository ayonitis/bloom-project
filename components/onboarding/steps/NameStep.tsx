"use client";

import { QuestionCard } from "@/components/onboarding/QuestionCard";
import { PrimaryButton } from "@/components/onboarding/PrimaryButton";
import { SecondaryButton } from "@/components/onboarding/SecondaryButton";

interface NameStepProps {
  name: string;
  onNameChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function NameStep({ name, onNameChange, onNext, onBack }: NameStepProps) {
  const canContinue = name.trim().length > 0;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canContinue) onNext();
      }}
    >
      <QuestionCard
        eyebrow="Let's get acquainted"
        title="What's your name?"
        description="Your Garden Spirit likes to know who it's growing with."
        footer={
          <div className="flex items-center justify-center gap-3">
            <SecondaryButton type="button" onClick={onBack}>
              Back
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={!canContinue}>
              Continue
            </PrimaryButton>
          </div>
        }
      >
        <input
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          maxLength={40}
          autoFocus
          className="focus-ring w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-center text-base text-bloom-text placeholder:text-bloom-muted/70"
        />
      </QuestionCard>
    </form>
  );
}
