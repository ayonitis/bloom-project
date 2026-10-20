"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { DragControls } from "framer-motion";
import {
  Archive,
  ArchiveRestore,
  Check,
  Flame,
  GripVertical,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { CompletionAnimation } from "@/components/habits/CompletionAnimation";
import { PlantVisual } from "@/components/habits/PlantVisual";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CATEGORY_MAP, ICON_MAP, formatFrequency } from "@/lib/habitCatalog";
import { calculatePlantGrowthPercent } from "@/lib/progression/plantGrowth";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types/habit";
import type { MutationResult } from "@/hooks/useHabits";

interface HabitCardProps {
  habit: Habit;
  onToggleComplete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => Promise<MutationResult>;
  /** True while a create/edit-adjacent mutation for this specific habit is
   *  in flight (archive, unarchive, delete) — disables the actions that
   *  would otherwise let someone fire the same request twice. */
  isPending?: boolean;
  dragControls?: DragControls;
  /** Lets an ancestor (e.g. a drag-reorderable list item) know when the
   * action menu is open, so it can raise its own stacking context too. */
  onMenuOpenChange?: (isOpen: boolean) => void;
}

export function HabitCard({
  habit,
  onToggleComplete,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  isPending = false,
  dragControls,
  onMenuOpenChange,
}: HabitCardProps) {
  const [celebrate, setCelebrate] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const icon = ICON_MAP[habit.iconId];
  const category = CATEGORY_MAP[habit.category];
  const growth = calculatePlantGrowthPercent(habit.totalXP, habit.difficulty);

  // Notifies the parent list item when the menu opens/closes (so it can
  // raise its own stacking context) via an effect reacting to the state
  // change — never from inside setIsMenuOpen's own updater. Calling a
  // different component's setState from within a state updater is
  // unsafe: React can invoke updater functions mid-render, and doing so
  // there previously aborted the render that also carried an in-flight
  // optimistic completion toggle, which is what made the checkbox
  // silently revert a moment after unchecking it.
  useEffect(() => {
    onMenuOpenChange?.(isMenuOpen);
  }, [isMenuOpen, onMenuOpenChange]);

  useEffect(() => {
    if (!celebrate) return;
    const timeout = window.setTimeout(() => setCelebrate(false), 900);
    return () => window.clearTimeout(timeout);
  }, [celebrate]);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen, setIsMenuOpen]);

  function handleToggle() {
    if (isPending) return;
    if (!habit.completedToday) setCelebrate(true);
    onToggleComplete(habit.id);
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    const result = await onDelete(habit.id);
    setIsDeleting(false);
    if (result.ok) {
      setIsConfirmOpen(false);
    } else {
      setDeleteError(result.error ?? "Couldn't delete this habit. Try again.");
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.25 } }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      // Framer Motion applies a `transform` to this element (for the layout /
      // hover / drag animations), which creates a brand-new stacking context.
      // That traps the action menu's z-index inside this card, so an adjacent
      // card later in the DOM (with its own transform-created stacking
      // context) would otherwise render on top of an open menu. Raising the
      // whole card's z-index while its menu is open lifts that stacking
      // context above its siblings so the menu is never clipped or covered.
      style={{ zIndex: isMenuOpen ? 30 : undefined }}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl border px-4 py-4 shadow-[0_16px_36px_-26px_rgba(38,54,58,0.2)] transition-colors duration-300 sm:gap-4",
        habit.completedToday
          ? "border-bloom-accent/25 bg-bloom-accent/[0.06]"
          : "border-black/5 bg-white/75 hover:bg-white/95",
        !habit.active && "opacity-70",
        isPending && "pointer-events-none opacity-60"
      )}
    >
      {dragControls && (
        <button
          type="button"
          onPointerDown={(event) => dragControls.start(event)}
          aria-label={`Reorder ${habit.title}`}
          className="focus-ring hidden shrink-0 cursor-grab touch-none items-center justify-center rounded-lg p-1 text-bloom-text/25 hover:text-bloom-text/50 active:cursor-grabbing sm:flex"
        >
          <GripVertical className="h-4 w-4" strokeWidth={2} />
        </button>
      )}

      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: category.bg, color: category.color }}
      >
        {icon && <icon.icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "truncate font-[family-name:var(--font-heading)] text-sm font-medium text-bloom-text sm:text-base",
              habit.completedToday && "text-bloom-text/60 line-through decoration-bloom-accent/50"
            )}
          >
            {habit.title}
          </p>
          {!habit.active && (
            <span className="shrink-0 rounded-full bg-bloom-text/8 px-2 py-0.5 text-[10px] font-medium text-bloom-muted">
              Archived
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-bloom-muted">
          <span
            className="rounded-full px-2 py-0.5 font-medium"
            style={{ backgroundColor: category.bg, color: category.color }}
          >
            {category.label}
          </span>
          <span>{formatFrequency(habit.frequency)}</span>
          <span className="flex items-center gap-1">
            <Flame className="h-3 w-3 text-bloom-primary" strokeWidth={2.25} aria-hidden="true" />
            {habit.currentStreak}d streak
          </span>
          <span>+{habit.xpReward} XP</span>
        </div>
      </div>

      <div className="hidden shrink-0 flex-col items-center gap-1 sm:flex">
        <PlantVisual species={habit.plantSpecies} growth={growth} size={40} />
        <span className="text-[10px] text-bloom-muted">{growth}% grown</span>
      </div>

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          aria-pressed={habit.completedToday}
          aria-label={`Mark "${habit.title}" as ${habit.completedToday ? "not done" : "done"}`}
          className={cn(
            "focus-ring flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors duration-300 disabled:cursor-not-allowed",
            habit.completedToday
              ? "border-bloom-accent bg-bloom-accent text-white"
              : "border-bloom-text/15 bg-white text-transparent hover:border-bloom-accent/50"
          )}
        >
          <motion.span
            initial={false}
            animate={{ scale: habit.completedToday ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </motion.span>
        </button>
        <CompletionAnimation active={celebrate} xpReward={habit.xpReward} />
      </div>

      <div className="relative shrink-0" ref={menuRef}>
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          disabled={isPending}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          aria-label={`More actions for ${habit.title}`}
          className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-bloom-text/50 transition-colors hover:bg-black/[0.04] hover:text-bloom-text disabled:cursor-not-allowed"
        >
          <MoreVertical className="h-4 w-4" strokeWidth={2} />
        </button>

        {isMenuOpen && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-xl border border-black/5 bg-white py-1.5 shadow-[0_20px_50px_-20px_rgba(38,54,58,0.35)]"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsMenuOpen(false);
                onEdit(habit);
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-bloom-text/80 hover:bg-black/[0.03]"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              Edit
            </button>
            {habit.active ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  onArchive(habit.id);
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-bloom-text/80 hover:bg-black/[0.03]"
              >
                <Archive className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                Archive
              </button>
            ) : (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  onUnarchive(habit.id);
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-bloom-text/80 hover:bg-black/[0.03]"
              >
                <ArchiveRestore className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                Restore
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsMenuOpen(false);
                setDeleteError(null);
                setIsConfirmOpen(true);
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-red-500/90 hover:bg-red-500/5"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              Delete
            </button>
          </motion.div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete this habit?"
        description="Your completion history and plant progress may also be affected."
        confirmLabel="Delete Habit"
        confirmingLabel="Deleting…"
        destructive
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </motion.div>
  );
}
