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
  /**
   * Renders the white wordmark near-black instead of blending it, for use on
   * light backgrounds.
   *
   * The blend only holds while its backdrop stays near-white or near-black. On
   * the header's glass bar it does not: as that bar's white was thinned to let
   * more of the page through, the difference blend drove the mark toward the
   * backdrop's own mid-tone and it faded out over the dark hero. An invert is
   * backdrop-independent, so the mark reads the same at any bar opacity.
   */
  dark?: boolean;
}

/** AtomApps lockup — white wordmark with the colour orbit mark over the "o". */
export function Logo({ width = 126, className, blend = true, dark = false }: LogoProps) {
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
        // `h-auto` alongside `w-full` keeps the declared 127x24 ratio — without
        // it Next warns that one axis is overridden and the other is not.
        className={cn(
          "absolute top-[20.7%] left-0 h-auto w-full",
          blend && !dark && "mix-blend-difference",
        )}
        style={dark ? { filter: "invert(1)" } : undefined}
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
