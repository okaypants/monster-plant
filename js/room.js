'use strict';
/* Room: room pictures, seasons, curtains, lamps, light & time of day, spots, hotspots, and drawing each frame. */
const room=img('room_day.png');
// ROOM STATES (Jackie's 15-image package, each an edit of her default): whole-room swap per time of day + layered pieces
const TIMES=['day','golden','night'],ROOMS={},LOFF={},CURTS={};
for(const t of TIMES){ROOMS[t]=img('room_'+t+'.png');LOFF[t]={floor:img(t+'_floorlamp_off.png'),desk:img(t+'_desklamp_off.png')};CURTS[t]=img(t+'_curtains_closed.png');}
const WIN_SEASON={day:{summer:img('day_window_summer.png'),spring:img('day_window_spring.png'),autumn:img('day_window_autumn.png'),winter:img('day_window_winter.png')},night:{winter:img('night_window_winter.png')}};
const STOOL_EMPTY=img('stool_empty.png');
// exact mixed-lamp rooms from Jackie (used instead of the soft cut-outs when present). key: time + '_' + floor(on/off) + desk(on/off)
const MIX={golden_onoff:img('room_golden_floorOn_deskOff.png'),golden_offon:img('room_golden_floorOff_deskOn.png'),golden_offoff:img('room_golden_floorOff_deskOff.png'),day_c_onoff:img('room_day_closed_floorOn_deskOff.png'),day_c_offon:img('room_day_closed_floorOff_deskOn.png'),day_offoff:img('room_day_floorOff_deskOff.png'),golden_c_offoff:img('room_golden_closed_floorOff_deskOff.png')}; // _c_ = curtains closed
function timeKey(){if(st.night)return 'night';const p=phase(st.dayT);return p==='golden hour'||p==='dusk'?'golden':p==='night'?'night':'day';}
let SEASON_OVERRIDE=null; // debug: force a season (window and seasonal items); null = from the calendar
function seasonNow(){if(SEASON_OVERRIDE)return SEASON_OVERRIDE;const m=new Date().getMonth();return m>=2&&m<=4?'spring':m>=5&&m<=7?'summer':m>=8&&m<=10?'autumn':'winter';}
const CURT_AT={x:244,y:30},CURT_L=248,CURT_R=668,CURT_MID=456; // closed curtains cut from Jackie's closed-curtain edit (fabric pixels only)
/* ---------- world ---------- */
// spots in native room coordinates (base = where the pot bottom sits)
// placement (Jackie): seedlings on the windowsill or desk; babies on the milk crate or book stack; grown plants on the floor. Drag the plant to move it.
// SURFACE LINES (Nov 3, from the positioning audit): the row a pot's (or the cat's) lowest solid pixel rests on, read from the room art.
// windowsill front edge, front of the desk top, front of the book on the milk crate, front of the top book's cover, the armchair seat, the cat bed's rim, the floor in front of the rug.
// On the rug any y is floor (back 790 to front 918). Small per-species and per-frame fixes live in NUDGE (js/nudges.js).
const SURFACE={sill:539/* the top of the windowsill ledge, its orange front edge (room art: frame band y 520-537, ledge front 540-565); 539 keeps the seedling pots steady between frames */,desk:536/* on the desktop, just behind its front edge (room art: back edge y 522, top surface 523-541, front apron 542-558) */,crate:639,books:652,chair:656,bed:888,floor:925};
const SPOT={sill:{x:400,y:SURFACE.sill}/* the open middle of the ledge; the armchair covers it right of x 478 */,desk:{x:1268,y:SURFACE.desk}/* between the radio and the desk lamp, in its pool of light */,crate:{x:338,y:SURFACE.crate},books:{x:978,y:SURFACE.books},rugL:{x:300,y:918,name:'by the window'},rugC:{x:545,y:918,name:'by the armchair'},rugR:{x:1250,y:918,name:'by the desk'}}; // grown spots sit at the front edges so the carafe, books, snacks and curtains stay reachable
const GROUPS={seed:['sill','desk'],baby:['crate','books'],grown:['rugL','rugC','rugR']};
SPOT.chair={x:628,y:SURFACE.chair,name:'in the armchair'};
// WHERE EACH AGE FITS (Jackie, Nov 4): kids and teens can stand on the floor too, or sit on the crate or the book stack; adults are too big
// for those and stand on the floor. Teens and adults can also sit in the armchair awake (any age can nap there). st.perch = the furniture, or null = the floor.
const PERCH={kid:['crate','books'],teen:['crate','books','chair'],adult:['chair']};
/* ---------- light & time ---------- */
function phase(t){return t<.25?'morning':t<.5?'midday':t<.7?'golden hour':t<.85?'dusk':'night';}
function daylight(t){if(t<.25)return .55+t*1.6;if(t<.5)return .95;if(t<.7)return .95-(t-.5)*1.5;if(t<.85)return .65-(t-.7)*3.4;return .06;}
const SPARKLE_SC=.35; // half the old size
const FLOOR_BACK=790,FLOOR_FRONT=918,FLOOR_X0=200,FLOOR_X1=1460;
/* PERSPECTIVE (Nov 4): ONE scale curve for everything. A spot's depth is the row where its furniture touches the floor
   (the armchair's feet, the book stack's bottom...), not the surface the plant sits on; on the rug it's the plant's own row.
   Scale falls in a straight line toward the horizon: 100% at the front of the rug (918), smallest at the back wall (748).
   HORIZON is set so the armchair (766) comes out at the 66% Jackie OK'd for plants asleep in it. Measured from room_day.png. */
