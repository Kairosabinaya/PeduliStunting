"use client";

/**
 * Non-modal bottom sheet with three snap points (peek / half / full).
 *
 * Implementation notes (most are non-obvious; do not "simplify" them):
 *
 *   1. **Height, not transform.** The sheet's outer `<section>` has its
 *      `height` set to `ratio * 100dvh` and is anchored to `bottom: 0`.
 *      An earlier version used `transform: translateY(...)` to push a
 *      `100dvh`-tall section off-screen, but that left the full-height
 *      element capturing pointer events behind the translated portion —
 *      tapping the map at the top of the viewport bubbled into the
 *      invisible sheet instead of MapLibre. Height-based snap keeps the
 *      hit region honest.
 *   2. **Drag-from-anywhere with scroll precedence.** Pointer handlers
 *      live on the section root so the whole sheet surface is a drag
 *      target. A pointerdown is "claimed as drag" UNLESS (a) the target
 *      is interactive, or (b) the target sits inside the inner scroll
 *      body and that body is already scrolled. Once claimed, we flip
 *      the inner scroll body's `touch-action` to `none` so the browser
 *      stops trying to scroll mid-drag, and restore it on pointerup.
 *   3. **Non-modal.** No global inert/scroll-lock at peek / half — the
 *      map underneath must remain pan-able. Only the full state locks
 *      body scroll and renders a scrim.
 *   4. **Reduced motion.** Snap height transitions become instant under
 *      `prefers-reduced-motion`.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/cn";

/** Imperative handle exposed for parent callers that need to drive snaps. */
export interface BottomSheetHandle {
  readonly setSnapIndex: (index: number) => void;
  readonly getSnapIndex: () => number;
}

export interface BottomSheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** Exactly three ratios of `100dvh`, ascending. */
  readonly snapPoints: readonly [number, number, number];
  /** Index into `snapPoints` for the initial state. Default 0 (peek). */
  readonly defaultSnapIndex?: number;
  /** Visually-hidden heading; satisfies a11y for the dialog landmark. */
  readonly title: string;
  /** Sticky drag-handle aria-label (Bahasa Indonesia per project policy). */
  readonly dragHandleAria: string;
  readonly children: ReactNode;
  readonly className?: string;
}

/** Selector covering every element we never want to start a drag from. */
const INTERACTIVE_SELECTOR =
  'button, a, input, select, textarea, summary, [role="button"], [role="menuitem"], [role="option"], [contenteditable="true"]';

