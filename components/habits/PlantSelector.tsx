"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PLANT_OPTIONS } from "@/lib/habitCatalog";
import { PlantVisual } from "@/components/habits/PlantVisual";
import { cn } from "@/lib/utils";
import type { PlantSpeciesId } from "@/types/habit";

interface PlantSelectorProps {
  selected: PlantSpeciesId;
  onSelect: (species: PlantSpeciesId) => void;
}

export function PlantSelector({ selected, onSelect }: PlantSelectorProps) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Assigned plant">
        {PLANT_OPTIONS.map((plant, index) => {
          const isSelected = selected === plant.id;
          return (
            <motion.button
              key={plant.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(plant.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "focus-ring relative flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-4 text-center transition-colors duration-200",
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
              <PlantVisual species={plant.id} growth={100} size={48} />
              <span className="font-[family-name:var(--font-heading)] text-sm font-medium text-bloom-text">
                {plant.name}
              </span>
              <span className="text-[11px] leading-tight text-bloom-muted">{plant.goodFor}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
