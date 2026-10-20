import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function QuestionCard({
  eyebrow,
  title,
  description,
  children,
  footer,
  className,
}: QuestionCardProps) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-black/5 bg-white/75 p-8 text-center shadow-[0_30px_70px_-30px_rgba(38,54,58,0.25)] backdrop-blur-md sm:p-10",
        className
      )}
    >
      {eyebrow && (
        <p className="font-[family-name:var(--font-heading)] text-xs font-semibold uppercase tracking-[0.2em] text-bloom-accent-dark">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-3 text-balance font-[family-name:var(--font-heading)] text-2xl font-semibold text-bloom-text sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mx-auto mt-3 max-w-sm text-balance text-sm leading-relaxed text-bloom-muted sm:text-base">
          {description}
        </p>
      )}

      <div className="mt-8">{children}</div>

      {footer && <div className="mt-8">{footer}</div>}
    </div>
  );
}
