import { Cloud, CloudDrizzle, CloudRain, CloudSun, MapPin, Sun, Umbrella } from "lucide-react";

/*
 * The weather hero: a real map under a radar of rain clouds, and a forecast
 * widget where the other heroes have their phone.
 */

// The Great Lakes at zoom 6, 8×5 tiles round tile (17, 23). Plenty of
// coastline, so it reads as a map at a glance.
const Z = 6;
const COLS = [13, 14, 15, 16, 17, 18, 19, 20];
const ROWS = [21, 22, 23, 24, 25];
// ponytail: Esri's keyless World Street Map tiles. Fine for a preview; for
// production, pick a provider and plan (Esri, CARTO and Stadia all now want
// an account or key) and swap this URL and MAP_CREDIT.
const tile = (x: number, y: number) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${Z}/${y}/${x}`;

/**
 * Colour map tiles, centred, covering the hero edge to edge: the grid is
 * never smaller than its 2048×1280 at 256px a tile, and grows (in container
 * units, 8:5) to cover a bigger hero. A light wash at the top keeps the
 * headline readable. Tiles that fail to load leave the map tint showing.
 * Fills its parent.
 */
export function WeatherMap({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`overflow-hidden bg-[#f2efe9] [container-type:size] ${className}`}>
      <div className="absolute top-1/2 left-1/2 grid w-[max(100cqw,160cqh,2048px)] -translate-1/2 grid-cols-8">
        {ROWS.flatMap((y) => COLS.map((x) => <div key={`${x}-${y}`} className="aspect-square bg-cover" style={{ backgroundImage: `url(${tile(x, y)})` }} />))}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_18%,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.4)_55%,transparent_100%)]" />
    </div>
  );
}

export const HOURS = [
  { at: "Now", Icon: CloudRain, temp: 18 },
  { at: "1 PM", Icon: CloudRain, temp: 18 },
  { at: "2 PM", Icon: CloudDrizzle, temp: 19 },
  { at: "3 PM", Icon: Cloud, temp: 20 },
  { at: "4 PM", Icon: CloudSun, temp: 21 },
  { at: "5 PM", Icon: Sun, temp: 21 },
];

