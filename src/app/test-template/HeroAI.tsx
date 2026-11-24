"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Calculator, FileText, Languages, Mic, Paperclip, PenLine, Sparkles } from "lucide-react";
import { useReducedMotion } from "./useReducedMotion";

/*
 * The AI chat hero's sky, for ShaderBackground's `frag`, after the app's own
 * posters: near black, mint green welling up from the top left and deep blue
 * from the bottom right, both made of slow domain-warped noise, and a thin
 * aurora ribbon drifting across behind the prompt bar.
 *
 * It plays on its own; the prompt bar no longer sends ripples into it (the
 * shader's uClicks rings stay for any future use, but nothing triggers them).
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

// The loop's turns, fixed text: nothing is sent anywhere. The homework and
// voice ones are the app's own poster examples; the voice one plays as a call.
type Turn = { label: string; Icon: typeof PenLine; prompt: string; answer: string; file?: string; voice?: boolean };
const CHIPS: Turn[] = [
  { label: "AI Writing", Icon: PenLine, prompt: "Write a short email asking to move Friday's meeting to Monday", answer: "Hi Sam, would it be possible to move Friday's meeting to Monday morning? Something has come up on my side. Happy to fit around your calendar. Thanks, Alex" },
  { label: "Voice Chat", Icon: Mic, voice: true, prompt: "Give me a step by step plan to get rich.", answer: "1. Spend less than you earn.\n2. Invest the difference every month.\n3. Learn a skill people will pay for.\n4. Be patient: time does most of the work." },
  { label: "PDF Summary", Icon: FileText, file: "Q3-report.pdf", prompt: "Summarise this report in three points", answer: "1. Revenue grew 18%, led by subscriptions.\n2. Costs held flat after the switch to a new supplier.\n3. The team recommends putting Q4's budget into mobile." },
  { label: "AI Homework", Icon: Calculator, prompt: "Solve 27 − 4(2×5)", answer: "Brackets first: 2×5 = 10.\nThen multiply by 4: 4×10 = 40.\nThen subtract from 27: 27 − 40 = −13.\nAnswer: −13" },
  { label: "Translate", Icon: Languages, prompt: "How do I say “Where is the train station?” in Spanish?", answer: "¿Dónde está la estación de tren?" },
];

type Phase = "idle" | "typing" | "listening" | "thinking" | "answering" | "done";
const NOTES: Record<Phase, string> = { idle: "", typing: "", listening: "Listening…", thinking: "Thinking…", answering: "Writing…", done: "Answer ready" };

const WAVE = [0.1, 0.35, 0, 0.25, 0.5];
const KEYFRAMES =
  "@keyframes tt-wave{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}" +
  "@keyframes tt-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}" +
  "@keyframes tt-ring{from{transform:scale(1);opacity:.55}to{transform:scale(1.9);opacity:0}}" +
  "@keyframes tt-breathe{50%{transform:scale(1.06)}}" +
  "@keyframes tt-caret{50%{opacity:0}}";

/** A few bars that bounce while `on`, flat otherwise. */
function Wave({ on, className = "h-4" }: { on: boolean; className?: string }) {
  return (
    <span aria-hidden className={`flex items-center gap-[3px] ${className}`}>
      {WAVE.map((d, i) => (
        <span
          key={i}
          className={`block h-full w-[2px] origin-center rounded-full bg-current ${on ? "motion-safe:animate-[tt-wave_.7s_ease-in-out_infinite]" : "scale-y-50"}`}
          style={{ animationDelay: `${d}s` }}
        />
      ))}
    </span>
  );
}

/**
 * The app's voice-call screen: a status pill, a big mint "TALKING" orb with
 * rings going out from it while the AI speaks, a small bubble beside it whose
 * waveform moves while the reader does, the reply as a caption, and End Call.
 */
