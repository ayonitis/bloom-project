"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GARDEN_QUOTES } from "@/lib/quotes";

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function QuoteCard() {
  // Picked client-side, after mount, so the server-rendered markup can
  // never disagree with the visitor's local date.
  const [quote, setQuote] = useState<string | null>(null);

  useEffect(() => {
    const index = dayOfYear(new Date()) % GARDEN_QUOTES.length;
    setQuote(GARDEN_QUOTES[index]);
  }, []);

  if (!quote) {
    return <div className="min-h-[20px]" aria-hidden />;
  }

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="text-sm italic text-bloom-muted"
    >
      &ldquo;{quote}&rdquo;
    </motion.p>
  );
}
