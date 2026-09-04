"use client";

import { useMediaQuery } from "./useMediaQuery";

/** True when the user has requested reduced motion at the OS level. */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
