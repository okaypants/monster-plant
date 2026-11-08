'use strict';
/* Fidgets: springy room props, snow globe, vines, book spines, bouncing treats, plant boing. */
/* ---------- FIDGETS (Jackie: squishy, bouncy, endlessly repeatable; visual only, sound slots for Garry later) ---------- */
// Springy props cut from the current room picture. Fixed 60fps physics; drawn on whole pixels (DS rule).
const FP=[
 {n:'ammonite',x:1062,y:138,w:76,h:80,k:.18,d:.12,kick:{vy:-4},puff:true},
 {n:'snail',x:52,y:345,w:86,h:92,k:.10,d:.10,hop:true},
 {n:'pillow',x:565,y:512,w:162,h:136,k:.14,d:.16,kick:{vy:5}},
 {n:'drum',x:1252,y:152,w:182,h:72,k:.25,d:.18,kick:{vy:3}},
 {n:'armillary',x:1288,y:248,w:110,h:110,k:.16,d:.06,kick:{vx:5}},
 {n:'butterflies',x:922,y:128,w:116,h:150,k:.12,d:.08,kick:{vx:4}},
 {n:'catpic',x:738,y:348,w:154,h:120,k:.15,d:.12,kick:{vx:3}},
 {n:'flowerpic',x:668,y:122,w:240,h:212,k:.12,d:.1,kick:{vx:3}},
 {n:'moonpanel',x:922,y:290,w:116,h:180,k:.13,d:.1,kick:{vx:3}},
 {n:'radio',x:1078,y:468,w:106,h:60,k:.22,d:.14,kick:{vy:-3}},
 {n:'glass',x:838,y:552,w:46,h:50,k:.3,d:.08,kick:{vx:3}},
 {n:'bookstack',x:898,y:622,w:156,h:140,k:.16,d:.14,kick:{vy:4}},
 {n:'petbed',x:1478,y:782,w:186,h:136,k:.16,d:.16,kick:{vy:5}},
 {n:'cratebook',x:282,y:612,w:116,h:46,k:.18,d:.12,kick:{vy:-5}},
 {n:'box1',x:98,y:466,w:86,h:76,k:.2,d:.1,kick:{vy:-4}},
 {n:'lockbox',x:22,y:672,w:96,h:66,k:.2,d:.1,kick:{vy:-4}},
 {n:'box2',x:1072,y:292,w:82,h:70,k:.2,d:.1,kick:{vy:-4}},
 {n:'moonbox',x:1492,y:412,w:102,h:76,k:.2,d:.1,kick:{vy:-4}},
];
FP.forEach(p=>{p.ox=0;p.oy=0;p.vx=0;p.vy=0;p.hops=0;p.dust=10;});
const FSPINE_ROWS=[[146,80,4,224],[248,80,4,212],[456,86,4,92],[568,80,4,218]];
let fSpines=[],fBits=[],fSnow=[];
const FVINES=[];const VT=16; // finer leaf grid (Jackie): small tiles, and only leaf pixels move
for(let x=0;x<300;x+=VT)for(let y=10;y<290;y+=VT)FVINES.push({x,y,w:VT,h:VT,ox:0,vx:0});
for(let x=1462;x<1665;x+=VT)for(let y=66;y<226;y+=VT)FVINES.push({x,y,w:VT,h:VT,ox:0,vx:0});
// the plant on the trinket shelf rustles like the vines (Jackie, Nov 4): its leaves are small tiles too, instead of the whole plant bouncing
const SHELF_PLANT={x:1158,y:268,w:126,h:162};
const SHELF_POT={x:1188,y:320,w:82,h:48}; // its pot's green diamonds look like leaves: the pot stays still
for(let x=SHELF_PLANT.x;x<SHELF_PLANT.x+SHELF_PLANT.w;x+=VT)for(let y=SHELF_PLANT.y;y<SHELF_PLANT.y+SHELF_PLANT.h;y+=VT)if(x+VT<=SHELF_POT.x||x>=SHELF_POT.x+SHELF_POT.w||y+VT<=SHELF_POT.y||y>=SHELF_POT.y+SHELF_POT.h)FVINES.push({x,y,w:VT,h:VT,ox:0,vx:0,shelf:true});
const FGLOBE={cx:1537,cy:257,r:36},fGlobeKick={x:1494,y:218,w:88,h:86,ox:0,oy:0,vx:0,vy:0,k:.25,d:.12};
const BOING={oy:0,vy:0,ox:0,vx:0};const FFLOOR=900;
function fplay(name){/* sound slot for Garry: ammonite_puff, snail_wind, book_slide, pillow_squish, globe_shake, treat_drop, treat_bounce, plant_boing, vine_rustle, glass_clink, drum_tap */}
const fhit=(p,x,y)=>x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+p.h;
function fidgetPoke(x,y){
 if(Math.hypot(x-FGLOBE.cx,y-FGLOBE.cy)<FGLOBE.r+8){for(let i=0;i<26;i++){const a=rnd(0,6.28),r=rnd(0,FGLOBE.r-6);fSnow.push({x:FGLOBE.cx+Math.cos(a)*r,y:FGLOBE.cy+Math.sin(a)*r,vx:rnd(-1.5,1.5),vy:rnd(-2.5,.5)});}
  if(fSnow.length>80)fSnow.splice(0,fSnow.length-80);fGlobeKick.vx+=4*(Math.random()<.5?1:-1);fplay('globe_shake');if(st.started&&bump('shakes')>=30)earnPot('frost');return true;}
 if(x>=SHELF_PLANT.x&&x<SHELF_PLANT.x+SHELF_PLANT.w&&y>=SHELF_PLANT.y&&y<SHELF_PLANT.y+SHELF_PLANT.h){const dir=x<SHELF_PLANT.x+SHELF_PLANT.w/2?1:-1; // a tap rustles the leaves near your finger, away from it
  for(const v of FVINES)if(v.shelf){const d=Math.hypot(x-(v.x+v.w/2),y-(v.y+v.h/2));if(d<70)v.vx+=dir*(2.2-d/50)*(.8+Math.random()*.4);}fplay('vine_rustle');return true;}
 for(const p of FP)if(fhit(p,x,y)){
  if(p.hop){p.hops=Math.min(p.hops+1,6);if(p.oy===0&&p.vy===0)p.vy=-5;fplay('snail_wind');return true;}
  const k=p.kick||{};p.vx+=(k.vx||0)*(x<p.x+p.w/2?1:-1);p.vy+=(k.vy||0);
  if(p.puff){const n=Math.max(2,Math.round(p.dust));for(let i=0;i<n;i++)fBits.push({x:p.x+p.w/2+rnd(-25,25),y:p.y+rnd(10,40),vx:rnd(-1.6,1.6),vy:rnd(-3.2,-.6),life:rnd(40,80),c:Math.random()<.5?'#f3e6c8':'#d9c6a0'});
   p.dust=Math.max(1,p.dust-1.5);p.lastPoke=performance.now();if(Math.random()<1/30)fBits.push({x:p.x+p.w/2,y:p.y+20,vx:rnd(-1,1),vy:-4,life:200,c:'#b07a3a',big:true});}
  fplay(p.n);return true;}
 for(const s of FSPINE_ROWS)if(y>=s[0]&&y<s[0]+s[1]&&x>=s[2]&&x<s[3]){fSpines.push({x:Math.max(s[2],Math.round(x)-12),y:s[0],w:24,h:s[1],oy:0,vy:-6});if(fSpines.length>30)fSpines.shift();fplay('book_slide');return true;}
 return false;}
