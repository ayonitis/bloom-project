"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      aria-label="Sign out"
      title="Sign out"
      className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-bloom-muted transition-colors hover:bg-black/[0.04] hover:text-bloom-text"
    >
      <LogOut className="h-4 w-4" strokeWidth={2} />
    </button>
  );
}
