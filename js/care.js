'use strict';
/* Care: things you carry and use on a plant: the carafe, treats, books, and petting. */
const CARRY={up:img('carafe_up.png'),tilt:img('carafe_tilt.png'),pour:img('carafe_pour.png')},TREAT_IMG={};['solar','peat','cotton','pizza','plants','fossil','blood'].forEach(k=>TREAT_IMG[k]=img('treat_'+k+'.png'));
const CARRY_SC=.45; // carried items at the front of the room; over a plant they take that plant's depth (holdK, overK)
function drawCarried(im,x,y,sc=CARRY_SC,flip){if(!ok(im))return;y+=(Math.floor(T*2)%2)*2;const w=Math.round(im.naturalWidth*sc),h=Math.round(im.naturalHeight*sc);
 if(flip){g.save();g.translate(Math.round(x),0);g.scale(-1,1);g.drawImage(im,-Math.round(w/2),Math.round(y-h/2),w,h);g.restore();}else g.drawImage(im,Math.round(x-w/2),Math.round(y-h/2),w,h);} // flip = mirrored when drawn; the PNG never changes
/* Carrying the carafe: right-handed (the default) draws the tilt and pour frames mirrored so the spout leans left, and the carafe
   sits up and to the left of your finger so your thumb doesn't cover it. The journal's left-handed setting flips both back. */
const CARRY_OFF={x:-60,y:-75},SPOUT={x:69,y:35}; // spout = where the stream ends on carafe_pour.png (336,230 of 365x303), scaled by CARRY_SC, from its centre
function rightHand(){return !st.leftHand;}
function carafeAt(x,y){const r=rightHand();return {x:x+(r?CARRY_OFF.x:-CARRY_OFF.x),y:y+CARRY_OFF.y};}
/* FACING (Jackie, Nov 4): the carafe faces the way it's moving: right = as drawn (spout on the right), left = mirrored. An instant flip, no
   turning (DS rule). It only turns after moving FACE_TURN px the new way, so a jiggling or resting finger doesn't flicker it, and it keeps
   its last facing while held still. Picked up, it starts facing away from your thumb (right-handed: left). */
const FACE_TURN=12,carryFace={dir:0,far:0};
function faceAt(x){const f=carryFace;if(!f.dir){f.dir=rightHand()?-1:1;f.far=x;}
 if((x-f.far)*f.dir>0)f.far=x; // still going the same way: remember how far it got
 else if(Math.abs(x-f.far)>=FACE_TURN){f.dir=-f.dir;f.far=x;} // moved far enough back the other way: turn
 return f.dir;}
function pourPoint(x,y,k){const c=carafeAt(x,y);return {x:c.x+carryFace.dir*SPOUT.x*k,y:c.y+SPOUT.y*k};} // the spout is on the side it faces // k = the carafe's depth scale (holdK)
function pourOver(x,y,k){if(st.stage<0)return false;const p=pourPoint(x,y,k),b=plantBox();return p.x>=b.x-10&&p.x<=b.x+b.w+10&&p.y>=b.y-150&&p.y<=baseY()+4;} // the stream lands on the plant (falling water reaches it from a little above)
// PERSPECTIVE: what you carry is sized for the depth of the plant you hold it over (the same curve as everything else), else the front of the room.
// Never call these inside eachPlant (they loop over the plants themselves).
function holdK(x,y){let d=DEPTH_FRONT;eachPlant(()=>{if(st.stage>=0&&pourOver(x,y,depthK(plantDepth())))d=plantDepth();});return depthK(d);}
function overK(x,y){let d=DEPTH_FRONT;eachPlant(()=>{if(onPlant(x,y))d=plantDepth();});return depthK(d);}
function drawCarafeHeld(x,y){faceAt(x);const c=carafeAt(x,y),k=holdK(x,y);let over=false;eachPlant(()=>{if(pourOver(x,y,k))over=true;});drawCarried(over?CARRY.pour:CARRY.tilt,c.x,c.y,CARRY_SC*k,carryFace.dir<0);}
const SNACKS=[ // Jackie's treats, good -> evil. Treats are optional; regular servings grow a cultivated trait (names are placeholders)
 {id:'solar',name:'Solar gummies',ge:.10,s:'slurp',trait:'Orbiting sun'},
 {id:'peat',name:'Peat moss',ge:.06,s:'crunch',trait:'Moss sprout'},
 {id:'cotton',name:'Cotton candy',ge:.03,s:'slurp',trait:'Sugar crystal'},
 {id:'pizza',name:'Pizza',ge:0,s:'crunch',trait:'Pizza bow'},
 {id:'plants',name:'Other plants',ge:-.05,s:'crunch',trait:'Lily-of-the-valley'},
 {id:'fossil',name:'Dinosaur fossils',ge:-.08,s:'crunch',trait:'Dino-skull clip'},
 {id:'blood',name:'Blood',ge:-.14,s:'slurp',trait:'Heart-charm bow'}];
