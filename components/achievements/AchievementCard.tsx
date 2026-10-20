import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAchievementIcon } from "@/components/achievements/achievementIcons";
import type { AchievementRarity, AchievementView } from "@/types/achievement";

const RARITY_STYLES: Record<AchievementRarity, { ring: string; badge: string; label: string }> = {
  common: { ring: "ring-black/5", badge: "bg-bloom-muted/15 text-bloom-muted", label: "Common" },
  rare: { ring: "ring-sky-400/30", badge: "bg-sky-100 text-sky-700", label: "Rare" },
  epic: { ring: "ring-bloom-primary/30", badge: "bg-bloom-primary/15 text-bloom-primary-dark", label: "Epic" },
  legendary: { ring: "ring-bloom-accent/40", badge: "bg-bloom-accent/15 text-bloom-accent-dark", label: "Legendary" },
};

function formatUnlockDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function AchievementCard({ achievement }: { achievement: AchievementView }) {
  const Icon = getAchievementIcon(achievement.icon);
  const rarity = RARITY_STYLES[achievement.rarity];

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-2xl border border-black/5 p-4 shadow-[0_16px_36px_-26px_rgba(38,54,58,0.2)] transition-shadow",
        achievement.isUnlocked ? cn("bg-white/80 ring-1", rarity.ring) : "bg-white/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
            achievement.isUnlocked ? "bg-bloom-accent/15 text-bloom-accent-dark" : "bg-black/5 text-bloom-muted"
          )}
        >
          {achievement.isUnlocked ? (
            <Icon className="h-5 w-5" strokeWidth={2} />
          ) : (
            <Lock className="h-4.5 w-4.5" strokeWidth={2} />
          )}
        </span>

        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", rarity.badge)}>{rarity.label}</span>
      </div>

      <div className="min-w-0">
        <p
          className={cn(
            "truncate font-[family-name:var(--font-heading)] text-base font-semibold",
            achievement.isUnlocked ? "text-bloom-text" : "text-bloom-text/70"
          )}
        >
          {achievement.name}
        </p>
        <p className={cn("mt-0.5 text-sm leading-snug", achievement.isUnlocked ? "text-bloom-muted" : "text-bloom-muted/80")}>
          {achievement.description}
        </p>
      </div>

      {achievement.isUnlocked && achievement.unlockedAt ? (
        <p className="text-xs text-bloom-muted">Unlocked {formatUnlockDate(achievement.unlockedAt)}</p>
      ) : achievement.progress ? (
        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full rounded-full bg-bloom-accent transition-all"
              style={{ width: `${achievement.progress.percent}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-bloom-muted">
            {achievement.progress.currentValue} / {achievement.progress.targetValue}
          </p>
        </div>
      ) : null}

      <div className="mt-auto flex items-center justify-between pt-1">
        <span className="text-xs font-medium text-bloom-accent-dark">+{achievement.rewardXP} XP</span>
      </div>
    </div>
  );
}
