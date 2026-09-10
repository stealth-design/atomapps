"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReviewComment } from "@/lib/review/store";

/**
 * Pre-launch review comments. TEMPORARY — see `lib/review/store` for the
 * lifespan note and how to remove the whole feature.
 *
 * Off and invisible until it is asked for, two ways: `Alt`/`Option` + `C`, or
 * `?comments` on the URL, which is the link to send someone who will not
 * remember a shortcut. Ordinary visitors are never shown an affordance, so the
 * page is unchanged for them whether or not this is deployed.
 *
 * ## How a pin stays put
 *
 * A comment is stored against a *section* — a `data-fold` id, or the footer —
 * plus a fraction of that section's width and height. Not page coordinates:
 * the page is 10,000px tall and reflows hard between breakpoints, so absolute
 * coordinates captured at 1512 would be meaningless at 390. A fraction of the
 * fold the reader was actually looking at survives both.
 *
 * Positions are read from `offsetTop`/`offsetLeft` rather than
 * `getBoundingClientRect`, which matters on this page specifically: the folds
 * are moved by parallax and the app stack is sticky, so a bounding rect is
 * wherever the scroll animation currently has it. The offset chain is layout
 * geometry and ignores transforms, so a pin sits in the same place no matter
 * where the page is scrolled — and needs no per-frame work to stay there.
 *
 * The cost of that choice: clicking on a fold that is mid-parallax lands the
 * pin at the element's untransformed position, up to ~25px from the cursor on
 * most folds and further inside the sticky stack. Worth it for pins that do
 * not drift while you scroll past them.
 */

interface Draft {
  anchor: string;
  x: number;
  y: number;
  /** Where to put the composer, in document coordinates. */
  left: number;
  top: number;
}

const LOCAL_KEY = "atom-review-comments";
const AUTHOR_KEY = "atom-review-author";