const TRAIT_AT=5; // servings to grow a trait
const BOOKS=[{id:'fairy',name:'Fairy tales',ge:.08,lc:0},{id:'almanac',name:'The Almanac of Rules',ge:0,lc:.08},{id:'nonsense',name:'Nonsense poems',ge:0,lc:-.08},{id:'grimoire',name:'Forbidden grimoire',ge:-.1,lc:-.02}];
function pet(){const b=plantBox();plantBoing(mx);if(bump('pets')>=25)earnPot('basket');if(st.stage<4){sfx('purr');burst('heart',b.x+b.w*.1,b.y-20,1);return;}
 st.pets=(st.pets||[]).filter(t=>T-t<1.3);st.pets.push(T);
 if(st.pets.length>=3){sfx('giggle');st.lc=clamp(st.lc-.04,-1,1);st.pets=[];logEv('tickles');tell('Tickle attack!',{kind:'teach',key:'tickle'});burst('heart',b.x+b.w*.15,b.y-20,2);}
 else{sfx('purr');st.lc=clamp(st.lc+.01,-1,1);tell('A gentle pet.',{kind:'teach',key:'gentle'});burst('heart',b.x+b.w*.15,b.y-20,1);}
 const was=st.needs.attention;st.needs.attention=Math.max(0,was-.35);if(was>.6&&st.needs.attention<=.6)met('attention');doMove();if(ambientOK()&&Math.random()<.5)tell(line('pet'),{kind:'ambient',who:st.id});}
