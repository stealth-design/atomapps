"use client";

import { useId, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { FIELD, LABEL, SUBMIT } from "@/components/ui/formStyles";
import { siteConfig } from "@/data/site";

/**
 * The CCPA request form, on the same white card the contact form uses.
 *
 * Fields and wording are the published form's
 * (atomapplications.com/atom/terms/ccpa-form.html): name, email, phone, the
 * four request types, and a free-text detail box.
 *
 * As with ContactForm there is no endpoint behind it — `onSubmit` swallows the
 * navigation and shows the acknowledgement, so nothing typed is lost to a
 * dead POST. THIS MATTERS MORE HERE THAN ON THE CONTACT PAGE: a CCPA request
 * carries a statutory clock, so until this is wired to a real handler the
 * acknowledgement points people at the email address as well, which is the
 * route the published form itself offers.
 */

/** The published form's four request types, in its own order. */
const REQUEST_TYPES = [
  "Access to your personal information",
  "Deletion of your personal information",
  "Opt out from sharing your personal information",
  "Correct your personal information",
];

export function CcpaForm() {
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
            Thanks — we have your request.
          </p>
          <p className="mt-[12px] max-w-[360px] text-[15px] leading-[23px] text-[#61616a]">
            We will verify your identity and respond within 45 days. You can
            also reach us directly at{" "}
            <a
              href={`mailto:${siteConfig.email}`}
              className="underline hover:no-underline"
            >
              {siteConfig.email}
            </a>
            .
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-[20px] tablet:flex-row">
            <div className="flex-1">
              <label className={LABEL} htmlFor={`${id}-first`}>
                First name
              </label>
              <input
                id={`${id}-first`}
                name="firstName"
                required
                autoComplete="given-name"
                placeholder="Enter your first name*"
                className={cn(FIELD, "mt-[10px] h-[52px]")}
              />
            </div>

            <div className="flex-1">
              <label className={LABEL} htmlFor={`${id}-last`}>
                Last name
              </label>
              <input
                id={`${id}-last`}
                name="lastName"
                required
                autoComplete="family-name"
                placeholder="Enter your last name*"
                className={cn(FIELD, "mt-[10px] h-[52px]")}
              />
            </div>
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
            <label className={LABEL} htmlFor={`${id}-phone`}>
              Phone number
            </label>
            <input
              id={`${id}-phone`}
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Enter phone number"
              className={cn(FIELD, "mt-[10px] h-[52px]")}
            />
          </div>

          <div className="mt-[20px]">
            <label className={LABEL} htmlFor={`${id}-type`}>
              Request type
            </label>
            {/* A real `select`, not the published form's text input dressed as
                one: it is a fixed list of four, so the platform control gives
                keyboard and screen-reader behaviour for free. `defaultValue=""`
                with a disabled placeholder option is what makes `required`
                actually block an empty submit. */}
            <select
              id={`${id}-type`}
              name="requestType"
              required
              defaultValue=""
              className={cn(FIELD, "mt-[10px] h-[52px] appearance-none bg-[length:16px] pr-[40px]")}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%2361616a' stroke-width='1.5'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 16px center",
              }}
            >
              <option value="" disabled>
                Select
              </option>
              {REQUEST_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-[20px]">
            <label className={LABEL} htmlFor={`${id}-detail`}>
              Request detail
            </label>
            <textarea
              id={`${id}-detail`}
              name="detail"
              rows={4}
              placeholder="Type something here"
              className={cn(FIELD, "mt-[10px] resize-y py-[14px]")}
            />
          </div>

          <div className="mt-[28px] flex">
            <button type="submit" className={SUBMIT}>
              Submit
            </button>
          </div>

          <p className="mt-[20px] text-[13px] leading-[20px] text-[#61616a]">
            By clicking &lsquo;Submit&rsquo;, I confirm that I have provided
            accurate information as a resident of the U.S.
          </p>
        </form>
      )}
    </div>
  );
}
