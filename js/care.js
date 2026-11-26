'use strict';
/* Care: things you carry and use on a plant: the carafe, treats, books, and petting. */
const CARRY={up:img('carry_cup_up.png'),tilt:img('carry_cup_tilt.png'),pour:img('carry_cup_pour.png')},TREAT_IMG={};['solar','peat','cotton','pizza','plants','fossil','blood'].forEach(k=>TREAT_IMG[k]=img('treat_'+k+'.png'));TREAT_IMG.mash=img('treat_mash.png');
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
function pourOver(x,y,k){if(st.stage<0||behindCurtain())return false;const p=pourPoint(x,y,k),b=plantBox();return p.x>=b.x-10&&p.x<=b.x+b.w+10&&p.y>=b.y-150&&p.y<=baseY()+4;} // the stream lands on the plant (falling water reaches it from a little above)
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
/* MASH (Jackie, Nov 23): food only for the young. A jar of green mash in the mini fridge, first on the tray, fed by dragging like a
   treat. Only a kid eats it (a seed or sprout has no mouth yet; teens and adults are too big for it). It is plain food: it fills the
   kid up and pleases it, and changes nothing about who the kid grows into. A full kid dozes off, as a full monster does. */
const MASH={id:'mash',name:'Mash',s:'slurp',young:true},MASH_FULL=.4;
/* THE BOOKS (Jackie, Nov 15): twelve, each nudging a monster a little (ge: sweet + / spooky -, lc: tidy + / wiggly -). What's inside is in
   js/stories.js; where each can be found is BOOK_ZONES below (four at a time, by where you tap). */
const BOOKS=[{id:'fairy',name:'Fairy tales',ge:.08,lc:0},{id:'almanac',name:'Sloth’s Almanac',ge:0,lc:.08},{id:'nonsense',name:'Nonsense poems',ge:0,lc:-.08},{id:'grimoire',name:'Forbidden grimoire',ge:-.1,lc:-.02},
 {id:'songs',name:'Song book',ge:.06,lc:.02},{id:'stars',name:'The star book',ge:0,lc:-.03},{id:'riddles',name:'Cats',ge:0,lc:-.06},{id:'proverbs',name:'Proverbs',ge:.02,lc:.06},
 {id:'letters',name:'Letters and diaries',ge:.05,lc:.02},{id:'recipes',name:'Recipes',ge:.03,lc:.05},{id:'ghost',name:'Ghost stories',ge:-.06,lc:-.02},{id:'field',name:'Field guide',ge:0,lc:.04}];
const BOOK_BY=id=>BOOKS.find(b=>b.id===id);
// what a monster does while listening, the caption when a read begins
const BOOK_SAY={fairy:'listens to the fairy tale, very still.',almanac:'nods along to Sloth’s Almanac.',nonsense:'giggles at the nonsense poems.',grimoire:'leans in for the forbidden spells.',
 songs:'sways along to the song.',stars:'gazes up, dreamy, at the star book.',riddles:'listens closely to the book about cats.',proverbs:'nods slowly at the old sayings.',
 letters:'listens to the old letter, cozy.',recipes:'smacks its lips at the recipe.',ghost:'shivers happily at the ghost story.',field:'peers closely at the field guide.'};
