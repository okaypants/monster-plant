'use strict';
/* Input: pointer/mouse/keyboard, tapping and dragging plants, what each spot in the room does. */
const drag={on:false,down:false,sx:0,sy:0,justDropped:false};
/* ---------- input ---------- */
function toGame(e){const r=cv.getBoundingClientRect();return [(e.clientX-r.left)/S,(e.clientY-r.top)/S];}
const inR=(x,y,r)=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;
const alphaCache=new Map();function alphaAt(im,u,v){let a=alphaCache.get(im.src);if(!a){const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d');x.drawImage(im,0,0);try{a=x.getImageData(0,0,c.width,c.height).data;}catch(e){a=null;}alphaCache.set(im.src,a||0);}if(!a)return 255;u=Math.floor(u);v=Math.floor(v);if(u<0||v<0||u>=im.naturalWidth||v>=im.naturalHeight)return 0;return a[(v*im.naturalWidth+u)*4+3];}
// tap only on the plant's painted pixels (with a little slack), so things peeking out behind it stay clickable
function onPlantPx(x,y){if(st.stage<0||behindCurtain())return false;const b=plantBox();if(!b.img||!ok(b.img))return onPlant(x,y);const sx=b.img.naturalWidth/b.w,sy=b.img.naturalHeight/b.h;for(const[dx,dy]of[[0,0],[10,0],[-10,0],[0,10],[0,-10]])if(alphaAt(b.img,(x+dx-b.x)*sx,(y+dy-b.y)*sy)>40)return true;return false;}
function onPlant(x,y){if(st.stage<0||behindCurtain())return false;const b=plantBox();return x>=b.x-10&&x<=b.x+b.w+10&&y>=b.y-10&&y<=baseY()+4;}
// over a book you can open, the cursor is a magnifying glass (Jackie, Nov 17); the same checks, in the same order, as the tap below
function overBook(x,y){return st.started&&st.stage>=0&&!held.tool&&!st.night&&!onPlantPx(x,y)&&!sillHit(x,y)&&!catHit(x,y)&&!inR(x,y,DRAWERS)&&!inR(x,y,MOONBOX)&&onBookshelf(x,y);}
cv.addEventListener('mousemove',e=>{[mx,my]=toGame(e);cv.style.cursor=held.tool?'none':overBook(mx,my)?'zoom-in':'pointer';});
cv.addEventListener('mouseleave',()=>{mx=my=-99;});
function focusPlantAt(x,y,box){if(!(st.others||[]).length)return;const hk=box==='can'?holdK(x,y):1,hit=()=>st.stage>=0&&(box==='can'?pourOver(x,y,hk):box?onPlant(x,y):onPlantPx(x,y));
 let best=-2,by=-1;eachPlant(i=>{if(hit()&&baseY()>by){by=baseY();best=i;}});if(best>=0){swapIn(best);ACT=st.id;}}
cv.addEventListener('pointerdown',e=>{const [fx0,fy0]=toGame(e);if(st.started)focusPlantAt(fx0,fy0,held.tool==='can'?'can':!!held.tool);if(!st.started||st.stage<0||held.tool)return;const [x,y]=toGame(e);if(onPlantPx(x,y)){drag.down=true;drag.id=st.id;drag.sx=x;drag.sy=y;}});
cv.addEventListener('pointermove',e=>{const [x,y]=toGame(e);mx=x;my=y;if(drag.down&&!drag.on&&Math.hypot(x-drag.sx,y-drag.sy)>14){drag.on=true;drag.from={perch:st.perch,free:st.free&&{...st.free},seed:(st.place||{}).seed};sfx('soil');closeBubble();}});
addEventListener('pointerup',e=>{if(!drag.down)return;drag.down=false;if(!drag.on)return;drag.on=false;drag.justDropped=true;
 const gp=stageGroup();
 const from=drag.from||{};
 if(gp!=='seed'){const was=spotKey(); // kids, teens, adults: onto a free piece of furniture their age fits on, if you drop it near one; anywhere else, the floor
  const near=PERCH[ageName()].filter(k=>(k===was||!perchTaken(k))&&spaceFree(k)).map(k=>[k,k==='chair'&&inR(mx,my,CHAIR)?0:Math.hypot(mx-SPOT[k].x,my-SPOT[k].y)]).sort((a,b)=>a[1]-b[1])[0]; // anywhere over the armchair (back or seat) counts as the chair
  if(near&&near[1]<130){st.perch=near[0];st.walk=null;pickChair();sfx(near[0]===was?'tick':'pop');save();return;}
  const h=plantBoxRaw().h,spot=nearestClearFloor(mx,my+h*.15); // the clear bit of floor nearest where you let go
  if(spot){st.perch=null;st.free=spot;sfx('pop');}else{st.perch=from.perch;if(from.free)st.free=from.free;sfx('tick');} // nowhere clear: back where you picked it up
  st.walk=null;pickChair();spotKey();save();return;}
 let best=null,bd=1e9;for(const k of GROUPS[gp]){if(otherPos().some(q=>q.k===k))continue;const sp=SPOT[k];const d=Math.hypot(mx-sp.x,my-sp.y);if(d<bd){bd=d;best=k;}} // seeds: the nearest free one, never a taken pot spot
 if(!best)best=from.seed||spotKey();
 st.place=st.place||{};const was=spotKey();st.place[gp]=best;sfx(best===was?'tick':'pop');save();});
cv.addEventListener('contextmenu',e=>{e.preventDefault();held.tool=null;});
addEventListener('keydown',e=>{if(e.key==='Escape'){held.tool=null;closeBubble();}});
cv.addEventListener('click',e=>{if(drag.justDropped){drag.justDropped=false;return;}if(!st.started||st.stage<0)return;const [x,y]=toGame(e);closeBubble();sfx('tick');
 if(!held.tool&&!onPlantPx(x,y)&&sillHit(x,y)){sillTap();return;} // what Sloth's paw left on the windowsill
 if(!held.tool&&!onPlantPx(x,y)&&catHit(x,y)){petCat(x);return;}
 if(!held.tool&&!onPlantPx(x,y)&&inR(x,y,DRAWERS)){openArchive();return;} // the drawers hold the files of past monsters (Jackie, Nov 8); the journal opens from a name tag
 if(!held.tool&&!onPlantPx(x,y)&&seasonPoke(x,y))return; // the pumpkin or the tree, sitting on the book stack (js/seasonal.js)
 if(!held.tool&&!onPlantPx(x,y)&&inR(x,y,MOONBOX)){fidgetPoke(x,y);openTarot();return;} // the moon box on the right bookcase: a tarot reading (js/tarot.js), day or night
 if(!held.tool&&!st.night&&!onPlantPx(x,y)&&onBookshelf(x,y)){openBooks(bookZone(x,y).books);return;} // any book: both bookcases, the crate book, the book stack
 if(!held.tool&&!onPlantPx(x,y)&&inR(x,y,SAMPLER)){openSampler();return;} // the sampler on the top shelf opens its own app (js/sampler.js), day or night
 if(!held.tool&&!onPlantPx(x,y)&&inR(x,y,RADIO)){radioTap();fidgetPoke(x,y);return;} // the radio on the desk: on or off (js/radio.js), day or night
 if(!held.tool&&!onPlantPx(x,y)&&toyHit(x,y)){toyPutBack();return;} // the wind-up cat, out of its cubby: a tap puts it back (js/fidgets.js)
 if(!held.tool&&!onPlantPx(x,y)&&fidgetPoke(x,y))return; // doodads work day or night
 if(st.night){ // night: lights and curtains still work; wake only on purpose
  if(inR(x,y,FLOOR)||inR(x,y,FLOOR_POLE)){st.lamp=!st.lamp;sfx(st.lamp?'chime':'sigh');save();return;}
  if(inR(x,y,LAMP)){st.desk=st.desk===false;save();return;}
  if(inR(x,y,WALL_LAMP)){st.wall=st.wall===false;save();return;}
  if(inR(x,y,WIN)){st.curtain=st.curtain==='open'?'closed':'open';sfx('paper');save();return;}
  openBubble(x-120,y-90,'Wake up for a new day?'+tsChoices(CHOICES.wake),{y:()=>{closeBubble();wake();},n:closeBubble});return;} // any other tap, as the goodnight caption says
 const on=held.tool==='can'?(faceAt(x),pourOver(x,y,holdK(x,y))):held.tool?onPlant(x,y):onPlantPx(x,y);
 if(held.tool&&on){useTool(x,y);return;}
 if(held.tool){held.tool=null;return;}
 if(on){if(growTap())return; /* ready to grow up: it grows now (js/growup.js) */pet();return;}
 if(inR(x,y,CAN)||inR(x,y,COOLER)){held.tool='can';carryFace.dir=0;sfx('drip');return;} // the water cooler: you take the cup, filled, to water with
 // treats only come from the mini fridge (Jackie, Nov 18; it was the SNACKS cabinet)
 if(inR(x,y,JAR)){openSnacks(x,y);return;}
 if(inR(x,y,WIN)){st.curtain=st.curtain==='open'?'closed':'open';sfx('paper');return;}
 if(inR(x,y,FLOOR)||inR(x,y,FLOOR_POLE)){st.lamp=!st.lamp;sfx('tick');sfx(st.lamp?'chime':'sigh');save();return;}
 if(inR(x,y,LAMP)){st.desk=st.desk===false;sfx('tick');save();return;}
 if(inR(x,y,WALL_LAMP)){st.wall=st.wall===false;sfx('tick');save();return;}
 if(inR(x,y,CHAIR)&&!onPlant(x,y)){openBubble(CHAIR.x,CHAIR.y-90,'Settle in for the night?'+tsChoices(CHOICES.night),{y:tuckIn,n:closeBubble});return;}
});
