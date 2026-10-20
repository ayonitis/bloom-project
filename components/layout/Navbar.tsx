"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Sprout, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/utils";

const NAV_LINKS = ["Features", "About", "Roadmap", "Community"] as const;

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile menu automatically if the viewport grows past the
  // breakpoint where the inline links become visible again.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    function handleChange(event: MediaQueryListEvent) {
      if (event.matches) setIsMenuOpen(false);
    }
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="fixed inset-x-0 top-4 z-50 flex flex-col items-center px-4"
    >
      <nav
        className={cn(
          "flex w-full max-w-5xl items-center justify-between rounded-full border px-5 py-2.5 transition-all duration-500",
          isScrolled || isMenuOpen
            ? "border-black/5 bg-white/70 shadow-[0_8px_30px_-12px_rgba(38,54,58,0.18)] backdrop-blur-xl"
            : "border-transparent bg-white/30 backdrop-blur-sm"
        )}
      >
        <a href="#top" className="focus-ring flex items-center gap-2 rounded-full">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bloom-accent/15">
            <Sprout className="h-4.5 w-4.5 text-bloom-accent-dark" strokeWidth={2.25} />
          </span>
          <span className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight text-bloom-text">
            Bloom
          </span>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="focus-ring rounded-md text-sm font-medium text-bloom-text/70 transition-colors hover:text-bloom-text"
            >
              {link}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#login"
            className="focus-ring hidden rounded-full px-4 py-2 text-sm font-medium text-bloom-text/70 transition-colors hover:text-bloom-text sm:inline-block"
          >
            Login
          </a>
          <ButtonLink href="/onboarding" variant="primary" className="!px-5 !py-2 !text-sm">
            Start Growing
          </ButtonLink>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/80 text-bloom-text md:hidden"
          >
            {isMenuOpen ? (
              <X className="h-4.5 w-4.5" strokeWidth={2} />
            ) : (
              <Menu className="h-4.5 w-4.5" strokeWidth={2} />
            )}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-nav-menu"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-2 w-full max-w-5xl overflow-hidden rounded-3xl border border-black/5 bg-white/90 shadow-[0_20px_50px_-20px_rgba(38,54,58,0.25)] backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col p-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="focus-ring rounded-xl px-4 py-3 text-sm font-medium text-bloom-text/80 transition-colors hover:bg-black/[0.03] hover:text-bloom-text"
                >
                  {link}
                </a>
              ))}
              <a
                href="#login"
                onClick={() => setIsMenuOpen(false)}
                className="focus-ring rounded-xl px-4 py-3 text-sm font-medium text-bloom-text/80 transition-colors hover:bg-black/[0.03] hover:text-bloom-text"
              >
                Login
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