function VoiceCall({ phase, answer }: { phase: Phase; answer: string }) {
  const listening = phase === "listening";
  const talking = phase === "answering";
  return (
    <div className="mx-auto flex w-full max-w-[440px] flex-col items-center rounded-[28px] bg-white/[0.05] px-5 pt-5 pb-5 ring-1 ring-white/12 backdrop-blur-md motion-safe:animate-[tt-in_.35s_ease-out_both]">
      <p className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[12px] font-medium text-white/80">
        <span className="size-1.5 rounded-full bg-[#22e0a1] motion-safe:animate-pulse" />
        {listening ? "Listening…" : phase === "thinking" ? "Thinking…" : talking ? "Speaking…" : "On call"}
      </p>
      <div className="relative mt-6 flex items-center">
        <div className="relative grid size-[112px] place-items-center tablet:size-[128px]">
          {/* The halo, and while it talks, rings going out. */}
          <span className="absolute -inset-4 rounded-full bg-[radial-gradient(circle,rgba(34,224,161,0.28),transparent_70%)]" />
          {talking &&
            [0, 0.8, 1.6].map((d) => (
              <span key={d} className="absolute inset-0 rounded-full ring-2 ring-[#22e0a1]/60 motion-safe:animate-[tt-ring_2.4s_ease-out_infinite]" style={{ animationDelay: `${d}s` }} />
            ))}
          <span
            className={`relative grid size-full place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#5df5c2,#13b17a)] text-[14px] font-bold tracking-[0.12em] text-[#03130d] shadow-[0_0_60px_-6px_rgba(34,224,161,0.85)] tablet:text-[15px] ${talking ? "motion-safe:animate-[tt-breathe_1.2s_ease-in-out_infinite]" : ""}`}
          >
            {listening ? "LISTENING" : "TALKING"}
          </span>
        </div>
        {/* The neck to the reader's bubble. */}
        <span className="-ml-2 h-5 w-9 bg-[#22e0a1]/25 [clip-path:polygon(0_0,100%_30%,100%_70%,0_100%)]" />
        <span className={`grid size-[52px] place-items-center rounded-full ring-1 transition-colors ${listening ? "bg-[#22e0a1]/30 text-white ring-[#22e0a1]/70" : "bg-white/10 text-white/50 ring-white/15"}`}>
          <Wave on={listening} className="h-5" />
        </span>
      </div>
      <p role="status" className="mt-5 min-h-[40px] text-center text-[13px] leading-[1.5] whitespace-pre-line text-white/80">
        {answer}
      </p>
      <span className={`mt-3 rounded-lg px-7 py-2 text-[13px] font-medium ring-1 transition-colors ${phase === "done" ? "bg-[#ff5a5a]/20 text-[#ff8080] ring-[#ff5a5a]/70" : "text-[#ff8080]/80 ring-[#ff5a5a]/40"}`}>
        End Call
      </span>
    </div>
  );
}

/**
 * The AI chat hero: the app's "Ask AI Anything" box, playing itself on a
 * loop. Each turn lights a feature chip, writes its prompt into the bar (the
 * voice turn speaks it, on the call screen), sends it, and streams a fixed
 * answer in where the chips were; then the next. Nothing on it takes input.
 * Typing and streaming send rings out from the bar into the shader sky
 * (PULSE_EVENT). Under reduced motion it's the first turn, answered and
 * still. The hero stays dark (`data-dark`).
 */