function useTool(tx=mx,ty=my){const b=plantBox();const base=SPOT[spotKey()].y;
 if(held.tool==='can'){sfx('pour');const pp=pourPoint(tx,ty,holdK(tx,ty));burst('drop',clamp(pp.x,b.x+20,b.x+b.w-20),clamp(pp.y,b.y-20,base-40),2); // drops fall where the spout pours
  if(st.needs.thirst<.3){st.over=PUDDLE_T;st.overType='water';setTimeout(()=>sfx('blub'),900);tell('No harm done.',{kind:'teach',key:'puddle'});}
  else{if(st.needs.thirst>.6)met('thirst');setTimeout(()=>sfx('sigh'),1300);
   const P=pers(),onTime=st.routine!=null&&Math.abs(st.dayT-st.routine)<.07;st.routine=st.routine==null?st.dayT:st.routine*.7+st.dayT*.3;
   if(P.l==='lawful'&&onTime&&st.stage>=4){st.needs.attention=Math.max(0,st.needs.attention-.15);setTimeout(()=>burst('heart',b.x+b.w*.15,b.y-20,2),1300);const f=notice('tidy',QUIRK_TXT.tidy);tell('Right on time! '+who()+' loves a routine.',f?{kind:'teach',key:'quirk_tidy',who:st.id}:{kind:'info',who:st.id});}
   if(st.stage>=4)setTimeout(()=>doMove(),1300);
   if(P.l==='lawful'&&onTime&&st.stage>=4){}else if(st.stage>=4&&quiet()&&Math.random()<.6)setTimeout(()=>{if(ambientOK())tell(line('water'),{kind:'ambient',who:st.id});},1400);}
  st.needs.thirst=0;held.tool=null;return;}
 if(st.stage<4){tell(held.tool==='snack'?'This tyke\'s not eating whole food yet.':'Too little for that yet.',{kind:'info',who:st.id});held.tool=null;return;}
 if(held.tool==='snack'&&(st.full||0)>.6){ // full (Jackie): it won't eat; a little head-shake, treat stays in your hand
  BOING.vx+=6;sfx('hmm');tell(who()+' is full. Maybe later.',{kind:'info',who:st.id});return;}
 if(held.tool==='snack'&&((st.full||0)>.6||st.nap>0)){held.tool=null;sfx('hmm');plantBoing(b.x+b.w/2);tell(st.nap>0?'Shh... '+who()+' is sleeping off a snack.':who()+' is full. Maybe later.',{kind:'info',who:st.id});return;} // full: won't eat (Jackie)
 if(held.tool==='snack'){const s=held.item;sfx(s.s);burst('crumb',b.x+b.w/2,b.y+b.h*.5,8,s.ge<0?C.vio:C.coral);
  const P=pers(),love=(P.g==='good'&&s.ge>.05)||(P.g==='evil'&&s.ge<-.05)||(P.l==='lawful'&&st.lastTreat===s.id)||(P.l==='chaotic'&&st.lastTreat&&st.lastTreat!==s.id),
   meh=!love&&((P.g==='good'&&s.ge<-.05)||(P.g==='evil'&&s.ge>.05));
  const why=love?(P.g==='good'&&s.ge>.05?'sweet':P.g==='evil'&&s.ge<-.05?'dark':P.l==='lawful'?'usual':'novel'):meh?(P.g==='good'?'sweet':'dark'):'';
  const W=who(),tn=s.name.toLowerCase(),rx=love?({sweet:W+' loves the '+tn+'!',dark:'Ooh, '+whose()+' favorite. Mwah-ha-hah!',usual:whose()+' usual!',novel:'Something new! '+W+' loves it.'})[why]:meh?W+' eats it… politely.':'Nom.';
  const qf=why?notice(why,QUIRK_TXT[why]):false;st.lastTreat=s.id;if(love)st.fav=s.id; // the journal draws the last treat it lovedif(love)st.needs.attention=Math.max(0,st.needs.attention-.1);
  setTimeout(()=>{plantBoing(b.x+b.w/2);sfx('pop');burst('heart',b.x+b.w*.15,b.y-20,love?4:meh?1:2);if(love)setTimeout(()=>doMove(),300);},350); // the happy 'pop' after it eats
  if((st.full||0)+.35>.6){setTimeout(()=>{sfx('burp');st.nap=60;},900);tell('Burp! '+who()+' is so full it\'s dozing off.',{kind:'info',who:st.id});} // full = a full-minute nap (Jackie)
  else tell('Treats aren\'t food. They help monsters grow into themselves.',{kind:'teach',key:'snack'});
  st.full=clamp((st.full||0)+.35,0,1);st.ge=clamp(st.ge+s.ge,-1,1);
  st.treats=st.treats||{};st.traits=st.traits||[];st.treats[s.id]=(st.treats[s.id]||0)+1;st.tLast=st.tLast||{};st.tLast[s.id]=st.day;
  if(st.treats[s.id]>=((st.dormant||[]).includes(s.trait)?3:TRAIT_AT)&&!st.traits.includes(s.trait)){st.dormant=(st.dormant||[]).filter(t=>t!==s.trait);st.traits.push(s.trait);const gw=who(),gid=st.id;setTimeout(()=>{sfx('chime');st.listen=3;tell(gw+' grew a '+s.trait.toLowerCase()+'!',{kind:'important',who:gid});},900);}
  logEv(s.name);if(bump('treats')>=10)earnPot('lavender');if(!(st.full>.95))tell(rx,{kind:'info',who:st.id}); // just its reaction: no game terms or numbers (progress lives in the journal)
  save();held.tool=null;return;}
 if(held.tool==='book'){const bk=held.item;sfx('page');st.listen=4;const was=st.needs.attention;st.needs.attention=Math.max(0,was-.6);if(was>.6)met('attention');
  st.ge=clamp(st.ge+bk.ge,-1,1);st.lc=clamp(st.lc+bk.lc,-1,1);held.tool=null;logEv(bk.name);if(bump('read_'+bk.id)>=5)earnPot({fairy:'candy',almanac:'plaid',nonsense:'rainbow',grimoire:'eye'}[bk.id]);
  tell(who()+' '+({fairy:'listens to the fairy tale, very still.',almanac:'nods along to the rules.',nonsense:'giggles at the nonsense poems.',grimoire:'leans in for the forbidden spells.'})[bk.id],{kind:'info',who:st.id});}}
