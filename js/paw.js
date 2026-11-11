'use strict';
/* SLOTH'S PAW (Jackie, Nov 10): Sloth, PhD delivers by paw, not paper airplane. A very slow paw reaches in through the window, sets
   what it brought on the windowsill and slides back out. Art: Jackie's sheet (sloth_paw_sheet.png), cut into sloth_paw_envelope.png,
   sloth_paw_seed.png, sloth_paw_empty.png, envelope.png and seed_packet.png, with only the magenta removed. Drawn at one third size,
   nearest-neighbor (PAW_K): the envelope paw is then as tall as the window's lower row of panes.
   What it brings, each its own piece on the sill that you tap:
     the envelope  (the seedling note, Sloth's letters)  -> the question or the letter, as before
     the seed packet (a seedling you said yes to)         -> planted in the little pot the usual way
   When you send a seed to Sloth, PhD the packet goes on the sill and the empty paw comes for it.
   Movement: whole pixels, no easing, no rotation, never a wave or a loop: slides in over 3 s, pauses, settles the item one step onto the
   sill, pauses, slides out over 3 s (taking: in, pause, one step down, picks it up, one step up, pause, out).
   It only comes through an open window, never at night, never while you're dragging something, reading a story or in a menu; a delivery
   simply waits and comes a couple of seconds after things are calm. Curtains closing or night falling mid-reach: it finishes at once.
   It comes in from behind the right side of the window and the armchair (PAW_EDGE), and sill items hide behind closed curtains. */
const PAW_K=1/3; // nearest-neighbor
const PAW_ART={envelope:img('sloth_paw_envelope.png'),seed:img('sloth_paw_seed.png'),empty:img('sloth_paw_empty.png')},ITEM_ART={envelope:img('envelope.png'),seed:img('seed_packet.png')};
const PAW_HOLD={envelope:38,seed:29}; // where the held item's middle is, from the left of its paw picture (scaled)
const SILL_ITEM={x:425,y:SURFACE.sill}; // the middle of the windowsill's open ledge, clear of the armchair
// the first x, row by row, of what's in front of the window on the right (the window's edge, then the armchair's outline): the paw is only seen left of it
const PAW_EDGE=[[0,572],[450,534],[456,517],[462,503],[468,497],[474,486],[480,484],[486,479],[492,475],[498,474],[504,471]];
const PAW_IN=3,PAW_PAUSE=1,PAW_STEP=4,PAW_CALM=2;
const pawScaled=new Map();
function pawPic(im){if(!ok(im))return null;let c=pawScaled.get(im);if(c)return c;c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*PAW_K);c.height=Math.round(im.naturalHeight*PAW_K);
 const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(im,0,0,c.width,c.height);pawScaled.set(im,c);return c;}
let paw=null,pawCalm=0; // the trip in progress (not saved: a trip cut short simply happens again)
const sillHidden=()=>st.curtain==='closed'&&curK>.98;
function pawOK(){return st.started&&st.curtain==='open'&&curK<.02&&!st.night&&!drag.down&&!drag.on&&!storyEl&&!document.querySelector('.screen');}
// what's lying on the sill right now, if anything ('envelope', 'seed' a packet for you, 'send' a packet waiting for the paw)
function sillItemNow(){const s=st.sillItem;if(s==='envelope')return (slothOnSill()||letterOnSill())?s:null;return s==='seed'||s==='send'?s:null;}
function sillBox(k=sillItemNow()){const c=pawPic(ITEM_ART[k==='envelope'?'envelope':'seed']);if(!c)return null;return {x:Math.round(SILL_ITEM.x-c.width/2),y:SILL_ITEM.y-c.height,w:c.width,h:c.height,c};}
function pawTick(dt){
 if(st.sillItem==='envelope'&&!sillItemNow()&&st.pawWait!=='envelope')st.sillItem=null; // the note or letter was answered
 if(st.pawWait==='envelope'&&!slothOnSill()&&!letterOnSill()){st.pawWait=null;save();} // nothing left to bring
 if(paw){if(st.night||st.curtain==='closed'){pawFinish();return;}paw.t+=dt;if(paw.t>=paw.end)pawFinish();else pawStep();return;}
 if(!st.pawWait||!pawOK()){pawCalm=0;return;}pawCalm+=dt;if(pawCalm>=PAW_CALM)pawStart();}
function pawStart(){const kind=st.pawWait;pawCalm=0;paw={kind,t:0,end:kind==='take'?2*PAW_IN+3*PAW_PAUSE:2*PAW_IN+2*PAW_PAUSE,did:false};
 if(kind==='take'&&st.sillItem!=='send'){st.pawWait=null;paw=null;return;}
 tell('A very slow paw reaches in through the window…',{kind:'teach',key:'paw'});}
