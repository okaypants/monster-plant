'use strict';
/* GROWING UP IS A MOMENT (Jackie, Nov 10): sprout -> kid, kid -> teen and teen -> adult no longer just happen. No new art.
   It waits for you. When a monster's time is up (growReady) it stays as it is, however long: while the game is closed, while you're
   dragging, carrying, feeding, reading a story, in the journal or a menu, while a card is open or the paw is reaching in, while the
   monster naps, floats, reads or is hidden behind the curtains, and all night. It grows when you tap it, or by itself GROW_CALM seconds
   after the room is calm and you're there. One monster at a time (the lowest id first; the next one waits its own few seconds).
   The moment, all whole pixels, nearest-neighbor, never a fade, rotation or smooth scaling:
     hop      only if the new age can't stay where it is: it hops to the nearest allowed spot first (growSpot)
     build-up it crouches a few pixels (GROW_DIP; the pot stays put), holds still for a beat, rises back up
     change   the new age's sprite, at 1/3, 2/3 and then all of the way from the old size to the new (GROW_STEPS)
     payoff   one burst of sparkles and hearts, its signature move, the caption; the cat turns toward it, and a fond cat walks over and sits
   Nothing loops afterward. The journal stamps it in words, no numbers (growWords). With the phone's reduce-motion setting: no hop, steps,
   burst or move; it is simply the new size, with the caption and the journal stamp. A seed sprouting is not a moment: it just sprouts. */
const GROW_CALM=3,GROW_HOP=.5,GROW_LAND=.2,GROW_ARC=40,GROW_DIP=[4,8,10],GROW_DIP_T=.1,GROW_HOLD=.7,GROW_STEPS=3,GROW_STEP_T=.16,GROW_AFTER=1.2;
let grow=null,growCalm=0; // the moment in progress (not saved: one cut short by closing the game simply waits again)
const growReady=(q=st)=>q.stage>=1&&q.stage<8&&(q.timer||0)>=GROW_FOR[q.stage];
// the room is calm and you're there
function growBusy(){return !st.started||st.night||touching()||!!storyEl||!!trayEl||!!btrayEl||!!jEl||!!paw||document.visibilityState!=='visible';}
// this monster (swapped in) can have its moment right now
function growCan(){return growReady()&&!st.night&&!(st.nap>0)&&!st.float&&!behindCurtain()&&!READ.has(st.id);}
function growMomentTick(dt){
 if(grow){growStep(dt);return;}
 if(growBusy()||!quiet()){growCalm=0;return;}
 const q=allRaw().filter(p=>p.stage>=0&&growReady(p)).sort((a,b)=>a.id-b.id).find(p=>{let can=false;withPlant(p.id,()=>{can=growCan();});return can;});
 if(!q){growCalm=0;return;}
 growCalm+=dt;if(growCalm>=GROW_CALM)growStart(q.id);}
// a tap on a monster that's ready: it grows now. Taps on the one that's growing do nothing.
function growTap(){if(grow)return grow.id===st.id;if(!growCan())return false;growStart(st.id);return true;}
function growAnchor(){const k=spotKey(),s=onChair()?CHAIR_SEAT:SPOT[k];return {x:s.x,y:s.y};}
/* WHERE IT STANDS AT THE NEW AGE. null = right where it is (still allowed there, and its bigger body overlaps nobody). Otherwise the
   nearest allowed spot. A sprout (a kid can't live on the windowsill or the desk): the nearest free milk crate or book stack, else the
   floor. On the floor already: the nearest clear bit of floor. On furniture it has outgrown: the clear bit of floor nearest it along the
   front of the rug, where grown monsters stand. It never hops into the armchair by itself. */
