'use strict';
/* Cat: naps, walks, trust, petting. */
/* ---------- CAT (Jackie): naps all over the room, wanders now and then, can be petted. Frame swaps + whole-pixel moves only. ---------- */
// New cat (Nov 3 redesign; old frames in old_cat/). Extras wait for the jump, play and "had enough" moments: leaps, play bow, crouches, grooming, stand, annoyed, back turned.
const CATF={};['curl1','curl2','loaf1','loaf2','side1','side2','sit1','sit2','pet1','pet2','walk1','walk2','walkL1','walkL2','yawn','belly','scratcher1','scratcher2',
 'leap_r','leap_l','playbow','pounce','stalk','groom1','groom2','stand_side','stand_front','annoyed','back'].forEach(n=>{CATF[n]=img('cat_'+n+'.png');CATF[n].catName=n;});
// OLD CAT (Jackie, Nov 4: "I miss the old cat for now"): true draws the pre-redesign frames from old_cat/ at their own size (they were drawn at room scale).
// The new cat's PNGs stay as they are; set OLD_CAT=false to bring him back. Poses only the new cat has borrow the nearest old frame,
// walking left mirrors the old walk (as the old cat did), and there's no back-scratcher.
const OLD_CAT=true;
if(OLD_CAT){const OLD=['curl1','curl2','loaf1','loaf2','side1','side2','sit1','sit2','pet1','pet2','walk1','walk2','yawn'];
 for(const n of OLD){CATF[n]=img('old_cat/cat_'+n+'.png');CATF[n].catName=n;CATF[n].old=true;}
 Object.assign(CATF,{walkL1:CATF.walk1,walkL2:CATF.walk2,belly:CATF.pet1,annoyed:CATF.sit1,back:CATF.sit1,groom1:CATF.sit1,groom2:CATF.sit2,
  stand_side:CATF.walk1,stand_front:CATF.sit1,stalk:CATF.walk1,pounce:CATF.walk2,playbow:CATF.loaf1,leap_r:CATF.walk1,leap_l:CATF.walk1});}
// SIZE: one cat scale. The new cat is drawn smaller than the old one, so CAT_K brings him back to the old size in the room (old sit 218 px tall, new 168).
// cat_poses.png (and the back-scratcher drawn to match it) is drawn bigger than cat_design.png (sit-blink 204 px vs sit 168), so its frames get POSES_K on top: every frame is the same cat size.
// The side-asleep pair (cat_side_sheet.png, replacing the poses-sheet sleeper) is drawn about 2x bigger again; SIDE_K makes him exactly as tall as the sleeper he replaces (140 px on the poses sheet, 289 here).
const CAT_K=218/168,POSES_K=168/204,SIDE_K=POSES_K*140/289,POSES_SHEET=['sit2','pet1','pet2','yawn','loaf2','curl2','annoyed','back','scratcher1','scratcher2'];
const catK=f=>f.old?1:CAT_K*(POSES_SHEET.includes(f.catName)?POSES_K:f.catName==='side1'||f.catName==='side2'?SIDE_K:1);
// back-scratcher: where its top-left sits on the cat frame, in that frame's own pixels (tines on his crown, or on his tummy when he rolls belly-up)
const SCRATCH_AT={pet:[48,-115],belly:[108,-85]};
// his size comes from the one perspective curve (depthK in room.js): CAT_BASE at the front of the rug, smaller at deeper spots
const CAT_BASE=.62,catSc=d=>CAT_BASE*depthK(d);
const CAT_SPOTS={bed:{x:1578,y:SURFACE.bed,sc:catSc(DEPTH.bed),poses:['curl','loaf']},rug:{x:760,y:SURFACE.floor,sc:catSc(DEPTH.floor),poses:['side','loaf','curl']},
 chair:{x:640,y:SURFACE.chair,sc:catSc(DEPTH.chair),poses:['curl','loaf']},sill:{x:405,y:SURFACE.sill,sc:catSc(DEPTH.sill),poses:['loaf','curl']},crate:{x:338,y:SURFACE.crate,sc:catSc(DEPTH.crate),poses:['loaf','curl']},books:{x:978,y:SURFACE.books,sc:catSc(DEPTH.books),poses:['loaf','curl']}};
