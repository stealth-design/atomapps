import { Fragment } from "react";
import type { LegalBlock, LegalDoc } from "@/data/legal/types";

/**
 * Renders a legal document from `@/data/legal`.
 *
 * Both pages are the same shape — a title, then a long run of headings,
 * paragraphs and lists — so they share this rather than each restating the
 * type scale. Measure is capped at 75ch: the documents are unbroken prose and
 * the 1440 content width would otherwise set them at ~160 characters a line.
 */

/** Emails and bare URLs, so the contact points in the text are clickable. */
// Each label is matched without a trailing dot, so an address or URL that
// closes a sentence does not swallow the full stop into its href.
const LINKABLE = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+)|((?:https?:\/\/|www\.)[^\s,)]+[^\s,).])/g;

function linkify(text: string) {
  const out: (string | React.ReactElement)[] = [];
  let last = 0;

  for (const match of text.matchAll(LINKABLE)) {
    const [found, email, url] = match;
    const at = match.index ?? 0;
    if (at > last) out.push(text.slice(last, at));

    const href = email ? `mailto:${email}` : url.startsWith("http") ? url : `https://${url}`;
    out.push(
      <a
        key={`${at}-${found}`}
        href={href}
        // The external ones are third-party policies the document points at,
        // so they open away from the page; `mailto:` is unaffected by target.
        {...(email ? {} : { target: "_blank", rel: "noopener noreferrer" })}
        className="underline underline-offset-2 hover:no-underline"
      >
        {found}
      </a>,
    );
    last = at + found.length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out.map((piece, index) => <Fragment key={index}>{piece}</Fragment>);
}

function Block({ block }: { block: LegalBlock }) {
  if (block.type === "h2") {
    return (
      <h2 className="mt-[40px] text-[20px] leading-[28px] font-bold text-[var(--foreground)] first:mt-0 tablet:mt-[56px] tablet:text-[24px] tablet:leading-[32px]">
        {block.text}
      </h2>
    );
  }

  if (block.type === "ul") {
    return (
      <ul className="mt-[16px] flex list-disc flex-col gap-[12px] pl-[22px] text-[15px] leading-[25px] text-[#3f3f46]">
        {block.items?.map((item, index) => <li key={index}>{linkify(item)}</li>)}
      </ul>
    );
  }

  return (
    <p className="mt-[16px] text-[15px] leading-[25px] text-[#3f3f46]">
      {linkify(block.text ?? "")}
    </p>
  );
}

export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <article className="max-w-[75ch]">
      <h1 className="text-[32px] leading-[40px] font-extrabold text-[var(--foreground)] tablet:text-[44px] tablet:leading-[52px]">
        {doc.title}
      </h1>

      {doc.effective && (
        <p className="mt-[16px] text-[14px] leading-[20px] text-[#61616a]">
          Effective date: {doc.effective}
        </p>
      )}

      <div className="mt-[32px] tablet:mt-[48px]">
        {doc.blocks.map((block, index) => (
          <Block key={index} block={block} />
        ))}
      </div>
    </article>
  );
}