function growSpot(to){const from=growAnchor(),s0=st.stage,p0=st.perch,f0=st.free&&{...st.free}; // growAnchor first: it settles where a kid sits
 try{st.stage=to;const a=ageName();
  if(s0>=4){if(p0?PERCH[a].includes(p0)&&spaceFree(p0):!!f0&&freeClear(f0.x,f0.y))return null;}
  const c=s0>=4?[]:PERCH[a].filter(k=>k!=='chair'&&!perchTaken(k)&&spaceFree(k)).map(k=>({perch:k,x:SPOT[k].x,y:SPOT[k].y,d:Math.hypot(SPOT[k].x-from.x,SPOT[k].y-from.y)})).sort((p,q)=>p.d-q.d);
  if(c.length)return c[0];
  const f=s0>=4&&!p0&&f0?nearestClearFloor(f0.x,f0.y):nearestClearFloor(from.x,FLOOR_FRONT);return f?{perch:null,free:f,x:f.x,y:f.y}:null;}
 finally{st.stage=s0;st.perch=p0;st.free=f0;if(f0)SPOT.free={x:f0.x,y:f0.y,name:''};}}
function growStart(id){growCalm=0;if(grow)return;withPlant(id,()=>{const from=st.stage,to=NEXT[from];if(to==null||from<1)return;
  st.walk=null;st.mv=null;const a=growAnchor(),h0=plantBoxRaw().h,spot=growSpot(to);
  grow={id,from,to,t:0,spot,dx:spot?spot.x-a.x:0,dy:spot?spot.y-a.y:0,h0,k:1,r:1,did:false,paid:false,still:tsCalm()};
  if(grow.still)growFinish();});} // reduce motion: straight to the new size
const growT0=()=>grow.spot?GROW_HOP+GROW_LAND:0,growTC=()=>growT0()+GROW_DIP.length*GROW_DIP_T*2+GROW_HOLD;
function growStep(dt){const G=grow;if(!allRaw().some(q=>q.id===G.id&&q.stage>=0)){grow=null;return;} // it left the room
 withPlant(G.id,()=>{
  if(st.night||st.nap>0||(drag.on&&drag.id===G.id)){growFinish();return;} // picked up or put to bed mid-moment: it is simply grown
  G.t+=dt;const tc=growTC();
  if(!G.did&&G.t>=tc)growChange();
  if(G.did){const i=Math.min(GROW_STEPS,1+Math.floor((G.t-tc)/GROW_STEP_T));G.k=G.r+(1-G.r)*i/GROW_STEPS;if(i>=GROW_STEPS&&!G.paid)growPayoff();}
  if(G.paid&&G.t>=tc+GROW_STEPS*GROW_STEP_T+GROW_AFTER)grow=null;});}
// the hop to its new spot, before it changes: whole pixels, in 8 steps: up a little first, then over and down (or up) onto the spot
function growOff(){const G=grow;if(!G||G.id!==st.id||G.did||!G.spot)return [0,0];const u=Math.floor(clamp(G.t/GROW_HOP,0,1)*8)/8,fall=G.dy>0?u*u:1-(1-u)*(1-u);
 return [Math.round(G.dx*u),Math.round(G.dy*fall-GROW_ARC*4*u*(1-u))];}
// the crouch: down in whole-pixel steps, a beat, back up
function growDip(){const G=grow;if(!G||G.id!==st.id||G.did)return 0;const n=GROW_DIP.length,t=G.t-growT0();if(t<0)return 0;
 if(t<n*GROW_DIP_T)return GROW_DIP[Math.floor(t/GROW_DIP_T)];if(t<n*GROW_DIP_T+GROW_HOLD)return GROW_DIP[n-1];
 const j=Math.floor((t-n*GROW_DIP_T-GROW_HOLD)/GROW_DIP_T);return j<n-1?GROW_DIP[n-2-j]:0;}