/* FEEDING (Jackie, Nov 4): simple and satisfying with a finger or a mouse.
   Tap the SNACKS cabinet: a small cream tray beside it holds the seven treats in a row (thumb-sized, no words).
   Press a treat and drag: it follows the finger, drawn a little above and to the side so the thumb doesn't hide it.
   Over a monster that can eat (teen or adult, awake, not full) that monster opens its mouth (mouthB_02); the drop area is its
   whole body plus a generous margin. Let go there: chomp (closed-open-closed) with a 2 px squash, then its usual treat reaction.
   Let go anywhere else, or over one that can't eat: the treat just goes back to the tray. The tray hides when you tap away,
   or a few seconds after the last treat. Pointer events, so a mouse drag works the same way. */
const feed={item:null,x:0,y:0,over:null,trayT:0},CHOMP=new Map(),CHOMP_MS=110,TRAY_HIDE=4000;let trayEl=null;
function openSnacks(){sfx('tick');if(!trayEl){trayEl=document.createElement('div');trayEl.className='ttray';
  for(const s of SNACKS){const b=document.createElement('button');b.type='button';b.className='ttreat';b.dataset.id=s.id;b.setAttribute('aria-label',s.name);
   const im=document.createElement('img');im.src=TREAT_IMG[s.id].src;im.alt='';im.draggable=false;b.appendChild(im);
   b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();grabTreat(s,e);});trayEl.appendChild(b);}
  trayEl.addEventListener('pointerdown',e=>e.stopPropagation());trayEl.addEventListener('click',e=>e.stopPropagation());ui.appendChild(trayEl);}
 placeTray();trayKeep();}
function placeTray(){if(!trayEl)return;const w=trayEl.offsetWidth,h=trayEl.offsetHeight; // along the bottom, ending under the cabinet: over the rug and pots, never a face
 trayEl.style.left=Math.round(clamp((JAR.x+JAR.w)*S-w,4,W*S-w-4))+'px';trayEl.style.top=Math.round(H*S-h-6)+'px';}
function trayKeep(){feed.trayT=performance.now();}
function closeTray(){if(trayEl){trayEl.remove();trayEl=null;}}
cv.addEventListener('pointerdown',()=>{if(!feed.item)closeTray();}); // tap away
// where the treat is drawn: a little above the finger and to the side (away from the thumb), in room units
function feedPos(e){const [x,y]=toGame(e);feed.x=x+(rightHand()?-30:30)/S;feed.y=y-46/S;}
function grabTreat(s,e){feed.item=s;feedPos(e);feedOver();trayKeep();sfx('pop');
 addEventListener('pointermove',feedMove);addEventListener('pointerup',feedUp);addEventListener('pointercancel',feedUp);}
function feedMove(e){if(!feed.item)return;feedPos(e);feedOver();}
function canEat(){return st.stage>=6&&st.nap<=0&&!st.night&&(st.full||0)<=.6;}
// the monster under the treat (the frontmost if two overlap): its whole body plus a generous margin
function feedTarget(x,y){let best=null,by=-1;eachPlant(()=>{if(st.stage<0)return;const b=plantBox(),m=40+b.w*.12;
  if(x>=b.x-m&&x<=b.x+b.w+m&&y>=b.y-m&&y<=baseY()+m*.5&&baseY()>by){by=baseY();best={id:st.id,eat:canEat()};}});return best;}
function feedOver(){const t=feedTarget(feed.x,feed.y);feed.over=t&&t.eat?t.id:null;}
function feedUp(){removeEventListener('pointermove',feedMove);removeEventListener('pointerup',feedUp);removeEventListener('pointercancel',feedUp);
 const s=feed.item,id=feed.over;feed.item=null;feed.over=null;trayKeep();if(!s)return;
 if(id==null){sfx('tick');const t=feedTarget(feed.x,feed.y);if(t)withPlant(t.id,()=>{if(st.stage>=4&&st.stage<6){plantBoing(plantBox().x+plantBox().w/2);tell(who()+' is too little for big monster food.',{kind:'info',who:st.id});}});return;} // back to the tray; a kid says why
 const i=(st.others||[]).findIndex(q=>q.id===id);if(i>=0){swapIn(i);ACT=st.id;} // the one you fed becomes the one you're tending
 CHOMP.set(id,performance.now());sfx(s.s);
 setTimeout(()=>withPlant(id,()=>{held.tool='snack';held.item=s;useTool();}),CHOMP_MS*3);}
