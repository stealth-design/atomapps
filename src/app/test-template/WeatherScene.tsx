import { Cloud, CloudDrizzle, CloudRain, CloudSun, Sun } from "lucide-react";

/*
 * The weather hero: a real map under a sky that loops through sunshine,
 * cloud, rain, a thunderstorm and snow, and a forecast widget cycling with
 * it (HeroWeather) where the other heroes have their phone.
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

/** A rainy afternoon's hours, for the news hero's weather card. */
export const HOURS = [
  { at: "Now", Icon: CloudRain, temp: 18 },
  { at: "1 PM", Icon: CloudRain, temp: 18 },
  { at: "2 PM", Icon: CloudDrizzle, temp: 19 },
  { at: "3 PM", Icon: Cloud, temp: 20 },
  { at: "4 PM", Icon: CloudSun, temp: 21 },
  { at: "5 PM", Icon: Sun, temp: 21 },
];

/**
 * The weathers the hero loops through, PERIOD ms each, in step with
 * RADAR_FRAG's (same order, same clock: the shader's uTime is the page's
 * `performance.now()`). The next one sweeps in as a front over the last 40%
 * of each turn; the card switches halfway through that.
 */
export const PERIOD = 3500;

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
 * The sky over the map, looping through the same weathers as HeroWeather,
 * PERIOD ms each, the next sweeping in from the west as a front:
 *   sunny  a sun in the top right as a camera sees it, a few wisps of cloud
 *   cloudy grey-white cloud masses, no rain
 *   rain   fbm cloud masses tinted like a radar layer (blue, then green,
 *          yellow and red where heaviest) with rain streaks under them
 *   storm  a darker sky, denser radar cloud, heavier rain, and lightning:
 *          jagged bolts with a sky flash, in 0.4s slots, so at most 2.5 a
 *          second (the 3-a-second rule)
 *   snow   pale cloud and flakes drifting down, swaying
 * Clouds drift east with the wind (uFlow).
 *
 * The pointer is wind: clouds are pushed aside round it. A click is a gust:
 * a ring runs out from it, clearing the clouds inside it, and they drift
 * back together as it fades (uFlow surges with it, so the drift speeds up).
 *
 * Round the edges, white cloud banks frame the map: billowing (fbm on the same
 * displaced coordinates, so the wind and gusts move them too) and fading out
 * a quarter of the way in.
 *
 * Under reduced motion uTime is held at 0: the sky stays sunny and still.
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
// This weather's share of the sky here, now: 0 sunny, 1 cloudy, 2 rain, 3
// storm, 4 snow. The next one comes in as a front sweeping west to east over
// the last 40% of each turn, so rain (say) rolls in across the map.
float W(float k){
  float t=uTime/${(PERIOD / 1000).toFixed(1)},i=mod(floor(t),5.),n=mod(i+1.,5.);
  float s=clamp((fract(t)-.6)/.4,0.,1.)*1.5-.25;
  float b=1.-smoothstep(s-.25,s+.25,gl_FragCoord.x/uRes.x);
  return (abs(i-k)<.5?1.-b:0.)+(abs(n-k)<.5?b:0.);
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

  float sun=W(0.),cloudy=W(1.),rainy=W(2.),storm=W(3.),snow=W(4.);
  float moving=step(.001,uTime);
  float dens=clamp(clouds(p)*clear*(sun*.35+cloudy*1.15+rainy+storm*1.35+snow*.9),0.,1.);
  float a=smoothstep(.0,.3,dens)*.62;
  vec3 grey=mix(vec3(.98,.98,1.),vec3(.7,.73,.8),dens);
  vec3 col=mix(grey,radar(dens),rainy+storm)*a;
  float alpha=a;
  col+=vec3(.12,.14,.22)*.3*storm;
  alpha+=.3*storm;

  // Sun, as a camera sees it: a white-hot disc, a warm glow and a wide
  // corona, uneven shafts of light that shimmer slowly (noise on the
  // direction, so there's no seam), faint lens-flare ghosts on the line
  // through the frame's centre, and a warm haze. Cloud passing in front dims it.
  vec2 S=vec2(.36*uRes.x/uRes.y,.3);
  vec2 sp=q-S;
  float sl=length(sp);
  vec2 dir=sp/(sl+1e-4);
  float shafts=noise(dir*4.+vec2(uTime*.05,0.))*.65+noise(dir*11.-vec2(0.,uTime*.08))*.35;
  shafts=pow(shafts,2.)*exp(-sl*2.6)*smoothstep(.04,.16,sl)*.9;
  float veil=1.-a*.85;
  vec3 sunc=vec3(1.,.97,.88)*(1.-smoothstep(.016,.032,sl))
    +vec3(1.,.84,.45)*exp(-sl*14.)*.85
    +vec3(1.,.68,.28)*exp(-sl*5.)*.42
    +vec3(1.,.8,.5)*(exp(-sl*1.7)*.16+shafts);
  float flare=0.;
  for(int k=0;k<3;k++){
    float fk=float(k),f=fk<.5?.35:fk<1.5?-.3:-.75,rad=.025+fk*.022;
    float g=length(q-S*f);
    flare+=(1.-smoothstep(rad*.6,rad,g))*.05+exp(-pow((g-rad)*60.,2.))*.06;
  }
  vec3 sunCol=(sunc+vec3(.75,.9,1.)*flare+vec3(1.,.9,.7)*.05)*sun*veil;
  float sunA=max(max(sunCol.r,sunCol.g),sunCol.b);
  col+=sunCol;
  alpha+=sunA;

  // Rain streaks, heavier in a storm.
  float lane=floor(q.x*150.+q.y*18.);
  float h=hash(vec2(lane,7.));
  float y=fract(q.y*2.5+uTime*(1.4+h)*(1.+storm*.6)+h*13.);
  float streak=smoothstep(0.,.04,y)*(1.-smoothstep(.04,.16,y))*step(.4-storm*.15,h);
  // Across the whole sky, a little heavier under cloud, so it always reads as rain.
  float rain=streak*(.6+.4*smoothstep(.3,.8,clouds(p+vec2(0.,.08))))*clear*.75*moving*min(1.,rainy+storm*1.3);
  col+=vec3(.28,.42,.78)*rain;
  alpha=max(alpha,rain);

  // Lightning, in 0.4s slots (at most 2.5 strikes a second): most storm slots
  // strike, a jagged bolt down from the top somewhere across the map, and the
  // sky flashing with it, brightest under the cloud.
  float slot=floor(uTime*2.5);
  float fl=step(.4,hash(vec2(slot,3.)))*exp(-fract(uTime*2.5)*7.)*storm*moving;
  float bx=(hash(vec2(slot,8.))-.5)*.8*uRes.x/uRes.y;
  float bot=-.05-hash(vec2(slot,11.))*.3;
  float jag=(noise(vec2(q.y*12.,slot))-.5)*.14+(noise(vec2(q.y*45.,slot+4.))-.5)*.04;
  float dx=abs(q.x-bx-jag);
  float bolt=(exp(-dx*700.)+exp(-dx*60.)*.3)*smoothstep(bot,bot+.08,q.y)*fl*1.6;
  float flash=fl*(.3+dens*.5)+bolt;
  col+=vec3(.92,.94,1.)*flash;
  alpha+=flash;

  // Snow: two layers of flakes falling and swaying.
  float flakes=0.;
  for(int l=0;l<2;l++){
    float fl=float(l),sc=11.+fl*8.;
    vec2 g=q*sc+vec2(sin(uTime*.6+q.y*3.+fl)*.6,uTime*(1.2+fl*.6));
    vec2 id=floor(g),f=fract(g)-.5;
    vec2 o=(vec2(hash(id+fl),hash(id+fl+5.))-.5)*.6;
    flakes+=(1.-smoothstep(.07,.12+fl*.02,length(f-o)))*step(.3,hash(id+9.+fl))*(.95-fl*.3);
  }
  flakes*=snow*moving;
  col=col*(1.-flakes)+vec3(flakes);
  alpha=alpha*(1.-flakes)+flakes;
  col+=vec3(.85,.9,1.)*.07*snow;
  alpha+=.07*snow;

  col=min(col,vec3(1.));alpha=min(alpha,1.);
  vec2 uv=gl_FragCoord.xy/uRes;
  float edge=min(min(uv.x,1.-uv.x)*uRes.x/uRes.y,min(uv.y,1.-uv.y));
  float puff=fbm(p*2.6+vec2(uTime*.015,0.))+fbm(p*6.+vec2(0.,uTime*.01))*.35;
  float bank=1.-smoothstep(.02,.3,edge-(puff-.65)*.3);
  gl_FragColor=vec4(col*(1.-bank)+vec3(bank),alpha*(1.-bank)+bank);
}`;
