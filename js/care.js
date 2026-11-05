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
 if(id==null){sfx('tick');return;} // back to the tray, nothing else happens
 const i=(st.others||[]).findIndex(q=>q.id===id);if(i>=0){swapIn(i);ACT=st.id;} // the one you fed becomes the one you're tending
 CHOMP.set(id,performance.now());sfx(s.s);
 setTimeout(()=>withPlant(id,()=>{held.tool='snack';held.item=s;useTool();}),CHOMP_MS*3);}
// mouth while feeding: open over a treat; chomp = closed, open, closed (one 110 ms frame each)
function feedMouth(){const t=CHOMP.get(st.id);if(t!=null){const f=Math.floor((performance.now()-t)/CHOMP_MS);if(f<3)return f===1?2:8;CHOMP.delete(st.id);}return feed.item&&feed.over===st.id?2:0;}
function chompDip(){const t=CHOMP.get(st.id);if(t==null)return 0;const f=Math.floor((performance.now()-t)/CHOMP_MS);return f===1?2:0;} // squash 2 px down on the open frame, back up after
function drawFeed(){if(trayEl&&!feed.item&&performance.now()-feed.trayT>TRAY_HIDE)closeTray();if(!feed.item)return;const im=TREAT_IMG[feed.item.id];if(!ok(im))return;
 const k=.4*overK(feed.x,feed.y),w=Math.round(im.naturalWidth*k),h=Math.round(im.naturalHeight*k);g.drawImage(im,Math.round(feed.x-w/2),Math.round(feed.y-h/2),w,h);}
addEventListener('resize',()=>setTimeout(placeTray,50));
function openBooks(x,y){openBubble(x+20,y-40,'Read aloud from…<br>'+BOOKS.map((b,i)=>`<button data-k="${i}">${b.name}</button>`).join(''),Object.fromEntries(BOOKS.map((b,i)=>[i,()=>{held.tool='book';held.item=b;closeBubble();sfx('page');}])));}
