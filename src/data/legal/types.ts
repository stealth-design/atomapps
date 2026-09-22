/**
 * The shape both legal documents are stored in.
 *
 * Deliberately small — a heading, a paragraph, a list — because that is all
 * either document uses. Anything richer would be a licence to drift from the
 * published wording, which is the one thing these pages must not do.
 */
export interface LegalBlock {
  type: "h2" | "p" | "ul";
  /** Set for "h2" and "p". */
  text?: string;
  /** Set for "ul". */
  items?: string[];
  /**
   * Phrases in this block that should link somewhere the text does not name.
   * The published documents hyperlink a few words — "CCPA Form", "the link" —
   * whose targets are lost the moment the wording is stored as plain text.
   */
  links?: Record<string, string>;
}

export interface LegalDoc {
  title: string;
  /** Rendered under the title. The source page leaves its own field blank. */
  effective?: string;
  /** Where the wording was transcribed from, so it can be diffed later. */
  source: string;
  blocks: LegalBlock[];
}
