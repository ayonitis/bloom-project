"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { CategorySelector } from "@/components/habits/CategorySelector";
import { IconSelector } from "@/components/habits/IconSelector";
import { FrequencySelector } from "@/components/habits/FrequencySelector";
import { DifficultySelector } from "@/components/habits/DifficultySelector";
import { PlantSelector } from "@/components/habits/PlantSelector";
import { PlantVisual } from "@/components/habits/PlantVisual";
import {
  CATEGORY_DEFAULT_PLANT,
  CATEGORY_MAP,
  DIFFICULTY_MAP,
  ICON_MAP,
  formatFrequency,
} from "@/lib/habitCatalog";
import { cn } from "@/lib/utils";
import type { Habit, HabitCategoryId, HabitDraft } from "@/types/habit";

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (draft: HabitDraft) => Promise<{ ok: boolean; error?: string }>;
  editingHabit: Habit | null;
}

const TOTAL_STEPS = 6;
const STEP_LABELS = ["Name", "Category", "Icon", "Frequency", "Difficulty", "Plant"];

function emptyDraft(): HabitDraft {
  return {
    title: "",
    description: "",
    iconId: "",
    category: "health",
    difficulty: "easy",
    frequency: { type: "daily", customDays: [] },
    reminderTime: null,
    plantSpecies: "fern",
  };
}

function habitToDraft(habit: Habit): HabitDraft {
  return {
    title: habit.title,
    description: habit.description,
    iconId: habit.iconId,
    category: habit.category,
    difficulty: habit.difficulty,
    frequency: habit.frequency,
    reminderTime: habit.reminderTime,
    plantSpecies: habit.plantSpecies,
  };
}

