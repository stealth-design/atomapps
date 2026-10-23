import type { ReactNode } from "react";

/**
 * A flat phone for the 2D heroes: a black-rimmed white screen with a status
 * bar and a punch-hole camera, its content below. Shows only its top part,
 * fading out above the hero's strip, like the 3D phone's foot.
 */
export function FlatPhone({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto h-[clamp(300px,calc(100svh-520px),440px)] w-max overflow-hidden [mask-image:linear-gradient(180deg,#000_70%,transparent_100%)]">
      <div className="relative aspect-[9/19] w-[min(250px,62vw)] roomy:w-[290px] overflow-hidden rounded-[40px] border-[7px] border-[#1d1d1f] bg-white shadow-[0_40px_80px_-40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between px-5 pt-2.5 text-[11px] font-semibold text-[#1d1d1f]">
          <span>9:41</span>
          <span className="absolute top-2.5 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-[#1d1d1f]" />
          <span className="tracking-tighter">●●● ▮</span>
        </div>
        {children}
      </div>
    </div>
  );
}