const HORIZON=464,DEPTH_FRONT=918,DEPTH_BACK=748;
const DEPTH={sill:748/* the wall under the windowsill */,desk:766/* desk legs */,crate:777/* crate bottom */,books:767/* book stack bottom */,chair:766/* armchair feet */,bed:927/* cat bed bottom */,floor:925/* floor in front of the rug */};
function depthK(d){return clamp((d-HORIZON)/(DEPTH_FRONT-HORIZON),(DEPTH_BACK-HORIZON)/(DEPTH_FRONT-HORIZON),1);}
function spotDepth(k){return DEPTH[k]??(SPOT[k]?SPOT[k].y:DEPTH_FRONT);} // rug spots ('free', rugL/C/R): their own floor row
/* NEVER SHARING A SPACE (Jackie, Nov 4): "I never want them sharing a space or on top of each other." A plant may only go where its sprite
   wouldn't overlap any other plant's (the side 15% of each box is mostly empty leaves, so it doesn't count). */
function boxAt(perch,x,y){const p0=st.perch,f0=st.free;st.perch=perch;if(!perch)st.free={x,y};
 try{return plantBoxRaw();}finally{st.perch=p0;st.free=f0;if(f0)SPOT.free={x:f0.x,y:f0.y,name:''};}} // where this plant's sprite would be on that perch (null = the floor at x,y)
function boxesOverlap(a,b){const ia=a.w*.15,ib=b.w*.15;return a.x+ia<b.x+b.w-ib&&b.x+ib<a.x+a.w-ia&&a.y<b.y+b.h&&b.y<a.y+a.h;}
function spaceFree(perch,x,y){const me=boxAt(perch,x,y);return otherPos().every(q=>!q.box||!boxesOverlap(me,q.box));}
function freeClear(x,y){return spaceFree(null,x,y);} // a clear bit of floor: side by side, never in front of or behind another plant
// the clear floor spot nearest (x,y), searching the whole rug; null if there's none
function nearestClearFloor(x,y){const c=[];for(let fx=FLOOR_X0;fx<=FLOOR_X1;fx+=20)for(let fy=FLOOR_BACK;fy<=FLOOR_FRONT;fy+=16)c.push([fx,fy,Math.hypot(fx-x,(fy-y)*2)]);
 c.push([Math.round(clamp(x,FLOOR_X0,FLOOR_X1)),Math.round(clamp(y,FLOOR_BACK,FLOOR_FRONT)),-1]);c.sort((a,b)=>a[2]-b[2]);
 for(const[fx,fy]of c)if(freeClear(fx,fy))return {x:fx,y:fy};return null;}
function defaultFree(){const r=st.place&&SPOT[st.place.grown]?st.place.grown:({sun:'rugL',shade:'rugR',night:'rugR'}[st.pref]||'rugC');
 const c=[r,'rugL','rugC','rugR'].map(k=>[SPOT[k].x,SPOT[k].y]).concat([[400,800],[700,800],[1300,800],[1000,860]]);for(const[x,y]of c)if(freeClear(x,y))return {x,y};return {x:c[0][0],y:c[0][1]};}
