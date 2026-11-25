'use strict';
/* Fidgets: springy room props, snow globe, vines, book spines, bouncing treats, plant boing, and one small thing of its own for each doodad (fidgetDo). */
/* ---------- FIDGETS (Jackie: squishy, bouncy, endlessly repeatable; visual only, sound slots for Garry later) ---------- */
// Springy props cut from the current room picture. Fixed 60fps physics; drawn on whole pixels (DS rule).
// 'thing' = the room thing (js/room.js THINGS) this box belongs to: while it bounces, its own picture is drawn moved, never a copy over it
const FP=[
 {n:'ammonite',x:1094,y:146,w:108,h:84,k:.18,d:.12,kick:{vy:-4},puff:true},
 {n:'toy',x:52,y:350,w:90,h:90,k:.10,d:.10},
 {n:'pillow',x:582,y:532,w:122,h:116,k:.14,d:.16,kick:{vy:5}},
 {n:'drum',x:1220,y:140,w:186,h:88,k:.25,d:.18,kick:{vy:3}},
 {n:'moondial',x:1304,y:266,w:102,h:104,k:.16,d:.06,does:'moon'},
 {n:'viewer',x:1056,y:284,w:108,h:86,k:.2,d:.1,kick:{vy:-3},does:'view'},
 {n:'catpic',x:737,y:352,w:158,h:112,k:.15,d:.12,kick:{vx:3},does:'hearts'},
 {n:'bigpic',x:670,y:122,w:232,h:214,k:.12,d:.1,kick:{vx:3},does:'stars'},
 {n:'radio',x:1073,y:478,w:124,h:64,k:.22,d:.14,kick:{vy:-3}},
 {n:'forks',x:784,y:468,w:80,h:92,k:.3,d:.08,kick:{vx:4},does:'rattle'},
 {n:'petbed',x:1464,y:768,w:194,h:154,k:.16,d:.16,kick:{vy:5}},
 {n:'box1',x:112,y:460,w:80,h:90,k:.2,d:.1,kick:{vy:-4},does:'coins'},
 {n:'lockbox',x:28,y:676,w:100,h:64,k:.2,d:.1,kick:{vy:-4},does:'safe'},
 {n:'moonbox',x:1502,y:408,w:120,h:72,k:.2,d:.1,does:'trunk'},
 {n:'ball',x:1524,y:216,w:76,h:86,k:.25,d:.12,does:'ball'},
 {n:'crate',x:242,y:626,w:190,h:152,k:.2,d:.14,kick:{vy:-3},does:'record'},
 {n:'deskchair',x:1214,y:546,w:154,h:232,k:.12,d:.16,kick:{vx:5}},
];
FP.forEach(p=>{p.ox=0;p.oy=0;p.vx=0;p.vy=0;p.hops=0;p.dust=10;});
const FSPINE_ROWS=[[140,86,4,212],[246,86,4,212],[354,84,4,50],[456,90,4,92],[558,88,4,212],[664,76,138,212]];
let fSpines=[],fBits=[];
const FVINES=[];const VT=16; // finer leaf grid (Jackie): small tiles, and only leaf pixels move
for(let x=0;x<300;x+=VT)for(let y=10;y<290;y+=VT)FVINES.push({x,y,w:VT,h:VT,ox:0,vx:0});
for(let x=1414;x<1665;x+=VT)for(let y=60;y<366;y+=VT)FVINES.push({x,y,w:VT,h:VT,ox:0,vx:0});
// the plant on the trinket shelf rustles like the vines (Jackie, Nov 4): its leaves are small tiles too, instead of the whole plant bouncing
const SHELF_PLANT={x:1166,y:268,w:132,h:214};
const SHELF_POT={x:1214,y:318,w:60,h:50}; // its pot's green diamonds look like leaves: the pot stays still
for(let x=SHELF_PLANT.x;x<SHELF_PLANT.x+SHELF_PLANT.w;x+=VT)for(let y=SHELF_PLANT.y;y<SHELF_PLANT.y+SHELF_PLANT.h;y+=VT)if(x+VT<=SHELF_POT.x||x>=SHELF_POT.x+SHELF_POT.w||y+VT<=SHELF_POT.y||y>=SHELF_POT.y+SHELF_POT.h)FVINES.push({x,y,w:VT,h:VT,ox:0,vx:0,shelf:true});
const BOING={oy:0,vy:0,ox:0,vx:0};const FFLOOR=900;
function fplay(name){/* sound slot for Garry: ammonite_puff, toy_wind, book_slide, pillow_squish, globe_shake, treat_drop, treat_bounce, plant_boing, vine_rustle, glass_clink, drum_tap */}
const fhit=(p,x,y)=>x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+p.h;
function fidgetPoke(x,y){
 if(x>=SHELF_PLANT.x&&x<SHELF_PLANT.x+SHELF_PLANT.w&&y>=SHELF_PLANT.y&&y<SHELF_PLANT.y+SHELF_PLANT.h){const dir=x<SHELF_PLANT.x+SHELF_PLANT.w/2?1:-1; // a tap rustles the leaves near your finger, away from it
  for(const v of FVINES)if(v.shelf){const d=Math.hypot(x-(v.x+v.w/2),y-(v.y+v.h/2));if(d<70)v.vx+=dir*(2.2-d/50)*(.8+Math.random()*.4);}fplay('vine_rustle');return true;}
 for(const p of FP)if(fhit(p,x,y)){
  if(p.n==='crate'&&bassinetOut())continue; // the bassinet stands there instead
  if(p.n==='toy'){if(!toy.home)return false;toyWind();return true;} // the wind-up cat: wound, it climbs out (below)
  if(p.does)fidgetDo(p,x,y);
  const k=p.kick||{};p.vx+=(k.vx||0)*(x<p.x+p.w/2?1:-1);p.vy+=(k.vy||0);
  if(p.puff){const n=Math.max(2,Math.round(p.dust));for(let i=0;i<n;i++)fBits.push({x:p.x+p.w/2+rnd(-25,25),y:p.y+rnd(10,40),vx:rnd(-1.6,1.6),vy:rnd(-3.2,-.6),life:rnd(40,80),c:Math.random()<.5?'#f3e6c8':'#d9c6a0'});
   p.dust=Math.max(1,p.dust-1.5);p.lastPoke=performance.now();if(Math.random()<1/30)fBits.push({x:p.x+p.w/2,y:p.y+20,vx:rnd(-1,1),vy:-4,life:200,c:'#b07a3a',big:true});}
  fplay(p.n);return true;}
 for(const s of FSPINE_ROWS)if(y>=s[0]&&y<s[0]+s[1]&&x>=s[2]&&x<s[3]){fSpines.push({x:Math.max(s[2],Math.round(x)-12),y:s[0],w:24,h:s[1],oy:0,vy:-6});if(fSpines.length>30)fSpines.shift();fplay('book_slide');return true;}
 return false;}
