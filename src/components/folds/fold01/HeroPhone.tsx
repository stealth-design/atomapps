import Image from "next/image";

/**
 * Hero phone mockup (Figma 1136:2599 desktop / 1202:41534 mobile).
 *
 * Everything inside is positioned as a percentage of the frame, which is why
 * the same component reproduces both artboards — the design keeps identical
 * ratios at both sizes (aspect 312:646, radius 15.9% of width, logo 75.3% of
 * width at 16.9% from the top, rings 425% of width centred at 52% / 86%).
 */
export function HeroPhone() {
  return (
    <div className="relative aspect-[312/646] w-full overflow-hidden rounded-[29.5px] bg-black tablet:rounded-[40px] desktop-sm:rounded-[49.5px]">
      {/* Blurred screen glow — Figma "image 793" with a 126px layer blur baked in */}
      <Image
        src="/images/fold01/phone-screen-glow.png"
        alt=""
        width={256}
        height={256}
        priority
        aria-hidden="true"
        className="pointer-events-none absolute top-[-28.2%] left-[-40.7%] h-auto w-[181.7%] max-w-none"
      />

      {/* Concentric rings — 5 ellipses, white hairline strokes at 20%, radially faded */}
      <svg
        viewBox="0 0 1325 1325"
        aria-hidden="true"
        className="pointer-events-none absolute top-[-16.9%] left-[-160.3%] w-[425%]"
      >
        <defs>
          <radialGradient id="fold01-ring-fade">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="45%" stopColor="white" stopOpacity="0.6" />
            <stop offset="78%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="fold01-ring-mask">
            <rect width="1325" height="1325" fill="url(#fold01-ring-fade)" />
          </mask>
        </defs>
        <g mask="url(#fold01-ring-mask)" opacity="0.2" fill="none" stroke="#fff" strokeWidth="1">
          <circle cx="662.5" cy="662.5" r="213" />
          <circle cx="662.5" cy="662.5" r="279.5" />
          <circle cx="662.5" cy="662.5" r="359.5" />
          <circle cx="662.5" cy="662.5" r="498" />
          <circle cx="662.5" cy="662.5" r="662.5" />
        </g>
      </svg>

      {/* AtomApps lockup on the screen */}
      <Image
        src="/images/logo-final.png"
        alt="AtomApps"
        width={1600}
        height={370}
        priority
        className="absolute top-[16.9%] left-1/2 h-auto w-[75.3%] -translate-x-1/2"
      />
    </div>
  );
}
