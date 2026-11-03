'use strict';
/* Care: things you carry and use on a plant: the carafe, treats, books, and petting. */
const CARRY={up:img('carafe_up.png'),tilt:img('carafe_tilt.png'),pour:img('carafe_pour.png')},TREAT_IMG={};['solar','peat','cotton','pizza','plants','fossil','blood'].forEach(k=>TREAT_IMG[k]=img('treat_'+k+'.png'));
const CARRY_SC=.45; // carried items shown smaller than drawn so they fit the hand/room
function drawCarried(im,x,y,sc=CARRY_SC){if(!ok(im))return;y+=(Math.floor(T*2)%2)*2;const w=Math.round(im.naturalWidth*sc),h=Math.round(im.naturalHeight*sc);g.drawImage(im,Math.round(x-w/2),Math.round(y-h/2),w,h);}
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
 if(st.pets.length>=3){sfx('giggle');st.lc=clamp(st.lc-.04,-1,1);st.pets=[];logEv('tickles');if(!st.taught.tickle){st.taught.tickle=1;say('Tickle attack! Wild, giggly play makes it more chaotic.',6);}burst('heart',b.x+b.w*.15,b.y-20,2);}
 else{sfx('purr');st.lc=clamp(st.lc+.01,-1,1);if(!st.taught.gentle){st.taught.gentle=1;say('A gentle pet. Calm, steady affection makes it more orderly (lawful). Counts as company.',6);}burst('heart',b.x+b.w*.15,b.y-20,1);}
 const was=st.needs.attention;st.needs.attention=Math.max(0,was-.35);if(was>.6&&st.needs.attention<=.6)met('attention');doMove();if(quiet()&&Math.random()<.5)say(line('pet'),3);}
