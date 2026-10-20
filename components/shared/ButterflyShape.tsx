"use client";

import { motion } from "framer-motion";

export function ButterflyShape({
  color,
  width = 26,
  height = 20,
}: {
  color: string;
  width?: number;
  height?: number;
}) {
  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 26 20"
      animate={{ scaleY: [1, 0.4, 1] }}
      transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "center" }}
    >
      <path d="M13 4 C8 -2 0 0 2 8 C4 13 10 11 13 6 Z" fill={color} opacity="0.9" />
      <path d="M13 4 C18 -2 26 0 24 8 C22 13 16 11 13 6 Z" fill={color} opacity="0.9" />
      <path d="M13 6 C9 11 3 12 3 17 C6 19 11 15 13 10 Z" fill={color} opacity="0.7" />
      <path d="M13 6 C17 11 23 12 23 17 C20 19 15 15 13 10 Z" fill={color} opacity="0.7" />
      <rect x="12.2" y="3" width="1.6" height="12" rx="0.8" fill="#263238" opacity="0.6" />
    </motion.svg>
  );
}
