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
 const step=()=>{const k=Math.min(1,(performance.now()-t0)/2500);st.dayT=start+(.9-start)*k;if(k<1)requestAnimationFrame(step);else{st.night=true;say('Goodnight. Click anywhere to sleep until morning.',6);}};step();}
function wake(){eachPlant(()=>{if(st.stage>=0)wakePlant();});wakeRoom();}
function wakePlant(){const q=['thirst','attention','light'].filter(n=>st.met[n]).length/3;
 st.lc=clamp(st.lc+(Object.keys(st.met).length>=2?.05:-.05),-1,1);const ng=st.nge||0,nl=st.nlc||0;st.ge=ng+(st.ge-ng)*.9;st.lc=nl+(st.lc-nl)*.9; // drifts back toward its NATURE, not toward bland
 if(st.stage<4){st.stage=4;st.timer=0;}
 else{const missing=['thirst','light','attention'].filter(n=>!st.met[n]).map(n=>({thirst:'water',light:'the right light',attention:'company'})[n]);st.credit+=.3+.7*q;st.lastNight=q>=.99?'Yesterday you covered everything it needed: water, the right light and company.':missing.length?'It would have grown faster with '+missing.join(' and ')+'.':'';if(q>=.99&&bump('perfectDays')>=5)earnPot('gold');
   if(st.credit>=1&&st.stage<8){st.stage=NEXT[st.stage]??8;st.credit=0;if(st.stage===6)earnPot('drip');if(st.stage===8)earnPot('speckle');
   setTimeout(()=>{sfx('chime');sfx('boing');say(st.stage===6?'Repotted onto the rug! Its real face is showing now. It\'s a teen!':st.stage===8?'All grown up: an adult, in its biggest pot.':'It\'s '+STAGES[st.stage]+' now, in a bigger pot.',7);},600);}}
 st.met={};st.needs.thirst=Math.max(st.needs.thirst,.65);
 // COMMITMENT (Jackie): a charm stays while you keep giving its treat; after KEEP days without it, the charm drifts away (it comes back faster: 3 treats)
 const KEEP=3;st.tLast=st.tLast||{};const faded=[];
 for(const t of SNACKS){if((st.traits||[]).includes(t.trait)&&st.day-(st.tLast[t.id]||st.day)>KEEP){st.traits=st.traits.filter(x=>x!==t.trait);st.dormant=(st.dormant||[]).concat(t.trait);st.treats[t.id]=0;if(st.wear===t.trait)st.wear=null;faded.push(t);}}
 if(faded.length)setTimeout(()=>say('Its '+faded.map(t=>t.trait.toLowerCase()).join(' and ')+' drifted away overnight. A few more '+faded.map(t=>t.name.toLowerCase()).join(' or ')+' will bring it back.',8),5500);
}
function wakeRoom(){st.day++;st.dayT=0;st.night=false;sfx('chime');
 const d=new Date(),season=['winter','winter','spring','spring','spring','summer','summer','summer','autumn','autumn','autumn','winter'][d.getMonth()];
 say(`Morning. Day ${st.day} · ${d.toLocaleString('en',{month:'long'})}, ${season}. `+(st.stage>=4&&st.lastNight?st.lastNight:''),8);save();}
/* ---------- start + quiz ---------- */
function welcomeBack(){const away=LOADED_LAST_SEEN?(Date.now()-LOADED_LAST_SEEN)/60000:0;const bits=[];
 if(away>30){st.needs.thirst=Math.max(st.needs.thirst,.55);bits.push('it got a little thirsty');}
 const ps=catTrust()>=TRUST_BFF?plantSideSpot():null;if(ps){CAT_SPOTS.byplant=ps;cat.spot='byplant';cat.x=ps.x;cat.y=ps.y;cat.sc=ps.sc;cat.pose='loaf';cat.state='sleep';cat.nap=rnd(40,90);cat.pets=0;bits.push('the cat waited right by your plant for you');}
 else{const ks=Object.keys(CAT_SPOTS).filter(k=>k!=='byplant'&&catSpotFree(k));const k=ks[Math.floor(Math.random()*ks.length)];if(k){const sp=CAT_SPOTS[k];cat.spot=k;cat.x=sp.x;cat.y=sp.y;cat.sc=sp.sc;cat.pose=sp.poses[0];cat.state='sleep';cat.nap=rnd(40,90);bits.push('the cat found a new nap spot ('+({bed:'its bed',rug:'the rug',chair:'the armchair',sill:'the windowsill',crate:'the milk crate',books:'the book stack'})[k]+')');}}
 setTimeout(()=>{if(st.stage>=4){const b=plantBox();plantBoing(b.x+b.w/2);burst('heart',b.x+b.w*.15,b.y-20,2);sfx('giggle');}
  const t=away<2?'Welcome back!':away<60?'Welcome back! It missed you.':away<1440?'Welcome back! It\'s so happy to see you.':'You\'re back! It waited for you.';
  say(t+(bits.length?' While you were away, '+bits.join(' and ')+'.':'')+(st.stage>=4?' '+line('greet'):''),7,true);},400);save();}
function startFlow(){
 if(st.started&&st.stage>=0){const s=screen(`<h1>Monster Plant</h1><p>Welcome back. Day ${st.day}.</p><div class="opts"><button data-k="go">Continue</button>${plantCount()<3?'<button data-k="add">Plant another seed</button>':''}<button data-k="new">Start over</button></div>`,{go:d=>{d.remove();audioInit();welcomeBack();},add:d=>{d.remove();audioInit();addingSeed=true;quiz();},new:d=>{d.remove();audioInit();st=fresh();quiz();}});return;}
 screen(`<h1>Monster Plant</h1><p>prototype v2 · your real plants</p><p>Sound on. A few silly questions decide which seed you get.</p><div class="opts"><button data-k="go">Begin</button></div>`,{go:d=>{d.remove();audioInit();quiz();}});}
function quiz(){const picks=QUIZ.map(pool=>pool[Math.floor(Math.random()*pool.length)]);let bits=0,i=0;
 const ask=()=>{const q=picks[i];sfx('pop');
  screen(`<p style="opacity:.7">Question ${i+1} of 4</p><h1 style="font-size:32px">${q[0]}</h1><div class="opts"><button data-k="a">${q[1]}</button><button data-k="b">${q[2]}</button></div>`,{a:d=>{d.remove();next(0);},b:d=>{d.remove();next(1);}});};
 const next=v=>{bits=bits*2+v;i++;if(i<4)ask();else plantSeed(bits);};ask();}
let addingSeed=false;
function plantSeed(sp){if(!addingSeed||!st.started)giveNature(st);if(addingSeed&&st.started){addingSeed=false;const p=freshPlant();p.species=sp;addPlant(p);sfx('soil');say('A second seed, in the other little pot. Tap a plant to tend it.',7);save();return;}
 st.species=sp;st.started=true;st.stage=0;st.timer=0;st.dayT=0;sfx('soil');
 say('A seed, tucked into the little pot on the windowsill. Drag the pot to the desk if you like. Stay a while…',7);save();}