const READ_POT={fairy:'candy',almanac:'plaid',nonsense:'rainbow',grimoire:'eye'},READ_AT=10; // a pot after 10 reads of one of the first four books (Jackie, Nov 15); the new books count their reads from zero, no reward yet
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
   if(P.l==='lawful'&&onTime&&st.stage>=4){msSet(st,'routine');st.needs.attention=Math.max(0,st.needs.attention-.15);setTimeout(()=>burst('heart',b.x+b.w*.15,b.y-20,2),1300);const f=notice('tidy',QUIRK_TXT.tidy);tell('Right on time! '+who()+' loves a routine.',f?{kind:'teach',key:'quirk_tidy',who:st.id}:{kind:'info',who:st.id});}
   if(st.stage>=4)setTimeout(()=>doMove(),1300);
   if(P.l==='lawful'&&onTime&&st.stage>=4){}else if(st.stage>=4&&quiet()&&Math.random()<.6)setTimeout(()=>{if(ambientOK())tell(line('water'),{kind:'ambient',who:st.id});},1400);}
  st.needs.thirst=0;held.tool=null;return;}
 if(held.tool==='mash'){const W=who();held.tool=null;sfx('slurp');burst('crumb',b.x+b.w/2,b.y+b.h*.5,6,'#a9bf3c');
  setTimeout(()=>{plantBoing(b.x+b.w/2);sfx('pop');burst('heart',b.x+b.w*.15,b.y-20,2);},350);
  st.full=clamp((st.full||0)+MASH_FULL,0,1);st.needs.attention=Math.max(0,st.needs.attention-.2);logEv('Mash');bump('mash');
  if(st.full>.6){setTimeout(()=>{sfx('burp');st.nap=60;},900);tell('Burp! '+W+' is so full it\'s dozing off.',{kind:'info',who:st.id});}
  else tell(W+' eats a spoonful of mash.',{kind:'info',who:st.id});
  save();return;}
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
 if(held.tool==='book'){const bk=held.item;sfx('paper');st.listen=4;const was=st.needs.attention;st.needs.attention=Math.max(0,was-.6);if(was>.6)met('attention');
  st.ge=clamp(st.ge+bk.ge,-1,1);st.lc=clamp(st.lc+bk.lc,-1,1);held.tool=null;logEv(bk.name);if(bump('read_'+bk.id)>=READ_AT&&READ_POT[bk.id])earnPot(READ_POT[bk.id]);
  tell(who()+' '+BOOK_SAY[bk.id],{kind:'info',who:st.id});}}
/* FEEDING (Jackie, Nov 4): simple and satisfying with a finger or a mouse.
   Tap the SNACKS cabinet: a small cream tray beside it holds the seven treats in a row (thumb-sized, no words).
   Press a treat and drag: it follows the finger, drawn a little above and to the side so the thumb doesn't hide it.
   Over a monster that can eat (teen or adult, awake, not full) that monster opens its mouth (mouthB_02); the drop area is its
   whole body plus a generous margin. Let go there: chomp (closed-open-closed) with a 2 px squash, then its usual treat reaction.
   Let go anywhere else, or over one that can't eat: the treat just goes back to the tray. The tray hides when you tap away,
   or a few seconds after the last treat. Pointer events, so a mouse drag works the same way. */
const feed={item:null,x:0,y:0,over:null,trayT:0},CHOMP=new Map(),CHOMP_MS=110,TRAY_HIDE=4000;let trayEl=null;
function openSnacks(){sfx('tick');if(!trayEl){trayEl=document.createElement('div');trayEl.className='ttray tsb';
  for(const s of [MASH].concat(SNACKS)){const b=document.createElement('button');b.type='button';b.className='ttreat';b.dataset.id=s.id;b.setAttribute('aria-label',s.name);
   const im=document.createElement('img');im.src=TREAT_IMG[s.id].src;im.alt='';im.draggable=false;b.appendChild(im);
   b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();grabTreat(s,e);});trayEl.appendChild(b);}
  trayEl.addEventListener('pointerdown',e=>e.stopPropagation());trayEl.addEventListener('click',e=>e.stopPropagation());ui.appendChild(trayEl);}
 placeTray();trayKeep();}
// trays sit well clear of the bottom edge: on a phone, a drag that starts near the bottom can swipe the whole app away (Jackie, Nov 10)
function trayTop(h){return H*S-h-Math.max(48,H*S*.14);}
function placeTray(){if(!trayEl)return;const w=trayEl.offsetWidth,h=trayEl.offsetHeight; // along the bottom, ending under the cabinet: over the rug and pots, never a face
 trayEl.style.left=Math.round(clamp((JAR.x+JAR.w)*S-w,4,W*S-w-4))+'px';trayEl.style.top=Math.round(trayTop(h))+'px';}
