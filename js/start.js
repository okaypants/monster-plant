'use strict';
/* Start: title screen, seed quiz, welcome back, goodnight and morning. */
// quiz: four traits, each with a pool of cute questions; answer index -> bit
const QUIZ=[
 [['Rainy day or sunny day?','Rainy day','Sunny day'],['Pick a cloud shape:','A fluffy puff','A pointy wisp'],['Pebble or crystal?','A smooth pebble','A sharp crystal']],
 [['Nap in a teacup or a hammock?','A teacup','A hammock'],['Hide under a mushroom or a tall fern?','A mushroom','A tall fern'],['Snack size?','A tiny crumb','A long noodle']],
 [['Whisper a secret or giggle loudly?','Giggle loudly','Whisper a secret'],['Stretch up or flop down?','Stretch up','Flop down'],['Morning bird or sleepy moth?','Morning bird','Sleepy moth']],
 [['Honey toast or a pickle?','Honey toast','A pickle'],['Smooth stone or crunchy leaf?','Smooth stone','Crunchy leaf'],['Bubble bath or leaf pile?','Bubble bath','Leaf pile']]];

/* ---------- day cycle ---------- */
function tuckIn(){if(st.stage>=4)setTimeout(()=>earnPot('moon'),2600);closeBubble();held.tool=null;sfx('sigh');const start=st.dayT,t0=performance.now();
 const step=()=>{const k=Math.min(1,(performance.now()-t0)/2500);st.dayT=start+(.9-start)*k;if(k<1)requestAnimationFrame(step);else{st.night=true;tell('Goodnight, sleep tight, the bed bugs are nice here. Tap anywhere to sleep.',{kind:'important'});}};step();}
function wake(){eachPlant(()=>{if(st.stage>=0)wakePlant();});wakeRoom();}
function wakePlant(){const q=['thirst','attention','light'].filter(n=>st.met[n]).length/3;
 st.lc=clamp(st.lc+(Object.keys(st.met).length>=2?.05:-.05),-1,1);const ng=st.nge||0,nl=st.nlc||0;st.ge=ng+(st.ge-ng)*.9;st.lc=nl+(st.lc-nl)*.9; // drifts back toward its NATURE, not toward bland
 if(st.stage<4){st.stage=4;st.timer=0;}
 else{st.credit+=.3+.7*q;st.lastNight=q>=.99?'well':''; // wakeRoom names who slept well // only a perfect day gets a line: nothing that feels like being gradedif(q>=.99&&bump('perfectDays')>=5)earnPot('gold');
   if(st.credit>=1&&st.stage<8){st.stage=NEXT[st.stage]??8;st.credit=0;if(st.stage===6)earnPot('drip');if(st.stage===8)earnPot('speckle');
   const gid=st.id,gw=who(),gt=st.stage===6?gw+' is already a teen with big ideas and a bigger pot.':st.stage===8?gw+' is all grown up and ready to eat everything!':gw+' is a '+STAGES[st.stage]+' now, in a bigger pot.';
   setTimeout(()=>{sfx('chime');sfx('boing');tell(gt,{kind:'important',who:gid});},600);}}
 st.met={};st.lightGood=0;st.needs.thirst=Math.max(st.needs.thirst,.65);
 // COMMITMENT (Jackie): a charm stays while you keep giving its treat; after KEEP days without it, the charm drifts away (it comes back faster: 3 treats)
 const KEEP=3,FADE_WORD={solar:'sunny',peat:'moss',cotton:'sugar',pizza:'pizza',plants:'flower',fossil:'dino',blood:'blood'};st.tLast=st.tLast||{};const faded=[];
 for(const t of SNACKS){if((st.traits||[]).includes(t.trait)&&st.day-(st.tLast[t.id]||st.day)>KEEP){st.traits=st.traits.filter(x=>x!==t.trait);st.dormant=(st.dormant||[]).concat(t.trait);st.treats[t.id]=0;if(st.wear===t.trait)st.wear=null;faded.push(t);}}
 if(faded.length){const fw=who();setTimeout(()=>tell(fw+', no longer a '+faded.map(t=>FADE_WORD[t.id]).join(' or ')+'-monster? Try a new snack for a new accessory and trait.',{kind:'info'}),5500);}
}
function wakeRoom(){st.day++;st.dayT=0;st.night=false;sfx('chime');
 const d=new Date(),season=seasonNow();
 const slept=allRaw().filter(q=>q.stage>=4&&q.lastNight),all=allRaw().filter(q=>q.stage>=4); // who slept well, by name
 const well=!slept.length?'':slept.length>1&&slept.length===all.length?' Both slept well and their dreams were pleasant and relaxing.':' '+slept.map(q=>nameOf(q,true)).join(' and ')+(slept.length>1?' slept well and their dreams were':' slept well and its dreams were')+' pleasant and relaxing.';
 tell(`Morning! Day ${st.day}.`+well,{kind:'important'});bugArrive();save();}
