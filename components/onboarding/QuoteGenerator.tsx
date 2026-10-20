"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getRandomQuote } from "@/lib/quotes";

interface QuoteGeneratorProps {
  /** Changing this value (e.g. the current step) generates a fresh quote. */
  seed: string | number;
}

export function QuoteGenerator({ seed }: QuoteGeneratorProps) {
  const [quote, setQuote] = useState<string | null>(null);

  useEffect(() => {
    setQuote(getRandomQuote());
  }, [seed]);

  return (
    <div className="mx-auto min-h-[20px] max-w-sm text-center">
      <AnimatePresence mode="wait">
        {quote && (
          <motion.p
            key={quote}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs italic text-bloom-muted/80"
          >
            {quote}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
