import { del, get, list, put } from "@vercel/blob";

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
 * The store is private, so comments are not readable by anyone who happens on
 * a blob URL — reads go through the SDK with the token rather than fetching a
 * public URL. Client feedback is candid by design and there is no reason for
 * it to be world-readable.
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

/**
 * True when a shared store is configured.
 *
 * `BLOB_STORE_ID` first, and that ordering is the whole point: a *private*
 * store connected to a project does not get a `BLOB_READ_WRITE_TOKEN` at all.
 * Vercel injects a short-lived OIDC token plus `BLOB_STORE_ID` instead, and
 * the SDK authenticates with those by default when it runs on Vercel. Checking
 * only for the read-write token reported "no shared store" on a store that was
 * connected and working, and quietly sent every comment to localStorage.
 *
 * The token is still honoured for anything running off Vercel.
 */
export function isShared(): boolean {
  return Boolean(process.env.BLOB_STORE_ID ?? process.env.BLOB_READ_WRITE_TOKEN);
}

export async function readAll(): Promise<ReviewComment[]> {
  if (!isShared()) return [];

  const { blobs } = await list({ prefix: PREFIX });
  const parsed = await Promise.all(
    blobs.map(async (blob) => {
      try {
        // By pathname through the SDK, not by URL: the store is private, and
        // `useCache: false` because a comment posted a second ago must show up
        // in the very next read.
        const result = await get(blob.pathname, { access: "private", useCache: false });
        // `get` answers with a status rather than throwing on a miss, and the
        // stream is null on anything that is not a 200.
        if (!result || result.statusCode !== 200 || !result.stream) return null;
        return (await new Response(result.stream).json()) as ReviewComment;
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
    access: "private",
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