const cat={spot:'bed',x:1578,y:SURFACE.bed,sc:CAT_SPOTS.bed.sc,state:'sleep',pose:'curl',t:0,nap:rnd(50,110),dir:1,path:null,pets:0};
// NEVER HIDDEN BEHIND A PLANT (Jackie): how much of his picture a spot would leave covered by the plants drawn in front of him, in real pixels (0..1).
// A plant is in front when the room draws it after him: its base line is lower on screen than his (room.js draw()).
const COVER_MAX=.2,coverCv=document.createElement('canvas'),coverG=coverCv.getContext('2d',{willReadFrequently:true});
function plantsInFront(y){const L=[];if(!st.started)return L;eachPlant(i=>{if(st.stage<0||baseY()<=y)return;const b=plantBox(),im=b.img||b.seed;if(ok(im))L.push({im,x:b.x,y:b.y,w:b.w,h:b.h});});return L;}
function catCover(x,y,sc,f){if(!ok(f))return 0;const P=plantsInFront(y);if(!P.length)return 0;const k=sc*catK(f),w=Math.round(f.naturalWidth*k),h=Math.round(f.naturalHeight*k),X=Math.round(x-w/2),Y=Math.round(y-h+bottomPad(f)*k);
 if(!P.some(p=>p.x<X+w&&p.x+p.w>X&&p.y<Y+h&&p.y+p.h>Y))return 0; // no plant even near him
 coverCv.width=w;coverCv.height=h;coverG.imageSmoothingEnabled=false;coverG.clearRect(0,0,w,h);coverG.drawImage(f,0,0,w,h);let A;try{A=coverG.getImageData(0,0,w,h).data;}catch(e){return 0;}
 coverG.clearRect(0,0,w,h);for(const p of P)coverG.drawImage(p.im,Math.round(p.x-X),Math.round(p.y-Y),Math.round(p.w),Math.round(p.h));const B=coverG.getImageData(0,0,w,h).data;
 let n=0,c=0;for(let i=3;i<A.length;i+=4)if(A[i]>40){n++;if(B[i]>40)c++;}return n?c/n:0;}
const napFrames=poses=>poses.map(p=>CATF[{curl:'curl1',loaf:'loaf2',side:'side1'}[p]]);
function spotCover(s,frames){return Math.max(0,...(frames||napFrames(s.poses)).map(f=>catCover(s.x,s.y,s.sc,f)));} // his worst pose there
function spotVisible(s,frames){return spotCover(s,frames)<=COVER_MAX;}
// on the floor he can shift sideways: the nearest x (to the one he'd like) where he isn't covered
function floorX(s,x0=FLOOR_X0,x1=FLOOR_X1){for(let d=0;d<=x1-x0;d+=30)for(const x of d?[s.x+d,s.x-d]:[s.x])if(x>=x0&&x<=x1&&spotVisible({...s,x}))return x;return null;}
function catSpotFree(k,frames){if(CAT_SPOTS[k]&&k!=='rug'&&!spotVisible(CAT_SPOTS[k],frames))return false;if(['sill','crate','books','chair'].includes(k)&&otherPos().concat(st._pos?[st._pos]:[]).some(q=>q.k===k))return false;if(k==='chair'&&(chairId!=null||allRaw().some(q=>q.stage>=4&&q.perch==='chair')))return false;if(k==='sill'&&st.curtain==='closed')return false;const pk=st.started&&st.stage>=0?spotKey():'';if(k==='chair'&&typeof onChair==='function'&&onChair())return false;if(k==='sill'&&pk==='sill')return false;if(k==='crate'&&pk==='crate')return false;if(k==='books'&&pk==='books')return false;return true;}
function plantSideSpot(){if(!(st.started&&st.stage>=6)||(typeof onChair==='function'&&onChair())||spotKey()!=='free')return null;const b=plantBox(),side=(b.x+b.w/2)<835?1:-1,sc=catSc(plantDepth()),half=Math.ceil(CATF.belly.naturalWidth*CAT_K*sc/2); // clear of the plant even in his widest pose (belly-up)
 const y=SPOT[spotKey()].y,poses=['curl','loaf'];
 for(const sd of[side,-side]){const near=Math.round(b.x+b.w/2+sd*(b.w/2+half+12)),s={x:near,y,sc,poses}; // his side of the plant first, then the other; slide further out if another plant is in front
  const x=sd>0?floorX(s,near,FLOOR_X1):floorX(s,FLOOR_X0,near);if(x!=null&&Math.abs(x-near)<=150)return {...s,x};}
 return null;}