function plantBoing(x){BOING.vy=-9-Math.random()*3;const b=plantBox();BOING.vx=(x<b.x+b.w/2?2:-2);fplay('plant_boing');}
const fDrag={last:null}; // the last pointer spot, for brushing the vines
cv.addEventListener('pointermove',e=>{const [x,y]=toGame(e);
 if(fDrag.last){const dx=x-fDrag.last.x;if(Math.abs(dx)+Math.abs(y-fDrag.last.y)>3)for(const v of FVINES)if(Math.hypot(x-(v.x+v.w/2),y-(v.y+v.h/2))<40){v.vx+=clamp(dx*.2,-2,2);fplay('vine_rustle');}}
 fDrag.last={x,y};});
function fspring(p){p.vx+=-p.k*p.ox;p.vy+=-p.k*p.oy;p.vx*=1-p.d;p.vy*=1-p.d;p.ox+=p.vx;p.oy+=p.vy;if(Math.abs(p.ox)<.3&&Math.abs(p.vx)<.2){p.ox=0;p.vx=0;}if(Math.abs(p.oy)<.3&&Math.abs(p.vy)<.2){p.oy=0;p.vy=0;}}
function fidgetStep(){
 for(const p of FP){if(p.hop){if(p.oy<0||p.vy!==0){p.vy+=.5;p.oy+=p.vy;if(p.oy>=0){p.oy=0;if(p.hops>1){p.hops--;p.vy=-4-p.hops*.4;}else{p.hops=0;p.vy=0;}}}continue;}
  fspring(p);if(p.puff&&p.lastPoke&&performance.now()-p.lastPoke>8000)p.dust=Math.min(10,p.dust+.02);}
 fspring(fGlobeKick);
 for(const s of fSpines){s.vy+=-.14*s.oy;s.vy*=.9;s.oy+=s.vy;}fSpines=fSpines.filter(s=>Math.abs(s.oy)>.3||Math.abs(s.vy)>.2);
 for(const v of FVINES){v.vx+=-.1*v.ox;v.vx*=.9;v.ox=clamp(v.ox+v.vx,-3,3);}
 for(const b of fBits){b.vy+=.12;b.vx*=.98;b.x+=b.vx;b.y+=b.vy;b.life--;}fBits=fBits.filter(b=>b.life>0);
 for(const s of fSnow){s.vy+=.04;s.vx*=.96;s.vy*=.97;s.x+=s.vx;s.y+=s.vy;const dx=s.x-FGLOBE.cx,dy=s.y-FGLOBE.cy,d=Math.hypot(dx,dy),lim=FGLOBE.r-5;if(d>lim){s.x=FGLOBE.cx+dx/d*lim;s.y=FGLOBE.cy+dy/d*lim;s.vx*=-.3;s.vy*=-.3;}}
 fSnow=fSnow.filter(s=>!(s.y>FGLOBE.cy+FGLOBE.r-8&&Math.abs(s.vy)<.05&&Math.random()<.01));
 if(BOING.oy<0||BOING.vy!==0){BOING.vy+=.6;BOING.oy+=BOING.vy;if(BOING.oy>=0){BOING.oy=0;if(BOING.vy>2.5)BOING.vy=-BOING.vy*.42;else BOING.vy=0;}}
 BOING.vx+=-.2*BOING.ox;BOING.vx*=.85;BOING.ox+=BOING.vx;
}
let fAcc=0,fPrev=performance.now();
// moving pieces carry ONLY their object's pixels, never the wall/shelf behind them:
// leaves = green pixels; props = pixels that differ from the colors around the prop's edge (its background)
const leafPx=(r,g2,b)=>(g2>r+8&&g2>b+20)||(g2>110&&b<g2-70&&r<g2+70&&r>g2-10); // greens and yellow-green leaves (autumn/golden light)
// keep only tiles that are mostly leaf, so books/shelves/wall never wiggle
let vineChecked=null;function vineFilter(src){if(vineChecked===src.src)return;vineChecked=src.src;const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(src,0,0);let D;try{D=x.getImageData(0,0,W,H).data;}catch(e){return;}
 for(const v of FVINES){let n=0,t=0;for(let y=v.y;y<v.y+v.h;y+=2)for(let xx=v.x;xx<v.x+v.w;xx+=2){const i=(y*W+xx)*4;t++;if(leafPx(D[i],D[i+1],D[i+2]))n++;}v.on=n/t>.5;}}