function trayKeep(){feed.trayT=performance.now();}
function closeTray(){if(trayEl){trayEl.remove();trayEl=null;}}
cv.addEventListener('pointerdown',()=>{if(!feed.item)closeTray();}); // tap away
// where the treat is drawn: a little above the finger and to the side (away from the thumb), in room units
function feedPos(e){const [x,y]=toGame(e);feed.x=x+(rightHand()?-30:30)/S;feed.y=y-46/S;}
function grabTreat(s,e){feed.item=s;feedPos(e);feedOver();trayKeep();sfx('pop');
 addEventListener('pointermove',feedMove);addEventListener('pointerup',feedUp);addEventListener('pointercancel',feedUp);}
function feedMove(e){if(!feed.item)return;feedPos(e);feedOver();}
function canEat(s=feed.item){const age=s&&s.young?st.stage>=4&&st.stage<6:st.stage>=6;return age&&st.nap<=0&&!st.night&&(st.full||0)<=.6;} // mash is for kids, treats for teens and adults
// the monster under the treat (the frontmost if two overlap): its whole body plus a generous margin
function feedTarget(x,y){let best=null,by=-1;eachPlant(()=>{if(st.stage<0)return;const b=plantBox(),m=40+b.w*.12;
  if(x>=b.x-m&&x<=b.x+b.w+m&&y>=b.y-m&&y<=baseY()+m*.5&&baseY()>by){by=baseY();best={id:st.id,eat:canEat()};}});return best;}
function feedOver(){const t=feedTarget(feed.x,feed.y);feed.over=t&&t.eat?t.id:null;}
function feedUp(){removeEventListener('pointermove',feedMove);removeEventListener('pointerup',feedUp);removeEventListener('pointercancel',feedUp);
 const s=feed.item,id=feed.over;feed.item=null;feed.over=null;trayKeep();if(!s)return;
 if(id==null){sfx('tick');const t=feedTarget(feed.x,feed.y);if(t)withPlant(t.id,()=>{const say=x=>{plantBoing(plantBox().x+plantBox().w/2);tell(x,{kind:'info',who:st.id});};
   if(s.young){if(st.stage>=6)say(who()+' is too big for mash.');else if(st.stage<4)say('Too little for mash yet.');else if(st.nap<=0&&!st.night&&(st.full||0)>.6)say(who()+' is full. Maybe later.');}
   else if(st.stage>=4&&st.stage<6)say(who()+' is too little for big monster food. Try the mash.');});return;} // back to the tray; a kid says why
 const i=(st.others||[]).findIndex(q=>q.id===id);if(i>=0){swapIn(i);ACT=st.id;} // the one you fed becomes the one you're tending
 CHOMP.set(id,performance.now());sfx(s.s);
 setTimeout(()=>withPlant(id,()=>{held.tool=s.young?'mash':'snack';held.item=s;useTool();}),CHOMP_MS*3);}
// mouth while feeding: open over a treat; chomp = closed, open, closed (one 110 ms frame each)
function feedMouth(){const t=CHOMP.get(st.id);if(t!=null){const f=Math.floor((performance.now()-t)/CHOMP_MS);if(f<3)return f===1?2:8;CHOMP.delete(st.id);}return feed.item&&feed.over===st.id?2:0;}
function chompDip(){const t=CHOMP.get(st.id);if(t==null)return 0;const f=Math.floor((performance.now()-t)/CHOMP_MS);return f===1?2:0;} // squash 2 px down on the open frame, back up after
function drawFeed(){if(trayEl&&!feed.item&&performance.now()-feed.trayT>TRAY_HIDE)closeTray();if(!feed.item)return;const im=TREAT_IMG[feed.item.id];if(!ok(im))return;
 const k=.4*overK(feed.x,feed.y),w=Math.round(im.naturalWidth*k),h=Math.round(im.naturalHeight*k);g.drawImage(im,Math.round(feed.x-w/2),Math.round(feed.y-h/2),w,h);}
addEventListener('resize',()=>setTimeout(placeTray,50));
/* READING (Jackie, Nov 7): touch any book on either bookshelf and a small cream tray slides out with four of the twelve books (which four depends on where you touched; BOOK_ZONES)
   (pixel covers drawn here, each its own color and little emblem). Press one and drag it to a monster that's awake and has its
   eyes open (kid, teen or adult); let go there and it reads in the room: an open book in front of it, a page flipping every
   moment (a 2-frame swap), a few tiny symbols from that book rising on whole pixels, for about 8 s. Then the book closes and
   hops back to the shelf. Let go anywhere else and the book just goes back to the tray. Same feel as the treat tray. */
