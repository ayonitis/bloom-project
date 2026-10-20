import { PlantVisual } from "@/components/habits/PlantVisual";
import { calculatePlantGrowthPercent, getPlantGrowthStage } from "@/lib/progression/plantGrowth";
import { GROWTH_STAGE_LABELS } from "@/types/garden";
import { PLANT_MAP } from "@/lib/habitCatalog";
import type { Habit } from "@/types/habit";

interface PlantCollectionCardProps {
  habit: Habit;
}

export function PlantCollectionCard({ habit }: PlantCollectionCardProps) {
  const growthPercent = calculatePlantGrowthPercent(habit.totalXP, habit.difficulty);
  const stage = getPlantGrowthStage(growthPercent);
  const plantOption = PLANT_MAP[habit.plantSpecies];

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-black/5 bg-white/70 p-4 text-center shadow-[0_16px_36px_-26px_rgba(38,54,58,0.2)]">
      <PlantVisual species={habit.plantSpecies} growth={growthPercent} size={56} />
      <p className="font-[family-name:var(--font-heading)] text-sm font-semibold text-bloom-text">
        {plantOption?.name ?? habit.plantSpecies}
      </p>
      <p className="text-xs text-bloom-muted">
        {GROWTH_STAGE_LABELS[stage]} · {growthPercent}%
      </p>
      <p className="truncate text-xs text-bloom-muted/80">for &ldquo;{habit.title}&rdquo;</p>
    </div>
  );
}
