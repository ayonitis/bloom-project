import { Coins, Star } from "lucide-react";
import { XPBar } from "@/components/dashboard/XPBar";
import type { PlayerStats } from "@/types/dashboard";

export function LevelCard({ stats }: { stats: PlayerStats }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/70 p-5 shadow-[0_16px_36px_-24px_rgba(38,54,58,0.18)] backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bloom-primary/15 text-bloom-primary-dark">
            <Star className="h-4 w-4" strokeWidth={2.25} fill="currentColor" />
          </span>
          <div>
            <p className="text-xs text-bloom-muted">Level</p>
            <p className="font-[family-name:var(--font-heading)] text-lg font-semibold text-bloom-text">
              {stats.level}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-bloom-primary/10 px-3 py-1.5 text-sm font-medium text-bloom-primary-dark">
          <Coins className="h-3.5 w-3.5" strokeWidth={2.25} />
          {stats.coins}
        </div>
      </div>

      <div className="mt-4">
        <XPBar xp={stats.xp} xpToNextLevel={stats.xpToNextLevel} />
      </div>
    </div>
  );
}