// tap areas: the rows of books on both bookcases, kept clear of the cat's framed picture, the jar, the lockbox, the floor lamp, the crystal ball and the moon trunk
// Each place holds its own four books (Jackie, Nov 15: only four at a time, depending on where you tap): every book can be found in three or four places.
const BOOK_ZONES=[
 {x:4,y:140,w:208,h:86,books:['fairy','almanac','nonsense','grimoire']}/* left bookcase, top row */,{x:4,y:246,w:134,h:86,books:['songs','stars','letters','field']},
 {x:4,y:354,w:46,h:84,books:['riddles','proverbs','recipes','ghost']},{x:4,y:456,w:88,h:90,books:['fairy','songs','ghost','stars']},{x:4,y:558,w:200,h:88,books:['almanac','field','recipes','letters']},
 {x:138,y:664,w:72,h:76,books:['stars','riddles','grimoire','ghost']}/* beside the lockbox */,
 {x:1482,y:316,w:158,h:78,books:['nonsense','riddles','songs','proverbs']}/* right bookcase, the full row */,
 {x:1482,y:498,w:60,h:64,books:['letters','proverbs','almanac','fairy']},{x:1546,y:498,w:92,h:64,books:['field','recipes','grimoire','nonsense']}]; // a monster or the cat sitting there is tapped first
function bookZone(x,y){return BOOK_ZONES.find(r=>inR(x,y,r))||null;}
function onBookshelf(x,y){return !!bookZone(x,y);}
const BOOK_LOOK={fairy:{c:C.coral,d:C.brick,e:['.y.','yyy','.y.']},almanac:{c:C.blue,d:C.navy,e:['yyy','y.y','yyy']},
 nonsense:{c:C.fl3,d:C.fl2,e:['vv.','..v','vv.']},grimoire:{c:'#4a2a4f',d:'#2d1824',e:['.w.','wyw','.w.']},
 songs:{c:'#e98aa8',d:'#a8466a',e:['.ii','.i.','ii.']}/* a note */,stars:{c:C.navy,d:'#14284f',e:['y.y','.y.','y.y']}/* a twinkle */,riddles:{c:C.vio,d:C.plum,e:['ii.','..i','.i.','...','.i.']}/* a question mark */,
 proverbs:{c:C.sand,d:C.rust,e:['ooo','s.s','ooo']}/* a scroll */,letters:{c:C.cream,d:C.peach,e:['oooo','o..o','oooo']}/* an envelope */,recipes:{c:C.g3,d:C.g1,e:['.o.','ooo','.o.','.o.']}/* a spoon */,
 ghost:{c:'#6b7888',d:'#3c4652',e:['.i.','iii','i.i']}/* a little ghost */,field:{c:C.g2,d:C.g1,e:['..i','.ii','i..']}/* a leaf */};
const BPAL={y:C.fl3,v:C.vio,w:C.lav,i:C.ivory,s:C.sand,o:C.out};
/* THE COVERS (Jackie, Nov 17): each book has its own illustrated cover, cut from Jackie's sheet (books/, 42 x 60). The tray, the
   journal's favorite story and the book hopping home show it at its own size; the book in your hand is twice that. Whole pixels,
   a dark outline. Until a cover's picture has loaded, the old drawn book stands in. */
const BOOK_COVER={};for(const b of BOOKS)BOOK_COVER[b.id]=img('books/'+b.id+'.png');
function bookPix(id,px){const im=BOOK_COVER[id];if(!ok(im))return bookPixOld(id,px);const k=px>=5?2:1,o=2*k,c=document.createElement('canvas');c.width=im.naturalWidth*k+2*o;c.height=im.naturalHeight*k+2*o;
 const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle=C.out;x.fillRect(0,0,c.width,c.height);x.drawImage(im,o,o,im.naturalWidth*k,im.naturalHeight*k);c.dataset.cover=id;return c;}
