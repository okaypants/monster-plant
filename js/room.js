'use strict';
/* Room: room pictures, seasons, curtains, lamps, light & time of day, spots, hotspots, and drawing each frame. */
/* THE ROOM (Jackie, Nov 18): one picture of the room, drawn once in daylight with every lamp off (room2.png; its window panes are
   see-through). Each thing you can touch is its own picture (obj_*.png), placed on top. Golden hour, night, the lamps and shut
   curtains are light worked out here from that one picture (RULES 1: light itself may blend), so every thing in the room is lit the
   same way whatever state it is in. tools/room_build.py makes the pictures from art_src/room2/. */
const ROOM2=img('room2.png'),CURT2=img('curtains2.png');
const OBJ={};'frame frame_tilt frame_blink frame_glow cup coin trunk_open ball2 ball3 ball4 ball5 moon1 moon2 moon3 moon4 moon5 nocrate bass bass_bed cup_open'.split(' ').forEach(n=>OBJ[n]=img('obj_'+n+'.png'));
/* Almost everything is painted into the room (Jackie, Nov 18). These few are their own pictures, drawn on top: the cat's framed picture in the bookcase (the wind-up cat
   painted into the room is taken out of its cubby, and the frame stands there), the cup you carry, and the faces that change: the moon dial's phase, the crystal
   ball's mist, the trunk's lifted lid. Each has its name, the picture it shows right now (none = nothing drawn), and where the
   middle of its bottom edge rests. */
const THINGS=[{n:'frame',x:97,y:438,pic:()=>typeof framePic==='function'?framePic():'frame'},{n:'cup',x:982,y:620,pic:()=>null}, /* no cup stands under the taps: it appears in your hand when you tap the water cooler (Jackie, Nov 25) */
 
 {n:'moon',x:1355,y:367,pic:()=>moonDialPic()},{n:'ball',x:1561,y:299,pic:()=>ballPic()},{n:'trunk',x:1562,y:479,pic:()=>thingOpen('trunk')?'trunk_open':null},
 {n:'cupboard',x:1563,y:738,pic:()=>typeof cubIsOpen==='function'&&cubIsOpen()?'cup_open':null},
 {n:'nocrate',x:338,y:786,pic:()=>bassinetOut()?'nocrate':null},{n:'bass',x:338,y:778,pic:()=>bassinetOut()?(bassAsleep()?'bass_bed':'bass'):null}];
const thingBy=n=>THINGS.find(t=>t.n===n);
/* THE BASSINET (Jackie, Nov 23): while a monster is young (a seed, a sprout or a kid) the bassinet stands where the milk crate does, and
   the crate comes back when nobody is young any more. It is seen from the front, its hood at the back, so whoever sits in it is framed by the hood. A young one sits in it as it would on the crate; when the one in it is asleep
   its blanket is up. A teen or adult already sitting on the crate keeps the crate, and so does the cat asleep on it. */
const isYoung=q=>q.stage>=0&&q.stage<6;
function bassinetOut(){if(typeof st==='undefined'||!st.started)return false;const P=allRaw();if(!P.some(isYoung))return false;
 if(P.some(q=>q.stage>=6&&q.perch==='crate'))return false;return !(typeof cat!=='undefined'&&cat.spot==='crate'&&cat.state==='sleep');}
const bassIn=q=>isYoung(q)&&(q.stage<4?(q.place||{}).seed==='crate':q.perch==='crate')&&!(drag.on&&drag.id===q.id); // sitting in it right now
function bassAsleep(){return allRaw().some(q=>bassIn(q)&&(q.nap>0||st.night));}
const CAT_BED_FRONT=[1462,838,208,98],CAT_BED_HOLLOW=[1562,838,64,22]; // the cat bed's front rim: the lower half of the bed, outside the oval of its hollow
const BASS_FRONT=[[236,652,206,126]],BASS_FRONT_BED=[[236,652,206,126],[262,643,152,9]]; // its front rail (and the blanket's top edge), drawn again over whoever sits in it
// a thing that opens (the jar's lid, the lockbox, the trunk, the viewer's lever) stays open for a moment after a tap
const thingOpenT={};function thingOpen(n){return (thingOpenT[n]||0)>performance.now();}function openThing(n,ms=900){thingOpenT[n]=performance.now()+ms;}
function thingMoving(n){const p=typeof FP!=='undefined'&&FP.find(q=>q.thing===n);return !!(p&&(Math.round(p.ox)||Math.round(p.oy)));} // bouncing: its own picture is drawn moved (js/fidgets.js)
function moonDialPic(){const ahead=typeof moonDialAt==='function'?moonDialAt():null,f=typeof moonAge==='function'?moonAge(ahead??undefined)/MOON_MONTH:0; // tonight's moon, or the night the dial has been turned on to (js/fidgets.js) // the five drawn faces: waning crescent, full, gibbous, quarter, waxing crescent
 return f<.06||f>.94?'moon1':f<.2?'moon5':f<.32?'moon4':f<.44?'moon3':f<.56?'moon2':f<.7?'moon3':f<.82?'moon4':'moon1';}
