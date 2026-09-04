import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  /**
   * Base rendered width in px. Applied through `--logo-w` rather than an
   * inline `width`, because an inline style outranks every utility class — a
   * caller passing `tablet:w-[126px]` was silently ignored, which left the
   * desktop header wearing the mobile width.
   */
  width?: number;
  className?: string;
  /**
   * Figma blends the wordmark with `difference` (1136:3528) while the orbit
   * mark stays NORMAL (1136:3527). A fixed header is its own stacking context,
   * so a child-level blend can't reach the page behind it — the desktop header
   * therefore blends as a whole and passes `blend={false}` here.
   */
  blend?: boolean;
}

/** AtomApps lockup — white wordmark with the colour orbit mark over the "o". */
export function Logo({ width = 126, className, blend = true }: LogoProps) {
  return (
    <span
      className={cn("relative block w-[var(--logo-w)]", className)}
      style={{ "--logo-w": `${width}px`, aspectRatio: "126 / 29" } as CSSProperties}
      aria-label="AtomApps"
      role="img"
    >
      <Image
        src="/logos/atomapps-wordmark.svg"
        alt=""
        width={127}
        height={24}
        priority
        className={cn("absolute top-[20.7%] left-0 w-full", blend && "mix-blend-difference")}
      />
      <Image
        src="/logos/atomapps-orbit.png"
        alt=""
        width={114}
        height={114}
        priority
        className="absolute top-0 left-[15.1%] w-[22.2%]"
      />
    </span>
  );
}
