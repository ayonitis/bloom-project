"use client";

import { motion } from "framer-motion";
import { Flame, Trophy } from "lucide-react";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { LevelCard } from "@/components/dashboard/LevelCard";
import type { PlayerStats } from "@/types/dashboard";

interface QuickStatsProps {
  stats: PlayerStats;
  completionPercent: number;
}

function StatTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/70 p-4 shadow-[0_16px_36px_-24px_rgba(38,54,58,0.18)] backdrop-blur-sm">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}1F`, color: accent }}
      >
        {icon}
      </span>
      <div>
        <p className="text-xs text-bloom-muted">{label}</p>
        <p className="font-[family-name:var(--font-heading)] text-lg font-semibold text-bloom-text">
          {value}
        </p>
      </div>
    </div>
  );
}

function WeeklyProgressChart({ values }: { values: number[] }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="rounded-2xl border border-black/5 bg-white/70 p-4 shadow-[0_16px_36px_-24px_rgba(38,54,58,0.18)] backdrop-blur-sm sm:col-span-2">
      <p className="text-xs text-bloom-muted">This week</p>
      <div className="mt-3 flex items-end justify-between gap-2" style={{ height: 64 }}>
        {values.map((value, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-12 w-full items-end overflow-hidden rounded-full bg-bloom-text/8">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.min(100, value)}%` }}
                transition={{ duration: 0.8, delay: i * 0.06, ease: "easeOut" }}
                className="w-full rounded-full bg-gradient-to-t from-bloom-accent to-bloom-secondary"
              />
            </div>
            <span className="text-[10px] text-bloom-muted">{days[i % 7]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuickStats({ stats, completionPercent }: QuickStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
    >
      <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-bloom-text">
        Quick Stats
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon={<Flame className="h-4.5 w-4.5" strokeWidth={2} />}
          label="Current Streak"
          value={`${stats.currentStreak} days`}
          accent="#F5A623"
        />
        <StatTile
          icon={<Trophy className="h-4.5 w-4.5" strokeWidth={2} />}
          label="Longest Streak"
          value={`${stats.longestStreak} days`}
          accent="#5AA9FF"
        />

        <div className="col-span-2 grid grid-cols-2 gap-3 sm:col-span-1 sm:grid-cols-1">
          <LevelCard stats={stats} />
        </div>

        <div className="flex items-center justify-center gap-4 rounded-2xl border border-black/5 bg-white/70 p-4 shadow-[0_16px_36px_-24px_rgba(38,54,58,0.18)] backdrop-blur-sm">
          <ProgressRing value={stats.gardenHealth} size={64} strokeWidth={6} color="#3BB273" />
          <div>
            <p className="text-xs text-bloom-muted">Garden Health</p>
            <p className="font-[family-name:var(--font-heading)] text-sm font-medium text-bloom-text">
              Thriving
            </p>
          </div>
        </div>

        <div className="col-span-2 flex items-center justify-center gap-4 rounded-2xl border border-black/5 bg-white/70 p-4 shadow-[0_16px_36px_-24px_rgba(38,54,58,0.18)] backdrop-blur-sm sm:col-span-1">
          <ProgressRing value={completionPercent} size={64} strokeWidth={6} color="#F5A623" />
          <div>
            <p className="text-xs text-bloom-muted">Today&apos;s Completion</p>
            <p className="font-[family-name:var(--font-heading)] text-sm font-medium text-bloom-text">
              Keep going
            </p>
          </div>
        </div>

        <WeeklyProgressChart values={stats.weeklyProgress} />
      </div>
    </motion.div>
  );
}
