"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, Calculator, FileText, Languages, Paperclip, PenLine, Sparkles } from "lucide-react";
import { PULSE_EVENT, type Pulse } from "./ShaderBackground";
import { useReducedMotion } from "./useReducedMotion";
import { Hint } from "./Hint";

/*
 * The AI chat hero's sky, for ShaderBackground's `frag`, after the app's own
 * posters: near black, mint green welling up from the top left and deep blue
 * from the bottom right, both made of slow domain-warped noise, and a thin
 * aurora ribbon drifting across behind the prompt bar.
 *
 * The prompt bar drives it through PULSE_EVENT: each keystroke, each streamed
 * word and the voice mode send a ring out from the bar (uClicks), which pushes
 * the light aside and glows mint, and every ring surges uFlow, so the aurora
 * runs faster while the reader types or the answer streams in.
 */
export const AI_FRAG = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform vec4 uClicks[4];uniform float uFlow;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}
void main(){
  vec2 q=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  vec2 p=q+(uMouse-.5)*vec2(.08,.05);

  float glow=0.;
  for(int i=0;i<4;i++){
    float age=uTime-uClicks[i].z;
    if(age<0.||age>3.)continue;
    vec2 d=q-(uClicks[i].xy-.5*uRes)/uRes.y;
    float r=length(d);
    float ring=exp(-pow((r-age*.5)*10.,2.))*exp(-age*1.6)*uClicks[i].w;
    p+=d/(r+1e-4)*ring*.06;
    glow+=ring;
  }

  float f=uFlow*.12;
  vec2 w=vec2(fbm(p*1.5+vec2(f,0.)),fbm(p*1.5+vec2(0.,-f)+5.2));
  float n=fbm(p*2.2+w*1.6+vec2(f*.5,f*.2));

  float a=uRes.x/uRes.y*.5;
  float g=smoothstep(1.4,0.,length(p-vec2(-a,.5)));
  float b=smoothstep(1.4,0.,length(p-vec2(a,-.5)));
  vec3 col=vec3(.01,.016,.028);
  col+=vec3(.06,.86,.58)*g*g*(.25+n)*.6;
  col+=vec3(.06,.26,.82)*b*b*(.25+n)*.75;

  // The ribbon: a soft line that bends with the noise, mint on the left, blue on the right.
  float y=p.y+.2-.08*sin(p.x*2.4+f*2.)-.12*(w.x-.5);
  float rib=exp(-y*y*60.)*(.3+.9*fbm(vec2(p.x*3.-f*2.5,y*8.)));
  col+=mix(vec3(.13,.88,.63),vec3(.2,.45,1.),smoothstep(-.7,.7,p.x))*rib*.3;

  col+=glow*vec3(.2,.9,.65)*.5;
  gl_FragColor=vec4(col,1.);
}`;

const MODELS = ["GPT-5.2", "Claude 4", "Gemini", "Grok 4"];

// Sample prompts and their answers, fixed text: nothing is sent anywhere.
// The homework and voice ones are the app's own poster examples.
const CHIPS = [
  { label: "AI Writing", Icon: PenLine, prompt: "Write a short email asking to move Friday's meeting to Monday", answer: "Hi Sam, would it be possible to move Friday's meeting to Monday morning? Something has come up on my side. Happy to fit around your calendar. Thanks, Alex" },
  { label: "PDF Summary", Icon: FileText, file: "Q3-report.pdf", prompt: "Summarise this report in three points", answer: "1. Revenue grew 18%, led by subscriptions.\n2. Costs held flat after the switch to a new supplier.\n3. The team recommends putting Q4's budget into mobile." },
  { label: "AI Homework", Icon: Calculator, prompt: "Solve 27 − 4(2×5)", answer: "Brackets first: 2×5 = 10.\nThen multiply by 4: 4×10 = 40.\nThen subtract from 27: 27 − 40 = −13.\nAnswer: −13" },
  { label: "Translate", Icon: Languages, prompt: "How do I say “Where is the train station?” in Spanish?", answer: "¿Dónde está la estación de tren?" },
];
const VOICE = { prompt: "Give me a step by step plan to get rich.", answer: "1. Spend less than you earn.\n2. Invest the difference every month.\n3. Learn a skill people will pay for.\n4. Be patient: time does most of the work." };
const freeAnswer = (model: string) => `Good question. Ask it in the app and ${model} will answer it in full, one swipe from your home screen.`;

type Phase = "idle" | "listening" | "thinking" | "answering" | "done";
const NOTES: Record<Phase, string> = { idle: "", listening: "Listening…", thinking: "Thinking…", answering: "Writing…", done: "Answer ready" };

/**
 * The AI chat hero: the app's "Ask AI Anything" box, working. Typing into it
 * ripples the shader sky from the bar; Enter or the send button asks, and a
 * fixed sample answer streams in word by word where the feature chips were.
 * A chip types its own prompt in and asks it, the paperclip attaches a PDF
 * to summarise, and Speak plays voice mode: the waveform moves, the sky
 * pulses like a voice, and the spoken question writes itself in. "Ask
 * something else" brings the chips back. The hero stays dark (`data-dark`).
 */
export function HeroAI() {
  const still = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLFormElement>(null);
  const run = useRef(0);
  const [model, setModel] = useState(MODELS[0]);
  const [text, setText] = useState("");
  const [file, setFile] = useState<string>();
  const [asked, setAsked] = useState<{ prompt: string; file?: string }>();
  const [answer, setAnswer] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const hero = ref.current!.closest("section")!;
    hero.dataset.dark = "true";
    return () => void delete hero.dataset.dark;
  }, []);
  useEffect(() => () => void run.current++, []);

  const pulse = (strength: number) => {
    const r = bar.current!.getBoundingClientRect();
    dispatchEvent(new CustomEvent<Pulse>(PULSE_EVENT, { detail: { x: r.left + r.width / 2, y: r.top + r.height / 2, strength } }));
  };

  // One sequence at a time: starting another bumps `run`, and the old one stops at its next wait.
  const play = async (prompt: string, reply: string, opts: { file?: string; voice?: boolean; typed?: boolean } = {}) => {
    const id = ++run.current;
    const wait = (ms: number) => new Promise<boolean>((r) => setTimeout(() => r(run.current === id), still ? 0 : ms));
    setAnswer("");
    setAsked(undefined);
    setFile(opts.file);

    if (!opts.typed) {
      setPhase(opts.voice ? "listening" : "idle");
      for (let i = 1; i <= prompt.length; i++) {
        if (still) i = prompt.length;
        setText(prompt.slice(0, i));
        if (opts.voice ? i % 3 === 0 : true) pulse(opts.voice ? 0.3 + Math.random() * 0.6 : 0.2);
        if (!(await wait(opts.voice ? 45 : 28))) return;
      }
      if (!(await wait(350))) return;
    }

    setAsked({ prompt, file: opts.file });
    setText("");
    setFile(undefined);
    setPhase("thinking");
    pulse(1.2);
    if (!(await wait(700))) return;

    setPhase("answering");
    const words = reply.split(" ");
    for (let i = 1; i <= words.length; i++) {
      if (still) i = words.length;
      setAnswer(words.slice(0, i).join(" "));
      if (i % 4 === 0) pulse(0.25);
      if (!(await wait(45))) return;
    }
    setPhase("done");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const prompt = text.trim();
    if (!prompt) return;
    const chip = CHIPS.find((c) => c.prompt === prompt);
    play(prompt, chip?.answer ?? freeAnswer(model), { file, typed: true });
  };

  const reset = () => {
    run.current++;
    setAsked(undefined);
    setAnswer("");
    setPhase("idle");
  };

  const pdf = CHIPS[1];
  const busy = phase === "listening" || phase === "thinking" || phase === "answering";

  return (
    <div
      ref={ref}
      // The bottom margin clears the hero's strip.
      className="mx-auto mt-10 mb-[150px] w-[min(640px,calc(100vw-32px))] text-left text-white short:mt-6"
    >
      <style>{`@keyframes tt-wave{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}@keyframes tt-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

      <form
        ref={bar}
        onSubmit={submit}
        className="relative rounded-[22px] bg-white/[0.06] p-4 pb-3 shadow-[0_0_60px_-12px_rgba(34,224,161,0.55)] ring-[1.5px] ring-[#22e0a1]/80 backdrop-blur-md transition-shadow duration-500 focus-within:shadow-[0_0_80px_-8px_rgba(34,224,161,0.8)]"
      >
        {file && (
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-[12px] font-medium">
            <FileText aria-hidden className="size-3.5" strokeWidth={2} />
            {file}
          </span>
        )}
        <textarea
          value={text}
          rows={2}
          aria-label="Ask AI anything"
          placeholder={phase === "listening" ? "Listening…" : "Ask AI Anything"}
          onChange={(e) => {
            run.current++;
            if (phase === "listening") setPhase("idle");
            setText(e.target.value);
            pulse(0.3);
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter" || e.shiftKey) return;
            e.preventDefault();
            e.currentTarget.form!.requestSubmit();
          }}
          className="block w-full resize-none bg-transparent text-[17px] leading-[1.45] text-white outline-none placeholder:text-white/45 tablet:text-[20px]"
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            aria-label="Attach a PDF"
            onClick={() => play(pdf.prompt, pdf.answer, { file: pdf.file })}
            className="grid size-9 place-items-center rounded-full text-white/70 transition-colors can-hover:hover:bg-white/10 can-hover:hover:text-white"
          >
            <Paperclip aria-hidden className="size-[19px]" strokeWidth={1.8} />
          </button>
          <select
            value={model}
            aria-label="AI model"
            onChange={(e) => setModel(e.target.value)}
            className="h-8 rounded-full bg-white/10 px-3 text-[13px] font-medium text-white outline-none [&>option]:text-black"
          >
            {MODELS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <button
            type="button"
            aria-pressed={phase === "listening"}
            onClick={() => play(VOICE.prompt, VOICE.answer, { voice: true })}
            className="ml-auto flex h-9 items-center gap-2 rounded-full px-3 text-[14px] font-medium text-white/85 transition-colors can-hover:hover:bg-white/10"
          >
            <span aria-hidden className="flex h-4 items-center gap-[3px]">
              {[0.1, 0.35, 0, 0.25, 0.5].map((d, i) => (
                <span
                  key={i}
                  className={`block h-full w-[2px] origin-center rounded-full bg-current ${phase === "listening" && !still ? "animate-[tt-wave_.7s_ease-in-out_infinite]" : "scale-y-50"}`}
                  style={{ animationDelay: `${d}s` }}
                />
              ))}
            </span>
            Speak
          </button>
          <button
            type="submit"
            aria-label="Ask"
            disabled={!text.trim()}
            className="grid size-9 place-items-center rounded-full bg-[#22e0a1] text-[#03130d] transition-[opacity,transform] active:scale-95 disabled:opacity-30"
          >
            <ArrowUp aria-hidden className="size-[19px]" strokeWidth={2.4} />
          </button>
        </div>
      </form>

      {/* The chips, or in their place the question and its answer. Same
          minimum height either way, so the hero doesn't jump. */}
      <div className="mt-4 min-h-[148px]">
        {asked ? (
          <div className="rounded-[20px] bg-white/[0.06] p-4 ring-1 ring-white/12 backdrop-blur-md motion-safe:animate-[tt-in_.35s_ease-out_both]">
            <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-[#22e0a1]/15 px-3.5 py-2 text-[14px] leading-snug text-white/90 ring-1 ring-[#22e0a1]/40">
              {asked.file && <span className="mb-1 block text-[12px] text-white/60">📎 {asked.file}</span>}
              {asked.prompt}
            </p>
            <div className="mt-3 flex gap-2.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#22e0a1] text-[#03130d]">
                <Sparkles aria-hidden className={`size-4 ${busy && !still ? "animate-pulse" : ""}`} strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p role="status" className="text-[12px] font-medium text-white/50">
                  {model} · {NOTES[phase]}
                </p>
                <p className="mt-1 text-[15px] leading-[1.5] whitespace-pre-line text-white/90">{answer}</p>
              </div>
            </div>
            {phase === "done" && (
              <button type="button" onClick={reset} className="mt-3 text-[13px] font-medium text-[#22e0a1] underline underline-offset-2 can-hover:hover:no-underline">
                Ask something else
              </button>
            )}
          </div>
        ) : (
          <>
            {phase === "listening" && <p role="status" className="sr-only">Listening…</p>}
            <ul className="flex flex-wrap justify-center gap-2.5">
              {CHIPS.map(({ label, Icon, prompt, answer: reply, file: f }) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => play(prompt, reply, { file: f })}
                    className="flex h-11 items-center gap-2 rounded-xl bg-white/[0.05] px-4 text-[14px] font-medium text-white/90 ring-1 ring-white/15 backdrop-blur-md transition-[background-color,box-shadow] can-hover:hover:bg-white/10 can-hover:hover:ring-[#22e0a1]/60"
                  >
                    <Icon aria-hidden className="size-[18px]" strokeWidth={1.8} />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <Hint className="mx-auto mt-3" />
          </>
        )}
      </div>
    </div>
  );
}
