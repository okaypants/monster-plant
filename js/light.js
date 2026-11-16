'use strict';
/* Light: the window's sun patch, lamp glows (every lamp is a grow light) and soft room light. One list of light sources for what the player sees and what plants feel. */
/* ---------- light zones (Jackie, Nov 3) ----------
   window: a sun patch on the rug + the windowsill, then window light fading across the room. Time of day and curtains set how strong (closed = soft and dim).
   lamps: every lamp that's on is a grow light with a soft circle around its pool, so sun-lovers can grow with the curtains closed or after dark.
          Add a lamp to LAMPS and it lights plants too (key = its on/off field in the save).
   room: soft light everywhere else; never too bright.
   Too bright (shade and night plants only, and only after a while): the sun patch at midday with the curtains open, or right under a lamp.
   The coming code lighting (base room + time-of-day grade + window patch + lamp glows) should draw from lightSources(), so the glow you see is the light a plant gets. */
const WINDOW_LIGHT={x:450,y:700,reach:1000,patch:{x:470,y:852,rx:205,ry:66},sill:'sill'};
const LAMPS=[{key:'lamp',name:'floor lamp',x:240,y:700,r:230},{key:'desk',name:'desk lamp',x:1300,y:540,r:220}]; // the milk crate sits in the floor lamp's circle, the desk in the desk lamp's
const LAMP_CORE=.45; // inside this share of a lamp's circle = right under it
const NEED={sun:.55,shade:.22,night:0}; // the least light each kind is happy with
function lampOn(p){return st[p.key]!==false;}
function inSunPatch(x,y){const p=WINDOW_LIGHT.patch;return y>=FLOOR_BACK-40&&((x-p.x)/p.rx)**2+((y-p.y)/p.ry)**2<=1;}
// everything about the light at one point: total (L), its parts, which zone, and whether it's the harsh kind
function lightInfo(x,y,onSill=false,t=st.dayT,open=st.curtain==='open'){const dl=daylight(t),patch=onSill||inSunPatch(x,y),
  fade=clamp(1-Math.hypot(x-WINDOW_LIGHT.x,(y-WINDOW_LIGHT.y)*.5)/WINDOW_LIGHT.reach,0,1),
  win=dl*(open?1:.35)*(patch&&open?1:.12+.48*fade),room=.12+.14*dl;let lamp=0,under=null,core=false;
 for(const p of LAMPS){const d=Math.hypot(x-p.x,y-p.y);if(!lampOn(p)||d>=p.r)continue;const v=.2+.15*(1-d/p.r);if(v>lamp){lamp=v;under=p;core=d<p.r*LAMP_CORE;}}
 return {L:win+room+lamp,win,lamp,room,fade,patch,under,core,sun:patch&&open&&phase(t)==='midday',zone:patch?'sun patch':under?'lamp':'room'};}
function spotInfo(k,t,open){const s=k==='free'?SPOT.free:SPOT[k];return lightInfo(s.x,s.y,k===WINDOW_LIGHT.sill,t,open);}
// 'hi' only in midday sun or right under a lamp (not for sun-lovers); 'lo' when there's less than it needs
function lightFeel(i,pref){if(pref!=='sun'&&(i.sun||i.core))return 'hi';return i.L<NEED[pref]?'lo':'ok';}
// placement captions: what the spot is like in the daytime with the curtains open (lamps as they are now)
function lightFitText(i,pref){const who=pref+'-lover';
 if(i.patch)return pref==='sun'?'In the window\'s sun patch: a sun-lover\'s favorite spot.':'In the window\'s sun patch: cozy most of the day, but midday sun with the curtains open gets too much for a '+who+' after a while.';
 if(i.under)return 'Under the '+i.under.name+': cozy grow light.'+(pref!=='sun'&&i.core?' Right under it can get too warm for a '+who+' after a while.':'');
 if(pref==='sun')return i.L>=NEED.sun?'Bright window light: good for a sun-lover.':'Soft room light: a bit dim for a sun-lover. The window\'s sun patch or a lamp would help.';
 return (i.fade>.55?'Gentle window light':'Soft room light')+': just right for a '+who+'.';}
// the light sources as shapes to draw (the Light map now; the code lighting later)
function lightSources(t=st.dayT,open=st.curtain==='open'){const dl=daylight(t),p=WINDOW_LIGHT.patch;
 return [{kind:'patch',id:'window',x:p.x,y:p.y,rx:p.rx,ry:p.ry,strength:dl*(open?1:.35),harsh:open&&phase(t)==='midday'}]
  .concat(LAMPS.filter(lampOn).map(q=>({kind:'glow',id:q.key,name:q.name,x:q.x,y:q.y,r:q.r,core:q.r*LAMP_CORE,strength:.35})));}