/* EVERYTHING YOU CAN TOUCH DOES SOMETHING OF ITS OWN (Jackie, Nov 17 and 18). Beyond its bounce, each of these has one small
   thing that is its own:
     the lidded jar on the left bookcase   its lid lifts and gold coins spill out along the shelf
     the lockbox                           opens, and the journal opens at Keep it safe
     the milk crate                        holds the records: a tap puts the next one on the radio
     the moon dial                         shows tonight's real moon, and says what it is
     the crystal ball                      mist gathers and it gives a sign (Melville's "Crystal-Gazing", 1910: the colour of
                                           the clouds and whether they rise or sink)
     the viewfinder                        its lever clicks
     the cup of forks                      the forks rattle
     the moon trunk                        its lid lifts, and the moon box opens
     the cat's picture                     little hearts
     the big picture                       a few gold stars
     the wind-up cat                       wound up, it climbs out of its cubby and runs about until it winds down
   The shell puffs dust; the pillow, the cat bed and the desk chair wobble like the other furniture. */
/* THE WIND-UP CAT (Jackie, Nov 17 and 18: "it climbs out when wound ... down to the floor and has to be put back", "the key had to
   turn"). A tap winds it: the key turns for a moment in its cubby. Then it climbs head-first down the front of the bookcase and
   runs back and forth along the floor until it winds down, its key turning all the way (two frames). It stays where it stopped
   until you tap it, which puts it back on its shelf; its cubby is empty while it is out. Whole pixels, frame swaps only.
   Not saved: it is always home when the game opens. */
