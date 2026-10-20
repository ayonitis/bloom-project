import type { OnboardingData } from "@/types/onboarding";

const STORAGE_KEY = "bloom:onboarding";

/**
 * Mock persistence only. There is no backend yet, so we stash the
 * visitor's onboarding choices in localStorage purely so the "Enter
 * Garden" destination can greet them by name. Swap this out for a real
 * API call (e.g. POST /api/onboarding) once auth and a database exist —
 * the call sites don't need to change shape, just the implementation.
 */
export function saveOnboardingData(data: OnboardingData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage can fail (private browsing, quota, etc.) — onboarding
    // should never block on this, so we fail silently.
  }
}

export function readOnboardingData(): OnboardingData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OnboardingData) : null;
  } catch {
    return null;
  }
}