// mouth while feeding: open over a treat; chomp = closed, open, closed (one 110 ms frame each)
function feedMouth(){const t=CHOMP.get(st.id);if(t!=null){const f=Math.floor((performance.now()-t)/CHOMP_MS);if(f<3)return f===1?2:8;CHOMP.delete(st.id);}return feed.item&&feed.over===st.id?2:0;}
function chompDip(){const t=CHOMP.get(st.id);if(t==null)return 0;const f=Math.floor((performance.now()-t)/CHOMP_MS);return f===1?2:0;} // squash 2 px down on the open frame, back up after
function drawFeed(){if(trayEl&&!feed.item&&performance.now()-feed.trayT>TRAY_HIDE)closeTray();if(!feed.item)return;const im=TREAT_IMG[feed.item.id];if(!ok(im))return;
 const k=.4*overK(feed.x,feed.y),w=Math.round(im.naturalWidth*k),h=Math.round(im.naturalHeight*k);g.drawImage(im,Math.round(feed.x-w/2),Math.round(feed.y-h/2),w,h);}
addEventListener('resize',()=>setTimeout(placeTray,50));
/* READING (Jackie, Nov 7): touch any book on either bookshelf and a small cream tray slides out with the four special books
   (pixel covers drawn here, each its own color and little emblem). Press one and drag it to a monster that's awake and has its
   eyes open (kid, teen or adult); let go there and it reads in the room: an open book in front of it, a page flipping every
   moment (a 2-frame swap), a few tiny symbols from that book rising on whole pixels, for about 8 s. Then the book closes and
   hops back to the shelf. Let go anywhere else and the book just goes back to the tray. Same feel as the treat tray. */
// tap areas: the rows of books on both bookcases, kept clear of the snail, the boxes, the floor lamp, the snow globe and SNACKS
const BOOK_ZONES=[{x:6,y:150,w:208,h:72},{x:6,y:250,w:132,h:74},{x:6,y:355,w:42,h:64},{x:6,y:462,w:88,h:78},{x:6,y:580,w:132,h:74},
 {x:1608,y:220,w:38,h:80},{x:1476,y:322,w:170,h:74},{x:1606,y:410,w:38,h:72},{x:1474,y:505,w:152,h:48},
 {x:282,y:612,w:116,h:46}/* the book on the milk crate */,{x:898,y:622,w:156,h:140}/* the book stack by the desk */]; // a monster or the cat sitting there is tapped first
function onBookshelf(x,y){return BOOK_ZONES.some(r=>inR(x,y,r));}
const BOOK_LOOK={fairy:{c:C.coral,d:C.brick,e:['.y.','yyy','.y.']},almanac:{c:C.blue,d:C.navy,e:['yyy','y.y','yyy']},
 nonsense:{c:C.fl3,d:C.fl2,e:['vv.','..v','vv.']},grimoire:{c:'#4a2a4f',d:'#2d1824',e:['.w.','wyw','.w.']}};
const BPAL={y:C.fl3,v:C.vio,w:C.lav,i:C.ivory,s:C.sand,o:C.out};
// a closed book, 10x13 art pixels: spine on the left, pages showing on the right edge, emblem on the cover
function bookPix(id,px){const L=BOOK_LOOK[id],w=10,h=13,c=document.createElement('canvas');c.width=(w+2)*px;c.height=(h+2)*px;const x=c.getContext('2d');
 const cell=(i,j,col)=>{x.fillStyle=col;x.fillRect((i+1)*px,(j+1)*px,px,px);};x.fillStyle=C.out;x.fillRect(0,0,c.width,c.height);
 for(let j=0;j<h;j++)for(let i=0;i<w;i++)cell(i,j,i<2?L.d:i===w-1?C.ivory:L.c);
 for(let j=1;j<h-1;j+=3)cell(w-1,j,C.sand); // page lines
 L.e.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch!=='.')cell(4+i,5+j,BPAL[ch]);}));
 cell(2,0,C.ivory);cell(3,0,C.ivory);return c;} // a little highlight