function ballPic(){const f=typeof ballFrame==='function'?ballFrame():1;if(f<=1)return null;const t=typeof ballTint==='function'?ballTint():null;return t?ballTinted(f,t):'ball'+f;} // the crystal ball's mist (js/fidgets.js); clear = the ball as painted
function thingBox(t){const n=t.pic(),im=n&&OBJ[n];if(!im||!ok(im))return null;return {x:t.x-Math.round(im.naturalWidth/2),y:t.y-im.naturalHeight,w:im.naturalWidth,h:im.naturalHeight,im};}
const roomReady=()=>ok(ROOM2);
const mkCv=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return c;};
// the room in daylight with everything in its place: redrawn only when a thing changes its picture
let dayCv=null,dayKey='';
function sceneDay(){if(!roomReady())return null;const key=THINGS.map(t=>thingMoving(t.n)?'~':t.pic()||'-').join(',')+'|'+Object.values(OBJ).filter(ok).length;if(dayCv&&key===dayKey)return dayCv;
 dayCv=dayCv||mkCv();dayKey=key;const x=dayCv.getContext('2d');x.clearRect(0,0,W,H);x.drawImage(ROOM2,0,0);
 for(const t of THINGS){if(thingMoving(t.n))continue;const b=thingBox(t);if(b)x.drawImage(b.im,b.x,b.y);}dayCv.src='day|'+key;return dayCv;}
/* THE LIGHT. Each time of day is one flat tint over the whole room. A lamp that is on gives back the daytime colours, a little
   warmer: strongest by the lamp and fading smoothly away, and a little over the whole room; its shade glows. Shut curtains dim the daytime a touch. */