const TOY_HOME={x:97,y:438},TOY_FLOOR=812,TOY_L=120,TOY_R=1390,TOY_V=95,TOY_RUN=18,TOY_WIND=1.2,TOY_SWAP=.16;
const toy={home:true,ph:'home',x:TOY_HOME.x,y:TOY_HOME.y,t:0,dir:1,left:0};
function toyFrame(){return Math.floor(toy.t/TOY_SWAP)%2?2:1;}
function toyPic(){return !toy.home?null:toy.ph==='wind'?'toy_h'+toyFrame():'toy_h1';} // in its cubby (Jackie, Nov 18: the toy cats from her own sheet, not the one painted into the room); its key turns while it is wound
function toyWind(){if(toy.ph!=='home')return;toy.ph='wind';toy.t=0;fplay('toy_wind');}
function toyStep(dt){if(toy.ph==='home'||toy.ph==='stopped')return;const f0=toyFrame();toy.t+=dt;if(toyFrame()!==f0&&toy.ph!=='wind')sfx('tick');
 if(toy.ph==='wind'){if(toyFrame()!==f0)sfx('tick');if(toy.t>=TOY_WIND){toy.ph='down';toy.home=false;toy.x=TOY_HOME.x+12;toy.y=TOY_HOME.y+60;toy.t=0;}}
 else if(toy.ph==='down'){toy.y+=TOY_V*dt;if(toy.y>=TOY_FLOOR){toy.y=TOY_FLOOR;toy.ph='run';toy.dir=1;toy.left=TOY_RUN;}}
 else if(toy.ph==='run'){toy.x+=toy.dir*TOY_V*dt;toy.left-=dt;if(toy.x>=TOY_R){toy.x=TOY_R;toy.dir=-1;}else if(toy.x<=TOY_L){toy.x=TOY_L;toy.dir=1;}
  if(toy.left<=0){toy.ph='stopped';tell('The wind-up cat has run down. Tap it to put it back on its shelf.',{kind:'info',key:'toyDown'});}}}
function toyBox(){if(toy.home)return null;const n=toy.ph==='down'?'toy_d'+toyFrame():'toy_'+(toy.dir>0?'r':'l')+(toy.ph==='stopped'?1:toyFrame()),im=OBJ[n];if(!ok(im))return null;
 return {im,x:Math.round(toy.x-im.naturalWidth/2),y:Math.round(toy.y-im.naturalHeight),w:im.naturalWidth,h:im.naturalHeight};}
function drawToy(){const b=toyBox();if(b)g.drawImage(litPic(b.im,lightAt(toy.x,toy.y)),b.x,b.y);} // behind the monsters and Tofu (js/room.js draw)
function toyHit(x,y){const b=toyBox();return !!b&&x>=b.x-10&&x<b.x+b.w+10&&y>=b.y-10&&y<b.y+b.h+10;}
function toyPutBack(){toy.home=true;toy.ph='home';toy.x=TOY_HOME.x;toy.y=TOY_HOME.y;sfx('pop');}
const COIN_COLORS=['#ffd23f','#ffdf6b','#f7c21e']; // gold coins (Jackie, Nov 17: "I think lidded jar should be coins")
/* THE CRYSTAL BALL (Jackie, Nov 17: "let's base it on something real"). The signs are John Melville's, from "Crystal-Gazing and
   the Wonders of Clairvoyance" (1910), "Appearances in the Crystal": white clouds are good; black are bad; violet, green and blue
   mean coming joy; red, crimson, orange and yellow mean danger or trouble; clouds that rise answer yes and clouds that sink answer no.
   Bad signs stay in. The mist gathers in four frames and clears again. */
/* THE CRYSTAL BALL'S ANSWERS (Jackie, Nov 25: "The reading isn't clear or fun enough"). Think of a question and tap. The mist swirls in the
   colour of the answer and the ball gives a plain answer first, then what the mist did. The meanings are the old crystal-gazing ones: mist
   rising is yes and sinking is no; white clouds are good and dark ones are not; green, blue and violet promise something happy; red and
   yellow say take care. What it says is kept with the day's other readings (the moon box's Today page, js/tarot.js). */
const BALL_SIGNS=[{a:'Yes.',s:'The mist rises and fills the ball.',tint:'white',fr:[2,3,4,5,5,5,5,4]},{a:'No.',s:'The mist sinks away to nothing.',tint:'white',fr:[5,5,4,4,3,3,2,2]},
 {a:'It looks good.',s:'White clouds fill the ball.',tint:'white'},{a:'Not now.',s:'Dark clouds fill the ball.',tint:'dark'},
 {a:'Something happy is coming.',s:'Green clouds drift through the ball.',tint:'green'},{a:'Something happy is coming.',s:'Blue clouds drift through the ball.',tint:'blue'},
 {a:'Something happy is coming.',s:'Violet clouds drift through the ball.',tint:null},{a:'Take care for a while.',s:'Red clouds flicker in the ball.',tint:'red'},
 {a:'Take care for a while.',s:'Yellow clouds flicker in the ball.',tint:'yellow'}];
