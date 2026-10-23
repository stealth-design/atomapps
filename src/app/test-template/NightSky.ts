/*
 * The horoscope hero's sky, for ShaderBackground's `frag`: indigo fading to
 * black, a faint milky band across it, and three layers of stars that
 * twinkle at their own rates and drift against the cursor at different
 * depths (nearer layers further). Every five seconds a shooting star
 * crosses; a click sends one from where it lands (uClicks).
 *
 * Under reduced motion uTime is held at 0: the stars hold still and no
 * shooting stars are drawn.
 */
export const NIGHT_FRAG = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform vec4 uClicks[4];uniform float uFlow;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}

float stars(vec2 q,float scale,float keep,float rate,float depth){
  vec2 g=(q-(uMouse-.5)*depth)*scale;
  vec2 id=floor(g),f=fract(g)-.5;
  float h=hash(id);
  vec2 off=(vec2(hash(id+3.1),hash(id+7.7))-.5)*.6;
  float r=length(f-off);
  float tw=.55+.45*sin(uTime*rate*(1.+h*3.)+h*50.);
  return step(keep,h)*smoothstep(.09,0.,r)*tw;
}

// A streak whose head left 'start' 'age' seconds ago, heading down-left.
float shoot(vec2 q,vec2 start,float age){
  if(age<0.||age>1.1)return 0.;
  vec2 dir=normalize(vec2(-1.,-.42));
  vec2 head=start+dir*age*1.3;
  vec2 d=q-head;
  float behind=dot(d,-dir);
  float side=length(d+dir*behind);
  float tail=step(0.,behind)*(1.-smoothstep(0.,.28,behind));
  return tail*exp(-side*side*30000.)*(1.-age/1.1);
}

void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 q=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  vec3 col=mix(vec3(.01,.01,.03),vec3(.10,.06,.24),smoothstep(1.,.0,uv.y)*.9);
  col+=vec3(.25,.12,.35)*exp(-pow(length(q-vec2(0.,-.55)),2.)*2.5)*.35;

  // The milky band, slanting across.
  float d=dot(q-(uMouse-.5)*.02,normalize(vec2(.55,-.85)));
  col+=vec3(.55,.5,.75)*exp(-d*d*9.)*fbm(q*3.+vec2(4.,1.))*.22;

  float s=stars(q,14.,.82,1.1,.015)*1.1+stars(q,28.,.86,1.7,.035)*.8+stars(q,52.,.9,2.6,.06)*.6;
  col+=vec3(.95,.93,1.)*s;

  float sh=0.;
  if(uTime>0.){
    float k=floor(uTime/5.);
    sh+=shoot(q,vec2(hash(vec2(k,1.))*1.4-.3,.25+hash(vec2(k,2.))*.25),mod(uTime,5.));
    for(int i=0;i<4;i++){
      vec2 c=(uClicks[i].xy-.5*uRes)/uRes.y;
      sh+=shoot(q,c,uTime-uClicks[i].z)*uClicks[i].w;
    }
  }
  col+=vec3(1.,.97,.9)*sh;
  gl_FragColor=vec4(col,1.);
}`;