// the old drawn book, 10x13 art pixels: spine on the left, pages showing on the right edge, emblem on the cover
function bookPixOld(id,px){const L=BOOK_LOOK[id],w=10,h=13,c=document.createElement('canvas');c.width=(w+2)*px;c.height=(h+2)*px;const x=c.getContext('2d');
 const cell=(i,j,col)=>{x.fillStyle=col;x.fillRect((i+1)*px,(j+1)*px,px,px);};x.fillStyle=C.out;x.fillRect(0,0,c.width,c.height);
 for(let j=0;j<h;j++)for(let i=0;i<w;i++)cell(i,j,i<2?L.d:i===w-1?C.ivory:L.c);
 for(let j=1;j<h-1;j+=3)cell(w-1,j,C.sand); // page lines
 L.e.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch!=='.')cell(4+i,5+j,BPAL[ch]);}));
 cell(2,0,C.ivory);cell(3,0,C.ivory);return c;} // a little highlight
const BOOK_CACHE=new Map();function bookImg(key,make){if(BOOK_CACHE.has(key))return BOOK_CACHE.get(key);const c=make();if(c.dataset.cover)BOOK_CACHE.set(key,c);return c;} // kept once its cover has loaded
const bookDrag={item:null,x:0,y:0,over:null,trayT:0};let btrayEl=null;
const READ=new Map(),BOOK_HOP=.6; // id -> {bk,from,page}; flights: closed books hopping back to the shelf
const bookHops=[];
function openBooks(ids=BOOK_ZONES[0].books){sfx('paper');if(btrayEl&&btrayEl.dataset.ids!==ids.join())closeBookTray();if(!btrayEl){btrayEl=document.createElement('div');btrayEl.className='ttray btray tsb';btrayEl.dataset.ids=ids.join();
  for(const bk of ids.map(BOOK_BY)){const b=document.createElement('button');b.type='button';b.className='ttreat tbook';b.dataset.id=bk.id;b.setAttribute('aria-label',bk.name);
   const c=bookPix(bk.id,3);c.className='jpix';b.appendChild(c);const nm=document.createElement('span');nm.className='tbname';nm.textContent=bk.name;b.appendChild(nm); // what kind of book it is, under its cover (Jackie, Nov 17)
   b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();grabBook(bk,e);});btrayEl.appendChild(b);}
  btrayEl.addEventListener('pointerdown',e=>e.stopPropagation());btrayEl.addEventListener('click',e=>e.stopPropagation());ui.appendChild(btrayEl);}
 placeBookTray();bookDrag.trayT=performance.now();}
function placeBookTray(){if(!btrayEl)return;const w=btrayEl.offsetWidth,h=btrayEl.offsetHeight; // along the bottom of the room, like the treat tray
 btrayEl.style.left=Math.round(clamp(W*S/2-w/2,4,W*S-w-4))+'px';btrayEl.style.top=Math.round(trayTop(h))+'px';}
function closeBookTray(){if(btrayEl){btrayEl.remove();btrayEl=null;}}
cv.addEventListener('pointerdown',()=>{if(!bookDrag.item)closeBookTray();});
addEventListener('resize',()=>setTimeout(placeBookTray,50));
function bookPos(e){const [x,y]=toGame(e);bookDrag.x=x+(rightHand()?-30:30)/S;bookDrag.y=y-46/S;}
function grabBook(bk,e){bookDrag.item=bk;bookDrag.sx=e.clientX;bookDrag.sy=e.clientY;bookDrag.btn=e.currentTarget&&e.currentTarget.getBoundingClientRect?e.currentTarget.getBoundingClientRect():null;bookDrag.moved=false;bookPos(e);bookOver();bookDrag.trayT=performance.now();sfx('paper');
 addEventListener('pointermove',bookMove);addEventListener('pointerup',bookUp);addEventListener('pointercancel',bookUp);}
