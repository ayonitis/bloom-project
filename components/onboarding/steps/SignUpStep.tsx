"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { Github, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { QuestionCard } from "@/components/onboarding/QuestionCard";
import { SecondaryButton } from "@/components/onboarding/SecondaryButton";
import { PrimaryButton } from "@/components/onboarding/PrimaryButton";
import { ProviderButton } from "@/components/auth/ProviderButton";
import { signUpAction } from "@/app/actions/auth";
import { signUpSchema } from "@/lib/validation/auth";
import { cn } from "@/lib/utils";

interface SignUpStepProps {
  name: string;
  email: string;
  onEmailChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SignUpStep({ name, email, onEmailChange, onNext, onBack }: SignUpStepProps) {
  const [showEmailField, setShowEmailField] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google/GitHub involve a full-page redirect to the provider and back,
  // so there's no "next step" to advance to here — the callback URL takes
  // the person straight to the dashboard once they're back.
  async function handleProviderSignIn(provider: "google" | "github") {
    setError(null);
    await signIn(provider, { callbackUrl: "/dashboard" });
  }

  async function handleEmailSignUp(event: FormEvent) {
    event.preventDefault();
    const parsed = signUpSchema.safeParse({ name: name || "Friend", email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details and try again.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await signUpAction(parsed.data);
    if (!result.ok) {
      setIsSubmitting(false);
      setError(result.error);
      return;
    }

    const signInResult = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    setIsSubmitting(false);

    if (signInResult?.error) {
      setError("Account created, but logging you in failed. Try the login page.");
      return;
    }

    onNext();
  }

  return (
    <QuestionCard
      eyebrow="Almost there"
      title="How would you like to sign up?"
      description="Pick whatever feels right — you can always add another sign-in method later."
      footer={
        <div className="flex justify-center">
          <SecondaryButton type="button" onClick={onBack}>
            Back
          </SecondaryButton>
        </div>
      }
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
        <ProviderButton
          onClick={() => setShowEmailField(true)}
          label="Continue with Email"
          icon={<Mail className="h-4 w-4 text-bloom-secondary" strokeWidth={2} aria-hidden="true" />}
        />

        {showEmailField && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            onSubmit={handleEmailSignUp}
            className={cn("overflow-hidden")}
          >
            <div className="flex flex-col gap-3 pt-1">
              <input
                type="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                autoComplete="email"
                autoFocus
                required
                className="focus-ring w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-bloom-text placeholder:text-bloom-muted/70"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a password"
                aria-label="Password"
                autoComplete="new-password"
                required
                className="focus-ring w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-bloom-text placeholder:text-bloom-muted/70"
              />

              {error && (
                <p role="alert" className="text-sm text-red-500">
                  {error}
                </p>
              )}

              <PrimaryButton
                type="submit"
                disabled={isSubmitting}
                hideArrow
                className="w-full justify-center"
              >
                {isSubmitting ? "Creating account…" : "Create Account"}
              </PrimaryButton>
            </div>
          </motion.form>
        )}
      </div>
    </QuestionCard>
  );
}