export function HeroAI() {
  const still = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState({ k: 0, text: "", asked: false, answer: "", phase: "idle" as Phase, sent: false });
  // Under reduced motion: the first turn, answered.
  const { k, text, asked, answer, phase, sent } = still ? { k: 0, text: "", asked: true, answer: CHIPS[0].answer, phase: "done" as Phase, sent: false } : play;
  const turn = CHIPS[k];

  useEffect(() => {
    const hero = ref.current!.closest("section")!;
    hero.dataset.dark = "true";
    return () => void delete hero.dataset.dark;
  }, []);

  useEffect(() => {
    if (still) return;
    let live = true;
    const set = (next: Partial<typeof play>) => setPlay((p) => ({ ...p, ...next }));
    const wait = (ms: number) => new Promise<boolean>((r) => setTimeout(() => r(live), ms));
    (async () => {
      for (let i = 0; ; i = (i + 1) % CHIPS.length) {
        const { prompt, answer: reply, voice } = CHIPS[i];
        set({ k: i, asked: false, answer: "", text: "", phase: "idle" });
        if (!(await wait(900))) return; // the chip lights up first

        set({ phase: voice ? "listening" : "typing" });
        for (let c = 1; c <= prompt.length; c++) {
          set({ text: prompt.slice(0, c) });
          if (!(await wait(voice ? 50 : 32))) return;
        }
        if (!(await wait(400))) return;
        set({ sent: true });
        if (!(await wait(180))) return;
        set({ sent: false });

        set({ asked: true, text: "", phase: "thinking" });
        if (!(await wait(800))) return;

        set({ phase: "answering" });
        const words = reply.split(" ");
        for (let w = 1; w <= words.length; w++) {
          set({ answer: words.slice(0, w).join(" ") });
          if (!(await wait(voice ? 110 : 55))) return;
        }
        set({ phase: "done" });
        if (!(await wait(2800))) return;
      }
    })();
    return () => void (live = false);
  }, [still]);

  const model = MODELS[k % MODELS.length];
  const call = turn.voice && phase !== "idle";

  return (
    <div
      ref={ref}
      // The bottom margin clears the hero's strip.
      className="mx-auto mt-10 mb-[150px] w-[min(640px,calc(100vw-32px))] text-left text-white select-none short:mt-6"
    >
      <style>{KEYFRAMES}</style>

      {/* The prompt bar, as a picture of one: it fills itself in. */}
      <div
        ref={bar}
        aria-hidden
        className={`relative rounded-[22px] bg-white/[0.06] p-4 pb-3 ring-[1.5px] ring-[#22e0a1]/80 backdrop-blur-md transition-shadow duration-500 ${phase === "typing" || phase === "listening" ? "shadow-[0_0_80px_-8px_rgba(34,224,161,0.8)]" : "shadow-[0_0_60px_-12px_rgba(34,224,161,0.55)]"}`}
      >
        {turn.file && !asked && phase !== "idle" && (
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-[12px] font-medium motion-safe:animate-[tt-in_.3s_ease-out_both]">
            <FileText aria-hidden className="size-3.5" strokeWidth={2} />
            {turn.file}
          </span>
        )}
        <p className="min-h-[2.9em] text-[17px] leading-[1.45] tablet:text-[20px]">
          {text ? (
            <>
              {text}
              <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] bg-[#22e0a1] motion-safe:animate-[tt-caret_1s_steps(1)_infinite]" />
            </>
          ) : (
            <span className="text-white/45">{phase === "listening" ? "Listening…" : "Ask AI Anything"}</span>
          )}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className={`grid size-9 place-items-center rounded-full ${turn.file && phase !== "idle" ? "bg-white/10 text-white" : "text-white/70"}`}>
            <Paperclip className="size-[19px]" strokeWidth={1.8} />
          </span>
          <span key={model} className="flex h-8 items-center rounded-full bg-white/10 px-3 text-[13px] font-medium motion-safe:animate-[tt-in_.3s_ease-out_both]">
            {model}
          </span>
          <span className={`ml-auto flex h-9 items-center gap-2 rounded-full px-3 text-[14px] font-medium ${phase === "listening" ? "bg-[#22e0a1]/15 text-[#22e0a1]" : "text-white/85"}`}>
            <Wave on={phase === "listening"} />
            Speak
          </span>
          <span
            className={`grid size-9 place-items-center rounded-full bg-[#22e0a1] text-[#03130d] transition-[opacity,transform] duration-150 ${text ? "opacity-100" : "opacity-30"} ${sent ? "scale-90" : ""}`}
          >
            <ArrowUp className="size-[19px]" strokeWidth={2.4} />
          </span>
        </div>
      </div>

      {/* The chips, or in their place the answer, or the call screen. Same
          minimum height throughout, so the hero doesn't jump. */}
      <div className="mt-4 min-h-[300px]">
        {call ? (
          <VoiceCall phase={phase} answer={answer} />
        ) : asked ? (
          <div className="rounded-[20px] bg-white/[0.06] p-4 ring-1 ring-white/12 backdrop-blur-md motion-safe:animate-[tt-in_.35s_ease-out_both]">
            <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-[#22e0a1]/15 px-3.5 py-2 text-[14px] leading-snug text-white/90 ring-1 ring-[#22e0a1]/40">
              {turn.file && <span className="mb-1 block text-[12px] text-white/60">📎 {turn.file}</span>}
              {turn.prompt}
            </p>
            <div className="mt-3 flex gap-2.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#22e0a1] text-[#03130d]">
                <Sparkles aria-hidden className={`size-4 ${phase !== "done" ? "motion-safe:animate-pulse" : ""}`} strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-white/50">
                  {model} · {NOTES[phase]}
                </p>
                <p role="status" className="mt-1 text-[15px] leading-[1.5] whitespace-pre-line text-white/90">
                  {answer}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ul aria-label="What it can do" className="flex flex-wrap justify-center gap-2.5">
            {CHIPS.map(({ label, Icon }, i) => (
              <li
                key={label}
                className={`flex h-11 items-center gap-2 rounded-xl px-4 text-[14px] font-medium ring-1 backdrop-blur-md transition-[background-color,box-shadow,color] duration-300 ${i === k ? "bg-[#22e0a1]/15 text-white ring-[#22e0a1]/80 shadow-[0_0_24px_-6px_rgba(34,224,161,0.7)]" : "bg-white/[0.05] text-white/70 ring-white/15"}`}
              >
                <Icon aria-hidden className="size-[18px]" strokeWidth={1.8} />
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