const GRADE={day:null,golden:'rgb(255,206,158)',night:'rgb(92,104,178)'},GRADE_SHUT={day:'rgb(226,220,208)',golden:'rgb(232,190,150)',night:'rgb(86,98,170)'};
const LAMP_K={day:.0,golden:.55,night:1}; // how much a lamp's glow shows: nothing to add in daylight
const LAMP_ROOM=.2,LAMP_ROOM_MAX=.5,LAMP_REACH=2.1,LAMP_FALL=[[0,.95],[.18,.86],[.4,.56],[.65,.26],[.85,.08],[1,0]],LAMP_WARM='rgb(255,240,214)',lampCv=[]; // each lamp's lift to the whole room and its cap; how far its own light reaches (times its radius) and how it fades; the warmth of lamp light
const GLOWS={lamp:{x:236,y:600,r:400,shade:[231,360,97,112],seed:[230,360]},desk:{x:1320,y:610,r:350,shade:[1318,446,50,44]},wall:{x:980,y:400,r:300,shade:[980,207,58,37],seed:[980,205]}}; // key = the lamp's on/off field in the save
function lampsKey(){return LAMPS.map(p=>lampOn(p)?'1':'0').join('');}
const litCvs=new Map();
// any whole-room layer (the room itself, the closed curtains) lit for right now
function litLayer(name,src,srcKey){if(!src)return null;const tk=timeKey(),shut=st.curtain==='closed'&&curK>.5,key=srcKey+'|'+tk+'|'+lampsKey()+'|'+(shut?1:0);let e=litCvs.get(name);
 if(e&&e.key===key)return e.c;const c=e?e.c:mkCv(),x=c.getContext('2d');x.globalCompositeOperation='source-over';x.globalAlpha=1;x.clearRect(0,0,W,H);x.drawImage(src,0,0);
 const tint=(shut?GRADE_SHUT:GRADE)[tk];if(tint){x.globalCompositeOperation='multiply';x.fillStyle=tint;x.fillRect(0,0,W,H);}
 /* LAMP LIGHT (Jackie, Nov 25: "Lighting is not smooth and looks super weird. Entire room is not lit at night at all"). A lamp that is on
    does two things. It lifts the whole room a little toward its daytime colours, and more with each lamp, so a room with its lamps on is a
    lit room. And around the lamp itself the light is strongest and fades away smoothly with distance (RULES 1: light itself may blend):
    no rings and no edge. The light is a mask (how lit each bit of the room is) and the warm daytime room is laid over the night room through it. */
 const k=LAMP_K[tk],on=LAMPS.filter(p=>lampOn(p)&&GLOWS[p.key]);
 if(k>0&&on.length){const mk=lampCv[0]=lampCv[0]||mkCv(),mx=mk.getContext('2d');mx.globalCompositeOperation='source-over';mx.clearRect(0,0,W,H);
  mx.globalAlpha=1;mx.fillStyle='rgba(255,255,255,'+(k*Math.min(LAMP_ROOM_MAX,LAMP_ROOM*on.length)).toFixed(3)+')';mx.fillRect(0,0,W,H);
  for(const p of on){const G=GLOWS[p.key],R=G.r*LAMP_REACH,gr=mx.createRadialGradient(G.x,G.y,0,G.x,G.y,R);
   for(const[at,a]of LAMP_FALL)gr.addColorStop(at,'rgba(255,255,255,'+(a*k).toFixed(3)+')');mx.fillStyle=gr;mx.fillRect(G.x-R,G.y-R,R*2,R*2);}
  const wm=lampCv[1]=lampCv[1]||mkCv(),wx=wm.getContext('2d');wx.globalCompositeOperation='source-over';wx.globalAlpha=1;wx.clearRect(0,0,W,H);wx.drawImage(src,0,0);
  wx.globalCompositeOperation='multiply';wx.fillStyle=LAMP_WARM;wx.fillRect(0,0,W,H);wx.globalCompositeOperation='destination-in';wx.drawImage(mk,0,0);wx.globalCompositeOperation='source-over';
  x.globalCompositeOperation='source-over';x.globalAlpha=1;x.drawImage(wm,0,0);}
 for(const p of on){const G=GLOWS[p.key],sm=name==='room'?shadeMask(p.key,src):null;if(sm){const[sx,sy,sw,sh]=G.shade;x.globalAlpha=1;x.globalCompositeOperation='source-over';x.drawImage(sm.day,sx-sw,sy-sh);
   x.globalCompositeOperation='lighter';x.globalAlpha=tk==='day'?.14:.24;x.drawImage(sm.warm,sx-sw,sy-sh);x.globalAlpha=1;}}
 x.globalCompositeOperation='destination-in';x.globalAlpha=1;x.drawImage(src,0,0);x.globalCompositeOperation='source-over'; // only the layer's own pixels: the window panes stay see-through
 c.src=name+'|'+key;litCvs.set(name,{key,c});return c;}
// a lamp's shade alone (its pale pixels inside GLOWS.shade), in daylight colours and as a flat warm shape to brighten it with: made once per lamp
const shadeMasks={};
function shadeMask(k,src){if(shadeMasks[k])return shadeMasks[k];const G=GLOWS[k],[sx,sy,sw,sh]=G.shade,w=sw*2,h=sh*2,mk=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
 const day=mk(),dx=day.getContext('2d');dx.drawImage(src,sx-sw,sy-sh,w,h,0,0,w,h);let d;try{d=dx.getImageData(0,0,w,h);}catch(e){return null;}const D=d.data;
 /* WHICH PIXELS ARE THE SHADE (Jackie, Nov 25: the floor lamp's glow ran onto the curtain beside it, and the wall lamp's lower corners stayed dim).
    Where a lamp names a point inside its shade (seed), the shade is everything reached from there without crossing its dark outline, so it is
    the whole shade whatever its shape and never what is next to it. Without one (or if that spills out), it is the oval, as before. */
 let inside=null;if(G.seed){const open=o=>D[o+3]>0&&D[o]+D[o+1]+D[o+2]>300,m=new Uint8Array(w*h),q=[(G.seed[1]-(sy-sh))*w+(G.seed[0]-(sx-sw))];let n=0;
  while(q.length){const i=q.pop();if(i<0||i>=w*h||m[i]||!open(i*4))continue;m[i]=1;n++;const xx=i%w;if(xx>0)q.push(i-1);if(xx<w-1)q.push(i+1);q.push(i-w,i+w);}
  if(n>50&&n<w*h*.8)inside=m;}
 let whole=null;if(inside){whole=mk();const hx=whole.getContext('2d'),hd=hx.createImageData(w,h);for(let i=0;i<w*h;i++){let on=0;const xx=i%w,yy=(i-xx)/w;for(let b=-3;b<=3&&!on;b++)for(let a=-3;a<=3;a++){const x2=xx+a,y2=yy+b;if(x2>=0&&x2<w&&y2>=0&&y2<h&&inside[y2*w+x2]){on=1;break;}}hd.data[i*4+3]=on?255:0;}hx.putImageData(hd,0,0);} // the shade with its outline: everything within 3 px of its inside
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const o=(j*w+i)*4,inS=inside?inside[j*w+i]:((i-sw)/sw)**2+((j-sh)/sh)**2<=1,pale=D[o]>200&&D[o+1]>170&&D[o+2]>90;if(!(inS&&pale))D[o+3]=0;}
 dx.putImageData(d,0,0);const warm=mk(),wx=warm.getContext('2d');wx.drawImage(day,0,0);wx.globalCompositeOperation='source-in';wx.fillStyle='rgb(255,214,140)';wx.fillRect(0,0,w,h);
 return shadeMasks[k]={day,warm,whole};}
