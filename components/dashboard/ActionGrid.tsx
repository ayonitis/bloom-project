"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { QUICK_ACTIONS } from "@/lib/mockData";

function ActionGridComponent() {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-bloom-text">
        Quick Actions
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {QUICK_ACTIONS.map((action, index) => (
          <motion.button
            key={action.id}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="focus-ring group relative flex flex-col items-center gap-2 rounded-2xl border border-black/5 bg-white/70 px-3 py-4 text-center shadow-[0_16px_36px_-24px_rgba(38,54,58,0.18)] backdrop-blur-sm transition-colors hover:bg-white/90"
          >
            {!action.available && (
              <span className="absolute right-2 top-2 rounded-full bg-bloom-text/8 px-1.5 py-0.5 text-[9px] font-medium text-bloom-muted">
                Soon
              </span>
            )}
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-bloom-accent/10 text-bloom-accent-dark transition-transform duration-300 group-hover:scale-110">
              <action.icon className="h-4.5 w-4.5" strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="font-[family-name:var(--font-heading)] text-xs font-medium text-bloom-text sm:text-sm">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export const ActionGrid = memo(ActionGridComponent);
