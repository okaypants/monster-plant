'use strict';
/* Cat: naps, walks, trust, petting. */
/* ---------- CAT (Jackie): naps all over the room, wanders now and then, can be petted. Frame swaps + whole-pixel moves only. ---------- */
const CATF={};['curl1','curl2','loaf1','loaf2','side1','side2','sit1','sit2','pet1','pet2','walk1','walk2','yawn'].forEach(n=>CATF[n]=img('cat_'+n+'.png'));
const CAT_SPOTS={bed:{x:1578,y:888,sc:.62,poses:['curl','loaf']},rug:{x:760,y:925,sc:.62,poses:['side','loaf','curl']},
 chair:{x:640,y:650,sc:.5,poses:['curl','loaf']},sill:{x:385,y:548,sc:.45,poses:['loaf','curl']},crate:{x:338,y:612,sc:.48,poses:['loaf','curl']},books:{x:978,y:640,sc:.48,poses:['loaf','curl']}};
const cat={spot:'bed',x:1578,y:888,sc:.62,state:'sleep',pose:'curl',t:0,nap:rnd(50,110),dir:1,path:null,pets:0};
function catSpotFree(k){if(['sill','crate','books'].includes(k)&&otherPos().concat(st._pos?[st._pos]:[]).some(q=>q.k===k))return false;if(k==='chair'&&chairId!=null)return false;if(k==='sill'&&st.curtain==='closed')return false;const pk=st.started&&st.stage>=0?spotKey():'';if(k==='chair'&&typeof onChair==='function'&&onChair())return false;if(k==='sill'&&pk==='sill')return false;if(k==='crate'&&pk==='crate')return false;if(k==='books'&&pk==='books')return false;return true;}
function plantSideSpot(){if(!(st.started&&st.stage>=6)||(typeof onChair==='function'&&onChair()))return null;const b=plantBox(),side=(b.x+b.w/2)<835?1:-1;return {x:Math.round(b.x+b.w/2+side*(b.w/2+70)),y:SPOT[spotKey()].y+2,sc:.6*depthK(SPOT[spotKey()].y),poses:['curl','loaf']};}
function catPick(){const ps=plantSideSpot();if(ps&&cat.spot!=='byplant'&&catTrust()>=TRUST_FOND&&Math.random()<(catTrust()>=TRUST_BFF?.6:.35)){CAT_SPOTS.byplant=ps;return 'byplant';}
 const ks=Object.keys(CAT_SPOTS).filter(k=>k!=='byplant'&&k!==cat.spot&&catSpotFree(k));return ks[Math.floor(Math.random()*ks.length)]||'bed';}
function catGo(k){const s=CAT_SPOTS[k],FLOOR_Y=925;cat.to=k;cat.path=[{x:cat.x,y:FLOOR_Y,hop:cat.y<FLOOR_Y-20},{x:s.x,y:FLOOR_Y},{x:s.x,y:s.y,hop:s.y<FLOOR_Y-20}];cat.state='walk';cat.t=0;}
function catUpdate(dt){cat.t+=dt;if(cat.shyT>0)cat.shyT-=dt;
 if(cat.state==='sleep'&&((cat.spot==='sill'&&st.curtain==='closed')||(cat.spot==='chair'&&chairId!=null))){cat.state='wake';cat.t=1.2;} // curtains closed: hop off the ledge
 if(cat.state==='sleep'){cat.nap-=dt;if(cat.nap<=0){cat.state='wake';cat.t=0;cat.pets=0;trustGain(.015);}} // a nap left undisturbed builds trust
 else if(cat.state==='sniff'){if(cat.t>1.6){cat.state='wake';cat.t=1.2;}}
 else if(cat.state==='wake'){if(cat.t>2.6){catGo(catPick());}}
 else if(cat.state==='pet'){if(cat.t>2.2){cat.state='sleep';cat.nap=rnd(30,70);}}
 else if(cat.state==='walk'){const p=cat.path[0];if(!p){const s=CAT_SPOTS[cat.to];cat.spot=cat.to;cat.sc=s.sc;cat.pose=s.poses[Math.floor(Math.random()*s.poses.length)];cat.state='sleep';cat.nap=rnd(60,150);fplay('cat_settle');if(cat.spot==='byplant'){st.listen=3;sfx('purr');if(!st.taught.catPlant){st.taught.catPlant=1;say('The cat curled up next to your plant. They like each other.',6);}}return;}
  if(p.hop){cat.x=p.x;cat.y=p.y;cat.path.shift();return;} // hop up/down: one quick jump
  const dx=p.x-cat.x,sp=110*dt;if(Math.abs(dx)<=sp){cat.x=p.x;cat.y=p.y;cat.path.shift();}else{cat.dir=Math.sign(dx);cat.x+=cat.dir*sp;cat.y=p.y;}
  cat.sc+=((cat.path.length?.6:CAT_SPOTS[cat.to].sc)-cat.sc)*Math.min(1,dt*4);}
 // company: a cat napping near the plant keeps it a little company
 if(cat.state==='sleep'&&st.started&&st.stage>=4&&!st.night){const b=plantBox();if(Math.abs(cat.x-(b.x+b.w/2))<b.w*.9+120&&Math.abs(cat.y-SPOT[spotKey()].y)<160)st.needs.attention=Math.max(0,st.needs.attention-dt*.002);}}
