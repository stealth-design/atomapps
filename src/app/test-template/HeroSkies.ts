/*
 * Each light-hero app's own sky, for ShaderBackground's `frag`, keyed by slug.
 * All read the same uniforms: uMouse (eased cursor) leans on the scene, a
 * click (uClicks) sets off the app's own reaction, and uFlow surges after it.
 * Under reduced motion uTime and uFlow hold at 0 and clicks are ignored, so
 * each one is a still picture.
 */
/** Ruled lines on the notes sky, top to bottom of the hero; HeroNotes writes on them. */
// The notes sky's ruled lines: one every NOTE_PITCH CSS px, the first half a pitch below the hero's top.
export const NOTE_PITCH = 40;

const HEAD = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform vec4 uClicks[4];uniform float uFlow;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}
vec2 Q(){return (gl_FragCoord.xy-.5*uRes)/uRes.y;}
vec2 mq(){return (uMouse-.5)*vec2(uRes.x/uRes.y,1.);}
vec2 at(vec4 c){return (c.xy-.5*uRes)/uRes.y;}
float ageOf(vec4 c){float a=uTime-c.z;return a<0.||a>3.?-1.:a;}
float rings(vec2 q){float g=0.;for(int i=0;i<4;i++){float a=ageOf(uClicks[i]);if(a<0.)continue;
  float r=length(q-at(uClicks[i]));g+=exp(-pow((r-a*.6)*9.,2.))*exp(-a*1.3)*uClicks[i].w;}return g;}