/* ---------- things in the room are lit like the room (Jackie, Nov 16) ----------
   The monsters, the cat, Sloth's paw and what it brings, and the pumpkin or tree used to be drawn at full daylight
   all the time. Now each is tinted by the room picture where it stands: the room's colour just below its feet right
   now, against the daytime room. So they dim at golden hour and night, stay warm under a lamp, and darken a little with
   the curtains shut, always matching the art. One flat tint per sprite, changing only when the light does (RULES 1:
   light may blend). FLOOR keeps faces and colours readable at night; SOFT keeps them a touch brighter than the walls. */
const SPRITE_LIGHT={on:true,floor:.42,soft:.85};
const LM=10; // the light map samples the room every 10 pixels
let lmKey='',lmCur=null,lmRef=null;
function lmSample(src){const w=Math.ceil(W/LM),h=Math.ceil(H/LM),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
  x.imageSmoothingEnabled=true;x.drawImage(src,0,0,w,h);return x.getImageData(0,0,w,h).data;}
// called by draw() once the room (lamps, curtains) is on the canvas and before anything stands in it
function lightMapUpdate(key){if(!SPRITE_LIGHT.on)return;if(!lmRef){if(!ok(ROOMS.day))return;lmRef=lmSample(ROOMS.day);}
  if(key===lmKey&&lmCur)return;lmKey=key;try{lmCur=lmSample(cv);}catch(e){lmCur=null;}}
const LIT_FULL={f:[1,1,1],key:'1,1,1',dim:false};
// the tint for something whose feet are at x,y: the room just below and around its feet, now against daytime
function lightAt(x,y){if(!SPRITE_LIGHT.on||!lmCur||!lmRef)return LIT_FULL;const w=Math.ceil(W/LM),h=Math.ceil(H/LM);
  const x0=clamp(Math.floor((x-45)/LM),0,w-1),x1=clamp(Math.floor((x+45)/LM),0,w-1),y0=clamp(Math.floor((y-8)/LM),0,h-1),y1=clamp(Math.floor((y+30)/LM),0,h-1);
  const c=[0,0,0],r=[0,0,0];for(let j=y0;j<=y1;j++)for(let i=x0;i<=x1;i++){const k=(j*w+i)*4;for(let q=0;q<3;q++){c[q]+=lmCur[k+q];r[q]+=lmRef[k+q];}}
  const f=c.map((v,q)=>{const raw=clamp(v/Math.max(1,r[q]),0,1),soft=1-(1-raw)*SPRITE_LIGHT.soft;return Math.round(Math.max(SPRITE_LIGHT.floor,soft)*64)/64;}); // in 64 steps, so pictures are re-tinted only when the light really changes
  const dim=f.some(v=>v<1);return {f,key:f.join(','),dim,css:`rgb(${f.map(v=>Math.round(v*255)).join(',')})`};}
// a picture (image or canvas) tinted by L, kept until the light at it changes
const litCache=new WeakMap();
function litPic(im,L){if(!L||!L.dim||!im)return im;const wd=im.naturalWidth||im.width,ht=im.naturalHeight||im.height;if(!wd||!ht)return im;
  let e=litCache.get(im);if(e&&e.key===L.key)return e.c;
  const c=e?e.c:document.createElement('canvas');c.width=wd;c.height=ht;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
  x.drawImage(im,0,0);x.globalCompositeOperation='multiply';x.fillStyle=L.css;x.fillRect(0,0,wd,ht);
  x.globalCompositeOperation='destination-in';x.drawImage(im,0,0);x.globalCompositeOperation='source-over'; // only the picture's own pixels
  litCache.set(im,{key:L.key,c});return c;}
// tint what is already drawn on a sprite's own canvas (the monster's, which is redrawn every frame), keeping its outline
const litMask=document.createElement('canvas');
function litOver(x,cw,ch,L){if(!L||!L.dim)return;const m=litMask;m.width=cw;m.height=ch;const mx=m.getContext('2d');mx.drawImage(x.canvas,0,0);
  x.globalCompositeOperation='multiply';x.fillStyle=L.css;x.fillRect(0,0,cw,ch);x.globalCompositeOperation='destination-in';x.drawImage(m,0,0);x.globalCompositeOperation='source-over';}