function catFrame(){const f2=Math.floor(T*1.2)%2;
 if(cat.state==='sleep')return CATF[cat.pose+(f2+1)];
 if(cat.state==='wake')return cat.t<1.2?CATF.yawn:CATF['sit'+(Math.floor(T*2)%2+1)];
 if(cat.state==='sniff')return CATF.sit1;
 if(cat.state==='pet')return CATF['pet'+(Math.floor(T*4)%2+1)];
 if(cat.state==='walk')return CATF['walk'+(Math.floor(T*6)%2+1)];return CATF.sit1;}
function catBox(){const f=catFrame();if(!ok(f))return null;const w=Math.round(f.naturalWidth*cat.sc),h=Math.round(f.naturalHeight*cat.sc);const s1=CATF.sit1,shift=(cat.state==='pet'&&ok(s1))?Math.round((f.naturalWidth-s1.naturalWidth)/2*cat.sc):0;return {f,x:Math.round(cat.x-w/2+shift),y:Math.round(cat.y-h),w,h};}
function drawCat(){const b=catBox();if(!b)return;if(cat.state==='sleep'&&cat.pose==='curl')b.y+=Math.floor(T*1.2)%2;/* breathing: 1px rise and fall */if(cat.state==='walk'&&cat.dir<0){g.save();g.translate(b.x+b.w,b.y);g.scale(-1,1);g.drawImage(b.f,0,0,b.w,b.h);g.restore();}else g.drawImage(b.f,b.x,b.y,b.w,b.h);
 if(cat.state==='sleep'&&Math.floor(T*.7)%3===0)fx('zzz',b.x+b.w*.15,b.y-6,1.5,0,.3);}
function catHit(x,y){const b=catBox();return b&&x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h;}
// Trust (Jackie: earn the cat's affection). 0..1, saved, never goes down (grace); a little per day so it takes a few days.
const TRUST_SHY=.3,TRUST_FOND=.65,TRUST_BFF=.9;
function catTrust(){return st.catTrust||0;}
function trustGain(v){if(st.catDayN!==st.day){st.catDayN=st.day;st.catGain=0;}const room=Math.max(0,.18-(st.catGain||0)),d=Math.min(v,room);if(d<=0)return;
 const before=catTrust();st.catTrust=Math.min(1,before+d);st.catGain=(st.catGain||0)+d;const a=st.catTrust;st.taught=st.taught||{};
 if(before<TRUST_SHY&&a>=TRUST_SHY&&!st.taught.trust1){st.taught.trust1=1;say('The cat trusts you a little now. You can pet it while it naps.',7,true);}
 else if(before<TRUST_FOND&&a>=TRUST_FOND&&!st.taught.trust2){st.taught.trust2=1;say('The cat is fond of you. It might nap next to your plant now.',7,true);}
 else if(before<TRUST_BFF&&a>=TRUST_BFF&&!st.taught.trust3){st.taught.trust3=1;say('The cat adores you. It will come say hi when you get back.',7,true);}}
function catLeave(){cat.state='wake';cat.t=1.2;cat.shyT=15;cat.pets=0;sfx('page');}
function petCat(){const tr=catTrust();if(cat.state==='walk'||(cat.shyT||0)>0)return;const b=catBox();
 if(tr<TRUST_SHY){ // shy: only says hi when it's awake, and only once
  if(cat.state==='sleep'||cat.state==='pet'||cat.state==='sniff'){catLeave();if(!st.taught.catShy){st.taught.catShy=1;say('The cat is still shy. Let it nap, and say hi when it wakes up.',7);}return;}
  cat.state='sniff';cat.t=0;trustGain(.06);if(!st.taught.catSniff){st.taught.catSniff=1;say('It sniffs your hand. That\'s a start.',5);}return;}
 const max=tr>=TRUST_FOND?3:1;if(cat.pets>=max){catLeave();return;} // enough for now: it wanders off, no penalty
 cat.state='pet';cat.t=0;cat.pets++;sfx('purr');fplay('cat_purr');if(b)burst('heart',b.x+b.w/2,b.y,tr>=TRUST_FOND?2:1);trustGain(tr>=TRUST_FOND?.03:.04);
 if(cat.spot==='byplant'&&st.stage>=4){const pb=plantBox();burst('heart',pb.x+pb.w*.15,pb.y-20,1);st.listen=2;st.needs.attention=Math.max(0,st.needs.attention-.15);}
 if(!st.taught.cat){st.taught.cat=1;say('The cat purrs. It naps all over the room and keeps your plant company when it curls up nearby.',7);}}