const BALL_TINT={white:[236,236,242],dark:[74,72,92],green:[70,186,112],blue:[66,140,232],red:[226,70,74],yellow:[242,206,62]},BALL_KEY='mp-ball';
const BALL_MS=2600;let ballT=-1e9,ballCur=null;
function ballFrame(){const d=performance.now()-ballT;return d<0||d>=BALL_MS?1:((ballCur&&ballCur.fr)||[2,3,4,5,5,4,3,2])[Math.floor(d/(BALL_MS/8))]||1;}
function ballTint(){return ballCur&&performance.now()-ballT<BALL_MS?ballCur.tint:null;} // the colour of the mist while it swirls (js/room.js ballPic)
// a mist picture in another colour: only the glass changes (its violets and lilacs), by how light each pixel is; the gold stand and the white glints stay
function ballTinted(f,tint){const base=OBJ['ball'+f],name='ball'+f+'_'+tint;if(OBJ[name])return name;if(!ok(base)||!BALL_TINT[tint])return 'ball'+f;
 const c=document.createElement('canvas');c.width=base.naturalWidth;c.height=base.naturalHeight;const x=c.getContext('2d');x.drawImage(base,0,0);let d;try{d=x.getImageData(0,0,c.width,c.height);}catch(e){return 'ball'+f;}
 const D=d.data,[tr2,tg,tb]=BALL_TINT[tint];for(let i=0;i<D.length;i+=4){const r=D[i],g=D[i+1],b=D[i+2];if(!D[i+3]||!(b>g+18&&r>g+4)||(r>232&&g>226))continue;const k=Math.min(1.25,(r+g+b)/3/150);D[i]=Math.min(255,tr2*k);D[i+1]=Math.min(255,tg*k);D[i+2]=Math.min(255,tb*k);}
 x.putImageData(d,0,0);c.naturalWidth=c.width;c.naturalHeight=c.height;c.complete=true;OBJ[name]=c;return name;}
function ballLog(){try{const s=JSON.parse(localStorage.getItem(BALL_KEY)||'{}');return s.day===tarotToday()&&Array.isArray(s.looks)?s:{day:tarotToday(),looks:[]}}catch(e){return {day:tarotToday(),looks:[]}}}
function ballToday(){return ballLog().looks.filter(l=>BALL_SIGNS[l[1]]).map(l=>{const h=Math.floor(l[0]/60),m=l[0]%60;return {when:((h+11)%12+1)+':'+String(m).padStart(2,'0')+(h<12?' am':' pm'),say:BALL_SIGNS[l[1]].a+' '+BALL_SIGNS[l[1]].s}}).reverse();}
function ballGaze(){const now=performance.now();if(now-ballT<BALL_MS)return;ballT=now;const i=Math.floor(Math.random()*BALL_SIGNS.length);ballCur=BALL_SIGNS[i];sfx('chime');
 if(!st.ballMet){st.ballMet=1;tell('Think of a question for the crystal ball, then tap it.',{kind:'info',key:'ballHi'});}
 setTimeout(()=>tell(ballCur.a+' '+ballCur.s,{kind:'info',key:'ballSign',now:true}),BALL_MS*.55);
 try{const s=ballLog(),d=new Date();s.looks.push([d.getHours()*60+d.getMinutes(),i]);if(s.looks.length>12)s.looks.shift();localStorage.setItem(BALL_KEY,JSON.stringify(s));}catch(e){}
 if(st.started&&bump('shakes')>=30)earnPot('frost');}
/* THE MOON DIAL (Jackie, Nov 25: "it's not that fun, I wish it had more info or interactivity"). A tap says what the moon is doing tonight: its
   phase, how much of it is lit, and how many nights it is to the next full moon and the next new moon. Tap again while it is still showing
   and the dial turns on one night, and says what the moon will be then, as many nights ahead as you care to tap (up to a month). Its face
   shows the night it is talking about. Left alone for a few seconds it goes back to tonight. All worked out from the date (js/moon.js). */
