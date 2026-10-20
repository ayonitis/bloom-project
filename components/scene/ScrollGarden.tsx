"use client";

import { motion } from "framer-motion";
import {
  Sprout,
  Flower2,
  CalendarCheck,
  Trophy,
  Users,
  MapPin,
} from "lucide-react";

const FEATURES = [
  {
    icon: Sprout,
    title: "Plant a habit",
    description:
      "Start with one small, doable habit. Every habit you add takes root as a new seed in your garden.",
  },
  {
    icon: CalendarCheck,
    title: "Tend it daily",
    description:
      "Check in each day and your garden remembers. Consistency is what turns a seed into something worth seeing.",
  },
  {
    icon: Flower2,
    title: "Watch it bloom",
    description:
      "Streaks unlock new flowers, trees, and creatures. Your progress becomes a living place, not just a checklist.",
  },
  {
    icon: Trophy,
    title: "Celebrate the season",
    description:
      "Look back at everything you grew. Every completed month becomes a chapter of your garden's story.",
  },
] as const;

const ROADMAP = [
  {
    stage: "Seed",
    detail: "Sign up and plant your very first habit in an empty plot.",
  },
  {
    stage: "Sprout",
    detail: "Keep a streak alive and watch the first green shoots appear.",
  },
  {
    stage: "Bloom",
    detail: "Consistency unlocks flowers, fireflies, and new garden weather.",
  },
  {
    stage: "Forest",
    detail: "Months of care turn your plot into a wide, thriving world.",
  },
] as const;

function FadeUp({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative mx-auto max-w-6xl px-6 py-28 sm:py-36"
    >
      <FadeUp>
        <p className="text-center font-[family-name:var(--font-heading)] text-sm font-semibold uppercase tracking-[0.2em] text-bloom-accent-dark">
          How Bloom works
        </p>
        <h2 className="mx-auto mt-3 max-w-xl text-balance text-center font-[family-name:var(--font-heading)] text-3xl font-semibold text-bloom-text sm:text-4xl">
          A garden that grows exactly as you do
        </h2>
      </FadeUp>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature, index) => (
          <FadeUp key={feature.title} delay={index * 0.12}>
            <div className="group relative h-full rounded-3xl border border-black/5 bg-white/70 p-6 shadow-[0_20px_40px_-24px_rgba(38,54,58,0.15)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bloom-accent/12 text-bloom-accent-dark transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <h3 className="mt-5 font-[family-name:var(--font-heading)] text-lg font-semibold text-bloom-text">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-bloom-muted">
                {feature.description}
              </p>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-gradient-to-b from-transparent via-bloom-accent/[0.06] to-transparent py-28 sm:py-36"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2">
        <FadeUp>
          <p className="font-[family-name:var(--font-heading)] text-sm font-semibold uppercase tracking-[0.2em] text-bloom-accent-dark">
            Why a garden
          </p>
          <h2 className="mt-3 max-w-lg text-balance font-[family-name:var(--font-heading)] text-3xl font-semibold text-bloom-text sm:text-4xl">
            Habit trackers ask for discipline. Gardens ask for care.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-bloom-muted">
            Most productivity apps feel like scoreboards, so it&apos;s easy to
            walk away from a bad week. Bloom is built around something
            gentler: a small living world that grows because you kept
            returning to it, and keeps waiting patiently on the days you
            don&apos;t.
          </p>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-bloom-muted">
            There&apos;s no penalty for a quiet season. There&apos;s just a
            garden, growing a little more every time you show up.
          </p>
        </FadeUp>

        <FadeUp delay={0.15}>
          <div className="relative mx-auto aspect-square w-full max-w-md rounded-[2.5rem] border border-black/5 bg-white/60 p-10 shadow-[0_30px_60px_-30px_rgba(38,54,58,0.25)] backdrop-blur-sm">
            <svg viewBox="0 0 320 320" className="h-full w-full" aria-hidden>
              <circle cx="160" cy="160" r="150" fill="#FFF3D6" opacity="0.5" />
              <ellipse cx="160" cy="250" rx="140" ry="30" fill="#3BB273" opacity="0.25" />
              {[
                { x: 90, y: 220, r: 26, fill: "#F5A623" },
                { x: 160, y: 190, r: 34, fill: "#3BB273" },
                { x: 232, y: 226, r: 22, fill: "#5AA9FF" },
                { x: 200, y: 150, r: 16, fill: "#FF9E7D" },
                { x: 118, y: 155, r: 14, fill: "#5AA9FF" },
              ].map((circle, i) => (
                <circle
                  key={i}
                  cx={circle.x}
                  cy={circle.y}
                  r={circle.r}
                  fill={circle.fill}
                  opacity="0.85"
                />
              ))}
            </svg>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

export function RoadmapSection() {
  return (
    <section id="roadmap" className="relative mx-auto max-w-5xl px-6 py-28 sm:py-36">
      <FadeUp>
        <p className="text-center font-[family-name:var(--font-heading)] text-sm font-semibold uppercase tracking-[0.2em] text-bloom-accent-dark">
          The growth path
        </p>
        <h2 className="mx-auto mt-3 max-w-xl text-balance text-center font-[family-name:var(--font-heading)] text-3xl font-semibold text-bloom-text sm:text-4xl">
          From one seed to a whole forest
        </h2>
      </FadeUp>

      <div className="relative mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-bloom-accent/30 to-transparent lg:block" />
        {ROADMAP.map((step, index) => (
          <FadeUp key={step.stage} delay={index * 0.12}>
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-bloom-accent/25 bg-bloom-bg font-[family-name:var(--font-heading)] text-sm font-semibold text-bloom-accent-dark">
                0{index + 1}
              </div>
              <h3 className="mt-4 font-[family-name:var(--font-heading)] text-lg font-semibold text-bloom-text">
                {step.stage}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-bloom-muted">
                {step.detail}
              </p>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

export function CommunitySection() {
  return (
    <section
      id="community"
      className="relative mx-auto max-w-4xl px-6 py-28 text-center sm:py-36"
    >
      <FadeUp>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-bloom-secondary/12 text-bloom-secondary">
          <Users className="h-5 w-5" strokeWidth={2} />
        </span>
        <h2 className="mx-auto mt-5 max-w-lg text-balance font-[family-name:var(--font-heading)] text-3xl font-semibold text-bloom-text sm:text-4xl">
          Thousands of small gardens, growing together
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-bloom-muted">
          Share progress, trade seeds, and see how other gardens are coming
          along. Growth is better with company.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-4 py-2 text-xs font-medium text-bloom-muted backdrop-blur-sm">
          <MapPin className="h-3.5 w-3.5 text-bloom-accent-dark" />
          New gardens are planted here every day
        </div>
      </FadeUp>
    </section>
  );
}