float burst(float k){float b=0.;for(int i=0;i<4;i++){float a=ageOf(uClicks[i]);if(a>=0.)b+=exp(-a*k)*uClicks[i].w;}return b;}
`;

// A soft backdrop for the breaking alerts that pop up over it (HeroNews):
// a cool grey wash with a faint red glow drifting across the lower half,
// leaning toward the cursor. A click sends a red ring out.
const NEWS = `${HEAD}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes,q=Q(),m=mq();
  vec3 col=mix(vec3(.94,.94,.96),vec3(.97,.96,.97),uv.y);
  vec2 c=vec2(sin(uTime*.07)*.5,-.25)+m*.1;
  col=mix(col,vec3(1.,.88,.88),exp(-dot(q-c,q-c)*3.)*.35);
  col=mix(col,vec3(.88,.2,.24),rings(q)*.25);
  gl_FragColor=vec4(col,1.);
}`;

// Plain paper under the calendar hero's week view, which CalendarWeek draws
// over it (text needs a 2D canvas). Shows only before that first draws.
const CALENDAR = `${HEAD}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  gl_FragColor=vec4(mix(vec3(.97,.97,.99),vec3(.985,.985,1.),uv.y),1.);
}`;

// Ruled paper under a warm lamp that follows the cursor. The lines hold
// still, LINES to the hero's height, so HeroNotes can write its lists on
// them (it uses the same count); the red margin sits 6% in, left of them.
// No click effect (AppTemplate turns clicks off for this sky).
const NOTES = `${HEAD}
uniform float uDpr;
void main(){
  vec2 uv=gl_FragCoord.xy/uRes,q=Q(),m=mq();
  vec3 col=mix(vec3(.99,.97,.92),vec3(.98,.96,.90),uv.y);
  float pitch=${NOTE_PITCH}.*uDpr,d=abs(fract((uRes.y-gl_FragCoord.y)/pitch)-.5)*pitch;
  col=mix(col,vec3(.55,.68,.86),(1.-smoothstep(.6*uDpr,1.8*uDpr,d))*.55);
  col=mix(col,vec3(.9,.42,.42),(1.-smoothstep(.001,.003,abs(uv.x-.06)*uRes.x/uRes.y))*.5);
  col=mix(col,vec3(1.,.93,.75),exp(-dot(q-m,q-m)*10.)*.25);
  gl_FragColor=vec4(col,1.);
}`;

// Plain on purpose: a calm pale gradient whose tone drifts slowly, and a
// soft warm glow that follows the cursor. A click brightens the glow and
// sends one soft ring out.
const FLASHLIGHT = `${HEAD}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes,q=Q(),m=mq();
  vec3 col=mix(vec3(.95,.95,.94),vec3(.9,.92,.95),uv.y);
  col=mix(col,vec3(.97,.97,.98),smoothstep(.3,.8,fbm(q*.8+vec2(uTime*.015,0.)))*.5);
  float d=length(q-m),b=burst(2.5);
  col=mix(col,vec3(1.,.93,.78),clamp(exp(-d*d*(5.-b*2.))*(.6+b*.35),0.,.9));
  col=mix(col,vec3(1.,.96,.88),clamp(rings(q)*.3,0.,.3));
  // A pixel of noise, so the soft gradients don't band.
  col+=(hash(gl_FragCoord.xy)-.5)/255.;
  gl_FragColor=vec4(col,1.);
}`;

// QR modules under a sweeping scan line; the cursor is the viewfinder, which
// brings the code up inside its brackets, and a click sends a square pulse.
const QR = `${HEAD}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes,q=Q(),m=mq();
  vec3 teal=vec3(.18,.62,.58);
  float n=26.;vec2 id=floor(q*n),f=abs(fract(q*n)-.5);
  float sq=step(.55,hash(id))*step(max(f.x,f.y),.42);
  float sy=sin(uTime*.7)*.42;
  float scan=exp(-pow((q.y-sy)*18.,2.));
  vec2 dm=abs(q-m);float cheb=max(dm.x,dm.y);
  float lens=1.-smoothstep(.14,.15,cheb);
  float bracket=(1.-smoothstep(.003,.007,abs(cheb-.17)))*step(.11,min(dm.x,dm.y));
  float g=0.;
  for(int i=0;i<4;i++){float a=ageOf(uClicks[i]);if(a<0.)continue;
    vec2 dd=abs(q-at(uClicks[i]));g+=exp(-pow((max(dd.x,dd.y)-a*.5)*14.,2.))*exp(-a*1.3)*uClicks[i].w;}
  vec3 col=mix(vec3(.95,.98,.97),vec3(.97,.99,.98),uv.y);
  col=mix(col,teal,sq*clamp(.06+scan*.3+lens*.3+g*.5,0.,.7));
  col=mix(col,teal,exp(-pow((q.y-sy)*220.,2.))*.6);
  col=mix(col,teal,bracket*.8);
  gl_FragColor=vec4(col,1.);
}`;

// Golden rays from above that lean toward the cursor, with dust in the light;
// a click sends a halo out and brightens the rays.
const BIBLE = `${HEAD}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes,q=Q(),m=mq();
  vec2 s=vec2(m.x*.35,.75),v=q-s;
  float a=atan(v.x,-v.y),dist=length(v);
  float rays=noise(vec2(a*9.,uTime*.12))*.6+noise(vec2(a*23.,uTime*.2+5.))*.4;
  rays=smoothstep(.35,.9,rays)*exp(-dist*.9)*(1.-smoothstep(1.2,1.5,abs(a)))*(1.+burst(2.)*.8);
  vec2 g=q*14.+vec2(sin(uTime*.3)*.5,-uFlow*.3),id=floor(g),f=fract(g)-.5;
  float mote=step(.8,hash(id))*(1.-smoothstep(.02,.06,length(f-(vec2(hash(id+2.),hash(id+6.))-.5)*.6)));
  vec3 gold=vec3(.98,.8,.45);
  vec3 col=mix(vec3(.97,.94,.88),vec3(.99,.97,.93),uv.y);
  col=mix(col,vec3(1.,.97,.88),exp(-dist*dist*3.)*.6);
  col=mix(col,gold,clamp(rays*.45,0.,.6));
  col+=mote*(.3+rays)*vec3(.25,.18,.06);
  col=mix(col,gold,clamp(rings(q)*.5,0.,.5));
  gl_FragColor=vec4(col,1.);
}`;

// A warm wall under the alarm hero's clock, which AlarmWall draws over it
// (numerals and the reader's own time need a 2D canvas). Shows only before
// that first draws.
const ALARM = `${HEAD}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  gl_FragColor=vec4(mix(vec3(.925,.894,.847),vec3(.965,.945,.918),uv.y),1.);
}`;

// A park seen from above: pale grass, round trees and a winding sand path
// with a route line marching along it and three checkpoints, the walk the
// step counter counts. The route matches HeroSteps' PATH, where the hero's
// own walker lays its prints. It doesn't lean with the cursor, so the prints
// stay on the path; a click sends a soft ring across it.
const STEPS = `${HEAD}
float P(float x){return -.12+.09*sin(x*3.1+.6)+.04*sin(x*7.3);}
float dP(float x){return .279*cos(x*3.1+.6)+.292*cos(x*7.3);}
void main(){
  vec2 q=Q();
  vec3 col=mix(vec3(.9,.95,.86),vec3(.84,.92,.8),fbm(q*5.));
  col=mix(col,vec3(.8,.9,.76),smoothstep(.55,.8,noise(q*90.))*.25);
  float d=abs(q.y-P(q.x))/sqrt(1.+dP(q.x)*dP(q.x));
  col=mix(col,vec3(.84,.81,.7),1.-smoothstep(.038,.044,d));
  col=mix(col,vec3(.96,.93,.85),1.-smoothstep(.032,.038,d));
  vec3 blue=vec3(.33,.45,.98);
  float dash=step(.5,fract(q.x*28.-uTime*.6-uFlow*.5));
  col=mix(col,blue,(1.-smoothstep(.004,.007,d))*dash*.75);
  for(int k=0;k<3;k++){float cx=(float(k)-1.)*.62;vec2 c=vec2(cx,P(cx));float r=length(q-c);
    col=mix(col,vec3(.4,.45,.4),(1.-smoothstep(.022,.034,length(q-c+vec2(-.006,.008))))*.2);
    col=mix(col,blue,1.-smoothstep(.019,.022,r));
    col=mix(col,vec3(1.),1.-smoothstep(.008,.011,r));}
  float n=7.;vec2 g=q*n,id=floor(g);
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 c=id+vec2(i,j);
    if(hash(c)<.55)continue;
    vec2 tp=(c+.5+(vec2(hash(c+3.),hash(c+7.))-.5)*.6)/n;
    if(abs(tp.y-P(tp.x))<.09)continue;
    float tr=.022+.018*hash(c+11.);
    float sh=length(q-tp+vec2(-.012,.014));
    col=mix(col,vec3(.45,.55,.42),(1.-smoothstep(tr*.7,tr*1.15,sh))*.25);
    float r=length(q-tp);
    vec3 leaf=mix(vec3(.55,.76,.5),vec3(.72,.87,.62),1.-smoothstep(0.,tr,length(q-tp-vec2(-.3,.35)*tr)));
    col=mix(col,leaf,1.-smoothstep(tr-.003,tr+.002,r));}
  col=mix(col,vec3(1.),rings(q)*.35);
  col=mix(col,vec3(1.),.25);
  gl_FragColor=vec4(col,1.);
}`;

// Plain graph paper: the working written over it (HeroCalcCards) is the
// show. A click marks a point and sends a ring across the paper.
const CALCULATOR = `${HEAD}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes,q=Q();
  vec3 green=vec3(.37,.54,.08);
  vec3 col=mix(vec3(.97,.98,.95),vec3(.98,.99,.97),uv.y);
  vec2 g1=abs(fract(q*20.+.5)-.5)/20.,g2=abs(fract(q*4.+.5)-.5)/4.;
  col=mix(col,green,(1.-smoothstep(.0006,.0018,min(g1.x,g1.y)))*.08+(1.-smoothstep(.0008,.0025,min(g2.x,g2.y)))*.15);
  float pt=0.;
  for(int i=0;i<4;i++){float a=ageOf(uClicks[i]);if(a<0.)continue;
    pt+=(1.-smoothstep(.008,.011,length(q-at(uClicks[i]))))*exp(-a*.8);}
  col=mix(col,green,clamp(pt+rings(q)*.3,0.,.9));
  gl_FragColor=vec4(col,1.);
}`;

// An equalizer across the hero, bars mirrored about the middle; they rise
// toward the cursor and jump at each pulse (HeroVolume sends its own).
const VOLUME = `${HEAD}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes,q=Q();
  vec3 blue=vec3(.12,.36,1.);
  float n=22.,id=floor(q.x*n),fx=fract(q.x*n),cx=(id+.5)/n;
  // An equaliser playing on its own: each bar bounces to its own noise, and a
  // swell sweeps back and forth across them.
  float near=exp(-pow((cx-sin(uTime*.45)*.7)*2.5,2.));
  float hgt=.06+.18*noise(vec2(id*.6,uTime*1.6))*(.6+.4*sin(uTime*4.+id*.9))+.22*near;
  for(int i=0;i<4;i++){float a=ageOf(uClicks[i]);if(a<0.)continue;
    hgt+=.3*uClicks[i].w*exp(-a*2.)*exp(-pow((cx-at(uClicks[i]).x)*4.,2.));}
  float ay=abs(q.y+.02);
  float bar=step(.18,fx)*step(fx,.82)*step(ay,hgt)*step(.25,fract(ay*40.));
  vec3 col=mix(vec3(.95,.96,1.),vec3(.97,.98,1.),uv.y);
  col=mix(col,mix(blue,vec3(.1,.75,.95),clamp(ay/.6,0.,1.)),bar*(.18+.25*near));
  col=mix(col,blue,clamp(rings(q)*.3,0.,.3));
  gl_FragColor=vec4(col,1.);
}`;

// Hot and cold: a lost phone wanders the hero, seen as a pastel thermal
// image in soft, unbanded gradients. The closer the cursor gets, the
// hotter it glows and the brighter it pulses; a click lights it up.
const FIND = `${HEAD}
vec3 th(float t){t=clamp(t,0.,1.);
  vec3 a=vec3(.3,.35,.95),b=vec3(.75,.3,.85),c=vec3(1.,.55,.25),d=vec3(1.,.9,.4);
  vec3 r=t<.33?mix(a,b,t*3.):t<.66?mix(b,c,(t-.33)*3.):mix(c,d,(t-.66)*3.);
  return mix(r,vec3(1.),.75);}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes,q=Q(),m=mq();
  vec2 ph=vec2(sin(uTime*.13)*.6,cos(uTime*.17)*.25-.05);
  float warm=exp(-dot(m-ph,m-ph)*3.),b=burst(1.5);
  float h=exp(-dot(q-ph,q-ph)*3.5)*(.35+.5*warm+.4*b)+fbm(q*1.2+uTime*.04)*.15+.15*exp(-dot(q-m,q-m)*5.);
  vec3 col=mix(vec3(.96,.97,1.),th(h),smoothstep(0.,.5,h));
  float flash=exp(-dot(q-ph,q-ph)*60.)*(.5+.5*sin(uTime*6.))*(.15+.6*warm);
  col=mix(col,vec3(1.),clamp(flash+rings(q)*.3,0.,1.));
  gl_FragColor=vec4(col,1.);
}`;

// Rewards: coins and soft bokeh rising, parting round the cursor; a click
// sends a gold burst.
const STEPPY = `${HEAD}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes,q=Q(),m=mq(),d=q-m;
  vec2 p=q-normalize(d+1e-4)*exp(-dot(d,d)*12.)*.06;
  p.y-=uFlow*.12;
  vec2 g=p*5.,id=floor(g),f=fract(g)-.5;
  vec2 off=(vec2(hash(id+2.3),hash(id+5.1))-.5)*.5;
  float rad=.12+.12*hash(id+9.),dd=length(f-off);
  float coin=step(.55,hash(id));
  float disc=1.-smoothstep(rad-.02,rad,dd);
  float rim=1.-smoothstep(.01,.025,abs(dd-rad*.72));
  vec3 gold=vec3(.98,.76,.25),blue=vec3(.24,.39,.78);
  vec3 col=mix(vec3(.95,.96,1.),vec3(.98,.97,.95),1.-uv.y);
  col=mix(col,mix(blue,gold,coin),disc*(.16+.1*coin));
  col=mix(col,gold,rim*coin*disc*.35);
  col=mix(col,gold,clamp(rings(q)*.45,0.,.45));
  gl_FragColor=vec4(col,1.);
}`;

// A night sky to fall asleep under: violet haze low down, soft nebulae in
// the app's lavender, and four layers of twinkling stars drifting slowly,
// nearer layers shifting further with the cursor. Stars near the cursor
// bend toward it and brighten under a faint halo; a click sends a wave
// through the sky that flares each star as it passes.
const WHITE_NOISE = `${HEAD}
float stars(vec2 p,float s,float keep,float depth,vec2 m){
  vec2 g=(p-m*depth)*s,id=floor(g),f=fract(g)-.5;
  float h=hash(id);
  vec2 off=(vec2(hash(id+3.1),hash(id+7.7))-.5)*.7;
  float tw=.6+.4*sin(uTime*(1.+h*3.)+h*40.);
  return step(keep,h)*(1.-smoothstep(0.,.12,length(f-off)))*tw*(.5+.5*h);
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes,q=Q(),m=mq(),d=q-m;
  float near=exp(-dot(d,d)*10.),g=rings(q);
  vec2 p=q-d*near*.04+vec2(uTime*.004,0.);
  vec3 col=mix(vec3(.10,.07,.22),vec3(.01,.01,.04),smoothstep(0.,1.,uv.y));
  col+=vec3(.34,.29,.62)*smoothstep(.45,.85,fbm(p*1.5+vec2(uTime*.01,0.)))*.25;
  col+=vec3(.25,.15,.45)*smoothstep(.5,.9,fbm(p*3.+5.))*.15;
  float s=stars(p,18.,.86,.01,m)*1.2+stars(p,34.,.82,.025,m)+stars(p,60.,.75,.045,m)*.8+stars(p,110.,.7,.07,m)*.55;
  col+=vec3(.92,.92,1.)*s*(1.+near*1.5+g*4.);
  col+=vec3(.45,.4,.8)*near*.08+vec3(.5,.45,.9)*g*.12;
  gl_FragColor=vec4(col,1.);
}`;

export const SKIES: Record<string, string> = {
  "breaking-news": NEWS,
  calendar: CALENDAR,
  notes: NOTES,
  flashlight: FLASHLIGHT,
  "qr-scanner": QR,
  "holy-bible": BIBLE,
  "alarm-clock": ALARM,
  "step-tracker": STEPS,
  calculator: CALCULATOR,
  "volume-control": VOLUME,
  "find-my-phone": FIND,
  steppy: STEPPY,
  "white-noise": WHITE_NOISE,
};