// a lamp's whole shade cut out of the room as it is lit now, for its idle nudge (js/fidgets.js): {c, x, y}
const shadePieces=new Map();
function shadePiece(k,src){const d=sceneDay(),sm=d&&shadeMask(k,d);if(!sm||!sm.whole)return null;const key=k+'|'+src.src;let p=shadePieces.get(key);if(p)return p;const[sx,sy,sw,sh]=GLOWS[k].shade,c=document.createElement('canvas');c.width=sw*2;c.height=sh*2;
 const x=c.getContext('2d');x.drawImage(sm.whole,0,0);x.globalCompositeOperation='source-in';x.drawImage(src,sx-sw,sy-sh,sw*2,sh*2,0,0,sw*2,sh*2);if(shadePieces.size>40)shadePieces.clear();p={c,x:sx-sw,y:sy-sh};shadePieces.set(key,p);return p;}
function sceneLit(){const d=sceneDay();return d?litLayer('room',d,dayKey):null;}
/* THE WINDOW: what is outside is drawn first, the room goes over it, and the view shows through the panes. One daytime picture per
   season (view_*.png, Jackie's, Nov 18). At golden hour and at night the sky is a flat sunset or night colour and the tree is
   tinted to match; at night tonight's moon is drawn in the clear sky to the right of the tree (js/moon.js). */
const PANES={x:316,y:170,w:256,h:334},SKY={day:'#8fc8ee',golden:'#f6a65c',night:'#0b1640'},VIEW_TINT={golden:'rgb(255,196,140)',night:'rgb(92,104,176)'};
const VIEWS_OUT={},VIEWS_FG={};['spring','summer','autumn','winter'].forEach(n=>{VIEWS_OUT[n]=img('view_'+n+'.png');VIEWS_FG[n]=img('viewfg_'+n+'.png');}); // viewfg: the same view with its sky taken out (tools/room_build.py)
const viewCvs=new Map();
// the tree (and any clouds) tinted for golden hour or night: only its own pixels, made once per season and time
function viewTinted(season,tk){const im=VIEWS_FG[season];if(!ok(im))return null;const key=season+tk;let c=viewCvs.get(key);if(c)return c;c=document.createElement('canvas');c.width=PANES.w;c.height=PANES.h;const x=c.getContext('2d');
 x.drawImage(im,0,0);x.globalCompositeOperation='multiply';x.fillStyle=VIEW_TINT[tk];x.fillRect(0,0,c.width,c.height);x.globalCompositeOperation='destination-in';x.drawImage(im,0,0);viewCvs.set(key,c);return c;}
function drawWindowView(tk){const s=seasonNow(),v=VIEWS_OUT[s];g.fillStyle=SKY[tk];g.fillRect(PANES.x,PANES.y,PANES.w,PANES.h);
 if(tk==='day'){if(ok(v))g.drawImage(v,PANES.x,PANES.y);return;} // daytime: the picture as drawn, its own sky
 if(tk==='night')drawMoon(tk,s); // the moon is behind the tree
 const t=viewTinted(s,tk);if(t)g.drawImage(t,PANES.x,PANES.y);}