export const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>(
  function BottomSheet(
    {
      open,
      onOpenChange,
      snapPoints,
      defaultSnapIndex = 0,
      title,
      dragHandleAria,
      children,
      className,
    },
    ref,
  ) {
    const [snapIndex, setSnapIndex] = useState<number>(defaultSnapIndex);
    const [dragOffset, setDragOffset] = useState<number>(0);
    const dragStateRef = useRef<{
      startY: number;
      startTime: number;
      pointerId: number;
    } | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        setSnapIndex: (i: number) => {
          const clamped = Math.max(0, Math.min(snapPoints.length - 1, i));
          setSnapIndex(clamped);
        },
        getSnapIndex: () => snapIndex,
      }),
      [snapIndex, snapPoints.length],
    );

    const activeRatio = snapPoints[snapIndex] ?? snapPoints[0];
    const isFull = snapIndex === snapPoints.length - 1;

    // Lock body scroll only at full state — at peek/half the map under
    // the sheet must keep panning.
    useEffect(() => {
      if (!open || !isFull) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }, [open, isFull]);

    // Esc dismisses. Scoped to `open` so we don't fight other listeners.
    useEffect(() => {
      if (!open) return;
      const onKey = (event: KeyboardEvent): void => {
        if (event.key === "Escape") {
          event.preventDefault();
          onOpenChange(false);
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [open, onOpenChange]);

    const onPointerDown = useCallback(
      (event: React.PointerEvent<HTMLElement>) => {
        // Mouse: only primary button. Touch / pen: always.
        if (event.button !== 0 && event.pointerType === "mouse") return;

        const target = event.target as HTMLElement;

        // Don't hijack drags from interactive elements.
        if (target.closest(INTERACTIVE_SELECTOR)) return;

        const scrollEl = scrollRef.current;

        // Inside the scroll body, if it's already scrolled, the gesture
        // is "scroll back to top". User has to release at the top to
        // start dragging the sheet down (the iOS pattern).
        if (scrollEl && scrollEl.contains(target) && scrollEl.scrollTop > 0) {
          return;
        }

        // Disable the scroll body's native pan-y for the duration of the
        // drag, otherwise the browser will try to scroll vertically the
        // moment the finger moves and the gesture splits between drag
        // and scroll.
        if (scrollEl) scrollEl.style.touchAction = "none";

        dragStateRef.current = {
          startY: event.clientY,
          startTime: event.timeStamp,
          pointerId: event.pointerId,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      },
      [],
    );

    const onPointerMove = useCallback(
      (event: React.PointerEvent<HTMLElement>) => {
        const state = dragStateRef.current;
        if (!state || state.pointerId !== event.pointerId) return;
        setDragOffset(event.clientY - state.startY);
      },
      [],
    );

    const restoreScrollTouchAction = useCallback((): void => {
      if (scrollRef.current) scrollRef.current.style.touchAction = "pan-y";
    }, []);

    const onPointerUp = useCallback(
      (event: React.PointerEvent<HTMLElement>) => {
        const state = dragStateRef.current;
        if (!state || state.pointerId !== event.pointerId) return;
        dragStateRef.current = null;
        try {
          event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {
          // releasePointerCapture throws if the pointer is gone — safe.
        }
        restoreScrollTouchAction();

        const deltaY = event.clientY - state.startY;
        const deltaTime = Math.max(1, event.timeStamp - state.startTime);
        const velocity = deltaY / deltaTime; // px/ms; positive = down
        const viewport =
          typeof window === "undefined" ? 800 : window.innerHeight;
        const sheetHeightAtCurrent = viewport * activeRatio;
        const projectedRatio = (sheetHeightAtCurrent - deltaY) / viewport;

        const VELOCITY_THRESHOLD = 0.45; // px/ms
        let nextIndex = snapIndex;
        if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
          nextIndex =
            velocity < 0
              ? Math.min(snapPoints.length - 1, snapIndex + 1)
              : Math.max(0, snapIndex - 1);
        } else {
          let bestDistance = Infinity;
          snapPoints.forEach((ratio, i) => {
            const dist = Math.abs(ratio - projectedRatio);
            if (dist < bestDistance) {
              bestDistance = dist;
              nextIndex = i;
            }
          });
        }
        setSnapIndex(nextIndex);
        setDragOffset(0);
      },
      [activeRatio, restoreScrollTouchAction, snapIndex, snapPoints],
    );

    const onPointerCancel = useCallback(
      (event: React.PointerEvent<HTMLElement>) => {
        const state = dragStateRef.current;
        if (!state || state.pointerId !== event.pointerId) return;
        dragStateRef.current = null;
        restoreScrollTouchAction();
        setDragOffset(0);
      },
      [restoreScrollTouchAction],
    );

    const onHandleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setSnapIndex((i) => Math.min(snapPoints.length - 1, i + 1));
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          setSnapIndex((i) => Math.max(0, i - 1));
        }
      },
      [snapPoints.length],
    );

    if (!open) return null;

    // Sheet height = ratio of viewport, minus the live drag offset
    // (positive offset = drag-down = shrink). Clamp to [0, 100dvh] so
    // wildly fast flicks don't produce negative heights.
    const heightCss = `clamp(0px, calc(${activeRatio} * 100dvh - ${dragOffset}px), 100dvh)`;
    const isDragging = dragStateRef.current !== null;

    return (
      <>
        {isFull ? (
          <div
            aria-hidden
            onClick={() => setSnapIndex(Math.max(0, snapPoints.length - 2))}
            className="fixed inset-0 z-sheet bg-black/20 transition-opacity"
          />
        ) : null}

        <section
          role="dialog"
          aria-label={title}
          aria-modal={isFull ? "true" : undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          /* `touch-action: none` on the sheet root means the browser
             never tries to scroll the page when the user drags here.
             The inner scroll body re-enables `pan-y` for internal
             scrolling (and we toggle that off during an active drag). */
          style={{ height: heightCss, touchAction: "none" }}
          className={cn(
            "glass-panel no-tap-highlight",
            "fixed inset-x-0 bottom-0 z-sheet flex flex-col rounded-t-2xl",
            isDragging
              ? "transition-none"
              : "transition-[height] duration-fast ease-standard",
            "motion-reduce:transition-none",
            className,
          )}
        >
          <div
            role="separator"
            aria-orientation="horizontal"
            aria-label={dragHandleAria}
            tabIndex={0}
            onKeyDown={onHandleKeyDown}
            className="flex min-h-10 cursor-grab items-center justify-center rounded-t-2xl px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:cursor-grabbing"
          >
            <span
              aria-hidden
              className="h-1.5 w-12 rounded-full bg-muted-foreground/50"
            />
          </div>

          <h2 className="sr-only">{title}</h2>

          <div
            ref={scrollRef}
            /* `pan-y` permits native vertical scrolling here even though
               the outer section sets `touch-action: none`. The
               pointerdown handler dynamically flips this to `none` while
               a sheet drag is active so the browser doesn't try to
               scroll under our fingers. */
            style={{ touchAction: "pan-y" }}
            className="scrollbar-hide flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(env(safe-area-inset-bottom)+6rem)]"
          >
            {children}
          </div>
        </section>
      </>
    );
  },
);
