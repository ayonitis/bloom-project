"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { AnchoredPanel } from "@/components/garden/AnchoredPanel";
import { PlantVisual } from "@/components/habits/PlantVisual";
import { CATEGORY_MAP, ICON_MAP, PLANT_MAP } from "@/lib/habitCatalog";
import {
  PLANT_FACTS,
  getDaysUntilNextStage,
  getMockGrowthHistory,
  getMotivationalMessage,
  getPercentToNextStage,
} from "@/lib/gardenEngine";
import { GROWTH_STAGE_LABELS } from "@/types/garden";
import type { GardenPlant } from "@/types/garden";

interface PlantDetailsPanelProps {
  plant: GardenPlant | null;
  anchor: HTMLElement | null;
  onClose: () => void;
}

function GrowthSparkline({ points }: { points: number[] }) {
  const width = 240;
  const height = 56;
  const step = width / (points.length - 1);
  const path = points
    .map((value, index) => `${index === 0 ? "M" : "L"} ${index * step} ${height - (value / 100) * height}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-14 w-full" role="img" aria-label="Growth trend over recent weeks">
      <path d={path} fill="none" stroke="#3BB273" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlantDetailsPanel({ plant, anchor, onClose }: PlantDetailsPanelProps) {
  const titleId = useId();
  if (!plant) return null;

  const habit = plant.assignedHabit;
  const IconComponent = ICON_MAP[habit.iconId]?.icon;
  const category = CATEGORY_MAP[habit.category];
  const plantOption = PLANT_MAP[plant.species];
  const history = getMockGrowthHistory(habit);
  const { nextStage, percentRemaining } = getPercentToNextStage(plant.growthPercent);
  const daysUntilNext = getDaysUntilNextStage(percentRemaining, habit);
  const facts = PLANT_FACTS[plant.species];
  const xpEarned = habit.totalXP;
  const message = getMotivationalMessage(
    plant.growthStage,
    plant.name,
    habit.currentStreak,
    nextStage ? GROWTH_STAGE_LABELS[nextStage] : null
  );

  return (
    <AnchoredPanel anchor={anchor} titleId={titleId} onClose={onClose} width={320}>
      <div className="relative p-5 sm:p-6">
        <div
          className="pointer-events-none absolute -top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full opacity-40 blur-2xl"
          style={{ background: "radial-gradient(circle, rgba(245,166,35,0.6) 0%, transparent 70%)" }}
          aria-hidden
        />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate font-[family-name:var(--font-heading)] text-lg font-semibold text-bloom-text">
              {plant.name}
            </h2>
            <p className="mt-0.5 truncate text-xs text-bloom-muted">
              {plantOption?.name} · {GROWTH_STAGE_LABELS[plant.growthStage]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close plant details"
            className="focus-ring flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/10 text-bloom-text transition-transform hover:-translate-y-0.5"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        <div className="relative mt-4 flex items-center gap-3 rounded-2xl border border-black/5 bg-white/70 p-3">
          <motion.div
            key={plant.growthStage}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            <PlantVisual species={plant.species} growth={plant.growthPercent} size={48} />
          </motion.div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-[11px] text-bloom-muted">
              <span>Growth</span>
              <span className="font-medium text-bloom-accent-dark">{plant.growthPercent}%</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/5">
              <motion.div
                className="h-full rounded-full bg-bloom-accent"
                initial={{ width: 0 }}
                animate={{ width: `${plant.growthPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            {nextStage ? (
              <p className="mt-1.5 text-[11px] text-bloom-muted">
                {daysUntilNext} day{daysUntilNext === 1 ? "" : "s"} to{" "}
                <span className="font-medium text-bloom-text">{GROWTH_STAGE_LABELS[nextStage]}</span>
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] font-medium text-bloom-primary-dark">Fully evolved</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-bloom-muted">Assigned habit</p>
          <div
            className="mt-1.5 flex items-center gap-2.5 rounded-2xl border border-black/5 p-2.5"
            style={{ backgroundColor: category?.bg }}
          >
            {IconComponent && (
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70"
                style={{ color: category?.color }}
              >
                <IconComponent className="h-4 w-4" strokeWidth={2} />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-bloom-text">{habit.title}</p>
              <p className="truncate text-[11px] text-bloom-muted">
                {category?.label} · 🔥 {habit.currentStreak}-day streak
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-black/5 bg-white/70 py-2">
            <p className="text-sm font-semibold text-bloom-text">{habit.totalCompletions}</p>
            <p className="text-[10px] text-bloom-muted">Completions</p>
          </div>
          <div className="rounded-xl border border-black/5 bg-white/70 py-2">
            <p className="text-sm font-semibold text-bloom-text">{xpEarned}</p>
            <p className="text-[10px] text-bloom-muted">XP earned</p>
          </div>
          <div className="rounded-xl border border-black/5 bg-white/70 py-2">
            <p className="text-sm font-semibold text-bloom-text">{habit.longestStreak}</p>
            <p className="text-[10px] text-bloom-muted">Best streak</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-bloom-muted">Growth history</p>
          <div className="mt-1.5 rounded-2xl border border-black/5 bg-white/70 p-2.5">
            <GrowthSparkline points={history} />
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-bloom-accent/10 p-3 text-sm leading-snug text-bloom-accent-dark">
          {message}
        </div>

        {facts && facts.length > 0 && (
          <div className="mt-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-bloom-muted">Plant facts</p>
            <ul className="mt-1.5 list-none space-y-1.5 p-0">
              {facts.map((fact) => (
                <li key={fact} className="flex gap-2 text-xs text-bloom-text/80">
                  <span aria-hidden>🌿</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AnchoredPanel>
  );
}