export function HabitModal({ isOpen, onClose, onSubmit, editingHabit }: HabitModalProps) {
  const titleId = useId();
  const [step, setStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1]));
  const [draft, setDraft] = useState<HabitDraft>(emptyDraft());
  const [hasPickedPlant, setHasPickedPlant] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditing = editingHabit !== null;

  // Reset to a clean slate every time the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setVisitedSteps(new Set([1]));
    setHasPickedPlant(isEditing);
    setDraft(editingHabit ? habitToDraft(editingHabit) : emptyDraft());
    setIsSubmitting(false);
    setSubmitError(null);
  }, [isOpen, editingHabit, isEditing]);

  function updateDraft(patch: Partial<HabitDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function handleCategorySelect(category: HabitCategoryId) {
    updateDraft({
      category,
      // Suggest a matching plant automatically, unless the person has
      // already made a deliberate choice on step 6.
      plantSpecies: hasPickedPlant ? draft.plantSpecies : CATEGORY_DEFAULT_PLANT[category],
    });
  }

  const isStepValid = useMemo(() => {
    switch (step) {
      case 1:
        return draft.title.trim().length > 0;
      case 2:
        return Boolean(draft.category);
      case 3:
        return Boolean(draft.iconId);
      case 4:
        return draft.frequency.type !== "custom" || draft.frequency.customDays.length > 0;
      default:
        return true;
    }
  }, [step, draft]);

  function goToStep(target: number) {
    // The step dots may only jump forward to a step that's already been
    // visited (or freely, when editing an existing habit). Moving forward
    // one step via the Continue button is handled separately in
    // handleNext, since that's always a valid forward move.
    if (target > step && !visitedSteps.has(target) && !isEditing) return;
    setSubmitError(null);
    setStep(target);
    setVisitedSteps((prev) => new Set(prev).add(target));
  }

  async function handleNext() {
    if (!isStepValid || isSubmitting) return;
    if (step >= TOTAL_STEPS) {
      setIsSubmitting(true);
      setSubmitError(null);
      const result = await onSubmit(draft);
      setIsSubmitting(false);
      if (result.ok) {
        onClose();
      } else {
        setSubmitError(result.error ?? "Something went wrong. Please try again.");
      }
      return;
    }
    const nextStep = step + 1;
    setSubmitError(null);
    setStep(nextStep);
    setVisitedSteps((prev) => new Set(prev).add(nextStep));
  }

  function handleBack() {
    if (isSubmitting) return;
    if (step === 1) {
      onClose();
      return;
    }
    goToStep(step - 1);
  }

  const selectedIcon = draft.iconId ? ICON_MAP[draft.iconId] : null;
  const selectedCategory = CATEGORY_MAP[draft.category];

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId={titleId} className="max-w-lg">
      <div className="flex items-center justify-between border-b border-black/5 px-6 py-4 sm:px-8">
        <div>
          <p
            id={titleId}
            className="font-[family-name:var(--font-heading)] text-lg font-semibold text-bloom-text"
          >
            {isEditing ? "Edit Habit" : "Plant a New Habit"}
          </p>
          <p className="text-xs text-bloom-muted">
            Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close"
          className="focus-ring flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-bloom-text/70 transition-colors hover:bg-black/[0.03] disabled:pointer-events-none disabled:opacity-40"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-center gap-2 px-6 py-4 sm:px-8">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((dot) => {
          const reachable = (isEditing || visitedSteps.has(dot)) && !isSubmitting;
          return (
            <button
              key={dot}
              type="button"
              onClick={() => reachable && goToStep(dot)}
              disabled={!reachable}
              aria-label={`Go to step ${dot}: ${STEP_LABELS[dot - 1]}`}
              aria-current={step === dot ? "step" : undefined}
              className={cn(
                "focus-ring h-2 rounded-full transition-all duration-300",
                step === dot ? "w-6 bg-bloom-accent" : "w-2 bg-bloom-text/15",
                reachable && step !== dot && "hover:bg-bloom-text/30"
              )}
            />
          );
        })}
      </div>

      <div className="min-h-[280px] px-6 pb-2 sm:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="habit-title"
                    className="mb-1.5 block text-sm font-medium text-bloom-text"
                  >
                    Habit name
                  </label>
                  <input
                    id="habit-title"
                    type="text"
                    value={draft.title}
                    onChange={(event) => updateDraft({ title: event.target.value })}
                    placeholder="e.g. Drink Water"
                    maxLength={50}
                    autoFocus
                    className="focus-ring w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-bloom-text placeholder:text-bloom-muted/70"
                  />
                </div>
                <div>
                  <label
                    htmlFor="habit-description"
                    className="mb-1.5 block text-sm font-medium text-bloom-text"
                  >
                    Description <span className="text-bloom-muted">(optional)</span>
                  </label>
                  <textarea
                    id="habit-description"
                    value={draft.description}
                    onChange={(event) => updateDraft({ description: event.target.value })}
                    placeholder="What does doing this well look like?"
                    maxLength={140}
                    rows={3}
                    className="focus-ring w-full resize-none rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-bloom-text placeholder:text-bloom-muted/70"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <CategorySelector selected={draft.category} onSelect={handleCategorySelect} />
            )}

            {step === 3 && (
              <IconSelector
                selected={draft.iconId || null}
                onSelect={(iconId) => updateDraft({ iconId })}
              />
            )}

            {step === 4 && (
              <div className="flex flex-col gap-5">
                <FrequencySelector
                  frequency={draft.frequency}
                  onChange={(frequency) => updateDraft({ frequency })}
                />
                <div>
                  <label
                    htmlFor="habit-reminder"
                    className="mb-1.5 block text-sm font-medium text-bloom-text"
                  >
                    Reminder time <span className="text-bloom-muted">(optional)</span>
                  </label>
                  <input
                    id="habit-reminder"
                    type="time"
                    value={draft.reminderTime ?? ""}
                    onChange={(event) =>
                      updateDraft({ reminderTime: event.target.value || null })
                    }
                    className="focus-ring w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-bloom-text sm:w-48"
                  />
                </div>
              </div>
            )}

            {step === 5 && (
              <DifficultySelector
                selected={draft.difficulty}
                onSelect={(difficulty) => updateDraft({ difficulty })}
              />
            )}

            {step === 6 && (
              <div className="flex flex-col gap-5">
                <PlantSelector
                  selected={draft.plantSpecies}
                  onSelect={(plantSpecies) => {
                    setHasPickedPlant(true);
                    updateDraft({ plantSpecies });
                  }}
                />

                <div className="flex items-center gap-4 rounded-2xl border border-bloom-accent/20 bg-bloom-accent/[0.06] p-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/70">
                    <PlantVisual species={draft.plantSpecies} growth={8} size={44} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-[family-name:var(--font-heading)] text-sm font-semibold text-bloom-text">
                      {draft.title || "Your habit"}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-bloom-muted">
                      {selectedIcon && (
                        <span className="inline-flex items-center gap-1">
                          <selectedIcon.icon className="h-3 w-3" aria-hidden="true" />
                          {selectedIcon.label}
                        </span>
                      )}
                      <span>·</span>
                      <span style={{ color: selectedCategory.color }}>{selectedCategory.label}</span>
                      <span>·</span>
                      <span>{formatFrequency(draft.frequency)}</span>
                      <span>·</span>
                      <span>+{DIFFICULTY_MAP[draft.difficulty].xpReward} XP</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3 border-t border-black/5 px-6 py-4 sm:px-8">
        {submitError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="rounded-xl bg-red-500/8 px-3.5 py-2.5 text-sm text-red-600"
          >
            {submitError}
          </motion.p>
        )}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={isSubmitting}
            className="focus-ring flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-bloom-text/70 transition-colors hover:text-bloom-text disabled:pointer-events-none disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
            {step === 1 ? "Cancel" : "Back"}
          </button>
          <motion.button
            type="button"
            onClick={handleNext}
            disabled={!isStepValid || isSubmitting}
            whileHover={isStepValid && !isSubmitting ? { y: -2 } : undefined}
            whileTap={isStepValid && !isSubmitting ? { scale: 0.97 } : undefined}
            className="focus-ring flex items-center gap-2 rounded-full bg-bloom-primary px-6 py-2.5 font-[family-name:var(--font-heading)] text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(245,166,35,0.55)] transition-shadow duration-300 hover:shadow-[0_14px_32px_-8px_rgba(245,166,35,0.7)] disabled:pointer-events-none disabled:opacity-40"
          >
            {step >= TOTAL_STEPS ? (
              <>
                <Sparkles className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
                {isSubmitting ? (isEditing ? "Saving…" : "Creating…") : isEditing ? "Save Changes" : "Create Habit"}
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}