function perchTaken(k){return otherPos().some(q=>q.k===k)||(k==='chair'&&chairId!=null&&chairId!==st.id);} // one plant per piece of furniture (a napper in the armchair counts)
function spotKey(){const gp=stageGroup();st.place=st.place||{};
 if(gp!=='seed'){const a=ageName();
  if(st.perch===undefined)st.perch=a==='kid'?kidDefault():null; // old saves and new kids: a kid starts on the crate or book stack, a teen or adult on the floor
  if(st.perch&&!PERCH[a].includes(st.perch))st.perch=null; // grew too big for it: down to the floor
  if(st.perch)return st.perch;
  if(!st.free)st.free=defaultFree();SPOT.free={x:st.free.x,y:st.free.y,name:''};return 'free';}
 const k=st.place[gp];if(GROUPS[gp].includes(k))return k;
 const hid=k=>otherPos().some(q=>q.k==='free'&&Math.abs(q.x-SPOT[k].x)<260); // a plant standing on the floor in front would hide a new seed
 const def={seed:hid('sill')&&!hid('desk')?'desk':'sill',baby:'books'}[gp],taken=otherPos().filter(q=>q.g===gp).map(q=>q.k),pick=taken.includes(def)?(GROUPS[gp].find(x=>!taken.includes(x))||def):def;st.place[gp]=pick;return pick;}
function kidDefault(){const k=st.place.baby;if(GROUPS.baby.includes(k)&&!perchTaken(k))return k;return GROUPS.baby.find(x=>!perchTaken(x))||null;} // the book stack or crate, whichever is free (else the floor)
function spotLight(){return spotInfo(spotKey()).L;} // light zones live in light.js
function nudgeSun(){if(st.night||st.mode==='ambient')return;st.dayT=Math.min(.7,st.dayT+.055);}
/* ---------- props (code placeholders) ---------- */
// hotspots on the v2 room art: carafe on the stool = water; SNACKS box = all treats; gummies + peat moss on the shelf = those treats
const CAN={x:772,y:494,w:118,h:110},JAR={x:1478,y:568,w:150,h:170},GUMMY={x:-99,y:-99,w:1,h:1},PEAT={x:-99,y:-99,w:1,h:1},LAMP={x:1272,y:390,w:150,h:140},FLOOR={x:145,y:255,w:155,h:570},SHELF={x:1474,y:318,w:170,h:84},CHAIR={x:445,y:455,w:300,h:300},WIN={x:300,y:80,w:290,h:450};
function drawCarafe(x,y){ // carried glass carafe (code stand-in until ChatGPT draws the carried version)
 g.save();g.translate(x,y);g.rotate(-.5);g.scale(1.6,1.6);const o=C.out;
 g.fillStyle=o;g.fillRect(-16,-46,32,10);g.fillRect(-26,-36,52,62);g.fillRect(-10,-58,20,14);
 g.fillStyle='#e6f1f4';g.fillRect(-22,-32,44,54);g.fillRect(-6,-54,12,10);g.fillRect(-12,-44,24,10);
 g.fillStyle='#9fd0e0';g.fillRect(-22,-6,44,28);g.fillStyle='#fff';g.fillRect(-18,-28,6,18);g.restore();}
function drawCan(x,y,rot){g.save();g.translate(x+45,y+70);g.rotate(rot);g.translate(-45,-70);
 g.fillStyle=C.out;g.fillRect(10,22,56,48);g.fillStyle=C.blue;g.fillRect(14,26,48,40);g.fillStyle='#81c290';g.fillRect(16,28,12,36);g.fillStyle='#225783';g.fillRect(52,28,8,38);
 g.fillStyle=C.out;g.fillRect(64,34,22,8);g.fillRect(80,24,8,14);g.fillRect(20,8,36,6);g.fillRect(20,8,6,18);g.fillRect(50,8,6,18);g.restore();}
function drawJar(x,y,lid){g.fillStyle=C.out;g.fillRect(x,y+16,60,64);g.fillStyle='#c8e0e8';g.fillRect(x+4,y+20,52,56);g.fillStyle=C.wine;g.fillRect(x+8,y+44,44,30);g.fillStyle=C.brick;g.fillRect(x+12,y+48,10,10);g.fillRect(x+30,y+56,8,8);g.fillStyle='#fff';g.fillRect(x+8,y+24,6,14);
 g.fillStyle=C.out;g.fillRect(x-4,y+2+lid,68,16);g.fillStyle=C.fl2;g.fillRect(x,y+6+lid,60,8);}
