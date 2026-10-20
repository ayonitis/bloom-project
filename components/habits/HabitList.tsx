"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { HabitCard } from "@/components/habits/HabitCard";
import type { Habit } from "@/types/habit";
import type { MutationResult } from "@/hooks/useHabits";

interface HabitHandlers {
  onToggleComplete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => Promise<MutationResult>;
}

interface HabitListProps extends HabitHandlers {
  habits: Habit[];
  canReorder: boolean;
  onReorder: (orderedIds: string[]) => void;
  pendingIds: Set<string>;
}

interface DraggableHabitItemProps extends HabitHandlers {
  habit: Habit;
  isPending: boolean;
}

function DraggableHabitItem({ habit, isPending, ...handlers }: DraggableHabitItemProps) {
  const dragControls = useDragControls();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Reorder.Item
      value={habit.id}
      dragListener={false}
      dragControls={dragControls}
      as="li"
      className="list-none"
      // Reorder.Item also gets a `transform` from Framer Motion, which opens
      // its own stacking context. Raise it while this item's action menu is
      // open so the menu isn't covered by a later sibling card.
      style={{ zIndex: isMenuOpen ? 30 : undefined, position: "relative" }}
    >
      <HabitCard
        habit={habit}
        isPending={isPending}
        dragControls={dragControls}
        onMenuOpenChange={setIsMenuOpen}
        {...handlers}
      />
    </Reorder.Item>
  );
}

export function HabitList({
  habits,
  canReorder,
  onReorder,
  pendingIds,
  onToggleComplete,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}: HabitListProps) {
  const handlers = { onToggleComplete, onEdit, onArchive, onUnarchive, onDelete };

  if (!canReorder) {
    return (
      <ul className="flex list-none flex-col gap-2.5 p-0">
        {habits.map((habit) => (
          <li key={habit.id}>
            <HabitCard habit={habit} isPending={pendingIds.has(habit.id)} {...handlers} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Reorder.Group
      as="ul"
      axis="y"
      values={habits.map((h) => h.id)}
      onReorder={onReorder}
      className="flex list-none flex-col gap-2.5 p-0"
    >
      {habits.map((habit) => (
        <DraggableHabitItem
          key={habit.id}
          habit={habit}
          isPending={pendingIds.has(habit.id)}
          {...handlers}
        />
      ))}
    </Reorder.Group>
  );
}
