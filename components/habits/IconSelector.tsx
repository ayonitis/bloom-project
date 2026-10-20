"use client";

import { motion } from "framer-motion";
import { ICON_OPTIONS } from "@/lib/habitCatalog";
import { cn } from "@/lib/utils";

interface IconSelectorProps {
  selected: string | null;
  onSelect: (iconId: string) => void;
}

export function IconSelector({ selected, onSelect }: IconSelectorProps) {
  return (
    <div
      className="grid grid-cols-4 gap-2.5 sm:grid-cols-6"
      role="radiogroup"
      aria-label="Habit icon"
    >
      {ICON_OPTIONS.map((option, index) => {
        const isSelected = selected === option.id;
        return (
          <motion.button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={option.label}
            title={option.label}
            onClick={() => onSelect(option.id)}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: index * 0.02, ease: "easeOut" }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.94 }}
            className={cn(
              "focus-ring flex aspect-square items-center justify-center rounded-2xl border transition-colors duration-200",
              isSelected
                ? "border-bloom-accent/50 bg-bloom-accent/10 text-bloom-accent-dark"
                : "border-black/5 bg-white/60 text-bloom-text/70 hover:border-bloom-accent/30 hover:bg-white/80"
            )}
          >
            <option.icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </motion.button>
        );
      })}
    </div>
  );
}
