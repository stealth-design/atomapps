import type { ReactNode } from "react";
import Link from "next/link";

/** The site's ease, for the CTA's slide. */
const CTA_EASE = "ease-[cubic-bezier(0.625,0.05,0,1)]";
/** The ring and glow colours: the shader's palette, the logo's rings. */
const RING = "bg-[conic-gradient(from_0deg,#f26b1d,#f7931e,#1ec4c0,#2b6fc4,#0b3e91,#f26b1d)]";

/**
 * The hero's call to action: a frosted pill inside a 3px ring of conic
 * gradient (the shader's colours) turning behind it, over a soft blur of the
 * same colours. On hover or keyboard focus the black icon button slides to
 * the pill's right end and the label slides left into its place — the
 * label's paddings swap, so the pill keeps its width. Needs the
 * `tt-spin` keyframes, which AppTemplate's <main> defines.
 */
export function RingCta({ href, eyebrow, label, icon, external }: { href: string; eyebrow: string; label: string; icon: ReactNode; external?: boolean }) {
  return (
    <span className="relative inline-flex">
      <span aria-hidden className={`pointer-events-none absolute -inset-1 rounded-full opacity-40 blur-md ${RING}`} />
      <Link
        href={href}
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
        className="group relative inline-flex overflow-hidden rounded-full p-[3px] focus-visible:outline-none"
      >
        <span aria-hidden className={`absolute top-1/2 left-1/2 aspect-square w-[160%] -translate-1/2 animate-[tt-spin_4s_linear_infinite] motion-reduce:animate-none ${RING}`} />
        <span className="relative flex h-[44px] items-center rounded-full bg-white/90 text-[var(--foreground)] backdrop-blur-sm">
          <span className={`absolute top-[9px] left-[10px] grid size-[26px] place-items-center rounded-full bg-[var(--foreground)] text-white transition-[left] duration-500 motion-reduce:transition-none can-hover:group-hover:left-[calc(100%-36px)] group-focus-visible:left-[calc(100%-36px)] ${CTA_EASE}`}>
            {icon}
          </span>
          <span className={`flex flex-col pr-5 pl-[48px] text-left leading-none transition-[padding] duration-500 motion-reduce:transition-none can-hover:group-hover:pr-[48px] can-hover:group-hover:pl-5 group-focus-visible:pr-[48px] group-focus-visible:pl-5 ${CTA_EASE}`}>
            <span className="text-[10px] leading-[12px] tracking-[0.02em] uppercase opacity-70">{eyebrow}</span>
            <span className="text-[15px] leading-[18px] font-semibold">{label}</span>
          </span>
        </span>
      </Link>
    </span>
  );
}
