"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprout } from "lucide-react";
import { NAV_ITEMS, PLAYER_STATS } from "@/lib/mockData";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { cn } from "@/lib/utils";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const initial = PLAYER_STATS.name.charAt(0).toUpperCase();

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/"
        className="focus-ring flex items-center gap-2 rounded-full px-1 py-1"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bloom-accent/15">
          <Sprout className="h-4.5 w-4.5 text-bloom-accent-dark" strokeWidth={2.25} />
        </span>
        <span className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight text-bloom-text">
          Bloom
        </span>
      </Link>

      <nav aria-label="Main" className="mt-8 flex-1">
        <ul className="flex list-none flex-col gap-1 p-0">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            if (!item.available) {
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-bloom-muted/60"
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-4.5 w-4.5" strokeWidth={2} aria-hidden="true" />
                    {item.label}
                  </span>
                  <span className="rounded-full bg-bloom-text/5 px-2 py-0.5 text-[10px]">
                    Soon
                  </span>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "bg-bloom-accent/12 text-bloom-accent-dark"
                      : "text-bloom-text/70 hover:bg-black/[0.03] hover:text-bloom-text"
                  )}
                >
                  <item.icon className="h-4.5 w-4.5" strokeWidth={2} aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-black/5 bg-white/70 p-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bloom-primary/15 font-[family-name:var(--font-heading)] text-sm font-semibold text-bloom-primary-dark">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-bloom-text">
            {PLAYER_STATS.name}
          </p>
          <p className="text-xs text-bloom-muted">Level {PLAYER_STATS.level}</p>
        </div>
        <SignOutButton />
      </div>
    </div>
  );
}
