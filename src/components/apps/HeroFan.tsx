"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { AppScreenshot } from "@/data/apps";

export interface FanScreen extends AppScreenshot {
  alt: string;
}

/** How wide each card is, as a share of the fan's box. */
const CARD = 0.44;
/** How far the side cards sit out from the centre one, in their own widths. */
const SPREAD = 58;
/** How far the side cards lean, in degrees. */
const LEAN = 9;

/**
 * The hero's three screens, fanned: the middle one upright and in front, the
 * other two behind it leaning out, pivoting from their feet the way cards do
 * in a hand.
 *
 * The fan is laid out in CSS, so it is already in place before any script
 * runs; the motion only adds the opening, where the three start squared up
 * behind one another and spread out. Each card's resting pose is on an outer
 * box and the motion on an inner one, so GSAP never has to read a transform
 * back out of the stylesheet.
 *
 * `framed` is for raw screen captures, which get a phone body drawn round
 * them. The store posters already have a phone (or a photo) composed inside
 * them, so they go in as plain cards — see Poster for why.
 *
 * The box's height follows the screens' proportions, so a tall capture and a
 * 9:16 poster both leave the same margin under the fan.
 */
export function HeroFan({
  screens,
  framed,
  className = "",
}: {
  /** Left, centre, right. */
  screens: FanScreen[];
  framed: boolean;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const [left, centre, right] = gsap.utils.toArray<HTMLElement>("[data-fan-card]", rootRef.current);
        const tl = gsap.timeline({ defaults: { duration: 1.1, ease: "power3.out" }, delay: 0.15 });
        tl.from(centre, { y: 48, opacity: 0, duration: 0.8 })
          .from(left, { xPercent: SPREAD, rotation: LEAN, opacity: 0 }, 0.2)
          .from(right, { xPercent: -SPREAD, rotation: -LEAN, opacity: 0 }, 0.2);
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  const ratio = screens[1].height / screens[1].width;

  return (
    <div
      ref={rootRef}
      className={`relative mx-auto w-full ${className}`}
      style={{ aspectRatio: `1 / ${(CARD * ratio + 0.06).toFixed(3)}` }}
    >
      {screens.map((screen, index) => {
        const side = index - 1; // -1, 0, 1
        return (
          <div
            key={screen.src}
            className="absolute top-0"
            style={{
              left: `${(50 - (CARD * 100) / 2).toFixed(2)}%`,
              width: `${CARD * 100}%`,
              zIndex: side === 0 ? 2 : 1,
              transformOrigin: "50% 100%",
              transform:
                side === 0
                  ? undefined
                  : `translateX(${side * SPREAD}%) translateY(4%) rotate(${side * LEAN}deg) scale(0.9)`,
            }}
          >
            <div data-fan-card>
              {framed ? <Phone screen={screen} priority={side === 0} /> : <Card screen={screen} priority={side === 0} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const SIZES = "(max-width: 767px) 44vw, 290px";

/** A raw capture in a drawn phone body: dark bezel, rounded to match. */
function Phone({ screen, priority }: { screen: FanScreen; priority: boolean }) {
  return (
    <div className="rounded-[15%/7%] bg-[#111] p-[3.5%] shadow-[0_30px_70px_-24px_rgba(0,0,0,0.45)]">
      <Image
        src={screen.src}
        alt={screen.alt}
        width={screen.width}
        height={screen.height}
        priority={priority}
        sizes={SIZES}
        className="block h-auto w-full rounded-[12%/5.6%]"
      />
    </div>
  );
}

/** A store poster as it is, on the same rounded card as everywhere else. */
function Card({ screen, priority }: { screen: FanScreen; priority: boolean }) {
  return (
    <div className="overflow-hidden rounded-[18px] bg-[var(--surface)] shadow-[0_30px_70px_-24px_rgba(0,0,0,0.4)] tablet:rounded-[24px]">
      <Image
        src={screen.src}
        alt={screen.alt}
        width={screen.width}
        height={screen.height}
        priority={priority}
        sizes={SIZES}
        className="block h-auto w-full"
      />
    </div>
  );
}