function bookMove(e){if(!bookDrag.item)return;if(Math.hypot(e.clientX-bookDrag.sx,e.clientY-bookDrag.sy)>10)bookDrag.moved=true;bookPos(e);bookOver();}
function canRead(){return st.stage>=4&&st.nap<=0&&!st.night;}
// who listens when you just tap a book: the monster you're tending, else the other one if it's awake
function listener(){let L=null;if(canRead())L=st.id;else eachPlant(()=>{if(L==null&&canRead())L=st.id;});return L;}
function bookOver(){let best=null,by=-1;const x=bookDrag.x,y=bookDrag.y;eachPlant(()=>{if(st.stage<0)return;const b=plantBox(),m=40+b.w*.12;
  if(x>=b.x-m&&x<=b.x+b.w+m&&y>=b.y-m&&y<=baseY()+m*.5&&baseY()>by){by=baseY();best=canRead()?st.id:null;}});bookDrag.over=best;}
function bookUp(){removeEventListener('pointermove',bookMove);removeEventListener('pointerup',bookUp);removeEventListener('pointercancel',bookUp);
 const bk=bookDrag.item,id=bookDrag.over,tap=!bookDrag.moved,from=bookDrag.btn;bookDrag.item=null;bookDrag.over=null;bookDrag.trayT=performance.now();if(!bk)return;
 if(tap){const L=listener();if(L==null){closeBookTray();startReading(0,bk,from);tell('Nobody is awake to listen, so you read it to yourself.',{kind:'info',now:true});return;} /* you can read whenever you want (Jackie, Nov 25): with no listener the book just opens for you, and nothing is counted for any monster */const i=(st.others||[]).findIndex(q=>q.id===L);if(i>=0){swapIn(i);ACT=st.id;}closeBookTray();startReading(L,bk,from);return;} // a tap: you read it to the monster you're tending
 if(id==null){sfx('tick');return;} // back to the tray
 const i=(st.others||[]).findIndex(q=>q.id===id);if(i>=0){swapIn(i);ACT=st.id;} // the one you read to becomes the one you're tending
 closeBookTray();startReading(id,bk);}
/* THE STORY (Jackie, Nov 7): the monster hops cozy into the armchair (if nobody's there; otherwise it reads where it is), and a
   small open book faces us with the story (js/stories.js), two pages at a time, small enough to still see the monster in the chair.
   Tap the book to turn the page (a 2-frame flip); after the last page the book closes, hops back to the shelf, and the monster
   goes back to where it was. Tap the room to close it early. */
let storyEl=null;
function startReading(id,bk,from){closeStory(true);
 if(!id)READ.set(0,{bk,from:null,page:0,s:nextRead(bk.id),solo:true}); // id 0 = nobody is listening: no monster moves, listens or changes
 else withPlant(id,()=>{held.tool='book';held.item=bk;useTool();let from=null;
  if(spotKey()!=='chair'&&!perchTaken('chair')&&spaceFree('chair')){from={perch:st.perch,free:st.free&&{...st.free}};st.perch='chair';st.walk=null;pickChair();sfx('pop');}
  READ.set(id,{bk,from,page:0,s:nextRead(bk.id)});st.listen=2;});
 storyEl=document.createElement('div');storyEl.className='story';storyEl.dataset.id=id;storyEl.style.setProperty('--bc',BOOK_LOOK[bk.id].c);
 storyEl.innerHTML='<div class="scover jstep"><div class="spage jstep sl"></div><div class="spage jstep sr"></div></div>';
 {const tag=document.createElement('div');tag.className='sbook tsb';tag.textContent=bk.name;storyEl.appendChild(tag);} // which book is open, on a tab at its top left corner
 storyEl.addEventListener('pointerdown',e=>e.stopPropagation());storyEl.addEventListener('click',e=>{e.stopPropagation();const b=storyEl.getBoundingClientRect();if((e.clientX||e.clientY)&&e.clientX<b.left+b.width/2)backStory();else turnStory();}); // the left page flips back, the right page on
 ui.appendChild(storyEl);placeStory();showStory();if(from)zoomStory(from);}
// it zooms open from the book you tapped: three quick steps (small, bigger, full), no smooth scaling
function zoomStory(r){if(tsCalm())return;const el=storyEl,b=el.getBoundingClientRect(),dx=r.left+r.width/2-(b.left+b.width/2),dy=r.top+r.height/2-(b.top+b.height/2);
 const step=s=>{if(el===storyEl)el.style.transform=`translate(${Math.round(dx*(1-s))}px,${Math.round(dy*(1-s))}px) scale(${s})`;};step(.3);setTimeout(()=>step(.65),80);
 setTimeout(()=>{if(el===storyEl)el.style.transform='';},160);}
