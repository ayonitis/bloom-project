"use client";

import { motion } from "framer-motion";
import { CATEGORY_OPTIONS, DIFFICULTY_OPTIONS, FREQUENCY_OPTIONS } from "@/lib/habitCatalog";
import { cn } from "@/lib/utils";
import type { HabitFilters, HabitStatusFilter } from "@/types/habit";

interface FilterBarProps {
  filters: HabitFilters;
  onChange: (patch: Partial<HabitFilters>) => void;
  counts: Record<HabitStatusFilter, number>;
}

const STATUS_TABS: { id: HabitStatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "pending", label: "Pending" },
  { id: "archived", label: "Archived" },
];

const SELECT_CLASS =
  "focus-ring rounded-full border border-black/10 bg-white/80 px-3.5 py-2 text-xs font-medium text-bloom-text sm:text-sm";

export function FilterBar({ filters, onChange, counts }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
        {STATUS_TABS.map((tab) => {
          const isActive = filters.status === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange({ status: tab.id })}
              className={cn(
                "focus-ring relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                isActive ? "text-white" : "text-bloom-text/70 hover:text-bloom-text"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="habit-status-pill"
                  className="absolute inset-0 rounded-full bg-bloom-accent"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px]",
                    isActive ? "bg-white/25" : "bg-bloom-text/8 text-bloom-muted"
                  )}
                >
                  {counts[tab.id]}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={filters.category}
          onChange={(event) => onChange({ category: event.target.value as HabitFilters["category"] })}
          aria-label="Filter by category"
          className={SELECT_CLASS}
        >
          <option value="all">All categories</option>
          {CATEGORY_OPTIONS.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>

        <select
          value={filters.difficulty}
          onChange={(event) => onChange({ difficulty: event.target.value as HabitFilters["difficulty"] })}
          aria-label="Filter by difficulty"
          className={SELECT_CLASS}
        >
          <option value="all">All difficulties</option>
          {DIFFICULTY_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.frequency}
          onChange={(event) => onChange({ frequency: event.target.value as HabitFilters["frequency"] })}
          aria-label="Filter by frequency"
          className={SELECT_CLASS}
        >
          <option value="all">All frequencies</option>
          {FREQUENCY_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