const DIAL_HOLD=7000;let dialT=-1e9,dialDay=0;
function moonDialAt(){return performance.now()-dialT<DIAL_HOLD&&dialDay>0?Date.now()+dialDay*864e5:null;} // the night the dial is showing, if it has been turned ahead
function moonDialSay(n){const t=Date.now()+n*864e5,name=moonName(t),lit=Math.round(moonLit(t)*100),a=moonAge(t),nights=x=>x===1?'tomorrow night':'in '+x+' nights';
 const when=n===0?'Tonight':n===1?'Tomorrow night':'In '+n+' nights',is=n===0?'is':'will be';
 let say=name==='new moon'?when+' '+is+' the new moon, when the sky is dark.':name==='full moon'?when+' '+is+' the full moon.':/quarter/.test(name)?when+' the moon '+is+' at its '+name+', half lit.':when+' the moon '+is+' a '+name+', '+lit+'% lit.';
 if(n===0){const half=MOON_MONTH/2,toFull=Math.round(((half-a)%MOON_MONTH+MOON_MONTH)%MOON_MONTH),toNew=Math.round(((MOON_MONTH-a)%MOON_MONTH+MOON_MONTH)%MOON_MONTH);
  if(name!=='full moon'&&toFull>0&&toFull<=toNew)say+=' The full moon is '+nights(toFull)+'.';else if(name!=='new moon'&&toNew>0)say+=' The new moon is '+nights(toNew)+'.';
  say+=' Tap the dial again to turn it on a night.';}
 return say;}
function moonDialTap(){const now=performance.now();dialDay=now-dialT<DIAL_HOLD?Math.min(dialDay+1,29):0;dialT=now;sfx(dialDay?'tick':'chime');tell(moonDialSay(dialDay),{kind:'info',key:'moonDial',now:true});}
/* WHERE A SPILLED COIN LANDS (Jackie, Nov 25: "Gold coins don't bounce on regular surfaces", then "all the coins should hit the floor"). The coins
   used to bounce on one line at the height of the jar's shelf, right across the room, so they bounced in mid-air. Now every coin falls out of
   the jar, past the shelves, and lands on the floor, where it bounces and comes to rest. Each coin has its own bit of floor, a little nearer
   or further, so they do not all stop on one line. */
const COIN_FLOOR=[800,870];
function coinFloor(b){return b.fz;}
function fidgetDo(p,x,y){const cx=p.x+p.w/2,add=o=>{fBits.push(o);if(fBits.length>160)fBits.shift();};
 if(p.does==='coins'){openThing('jar',900);for(let i=0;i<6;i++)add({x:cx+rnd(-14,14),y:p.y+6,vx:rnd(-2.6,3.4),vy:rnd(-4.2,-2),life:rnd(270,350),c:COIN_COLORS[Math.floor(Math.random()*COIN_COLORS.length)],big:true,coin:true,fz:rnd(COIN_FLOOR[0],COIN_FLOOR[1])});sfx('pop');}
 else if(p.does==='safe'){openThing('lockbox',900);if(st.started&&st.stage>=0)setTimeout(()=>{if(!document.querySelector('.screen')&&typeof openJournal==='function')openJournal('safe')},220);}
 else if(p.does==='record'){if(typeof radioOn==='function'){if(!radio.on){radio.band='crates';radioOn(true);tell('You put a record from the crate on the radio.',{kind:'info',key:'crateRec'});}else if(radio.band!=='crates')radioBand('crates');else radioStep(1);}}
 else if(p.does==='moon'){if(typeof moonName==='function')moonDialTap();}
 else if(p.does==='hearts'){for(let i=0;i<2;i++)add({x:cx+rnd(-30,20),y:p.y+p.h*.3,vx:rnd(-.3,.3),vy:-1,g:0,sway:true,life:60+i*20,c:'#e98aa8',heart:true});}
 else if(p.does==='stars'){for(let i=0;i<4;i++)add({x:p.x+rnd(30,p.w-30),y:p.y+rnd(30,p.h-60),vx:rnd(-.5,.5),vy:rnd(-.9,-.3),g:.01,sway:true,life:rnd(60,110),c:['#ffd23f','#ffdf6b','#fff4e2'][i%3],petal:true});}
 else if(p.does==='rattle'){[0,90,180].forEach(d=>setTimeout(()=>sfx('tick'),d));}
 else if(p.does==='view'){openThing('viewer',500);sfx('tick');if(st.started&&typeof openViewer==='function')setTimeout(()=>{if(!document.querySelector('.screen'))openViewer();},220);} // the lever clicks, then the viewfinder opens (js/viewer.js)
 else if(p.does==='trunk'){openThing('trunk',900);}
 else if(p.does==='ball'){ballGaze();}}