// the moment it lets go (or picks up)
function pawStep(){const p=paw;if(p.did)return;const at=PAW_IN+2*PAW_PAUSE;if(p.t<at)return;p.did=true; // after the settle and its pause
 if(p.kind==='take'){st.sillItem=null;sfx('page');save();return;}
 st.sillItem=p.kind;sfx(p.kind==='seed'?'soil':'page');if(p.kind==='seed')tell('A seed packet from Sloth, PhD is on the windowsill.',{kind:'important'});save();}
function pawFinish(){if(!paw)return;const k=paw.kind;if(!paw.did){paw.t=PAW_IN+2*PAW_PAUSE;pawStep();}paw=null;st.pawWait=null;
 if(k==='take'){const seed=st.sendSeed;st.sendSeed=null;seedSentHook(seed);tell('Off it goes to Sloth, PhD.',{kind:'important'});}save();}
// where the paw is and which picture, at time t of the trip (whole pixels, straight lines)
function pawPose(){const p=paw,t=p.t,held=p.kind==='take'?'seed':p.kind,H=pawPic(PAW_ART[held]),E=pawPic(PAW_ART.empty);if(!H||!E)return null;
 const R=Math.round(SILL_ITEM.x-PAW_HOLD[held]+H.width),top=SILL_ITEM.y-H.height,far=572+H.width+2,lin=(a,b,u)=>Math.round(a+(b-a)*clamp(u,0,1));
 const a=PAW_IN,b=a+PAW_PAUSE,c=b+PAW_PAUSE;
 if(p.kind!=='take'){ // bring it: in holding it a step above the sill, settle, let go, out empty
  if(t<a)return {c:H,R:lin(far,R,t/a),y:top-PAW_STEP};
  if(t<b)return {c:H,R,y:top-PAW_STEP};
  if(t<c)return {c:H,R,y:top};
  return {c:E,R:lin(R,572+E.width+2,(t-c)/PAW_IN),y:top};}
 const d=c+PAW_PAUSE; // take it: in empty a step above, down, pick up, lift, out with it
 if(t<a)return {c:E,R:lin(far,R,t/a),y:top-PAW_STEP};
 if(t<b)return {c:E,R,y:top-PAW_STEP};
 if(t<c)return {c:E,R,y:top};
 if(t<d)return {c:H,R,y:top-PAW_STEP};
 return {c:H,R:lin(R,far,(t-d)/PAW_IN),y:top-PAW_STEP};}
function pawClip(){g.beginPath();for(let i=0;i<PAW_EDGE.length;i++){const [y0,e]=PAW_EDGE[i],y1=i+1<PAW_EDGE.length?PAW_EDGE[i+1][0]:H;g.rect(0,Math.max(y0,300),e,y1-Math.max(y0,300));}g.clip();}
// drawn behind the plants and the cat, like the sill seedling
function drawSill(){if(!st.started)return;const k=sillItemNow();
 if(k&&!sillHidden()){const b=sillBox(k);if(b){g.save();g.imageSmoothingEnabled=false;g.drawImage(b.c,b.x,b.y);g.restore();curtainOver(b);}}
 if(paw){const q=pawPose();if(q){g.save();pawClip();g.imageSmoothingEnabled=false;g.drawImage(q.c,q.R-q.c.width,Math.round(q.y));g.restore();}}}
function sillHit(x,y){const k=sillItemNow();if(!k||k==='send'||paw||sillHidden())return false;const b=sillBox(k);return !!b&&x>=b.x-16&&x<=b.x+b.w+16&&y>=b.y-16&&y<=b.y+b.h+12;}
function sillTap(){const k=sillItemNow();if(k==='envelope'){if(letterOnSill())openLetter();else slothAsk();}else if(k==='seed')plantGift();}
// the seed packet you tap: planted in the little pot, the usual way
function plantGift(){st.sillItem=null;if(plantCount()>=MAX_PLANTS){save();return;}st.giftSeed=1;const p=freshPlant();p.species=Math.floor(Math.random()*16);addPlant(p);sfx('soil');
 tell('The seed from Sloth, PhD is planted in the little pot.',{kind:'important'});save();}
// debug (test mode): the next delivery comes right now; if nothing is waiting, a letter for an adult or a seedling note
function dbgPaw(){if(!st.pawWait){const A=allRaw().find(q=>q.stage>=8&&!q.goDest);if(A)letterLand(A.id);else if(slothReady()){st.slothNote='sill';st.pawWait='envelope';}else st.pawWait='seed';}
 st.curtain='open';curK=0;st.night=false;paw=null;pawStart();}