function timeKey(){if(st.night)return 'night';const p=phase(st.dayT);return p==='golden hour'||p==='dusk'?'golden':p==='night'?'night':'day';}
let SEASON_OVERRIDE=null; // debug: force a season (window and seasonal items); null = from the calendar
function seasonNow(){if(SEASON_OVERRIDE)return SEASON_OVERRIDE;const m=nowDate().getMonth();return m>=2&&m<=4?'spring':m>=5&&m<=7?'summer':m>=8&&m<=10?'autumn':'winter';}
const CURT_L=244,CURT_R=648,CURT_MID=446; // the closed curtains (curtains2.png, a whole-room layer): each side sweeps to the middle
/* ---------- world ---------- */
// spots in native room coordinates (base = where the pot bottom sits)
// placement (Jackie): seedlings on the windowsill or desk; babies on the milk crate or book stack; grown plants on the floor. Drag the plant to move it.
// SURFACE LINES (Nov 3, from the positioning audit): the row a pot's (or the cat's) lowest solid pixel rests on, read from the room art.
// windowsill front edge, front of the desk top, front of the book on the milk crate, front of the top book's cover, the armchair seat, the cat bed's rim, the floor in front of the rug.
// On the rug any y is floor (back 790 to front 918). Small per-species and per-frame fixes live in NUDGE (js/nudges.js).
const SURFACE={sill:530/* the windowsill ledge (room art: the orange ledge, y 508-535) */,desk:550/* on the desktop, just behind its front edge (room art: top y 535-562) */,crate:660/* the crate's flat top (y 628-668) */,books:800/* on the floor in front of the mini fridge; the key is still 'books' from when a book stack stood by the desk, so old saves keep their place */,chair:653,bed:868/* down in the bed's hollow, on its cushion; the bed's front rim is drawn again over the cat (CAT_BED_FRONT) */,floor:925};
const SPOT={sill:{x:400,y:SURFACE.sill}/* the open middle of the ledge; the armchair covers it right of x 478 */,desk:{x:1268,y:SURFACE.desk}/* between the radio and the desk lamp, in its pool of light */,crate:{x:336,get y(){return bassinetOut()?680:SURFACE.crate}}/* in the bassinet the pot sits down behind the front rail */,books:{x:832,y:SURFACE.books,name:'by the fridge'},rugL:{x:300,y:918,name:'by the window'},rugC:{x:545,y:918,name:'by the armchair'},rugR:{x:1250,y:918,name:'by the desk'}}; // grown spots sit at the front edges so the carafe, books, snacks and curtains stay reachable
const GROUPS={get seed(){return bassinetOut()?['sill','desk','crate']:['sill','desk']}/* a seed or sprout may go in the bassinet too */,baby:['crate','books'],grown:['rugL','rugC','rugR']};
SPOT.chair={x:628,y:SURFACE.chair,name:'in the armchair'};
// WHERE EACH AGE FITS (Jackie, Nov 4): kids and teens can stand on the floor too, or sit on the crate or the book stack; adults are too big
// for those and stand on the floor. Teens and adults can also sit in the armchair awake (any age can nap there). st.perch = the furniture, or null = the floor.
const PERCH={kid:['crate','books','chair'],teen:['crate','books','chair'],adult:['chair']}; // Nov 7: kids may sit in the armchair too
/* ---------- light & time ---------- */
function phase(t){return t<.25?'morning':t<.5?'midday':t<.7?'golden hour':t<.85?'dusk':'night';}
/* THE REAL CLOCK (Jackie, Nov 10): the time of day is the device's own local time, read every frame, never saved as a game clock.
   Sunrise and sunset follow the month (a cozy northern town, daylight saving included). Golden hour = the last hour and a half
   before sunset, dusk = the hour after it, night until sunrise. Debug (test mode) and the tests can hold the clock: st.mode 'actions'. */
const SUN_TIMES=[[7.9,16.9],[7.3,17.6],[7.2,19.2],[6.4,19.9],[5.6,20.6],[5.2,21.1],[5.4,21],[6.1,20.3],[6.8,19.3],[7.5,18.3],[7.1,16.7],[7.8,16.3]]; // [sunrise, sunset] in clock hours, January to December
const GOLDEN_H=1.5,DUSK_H=1;
const nowDate=()=>new Date(Date.now());
function clockLive(){return st.mode!=='actions';}
function sunOf(d){const[r,s]=SUN_TIMES[d.getMonth()];return {rise:r,set:s,gold:s-GOLDEN_H,dusk:s+DUSK_H,mid:r+(s-GOLDEN_H-r)*.3};}
function clockDayT(d=nowDate()){const h=d.getHours()+d.getMinutes()/60+d.getSeconds()/3600,u=sunOf(d),nightLen=u.rise+24-u.dusk;
 if(h<u.rise)return .85+.15*(h+24-u.dusk)/nightLen;if(h<u.mid)return .25*(h-u.rise)/(u.mid-u.rise);if(h<u.gold)return .25+.25*(h-u.mid)/(u.gold-u.mid);
 if(h<u.set)return .5+.2*(h-u.gold)/GOLDEN_H;if(h<u.dusk)return .7+.15*(h-u.set)/DUSK_H;return Math.min(.999,.85+.15*(h-u.dusk)/nightLen);}