let curK=0; // 0 open .. 1 closed, eased
function drawCurtains(k){const CURT=CURTS[timeKey()];if(k<.01||!ok(CURT))return;const e=Math.round(k*12)/12; // eased; each side's leading edge sweeps to the middle like the fabric drawing shut
 const lw=(CURT_MID-CURT_L)*e,rw=(CURT_R-CURT_MID)*e;
 g.save();g.beginPath();g.rect(CURT_L-8,0,lw+8,H);g.rect(CURT_R-rw,0,rw+8,H);g.clip();g.drawImage(CURT,CURT_AT.x,CURT_AT.y);g.restore();}
let dtDraw=.016,lastDraw=performance.now();
function draw(){const nowD=performance.now();dtDraw=Math.min(.1,(nowD-lastDraw)/1000);lastDraw=nowD;g.clearRect(0,0,W,H);const tk=timeKey(),fOn=st.lamp!==false,dOn=st.desk!==false,lk=(fOn?'on':'off')+(dOn?'on':'off'),mxc=st.curtain==='closed'&&curK>.98?MIX[tk+'_c_'+lk]:null,exactC=!!(mxc&&ok(mxc)),mx2=exactC?mxc:MIX[tk+'_'+lk],exact=!!(mx2&&ok(mx2)),rm=exact?mx2:ROOMS[tk];if(ok(rm))g.drawImage(rm,0,0);else if(ok(room))g.drawImage(room,0,0);
 if(!exactC){const ws=(WIN_SEASON[tk]||{})[seasonNow()];if(ws&&ok(ws))g.drawImage(ws,318,88);}
 if(!exact&&st.lamp===false&&ok(LOFF[tk].floor))g.drawImage(LOFF[tk].floor,0,0);
 if(!exact&&st.desk===false&&ok(LOFF[tk].desk))g.drawImage(LOFF[tk].desk,831,0);
 if(held.tool==='can'&&ok(STOOL_EMPTY))g.drawImage(STOOL_EMPTY,765,488);
 fidgetDrawProps(rm);
 drawPlacard(tk+'|'+lk+'|'+exact+'|'+exactC+'|'+Math.round(curK*4)); // the JOURNAL nameplate on the desk drawers, lit like the wood around it
 curK+=((st.curtain==='closed'?1:0)-curK)*Math.min(1,dtDraw*5);if(curK>.01&&!exactC)drawCurtains(curK);
 
 const dl=daylight(st.dayT);
 if(lightMap&&st.started)drawLightMap(); // debug only: under the plants and cat
 // SIMPLE RULE (Jackie: web + DS friendly): frame swaps and whole-pixel moves only; no fades, rotation, gradients or smooth scaling
 let b=null;
 if(drag.on){const gp=stageGroup();for(const k of gp==='seed'?GROUPS.seed:PERCH[ageName()].filter(k=>!perchTaken(k))){const sp=SPOT[k],pulse=Math.floor(T*2)%2?.35:.22;g.fillStyle=`rgba(255,240,200,${pulse})`;g.beginPath();g.ellipse(sp.x,sp.y-4,k==='chair'?110:gp==='seed'?44:70,12,0,0,Math.PI*2);g.fill();}}
 if(st.started)drawBugNote(); // Doctor Bug's note on the sill, behind plants and the cat
 if(st.started){for(const q of parts)if(q.k==='drop')fx('drops',q.x,q.y,6);
  const L=[];eachPlant(i=>{if(st.stage>=0)L.push({i,y:baseY()});});L.sort((p,q)=>p.y-q.y);let catDone=false;
  for(const e of L){if(!catDone&&cat.y<e.y){drawCat();catDone=true;}if(e.i<0)drawOnePlant();else{swapIn(e.i);try{drawOnePlant();}finally{swapIn(e.i);}}}
  if(!catDone)drawCat();}
 function drawOnePlant(){let b;const pb=plantBox();
  if(st.puddleLv)fx('puddle',pb.x+pb.w/2,baseY()-12,1.5,0,FX_SCALE*clamp(pb.w/220,.5,1.7)*[0,.55,.8,1][st.puddleLv]); // too much water: a puddle under the pot that dries in 3 steps
  b=drawPlant();if(inChair()&&ok(rm))for(const[x,y,w,h]of CHAIR_FRONT)g.drawImage(rm,x,y,w,h,x,y,w,h);
  const cx=b.x+b.w/2,top=b.y;
  // each reaction has its own slot around the plant, outside its outline (Jackie: no overlaps, more space)
  const base=baseY(),M=34,vh=inChair()?b.h:Math.max(b.h,440),vt=base-vh; // small plants get a taller virtual box so slots never stack
  const sz=n=>{const f=FX[n][0];return ok(f)?[f.naturalWidth*FX_SCALE,f.naturalHeight*FX_SCALE]:[0,0];};
  const slot=(n,where,rate,ph=0,sc)=>{const[w,h]=sc?[sz(n)[0]/FX_SCALE*sc,sz(n)[1]/FX_SCALE*sc]:sz(n);let x,y;
   if(where==='ul'){x=b.x-M-w/2;y=vt+h/2;}else if(where==='ur'){x=b.x+b.w+M+w/2;y=vt+h/2;}
   else if(where==='ml'){x=b.x-M-w/2;y=vt+vh*.5;}else if(where==='mr'){x=b.x+b.w+M+w/2;y=vt+vh*.5;}
   else if(where==='ll'){x=b.x-M*.5-w/2;y=base-h/2;}else if(where==='lr'){x=b.x+b.w+M*.5+w/2;y=base-h/2;}
   else if(where==='think'){x=b.x+b.w+w*.32;y=Math.min(top,vt+40)+h*.15;}
   else if(where==='zzz'){x=b.x+b.w+w*.2;y=Math.min(top,vt+40)+h*1.4;}
   else if(where==='side'){x=b.x+b.w-w*.1;y=b.y+b.h*.3;} // tucked against its upper right side, half on the plant
   else if(where==='topL'){x=cx-w*.75;y=top-M*.6-h/2;}else if(where==='topR'){x=cx+w*.75;y=top-M*.6-h/2;}
   fx(n,x,y,rate,ph,sc);};
  if(st.glare===2){fx('flames',cx,top-14-sz('flames')[1]/FX_SCALE*.27/2,5,0,.27);}
  if((st.nap>0||st.night)&&st.stage>=4){const[w,h]=[sz('zzz')[0]/FX_SCALE*.5,sz('zzz')[1]/FX_SCALE*.5];sleepZ('p'+st.id,b.x+b.w+w*.2,Math.min(top,vt+40)+h*1.4,.5);} // only plants whose eyes can close (elders' face kit); babies have their eyes drawn in // Zzz only when actually asleep (eyes closed); too dark = hunching smaller only
  if(st.listen>0)slot('sparkles','side',3,0,SPARKLE_SC); // smaller and close in (Jackie): it was as big as a kid's face and drifted onto the next plant
  if(st.over>0&&st.overType!=='water'&&!(st.listen>0))slot('sweat','mr',2);
  // thirst = fading to gray only (Jackie: no dust/crack marks)
 }
 if(typeof dbgFxDraw==='function')dbgFxDraw(); // debug: effect previews
 fidgetDrawTop();
 for(const q of parts){if(q.k==='heart')fx('hearts',q.x,q.y,3,0,.5);else if(q.k==='drop'){}else{g.fillStyle=q.c;g.fillRect(q.x|0,q.y|0,6,6);}}
 if(lightMap&&st.started)drawLightTags(); // debug only: labels and legend on top
 if(typeof depthLines!=='undefined'&&depthLines&&st.started)drawDepthLines(); // debug only: each spot's depth and size
 const ph=phase(st.dayT);
 if(held.tool){const x=mx|0,y=my|0;
  if(held.tool==='can')drawCarafeHeld(x,y);
  else if(held.tool==='snack'){drawCarried(TREAT_IMG[held.item.id],x,y,.4*overK(x,y));}
  else{const k=overK(x,y),R=(a,b,c,d)=>g.fillRect(Math.round(x+a*k),Math.round(y+b*k),Math.round(c*k),Math.round(d*k)); // a book, sized for the depth it's held at
   g.fillStyle=C.out;R(-28,-36,56,72);g.fillStyle={fairy:C.coral,almanac:C.blue,nonsense:C.fl3,grimoire:'#2d1824'}[held.item.id];R(-24,-32,48,64);g.fillStyle=C.ivory;R(-16,-20,32,4);}}
}