function plantBoing(x){BOING.vy=-9-Math.random()*3;const b=plantBox();BOING.vx=(x<b.x+b.w/2?2:-2);fplay('plant_boing');}
const fDrag={last:null}; // the last pointer spot, for brushing the vines
cv.addEventListener('pointermove',e=>{const [x,y]=toGame(e);
 if(fDrag.last){const dx=x-fDrag.last.x;if(Math.abs(dx)+Math.abs(y-fDrag.last.y)>3)for(const v of FVINES)if(Math.hypot(x-(v.x+v.w/2),y-(v.y+v.h/2))<40){v.vx+=clamp(dx*.2,-2,2);fplay('vine_rustle');}}
 fDrag.last={x,y};});
function fspring(p){p.vx+=-p.k*p.ox;p.vy+=-p.k*p.oy;p.vx*=1-p.d;p.vy*=1-p.d;p.ox+=p.vx;p.oy+=p.vy;if(Math.abs(p.ox)<.3&&Math.abs(p.vx)<.2){p.ox=0;p.vx=0;}if(Math.abs(p.oy)<.3&&Math.abs(p.vy)<.2){p.oy=0;p.vy=0;}}
function fidgetStep(){
 toyStep(1/60);
 for(const p of FP){
  fspring(p);if(p.puff&&p.lastPoke&&performance.now()-p.lastPoke>8000)p.dust=Math.min(10,p.dust+.02);}
 for(const s of fSpines){s.vy+=-.14*s.oy;s.vy*=.9;s.oy+=s.vy;}fSpines=fSpines.filter(s=>Math.abs(s.oy)>.3||Math.abs(s.vy)>.2);
 for(const v of FVINES){v.vx+=-.1*v.ox;v.vx*=.9;v.ox=clamp(v.ox+v.vx,-3,3);}
 for(const b of fBits){b.vy+=b.g!=null?b.g:.12;b.vx*=.98;if(b.sway)b.vx+=Math.sin(b.life/9)*.06;b.x+=b.vx;b.y+=b.vy;const fl=b.coin?coinFloor(b):b.fl;if(fl!=null&&b.y>=fl&&b.vy>0){b.y=fl;b.vy=b.vy>1?-b.vy*.45:0;b.vx*=.7;}b.life--;}fBits=fBits.filter(b=>b.life>0);
 if(BOING.oy<0||BOING.vy!==0){BOING.vy+=.6;BOING.oy+=BOING.vy;if(BOING.oy>=0){BOING.oy=0;if(BOING.vy>2.5)BOING.vy=-BOING.vy*.42;else BOING.vy=0;}}
 BOING.vx+=-.2*BOING.ox;BOING.vx*=.85;BOING.ox+=BOING.vx;
}
let fAcc=0,fPrev=performance.now();
// moving pieces carry ONLY their object's pixels, never the wall/shelf behind them:
// leaves = green pixels; props = pixels that differ from the colors around the prop's edge (its background)
const leafPx=(r,g2,b)=>(g2>r+8&&g2>b+20)||(g2>110&&b<g2-70&&r<g2+70&&r>g2-10); // greens and yellow-green leaves (autumn/golden light)
// keep only tiles that are mostly leaf, so books/shelves/wall never wiggle
let vineChecked=null;function vineFilter(src){src=fgDay(src);if(vineChecked===src.src)return;vineChecked=src.src;const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(src,0,0);let D;try{D=x.getImageData(0,0,W,H).data;}catch(e){return;}
 for(const v of FVINES){let n=0,t=0;for(let y=v.y;y<v.y+v.h;y+=2)for(let xx=v.x;xx<v.x+v.w;xx+=2){const i=(y*W+xx)*4;t++;if(leafPx(D[i],D[i+1],D[i+2]))n++;}v.on=n/t>.5;}}
const fgCache=new Map();
/* WHICH PIXELS ARE THE THING (Jackie, Nov 25: "at night with lights off some of the imagery is offset"). A thing that bounces or wiggles is cut
   out of the room by colour: what matches the wall around it is left behind. That was judged on the room as lit right now, and in a dark
   room every colour is nearly the same dark blue, so bits of wall moved with the thing and bits of the thing stayed. The shape is now always
   judged on the room in daylight, and only the colours come from the room as it is lit. */
