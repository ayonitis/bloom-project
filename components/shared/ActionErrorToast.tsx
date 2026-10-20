"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ActionErrorToastProps {
  message: string | null;
  onDismiss: () => void;
}

/** For mutation failures (e.g. a habit completion/undo that didn't go
 *  through) — distinct from AchievementNotification, and from the
 *  full-page "couldn't load" state, which both have their own components.
 *  Auto-managed by the caller (clear the message on a timeout or the next
 *  successful action); this component only renders what it's given. */
export function ActionErrorToast({ message, onDismiss }: ActionErrorToastProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[150] flex justify-center px-4">
      <AnimatePresence>
        {message && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex max-w-sm items-start gap-2.5 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm shadow-[0_20px_50px_-24px_rgba(38,54,58,0.4)]"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" strokeWidth={2} />
            <p className="text-bloom-text/90">{message}</p>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="focus-ring -mr-1 -mt-0.5 ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-bloom-muted transition-colors hover:bg-black/5"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