const BOOK_CACHE=new Map();function bookImg(key,make){if(!BOOK_CACHE.has(key))BOOK_CACHE.set(key,make());return BOOK_CACHE.get(key);}
const bookDrag={item:null,x:0,y:0,over:null,trayT:0};let btrayEl=null;
const READ=new Map(),BOOK_HOP=.6; // id -> {bk,from,page}; flights: closed books hopping back to the shelf
const bookHops=[];
function openBooks(){sfx('page');if(!btrayEl){btrayEl=document.createElement('div');btrayEl.className='ttray btray';
  for(const bk of BOOKS){const b=document.createElement('button');b.type='button';b.className='ttreat tbook';b.dataset.id=bk.id;b.setAttribute('aria-label',bk.name);
   const c=bookPix(bk.id,3);c.className='jpix';b.appendChild(c);
   b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();grabBook(bk,e);});btrayEl.appendChild(b);}
  btrayEl.addEventListener('pointerdown',e=>e.stopPropagation());btrayEl.addEventListener('click',e=>e.stopPropagation());ui.appendChild(btrayEl);}
 placeBookTray();bookDrag.trayT=performance.now();}
function placeBookTray(){if(!btrayEl)return;const w=btrayEl.offsetWidth,h=btrayEl.offsetHeight; // along the bottom of the room, like the treat tray
 btrayEl.style.left=Math.round(clamp(W*S/2-w/2,4,W*S-w-4))+'px';btrayEl.style.top=Math.round(H*S-h-6)+'px';}
function closeBookTray(){if(btrayEl){btrayEl.remove();btrayEl=null;}}
cv.addEventListener('pointerdown',()=>{if(!bookDrag.item)closeBookTray();});
addEventListener('resize',()=>setTimeout(placeBookTray,50));
function bookPos(e){const [x,y]=toGame(e);bookDrag.x=x+(rightHand()?-30:30)/S;bookDrag.y=y-46/S;}
function grabBook(bk,e){bookDrag.item=bk;bookPos(e);bookOver();bookDrag.trayT=performance.now();sfx('page');
 addEventListener('pointermove',bookMove);addEventListener('pointerup',bookUp);addEventListener('pointercancel',bookUp);}
function bookMove(e){if(!bookDrag.item)return;bookPos(e);bookOver();}
function canRead(){return st.stage>=4&&st.nap<=0&&!st.night;}
function bookOver(){let best=null,by=-1;const x=bookDrag.x,y=bookDrag.y;eachPlant(()=>{if(st.stage<0)return;const b=plantBox(),m=40+b.w*.12;
  if(x>=b.x-m&&x<=b.x+b.w+m&&y>=b.y-m&&y<=baseY()+m*.5&&baseY()>by){by=baseY();best=canRead()?st.id:null;}});bookDrag.over=best;}
function bookUp(){removeEventListener('pointermove',bookMove);removeEventListener('pointerup',bookUp);removeEventListener('pointercancel',bookUp);
 const bk=bookDrag.item,id=bookDrag.over;bookDrag.item=null;bookDrag.over=null;bookDrag.trayT=performance.now();if(!bk)return;
 if(id==null){sfx('tick');return;} // back to the tray
 const i=(st.others||[]).findIndex(q=>q.id===id);if(i>=0){swapIn(i);ACT=st.id;} // the one you read to becomes the one you're tending
 closeBookTray();startReading(id,bk);}
/* THE STORY (Jackie, Nov 7): the monster hops cozy into the armchair (if nobody's there; otherwise it reads where it is), and a
   small open book faces us with the story (js/stories.js), two pages at a time, small enough to still see the monster in the chair.
   Tap the book to turn the page (a 2-frame flip); after the last page the book closes, hops back to the shelf, and the monster
   goes back to where it was. Tap the room to close it early. */
