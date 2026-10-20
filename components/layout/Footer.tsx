import { Sprout } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-black/5 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-bloom-muted sm:flex-row">
        <div className="flex items-center gap-2">
          <Sprout className="h-4 w-4 text-bloom-accent-dark" strokeWidth={2.25} />
          <span className="font-[family-name:var(--font-heading)] font-medium text-bloom-text">
            Bloom
          </span>
        </div>
        <p>© {new Date().getFullYear()} Bloom. Grow something today.</p>
      </div>
    </footer>
  );
}
