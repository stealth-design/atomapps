"use client";

import { Logo } from "@/components/ui/Logo";
import { siteConfig } from "@/data/site";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Full-screen nav overlay for small viewports. The design doesn't specify an
 * open state yet, so this is a neutral dark panel using the same nav data —
 * ready to be restyled when that screen arrives.
 */
export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <div
      className={`fixed inset-0 z-[var(--z-mobile-menu)] bg-black transition-opacity duration-300 tablet:hidden ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!isOpen}
    >
      <div className="flex h-[50px] items-center justify-between px-5">
        <Logo width={104} blend={false} />
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

      <nav className="flex flex-col gap-6 px-5 pt-12">
        {siteConfig.nav.map((item) => (
          <a key={item.label} href={item.href} onClick={onClose} className="text-[28px] text-white">
            {item.label}
          </a>
        ))}
        <a
          href={siteConfig.cta.href}
          onClick={onClose}
          className="mt-4 inline-flex h-[44px] w-fit items-center justify-center rounded-full bg-white px-6 text-[15px] text-black"
        >
          {siteConfig.cta.label}
        </a>
      </nav>
    </div>
  );
}
