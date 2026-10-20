"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Github, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { QuestionCard } from "@/components/onboarding/QuestionCard";
import { ProviderButton } from "@/components/auth/ProviderButton";
import { PrimaryButton } from "@/components/onboarding/PrimaryButton";
import { signInSchema } from "@/lib/validation/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleProviderSignIn(provider: "google" | "github") {
    setError(null);
    await signIn(provider, { callbackUrl });
  }

  async function handleCredentialsSignIn(event: FormEvent) {
    event.preventDefault();
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details and try again.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    setIsSubmitting(false);

    if (result?.error) {
      setError("That email and password don't match an account.");
      return;
    }
    router.push(callbackUrl);
  }

  return (
    <QuestionCard
      eyebrow="Welcome back"
      title="Log in to your garden"
      description="Pick up right where you left off."
    >
      <div className="flex flex-col gap-3">
        <ProviderButton
          onClick={() => handleProviderSignIn("google")}
          label="Continue with Google"
          icon={
            <span
              className="font-[family-name:var(--font-heading)] text-sm font-semibold text-bloom-primary-dark"
              aria-hidden="true"
            >
              G
            </span>
          }
        />
        <ProviderButton
          onClick={() => handleProviderSignIn("github")}
          label="Continue with GitHub"
          icon={<Github className="h-4 w-4 text-bloom-text" strokeWidth={2} aria-hidden="true" />}
        />

        <div className="flex items-center gap-3 py-1 text-xs text-bloom-muted" aria-hidden="true">
          <span className="h-px flex-1 bg-black/10" />
          or
          <span className="h-px flex-1 bg-black/10" />
        </div>

        <form onSubmit={handleCredentialsSignIn} className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 py-3">
            <Mail className="h-4 w-4 shrink-0 text-bloom-secondary" strokeWidth={2} aria-hidden="true" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              autoComplete="email"
              required
              className="w-full bg-transparent text-sm text-bloom-text placeholder:text-bloom-muted/70 focus:outline-none"
            />
          </div>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            aria-label="Password"
            autoComplete="current-password"
            required
            className="focus-ring w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-bloom-text placeholder:text-bloom-muted/70"
          />

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              role="alert"
              className="text-sm text-red-500"
            >
              {error}
            </motion.p>
          )}

          <PrimaryButton type="submit" disabled={isSubmitting} hideArrow className="w-full justify-center">
            {isSubmitting ? "Logging in…" : "Log In"}
          </PrimaryButton>
        </form>
      </div>
    </QuestionCard>
  );
}