function catPick(avoid){const ps=plantSideSpot();if(ps&&cat.spot!=='byplant'&&catTrust()>=TRUST_FOND&&Math.random()<(catTrust()>=TRUST_BFF?.6:.35)){CAT_SPOTS.byplant=ps;return 'byplant';}
 const ks=Object.keys(CAT_SPOTS).filter(k=>k!=='byplant'&&k!==cat.spot&&k!==avoid&&catSpotFree(k));const k=ks[Math.floor(Math.random()*ks.length)]||'rug';
 if(k==='rug'){const r=CAT_SPOTS.rug,x=floorX({...r,x:RUG_X}); r.x=x??RUG_X;} // the rug: wherever along it he's in view
 return k;}
const RUG_X=760;
function catGo(k){const s=CAT_SPOTS[k],FLOOR_Y=925;cat.to=k;cat.huff=0;cat.path=[{x:cat.x,y:FLOOR_Y,hop:cat.y<FLOOR_Y-20},{x:s.x,y:FLOOR_Y},{x:s.x,y:s.y,hop:s.y<FLOOR_Y-20}];cat.state='walk';cat.t=0;}
function catUpdate(dt){if(cat.hold)return; // held still by the debug Nudge tool
 cat.t+=dt;if(cat.shyT>0)cat.shyT-=dt;
 if(['sleep','settle','loafwake','pet'].includes(cat.state)&&((cat.spot==='sill'&&st.curtain==='closed')||(cat.spot==='chair'&&(chairId!=null||allRaw().some(q=>q.stage>=4&&q.perch==='chair'))))){if(cat.state==='sleep'&&cat.spot!=='chair'){cat.state='wake';cat.t=1.2;}else huffWalk();} // a monster in the armchair (napping or awake): he gets up and goes // curtains closed: hop off the ledge
 if(['sleep','settle','loafwake'].includes(cat.state)&&!drag.on){cat.coverChk=(cat.coverChk||0)-dt;if(cat.coverChk<=0){cat.coverChk=.5;const f=catFrame();cat.hidden=catCover(cat.x,cat.y,cat.sc,f)>COVER_MAX?(cat.hidden||0)+.5:0;}
  if((cat.hidden||0)>=1.5){cat.hidden=0;if(cat.state==='sleep'){cat.state='wake';cat.t=0;}else huffWalk();}} // a plant moved, scooted, wandered or grew in front of him: after a moment he gets up and walks somewhere he can be seen
 if(cat.state==='sleep'){cat.nap-=dt;if(cat.nap<=0){cat.state='wake';cat.t=0;cat.pets=0;trustGain(.015);}} // a nap left undisturbed builds trust
 else if(cat.state==='sniff'){if(cat.t>1.6){cat.state='wake';cat.t=1.2;}}
 else if(cat.state==='wake'){if(cat.t>2.6){catGo(catPick());}}
 else if(cat.state==='annoyed'){if(cat.t>1.1)huffWalk();} // the warning, then he gets up and goes
 else if(cat.state==='settle'){const a=cat.awake;cat.huffF=cat.t<a*.35?'back':cat.t<a*.55?(Math.floor(cat.t/.9)%2?'groom2':'groom1'):cat.t<a*.7?'back':(cat.t%3.4<.3?'sit2':'sit1'); // back turned, a little grooming, back turned again, then sitting with a slow blink now and then
  if(cat.t>a){cat.state='loafwake';cat.t=0;cat.loafT=rnd(60,90);}}
 else if(cat.state==='loafwake'){if(cat.t>cat.loafT){cat.state='sleep';cat.pose='loaf';cat.t=0;cat.nap=rnd(60,150);cat.huff=0;cat.huffN=0;cat.pets=0;}} // only now does he doze off for real
 else if(cat.state==='pet'){if(cat.t>2.2){cat.state='sleep';cat.t=0;cat.nap=rnd(30,70);}}
 else if(cat.state==='walk'&&(cat.pauseT||0)>0){cat.pauseT-=dt;} // stopped for a touch
 else if(cat.state==='walk'){const p=cat.path[0];if(!p&&!spotVisible(CAT_SPOTS[cat.to],cat.huff?HUFF_FRAMES():null)&&(cat.retry=(cat.retry||0)+1)<6){if(cat.huff)huffWalk();else catGo(catPick(cat.to));return;} // a plant moved in front while he walked: he never stops behind it
  if(!p&&cat.huff){cat.retry=0;const s=CAT_SPOTS[cat.to];cat.spot=cat.to;cat.sc=s.sc;huffSettle();return;}
  if(!p){cat.retry=0;const s=CAT_SPOTS[cat.to];cat.spot=cat.to;st.catNaps=st.catNaps||{};st.catNaps[cat.to]=(st.catNaps[cat.to]||0)+1;cat.sc=s.sc;cat.pose=s.poses[Math.floor(Math.random()*s.poses.length)];cat.state='sleep';cat.t=0;cat.nap=rnd(60,150);fplay('cat_settle');if(cat.spot==='byplant'){catSaw('byplant');st.listen=3;sfx('purr');tell(catName()+' curled up next to '+(firstName()||'your plant')+'.',{kind:'teach',key:'catPlant',who:'cat'});}return;}
  if(p.hop){cat.x=p.x;cat.y=p.y;cat.path.shift();return;} // hop up/down: one quick jump
  const dx=p.x-cat.x,sp=110*dt;if(Math.abs(dx)<=sp){cat.x=p.x;cat.y=p.y;cat.path.shift();}else{cat.dir=Math.sign(dx);cat.x+=cat.dir*sp;cat.y=p.y;}
  cat.sc+=((cat.path.length?catSc(DEPTH.floor):CAT_SPOTS[cat.to].sc)-cat.sc)*Math.min(1,dt*4);}
 // company: a cat napping near the plant keeps it a little company
 if(cat.state==='sleep'&&st.started&&st.stage>=4&&!st.night){const b=plantBox();if(Math.abs(cat.x-(b.x+b.w/2))<b.w*.9+120&&Math.abs(cat.y-SPOT[spotKey()].y)<160)st.needs.attention=Math.max(0,st.needs.attention-dt*.002);}}
