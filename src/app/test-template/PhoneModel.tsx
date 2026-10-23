"use client";

import { useEffect, useRef } from "react";
import type { HeroDoes } from "@/data/appTemplates";

/**
 * The phone.glb viewer from web/index.html, as a transparent canvas that fills
 * its parent. No controls: at rest the phone faces front and only leans a few
 * degrees toward the cursor, eased; it turns only when an action asks. The
 * canvas ignores pointer events so the page underneath stays clickable.
 * `screen` optionally swaps the Front_Screen texture (1260x2800, 9:20).
 *
 * `action` plays one of the hero demos for ACTION_MS from `at` (a
 * performance.now() time):
 *   ring    turns to its back, buzzes in pulses and blinks the flash LED
 *   torch   turns to its back and holds the flash on
 *   volume  stays facing front and presses its side buttons
 *   screen  stays facing front and shows `action.screen` on its display
 *   front   stays facing front
 * then carries on round to the front and rests there. With `hold` it plays
 * until the action is replaced or removed.
 *
 * `live` shows a canvas on the screen instead, re-uploaded whenever `liveKey` changes (bump it after drawing).
 *
 * The scene itself is PhoneScene, imported on mount so three.js stays out of
 * the bundle of every page that doesn't show the phone.
 */
export const ACTION_MS = 2400;

/** `hold` keeps it playing until the action is replaced or removed. */
export type PhoneAction = { at: number; does: HeroDoes; screen?: string; hold?: boolean };

export function PhoneModel({
  className = "",
  screen,
  action,
  live,
  liveKey,
}: {
  className?: string;
  screen?: string;
  action?: PhoneAction;
  live?: HTMLCanvasElement;
  liveKey?: unknown;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Read by the render loop, which is set up once; a ref keeps it current.
  const act = useRef(action);
  useEffect(() => {
    act.current = action;
  }, [action]);
  const liveDirty = useRef(true);
  useEffect(() => {
    liveDirty.current = true;
  }, [liveKey]);

  useEffect(() => {
    let stop: (() => void) | undefined;
    let gone = false;
    import("./PhoneScene").then(({ mountPhone }) => {
      if (!gone) stop = mountPhone(ref.current!, { screen, live, act, liveDirty });
    });
    return () => {
      gone = true;
      stop?.();
    };
  }, [screen, live]);

  return <div ref={ref} className={`pointer-events-none ${className}`} />;
}
