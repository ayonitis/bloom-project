"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { CATEGORY_OPTIONS } from "@/lib/habitCatalog";
import { cn } from "@/lib/utils";
import type { HabitCategoryId } from "@/types/habit";

interface CategorySelectorProps {
  selected: HabitCategoryId | null;
  onSelect: (category: HabitCategoryId) => void;
}

export function CategorySelector({ selected, onSelect }: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Habit category">
      {CATEGORY_OPTIONS.map((category, index) => {
        const isSelected = selected === category.id;
        return (
          <motion.button
            key={category.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(category.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "focus-ring relative flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center transition-colors duration-200",
              isSelected
                ? "border-bloom-accent/50 bg-bloom-accent/10"
                : "border-black/5 bg-white/60 hover:border-bloom-accent/30 hover:bg-white/80"
            )}
          >
            {isSelected && (
              <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-bloom-accent text-white">
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
            )}
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: category.bg, color: category.color }}
            >
              <category.icon className="h-4.5 w-4.5" strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="font-[family-name:var(--font-heading)] text-sm font-medium text-bloom-text">
              {category.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
