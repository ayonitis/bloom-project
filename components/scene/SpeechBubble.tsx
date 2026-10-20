"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getRandomQuote } from "@/lib/quotes";

interface SpeechBubbleProps {
  /**
   * A specific line for the Garden Spirit to say (e.g. a personalized
   * onboarding greeting). When omitted, a random quote is chosen once
   * the component mounts on the client.
   */
  message?: string;
  className?: string;
}

export function SpeechBubble({ message, className }: SpeechBubbleProps) {
  // A random quote is chosen client-side after mount so the
  // server-rendered markup never disagrees with the client on which
  // quote was picked.
  const [quote, setQuote] = useState<string | null>(message ?? null);

  useEffect(() => {
    if (message === undefined) {
      setQuote(getRandomQuote());
    } else {
      setQuote(message);
    }
  }, [message]);

  return (
    <div
      className={
        className ??
        "relative flex min-h-[64px] max-w-xs items-end justify-center px-4 text-center sm:max-w-sm"
      }
    >
      <AnimatePresence mode="wait">
        {quote && (
          <motion.div
            key={quote}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative rounded-2xl border border-black/5 bg-white/85 px-5 py-3 text-sm font-medium text-bloom-text/85 shadow-[0_10px_30px_-10px_rgba(38,54,58,0.2)] backdrop-blur-md"
          >
            {quote}
            <span
              className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-black/5 bg-white/85"
              aria-hidden
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