function riseAt(d,add=0){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()+add),r=sunOf(x).rise;x.setHours(Math.floor(r),Math.round(r%1*60));return x.getTime();}
// the latest sunrise that has already happened
function lastRise(ms=Date.now()){const d=new Date(ms),t=riseAt(d);return t<=ms?t:riseAt(d,-1);}
// the sunrise a morning at this moment belongs to: today's in the daytime, the coming one in the evening or the night
function morningOf(ms=Date.now()){const d=new Date(ms),h=d.getHours()+d.getMinutes()/60,u=sunOf(d);return h>=u.dusk?riseAt(d,1):riseAt(d);}
// bright hours = morning and midday; golden hour, dusk and night are dim for everyone, so nobody withers or slows down for the evening
function brightHours(t=st.dayT){const p=phase(t);return p==='morning'||p==='midday';}
// each frame: the clock sets the time of day, and once a real sunrise passes, the morning comes by itself (one new day, however long you were away)
function clockTick(){if(!clockLive()||PAUSED)return; // debug's Pause time stops it too (test mode only)
 st.dayT=clockDayT();if(st.lastMorning==null){st.lastMorning=lastRise();return;}
 if(lastRise()>st.lastMorning&&!bubble&&!document.querySelector('.screen'))wake();}
function daylight(t){if(t<.25)return .55+t*1.6;if(t<.5)return .95;if(t<.7)return .95-(t-.5)*1.5;if(t<.85)return .65-(t-.7)*3.4;return .06;}
const SPARKLE_SC=.35; // half the old size
const FLOOR_BACK=790,FLOOR_FRONT=918,FLOOR_X0=200,FLOOR_X1=1460;
/* PERSPECTIVE (Nov 4): ONE scale curve for everything. A spot's depth is the row where its furniture touches the floor
   (the armchair's feet, the book stack's bottom...), not the surface the plant sits on; on the rug it's the plant's own row.
   Scale falls in a straight line toward the horizon: 100% at the front of the rug (918), smallest at the back wall (748).
   HORIZON is set so the armchair (766) comes out at the 66% Jackie OK'd for plants asleep in it. Measured from room_day.png. */
const HORIZON=464,DEPTH_FRONT=918,DEPTH_BACK=748;
const DEPTH={sill:748/* the wall under the windowsill */,desk:766/* desk legs */,crate:777/* crate bottom */,books:766/* sized like the armchair and the desk beside it, as the book stack was */,chair:766/* armchair feet */,bed:927/* cat bed bottom */,floor:925/* floor in front of the rug */};
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
function perchTaken(k){return otherPos().some(q=>q.k===k)||(k==='crate'&&st.stage>=6&&bassinetOut())/* the bassinet is for the young */||(k==='chair'&&chairId!=null&&chairId!==st.id);} // one plant per piece of furniture (a napper in the armchair counts)
function spotKey(){const gp=stageGroup();st.place=st.place||{};
 if(gp!=='seed'){const a=ageName();
  if(st.perch===undefined)st.perch=a==='kid'?kidDefault():null; // old saves and new kids: a kid starts on the crate or book stack, a teen or adult on the floor
  if(st.perch&&!PERCH[a].includes(st.perch))st.perch=null; // grew too big for it: down to the floor
  if(st.perch)return st.perch;
  if(!st.free)st.free=defaultFree();SPOT.free={x:st.free.x,y:st.free.y,name:''};return 'free';}
 const k=st.place[gp];if(GROUPS[gp].includes(k))return k;
 const hid=k=>otherPos().some(q=>q.k==='free'&&Math.abs(q.x-SPOT[k].x)<260); // a plant standing on the floor in front would hide a new seed
 const def={seed:hid('sill')&&!hid('desk')?'desk':'sill',baby:'books'}[gp],taken=otherPos().filter(q=>q.g===gp).map(q=>q.k),pick=taken.includes(def)?(GROUPS[gp].find(x=>!taken.includes(x))||def):def;st.place[gp]=pick;return pick;}
