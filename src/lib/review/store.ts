import { del, list, put } from "@vercel/blob";

/**
 * Storage for the pre-launch review comments.
 *
 * TEMPORARY. The whole `review` feature — this file, the route beside it, and
 * `components/review` — exists so the client can leave feedback on the live
 * site before launch. Delete the three of them and the mount in `app/layout`
 * and nothing else is touched.
 *
 * One blob per comment rather than one JSON file holding all of them. A single
 * file would have to be read, mutated and written back on every post, and two
 * people commenting at once would silently drop one of the two — there is no
 * compare-and-swap on Blob to prevent it. A comment per object makes writes
 * independent, so the race cannot happen.
 *
 * Without `BLOB_READ_WRITE_TOKEN` the store reports itself unavailable rather
 * than throwing, and the client falls back to this-browser-only storage and
 * says so in the UI. That way the feature works the moment it deploys and
 * becomes shared the moment the token exists, with no code change.
 */

export interface ReviewComment {
  id: string;
  /** Section the pin belongs to — a `data-fold` id, or "footer". */
  anchor: string;
  /** Position within that section's box, as fractions of its width and height. */
  x: number;
  y: number;
  /** Route it was left on. */
  path: string;
  author: string;
  body: string;
  resolved: boolean;
  createdAt: string;
  /** Viewport width at the time, so layout-specific notes can be read in context. */
  viewport: number;
}

const PREFIX = "review-comments/";

/** True when a shared store is configured. */
export function isShared(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function readAll(): Promise<ReviewComment[]> {
  if (!isShared()) return [];

  const { blobs } = await list({ prefix: PREFIX });
  const parsed = await Promise.all(
    blobs.map(async (blob) => {
      try {
        const res = await fetch(blob.url, { cache: "no-store" });
        return res.ok ? ((await res.json()) as ReviewComment) : null;
      } catch {
        // One unreadable comment should not take the whole list down with it.
        return null;
      }
    }),
  );

  return parsed
    .filter((c): c is ReviewComment => c !== null)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function write(comment: ReviewComment): Promise<void> {
  await put(`${PREFIX}${comment.id}.json`, JSON.stringify(comment), {
    access: "public",
    contentType: "application/json",
    // The pathname is the id, so a resolve or an edit has to overwrite it.
    allowOverwrite: true,
    // The id is already unique; without this Blob appends its own suffix and
    // the pathname stops being addressable.
    addRandomSuffix: false,
  });
}

export async function remove(id: string): Promise<void> {
  const { blobs } = await list({ prefix: `${PREFIX}${id}.json` });
  await Promise.all(blobs.map((b) => del(b.url)));
}
