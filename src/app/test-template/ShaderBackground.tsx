"use client";

import { useEffect, useRef } from "react";

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

/*
 * Sky + clouds on top, cream at the bottom, and between them a rainbow band
 * that bends upward toward the edges and widens as it goes, like a horizon
 * seen through a fisheye. Streaks inside the band flow outward (log(|x|) - t),
 * which reads as warp speed. uMouse shifts the vanishing point.
 *
 * Clicks: each of the last four (uClicks: pixel x, y, time, strength) sends a
 * ring out from the click that pushes the band outward and leaves a faint
 * shimmer, and uFlow (the streaks' scroll, integrated in JS) surges then eases
 * back — all scaled by the strength.
 */
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform vec4 uClicks[4];uniform float uFlow;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}
// The AtomApps logo's rings: orange, teal and blue, a fifth lifted toward white so the band stays soft.
vec3 ramp(float t){
  vec3 orange=vec3(.95,.42,.11),amber=vec3(.97,.58,.12),teal=vec3(.12,.77,.75),blue=vec3(.17,.44,.77),deep=vec3(.04,.24,.57);
  t=clamp(t*.5+.5,0.,1.);
  vec3 c;
  if(t>.75)c=mix(blue,deep,(t-.75)*4.);
  else if(t>.5)c=mix(teal,blue,(t-.5)*4.);
  else if(t>.25)c=mix(amber,teal,(t-.25)*4.);
  else c=mix(orange,amber,t*4.);
  return mix(c,vec3(1.),.2);
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 q=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  vec2 p=q-(uMouse-.5)*vec2(.12,.08);

  float glow=0.;
  for(int i=0;i<4;i++){
    float age=uTime-uClicks[i].z;
    if(age<0.||age>3.)continue;
    vec2 d=q-(uClicks[i].xy-.5*uRes)/uRes.y;
    float r=length(d);
    float ring=exp(-pow((r-age*.6)*9.,2.))*exp(-age*1.3)*uClicks[i].w;
    p+=d/(r+1e-4)*ring*.05;
    glow+=ring;
  }

  vec3 col=mix(vec3(.97,.96,.93),vec3(.85,.91,.97),smoothstep(.3,1.,uv.y));
  float cl=fbm(p*vec2(1.6,3.)+vec2(uTime*.012,0.));
  col=mix(col,vec3(1.),smoothstep(.45,.8,cl)*smoothstep(.45,.95,uv.y)*.85);

  float ax=abs(p.x);
  float t=(p.y-.03-.42*ax*ax)/(.05+.30*ax);
  float flow=log(ax+.04)*3.-uFlow;
  float s=fbm(vec2(flow,t*9.))*.7+fbm(vec2(flow*2.,t*22.))*.5;
  vec3 band=ramp(t+(s-.6)*.5);
  float mask=exp(-t*t*1.6)*(.15+.85*smoothstep(.0,.65,ax))*(.55+.7*s);
  col=mix(col,band,clamp(mask,0.,.9));

  col=mix(col,vec3(.97,.96,.93),smoothstep(.1,-.45,p.y)*smoothstep(.9,.0,ax)*.9);
  col+=glow*vec3(.22,.2,.28);
  gl_FragColor=vec4(col,1.);
}`;

/** Dispatch on `window` to send a ring from client point x, y; strength 1 is a click's. */
export const PULSE_EVENT = "hero-pulse";
export type Pulse = { x: number; y: number; strength: number };

/**
 * `clicks={false}` leaves the rings to PULSE_EVENT alone. `frag` swaps the
 * sky for another fragment shader with the same uniforms (uRes, uTime,
 * uMouse — eased, 0–1 across the canvas, y up — uClicks and uFlow); its
 * output is drawn over the page, premultiplied, so it can be see-through.
 */
export function ShaderBackground({ className = "", clicks: onClick = true, frag = FRAG }: { className?: string; clicks?: boolean; frag?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl", { antialias: false });
    if (!gl) return; // no WebGL: the page's CSS background stays visible

    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uClicks = gl.getUniformLocation(prog, "uClicks");
    const uFlow = gl.getUniformLocation(prog, "uFlow");

    const target = { x: 0.5, y: 0.5 };
    const mouse = { x: 0.5, y: 0.5 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1 - (e.clientY - r.top) / r.height;
    };
    addEventListener("pointermove", onMove);

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 1.5); // ponytail: capped for fill-rate; it's a soft blur anyway
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    addEventListener("resize", resize);

    // Skip drawing while scrolled out of view.
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Ring buffer of the last four clicks as [x, y, seconds, strength], in
    // canvas pixels with y up. The canvas sits under the hero's copy and phone,
    // so clicks are caught on the window and kept when they land inside its box.
    const clicks = new Float32Array(16).fill(-100);
    let next = 0;
    let now = 0;
    let flow = 0;
    let boost = 0;
    const pulse = ({ x, y, strength }: Pulse) => {
      const r = canvas.getBoundingClientRect();
      if (still || !strength || x < r.left || x > r.right || y < r.top || y > r.bottom) return;
      clicks.set([((x - r.left) / r.width) * canvas.width, (1 - (y - r.top) / r.height) * canvas.height, now, strength], next * 4);
      next = (next + 1) % 4;
      boost = 2.5 * strength;
    };
    const onDown = (e: PointerEvent) => onClick && pulse({ x: e.clientX, y: e.clientY, strength: 1 });
    const onPulse = (e: Event) => pulse((e as CustomEvent<Pulse>).detail);
    addEventListener("pointerdown", onDown);
    addEventListener(PULSE_EVENT, onPulse);

    let raf = 0;
    let last = 0;
    const draw = (ms: number) => {
      const dt = Math.min((ms - last) / 1000, 0.1);
      last = ms;
      now = ms / 1000;
      flow += still ? 0 : dt * (0.25 + boost);
      boost *= 0.95;
      gl.uniform4fv(uClicks, clicks);
      gl.uniform1f(uFlow, flow);
      mouse.x += (target.x - mouse.x) * 0.05;
      mouse.y += (target.y - mouse.y) * 0.05;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, still ? 0 : ms / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      if (visible) gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener(PULSE_EVENT, onPulse);
      removeEventListener("resize", resize);
    };
  }, [onClick, frag]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
