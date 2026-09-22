"use client";

import { useId, useState, type FormEvent } from "react";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";
import { FIELD, LABEL, SUBMIT } from "@/components/ui/formStyles";

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

          <div className="mt-[28px] flex">
            <button
              type="submit"
              className={SUBMIT}
            >
              Submit
            </button>
          </div>

          <p className="mt-[20px] text-[13px] leading-[20px] text-[#61616a]">
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
