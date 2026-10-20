"use client";

import { motion } from "framer-motion";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function FinalCta() {
  return (
    <section className="relative mx-auto max-w-4xl px-6 pb-28 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[2.5rem] border border-black/5 bg-gradient-to-b from-white/80 to-bloom-accent/10 px-8 py-16 shadow-[0_30px_70px_-30px_rgba(38,54,58,0.25)] backdrop-blur-sm"
      >
        <h2 className="mx-auto max-w-md text-balance font-[family-name:var(--font-heading)] text-3xl font-semibold text-bloom-text sm:text-4xl">
          Your garden is waiting for its first seed.
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-bloom-muted">
          It takes less than a minute to plant your first habit. Everything
          else grows from there.
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/onboarding" variant="primary">Start Growing</ButtonLink>
        </div>
      </motion.div>
    </section>
  );
}
