"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const PANEL_MARGIN = 12;
const ARROW_SIZE = 10;

type Side = "top" | "bottom" | "left" | "right";

interface Placement {
  left: number;
  top: number;
  side: Side;
  arrowOffset: number;
}

function computePlacement(anchor: DOMRect, panelWidth: number, panelHeight: number): Placement {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const anchorCenterX = anchor.left + anchor.width / 2;
  const anchorCenterY = anchor.top + anchor.height / 2;

  const spaceRight = viewportWidth - anchor.right;
  const spaceLeft = anchor.left;
  const spaceBelow = viewportHeight - anchor.bottom;
  const spaceAbove = anchor.top;

  // Prefer opening on whichever side has the most room, favoring
  // horizontal placement (matches how the grid reads left-to-right).
  let side: Side;
  if (spaceRight >= panelWidth + PANEL_MARGIN) side = "right";
  else if (spaceLeft >= panelWidth + PANEL_MARGIN) side = "left";
  else if (spaceBelow >= panelHeight + PANEL_MARGIN) side = "bottom";
  else if (spaceAbove >= panelHeight + PANEL_MARGIN) side = "top";
  else side = spaceBelow >= spaceAbove ? "bottom" : "top";

  let left = 0;
  let top = 0;

  if (side === "right" || side === "left") {
    left = side === "right" ? anchor.right + PANEL_MARGIN : anchor.left - panelWidth - PANEL_MARGIN;
    top = anchorCenterY - panelHeight / 2;
  } else {
    top = side === "bottom" ? anchor.bottom + PANEL_MARGIN : anchor.top - panelHeight - PANEL_MARGIN;
    left = anchorCenterX - panelWidth / 2;
  }

  // Clamp so the panel can never be clipped by or leave the viewport.
  const clampedLeft = Math.min(Math.max(left, PANEL_MARGIN), viewportWidth - panelWidth - PANEL_MARGIN);
  const clampedTop = Math.min(Math.max(top, PANEL_MARGIN), viewportHeight - panelHeight - PANEL_MARGIN);

  // The arrow should still point at the anchor even after clamping.
  const arrowOffset =
    side === "right" || side === "left"
      ? Math.min(Math.max(anchorCenterY - clampedTop, ARROW_SIZE * 1.5), panelHeight - ARROW_SIZE * 1.5)
      : Math.min(Math.max(anchorCenterX - clampedLeft, ARROW_SIZE * 1.5), panelWidth - ARROW_SIZE * 1.5);

  return { left: clampedLeft, top: clampedTop, side, arrowOffset };
}

interface AnchoredPanelProps {
  anchor: HTMLElement | null;
  titleId: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  width?: number;
}

export function AnchoredPanel({ anchor, titleId, onClose, children, className, width = 320 }: AnchoredPanelProps) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    // `mounted` gates whether the portal (and therefore containerRef) is
    // rendered at all — see the SSR guard below. On the very first open,
    // this effect fires once before `mounted` flips true (containerRef is
    // still null then, so it bails out below), and previously never ran
    // again once the container actually existed, leaving `placement` null
    // forever and the panel permanently invisible. Including `mounted`
    // here ensures it recalculates as soon as the container is real.
    if (!anchor || !containerRef.current) return;

    function recalculate() {
      if (!anchor || !containerRef.current) return;
      const anchorRect = anchor.getBoundingClientRect();
      const panelRect = containerRef.current.getBoundingClientRect();
      setPlacement(computePlacement(anchorRect, panelRect.width || width, panelRect.height || 320));
    }

    recalculate();
    window.addEventListener("resize", recalculate);
    window.addEventListener("scroll", recalculate, true);
    return () => {
      window.removeEventListener("resize", recalculate);
      window.removeEventListener("scroll", recalculate, true);
    };
  }, [anchor, width, mounted]);

  useEffect(() => {
    if (!anchor) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    const firstFocusable = container?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    const focusTimeout = window.setTimeout(() => firstFocusable?.focus(), 80);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !container) return;
      const items = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimeout);
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [anchor, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {anchor && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0" onClick={onClose} aria-hidden />

          <motion.div
            ref={containerRef}
            role="dialog"
            aria-labelledby={titleId}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute max-h-[80vh] overflow-y-auto rounded-[1.75rem] border border-white/40 bg-white/85 shadow-[0_30px_80px_-30px_rgba(38,54,58,0.45)] backdrop-blur-xl",
              className
            )}
            style={{
              width,
              left: placement?.left ?? -9999,
              top: placement?.top ?? -9999,
              visibility: placement ? "visible" : "hidden",
            }}
          >
            {placement && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute h-3 w-3 rotate-45 border border-white/40 bg-white/85"
                style={{
                  ...(placement.side === "right" && { left: -ARROW_SIZE / 2, top: placement.arrowOffset - ARROW_SIZE / 2, borderRight: "none", borderTop: "none" }),
                  ...(placement.side === "left" && { right: -ARROW_SIZE / 2, top: placement.arrowOffset - ARROW_SIZE / 2, borderLeft: "none", borderBottom: "none" }),
                  ...(placement.side === "bottom" && { top: -ARROW_SIZE / 2, left: placement.arrowOffset - ARROW_SIZE / 2, borderBottom: "none", borderRight: "none" }),
                  ...(placement.side === "top" && { bottom: -ARROW_SIZE / 2, left: placement.arrowOffset - ARROW_SIZE / 2, borderTop: "none", borderLeft: "none" }),
                }}
                aria-hidden
              />
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