/* ---------- start + quiz ---------- */
/* WELCOME BACK (Jackie, Nov 7): it tells you what happened while you were away, in fun ways that fit each monster's nature, mood
   and friendships, and EVERYTHING it says is really there in the room: the game makes it happen first, then says it.
   Away a while (30+ min): everyone got a little thirsty (they're paler); one thing per monster or pair, picked from what's true of them:
     friends -> they scooted close together;  bickering -> they're sulking on opposite sides (grumpy faces, then they make up);
     very chaotic -> bouncing in moon gravity;  chaotic -> wandered to a new spot;  away 6+ hours -> one dozed off (Zzz).
   The cat: curls up by a monster it naps with (or a sweet one, once fond of you); keeps far away from a spooky one; else naps somewhere.
   The greeting is a small thing the monster does right then (a heart, a nod, a wiggle, a sly grin, a bounce), not a claim about before. */
const AREA=x=>x<520?'by the window':x<980?'by the armchair':'by the desk';
function onFloor(q){let f=false;withPlant(q.id,()=>{f=st.stage>=4&&spotKey()==='free'&&!st.float;});return f;}
function moveTo(q,x){withPlant(q.id,()=>{const c=nearestClearFloor(clamp(x,FLOOR_X0+80,FLOOR_X1-80),st.free?st.free.y:FLOOR_FRONT);if(c){st.free=c;st.walk=null;}});}
function awayStory(away){const bits=[],P=allRaw().filter(q=>q.stage>=4),cap=t=>t.charAt(0).toUpperCase()+t.slice(1),nm=q=>nameOf(q,true);
 if(away>30){eachPlant(()=>{if(st.stage>=0)st.needs.thirst=Math.max(st.needs.thirst,.55);});const n=allRaw().filter(q=>q.stage>=0).length;bits.push(n===2?'Both got a little thirsty.':allNames(true).text+' got a little thirsty.');}
 let used=new Set();
 if(away>30&&P.length===2&&onFloor(P[0])&&onFloor(P[1])){const [a,b]=P,r=rel(a,b);
  if(r==='friends'){let wa=0,wb=0;withPlant(a.id,()=>{wa=plantBoxRaw().w;});withPlant(b.id,()=>{wb=plantBoxRaw().w;});const gap=wa/2+wb/2+30; // side by side, never overlapping
   let x=a.free.x+(a.free.x<835?gap:-gap);if(x>FLOOR_X1-60||x<FLOOR_X0+60)x=a.free.x-(a.free.x<835?gap:-gap);withPlant(b.id,()=>{st.free={x:Math.round(x),y:a.free.y};st.walk=null;});used=new Set([a.id,b.id]);bits.push(nm(a)+' and '+nm(b)+' scooted close together.');}
  else if(r==='bicker'){const left=a.free.x<=b.free.x?a:b,right=left===a?b:a;moveTo(left,FLOOR_X0+120);moveTo(right,FLOOR_X1-120);for(const q of [a,b])withPlant(q.id,()=>{st.grump=6;});used=new Set([a.id,b.id]);
   bits.push(nm(a)+' and '+nm(b)+' are sulking on opposite sides of the room.');setTimeout(()=>{sfx('chime');for(const q of [a,b])withPlant(q.id,()=>{const bb=plantBox();burst('heart',bb.x+bb.w/2,bb.y-20,2);});tell('…and they made up. They always do.',{kind:'info',key:'madeup'});},7000);}}
 if(away>30)for(const q of P){if(used.has(q.id)||bits.length>=3)continue;let said='';
  withPlant(q.id,()=>{const p=pers(),floor=spotKey()==='free'&&!st.float;
   if(p.l==='chaotic'&&floor&&st.lc<=-.6){st.float={h:0,vh:280,vx:(Math.random()<.5?-1:1)*55};said=who()+' is bouncing around in moon gravity. Drag '+who()+' back down!';}
   else if(p.l==='chaotic'&&floor){const x=st.free.x<835?rnd(1000,1350):rnd(300,650),c=nearestClearFloor(x,st.free.y);if(c&&Math.abs(c.x-st.free.x)>200){st.free=c;st.walk=null;said=who()+' wandered over '+AREA(c.x)+'.';}}
   else if(away>360&&!said){st.nap=45;said=who()+' dozed off waiting for you.';}});
  if(said){bits.push(said);used.add(q.id);}}
 // the cat: by a monster it naps with (or a sweet one once fond of you), far from a spooky one, else somewhere cozy
 const bond=q=>((st.catBond||{})[q.id]||{}).bond||0,sweet=P.find(q=>q.ge>.33)||null,spooky=P.find(q=>q.ge<-.33)||null;
 const buddy=P.slice().sort((x,y)=>bond(y)-bond(x)).find(q=>bond(q)>0)||(catTrust()>=TRUST_FOND?sweet:null);
 let ps=null;if(buddy)withPlant(buddy.id,()=>{ps=plantSideSpot();});
 if(ps){CAT_SPOTS.byplant=ps;cat.spot='byplant';cat.x=ps.x;cat.y=ps.y;cat.sc=ps.sc;cat.pose='loaf';cat.state='sleep';cat.nap=rnd(40,90);cat.pets=0;bits.push(catName()+' curled up next to '+nm(buddy)+'.');}
 else{const ks=Object.keys(CAT_SPOTS).filter(k=>k!=='byplant'&&catSpotFree(k));let k=ks[Math.floor(Math.random()*ks.length)],far=false;
  if(spooky&&ks.length){let sx=0;withPlant(spooky.id,()=>{const b=plantBox();sx=b.x+b.w/2;});k=ks.slice().sort((x,y)=>Math.abs(CAT_SPOTS[y].x-sx)-Math.abs(CAT_SPOTS[x].x-sx))[0];far=Math.abs(CAT_SPOTS[k].x-sx)>500;}
  if(k){const sp=CAT_SPOTS[k];cat.spot=k;cat.x=sp.x;cat.y=sp.y;cat.sc=sp.sc;cat.pose=sp.poses[0];cat.state='sleep';cat.nap=rnd(40,90);
   bits.push(far?catName()+' is napping as far from '+nm(spooky)+' as possible.':catName()+' napped on '+({bed:'the cat bed',rug:'the rug',chair:'the armchair',sill:'the windowsill',crate:'the milk crate',books:'the book stack'})[k]+'.');}}
 return bits;}
