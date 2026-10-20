import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary";

export function buttonVariants(variant: ButtonVariant, className?: string) {
  const isPrimary = variant === "primary";

  return cn(
    "focus-ring group relative inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-[family-name:var(--font-heading)] text-[15px] font-medium transition-shadow duration-300 disabled:pointer-events-none disabled:opacity-40",
    isPrimary
      ? "bg-bloom-primary text-white shadow-[0_8px_24px_-8px_rgba(245,166,35,0.55)] hover:shadow-[0_14px_32px_-8px_rgba(245,166,35,0.7)]"
      : "bg-transparent text-bloom-text/80 hover:text-bloom-text",
    className
  );
}