function useTool(){const b=plantBox();const base=SPOT[spotKey()].y;
 if(held.tool==='can'){sfx('pour');burst('drop',b.x+b.w/2,base-(st.stage<4?60:b.h*.3)-60,2);
  if(st.needs.thirst<.3){st.over=20;st.overType='water';setTimeout(()=>sfx('blub'),900);say('Soggy pout. Too much water, but no harm done.',4);}
  else{if(st.needs.thirst>.6)met('thirst');setTimeout(()=>sfx('sigh'),1300);
   const P=pers(),onTime=st.routine!=null&&Math.abs(st.dayT-st.routine)<.07;st.routine=st.routine==null?st.dayT:st.routine*.7+st.dayT*.3;
   if(P.l==='lawful'&&onTime&&st.stage>=4){st.needs.attention=Math.max(0,st.needs.attention-.15);setTimeout(()=>burst('heart',b.x+b.w*.15,b.y-20,2),1300);const f=notice('tidy',QUIRK_TXT.tidy);say('Right on time! '+who()+' loves a routine.'+(f?' (New quirk in the journal.)':''),5);}
   if(st.stage>=4)setTimeout(()=>doMove(),1300);
   if(P.l==='lawful'&&onTime&&st.stage>=4){}else if(st.stage>=4&&quiet()&&Math.random()<.6)setTimeout(()=>{if(quiet())say(line('water'),3);},1400);}
  st.needs.thirst=0;held.tool=null;return;}
 if(st.stage<4){held.tool=null;say('Too little for that yet.',3);return;}
 if(held.tool==='snack'&&(st.full||0)>.6){ // full (Jackie): it won't eat; a little head-shake, treat stays in your hand
  BOING.vx+=6;sfx('hmm');say('It\'s full! It turns away from the '+held.item.name.toLowerCase()+'. Try again a little later.',4);return;}
 if(held.tool==='snack'&&((st.full||0)>.6||st.nap>0)){held.tool=null;sfx('hmm');plantBoing(b.x+b.w/2);say(st.nap>0?'Shh, it\'s sleeping off its snack.':'Too full. It turns its head away. Try again later.',4);return;} // full: won't eat (Jackie)
 if(held.tool==='snack'){const s=held.item;sfx(s.s);burst('crumb',b.x+b.w/2,b.y+b.h*.5,8,s.ge<0?C.vio:C.coral);
  const P=pers(),love=(P.g==='good'&&s.ge>.05)||(P.g==='evil'&&s.ge<-.05)||(P.l==='lawful'&&st.lastTreat===s.id)||(P.l==='chaotic'&&st.lastTreat&&st.lastTreat!==s.id),
   meh=!love&&((P.g==='good'&&s.ge<-.05)||(P.g==='evil'&&s.ge>.05));
  const why=love?(P.g==='good'&&s.ge>.05?'sweet':P.g==='evil'&&s.ge<-.05?'dark':P.l==='lawful'?'usual':'novel'):meh?(P.g==='good'?'sweet':'dark'):'';
  const rx=love?({sweet:'Its favorite kind of treat!',dark:'Ooh, its favorite. Mwah-ha-hah!',usual:'Its usual! It loves that.',novel:'Something new! It loves that.'})[why]+' ':meh?'It eats it… politely. ':'';
  const qf=why?notice(why,QUIRK_TXT[why]):false;st.lastTreat=s.id;if(love)st.needs.attention=Math.max(0,st.needs.attention-.1);
  setTimeout(()=>{plantBoing(b.x+b.w/2);sfx('pop');burst('heart',b.x+b.w*.15,b.y-20,love?4:meh?1:2);if(love)setTimeout(()=>doMove(),300);},350); // the happy 'pop' after it eats
  if((st.full||0)+.35>.6){setTimeout(()=>{sfx('burp');st.nap=60;},900);say('Mmm. A big burp... it\'s so full it\'s dozing off for a nap.',5);} // full = a full-minute nap (Jackie)
  else if(!st.taught.snack){st.taught.snack=1;say('It never goes hungry. Snacks are treats that shape who it becomes.',7);}
  st.full=clamp((st.full||0)+.35,0,1);st.ge=clamp(st.ge+s.ge,-1,1);
  st.treats=st.treats||{};st.traits=st.traits||[];st.treats[s.id]=(st.treats[s.id]||0)+1;st.tLast=st.tLast||{};st.tLast[s.id]=st.day;
  if(st.treats[s.id]>=((st.dormant||[]).includes(s.trait)?3:TRAIT_AT)&&!st.traits.includes(s.trait)){st.dormant=(st.dormant||[]).filter(t=>t!==s.trait);st.traits.push(s.trait);setTimeout(()=>{sfx('chime');st.listen=3;say('New trait grown: '+s.trait+'! (from '+s.name.toLowerCase()+')',6);},900);}
  logEv(s.name);if(bump('treats')>=10)earnPot('lavender');if(!(st.full>.95)){const n=st.treats[s.id];say(rx+(qf?'(New quirk in the journal.) ':'')+s.name+': '+(s.ge>.05?'a wholesome treat (nudges it good)':s.ge<-.05?'a dark treat (nudges it evil)':'a neutral treat')+'. '+(n<TRAIT_AT?n+'/'+TRAIT_AT+' toward '+s.trait+'.':''),6);}
  save();held.tool=null;return;}
 if(held.tool==='book'){const bk=held.item;sfx('page');st.listen=4;const was=st.needs.attention;st.needs.attention=Math.max(0,was-.6);if(was>.6)met('attention');
  st.ge=clamp(st.ge+bk.ge,-1,1);st.lc=clamp(st.lc+bk.lc,-1,1);held.tool=null;logEv(bk.name);if(bump('read_'+bk.id)>=5)earnPot({fairy:'candy',almanac:'plaid',nonsense:'rainbow',grimoire:'eye'}[bk.id]);
  say(bk.name+': '+({fairy:'stories of kindness make it gentler (good).',almanac:'rules and routines make it more orderly (lawful).',nonsense:'silly rhymes make it more playful (chaotic).',grimoire:'forbidden spells make it a little wicked (evil).'})[bk.id]+' Reading also counts as company.',7);}}
function openSnacks(x,y){const av=SNACKS;sfx('tick');
 openBubble(x-260,y-300,'Treat jar<br>'+av.map((s,i)=>`<button data-k="${i}">${s.name}</button>`).join(''),Object.fromEntries(av.map((s,i)=>[i,()=>{held.tool='snack';held.item=s;closeBubble();sfx('pop');if(!st.taught.feed){st.taught.feed=1;say('Tap your plant to give it the treat.',5);}}])));}
function openBooks(x,y){openBubble(x+20,y-40,'Read aloud from…<br>'+BOOKS.map((b,i)=>`<button data-k="${i}">${b.name}</button>`).join(''),Object.fromEntries(BOOKS.map((b,i)=>[i,()=>{held.tool='book';held.item=b;closeBubble();sfx('page');}])));}
