import type { AchievementStatistics, GardenStatistics } from "@/types/statistics";

interface GardenAndAchievementStatsProps {
  garden: GardenStatistics;
  achievements: AchievementStatistics;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="font-semibold text-bloom-text">{value}</p>
      <p className="text-xs text-bloom-muted">{label}</p>
    </div>
  );
}

export function GardenAndAchievementStats({ garden, achievements }: GardenAndAchievementStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
        <p className="font-[family-name:var(--font-heading)] text-sm font-semibold text-bloom-text">
          🌳 Garden Progress
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <Stat label="Plants grown" value={garden.plantsGrown} />
          <Stat label="Fully grown" value={garden.fullyGrownPlants} />
          <Stat label="Avg. growth" value={`${garden.averageGrowthPercent}%`} />
          <Stat label="Decorations owned" value={garden.decorationsOwned} />
          <Stat label="Decorations placed" value={garden.decorationsPlaced} />
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
        <p className="font-[family-name:var(--font-heading)] text-sm font-semibold text-bloom-text">
          🏆 {achievements.unlocked} / {achievements.total} Achievements
        </p>
        {achievements.recentName && (
          <p className="mt-2 text-sm text-bloom-muted">Most recent: {achievements.recentName}</p>
        )}
        {achievements.nextMilestone ? (
          <div className="mt-3">
            <p className="text-sm text-bloom-text">
              {Math.max(0, achievements.nextMilestone.targetValue - achievements.nextMilestone.currentValue)} away from
              &ldquo;{achievements.nextMilestone.name}&rdquo;
            </p>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
              <div
                className="h-full rounded-full bg-bloom-accent"
                style={{ width: `${achievements.nextMilestone.percent}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-bloom-muted">
            {achievements.unlocked === achievements.total && achievements.total > 0
              ? "All achievements unlocked!"
              : "Keep going — your next milestone will appear here."}
          </p>
        )}
      </div>
    </div>
  );
}
