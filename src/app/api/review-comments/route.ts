import { isShared, readAll, remove, write, type ReviewComment } from "@/lib/review/store";

/**
 * Pre-launch review comments. TEMPORARY — see `lib/review/store`.
 *
 * `force-dynamic` because a comment feed that Next decides to cache is a
 * comment feed that stops updating. There is no revalidation story worth
 * building for a tool with this lifespan.
 */
export const dynamic = "force-dynamic";

/** Long enough for a paragraph of feedback, short enough not to be a payload. */
const MAX_BODY = 2000;
const MAX_AUTHOR = 80;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Fractions of a section's box; anything outside 0..1 is a bad anchor. */
function fraction(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1
    ? value
    : null;
}

export async function GET() {
  if (!isShared()) {
    return Response.json({ shared: false, comments: [] });
  }
  try {
    return Response.json({ shared: true, comments: await readAll() });
  } catch (error) {
    console.error("[review-comments] read failed", error);
    return Response.json({ shared: false, comments: [], error: "read-failed" }, { status: 200 });
  }
}

export async function POST(request: Request) {
  if (!isShared()) {
    return Response.json({ error: "no-store" }, { status: 501 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return Response.json({ error: "bad-request" }, { status: 400 });
  }

  const data = payload as Record<string, unknown>;
  const body = clean(data.body, MAX_BODY);
  const anchor = clean(data.anchor, 40);
  const x = fraction(data.x);
  const y = fraction(data.y);

  if (!body || !anchor || x === null || y === null) {
    return Response.json({ error: "bad-request" }, { status: 400 });
  }

  // Recovered comments carry their original timestamp: a note left three days
  // ago should not read as if it arrived the moment it was rescued from a
  // browser. Anything unparseable falls back to now.
  const claimed = clean(data.createdAt, 40);
  const createdAt =
    claimed && !Number.isNaN(Date.parse(claimed)) ? new Date(claimed).toISOString() : null;

  const comment: ReviewComment = {
    id: crypto.randomUUID(),
    anchor,
    x,
    y,
    path: clean(data.path, 200) || "/",
    author: clean(data.author, MAX_AUTHOR) || "Anonymous",
    body,
    resolved: false,
    createdAt: createdAt ?? new Date().toISOString(),
    viewport: typeof data.viewport === "number" ? Math.round(data.viewport) : 0,
  };

  try {
    await write(comment);
    return Response.json({ comment });
  } catch (error) {
    console.error("[review-comments] write failed", error);
    return Response.json({ error: "write-failed" }, { status: 500 });
  }
}

/** Resolve or reopen. The body is the only thing that cannot be edited. */
export async function PATCH(request: Request) {
  if (!isShared()) return Response.json({ error: "no-store" }, { status: 501 });

  const data = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const id = clean(data?.id, 60);
  if (!id) return Response.json({ error: "bad-request" }, { status: 400 });

  try {
    const existing = (await readAll()).find((c) => c.id === id);
    if (!existing) return Response.json({ error: "not-found" }, { status: 404 });

    await write({ ...existing, resolved: Boolean(data?.resolved) });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[review-comments] patch failed", error);
    return Response.json({ error: "write-failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isShared()) return Response.json({ error: "no-store" }, { status: 501 });

  const id = clean(new URL(request.url).searchParams.get("id"), 60);
  if (!id) return Response.json({ error: "bad-request" }, { status: 400 });

  try {
    await remove(id);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[review-comments] delete failed", error);
    return Response.json({ error: "delete-failed" }, { status: 500 });
  }
}
