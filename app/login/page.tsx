import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Sprout } from "lucide-react";
import { FloatingBackground } from "@/components/onboarding/FloatingBackground";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in — Bloom",
  description: "Log in to your Bloom garden.",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col">
      <FloatingBackground />

      <header className="flex items-center px-6 py-6 sm:px-10">
        <Link href="/" className="focus-ring flex items-center gap-2 rounded-full">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bloom-accent/15">
            <Sprout className="h-4.5 w-4.5 text-bloom-accent-dark" strokeWidth={2.25} />
          </span>
          <span className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight text-bloom-text">
            Bloom
          </span>
        </Link>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-lg">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