function kidDefault(){const k=st.place.baby;if(GROUPS.baby.includes(k)&&!perchTaken(k))return k;if(bassinetOut()&&!perchTaken('crate'))return 'crate'; /* a new kid goes in the bassinet if it is free */return GROUPS.baby.find(x=>!perchTaken(x))||null;} // the book stack or crate, whichever is free (else the floor)
function spotLight(){return spotInfo(spotKey()).L;} // light zones live in light.js
function nudgeSun(){if(st.night||clockLive())return;st.dayT=Math.min(.7,st.dayT+.055);}
/* ---------- props (code placeholders) ---------- */
// hotspots on the v2 room art: carafe on the stool = water; SNACKS box = all treats; gummies + peat moss on the shelf = those treats
const CAN={x:940,y:530,w:86,h:96}/* the cup under the water cooler's taps: pick it up to water */,COOLER={x:922,y:375,w:124,h:392},JAR={x:760,y:556,w:146,h:210}/* the mini fridge: all the treats */,GUMMY={x:-99,y:-99,w:1,h:1},PEAT={x:-99,y:-99,w:1,h:1},
 LAMP={x:1268,y:400,w:176,h:148},FLOOR={x:138,y:255,w:186,h:198}/* the floor lamp's shade */,FLOOR_POLE={x:204,y:453,w:56,h:376},WALL_LAMP={x:926,y:156,w:108,h:168},SHELF={x:1480,y:314,w:160,h:80},CHAIR={x:445,y:470,w:312,h:296},WIN={x:250,y:100,w:400,h:410},
 CUPBOARD={x:1484,y:582,w:158,h:156}/* the star door at the bottom of the right bookcase: Tofu's cupboard */;
