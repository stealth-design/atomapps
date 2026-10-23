"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent, type ReactNode, type Ref } from "react";
import { useGSAP } from "@gsap/react";
import { Cross } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "./useReducedMotion";

// King James Version, which is in the public domain. One verse per spread.
const VERSES = [
  { book: "Psalms", chapter: 23, text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { book: "Psalms", chapter: 119, text: "Thy word is a lamp unto my feet, and a light unto my path.", ref: "Psalm 119:105" },
  { book: "Proverbs", chapter: 3, text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding.", ref: "Proverbs 3:5" },
  { book: "Philippians", chapter: 4, text: "I can do all things through Christ which strengtheneth me.", ref: "Philippians 4:13" },
  { book: "Psalms", chapter: 46, text: "Be still, and know that I am God.", ref: "Psalm 46:10" },
  { book: "Numbers", chapter: 6, text: "The Lord bless thee, and keep thee.", ref: "Numbers 6:24" },
  { book: "Psalms", chapter: 118, text: "This is the day which the Lord hath made; we will rejoice and be glad in it.", ref: "Psalm 118:24" },
  { book: "1 Corinthians", chapter: 16, text: "Let all your things be done with charity.", ref: "1 Corinthians 16:14" },
];
const N = VERSES.length;
const PW = 270; // a page
const PH = 360;

// The verse of the day, worked out in the browser: the day of the year, round the list.
const noSubscribe = () => () => {};
const useDayIndex = () =>
  useSyncExternalStore(
    noSubscribe,
    () => Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 864e5) % N,
    () => 0,
  );

// Paper, a little darker toward the spine on either side.
const PAPER = "bg-[linear-gradient(90deg,#efe3c8_0%,#f8f0dc_12%,#fbf5e6_60%,#f4ead2_100%)]";
const PAPER_R = "bg-[linear-gradient(270deg,#efe3c8_0%,#f8f0dc_12%,#fbf5e6_60%,#f4ead2_100%)]";

function LeftPage({ i }: { i: number }) {
  const { book, chapter } = VERSES[(i + N) % N];
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-l-[6px] ${PAPER_R} text-center text-[#5a3a1a]`}>
      <p className="text-[13px] tracking-[0.3em] uppercase opacity-60">{book}</p>
      <p className="mt-2 font-serif text-[88px] leading-none opacity-85">{chapter}</p>
      <span className="mt-4 h-px w-20 bg-[#5a3a1a]/30" />
    </div>
  );
}

function RightPage({ i }: { i: number }) {
  const { text, ref } = VERSES[(i + N) % N];
  return (
    <div className={`absolute inset-0 flex flex-col justify-center rounded-r-[6px] px-8 ${PAPER}`}>
      <p className="font-serif text-[22px] leading-[1.45] text-[#2e1d0c]">{text}</p>
      <p className="mt-4 text-[13px] font-semibold tracking-wide text-[#8a5a2b]">{ref}</p>
    </div>
  );
}

// A turning page is cut into thin vertical slices, each hinged to the one
// before it, so the page can bend: mid-turn each slice rotates a little more
// than the last and the paper curves over the spine, its free edge trailing.
const SLICES = 14;
const SW = PW / SLICES;
const MAX_BEND = 80; // degrees of curl across the whole page, halfway over

/** One slice and, nested inside it, the rest of the page. Each face shows its own strip of the page. */
function Slice({ k, front, back }: { k: number; front: ReactNode; back: ReactNode }) {
  // Darker toward the curling edge, graded across each slice into the next so no bands show.
  const tone = (at: number) => `rgba(0,0,0,calc(var(--shade, 0) * ${(at / SLICES).toFixed(3)}))`;
  const shade = { background: `linear-gradient(90deg, ${tone(k)}, ${tone(k + 1)})` };
  const shadeBack = { background: `linear-gradient(270deg, ${tone(k)}, ${tone(k + 1)})` };
  return (
    <div
      className="absolute top-0 h-full origin-left [transform-style:preserve-3d]"
      style={{ width: SW, left: k ? SW : 0, transform: k ? "rotateY(var(--b, 0deg))" : "rotateY(var(--a, 0deg))" }}
    >
      {/* A hair wider than the slice, so no seam shows between neighbours. */}
      <div className="absolute inset-y-0 left-0 overflow-hidden [backface-visibility:hidden]" style={{ width: SW + 0.6 }}>
        <div className="absolute inset-y-0" style={{ width: PW, left: -k * SW }}>
          {front}
        </div>
        <div className="absolute inset-0" style={shade} />
      </div>
      <div className="absolute inset-y-0 right-0 overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]" style={{ width: SW + 0.6 }}>
        <div className="absolute inset-y-0" style={{ width: PW, left: -(SLICES - 1 - k) * SW }}>
          {back}
        </div>
        <div className="absolute inset-0" style={shadeBack} />
      </div>
      {k < SLICES - 1 && <Slice k={k + 1} front={front} back={back} />}
    </div>
  );
}

function Leaf({ leafRef, className = "", front, back }: { leafRef?: Ref<HTMLDivElement>; className?: string; front: ReactNode; back: ReactNode }) {
  return (
    <div ref={leafRef} className={`pointer-events-none absolute top-0 left-1/2 h-full w-1/2 [transform-style:preserve-3d] ${className}`}>
      <Slice k={0} front={front} back={back} />
    </div>
  );
}

/**
 * Turns a leaf to angle `a` (0 lying on the right, -180 on the left) going
 * `dir` (1 forward, -1 back): the curl is deepest halfway over and trails
 * the way the page is moving, and the curl's edge darkens with it. Returns
 * how far over it is lifted, 0 to 1.
 */
function bendLeaf(el: HTMLElement | null, a: number, dir: 1 | -1) {
  if (!el) return 0;
  const p = dir === 1 ? -a / 180 : (a + 180) / 180;
  const lift = Math.sin(Math.min(1, Math.max(0, p)) * Math.PI);
  el.style.setProperty("--a", `${a}deg`);
  el.style.setProperty("--b", `${(dir * lift * MAX_BEND) / SLICES}deg`);
  el.style.setProperty("--shade", String(lift * 0.45));
  return lift;
}

/**
 * The Holy Bible hero: a book in place of the phone. Once on load, its
 * leather cover swings open and a few pages turn, quick then slower, onto
 * the verse of the day on the right-hand page. Then
 * the reader turns pages — drag a page across the spine (let go past halfway
 * and it turns, otherwise it falls back), click a page, or use the arrow
 * keys — each spread a new verse. The corner nearest the cursor lifts to
 * show it turns. Under reduced motion the book is open from the start and a
 * turn swaps the spread with a fade.
 */
export function HeroBible() {
  const still = useReducedMotion();
  const day = useDayIndex();
  const [i, setI] = useState<number | null>(null); // the open spread; null while the book is closed
  const [turn, setTurn] = useState<{ dir: 1 | -1 } | null>(null);
  const [scale, setScale] = useState(1);
  const scope = useRef<HTMLDivElement>(null);
  const leaf = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const angle = useRef(0);
  const spread = i ?? day;
  const open = still || i !== null; // closed only until the reveal has played

  useEffect(() => {
    const el = scope.current!.parentElement!;
    // The box is capped at the book's width (more on roomy screens), so this only goes past 1 there.
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / (PW * 2)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The reveal: the cover opens, three pages turn, the book settles on today's verse.
  useGSAP(
    () => {
      const q = gsap.utils.selector(scope);
      if (still) return;
      const t = gsap.timeline({ delay: 0.3, onComplete: () => setI(day) });
      t.set(q(".left-half"), { autoAlpha: 0 })
        .to(q(".cover"), { rotateY: -180, duration: 1, ease: "power2.inOut" })
        .set(q(".left-half"), { autoAlpha: 1 }, 0.55)
        .to(q(".cover"), { autoAlpha: 0, duration: 0.2 }, ">-0.05");
      q(".riffle").forEach((p, k) => {
        const state = { a: 0 };
        t.set(p, { autoAlpha: 1 }, k ? ">-0.12" : ">-0.1")
          .to(state, { a: -180, duration: 0.45 + k * 0.2, ease: "power1.inOut", onUpdate: () => void bendLeaf(p, state.a, 1) }, "<")
          .set(p, { autoAlpha: 0 });
      });
    },
    { scope, dependencies: [still, day] },
  );

  // A turn: the leaf swings about the spine, from `from` degrees to `to`, then the spread moves on.
  const play = (dir: 1 | -1, from: number) => {
    const to = dir === 1 ? -180 : 0;
    const state = { a: from };
    gsap.to(state, {
      a: to,
      duration: 0.7 * (Math.abs(to - from) / 180) + 0.15,
      ease: "power2.inOut",
      onUpdate: () => bend(state.a, dir),
      onComplete: () => {
        setI((s) => ((s ?? day) + dir + N) % N);
        setTurn(null);
      },
    });
  };
  const cancel = (dir: 1 | -1, from: number) => {
    const state = { a: from };
    gsap.to(state, { a: dir === 1 ? 0 : -180, duration: 0.35, ease: "power2.out", onUpdate: () => bend(state.a, dir), onComplete: () => setTurn(null) });
  };
  // Bends the leaf to angle `a`, and casts its shadow on the pages beneath.
  const bend = (a: number, dir: 1 | -1) => {
    angle.current = a;
    scope.current?.style.setProperty("--cast", String(bendLeaf(leaf.current, a, dir) * 0.5));
  };

  const go = (dir: 1 | -1) => {
    if (turn || !open) return;
    if (still) return setI((s) => ((s ?? day) + dir + N) % N);
    setTurn({ dir });
    requestAnimationFrame(() => play(dir, dir === 1 ? 0 : -180));
  };

  const onDown = (e: PointerEvent<HTMLDivElement>, dir: 1 | -1) => {
    if (turn || !open) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, moved: false };
    if (!still) setTurn({ dir });
  };
  const onMove = (e: PointerEvent<HTMLDivElement>, dir: 1 | -1) => {
    if (!drag.current || still) return;
    const dx = (e.clientX - drag.current.x) / scale;
    if (Math.abs(dx) > 5) drag.current.moved = true;
    // Forward: pulling the right page left lifts it over; back: the reverse.
    const p = Math.min(1, Math.max(0, (dir === 1 ? -dx : dx) / (PW * 1.6)));
    bend(dir === 1 ? -180 * p : -180 + 180 * p, dir);
  };
  const onUp = (e: PointerEvent<HTMLDivElement>, dir: 1 | -1) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (still) return go(dir);
    if (!d.moved) return play(dir, dir === 1 ? 0 : -180);
    const a = angle.current;
    const p = dir === 1 ? -a / 180 : 1 + a / 180;
    if (p > 0.5) play(dir, a);
    else cancel(dir, a);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else return;
    e.preventDefault();
  };

  // While a page turns, the pages beneath already show where it lands.
  const under = turn ? { left: turn.dir === 1 ? spread : spread - 1, right: turn.dir === 1 ? spread + 1 : spread } : { left: spread, right: spread };

  return (
    <div className="mx-auto mt-10 mb-[150px] w-[min(540px,calc(100vw-32px))] short:mt-6 roomy:w-[640px]" style={{ height: PH * scale + 30 }}>
      <style>{`@keyframes tt-ink{from{opacity:0;transform:translateY(4px);filter:blur(3px)}to{opacity:1;transform:none;filter:none}}`}</style>
      <div
        ref={scope}
        tabIndex={0}
        role="group"
        aria-roledescription="book"
        aria-label={`Verse of the day: ${VERSES[spread].ref}. Use the arrow keys to turn the page.`}
        onKeyDown={onKey}
        className="relative origin-top-left rounded-[8px] outline-offset-8 [perspective:2000px] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        style={{ width: PW * 2, height: PH, transform: `scale(${scale})` }}
      >
        {/* A warm light on the pages, and the book's shadow. */}
        <div className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(255,214,140,0.55),transparent)]" />
        <div className="absolute inset-x-2 -bottom-3 h-6 rounded-[50%] bg-black/25 blur-md" />

        {/* The page block's edges, stacked under each half. */}
        <div className={`absolute inset-y-0 left-0 w-1/2 rounded-l-[6px] ${open ? "" : "invisible"} shadow-[-1px_1px_0_#e4d6b6,-2px_2px_0_#cdbb93,-3px_3px_0_#e4d6b6,-4px_4px_0_#cdbb93,-5px_5px_0_#bfa97d]`} />
        <div className="absolute inset-y-0 right-0 w-1/2 rounded-r-[6px] shadow-[1px_1px_0_#e4d6b6,2px_2px_0_#cdbb93,3px_3px_0_#e4d6b6,4px_4px_0_#cdbb93,5px_5px_0_#bfa97d]" />

        <div className={`left-half group absolute top-0 left-0 h-full w-1/2 ${open ? "" : "invisible"} cursor-grab touch-none shadow-[inset_-18px_0_24px_-18px_rgba(0,0,0,0.35)]`} onPointerDown={(e) => onDown(e, -1)} onPointerMove={(e) => onMove(e, -1)} onPointerUp={(e) => onUp(e, -1)}>
          <LeftPage i={under.left} />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(270deg,rgba(0,0,0,0.6),transparent_55%)]" style={{ opacity: "var(--cast, 0)" }} />
          <span className="absolute bottom-0 left-0 size-0 bg-[linear-gradient(45deg,#e6d6b3_50%,transparent_50%)] shadow-[3px_-3px_6px_rgba(0,0,0,0.15)] transition-[width,height] duration-300 group-hover:size-7" />
        </div>
        <div className="group absolute top-0 right-0 h-full w-1/2 cursor-grab touch-none shadow-[inset_18px_0_24px_-18px_rgba(0,0,0,0.35)]" onPointerDown={(e) => onDown(e, 1)} onPointerMove={(e) => onMove(e, 1)} onPointerUp={(e) => onUp(e, 1)}>
          <div key={`${under.right}-${open}`} className="absolute inset-0 motion-reduce:animate-[tt-ink_.4s_ease-out_both]">
            <RightPage i={under.right} />
          </div>
          {/* The turning page's shadow, sweeping over the page it uncovers. */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.6),transparent_55%)]" style={{ opacity: "var(--cast, 0)" }} />
          <span className="absolute right-0 bottom-0 size-0 bg-[linear-gradient(-45deg,#e6d6b3_50%,transparent_50%)] shadow-[-3px_-3px_6px_rgba(0,0,0,0.15)] transition-[width,height] duration-300 group-hover:size-7" />
        </div>

        {/* The turning page: its front is the page it leaves, its back the page it reveals. */}
        {turn && (
          <Leaf
            leafRef={(el) => {
              // Posed once, as it mounts; a re-render mid-turn mustn't reset it.
              if (el && el !== leaf.current) {
                leaf.current = el;
                bend(turn.dir === 1 ? 0 : -180, turn.dir);
              }
            }}
            front={<RightPage i={turn.dir === 1 ? spread : spread - 1} />}
            back={<LeftPage i={turn.dir === 1 ? spread + 1 : spread} />}
          />
        )}

        {/* The reveal: a few blank pages riffled over, under the cover. */}
        {!open &&
          [0, 1, 2].map((k) => (
            <Leaf key={k} className="riffle invisible" front={<div className={`absolute inset-0 rounded-r-[6px] ${PAPER}`} />} back={<div className={`absolute inset-0 rounded-l-[6px] ${PAPER_R}`} />} />
          ))}
        {!open && (
          <div className="cover absolute top-0 left-1/2 z-10 h-full w-1/2 origin-left [transform-style:preserve-3d]">
            <div className="absolute -inset-[6px] flex flex-col items-center justify-center rounded-[10px] bg-[radial-gradient(120%_90%_at_30%_20%,#8a4a14,#5a2c08_55%,#3a1a04)] text-[#e9c46a] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)] [backface-visibility:hidden]">
              <span className="absolute inset-3 rounded-[6px] border border-[#e9c46a]/50" />
              <Cross aria-hidden className="size-10" strokeWidth={1.4} />
              <p className="mt-4 font-serif text-[26px] tracking-[0.18em]">HOLY</p>
              <p className="font-serif text-[26px] tracking-[0.18em]">BIBLE</p>
            </div>
            <div className="absolute -inset-[6px] rounded-[10px] bg-[#4a2306] [backface-visibility:hidden] [transform:rotateY(180deg)]" />
          </div>
        )}
      </div>
    </div>
  );
}