// how much of its new size it is drawn at, mid-change (1 any other time)
function growK(){return grow&&grow.id===st.id&&grow.did?grow.k:1;}
// the switch to the new age (st = the monster): its new sprite, at its new spot
function growChange(){const G=grow;G.txt=stageUp();
 if(G.spot){st.perch=G.spot.perch||null;if(G.spot.free)st.free={x:G.spot.free.x,y:G.spot.free.y};}
 pickChair();spotKey();G.r=clamp(G.h0/(plantBoxRaw().h||G.h0),.2,1);G.did=true;G.k=G.r+(1-G.r)/GROW_STEPS;}
function growPayoff(){const G=grow;G.paid=true;G.k=1;
 if(!G.still){const b=plantBoxRaw(),cx=b.x+b.w/2;burst('spark',cx,b.y+b.h*.3,4);burst('heart',cx,b.y+b.h*.2,3);doMove();}
 st.grew=st.grew||{};st.grew[G.to]=growWords();
 tell(G.txt,{kind:'important',who:st.id});catSeesGrow();save();}
function growFinish(){if(!grow)return;grow.still=true;if(!grow.did)growChange();if(!grow.paid)growPayoff();grow=null;}
// the journal's stamp, in words: the same day words as the journal's top corner (DAY_WORDS in js/names.js). No numbers.
function growWords(d=nowDate()){const h=d.getHours(),part=DAY_WORDS.parts.filter(p=>h>=p[0]).pop()[1];return 'Grew up on a '+DAY_WORDS.weekdays[d.getDay()]+' '+part+' in '+seasonNow()+'.';}
function grewLine(q=st){const G=q.grew||{};for(const s of[8,6,4])if(q.stage>=s&&G[s])return G[s];return '';} // its latest grow-up
/* THE CAT: it turns toward the monster (sits up and looks, then goes back to its nap). A cat that's fond of you or adores you walks
   over and sits near it. A cat that has had enough of being touched, or is being petted, only looks. Existing frames only. */
const CAT_LOOK_T=3;
function catSitBy(){const b=plantBoxRaw(),cx=b.x+b.w/2,floor=spotKey()==='free'&&!onChair(),y=floor?SPOT.free.y:SURFACE.floor,sc=catSc(floor?plantDepth():DEPTH.floor),
 f=CATF.sit1,half=Math.ceil((ok(f)?f.naturalWidth:190)*catK(f)*sc/2),side=cat.x<cx?-1:1; // the side it's already on first
 if(cat.state!=='walk'&&Math.abs(cat.y-y)<30&&Math.abs(cat.x-cx)<b.w/2+half*2+60)return null; // already right there
 for(const sd of[side,-side]){const near=Math.round(clamp(cx+sd*(b.w/2+half+12),FLOOR_X0,FLOOR_X1)),s={x:near,y,sc,poses:['loaf']},x=sd>0?floorX(s,near,FLOOR_X1):floorX(s,FLOOR_X0,near);
  if(x!=null&&Math.abs(x-near)<=150)return {...s,x};}
 return null;}
function catSeesGrow(){if(cat.hold)return;const b=plantBoxRaw(),px=b.x+b.w/2,grumpy=cat.huff||patLow()||['annoyed','fedup','settle','loafwake','pet'].includes(cat.state);
 if(!grumpy&&catTrust()>=TRUST_FOND){const s=catSitBy();if(s){CAT_SPOTS.front=s;catGo('front');cat.faceX=px;return;}}
 if(grumpy||cat.state==='walk')return;
 cat.lookNap=cat.state==='sleep'?cat.nap:0;cat.state='look';cat.t=0;cat.faceX=px;}
// debug (test mode): the monster being tended grows up right now (a seed just sprouts)
function dbgGrowUp(){if(!TESTING)return;const q=pRaw();if(NEXT[q.stage]==null)return;if(grow)growFinish();
 if(q.stage<1){withPlant(q.id,()=>{tell(stageUp(),{kind:'important',who:st.id});});return;}
 st.night=false;withPlant(q.id,()=>{st.timer=GROW_FOR[st.stage];st.nap=0;st.float=null;});growStart(q.id);}