let storyEl=null;
function startReading(id,bk){closeStory(true);
 withPlant(id,()=>{held.tool='book';held.item=bk;useTool();let from=null;
  if(spotKey()!=='chair'&&!perchTaken('chair')&&spaceFree('chair')){from={perch:st.perch,free:st.free&&{...st.free}};st.perch='chair';st.walk=null;pickChair();sfx('pop');}
  READ.set(id,{bk,from,page:0});st.listen=2;});
 storyEl=document.createElement('div');storyEl.className='story';storyEl.dataset.id=id;storyEl.style.setProperty('--bc',BOOK_LOOK[bk.id].c);
 storyEl.innerHTML='<div class="scover jstep"><div class="spage jstep sl"></div><div class="spage jstep sr"></div></div>';
 storyEl.addEventListener('pointerdown',e=>e.stopPropagation());storyEl.addEventListener('click',e=>{e.stopPropagation();turnStory();});
 ui.appendChild(storyEl);placeStory();showStory();}
function placeStory(){if(!storyEl)return;const X=900,Y=470,w=640,h=320; // the right half of the room, clear of the armchair
 Object.assign(storyEl.style,{left:Math.round(X*S)+'px',top:Math.round(Y*S)+'px',width:Math.round(w*S)+'px',height:Math.round(h*S)+'px'});}
addEventListener('resize',()=>setTimeout(placeStory,50));
function showStory(){if(!storyEl)return;const r=READ.get(+storyEl.dataset.id);if(!r)return;const P=STORIES[r.bk.id]||[];
 storyEl.querySelector('.sl').textContent=P[r.page]||'';storyEl.querySelector('.sr').textContent=P[r.page+1]||'';}
function turnStory(){if(!storyEl||storyEl.dataset.turning)return;const id=+storyEl.dataset.id,r=READ.get(id);if(!r)return closeStory();
 if(r.page+2>=(STORIES[r.bk.id]||[]).length)return closeStory();sfx('page');storyEl.dataset.turning=1;
 const f=document.createElement('div');f.className='sturn sturn1 jstep';storyEl.querySelector('.scover').appendChild(f); // the right page lifts
 setTimeout(()=>{f.className='sturn sturn2 jstep';},90); // and lands on the left
 setTimeout(()=>{f.remove();r.page+=2;delete storyEl.dataset.turning;showStory();},180);}
function closeStory(quiet){if(!storyEl)return;const id=+storyEl.dataset.id,r=READ.get(id);storyEl.remove();storyEl=null;if(!r)return;READ.delete(id);
 if(!quiet)sfx('page');bookHops.push({id:r.bk.id,x:1220,y:630,t0:performance.now()}); // the closed book hops home
 if(r.from)withPlant(id,()=>{st.perch=r.from.perch;if(r.from.free)st.free=r.from.free;st.walk=null;pickChair();});save();}
cv.addEventListener('pointerdown',()=>{if(storyEl&&!bookDrag.item)closeStory();}); // tap the room: close the book
function drawReading(){const now=performance.now();
 if(storyEl){const id=+storyEl.dataset.id;let gone=true;withPlant(id,()=>{gone=st.nap>0||st.night;if(!gone)st.listen=Math.max(st.listen,.5);});if(gone||!READ.has(id))closeStory();} // eyes softly closed while it listens
 for(let i=bookHops.length-1;i>=0;i--){const h=bookHops[i],u=(now-h.t0)/1000/BOOK_HOP;if(u>=1){bookHops.splice(i,1);continue;} // the closed book hops back to the shelf
  const sx=SHELF.x+SHELF.w/2,sy=SHELF.y+SHELF.h/2,px=4,x=Math.round((h.x+(sx-h.x)*u)/px)*px,y=Math.round((h.y+(sy-h.y)*u-Math.sin(u*Math.PI)*90)/px)*px,im=bookImg('c'+h.id,()=>bookPix(h.id,px));
  g.drawImage(im,x-im.width/2,y-im.height/2);}
 if(btrayEl&&!bookDrag.item&&now-bookDrag.trayT>TRAY_HIDE)closeBookTray();
 if(bookDrag.item){const im=bookImg('c'+bookDrag.item.id+'_'+5,()=>bookPix(bookDrag.item.id,5));g.drawImage(im,Math.round(bookDrag.x-im.width/2),Math.round(bookDrag.y-im.height/2));}}
