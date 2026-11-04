'use strict';
/* Input: pointer/mouse/keyboard, tapping and dragging plants, what each spot in the room does. */
const drag={on:false,down:false,sx:0,sy:0,justDropped:false};
/* ---------- input ---------- */
function toGame(e){const r=cv.getBoundingClientRect();return [(e.clientX-r.left)/S,(e.clientY-r.top)/S];}
const inR=(x,y,r)=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;
const alphaCache=new Map();function alphaAt(im,u,v){let a=alphaCache.get(im.src);if(!a){const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d');x.drawImage(im,0,0);try{a=x.getImageData(0,0,c.width,c.height).data;}catch(e){a=null;}alphaCache.set(im.src,a||0);}if(!a)return 255;u=Math.floor(u);v=Math.floor(v);if(u<0||v<0||u>=im.naturalWidth||v>=im.naturalHeight)return 0;return a[(v*im.naturalWidth+u)*4+3];}
// tap only on the plant's painted pixels (with a little slack), so things peeking out behind it stay clickable
function onPlantPx(x,y){if(st.stage<0)return false;const b=plantBox();if(!b.img||!ok(b.img))return onPlant(x,y);const sx=b.img.naturalWidth/b.w,sy=b.img.naturalHeight/b.h;for(const[dx,dy]of[[0,0],[10,0],[-10,0],[0,10],[0,-10]])if(alphaAt(b.img,(x+dx-b.x)*sx,(y+dy-b.y)*sy)>40)return true;return false;}
function onPlant(x,y){if(st.stage<0)return false;const b=plantBox();return x>=b.x-10&&x<=b.x+b.w+10&&y>=b.y-10&&y<=baseY()+4;}
cv.addEventListener('mousemove',e=>{[mx,my]=toGame(e);cv.style.cursor=held.tool?'none':'pointer';});
cv.addEventListener('mouseleave',()=>{mx=my=-99;});
function focusPlantAt(x,y,box){if(!(st.others||[]).length)return;const hk=box==='can'?holdK(x,y):1,hit=()=>st.stage>=0&&(box==='can'?pourOver(x,y,hk):box?onPlant(x,y):onPlantPx(x,y));
 let best=-2,by=-1;eachPlant(i=>{if(hit()&&baseY()>by){by=baseY();best=i;}});if(best>=0){swapIn(best);ACT=st.id;}}
cv.addEventListener('pointerdown',e=>{const [fx0,fy0]=toGame(e);if(st.started)focusPlantAt(fx0,fy0,held.tool==='can'?'can':!!held.tool);if(fidgetDown(fx0,fy0))return;if(!st.started||st.stage<0||held.tool)return;const [x,y]=toGame(e);if(onPlantPx(x,y)){drag.down=true;drag.sx=x;drag.sy=y;}});
cv.addEventListener('pointermove',e=>{const [x,y]=toGame(e);mx=x;my=y;if(drag.down&&!drag.on&&Math.hypot(x-drag.sx,y-drag.sy)>14){drag.on=true;sfx('soil');closeBubble();}});
addEventListener('pointerup',e=>{if(!drag.down)return;drag.down=false;if(!drag.on)return;drag.on=false;drag.justDropped=true;
 const gp=stageGroup();
 if(gp==='grown'){const h=plantBoxRaw().h;let x=Math.round(clamp(mx,FLOOR_X0,FLOOR_X1)),y=Math.round(clamp(my+h*.15,FLOOR_BACK,FLOOR_FRONT));
  for(let n=0;n<12&&!freeClear(x,y);n++)x=clamp(x+(n%2?-1:1)*40*(n+1),FLOOR_X0,FLOOR_X1); // don't stack two plants on top of each other
  st.free={x,y};st.walk=null;sfx('pop');
  save();return;}let best=null,bd=1e9;for(const k of GROUPS[gp]){const sp=SPOT[k];const d=Math.hypot(mx-sp.x,my-sp.y);if(d<bd){bd=d;best=k;}}
 st.place=st.place||{};const was=spotKey();st.place[gp]=best;sfx(best===was?'tick':'pop');save();});
cv.addEventListener('contextmenu',e=>{e.preventDefault();held.tool=null;});
addEventListener('keydown',e=>{if(e.key==='Escape'){held.tool=null;closeBubble();}});
cv.addEventListener('click',e=>{if(drag.justDropped){drag.justDropped=false;return;}if(!st.started||st.stage<0)return;const [x,y]=toGame(e);closeBubble();sfx('tick');
 if(!held.tool&&!onPlantPx(x,y)&&catHit(x,y)){petCat();return;}
 if(!held.tool&&!onPlantPx(x,y)&&inR(x,y,DRAWERS)){openJournal();return;}
 if(!held.tool&&!onPlantPx(x,y)&&fidgetPoke(x,y))return; // doodads work day or night
 if(st.night){ // night: lights and curtains still work; wake only on purpose
  if(inR(x,y,FLOOR)){st.lamp=!st.lamp;sfx(st.lamp?'chime':'sigh');save();return;}
  if(inR(x,y,LAMP)){st.desk=st.desk===false;save();return;}
  if(inR(x,y,WIN)){st.curtain=st.curtain==='open'?'closed':'open';sfx('page');save();return;}
  if(onPlant(x,y)||inR(x,y,CHAIR)){openBubble(x-120,y-90,'Wake up for a new day?<br><button data-k="y">Good morning</button><button data-k="n">Let it sleep</button>',{y:()=>{closeBubble();wake();},n:closeBubble});return;}
  tell('Shh… it\'s sleeping.',{kind:'info',who:st.id});return;}
 const on=held.tool==='can'?pourOver(x,y,holdK(x,y)):held.tool?onPlant(x,y):onPlantPx(x,y);
 if(held.tool&&on){useTool(x,y);return;}
 if(held.tool){held.tool=null;return;}
 if(on){pet();return;}
 if(inR(x,y,CAN)){held.tool='can';return;}
 // treats only come from the SNACKS box (Jackie)
 if(inR(x,y,JAR)){openSnacks(x,y);return;}
 if(inR(x,y,SHELF)){openBooks(x,y);return;}
 if(inR(x,y,WIN)){st.curtain=st.curtain==='open'?'closed':'open';sfx('page');return;}
 if(inR(x,y,FLOOR)){st.lamp=!st.lamp;sfx('tick');sfx(st.lamp?'chime':'sigh');save();return;}
 if(inR(x,y,LAMP)){st.desk=st.desk===false;sfx('tick');save();return;}
 if(inR(x,y,CHAIR)&&!onPlant(x,y)){openBubble(CHAIR.x,CHAIR.y-90,'Settle in for the night?<br><button data-k="y">Goodnight</button><button data-k="n">Not yet</button>',{y:tuckIn,n:closeBubble});return;}
});
