"use client";

import { useEffect } from "react";
import { Logo } from "@/components/ui/Logo";
import { setScrollLocked } from "@/lib/lenis";
import { siteConfig } from "@/data/site";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Full-screen nav overlay for small viewports.
 *
 * This must be rendered as a sibling of `<header>`, never inside it: the
 * header carries `backdrop-blur`, and a backdrop-filter makes an element a
 * containing block for `position: fixed` descendants. Nested in there, this
 * panel's `inset-0` resolved against the header's 50px strip instead of the
 * viewport — the black backing covered only that strip while the nav items
 * overflowed down the page, painting on top of the folds.
 *
 * The design doesn't specify an open state, so this stays close to the
 * header's own vocabulary: near-black panel, the same 33px circular buttons,
 * nav at the hero's heading scale with hairline separators.
 */
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

  return (
    <div
      // `inert` keeps the closed menu's links out of tab order and the
      // accessibility tree, which `opacity-0` alone does not.
      inert={!isOpen}
      className={`fixed inset-0 z-[var(--z-mobile-menu)] flex flex-col bg-[#0d0d0f] transition-opacity duration-300 tablet:hidden ${
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="flex h-[50px] shrink-0 items-center justify-between px-5">
        <Logo width={132} blend={false} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          // Matches the open button: 33px circle, 45px hit area.
          className="relative flex size-[33px] items-center justify-center rounded-full bg-white before:absolute before:-inset-[6px] before:content-['']"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="none">
            <path d="M4 4l10 10M14 4L4 14" stroke="#1d1b20" strokeWidth="1.6" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col px-5 pt-6">
        {siteConfig.nav.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={onClose}
            className="border-b border-white/10 py-[18px] text-[26px] leading-[34px] font-medium text-white"
          >
            {item.label}
          </a>
        ))}

        <a
          href={siteConfig.cta.href}
          onClick={onClose}
          className="mt-8 flex h-[52px] w-full items-center justify-center gap-[10px] rounded-full bg-white text-[16px] leading-[20px] font-medium text-black"
        >
          {siteConfig.cta.label}
          <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-black">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="none">
              <path
                d="M2.5 9.5 9.5 2.5M4.5 2.5h5v5"
                stroke="#fff"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>
      </nav>
    </div>
  );
}