function placeStory(){if(!storyEl)return;const X=900,Y=470,w=640,h=320; // the right half of the room, clear of the armchair
 const pw=Math.max(Math.round(w*S),430),ph=Math.max(Math.round(h*S),190); // on a phone it's never smaller than 16px words need (css/textstyle.css)
 Object.assign(storyEl.style,{left:Math.min(Math.round(X*S),Math.round(W*S)-pw-6)+'px',top:Math.min(Math.round(Y*S),Math.round(H*S)-ph-6)+'px',width:pw+'px',height:ph+'px'});}
addEventListener('resize',()=>setTimeout(placeStory,50));
function showStory(){if(!storyEl)return;const r=READ.get(+storyEl.dataset.id);if(!r)return;const P=readPages(r.s);songButton(r);
 storyPage(storyEl.querySelector('.sl'),P[r.page]);storyPage(storyEl.querySelector('.sr'),P[r.page+1]);}
// one page: words (poems keep their lines), or the title page: the title with who wrote it, or where it's told, underneath
/* A page can carry the words in their original script (Jackie, Nov 16): {o: the original, l: its language code, e: the English}.
   The original sits on top, in its own script, only where a real source text exists (js/stories.js says where it is from). */
function storyPage(el,pg){el.textContent='';el.classList.toggle('stitle',!!(pg&&pg.t));if(!pg)return;if(typeof pg==='string'){el.textContent=pg;return;}
 if(!pg.t){const box=document.createElement('span');box.className='sbi';if(pg.o){const o=document.createElement('span');o.className='sorig';o.lang=pg.l||'';o.dir='auto';o.textContent=pg.o;box.appendChild(o);}if(pg.e){const e=document.createElement('span');e.textContent=pg.e;box.appendChild(e);}el.appendChild(box);return;}
 const t=document.createElement('b');t.textContent=pg.t;el.appendChild(t);if(pg.by){const by=document.createElement('span');by.className='sby';by.textContent=pg.by;el.appendChild(by);}}
/* THE SONG BOOK (Jackie, Nov 17): a read about a real song carries its record from the crates (rec, js/stories.js). The open
   book then has a Play the record button: it streams the old record, and a caption says who is playing. Tap it again or close
   the book to stop; it keeps playing while you turn the pages. The radio pauses while it plays and comes back after.
   (Tried first and dropped, Jackie: "that looks bad": chords over the words and a tune played by the game.) */
let song=null; // the record that's playing: {el, s}
function isSong(s){return !!(s&&s.rec);}
function songButton(r){let b=storyEl.querySelector('.splay');if(!isSong(r.s)){if(b)b.remove();if(song)songStop();return;}
 if(song&&song.s!==r.s)songStop(); // flipped back to another read
 if(!b){b=document.createElement('button');b.type='button';b.className='splay tsb';storyEl.appendChild(b);
  b.addEventListener('click',e=>{e.stopPropagation();if(song)songStop();else songPlay();});}
 b.textContent=song?'Stop':'Play the record';}
function songStop(){if(!song)return;const a=song.el;song=null;a.onended=a.onerror=null;try{a.pause();a.removeAttribute('src');a.load();}catch(e){}radioHold(false);
 if(storyEl){const b=storyEl.querySelector('.splay');if(b)b.textContent='Play the record';}}
function songPlay(){if(!storyEl)return;const r=READ.get(+storyEl.dataset.id);if(!r||!isSong(r.s))return;const rec=r.s.rec;radioHold(true);
 const a=new Audio();a.setAttribute('playsinline','');a.volume=.8;a.src='https://archive.org/download/'+encodeURIComponent(rec.id)+'/'+rec.f.split('/').map(encodeURIComponent).join('/');
 song={el:a,s:r.s};const me=song,fail=()=>{if(song!==me)return;songStop();tell('The record wouldn’t play. It needs the internet.',{kind:'info'});};
 a.onended=()=>{if(song===me)songStop();};a.onerror=fail;const p=a.play();if(p&&p.catch)p.catch(fail);
 tell('Playing “'+r.s.t+'”, '+rec.by+'.',{kind:'info'});songButton(r);}