// the greeting: something the monster does right now, so you see it
function greetNow(){if(st.stage<4)return '';const p=pers(),b=plantBox(),W=who();
 if(p.g==='evil'){st.spookT=1.4;return W+' gives you a sly little grin.';}
 if(p.g==='good'){burst('heart',b.x+b.w/2,b.y-20,3);return W+' sends you a little heart.';}
 if(p.l==='chaotic'){st.tidyT=1.2;return W+' does a happy wiggle.';}
 if(p.l==='lawful'){st.bonkT=.5;st.bonkDir=1;return W+' gives you a small, proper nod.';}
 plantBoing(b.x+b.w/2);return W+' perks up.';}
function welcomeBack(){const away=LOADED_LAST_SEEN?(Date.now()-LOADED_LAST_SEEN)/60000:0;const bits=awayStory(away);
 setTimeout(()=>{if(st.stage>=4){const b=plantBox();plantBoing(b.x+b.w/2);sfx('giggle');}
  const A=allNames(true),t=!A.text||away<2?'Welcome back!':away<60?'Welcome back! '+A.text+' missed you.':away<1440?'Welcome back! '+A.text+(A.plural?' are':' is')+' so happy to see you.':'You\'re back! '+A.text+' waited for you.';
  const g=Math.random()<.5?greetNow():'';
  tell(t+(g?' '+g:''),{kind:'important'}); // short captions, one after another: the hello, then each thing that happened
  bits.forEach((x,i)=>tell((i===0?'While you were away: ':'')+x,{kind:'important',key:'away'+i}));},400);save();}
function startFlow(){
 if(st.started&&st.stage>=0){const s=screen(`<h1>Monster Plant</h1><p>Welcome back. Day ${st.day}.</p><div class="opts"><button data-k="go">Continue</button><button data-k="new">Start over</button></div>`,{go:d=>{d.remove();audioInit();welcomeBack();},new:d=>{d.remove();audioInit();st=fresh();quiz();}});return;}
 screen(`<h1>Monster Plant</h1><p>prototype v2 · your real plants</p><p>Sound on. A few silly questions decide which seed you get.</p><div class="opts"><button data-k="go">Begin</button></div>`,{go:d=>{d.remove();audioInit();quiz();}});}
// THE OPENING (Jackie, Nov 4): every new game starts in the daytime, curtains open, both lamps off
function openingRoom(){Object.assign(st,{dayT:.3,night:false,curtain:'open',lamp:false,desk:false});curK=0;}
function quiz(){openingRoom();const picks=QUIZ.map(pool=>pool[Math.floor(Math.random()*pool.length)]);let bits=0,i=0;
 const ask=()=>{const q=picks[i];sfx('pop');
  screen(`<p style="opacity:.7">Question ${i+1} of 4</p><h1 style="font-size:39px">${q[0]}</h1><div class="opts"><button data-k="a">${q[1]}</button><button data-k="b">${q[2]}</button></div>`,{a:d=>{d.remove();next(0);},b:d=>{d.remove();next(1);}});};
 const next=v=>{bits=bits*2+v;i++;if(i<4)ask();else plantSeed(bits);};ask();}
// a second plant only ever comes from Doctor Bug's note (plants.js), never from the start screen (Jackie, Nov 7)
function plantSeed(sp){
 giveNature(st);st.species=sp;
 nameStep(st,()=>{st.started=true;st.stage=0;st.timer=0;openingRoom();sfx('soil');
  tell('Hello, '+st.name+'! Your little seed is on the window sill growing, or move it to the desk and turn on the lamp.',{kind:'important'});save();});}
// its name is picked for it (js/names.js) and shared in the hello; rename it anytime by tapping its name in the journal (no naming screens)
function nameStep(p,done){if(!p.name)p.name=makeName(p);done();}
