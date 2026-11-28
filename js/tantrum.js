'use strict';
/* TANTRUMS (Jackie, Nov 27: "i think after you have two adults one should ask to move out", "and when you say no they should get mad
   and things should disappear and move and everything should be disrupted when monsters are mad", "like decorations bounce
   around or go crazy whatever", "remember we also have old image files like a fire and stuff", "same thing with the cat -- when
   it gets mad, things go nuts and its eyes go green then it leaves"; asked how long, "Ends by itself").
   This replaces the Nov 8 rule that "Not yet" had no cost of any kind.
   A tantrum lasts twenty seconds and ends by itself. While it lasts:
     - whoever is mad shows it: a monster wears its grumpy face with the old fire picture over its head (the same flames a
       glaring monster already had); the cat sits with its green glowing eyes for six seconds, then walks out to the movie room, where it can be found and brought
       straight back ("if your monster or the cat get mad they might go in another room", "and you have to find them if you want
       them immediately"); a mad monster does not leave the room yet;
     - every springy thing in the room is thrown about in waves, and the leaves are shaken;
     - now and then the small things lift and bob, as they do for the crystal ball;
     - half the string lights go dark and change every instant;
     - a few seconds in, the mess is made, and it stays made: the decorations go back in the cupboard, and the string lights
       and every lamp go off. Jackie: "i think we have to put things back". Nothing comes back by itself: you take the
       decorations out of the cupboard again and tap the lights and lamps on.
   When it is over a line says who has calmed down and what needs putting back. With reduced motion (tsCalm) nothing is thrown
   about, but the mess is still made. Everything here is a kick to something that already moves or a switch you can already
   flip; no picture is changed. */
const TANTRUM_MS=20000,TANTRUM_MESS_AT=2500,TANTRUM_CAT_SIT=6;let tantrum=null;
function tantrumOn(){return !!tantrum&&performance.now()-tantrum.t0<TANTRUM_MS;}
function tantrumWild(){return tantrumOn()&&!(typeof tsCalm==='function'&&tsCalm());}
function tantrumMad(id){return tantrumOn()&&tantrum.who===id;} // is this monster the one having it
function tantrumMess(){const was={decor:st.decor||null,dark:!!st.lightsDark,lamp:!!st.lamp,desk:st.desk,wall:st.wall},had=!!st.decor,lit=!st.lightsDark&&!st.noLights||st.lamp||st.desk!==false||st.wall!==false;
 st.decor=null;st.lightsDark=true;st.lamp=false;st.desk=false;st.wall=false;if(typeof save==='function')save();tantrum.was=was;
 return [had?'The decorations are back in the cupboard':'',lit?'the lights are off':''].filter(Boolean);}
/* WHO PUTS IT BACK (Jackie, Nov 27: "i think we have to put things back", then "or if you have a tidy monster nearby it can do it or if
   your monster cools off and feels bad lol"). You can always do it yourself. If another monster in the room is the tidy kind
   (lawful, js/plants.js pers), it puts everything back about a quarter of a minute after the tantrum. Otherwise the monster
   that had the tantrum may cool off and feel bad, one time in two, and put it back itself after about a minute. Only what you
   have not already put right is touched. */
const TANTRUM_TIDY_MS=14000,TANTRUM_SORRY_MS=55000,TANTRUM_SORRY_ODDS=.5;let tantrumAfter=null;
function tantrumHelper(t){let tidy=null;if(typeof eachPlant==='function')eachPlant(()=>{if(!tidy&&st.id!==t.who&&st.stage>=4&&st.lc>.33)tidy={id:st.id,name:who()};});
 if(tidy)return {at:performance.now()+TANTRUM_TIDY_MS,by:tidy,how:' has put everything back.',was:t.was};
 if(t.who!=='cat'&&Math.random()<TANTRUM_SORRY_ODDS)return {at:performance.now()+TANTRUM_SORRY_MS,by:{id:t.who,name:t.name},how:' feels bad and puts everything back.',was:t.was};return null;}
function tantrumPutBack(a){const w=a.was;if(!w)return;let did=false;if(w.decor&&!st.decor){st.decor=w.decor;did=true;}if(!w.dark&&st.lightsDark){st.lightsDark=false;did=true;}
 if(!st.lamp&&st.desk===false&&st.wall===false&&(w.lamp||w.desk!==false||w.wall!==false)){st.lamp=w.lamp;st.desk=w.desk;st.wall=w.wall;did=true;}
 if(did){if(typeof save==='function')save();if(typeof sfx==='function')sfx('chime');if(typeof tell==='function')tell(a.by.name+a.how,{kind:'important',who:a.by.id});}}
function tantrumStart(who,name){tantrum={t0:performance.now(),who,name:name||'',next:0};if(typeof sfx==='function')sfx('hmm');
 if(who!=='cat'&&typeof withPlant==='function')withPlant(who,()=>{st.grump=TANTRUM_MS/1000;});}
function tantrumStep(){if(tantrumAfter&&!tantrum&&performance.now()>=tantrumAfter.at){const a=tantrumAfter;tantrumAfter=null;tantrumPutBack(a);}if(!tantrum)return;const now=performance.now();
 if(!tantrum.messed&&now-tantrum.t0>=TANTRUM_MESS_AT){tantrum.messed=true;tantrum.left=tantrumMess();}
 if(now-tantrum.t0>=TANTRUM_MS){const t=tantrum;tantrum=null;tantrumAfter=t.was?tantrumHelper(t):null;if(typeof tell==='function'){let m=(t.left||[]).join(', and ');if(m)m=' '+m[0].toUpperCase()+m.slice(1)+'.';tell((t.who==='cat'?'The room is quiet again.':t.name+' has calmed down.')+m,{kind:'important',who:t.who==='cat'?undefined:t.who,long:true});}return;}
 if(!tantrumWild()||now<tantrum.next)return;tantrum.next=now+rnd(450,1000);
 for(const p of FP)if(Math.random()<.55){p.vx+=rnd(-7,7);p.vy+=rnd(-9,-3);} // the springy things are thrown about
 for(const v of FVINES)if(Math.random()<.25)v.vx+=rnd(-3,3);                 // and the leaves shaken
 if(Math.random()<.3&&typeof spellT!=='undefined')spellT=now;                 // now and then the small things lift and bob
 if(Math.random()<.5&&typeof sfx==='function')sfx('tick');}
