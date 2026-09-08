"use client";

import { useId, useState, type FormEvent } from "react";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * The consultation form, on the reference's white card.
 *
 * A client component only because of the submitted state — the fields
 * themselves are plain, uncontrolled inputs, so the browser does the
 * validation it is already good at (`required`, `type="email"`) and this only
 * has to decide what to show afterwards.
 *
 * There is no endpoint behind it. `onSubmit` is deliberately a no-op that
 * swallows the navigation and shows the acknowledgement, so the page never
 * silently loses what somebody typed — wire `POST` to a real handler and drop
 * the early return.
 */

/** Shared shape for the inputs — the reference's filled, borderless fields. */
const FIELD =
  "w-full rounded-[10px] bg-[var(--surface)] px-[16px] text-[15px] leading-[20px] text-[var(--foreground)] " +
  "placeholder:text-[#9a9aa1] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#2774c1]";

const LABEL =
  "block text-[14px] leading-[18px] font-medium text-[var(--foreground)]";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const id = useId();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <div className="rounded-[20px] bg-white p-[24px] shadow-[0_18px_60px_rgba(16,32,64,0.18)] tablet:rounded-[24px] tablet:p-[40px]">
      {sent ? (
        <div
          role="status"
          className="flex min-h-[420px] flex-col items-center justify-center text-center"
        >
          <p className="text-[24px] leading-[32px] font-bold text-[var(--foreground)]">
            Thanks — that&apos;s booked.
          </p>
          <p className="mt-[12px] max-w-[320px] text-[15px] leading-[23px] text-[#61616a]">
            One of the team will be in touch to arrange a time that suits you.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate={false}>
          <div>
            <label className={LABEL} htmlFor={`${id}-name`}>
              Full name
            </label>
            <input
              id={`${id}-name`}
              name="fullName"
              required
              autoComplete="name"
              placeholder="Enter your full name*"
              className={cn(FIELD, "mt-[10px] h-[52px]")}
            />
          </div>

          <div className="mt-[20px]">
            <label className={LABEL} htmlFor={`${id}-email`}>
              Email address
            </label>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Enter email address*"
              className={cn(FIELD, "mt-[10px] h-[52px]")}
            />
          </div>

          <div className="mt-[20px]">
            <label className={LABEL} htmlFor={`${id}-message`}>
              Message
            </label>
            <textarea
              id={`${id}-message`}
              name="message"
              rows={5}
              placeholder="Enter your message"
              className={cn(FIELD, "mt-[10px] resize-y py-[14px]")}
            />
          </div>

          <div className="mt-[28px] flex justify-center">
            <button
              type="submit"
              className="inline-flex h-[48px] items-center justify-center rounded-[10px] bg-[#2774c1] px-[32px] text-[15px] leading-[20px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2774c1]"
            >
              Submit
            </button>
          </div>

          <p className="mt-[20px] text-center text-[13px] leading-[20px] text-[#61616a]">
            By submitting the form, you agree to our{" "}
            <a
              href={siteConfig.legal[0].href}
              className="underline hover:no-underline"
            >
              {siteConfig.legal[0].label}
            </a>{" "}
            and acknowledge our{" "}
            <a
              href={siteConfig.legal[1].href}
              className="underline hover:no-underline"
            >
              {siteConfig.legal[1].label}
            </a>
            .
          </p>
        </form>
      )}
    </div>
  );
}