function catFrame(){if(cat.force&&CATF[cat.force])return CATF[cat.force]; // debug: hold any frame
 if(cat.state==='sleep')return CATF[{curl:'curl1',loaf:'loaf2',side:'side1'}[cat.pose]]; // asleep: ONE frame per pose (Jackie, calm-down); the breathing is done in code (catBreath)
 if(cat.state==='wake')return cat.t<1.2?CATF.yawn:CATF[T%2.4<.18?'sit2':'sit1']; // sit2 = a slow blink now and then
 if(cat.state==='sniff')return CATF.sit1;
 if(cat.state==='annoyed')return CATF.annoyed;
 if(cat.state==='settle')return CATF[cat.huffF||'back'];
 if(cat.state==='loafwake')return CATF.loaf1;
 if(cat.state==='pet')return cat.belly?CATF.belly:CATF['pet'+(catPetF()+1)];
 if(cat.state==='walk'&&(cat.pauseT||0)>0)return CATF.sit1; // stopped for a touch
 if(cat.state==='walk')return CATF[(cat.dir<0?'walkL':'walk')+(Math.floor(T*6)%2+1)];return CATF.sit1;}
const catPetF=()=>Math.floor(T*4)%2; // petted frame; the back-scratcher rocks with it
// BREATHING (Jackie, calm-down): almost completely still. Once every ~4.6 s the body (not the paws) rises 1 px for about 1.8 s, then settles back.
// Whole pixels only; never more than 1 px. Drawn by repeating one row low in the body, so he stays on his surface.
const BREATH=4.6;const catBreath=()=>{const u=(T%BREATH)/BREATH;return u>.3&&u<.7?1:0;};
function catBox(){const f=catFrame();if(!ok(f))return null;const k=cat.sc*catK(f),w=Math.round(f.naturalWidth*k),h=Math.round(f.naturalHeight*k);const [nx,ny]=catNudge(),s1=CATF.sit1,shift=f.old&&cat.state==='pet'&&ok(s1)?Math.round((f.naturalWidth-s1.naturalWidth)/2*k):0; /* the old petted frames line up with his sitting body */return {f,k,x:Math.round(cat.x-w/2+shift)+nx,y:Math.round(cat.y-h+bottomPad(f)*k)+ny,w,h};} // paws/body on the surface line
function catPose(){if(cat.state==='annoyed')return 'annoyed';if(cat.state==='settle')return (cat.huffF||'back').replace(/[0-9]/g,'');if(cat.state==='loafwake')return 'loaf';return cat.state==='sleep'?cat.pose:cat.state==='walk'?'walk':cat.state==='pet'?(cat.belly?'belly':'pet'):cat.state==='wake'&&cat.t<1.2?'yawn':'sit';}
function catNudge(){return NUDGE.cat[catPose()+'|'+(cat.state==='walk'?'floor':cat.spot)]||[0,0];}
function catImg(f,x,y,w,h){if(f.old&&cat.state==='walk'&&cat.dir<0){g.save();g.translate(x+w,y);g.scale(-1,1);g.drawImage(f,0,0,w,h);g.restore();}else g.drawImage(f,x,y,w,h);} // the old cat walks left by mirroring his walk
function drawCat(){const b=catBox();if(!b)return;g.save();g.imageSmoothingEnabled=false; // crisp: no smoothing when scaled
 if(cat.state==='sleep'&&catBreath()){const sy=b.y+Math.round(b.h*.62); // breathing in: everything above this row is drawn 1 px higher, the row repeats, the paws stay put
  g.save();g.beginPath();g.rect(b.x-2,sy,b.w+4,b.h);g.clip();catImg(b.f,b.x,b.y,b.w,b.h);g.restore();
  g.save();g.beginPath();g.rect(b.x-2,b.y-4,b.w+4,sy-b.y+4);g.clip();catImg(b.f,b.x,b.y-1,b.w,b.h);g.restore();}
 else catImg(b.f,b.x,b.y,b.w,b.h);
 if(cat.state==='pet'&&!OLD_CAT){const s=CATF['scratcher'+(catPetF()+1)];if(ok(s)){const k=cat.sc*catK(s),[ox,oy]=SCRATCH_AT[cat.belly?'belly':'pet'];  // offsets are in the cat frame's own pixels
   g.drawImage(s,Math.round(b.x+ox*b.k),Math.round(b.y+oy*b.k),Math.round(s.naturalWidth*k),Math.round(s.naturalHeight*k));}}
 g.restore();
 if(cat.state==='sleep')sleepZ('cat',b.x+b.w*.15,b.y-6,.3);}