const fgDay=src=>(typeof sceneDay==='function'&&sceneDay())||src;
function fgPiece(src,x,y,w,h,kind){const key=src.src+'|'+x+','+y+','+w+','+h+'|'+kind;let c=fgCache.get(key);if(c)return c;
 c=document.createElement('canvas');c.width=w;c.height=h;const cx=c.getContext('2d');cx.drawImage(fgDay(src),x,y,w,h,0,0,w,h);let d;try{d=cx.getImageData(0,0,w,h);}catch(e){return null;}const D=d.data;
 if(kind==='leaf'){for(let i=0;i<D.length;i+=4){if(!leafPx(D[i],D[i+1],D[i+2])&&!(D[i]+D[i+1]+D[i+2]<150))D[i+3]=0;}}
 else{const bg=[];const take=i=>bg.push([D[i],D[i+1],D[i+2]]);for(let xx=0;xx<w;xx+=2){take(xx*4);take(((h-1)*w+xx)*4);}for(let yy=0;yy<h;yy+=2){take(yy*w*4);take((yy*w+w-1)*4);}
  for(let i=0;i<D.length;i+=4){let near=false;for(const q of bg){if(Math.abs(D[i]-q[0])+Math.abs(D[i+1]-q[1])+Math.abs(D[i+2]-q[2])<42){near=true;break;}}if(near)D[i+3]=0;}}
 cx.putImageData(d,0,0);cx.globalCompositeOperation='source-in';cx.drawImage(src,x,y,w,h,0,0,w,h);cx.globalCompositeOperation='source-over'; // the shape from daylight, the colours from now
 if(fgCache.size>400)fgCache.clear();fgCache.set(key,c);return c;}
function fidgetDrawProps(src){const now=performance.now();fAcc+=Math.min(100,now-fPrev);fPrev=now;while(fAcc>=1000/60){fidgetStep();fAcc-=1000/60;}
 if(!src)return;const pc=(x,y,w,h,ox,oy)=>g.drawImage(src,x,y,w,h,x+Math.round(ox),y+Math.round(oy),w,h);
 const pf=(x,y,w,h,ox,oy,kind)=>{const c=fgPiece(src,x,y,w,h,kind);if(c)g.drawImage(c,x+Math.round(ox),y+Math.round(oy));};
 vineFilter(src);for(const v of FVINES)if(v.on&&Math.round(v.ox))pf(v.x,v.y,v.w,v.h,v.ox,0,'leaf');
 for(const p of FP){if(!(Math.round(p.ox)||Math.round(p.oy)))continue;
  if(p.thing){const t=thingBy(p.thing),b=t&&thingBox(t);if(b){g.save();if(p.clip){g.beginPath();g.rect(...p.clip);g.clip();}g.drawImage(litPic(b.im,lightAt(t.x,t.y-20)),b.x+Math.round(p.ox),b.y+Math.round(p.oy));g.restore();}}
  else pf(p.x,p.y,p.w,p.h,p.ox,p.oy,'obj');}
 for(const s of fSpines)if(Math.round(s.oy))pc(s.x,s.y,s.w,s.h,0,s.oy);
 idleTick(now);const io=idleOffset(now);if(io&&idleOn.it.k!=='sprite'){const r=idleOn.it;if(r.k==='plain')pc(r.x,r.y,r.w,r.h,io,0);else if(r.k==='shade'){const p=shadePiece(r.key,src);if(p)g.drawImage(p.c,p.x+io,p.y);}else pf(r.x,r.y,r.w,r.h,io,0,r.k);}} // 'shade' = a lamp's whole shade, by its own outline (the floor lamp's shade is wider than any box that misses the curtain)
function fidgetDrawTop(){const U=ART_PX;for(const b of fBits){const x=Math.round(b.x/U)*U,y=Math.round(b.y/U)*U;g.fillStyle=b.c; // the new little things are drawn on the room art's own pixel grid (5 units), so they read at phone size
  if(b.fly){const up=Math.floor(b.life/7)%2;g.fillRect(x-2*U,y+(up?-U:0),2*U,2*U);g.fillRect(x+U,y+(up?-U:0),2*U,2*U);g.fillStyle='#4a2a4f';g.fillRect(x,y-U,U,3*U);continue;} // a butterfly: two wings that flap by a frame swap
  if(b.note){g.fillRect(x,y,2*U,2*U);g.fillRect(x+U,y-3*U,U,4*U);g.fillRect(x+U,y-3*U,3*U,U);continue;} // a music note
  if(b.heart){g.fillRect(x,y,U,U);g.fillRect(x+2*U,y,U,U);g.fillRect(x-U,y+U,5*U,U);g.fillRect(x,y+2*U,3*U,U);g.fillRect(x+U,y+3*U,U,U);continue;}
  if(b.coin){g.fillStyle='#341839';g.fillRect(x,y-2*U,3*U,5*U);g.fillRect(x-U,y-U,5*U,3*U);g.fillStyle=b.c;g.fillRect(x,y-U,3*U,3*U);g.fillStyle='#ffffff';g.fillRect(x,y-U,U,U);g.fillStyle='#c9952f';g.fillRect(x+2*U,y+U,U,U);continue;} // a coin: a gold square with a dark rim and one bright pixel
  if(b.petal||b.drop){g.fillRect(x,y,2*U,2*U);continue;}
  const s2=b.big?6:3;g.fillRect(Math.round(b.x),Math.round(b.y),s2,s2);}}

