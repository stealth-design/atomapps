import type { AppTemplate } from "@/data/appTemplates";

/**
 * The hero's labelled strip of icons — a line of text over three or so items
 * with dividers between. `onPhoto` sets it on a frosted dark pill, always
 * white, so it reads over a photo by day and by night.
 */
export function HeroStrip({ strip, className = "", onPhoto }: { strip: NonNullable<NonNullable<AppTemplate["hero"]>["strip"]>; className?: string; onPhoto?: boolean }) {
  return (
    <div className={`flex w-max flex-col items-center gap-3 ${onPhoto ? "rounded-[22px] bg-black/45 px-6 py-3 ring-1 ring-white/10 backdrop-blur-md" : ""} ${className}`}>
      <p className={`text-[14px] leading-[18px] tablet:text-[15px] ${onPhoto ? "text-white/70" : "text-[#61616a] transition-colors duration-[600ms] group-data-[dark=true]/hero:text-white/60"}`}>{strip.label}</p>
      <ul className={`flex items-center ${onPhoto ? "text-white" : "text-[var(--foreground)] transition-colors duration-[600ms] group-data-[dark=true]/hero:text-white"}`}>
        {strip.items.map(({ label, icon }, i) => (
          <li key={label} className="flex items-center">
            {i > 0 && <span aria-hidden className={`mx-2.5 h-5 w-px tablet:mx-6 ${onPhoto ? "bg-white/25" : "bg-black/15 group-data-[dark=true]/hero:bg-white/25"}`} />}
            <span className="flex items-center gap-1.5 whitespace-nowrap tablet:gap-2">
              <svg viewBox="0 0 24 24" className="size-[17px] shrink-0 tablet:size-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={icon} />
              </svg>
              <span className="text-[15px] leading-none font-semibold tracking-[-0.01em] tablet:text-[20px]">{label}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
