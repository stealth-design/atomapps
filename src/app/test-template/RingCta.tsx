import type { ReactNode } from "react";
import Link from "next/link";

/** The ring and glow colours: the shader's palette, the logo's rings. */
const RING = "bg-[conic-gradient(from_0deg,#f26b1d,#f7931e,#1ec4c0,#2b6fc4,#0b3e91,#f26b1d)]";

/**
 * The hero's call to action: a frosted pill inside a 3px ring of conic
 * gradient (the shader's colours) turning behind it, over a soft blur of the
 * same colours. On hover or keyboard focus the arrow in the black icon
 * button grows a little; nothing moves. Needs the
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
        <span className="relative flex h-[44px] items-center short:h-[40px] rounded-full bg-white/90 text-[var(--foreground)]">
          <span className="absolute top-[9px] left-[10px] grid size-[26px] short:top-[7px] place-items-center rounded-full bg-[var(--foreground)] text-white [&>svg]:transition-transform [&>svg]:duration-300 [&>svg]:ease-out motion-reduce:[&>svg]:transition-none can-hover:group-hover:[&>svg]:scale-[1.4] group-focus-visible:[&>svg]:scale-[1.4]">
            {icon}
          </span>
          <span className="pr-5 pl-[46px] text-[15px] short:text-[14px] leading-none font-semibold whitespace-nowrap">
            <span className="font-medium opacity-70">{eyebrow}</span> {label}
          </span>
        </span>
      </Link>
    </span>
  );
}