function turnStory(){if(!storyEl||storyEl.dataset.turning)return;const id=+storyEl.dataset.id,r=READ.get(id);if(!r)return closeStory();
 if(r.page+2>=readPages(r.s).length)return closeStory();sfx('page');if(tsCalm()){r.page+=2;showStory();return;} // reduce motion: the next pages just appearstoryEl.dataset.turning=1;
 const f=document.createElement('div');f.className='sturn sturn1 jstep';storyEl.querySelector('.scover').appendChild(f); // the right page lifts
 setTimeout(()=>{f.className='sturn sturn2 jstep';},90); // and lands on the left
 setTimeout(()=>{f.remove();r.page+=2;delete storyEl.dataset.turning;showStory();},180);}
/* Flipping back (Jackie, Nov 15): tap the left page. It turns back two pages (the same 2-frame flip, the other way); from the title
   page it goes back to the read before this one in the same book, opened at its title. At the very first read there's nothing
   before, so nothing happens. */
function backStory(){if(!storyEl||storyEl.dataset.turning)return;const id=+storyEl.dataset.id,r=READ.get(id);if(!r)return closeStory();
 let to=null;if(r.page>=2)to={page:r.page-2};else{const s=prevRead(r.bk.id,r.s);if(s)to={page:0,s};}
 if(!to){sfx('tick');return;}const go=()=>{Object.assign(r,to);showStory();};sfx('page');if(tsCalm()){go();return;}storyEl.dataset.turning=1;
 const f=document.createElement('div');f.className='sturn sturn2 jstep';storyEl.querySelector('.scover').appendChild(f); // the left page lifts
 setTimeout(()=>{f.className='sturn sturn1 jstep';},90); // and lands on the right
 setTimeout(()=>{f.remove();delete storyEl.dataset.turning;go();},180);}
function closeStory(quiet){if(!storyEl)return;songStop();const id=+storyEl.dataset.id,r=READ.get(id);storyEl.remove();storyEl=null;if(!r)return;READ.delete(id);
 if(!quiet)sfx('paper');bookHops.push({id:r.bk.id,x:1220,y:630,t0:performance.now()}); // the closed book hops home
 if(r.from)withPlant(id,()=>{st.perch=r.from.perch;if(r.from.free)st.free=r.from.free;st.walk=null;pickChair();});save();}
cv.addEventListener('pointerdown',()=>{if(storyEl&&!bookDrag.item)closeStory();}); // tap the room: close the book
function drawReading(){const now=performance.now();
 if(storyEl){const id=+storyEl.dataset.id;let gone=!!id;if(id)withPlant(id,()=>{gone=st.nap>0||st.night;if(!gone)st.listen=Math.max(st.listen,.5);});if(gone||!READ.has(id))closeStory();} // eyes softly closed while it listens
 for(let i=bookHops.length-1;i>=0;i--){const h=bookHops[i],u=(now-h.t0)/1000/BOOK_HOP;if(u>=1){bookHops.splice(i,1);continue;} // the closed book hops back to the shelf
  const sx=SHELF.x+SHELF.w/2,sy=SHELF.y+SHELF.h/2,px=4,x=Math.round((h.x+(sx-h.x)*u)/px)*px,y=Math.round((h.y+(sy-h.y)*u-Math.sin(u*Math.PI)*90)/px)*px,im=bookImg('c'+h.id,()=>bookPix(h.id,px));
  g.drawImage(im,x-im.width/2,y-im.height/2);}
 if(btrayEl&&!bookDrag.item&&now-bookDrag.trayT>TRAY_HIDE)closeBookTray();
 if(bookDrag.item){const im=bookImg('c'+bookDrag.item.id+'_'+5,()=>bookPix(bookDrag.item.id,5));g.drawImage(im,Math.round(bookDrag.x-im.width/2),Math.round(bookDrag.y-im.height/2));}}