/** Layout box in document space — transform-free, so scroll animation cannot move it. */
function layoutBox(el: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/** The sections a pin can be anchored to, in document order. */
function sections(): { id: string; el: HTMLElement }[] {
  const out: { id: string; el: HTMLElement }[] = [];
  document.querySelectorAll<HTMLElement>("[data-fold]").forEach((el) => {
    out.push({ id: `fold-${el.dataset.fold}`, el });
  });
  const footer = document.getElementById("contact");
  if (footer) out.push({ id: "footer", el: footer });
  return out;
}

function sectionById(id: string): HTMLElement | null {
  if (id === "footer") return document.getElementById("contact");
  return document.querySelector<HTMLElement>(`[data-fold="${id.replace("fold-", "")}"]`);
}

/** Document position of a stored comment, or null if its section is gone. */
function pinAt(comment: Pick<ReviewComment, "anchor" | "x" | "y">) {
  const el = sectionById(comment.anchor);
  if (!el) return null;
  const box = layoutBox(el);
  return { left: box.x + comment.x * box.w, top: box.y + comment.y * box.h };
}

export function CommentMode() {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [shared, setShared] = useState<boolean | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [tick, setTick] = useState(0); // forces pins to re-measure
  const composerRef = useRef<HTMLTextAreaElement>(null);
  // Mirrors `draft` so the key handler, which is bound once, can branch on it
  // without reading a stale closure or nesting one setState inside another.
  const draftRef = useRef<Draft | null>(null);
  const openRef = useRef(false);

  const putDraft = useCallback((next: Draft | null) => {
    draftRef.current = next;
    setDraft(next);
  }, []);

  /** Entering or leaving always starts from a clean slate. */
  const setMode = useCallback(
    (next: boolean) => {
      setOpen(next);
      putDraft(null);
      setActiveId(null);
    },
    [putDraft],
  );

  // ---- loading ------------------------------------------------------------
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/review-comments", { cache: "no-store" });
      const data = await res.json();
      if (data.shared) {
        setShared(true);
        setComments(data.comments as ReviewComment[]);
        return;
      }
    } catch {
      // fall through to local
    }
    // No shared store: this browser only, and the UI says so.
    setShared(false);
    try {
      setComments(JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]") as ReviewComment[]);
    } catch {
      setComments([]);
    }
  }, []);

  const saveLocal = useCallback((next: ReviewComment[]) => {
    setComments(next);
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    } catch {
      /* private mode; the list still works for this session */
    }
  }, []);

  // ---- opening ------------------------------------------------------------
  useEffect(() => {
    // The rule below guards against cascading renders from synchronous
    // setState. These two are browser-only reads that can only happen after
    // mount — the URL and localStorage do not exist on the server — and they
    // run once, so there is no cascade to guard against.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (new URLSearchParams(window.location.search).has("comments")) setMode(true);
    setAuthor(localStorage.getItem(AUTHOR_KEY) ?? "");
    /* eslint-enable react-hooks/set-state-in-effect */

    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (event.key === "Escape") {
        // Escape backs out one level: composer, then the mode itself.
        if (draftRef.current) putDraft(null);
        else setMode(false);
        return;
      }
      // `Alt`/`Option` + C. Ignored while typing so it cannot fire mid-comment.
      if (!typing && event.altKey && (event.code === "KeyC" || event.key.toLowerCase() === "c")) {
        event.preventDefault();
        setMode(!openRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [putDraft, setMode]);

  useEffect(() => {
    openRef.current = open;
    if (!open) return;
    // `load` is async: every setState in it happens after an await, not
    // synchronously in the effect, which is what the rule is about.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // Pins are measured, not tracked, so a resize is the one thing that has to
    // re-measure them. Scrolling does not: the offset chain does not move.
    const onResize = () => setTick((t) => t + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, load]);

  useEffect(() => {
    if (draft) composerRef.current?.focus();
  }, [draft]);

  // ---- placing ------------------------------------------------------------
  const place = (event: React.MouseEvent<HTMLDivElement>) => {
    const docX = event.clientX + window.scrollX;
    const docY = event.clientY + window.scrollY;

    // The section whose layout box contains the point, last one wins so a
    // nested fold beats its parent.
    let hit: { id: string; box: ReturnType<typeof layoutBox> } | null = null;
    for (const { id, el } of sections()) {
      const box = layoutBox(el);
      if (docY >= box.y && docY <= box.y + box.h) hit = { id, box };
    }
    if (!hit) return;

    setActiveId(null);
    putDraft({
      anchor: hit.id,
      x: Math.min(1, Math.max(0, (docX - hit.box.x) / hit.box.w)),
      y: Math.min(1, Math.max(0, (docY - hit.box.y) / hit.box.h)),
      left: docX,
      top: docY,
    });
    setBody("");
  };

  const submit = async () => {
    if (!draft || !body.trim() || busy) return;
    setBusy(true);
    localStorage.setItem(AUTHOR_KEY, author);

    const payload = {
      anchor: draft.anchor,
      x: draft.x,
      y: draft.y,
      path: window.location.pathname,
      author: author.trim() || "Anonymous",
      body: body.trim(),
      viewport: window.innerWidth,
    };

    if (shared) {
      // A failed save must never close the composer: the note is only in this
      // textarea, and silently dropping someone's feedback is worse than any
      // error message.
      try {
        const res = await fetch("/api/review-comments", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          setSaveError(`Could not save (${res.status}). Your note is still here — try again.`);
          setBusy(false);
          return;
        }
        await load();
      } catch {
        setSaveError("Could not reach the server. Your note is still here — try again.");
        setBusy(false);
        return;
      }
    } else {
      saveLocal([
        ...comments,
        { ...payload, id: crypto.randomUUID(), resolved: false, createdAt: new Date().toISOString() },
      ]);
    }

    setBusy(false);
    setSaveError(null);
    putDraft(null);
    setBody("");
  };

  const setResolved = async (comment: ReviewComment, resolved: boolean) => {
    if (shared) {
      await fetch("/api/review-comments", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: comment.id, resolved }),
      });
      await load();
    } else {
      saveLocal(comments.map((c) => (c.id === comment.id ? { ...c, resolved } : c)));
    }
  };

  const destroy = async (comment: ReviewComment) => {
    if (shared) {
      await fetch(`/api/review-comments?id=${encodeURIComponent(comment.id)}`, { method: "DELETE" });
      await load();
    } else {
      saveLocal(comments.filter((c) => c.id !== comment.id));
    }
    setActiveId(null);
  };

  if (!open) return null;

  const path = typeof window === "undefined" ? "/" : window.location.pathname;
  const onThisPage = comments.filter((c) => c.path === path);
  const visible = onThisPage.filter((c) => showResolved || !c.resolved);
  const openCount = onThisPage.filter((c) => !c.resolved).length;

  return (
    <div
      data-review-ui
      style={{ font: "13px/1.45 ui-sans-serif, system-ui, -apple-system, sans-serif" }}
    >
      {/* Click surface. Absolute rather than fixed so it scrolls with the page
          and covers the whole document, and so pins share its coordinate
          space — with no positioned ancestor its containing block is the
          document itself. */}
      <div
        onClick={place}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: document.documentElement.scrollHeight,
          zIndex: 2147483000,
          cursor: "crosshair",
        }}
      />

      {/* Pins */}
      {visible.map((comment, index) => {
        const at = pinAt(comment);
        if (!at) return null;
        const isActive = activeId === comment.id;
        return (
          <div
            key={comment.id + tick}
            style={{
              position: "absolute",
              left: at.left,
              top: at.top,
              zIndex: 2147483001,
              transform: "translate(-50%, -100%)",
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                putDraft(null);
                setActiveId(isActive ? null : comment.id);
              }}
              title={`${comment.author}: ${comment.body}`}
              style={{
                width: 26,
                height: 26,
                borderRadius: "50% 50% 50% 2px",
                background: comment.resolved ? "#6b7280" : "#facc15",
                color: "#111",
                fontWeight: 700,
                fontSize: 12,
                border: "2px solid #fff",
                boxShadow: "0 2px 8px rgba(0,0,0,.35)",
                cursor: "pointer",
              }}
            >
              {index + 1}
            </button>

            {isActive && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  top: 30,
                  left: 0,
                  width: 260,
                  background: "#18181b",
                  color: "#f4f4f5",
                  borderRadius: 10,
                  padding: 12,
                  boxShadow: "0 10px 30px rgba(0,0,0,.45)",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{comment.author}</div>
                <div style={{ whiteSpace: "pre-wrap", marginBottom: 10 }}>{comment.body}</div>
                <div style={{ opacity: 0.55, fontSize: 11, marginBottom: 10 }}>
                  {new Date(comment.createdAt).toLocaleString()} · {comment.viewport}px wide
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setResolved(comment, !comment.resolved)}
                    style={btn}
                  >
                    {comment.resolved ? "Reopen" : "Resolve"}
                  </button>
                  <button type="button" onClick={() => destroy(comment)} style={btnGhost}>
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Composer */}
      {draft && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            left: draft.left,
            top: draft.top + 8,
            width: 280,
            zIndex: 2147483002,
            background: "#18181b",
            color: "#f4f4f5",
            borderRadius: 10,
            padding: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,.45)",
          }}
        >
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name"
            style={{ ...field, marginBottom: 8 }}
          />
          <textarea
            ref={composerRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void submit();
            }}
            placeholder="What needs changing here?"
            rows={4}
            style={{ ...field, resize: "vertical", marginBottom: 8 }}
          />
          {saveError && (
            <div
              style={{
                marginBottom: 8,
                padding: "6px 8px",
                borderRadius: 6,
                background: "#7f1d1d",
                color: "#fecaca",
                fontSize: 11,
              }}
            >
              {saveError}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button type="button" onClick={submit} disabled={!body.trim() || busy} style={btn}>
              {busy ? "Saving…" : "Comment"}
            </button>
            <button type="button" onClick={() => putDraft(null)} style={btnGhost}>
              Cancel
            </button>
            <span style={{ marginLeft: "auto", opacity: 0.45, fontSize: 11 }}>⌘↵</span>
          </div>
        </div>
      )}

      {/* Status bar. Fixed, so it is always reachable however far down you are. */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          left: 16,
          bottom: 16,
          zIndex: 2147483003,
          background: "#18181b",
          color: "#f4f4f5",
          borderRadius: 10,
          padding: "10px 12px",
          boxShadow: "0 10px 30px rgba(0,0,0,.45)",
          maxWidth: 320,
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: "#facc15" }} />
          <strong>Comment mode</strong>
          <span style={{ opacity: 0.55 }}>
            {openCount} open{onThisPage.length !== openCount ? ` · ${onThisPage.length - openCount} resolved` : ""}
          </span>
          <button
            type="button"
            onClick={() => setMode(false)}
            style={{ ...btnGhost, marginLeft: "auto" }}
          >
            Exit
          </button>
        </div>

        <div style={{ opacity: 0.55, marginTop: 6, fontSize: 11 }}>
          Click anywhere to leave a note · Esc to exit · Alt+C toggles
        </div>

        {shared === false && (
          <div
            style={{
              marginTop: 8,
              padding: "6px 8px",
              borderRadius: 6,
              background: "#7c2d12",
              color: "#fed7aa",
              fontSize: 11,
            }}
          >
            No shared store configured — these comments are saved in this browser
            only and nobody else can see them.
          </div>
        )}

        {onThisPage.length > 0 && (
          <label style={{ display: "flex", gap: 6, marginTop: 8, fontSize: 11, opacity: 0.7 }}>
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
            />
            Show resolved
          </label>
        )}
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  background: "#facc15",
  color: "#111",
  border: 0,
  borderRadius: 6,
  padding: "5px 10px",
  fontWeight: 600,
  cursor: "pointer",
  font: "inherit",
};

const btnGhost: React.CSSProperties = {
  background: "transparent",
  color: "#a1a1aa",
  border: "1px solid #3f3f46",
  borderRadius: 6,
  padding: "5px 10px",
  cursor: "pointer",
  font: "inherit",
};

const field: React.CSSProperties = {
  width: "100%",
  background: "#27272a",
  color: "#f4f4f5",
  border: "1px solid #3f3f46",
  borderRadius: 6,
  padding: "6px 8px",
  font: "inherit",
  boxSizing: "border-box",
};
