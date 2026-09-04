"use client";

import Image from "next/image";
import { useEffect } from "react";
import { setScrollLocked } from "@/lib/lenis";
import { siteConfig } from "@/data/site";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Full-screen nav overlay for small viewports.
 *
 * Figma: 1136:6414 ("iPhone 16 - 1", 293x679). A black panel with a large soft
 * colour glow bleeding in from the left, a bare white X top-right, three nav
 * items set low and left, and the wordmark oversized along the foot.
 *
 * That artboard is 293 wide where the site's mobile artboard is 393, so every
 * measurement below is the design's own proportion of its frame rather than its
 * raw pixels — type is scaled by 393/293 (15px -> 20px, 45px gaps -> 60px) and
 * the blocks are placed as percentages so the composition holds at any phone
 * height.
 *
 * This must be rendered as a sibling of `<header>`, never inside it: the header
 * carries `backdrop-blur`, and a backdrop-filter makes an element a containing
 * block for `position: fixed` descendants. Nested in there, this panel's
 * `inset-0` resolved against the header's 50px strip instead of the viewport —
 * the black backing covered only that strip while the nav items overflowed down
 * the page, painting on top of the folds.
 */

/**
 * Figma orders the menu About Us / Our Apps / Our Approach, which is not the
 * order the desktop bar uses. Anything not named here keeps its place after
 * these, so adding a nav item can't silently drop it from the menu.
 */
const MENU_ORDER = ["About Us", "Our Apps", "Our Approach"];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Freeze the page behind the overlay. Lenis has to be told directly — it
  // drives a virtual scroll position and ignores a CSS overflow lock.
  useEffect(() => {
    if (!isOpen) return;
    setScrollLocked(true);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      setScrollLocked(false);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  const rank = (label: string) => {
    const index = MENU_ORDER.indexOf(label);
    return index === -1 ? MENU_ORDER.length : index;
  };
  const items = [...siteConfig.nav].sort((a, b) => rank(a.label) - rank(b.label));

  return (
    <div
      // `inert` keeps the closed menu's links out of tab order and the
      // accessibility tree, which `opacity-0` alone does not.
      inert={!isOpen}
      className={`fixed inset-0 z-[var(--z-mobile-menu)] overflow-hidden bg-black transition-opacity duration-300 tablet:hidden ${
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* Figma's "image 793" at 729px square with a 166px layer blur, exported
          already blurred and flattened onto the panel's black — so it ships as
          a 12KB JPEG instead of a large PNG with an alpha channel. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[2.95%] left-[-104.3%] aspect-square w-[248.9%]"
      >
        <Image
          src="/images/menu/glow.jpg"
          alt=""
          fill
          sizes="250vw"
          className="object-cover"
        />
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        // The design draws a bare 10px X in a 24px box, no circle. The
        // pseudo-element pads the hit area to 44px for thumbs.
        className="absolute top-[9.65%] left-[85.73%] flex size-[24px] items-center justify-center before:absolute before:-inset-[10px] before:content-['']"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="none">
          <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {/* 45px apart on the artboard -> 60px here, less the 26px line box. */}
      <nav className="absolute top-[53.89%] left-[14.3%] flex flex-col gap-[34px]">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={onClose}
            className="text-[20px] leading-[26px] text-white"
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* The full-colour lockup rather than the `Logo` lockup used in the
          header: this artboard shows the orbit in the brand's orange/teal/blue,
          which is what `atomapps-color.png` carries — `Logo` composes the
          rainbow `atomapps-orbit.png` instead. Its 4.32 aspect matches the
          design group's 209.3x48.4 exactly. */}
      <Image
        src="/logos/atomapps-color.png"
        alt={siteConfig.name}
        width={942}
        height={218}
        sizes="72vw"
        className="absolute top-[83.24%] left-[14.3%] h-auto w-[71.43%]"
      />
    </div>
  );
}
