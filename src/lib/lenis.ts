import type Lenis from "lenis";

/**
 * Module-level handle on the single Lenis instance created by SmoothScroll.
 *
 * Anything that needs to freeze the page — the mobile menu, and any future
 * overlay — has to go through Lenis rather than `overflow: hidden`, because
 * Lenis drives its own virtual scroll position and would keep animating
 * underneath a CSS lock.
 *
 * A module singleton rather than context: the provider creates the instance in
 * an effect, so a context value would change after mount and re-render every
 * consumer to hand over something only used inside event handlers.
 */
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  instance = next;
}

/** Stop or resume page scrolling. No-ops under reduced motion, where there is no Lenis. */
export function setScrollLocked(locked: boolean) {
  if (instance) {
    if (locked) instance.stop();
    else instance.start();
    return;
  }
  // Reduced-motion users scroll natively, so fall back to a CSS lock.
  document.documentElement.style.overflow = locked ? "hidden" : "";
}
