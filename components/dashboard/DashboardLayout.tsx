"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Sprout, X } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { FloatingBackground } from "@/components/onboarding/FloatingBackground";
import type { ReactNode } from "react";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="relative min-h-svh">
        <FloatingBackground />

        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-black/5 bg-white/70 px-4 py-3 backdrop-blur-md lg:hidden">
          <Link href="/" className="focus-ring flex items-center gap-2 rounded-full">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bloom-accent/15">
              <Sprout className="h-4.5 w-4.5 text-bloom-accent-dark" strokeWidth={2.25} />
            </span>
            <span className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight text-bloom-text">
              Bloom
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open navigation"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/80 text-bloom-text"
          >
            <Menu className="h-4.5 w-4.5" strokeWidth={2} />
          </button>
        </header>

        {/* Mobile drawer */}
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDrawerOpen(false)}
                className="fixed inset-0 z-40 bg-bloom-text/30 backdrop-blur-sm lg:hidden"
                aria-hidden
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
                className="fixed inset-y-0 left-0 z-50 w-72 bg-bloom-bg/95 p-5 shadow-2xl backdrop-blur-xl lg:hidden"
              >
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label="Close navigation"
                  className="focus-ring absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-bloom-text"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
                <div className="mt-8">
                  <Sidebar onNavigate={() => setIsDrawerOpen(false)} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="mx-auto flex max-w-[1440px]">
          {/* Desktop sidebar rail */}
          <aside className="sticky top-0 hidden h-svh w-64 shrink-0 border-r border-black/5 bg-white/50 p-5 backdrop-blur-md lg:block">
            <Sidebar />
          </aside>

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            {children}
          </main>
        </div>
    </div>
  );
}