const fgCache=new Map();
function fgPiece(src,x,y,w,h,kind){const key=src.src+'|'+x+','+y+','+w+','+h+'|'+kind;let c=fgCache.get(key);if(c)return c;
 c=document.createElement('canvas');c.width=w;c.height=h;const cx=c.getContext('2d');cx.drawImage(src,x,y,w,h,0,0,w,h);let d;try{d=cx.getImageData(0,0,w,h);}catch(e){return null;}const D=d.data;
 if(kind==='leaf'){for(let i=0;i<D.length;i+=4){if(!leafPx(D[i],D[i+1],D[i+2])&&!(D[i]+D[i+1]+D[i+2]<150))D[i+3]=0;}}
 else{const bg=[];const take=i=>bg.push([D[i],D[i+1],D[i+2]]);for(let xx=0;xx<w;xx+=2){take(xx*4);take(((h-1)*w+xx)*4);}for(let yy=0;yy<h;yy+=2){take(yy*w*4);take((yy*w+w-1)*4);}
  for(let i=0;i<D.length;i+=4){let near=false;for(const q of bg){if(Math.abs(D[i]-q[0])+Math.abs(D[i+1]-q[1])+Math.abs(D[i+2]-q[2])<42){near=true;break;}}if(near)D[i+3]=0;}}
 cx.putImageData(d,0,0);if(fgCache.size>400)fgCache.clear();fgCache.set(key,c);return c;}
function fidgetDrawProps(src){const now=performance.now();fAcc+=Math.min(100,now-fPrev);fPrev=now;while(fAcc>=1000/60){fidgetStep();fAcc-=1000/60;}
 if(!src||!ok(src))return;const pc=(x,y,w,h,ox,oy)=>g.drawImage(src,x,y,w,h,x+Math.round(ox),y+Math.round(oy),w,h);
 const pf=(x,y,w,h,ox,oy,kind)=>{const c=fgPiece(src,x,y,w,h,kind);if(c)g.drawImage(c,x+Math.round(ox),y+Math.round(oy));};
 vineFilter(src);for(const v of FVINES)if(v.on&&Math.round(v.ox))pf(v.x,v.y,v.w,v.h,v.ox,0,'leaf');
 for(const p of FP)if(Math.round(p.ox)||Math.round(p.oy))pf(p.x,p.y,p.w,p.h,p.ox,p.oy,'obj');
 if(Math.round(fGlobeKick.ox)||Math.round(fGlobeKick.oy))pc(fGlobeKick.x,fGlobeKick.y,fGlobeKick.w,fGlobeKick.h,fGlobeKick.ox,fGlobeKick.oy);
 for(const s of fSpines)if(Math.round(s.oy))pc(s.x,s.y,s.w,s.h,0,s.oy);
 g.fillStyle='#ffffff';for(const s of fSnow)g.fillRect(Math.round(s.x+fGlobeKick.ox)-1,Math.round(s.y)-1,3,3);
 idleTick(now);const io=idleOffset(now);if(io){const r=idleOn.it;if(r.k==='plain')pc(r.x,r.y,r.w,r.h,io,0);else pf(r.x,r.y,r.w,r.h,io,0,r.k);}}