function drawCarafe(x,y){ // carried glass carafe (code stand-in until the carried version is drawn)
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
function drawCurtains(k){if(k<.01||!ok(CURT2))return;const CURT=litLayer('curt',CURT2,'c');if(!CURT)return;const e=Math.round(k*12)/12; // eased; each side's leading edge sweeps to the middle like the fabric drawing shut
 const lw=(CURT_MID-CURT_L)*e,rw=(CURT_R-CURT_MID)*e;
 g.save();g.beginPath();g.rect(CURT_L-8,0,lw+8,H);g.rect(CURT_R-rw,0,rw+8,H);g.clip();g.drawImage(CURT,0,0);g.restore();}
/* BEHIND THE CURTAINS (Jackie, Nov 8): a seedling on the windowsill is hidden when the curtains are closed. The closed curtains hang
   down past the ledge, so the fabric sweeps over it as they close (whole curtain pixels, the same sweep as drawCurtains), and once
   they're shut it isn't drawn or tappable at all; tapping there works the curtains. Opening them shows it again. */
function behindCurtain(){return st.stage>=0&&st.stage<4&&st.curtain==='closed'&&spotKey()==='sill'&&!(drag.on&&drag.id===st.id);}
function curtainOver(b){if(curK<.01)return;g.save();g.beginPath();g.rect(b.x-4,b.y-4,b.w+8,b.h+8);g.clip();drawCurtains(curK);g.restore();}
let dtDraw=.016,lastDraw=performance.now();
function draw(){const nowD=performance.now();dtDraw=Math.min(.1,(nowD-lastDraw)/1000);lastDraw=nowD;g.clearRect(0,0,W,H);const tk=timeKey(),lk=lampsKey(),shut=st.curtain==='closed'&&curK>.98;
 if(!shut){drawWindowView(tk);drawFallingLeaves(tk);} // the sky, tonight's moon, autumn leaves drifting past (js/seasonal.js): all behind the glass
 if(st.started&&typeof sashGrab==='function')sashGrab(); // the view through the bottom row, before the room covers it (js/paw.js)
 const rm=sceneLit();if(rm)g.drawImage(rm,0,0);
 if(st.started&&typeof drawSash==='function')drawSash(tk+lk,rm); // the lower sash slides up for Sloth's paw (js/paw.js)
 fidgetDrawProps(rm);
 drawSeasonItem(); // the pumpkin (autumn) or the tree (winter) on the book stack (js/seasonal.js)
 drawPlacard(tk+'|'+lk+'|'+Math.round(curK*4)); // the FILES sign on the desk drawers, lit like the wood around it
 curK+=((st.curtain==='closed'?1:0)-curK)*Math.min(1,dtDraw*5);if(curK>.01)drawCurtains(curK);
 lightMapUpdate(tk+'|'+lk+'|'+Math.round(curK*8)+'|'+seasonNow()+'|'+dayKey); // what the room's light is now, for the monsters, the cat and the rest (js/light.js)
 
 const dl=daylight(st.dayT);
 if(lightMap&&st.started)drawLightMap(); // debug only: under the plants and cat
 // SIMPLE RULE (Jackie: web + DS friendly): frame swaps and whole-pixel moves only; no fades, rotation, gradients or smooth scaling
 let b=null;
 if(drag.on){const gp=stageGroup();for(const k of gp==='seed'?GROUPS.seed:PERCH[ageName()].filter(k=>!perchTaken(k))){const sp=SPOT[k],pulse=Math.floor(T*2)%2?.35:.22;g.fillStyle=`rgba(255,240,200,${pulse})`;g.beginPath();g.ellipse(sp.x,sp.y-4,k==='chair'?110:gp==='seed'?44:70,12,0,0,Math.PI*2);g.fill();}}
 drawSill(); // what Sloth's paw brought, and the paw itself, behind plants and the cat (js/paw.js)
 if(st.started){for(const q of parts)if(q.k==='drop')fx('drops',q.x,q.y,6);
  const L=[];eachPlant(i=>{if(st.stage>=0)L.push({i,y:baseY()});});L.sort((p,q)=>p.y-q.y);let catDone=false;
  const drawCat=()=>{window.drawCat();if(rm&&cat.spot==='bed'&&cat.state!=='walk'&&cat.state!=='away'&&Math.abs(cat.y-SURFACE.bed)<2){const[x,y,w,h]=CAT_BED_FRONT,[ex,ey,rx,ry]=CAT_BED_HOLLOW;g.save();g.beginPath();g.rect(x,y,w,h);g.ellipse(ex,ey,rx,ry,0,0,Math.PI*2);g.clip('evenodd');g.drawImage(rm,x,y,w,h,x,y,w,h);g.restore();}}; // in its bed the cat is behind the front rim
  for(const e of L){if(!catDone&&cat.y<e.y){drawCat();catDone=true;}if(e.i<0)drawOnePlant();else{swapIn(e.i);try{drawOnePlant();}finally{swapIn(e.i);}}}
  if(!catDone)drawCat();}
 function drawOnePlant(){let b;const pb=plantBox();
  const sill=st.stage<4&&spotKey()==='sill'&&!(drag.on&&drag.id===st.id);if(sill&&st.curtain==='closed'&&curK>.98)return; // shut curtains: the seedling is behind them

  if(st.puddleLv)fx('puddle',pb.x+pb.w/2,baseY()-12,1.5,0,FX_SCALE*clamp(pb.w/220,.5,1.7)*[0,.55,.8,1][st.puddleLv]); // too much water: a puddle under the pot that dries in 3 steps
  b=drawPlant();if(sill)curtainOver(b); // the fabric sweeping over it as the curtains close (or back as they open)
  if(inChair()&&rm)for(const[x,y,w,h]of CHAIR_FRONT)g.drawImage(rm,x,y,w,h,x,y,w,h);
  if(rm&&bassinetOut()&&bassIn(st)&&!onChair())for(const[x,y,w,h]of bassAsleep()?BASS_FRONT_BED:BASS_FRONT)g.drawImage(rm,x,y,w,h,x,y,w,h);
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
 for(const q of parts){if(q.k==='heart')fx('hearts',q.x,q.y,3,0,.5);else if(q.k==='spark')fx('sparkles',q.x,q.y,3,0,SPARKLE_SC);else if(q.k==='drop'){}else{g.fillStyle=q.c;g.fillRect(q.x|0,q.y|0,6,6);}}
 if(lightMap&&st.started)drawLightTags(); // debug only: labels and legend on top
 if(typeof depthLines!=='undefined'&&depthLines&&st.started)drawDepthLines(); // debug only: each spot's depth and size
 const ph=phase(st.dayT);
 if(held.tool){const x=mx|0,y=my|0;
  if(held.tool==='can')drawCarafeHeld(x,y);
  else{const k=overK(x,y),R=(a,b,c,d)=>g.fillRect(Math.round(x+a*k),Math.round(y+b*k),Math.round(c*k),Math.round(d*k)); // a book, sized for the depth it's held at
   g.fillStyle=C.out;R(-28,-36,56,72);g.fillStyle=(BOOK_LOOK[held.item&&held.item.id]||{c:C.out}).c;R(-24,-32,48,64);g.fillStyle=C.ivory;R(-16,-20,32,4);}}
 drawFeed(); // a treat being dragged to a monster (care.js)
 drawCub(); // a toy from Tofu's cupboard being dragged to the cat (cupboard.js)
 drawReading(); // a monster reading, a book hopping home, a book being dragged (care.js)
}