/** The app's home-screen weather widget: the town under the map's centre, now, and the next few hours. */
export function HeroWeather() {
  return (
    <div className="mx-auto mt-10 w-[min(440px,calc(100vw-32px))] roomy:w-[500px] rounded-[32px] bg-white/80 p-5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)] ring-1 ring-black/5 backdrop-blur-xl tablet:p-6 short:mt-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-[15px] font-semibold">
            <MapPin aria-hidden className="size-4" strokeWidth={2} />
            Detroit
          </p>
          <p className="mt-1 text-[64px] leading-none font-light tracking-tight tabular-nums">18°</p>
        </div>
        <div className="text-right">
          <CloudRain aria-hidden className="ml-auto size-12 text-[var(--accent)]" strokeWidth={1.6} />
          <p className="mt-2 text-[15px] font-semibold">Light rain</p>
          <p className="text-[13px] text-black/50 tabular-nums">H 21° · L 12°</p>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 rounded-full bg-[var(--accent)]/10 px-3 py-1.5 text-[13px] font-medium text-[var(--accent)]">
        <Umbrella aria-hidden className="size-4" strokeWidth={2} />
        Rain easing off by 3 PM
        <span className="ml-auto size-2 animate-pulse rounded-full bg-[var(--accent)] motion-reduce:animate-none" />
      </p>
      <ul className="mt-4 grid grid-cols-6 gap-1 border-t border-black/5 pt-4 text-center">
        {HOURS.map(({ at, Icon, temp }) => (
          <li key={at} className="flex flex-col items-center gap-1.5">
            <span className="text-[12px] text-black/50">{at}</span>
            <Icon aria-hidden className="size-5 text-[#1d1d1f]" strokeWidth={1.8} />
            <span className="text-[14px] font-semibold tabular-nums">{temp}°</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const MAP_CREDIT = (
  <>
    Tiles ©{" "}
    <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer" className="underline-offset-2 can-hover:hover:underline">
      Esri
    </a>{" "}
    · Esri, HERE, Garmin, ©{" "}
    <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline-offset-2 can-hover:hover:underline">
      OpenStreetMap
    </a>{" "}
    contributors
  </>
);

/*
 * Rain clouds for ShaderBackground's `frag`, over the map: fbm cloud masses
 * drifting east with the wind (uFlow), tinted like a radar layer — blue, then
 * green, yellow and red where they are heaviest — with rain streaks falling
 * under the densest parts.
 *
 * The pointer is wind: clouds are pushed aside round it. A click is a gust:
 * a ring runs out from it, clearing the clouds inside it, and they drift
 * back together as it fades (uFlow surges with it, so the drift speeds up).
 *
 * Round the edges, white cloud banks frame the map: billowing (fbm on the same
 * displaced coordinates, so the wind and gusts move them too) and fading out
 * a quarter of the way in.
 *
 * Under reduced motion uTime is held at 0: the clouds hold still and the rain
 * isn't drawn.
 */
export const RADAR_FRAG = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform vec4 uClicks[4];uniform float uFlow;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}
vec3 radar(float d){
  vec3 c=mix(vec3(.30,.55,1.),vec3(.25,.80,.45),smoothstep(.45,.62,d));
  c=mix(c,vec3(1.,.82,.20),smoothstep(.62,.76,d));
  return mix(c,vec3(.95,.30,.25),smoothstep(.80,.92,d));
}
float clouds(vec2 p){
  p.x-=uFlow*.06;
  return smoothstep(.42,.9,fbm(p*1.4+vec2(0.,uTime*.01))*.65+fbm(p*3.3+vec2(4.,1.))*.35);
}
void main(){
  vec2 q=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  vec2 m=(uMouse-.5)*uRes/uRes.y;
  vec2 d=q-m;float r=length(d);
  vec2 p=q-d/(r+1e-3)*.08*exp(-r*r*20.);
  float clear=.3+.7*smoothstep(.03,.22,r);

  for(int i=0;i<4;i++){
    float age=uTime-uClicks[i].z;
    if(age<0.||age>4.)continue;
    vec2 c=q-(uClicks[i].xy-.5*uRes)/uRes.y;
    float rc=length(c),front=age*.7,w=uClicks[i].w*exp(-age*.9);
    p-=c/(rc+1e-3)*exp(-pow((rc-front)*6.,2.))*.12*w;
    clear*=1.-.8*w*(1.-smoothstep(front-.15,front+.05,rc));
  }

  float dens=clouds(p)*clear;
  float a=smoothstep(.0,.3,dens)*.62;
  vec3 col=radar(dens)*a;

  float lane=floor(q.x*110.+q.y*18.);
  float h=hash(vec2(lane,7.));
  float y=fract(q.y*2.5+uTime*(1.4+h)+h*13.);
  float streak=smoothstep(0.,.04,y)*(1.-smoothstep(.04,.16,y))*step(.55,h);
  float rain=streak*smoothstep(.5,.8,clouds(p+vec2(0.,.08))*clear)*.45*step(.001,uTime);
  col+=vec3(.55,.7,1.)*rain;
  float alpha=max(a,rain);

  vec2 uv=gl_FragCoord.xy/uRes;
  float edge=min(min(uv.x,1.-uv.x)*uRes.x/uRes.y,min(uv.y,1.-uv.y));
  float puff=fbm(p*2.6+vec2(uTime*.015,0.))+fbm(p*6.+vec2(0.,uTime*.01))*.35;
  float bank=1.-smoothstep(.02,.3,edge-(puff-.65)*.3);
  gl_FragColor=vec4(col*(1.-bank)+vec3(bank),alpha*(1.-bank)+bank);
}`;