function fidgetDrawTop(){for(const b of fBits){g.fillStyle=b.c;const s=b.big?6:3;g.fillRect(Math.round(b.x),Math.round(b.y),s,s);}}

/* ---------- IDLE WIGGLE (Jackie, Nov 3; RULES.md 10) ----------
   Now and then ONE thing you can use gives a tiny wiggle: one art pixel, a couple of frames, one item every 10 s,
   never two at once, never while you're touching something (or while anything else is moving). It's not a hint about needs.
   Only usable things: the carafe, the SNACKS cabinet, both lamps, the desk drawers (journal), the armchair, the doodad fidgets
   and seasonal items. Books: ONLY the four special readable books (not placed in the room yet), never any other books
   (the shelves, the book stack, the crate book). 'obj' = only the item's own pixels move; 'plain' = a part inside the item (the lamp shade, the chair's back cushion, the cabinet door, the drawers). */
/* Jackie, Nov 4: for now ONLY these wiggle, one item every 10 s, one at a time, under half a second each (4 frames x 110 ms):
   both lamps, the snow globe, the journal drawers, the SNACKS cupboard, the carafe and the readable books (the shelf the book menu opens from). */
const IDLE_ITEMS=[{n:'carafe',x:776,y:498,w:66,h:106,k:'obj'},{n:'SNACKS cabinet',x:1486,y:576,w:134,h:156,k:'plain'},
 {n:'floor lamp',x:150,y:262,w:146,h:166,k:'plain'},{n:'desk lamp',x:1272,y:390,w:150,h:140,k:'obj'},
 {n:'desk drawers (journal)',x:1068,y:566,w:108,h:168,k:'plain'},{n:'readable books',...SHELF,k:'plain'},
 {n:'snow globe',x:fGlobeKick.x,y:fGlobeKick.y,w:fGlobeKick.w,h:fGlobeKick.h,k:'plain'}];
const IDLE_GAP=[10,10],IDLE_FRAMES=[1,0,1,0],IDLE_MS=110,ART_PX=5; // seconds between tries; ONE ART PIXEL on two frames.
// ART_PX: the room art's own pixels are ~5 room units wide, so a 1-unit nudge was invisible (on a phone, under half a screen dot). Jackie: "the little items still don't wiggle".
let idleNext=0,idleOn=null,pointerHeld=false;const idleLog=[];
cv.addEventListener('pointerdown',()=>{pointerHeld=true;});addEventListener('pointerup',()=>{pointerHeld=false;});addEventListener('pointercancel',()=>{pointerHeld=false;});
function touching(){return pointerHeld||drag.down||drag.on||!!held.tool||!!feed.item||!!bookDrag.item||!!bubble||!!document.querySelector('.screen');}
function somethingMoving(){return FP.some(p=>p.ox||p.oy||p.vx||p.vy)||fSpines.length>0||!!(fGlobeKick.ox||fGlobeKick.oy)||fBits.length>0||!!(BOING.oy||BOING.vy);}
function idleTick(now){if(idleOn){if(now-idleOn.t0>=IDLE_FRAMES.length*IDLE_MS||touching())idleOn=null;return;}
 if(!idleNext)idleNext=now+rnd(IDLE_GAP[0],IDLE_GAP[1])*1000;if(now<idleNext)return;idleNext=now+rnd(IDLE_GAP[0],IDLE_GAP[1])*1000;
 if(!st.started||touching()||somethingMoving()){idleNext=now+1000;return;} // busy: try again in a second, so the 10 s rhythm holds
 idleOn={it:IDLE_ITEMS[Math.floor(Math.random()*IDLE_ITEMS.length)],t0:now};idleLog.push({n:idleOn.it.n,t:now});if(idleLog.length>400)idleLog.shift();}
function idleOffset(now){return idleOn?(IDLE_FRAMES[Math.floor((now-idleOn.t0)/IDLE_MS)]||0)*ART_PX:0;}
