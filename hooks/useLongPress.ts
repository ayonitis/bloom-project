"use client";

import { useCallback, useRef } from "react";

const LONG_PRESS_MS = 600;
/** If the pointer moves more than this many pixels before the threshold,
 *  treat it as a drag/scroll rather than a long press. */
const MOVE_CANCEL_THRESHOLD_PX = 10;

interface UseLongPressOptions<T extends HTMLElement> {
  onLongPress: () => void;
  onClick?: (event: React.PointerEvent<T>) => void;
  disabled?: boolean;
}

/** Returns pointer handlers that distinguish a tap/click from a ~600ms
 *  press-and-hold, for both mouse and touch via the Pointer Events API.
 *  Keyboard activation is intentionally NOT handled here — callers should
 *  wire Enter/Space directly, since neither fires pointer events. */
export function useLongPress<T extends HTMLElement>({ onLongPress, onClick, disabled }: UseLongPressOptions<T>) {
  const timeoutRef = useRef<number | undefined>(undefined);
  const startPosition = useRef<{ x: number; y: number } | null>(null);
  const didFireLongPress = useRef(false);

  const clear = useCallback(() => {
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = undefined;
    startPosition.current = null;
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<T>) => {
      if (disabled) return;
      didFireLongPress.current = false;
      startPosition.current = { x: event.clientX, y: event.clientY };
      timeoutRef.current = window.setTimeout(() => {
        didFireLongPress.current = true;
        onLongPress();
      }, LONG_PRESS_MS);
    },
    [disabled, onLongPress]
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<T>) => {
      if (!startPosition.current) return;
      const dx = event.clientX - startPosition.current.x;
      const dy = event.clientY - startPosition.current.y;
      if (Math.hypot(dx, dy) > MOVE_CANCEL_THRESHOLD_PX) clear();
    },
    [clear]
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<T>) => {
      const wasLongPress = didFireLongPress.current;
      clear();
      if (!wasLongPress && !disabled) onClick?.(event);
    },
    [clear, disabled, onClick]
  );

  const onPointerLeave = useCallback(() => clear(), [clear]);
  const onPointerCancel = useCallback(() => clear(), [clear]);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerLeave, onPointerCancel };
}
