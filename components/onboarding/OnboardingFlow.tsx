"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { AnimatedTransition } from "@/components/onboarding/AnimatedTransition";
import { WelcomeStep } from "@/components/onboarding/steps/WelcomeStep";
import { NameStep } from "@/components/onboarding/steps/NameStep";
import { GoalStep } from "@/components/onboarding/steps/GoalStep";
import { HabitCountStep } from "@/components/onboarding/steps/HabitCountStep";
import { MeetSpiritStep } from "@/components/onboarding/steps/MeetSpiritStep";
import { SignUpStep } from "@/components/onboarding/steps/SignUpStep";
import { FinalStep } from "@/components/onboarding/steps/FinalStep";
import { saveOnboardingData } from "@/lib/onboardingStorage";
import { INITIAL_ONBOARDING_DATA } from "@/types/onboarding";
import type { GoalId, OnboardingData } from "@/types/onboarding";

const TOTAL_QUESTION_STEPS = 6;
const FINAL_STEP = 7;

export function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL_ONBOARDING_DATA);

  function updateData(patch: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function goNext() {
    setStep((prev) => Math.min(FINAL_STEP, prev + 1));
  }

  function goBack() {
    setStep((prev) => Math.max(1, prev - 1));
  }

  const progress =
    step <= TOTAL_QUESTION_STEPS
      ? { currentStep: step, totalSteps: TOTAL_QUESTION_STEPS }
      : undefined;

  return (
    <OnboardingLayout progress={progress} quoteSeed={step}>
      <AnimatePresence mode="wait">
        {step === 1 && (
          <AnimatedTransition stepKey="welcome">
            <WelcomeStep onNext={goNext} />
          </AnimatedTransition>
        )}

        {step === 2 && (
          <AnimatedTransition stepKey="name">
            <NameStep
              name={data.name}
              onNameChange={(name) => updateData({ name })}
              onNext={goNext}
              onBack={goBack}
            />
          </AnimatedTransition>
        )}

        {step === 3 && (
          <AnimatedTransition stepKey="goal">
            <GoalStep
              goal={data.goal}
              onGoalChange={(goal: GoalId) => updateData({ goal })}
              customGoal={data.customGoal}
              onCustomGoalChange={(customGoal) => updateData({ customGoal })}
              onNext={goNext}
              onBack={goBack}
            />
          </AnimatedTransition>
        )}

        {step === 4 && (
          <AnimatedTransition stepKey="habits">
            <HabitCountStep
              habitCount={data.habitCount}
              onHabitCountChange={(habitCount) => updateData({ habitCount })}
              onNext={goNext}
              onBack={goBack}
            />
          </AnimatedTransition>
        )}

        {step === 5 && (
          <AnimatedTransition stepKey="spirit">
            <MeetSpiritStep name={data.name} onNext={goNext} />
          </AnimatedTransition>
        )}

        {step === 6 && (
          <AnimatedTransition stepKey="signup">
            <SignUpStep
              name={data.name}
              email={data.email}
              onEmailChange={(email) => updateData({ email })}
              onNext={() => {
                saveOnboardingData({ ...data, authMethod: "email" });
                goNext();
              }}
              onBack={goBack}
            />
          </AnimatedTransition>
        )}

        {step === FINAL_STEP && (
          <AnimatedTransition stepKey="final">
            <FinalStep />
          </AnimatedTransition>
        )}
      </AnimatePresence>
    </OnboardingLayout>
  );
}