/* ---------- IDLE WIGGLE (Jackie, Nov 3; RULES.md 10) ----------
   Now and then ONE thing you can use gives a tiny wiggle: one art pixel, a couple of frames, one item every 10 s,
   never two at once, never while you're touching something (or while anything else is moving). It's not a hint about needs.
   Only usable things: the carafe, the SNACKS cabinet, both lamps, the desk drawers (journal), the armchair, the doodad fidgets
   and seasonal items. Books: ONLY the four special readable books (not placed in the room yet), never any other books
   (the shelves, the book stack, the crate book). 'obj' = only the item's own pixels move; 'plain' = a part inside the item (the lamp shade, the chair's back cushion, the cabinet door, the drawers). */
/* Jackie, Nov 4: for now ONLY these wiggle, one item every 10 s, one at a time, under half a second each (4 frames x 110 ms):
   both lamps, the snow globe, the journal drawers, the SNACKS cupboard, the carafe and the readable books (the shelf the book menu opens from).
   Nov 16: the sampler on the top shelf joined them when its app was built. */
const IDLE_ITEMS=[{n:'cup',x:966,y:588,w:32,h:34,k:'obj'},{n:'mini fridge',x:772,y:580,w:124,h:176,k:'plain'},
 {n:'floor lamp',x:134,y:248,w:194,h:224,k:'shade',key:'lamp'},{n:'desk lamp',x:1268,y:402,w:174,h:146,k:'obj'},
 {n:'desk drawers (journal)',x:1082,y:570,w:96,h:132,k:'plain'},{n:'readable books',...SHELF,k:'plain'},
 {n:'sampler',x:1220,y:140,w:186,h:88,k:'obj'},
 {n:'crystal ball',x:1524,y:216,w:76,h:86,k:'obj'},
 {n:'pumpkin',k:'sprite',when:()=>seasonItem()==='pumpkin'},{n:'tree',k:'sprite',when:()=>seasonItem()==='tree'}]; // seasonal items (js/seasonal.js) nudge their own sprite, only while they're out
const IDLE_GAP=[10,10],IDLE_FRAMES=[1,0,1,0],IDLE_MS=110,ART_PX=5; // seconds between tries; ONE ART PIXEL on two frames.
// ART_PX: the room art's own pixels are ~5 room units wide, so a 1-unit nudge was invisible (on a phone, under half a screen dot). Jackie: "the little items still don't wiggle".
let idleNext=0,idleOn=null,pointerHeld=false;const idleLog=[];
cv.addEventListener('pointerdown',()=>{pointerHeld=true;});addEventListener('pointerup',()=>{pointerHeld=false;});addEventListener('pointercancel',()=>{pointerHeld=false;});
function touching(){return pointerHeld||drag.down||drag.on||!!held.tool||!!feed.item||!!bookDrag.item||!!bubble||!!document.querySelector('.screen');}
function somethingMoving(){return FP.some(p=>p.ox||p.oy||p.vx||p.vy)||fSpines.length>0||fBits.length>0||toy.ph==='wind'||toy.ph==='down'||toy.ph==='run'||!!(BOING.oy||BOING.vy);}
function idleTick(now){if(idleOn){if(now-idleOn.t0>=IDLE_FRAMES.length*IDLE_MS||touching())idleOn=null;return;}
 if(!idleNext)idleNext=now+rnd(IDLE_GAP[0],IDLE_GAP[1])*1000;if(now<idleNext)return;idleNext=now+rnd(IDLE_GAP[0],IDLE_GAP[1])*1000;
 if(!st.started||touching()||somethingMoving()){idleNext=now+1000;return;} // busy: try again in a second, so the 10 s rhythm holds
 const can=IDLE_ITEMS.filter(it=>!it.when||it.when());idleOn={it:can[Math.floor(Math.random()*can.length)],t0:now};idleLog.push({n:idleOn.it.n,t:now});if(idleLog.length>400)idleLog.shift();}
function idleOffset(now){return idleOn?(IDLE_FRAMES[Math.floor((now-idleOn.t0)/IDLE_MS)]||0)*ART_PX:0;}
