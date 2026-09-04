import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { getFold } from "@/data/folds";

/**
 * Toggles the small on-page "FOLD 0X" corner labels used while building folds
 * against the Figma artboards. Off for anything anyone else will see — flip to
 * `true` to bring them back when working on a fold.
 */
export const SHOW_FOLD_LABELS = false;

interface SectionProps {
  /** Two-digit fold number, e.g. "01". Drives both the id and data-fold attrs. */
  fold: string;
  children: ReactNode;
  className?: string;
}

/**
 * Shared wrapper for every fold: applies the `id="fold-XX"` / `data-fold="XX"`
 * pattern and the dev-only fold label (which reads its section name from the
 * fold registry in `@/data/folds`). Vertical spacing is left to each fold so
 * designs can be matched to Figma exactly.
 */
export function Section({ fold, children, className }: SectionProps) {
  const meta = getFold(fold);

  return (
    <section id={`fold-${fold}`} data-fold={fold} className={cn("relative w-full", className)}>
      {SHOW_FOLD_LABELS && (
        <span
          // top offset clears the fixed 50px header
          className="absolute top-[60px] left-3 z-[var(--z-fold-label)] rounded bg-[var(--foreground)] px-2 py-1 font-mono text-[10px] tracking-wide text-[var(--background)] uppercase"
          aria-hidden="true"
        >
          Fold {fold}
          {meta ? ` · ${meta.name}` : ""}
        </span>
      )}
      {children}
    </section>
  );
}
