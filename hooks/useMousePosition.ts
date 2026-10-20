"use client";

import { useEffect, useRef, useState } from "react";
import type { Point } from "@/types";

/**
 * Tracks pointer position as a value normalized between -1 and 1
 * relative to the viewport center, so consumers can compute subtle
 * offsets (eyes, parallax leans) without re-deriving viewport math.
 *
 * `pointermove` can fire far more often than the display refreshes
 * (especially on high-polling-rate mice and trackpads), so raw events
 * are coalesced into a single state update per animation frame rather
 * than triggering a re-render for every event.
 */
export function useMousePosition(): Point {
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);
  const latest = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      latest.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      };

      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        setPosition(latest.current);
      });
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return position;
}