function catHit(x,y){const b=catBox();return b&&x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h;}
// Trust (Jackie: earn the cat's affection). 0..1, saved, never goes down (grace); a little per day so it takes a few days.
const TRUST_SHY=.3,TRUST_FOND=.65,TRUST_BFF=.9;
function catTrust(){return st.catTrust||0;}
// the cat's quirks, for his journal page: each stamp fills in the first time you see it
const CAT_QUIRKS={sniff:'Sniffs hands',purr:'Purrs',byplant:'Plant buddy',huff:'Had enough'};
function catSaw(k){st.catSeen=st.catSeen||{};st.catSeen[k]=1;}
function trustGain(v){if(st.catDayN!==st.day){st.catDayN=st.day;st.catGain=0;}const room=Math.max(0,.18-(st.catGain||0)),d=Math.min(v,room);if(d<=0)return;
 const before=catTrust();st.catTrust=Math.min(1,before+d);st.catGain=(st.catGain||0)+d;const a=st.catTrust;st.taught=st.taught||{};
 if(before<TRUST_SHY&&a>=TRUST_SHY&&!st.taught.trust1){st.taught.trust1=1;tell(catName()+' lets you pet him now.',{kind:'important',who:'cat'});}
 else if(before<TRUST_FOND&&a>=TRUST_FOND&&!st.taught.trust2){st.taught.trust2=1;tell(catName()+' might nap by '+plantsWord()+' now.',{kind:'important',who:'cat'});}
 else if(before<TRUST_BFF&&a>=TRUST_BFF&&!st.taught.trust3){st.taught.trust3=1;tell(catName()+' adores you.',{kind:'important',who:'cat'});}}
