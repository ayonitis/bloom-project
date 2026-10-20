"use client";

import { AnimatePresence, motion } from "framer-motion";
import { getAchievementIcon } from "@/components/achievements/achievementIcons";
import type { AchievementUnlockResult } from "@/types/achievement";

interface AchievementNotificationProps {
  achievement: AchievementUnlockResult | null;
  onDismiss: () => void;
}

/** Renders at most one toast at a time — the caller
 *  (hooks/useAchievementNotifications) is responsible for queuing so
 *  multiple unlocks from one action don't stack. Auto-dismiss timing also
 *  lives in that hook; this component only handles presentation. Never
 *  blocks input, never uses a browser alert. */
export function AchievementNotification({ achievement, onDismiss }: AchievementNotificationProps) {
  const Icon = achievement ? getAchievementIcon(achievement.icon) : null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex justify-center px-4 sm:top-6">
      <AnimatePresence mode="wait">
        {achievement && Icon && (
          <motion.div
            key={achievement.id}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-white/50 bg-white/90 p-4 shadow-[0_24px_60px_-24px_rgba(38,54,58,0.4)] backdrop-blur-md"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bloom-accent/15 text-bloom-accent-dark">
              <Icon className="h-5 w-5" strokeWidth={2} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-bloom-accent-dark">
                🌱 Achievement Unlocked
              </p>
              <p className="mt-0.5 truncate font-[family-name:var(--font-heading)] text-base font-semibold text-bloom-text">
                {achievement.name}
              </p>
              <p className="mt-0.5 text-sm text-bloom-muted">{achievement.description}</p>
              <p className="mt-1 text-xs font-medium text-bloom-accent-dark">+{achievement.rewardXP} XP</p>
            </div>

            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss notification"
              className="focus-ring -mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-bloom-muted transition-colors hover:bg-black/5"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