// HAD ENOUGH (Jackie): when he isn't into being touched (shy, or petted too many times) he leaves like a real cat.
// A second of the annoyed look (ears back), then he gets up and walks off at his normal pace to a spot a comfortable way from you and the plants,
// often a higher one. There he sits awake for 30-90 s (back turned, a little grooming, a slow blink), then loafs with his eyes open for a minute or more,
// and only then dozes off. Touch him while he's settling and he calmly moves once more; each move makes the settling take longer. No trust is lost.
const HUFF_FRAMES=()=>['back','groom1','groom2','sit1','loaf1'].map(n=>CATF[n]);
function catLeave(){catSaw('huff');cat.state='annoyed';cat.t=0;cat.pets=0;cat.huff=1;cat.huffN=0;cat.huffFrom=cat.x;sfx('page');}
function huffSpot(){const from=cat.huffFrom??cat.x,pl=[];if(st.started)eachPlant(()=>{if(st.stage>=0){const b=plantBox();pl.push(b.x+b.w/2);}});
 const far=x=>Math.abs(x-from)>=350&&pl.every(px=>Math.abs(x-px)>=220); // not right next to you or a plant
 const high=['crate','books','chair','sill'],ks=Object.keys(CAT_SPOTS).filter(k=>k!=='byplant'&&k!=='rug'&&k!==cat.spot&&catSpotFree(k,HUFF_FRAMES())&&far(CAT_SPOTS[k].x));
 const bag=ks.flatMap(k=>high.includes(k)?[k,k,k]:[k]); // often somewhere a bit higher
 if(bag.length)return bag[Math.floor(Math.random()*bag.length)];
 const r=CAT_SPOTS.rug,fx=from<835?FLOOR_X1:FLOOR_X0,x=floorX({...r,x:fx}); r.x=x??fx; return 'rug';} // nowhere up high: the far end of the rug
function huffWalk(){catSaw('huff');cat.huffN=(cat.huffN||0)+1;cat.huffFrom=cat.x;catGo(huffSpot());cat.huff=1;}
function huffSettle(){cat.state='settle';cat.t=0;cat.huffF='back';const n=cat.huffN||1;cat.awake=n>1?Math.max(rnd(30,90)*(1+.35*(n-1)),(cat.awake||0)+10):rnd(30,90);fplay('cat_settle');} // each extra move: a little longer before he's open to pets
function petCat(){const tr=catTrust();const b=catBox();
 // he always answers a touch (Jackie, Nov 7): walking, he stops for a moment (a purr and a heart once he trusts you, a little 'hmm' while shy); had enough, a flick of the tail ('hmm') and he keeps going
 if(cat.state==='walk'||cat.state==='annoyed'||(cat.shyT||0)>0){const warm=tr>=TRUST_SHY&&cat.state!=='annoyed';sfx(warm?'purr':'hmm');
  if(cat.state==='walk')cat.pauseT=.9;if(warm&&b){burst('heart',b.x+b.w/2,b.y,1);trustGain(.01);}return;}
 if(cat.state==='settle'||cat.state==='loafwake'){huffWalk();return;} // still settling: he calmly moves once more (no penalty)
 if(tr<TRUST_SHY){ // shy: only says hi when it's awake, and only once
  if(cat.state==='sleep'||cat.state==='pet'||cat.state==='sniff'){catLeave();tell(catName()+' is still shy. Let him nap.',{kind:'teach',key:'catShy'});return;}
  cat.state='sniff';cat.t=0;catSaw('sniff');trustGain(.06);tell(catName()+' sniffs your hand. A start.',{kind:'teach',key:'catSniff',who:'cat'});return;}
 const max=tr>=TRUST_FOND?3:1;if(cat.pets>=max){catLeave();return;} // enough for now: it wanders off, no penalty
 cat.state='pet';cat.t=0;cat.pets++;cat.belly=!OLD_CAT&&tr>=TRUST_BFF&&Math.random()<.35; // very trusting: sometimes rolls belly-up for a tummy scratch
sfx('purr');fplay('cat_purr');if(b)burst('heart',b.x+b.w/2,b.y,tr>=TRUST_FOND?2:1);trustGain(tr>=TRUST_FOND?.03:.04);
 if(cat.spot==='byplant'&&st.stage>=4){const pb=plantBox();burst('heart',pb.x+pb.w*.15,pb.y-20,1);st.listen=2;st.needs.attention=Math.max(0,st.needs.attention-.15);}
 catSaw('purr');tell('Purr.',{kind:'teach',key:'cat'});}
