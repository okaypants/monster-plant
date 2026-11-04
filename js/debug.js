'use strict';
/* Debug drawer (right side). Opening it switches to TEST MODE: a copy of the real save; nothing done here touches the real game. */
/* ---------- TEST MODE (Jackie): debug must never change the real game ----------
   Open: snapshot the real save (and the cat), then everything happens on that copy; saves go to TEST_KEY (saving.js).
   "Back to my game": the snapshot comes back exactly. "Keep these changes in my real game": only when asked (tap twice).
   Anything the game schedules for later while testing (a seed arriving, a title cheer) is dropped if test mode ends first. */
let dbgOpen=false,dbgHidden=false,dbgPid=null,testEpoch=0,realSnap=null;
const _setTimeout=window.setTimeout;
window.setTimeout=function(f,d,...a){if(!TESTING||typeof f!=='function')return _setTimeout.call(window,f,d,...a);const ep=testEpoch;return _setTimeout.call(window,()=>{if(TESTING&&testEpoch===ep)f(...a);},d);};
const plainCat=()=>JSON.stringify(cat,(k,v)=>v instanceof HTMLImageElement?undefined:v);
function enterTest(){save();realSnap={st:JSON.stringify(st),cat:plainCat(),byplant:CAT_SPOTS.byplant?{...CAT_SPOTS.byplant}:null,rugX:CAT_SPOTS.rug.x,screens:[...document.querySelectorAll('.screen')]};
 TESTING=true;testEpoch++;dbgPid=st.id;document.body.classList.add('testing');}
function leaveTest(keep){if(!TESTING)return;testEpoch++;
 if(!keep){st=Object.assign(fresh(),JSON.parse(realSnap.st));for(const k of Object.keys(cat))delete cat[k];Object.assign(cat,JSON.parse(realSnap.cat));
  if(realSnap.byplant)CAT_SPOTS.byplant=realSnap.byplant;else delete CAT_SPOTS.byplant;CAT_SPOTS.rug.x=realSnap.rugX;}
 SEASON_OVERRIDE=null;FX_OFF.clear();PAUSED=false;lightMap=false;dbgFx=null;if(keep){cat.force=null;cat.hold=false;} // back: the cat is exactly as he was
 held.tool=null;drag.on=false;parts.length=0;zzNow=null;nudgeKey=null;ACT=st.id;pickChair();cap.style.transition='none';cap.style.opacity=0;cap.textContent='';capT=0;capLock=0;_setTimeout(()=>{cap.style.transition='';},50);closeBubble();for(const sc of document.querySelectorAll('.screen'))if(!realSnap.screens.includes(sc))sc.remove(); // no test captions, bubbles or screens left on the real game
 TESTING=false;if(keep)save();realSnap=null;document.body.classList.remove('testing');try{localStorage.removeItem(TEST_KEY);}catch(e){}}

/* ---------- the drawer ---------- */
const dbg=document.getElementById('dbg'),dbgTab=document.getElementById('dbgTab');
const DRAWER_W=()=>Math.min(300,Math.round(innerWidth*.4));
function placeDrawer(){const w=DRAWER_W(),show=dbgOpen&&!dbgHidden;dbg.style.width=w+'px';dbg.classList.toggle('open',show);dbgTab.style.display=dbgOpen&&dbgHidden?'block':'none';FIT_RIGHT=show?w:0;fit();}
function openDbg(){if(!dbgOpen){enterTest();dbgOpen=true;dbgHidden=false;buildDbg();}else dbgHidden=false;placeDrawer();}
function closeDbg(keep){leaveTest(keep);dbgOpen=false;dbgHidden=false;dbg.innerHTML='';placeDrawer();}
document.getElementById('dbgBtn').addEventListener('click',e=>{e.stopPropagation();if(dbgOpen&&!dbgHidden)dbgHidden=true,placeDrawer();else openDbg();});
dbgTab.addEventListener('click',e=>{e.stopPropagation();openDbg();});
addEventListener('resize',()=>{if(dbgOpen)placeDrawer();});

// live controls: each knows how to read its value back, so the drawer always shows what the game is doing (skipped while you're dragging it)
let SYNC=[];
function dbgSync(){if(!dbgOpen)return;for(const f of SYNC)try{f();}catch(e){}const s=dbg.querySelector('#dStatus');if(s)s.innerHTML=statusLine();}
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
const OPENS={};function group(parent,title,open,fill){const d=el('details','grp');d.open=OPENS[title]??open;d.ontoggle=()=>{OPENS[title]=d.open;};d.appendChild(el('summary','',esc(title)));const body=el('div','gbody');d.appendChild(body);fill(body);parent.appendChild(d);return d;}
function row(p,label){const r=el('div','row');if(label)r.appendChild(el('label','',esc(label)));p.appendChild(r);return r;}
function slider(p,label,min,max,step,get,set,fmt=v=>(+v).toFixed(2)){const r=row(p,label),i=el('input');Object.assign(i,{type:'range',min,max,step});const o=el('output');r.append(i,o);
 i.oninput=()=>{set(+i.value);o.textContent=fmt(+i.value);};SYNC.push(()=>{if(document.activeElement===i)return;const v=get();i.value=v;o.textContent=fmt(v);});return i;}
function seg(p,label,opts,get,set){const r=row(p,label),w=el('div','seg');r.appendChild(w);const bs=opts.map(([v,t])=>{const b=el('button','',esc(t));b.type='button';b.onclick=()=>{set(v);dbgSync();};w.appendChild(b);return [v,b];});
 SYNC.push(()=>{const g=get();for(const[v,b]of bs)b.classList.toggle('on',v===g);});}
function toggle(p,label,get,set){seg(p,label,[[true,'on'],[false,'off']],()=>!!get(),set);}
function pick(p,label,opts,get,set){const r=row(p,label),s=el('select');opts.forEach(([v,t])=>{const o=el('option','',esc(t));o.value=v;s.appendChild(o);});r.appendChild(s);s.onchange=()=>set(s.value);SYNC.push(()=>{if(document.activeElement!==s)s.value=String(get());});}
function btns(p,list){const r=el('div','btns');for(const[t,f]of list){const b=el('button','',esc(t));b.type='button';b.onclick=()=>{f();buildDbgSoon();};r.appendChild(b);}p.appendChild(r);return r;}
function chips(p,label,items,has,flip){const r=row(p,label),w=el('div','seg wrap');r.appendChild(w);const bs=items.map(([v,t])=>{const b=el('button','',esc(t));b.type='button';b.onclick=()=>{flip(v);dbgSync();};w.appendChild(b);return [v,b];});SYNC.push(()=>{for(const[v,b]of bs)b.classList.toggle('on',!!has(v));});}
let rebuildT=null;function buildDbgSoon(){clearTimeout(rebuildT);rebuildT=_setTimeout(()=>{if(dbgOpen)buildDbg();},60);}

// the plant being edited (tabs); edits go through withPlant so every plant keeps its own id, name, nature and history
const pRaw=()=>allRaw().find(q=>q.id===dbgPid)||st;
const onP=f=>{withPlant(pRaw().id,f);};
const AGE_OPTS=[[0,'seed'],[1,'sprout'],[4,'kid'],[6,'teen'],[8,'adult']];
function statusLine(){const p=pRaw();return `<b>Day ${st.day}</b> · ${phase(st.dayT)}${PAUSED?' (paused)':''} · ${seasonNow()}${SEASON_OVERRIDE?' (set)':''} · plants ${plantCount()}<br>`+
 (p.stage>=0?`${esc(NAMES[p.species])}, ${ageName(p.stage)} · light ${(p.light||0).toFixed(2)} ${p.lightState} · gray ${(p.dryLv||0).toFixed(2)}/4 withered ${p.witherLv||0} burned ${p.burnLv||0} puddle ${p.puddleLv||0}`:'no plant yet')+
 `<br>cat: ${cat.state}${cat.force?' (holding '+cat.force+')':''} at ${cat.spot} · trust ${trustName(catTrust())}`;}
function trustName(t){return t>=TRUST_BFF?'BFF':t>=TRUST_FOND?'fond':t>=TRUST_SHY?'warming up':'shy';}

function buildDbg(){const sc=dbg.scrollTop;SYNC=[];dbg.innerHTML='';
 const head=el('div','dhead');head.appendChild(el('div','tm','TEST MODE'));
 const back=el('button','big','Back to my game');back.type='button';back.onclick=()=>closeDbg(false);
 const keep=el('button','keep','Keep these changes in my real game');keep.type='button';keep.onclick=()=>{if(keep.dataset.sure){closeDbg(true);return;}keep.dataset.sure=1;keep.textContent='Tap again to keep them for real';_setTimeout(()=>{if(keep.isConnected){delete keep.dataset.sure;keep.textContent='Keep these changes in my real game';}},4000);};
 const hide=el('button','','Hide');hide.type='button';hide.onclick=()=>{dbgHidden=true;placeDrawer();};
 const top=el('div','hrow');top.append(head.firstChild,back,hide);head.appendChild(top);head.appendChild(el('div','status',''));head.lastChild.id='dStatus';dbg.appendChild(head);
 const body=el('div','dbody');dbg.appendChild(body);body.appendChild(keep);

 group(body,'World',true,b=>{
  slider(b,'Time of day',0,.999,.001,()=>st.dayT,v=>{st.dayT=v;st.night=false;},v=>phase(v)+' '+v.toFixed(2));
  btns(b,[['Morning',()=>{st.dayT=.1;st.night=false;}],['Midday',()=>{st.dayT=.37;st.night=false;}],['Golden hour',()=>{st.dayT=.6;st.night=false;}],['Dusk',()=>{st.dayT=.77;st.night=false;}],['Night',()=>{st.dayT=.92;st.night=false;}]]);
  seg(b,'Season',[[null,'auto'],['spring','spring'],['summer','summer'],['autumn','autumn'],['winter','winter']],()=>SEASON_OVERRIDE,v=>{SEASON_OVERRIDE=v;});
  slider(b,'Day',1,60,1,()=>st.day,v=>{st.day=v;},v=>String(v));
  const SPEEDS=[1,2,5,10,20,60];slider(b,'Speed',0,SPEEDS.length-1,1,()=>Math.max(0,SPEEDS.indexOf(st.speed)),v=>{st.speed=SPEEDS[v];},v=>SPEEDS[v]+'x'+(SPEEDS[v]===2?' (normal)':''));
  toggle(b,'Pause time',()=>PAUSED,v=>{PAUSED=v;});
  seg(b,'Clock',[['visit','visit'],['ambient','ambient'],['actions','only on actions']],()=>st.mode,v=>{st.mode=v;});
  seg(b,'Curtains',[['open','open'],['closed','closed']],()=>st.curtain,v=>{st.curtain=v;});
  for(const L of LAMPS)toggle(b,L.name[0].toUpperCase()+L.name.slice(1),()=>lampOn(L),v=>{st[L.key]=v;}); // every lamp in LAMPS gets a switch
  toggle(b,'Light map',()=>lightMap,v=>{lightMap=v;});});

 group(body,'Plants',true,b=>{
  const tabs=el('div','seg wrap tabs');allRaw().filter(q=>q.stage>=0).forEach((q,i)=>{const t=el('button','',esc((i+1)+'. '+NAMES[q.species]));t.type='button';t.classList.toggle('on',q.id===pRaw().id);t.onclick=()=>{dbgPid=q.id;buildDbg();};tabs.appendChild(t);});b.appendChild(tabs);
  if(pRaw().stage<0){btns(b,[['Add plant',dbgAddPlant]]);return;}
  pick(b,'Species',NAMES.map((n,i)=>[i,(i+1)+' '+n]),()=>pRaw().species,v=>onP(()=>{st.species=+v;}));
  seg(b,'Age',AGE_OPTS,()=>pRaw().stage,v=>onP(()=>{st.stage=v;st.timer=0;st.walk=null;}));
  pick(b,'Eyes',EYE_NAMES.map((n,i)=>[i,(i+1)+' '+n]),()=>pRaw().eye,v=>onP(()=>{st.eye=+v;}));
  seg(b,'Likes',[['sun','sun'],['shade','shade'],['night','night']],()=>pRaw().pref,v=>onP(()=>{st.pref=v;}));
  slider(b,'Good ↔ evil (now)',-1,1,.01,()=>-pRaw().ge,v=>onP(()=>{st.ge=-v;}),v=>(v<-.33?'good ':v>.33?'evil ':'')+(-v).toFixed(2));
  slider(b,'Lawful ↔ chaotic (now)',-1,1,.01,()=>-pRaw().lc,v=>onP(()=>{st.lc=-v;}),v=>(v<-.33?'lawful ':v>.33?'chaotic ':'')+(-v).toFixed(2));
  slider(b,'Born good ↔ evil',-1,1,.01,()=>-(pRaw().nge||0),v=>onP(()=>{st.nge=-v;}),v=>(-v).toFixed(2));
  slider(b,'Born lawful ↔ chaotic',-1,1,.01,()=>-(pRaw().nlc||0),v=>onP(()=>{st.nlc=-v;}),v=>(-v).toFixed(2));
  slider(b,'Thirst',0,1,.01,()=>pRaw().needs.thirst,v=>onP(()=>{st.needs.thirst=v;}));
  slider(b,'Lonely (needs company)',0,1,.01,()=>pRaw().needs.attention,v=>onP(()=>{st.needs.attention=v;}));
  slider(b,'Fullness',0,1,.01,()=>pRaw().full||0,v=>onP(()=>{st.full=v;}));
  toggle(b,'Nap',()=>pRaw().nap>0,v=>onP(()=>{st.nap=v?1e6:0;}));
  const p=pRaw(),gp=p.stage<4?'seed':p.stage===4?'baby':'grown';
  if(gp==='grown'){slider(b,'Rug x',FLOOR_X0,FLOOR_X1,1,()=>pRaw().free?pRaw().free.x:SPOT.rugC.x,v=>onP(()=>{spotKey();st.free.x=v;st.walk=null;}),v=>String(v));
   slider(b,'Rug y (back ↔ front)',FLOOR_BACK,FLOOR_FRONT,1,()=>pRaw().free?pRaw().free.y:SPOT.rugC.y,v=>onP(()=>{spotKey();st.free.y=v;st.walk=null;}),v=>String(v));
   btns(b,[['By the window',()=>onP(()=>{st.free={x:SPOT.rugL.x,y:SPOT.rugL.y};st.walk=null;})],['By the armchair',()=>onP(()=>{st.free={x:SPOT.rugC.x,y:SPOT.rugC.y};st.walk=null;})],['By the desk',()=>onP(()=>{st.free={x:SPOT.rugR.x,y:SPOT.rugR.y};st.walk=null;})]]);}
  else seg(b,'Spot',GROUPS[gp].map(k=>[k,{sill:'windowsill',desk:'desk',crate:'milk crate',books:'book stack'}[k]]),()=>(pRaw().place||{})[gp],v=>onP(()=>{st.place=st.place||{};st.place[gp]=v;}));
  chips(b,'Charms',SNACKS.map(s=>[s.trait,s.trait]),t=>(pRaw().traits||[]).includes(t),t=>onP(()=>{st.traits=st.traits||[];st.traits=st.traits.includes(t)?st.traits.filter(x=>x!==t):st.traits.concat(t);if(st.wear&&!st.traits.includes(st.wear))st.wear=null;}));
  chips(b,'Titles',Object.entries(TITLES),t=>(pRaw().titles||[]).includes(t),t=>onP(()=>{st.titles=st.titles||[];st.titles=st.titles.includes(t)?st.titles.filter(x=>x!==t):st.titles.concat(t);}));
  btns(b,[['Reset quirks',()=>onP(()=>{st.quirks={};st.quirkT=null;})],['Grow one age',()=>onP(()=>{if(NEXT[st.stage]!=null){st.stage=NEXT[st.stage];st.timer=0;}})]]);
  btns(b,[['Add plant',dbgAddPlant],['Remove this plant',dbgRemovePlant],['Make two adults',dbgTwoAdults],['Breed now',dbgBreed],['End day',()=>{st.night=true;wake();}]]);});

 group(body,'Cat',true,b=>{
  slider(b,'Trust',0,1,.01,()=>catTrust(),v=>{st.catTrust=v;},v=>trustName(v)+' '+(+v).toFixed(2));
  seg(b,'State',[['sleep','sleeping'],['wake','awake'],['walk','walking'],['pet','petted'],['settle','settling'],['annoyed','had enough']],()=>cat.state==='loafwake'?'settle':cat.state,v=>dbgCatState(v));
  toggle(b,'Walk there (off = put him there)',()=>dbgWalk,v=>{dbgWalk=v;});
  btns(b,['bed','rug','chair','sill','crate','books','byplant'].map(k=>[{bed:'Cat bed',rug:'Rug',chair:'Armchair',sill:'Windowsill',crate:'Milk crate',books:'Book stack',byplant:'By the plant'}[k],()=>dbgCatTo(k)]));
  pick(b,'Pose (holds it)',[['','(none: he does his thing)']].concat(Object.keys(CATF).filter(n=>!n.startsWith('scratcher')).map(n=>[n,n])),()=>cat.force||'',v=>{cat.force=v||null;cat.hold=!!v;});});

 group(body,'Effects and reactions',false,b=>{
  for(const[n,t]of[['hearts','Hearts'],['sparkles','Sparkles (listening)'],['sweat','Sweat'],['zzz','Zzz'],['flames','Little flame'],['puddle','Puddle'],['drops','Water drops']]){
   const r=row(b,t),w=el('div','seg');r.appendChild(w);
   const on=el('button','','on'),off=el('button','','off'),play=el('button','play','▶ replay');[on,off,play].forEach(x=>{x.type='button';w.appendChild(x);});
   on.onclick=()=>{FX_OFF.delete(n);dbgSync();};off.onclick=()=>{FX_OFF.add(n);dbgSync();};play.onclick=()=>dbgReplay(n);
   SYNC.push(()=>{on.classList.toggle('on',!FX_OFF.has(n));off.classList.toggle('on',FX_OFF.has(n));});}
  btns(b,[['Hop',()=>onP(()=>doMove('hop'))],['Bow',()=>onP(()=>doMove('bow'))],['Sway',()=>onP(()=>doMove('sway'))],['Grin',()=>onP(()=>doMove('grin'))],['Bob',()=>onP(()=>doMove('bob'))],
   ['Boing',()=>onP(()=>{const pb=plantBox();plantBoing(pb.x+pb.w*.3);})],['Idle wiggle',()=>{idleNext=1;}],['Cat purr',()=>{const cb=catBox();if(cb)burst('heart',cb.x+cb.w/2,cb.y,2);sfx('purr');}]]);});

 group(body,'Presets',false,b=>{
  const list=el('div','presets');b.appendChild(list);
  const all=Object.assign({},BUILT_IN,dbgPresets());
  for(const name of Object.keys(all)){const r=el('div','btns');const l=el('button','',esc('Load: '+name));l.type='button';l.onclick=()=>{loadPreset(all[name]);buildDbg();};r.appendChild(l);
   if(!BUILT_IN[name]){const d=el('button','',esc('Delete'));d.type='button';d.onclick=()=>{const P=dbgPresets();delete P[name];setPresets(P);buildDbg();};r.appendChild(d);}list.appendChild(r);}
  const r=row(b,'Save this setup as'),inp=el('input');inp.type='text';inp.placeholder='e.g. two adults at golden hour in winter';r.appendChild(inp);
  btns(b,[['Save preset',()=>{const n=inp.value.trim();if(!n)return;const P=dbgPresets();P[n]=snapPreset();setPresets(P);}],
   ['Reset to my real save',()=>{loadPreset({st:realSnap.st,cat:realSnap.cat});}],['Brand-new game (test only)',()=>{st=fresh();cat.state='sleep';closeDrawerForStart();}]]);});

 group(body,'Nudge (positions table, not your save)',false,b=>{b.innerHTML=NUDGE_HTML();buildNudge(b);});
 dbgSync();dbg.scrollTop=sc;}

// plants
function dbgAddPlant(){if(plantCount()>=3){say('Room for 3 plants at most.',3,true);return;}if(!st.started||st.stage<0){Object.assign(st,{started:true,stage:0});dbgPid=st.id;return;}const p=freshPlant();addPlant(p);dbgPid=p.id;}
function dbgRemovePlant(){const id=pRaw().id;if(plantCount()<=1){say('Keep at least one plant (or use Brand-new game).',3,true);return;}
 if(st.id===id)swapIn(0);st.others=st.others.filter(q=>q.id!==id);dbgPid=st.id;ACT=st.id;pickChair();}
function dbgTwoAdults(){while(plantCount()<2)addPlant(freshPlant());const ids=allRaw().filter(q=>q.stage>=0).slice(0,2).map(q=>q.id),xy=[[SPOT.rugL.x,SPOT.rugL.y],[SPOT.rugR.x,SPOT.rugR.y]];
 ids.forEach((id,i)=>withPlant(id,()=>{st.stage=8;st.nap=0;st.free={x:xy[i][0],y:xy[i][1]};st.walk=null;}));dbgPid=ids[0];}
function dbgBreed(){eachPlant(()=>{if(st.stage>=0){const k=spotKey();st._pos={id:st.id,g:stageGroup(),k,x:SPOT[k].x,y:SPOT[k].y};}});const A=allRaw().filter(q=>q.stage>=8);
 if(A.length>=2&&plantCount()<3)crossPollinate(A[0],A[1]);else say('Breeding needs two adults and room for a third plant.',3,true);}
// cat
let dbgWalk=true;
function dbgCatState(v){cat.force=null;cat.hold=false;cat.huff=0;
 if(v==='sleep'){cat.state='sleep';cat.t=5;cat.nap=rnd(60,150);if(!['curl','loaf','side'].includes(cat.pose))cat.pose='curl';}
 else if(v==='wake'){cat.state='wake';cat.t=1.3;}else if(v==='walk')catGo(catPick());else if(v==='pet'){cat.state='pet';cat.t=0;cat.belly=catTrust()>=TRUST_BFF&&Math.random()<.35;}
 else if(v==='settle'){cat.huffN=1;cat.huff=1;huffSettle();}else if(v==='annoyed')catLeave();}
function dbgCatTo(k){cat.force=null;cat.hold=false;if(k==='byplant'){const ps=plantSideSpot();if(!ps){say('The cat naps by a plant only when a teen or adult is on the rug.',4,true);return;}CAT_SPOTS.byplant=ps;}
 if(k==='rug'){const r=CAT_SPOTS.rug;r.x=floorX({...r,x:RUG_X})??RUG_X;}
 if(dbgWalk){catGo(k);return;}const s=CAT_SPOTS[k];Object.assign(cat,{spot:k,x:s.x,y:s.y,sc:s.sc,state:'sleep',pose:s.poses[0],t:5,nap:rnd(60,150),path:null,huff:0});}
// effect previews: shown over the plant for 3 s, whatever its state
let dbgFx=null;
function dbgReplay(n){FX_OFF.delete(n);dbgFx={n,t0:T};if(n==='hearts')onP(()=>{const pb=plantBox();burst('heart',pb.x+pb.w/2,pb.y,3);});if(n==='drops')onP(()=>{const pb=plantBox();burst('drop',pb.x+pb.w/2,pb.y+pb.h*.3,8);});dbgSync();}
function dbgFxDraw(){if(!dbgFx||!TESTING)return;if(T-dbgFx.t0>3){dbgFx=null;return;}const n=dbgFx.n;if(n==='hearts'||n==='drops')return;
 withPlant(pRaw().id,()=>{if(st.stage<0)return;const pb=plantBox();if(n==='puddle')fx('puddle',pb.x+pb.w/2,baseY()-12,1.5,0,FX_SCALE*clamp(pb.w/220,.5,1.7));
  else if(n==='zzz'){const f=FX.zzz[1];if(ok(f))g.drawImage(f,Math.round(pb.x+pb.w),Math.round(pb.y-40-(T-dbgFx.t0)*12),Math.round(f.naturalWidth*.5),Math.round(f.naturalHeight*.5));}
  else if(n==='flames')fx('flames',pb.x+pb.w/2,pb.y-30,5,0,.27);else fx(n,pb.x+pb.w+50,pb.y+pb.h*.4,3);});}
// presets: full setups kept on this device (never in the real save)
const PRESET_KEY='mp-presets';
function dbgPresets(){try{return JSON.parse(localStorage.getItem(PRESET_KEY))||{};}catch(e){return {};}}
function setPresets(P){try{localStorage.setItem(PRESET_KEY,JSON.stringify(P));}catch(e){}}
function snapPreset(){return {st:JSON.stringify(st),cat:plainCat(),season:SEASON_OVERRIDE,paused:PAUSED};}
function loadPreset(p){if(typeof p==='function'){p();return;}st=Object.assign(fresh(),JSON.parse(p.st));for(const k of Object.keys(cat))delete cat[k];Object.assign(cat,JSON.parse(p.cat));
 SEASON_OVERRIDE=p.season||null;PAUSED=!!p.paused;dbgPid=st.id;ACT=st.id;pickChair();}
const BUILT_IN={
 'Two adults at golden hour in winter':()=>{dbgTwoAdults();st.dayT=.6;st.night=false;st.curtain='open';SEASON_OVERRIDE='winter';},
 'A seed on the windowsill, morning':()=>{st=Object.assign(fresh(),{started:true,stage:0,id:st.id||1,others:[],place:{seed:'sill'},dayT:.1,mode:'actions',catTrust:st.catTrust,day:st.day});giveNature(st);dbgPid=st.id;ACT=st.id;},
 'BFF cat napping by an adult':()=>{if(pRaw().stage<6)onP(()=>{st.stage=8;st.nap=0;});st.catTrust=.95;dbgCatTo('byplant');}};
function closeDrawerForStart(){dbgHidden=true;placeDrawer();startFlow();} // a brand-new game starts with the title and quiz, still in test mode

// Nudge tool markup (kept from the old panel)
const NUDGE_HTML=()=>`<div class="nudge">1 px at a time; uses this plant's species. Saved on this device for every game.<br>
 <select id="nKind"><option value="plant">plant</option><option value="cat">cat</option></select>
 <span id="nPl">age <select id="nAge">${['seed','sprout','kid','teen','adult'].map(a=>`<option>${a}</option>`).join('')}</select> spot <select id="nSpot">${['sill','desk','crate','books','rug','chair'].map(a=>`<option>${a}</option>`).join('')}</select></span>
 <span id="nCt" style="display:none">pose <select id="nPose">${['curl','loaf','side','sit','pet','belly','walk'].map(a=>`<option>${a}</option>`).join('')}</select> spot <select id="nCSpot">${['bed','rug','chair','sill','crate','books','byplant','floor'].map(a=>`<option>${a}</option>`).join('')}</select></span>
 <button id="nShow" type="button">Show</button><br>
 <button data-n="-1,0" type="button">←</button><button data-n="1,0" type="button">→</button><button data-n="0,-1" type="button">↑</button><button data-n="0,1" type="button">↓</button><button data-n="0,0" type="button">reset</button> <span id="nVal">pick, then Show</span><br>
 <button id="nDone" type="button">Done</button><button id="nCopy" type="button">Copy table</button><textarea id="nOut" style="display:none;width:100%;height:60px;font-size:11px"></textarea></div>`;

/* ---------- LIGHT MAP (debug only): the light zones, and how much light each spot gets right now ---------- */
// asks the plants' own light (lightInfo, spotInfo, lightFeel, lightSources in light.js), so it shows exactly why a plant says too bright or too dark.
// cells = stepped colors by light level; yellow dots = the window's sun patch; orange rings = lamp grow-light circles (inner ring = right under);
// white outline = where the plant you're tending would be happy.
let lightMap=false;
const LM_STEPS=[[.1,'#1b1b4a'],[.2,'#2e3a8c'],[.3,'#3c6fb4'],[.45,'#4fa3a5'],[.6,'#8cc152'],[.75,'#e2d23c'],[.95,'#f5a524'],[99,'#ff6a3d']];
const lmColor=L=>LM_STEPS.find(s=>L<s[0])[1],LM_CELL=20,LM_MAX=1.2;
function lmVerdict(f){return f==='hi'?'too bright':f==='lo'?'too dark':'just right';}
function lmText(t,x,y,al='center'){g.font='16px "Pixelify Sans", monospace';g.textAlign=al;g.textBaseline='middle';const w=Math.ceil(g.measureText(t).width)+12,x0=Math.round(al==='center'?x-w/2:x-6);
 g.fillStyle='rgba(25,16,27,.85)';g.fillRect(x0,Math.round(y-11),w,22);g.fillStyle=C.ivory;g.fillText(t,Math.round(x),Math.round(y)+1);}
function lmBox(x,y,w,h){g.fillStyle=C.ivory;g.fillRect(x,y,w,3);g.fillRect(x,y+h-3,w,3);g.fillRect(x,y,3,h);g.fillRect(x+w-3,y,3,h);}
function lmRing(x,y,rx,ry,col,dot){g.fillStyle=col;const n=Math.round((rx+ry)/4);for(let a=0;a<n;a++){const t=a/n*Math.PI*2;g.fillRect(Math.round(x+Math.cos(t)*rx-dot/2),Math.round(y+Math.sin(t)*ry-dot/2),dot,dot);}}
function drawLightMap(){const gp=st.stage>=0?stageGroup():'',xs=[],ys=[];g.save();
 for(let x=FLOOR_X0-20;x<FLOOR_X1+20;x+=LM_CELL)xs.push(x);for(let y=FLOOR_BACK-40;y<FLOOR_FRONT+20;y+=LM_CELL)ys.push(y);
 const I=ys.map(y=>xs.map(x=>lightInfo(x+LM_CELL/2,y+LM_CELL/2)));
 g.globalAlpha=.62;ys.forEach((y,j)=>xs.forEach((x,i)=>{g.fillStyle=lmColor(I[j][i].L);g.fillRect(x,y,LM_CELL,LM_CELL);}));g.globalAlpha=1;
 if(gp==='grown'){g.fillStyle=C.ivory;const f=(j,i)=>j>=0&&i>=0&&j<ys.length&&i<xs.length&&lightFeel(I[j][i],st.pref)==='ok';
  ys.forEach((y,j)=>xs.forEach((x,i)=>{if(!f(j,i))return;if(!f(j-1,i))g.fillRect(x,y,LM_CELL,3);if(!f(j+1,i))g.fillRect(x,y+LM_CELL-3,LM_CELL,3);if(!f(j,i-1))g.fillRect(x,y,3,LM_CELL);if(!f(j,i+1))g.fillRect(x+LM_CELL-3,y,3,LM_CELL);}));}
 for(const s of lightSources()){if(s.kind==='patch'){lmRing(s.x,s.y,s.rx,s.ry,C.fl3,s.harsh?8:5);lmText('sun patch'+(s.harsh?': too strong for shade & night now':''),s.x,s.y-s.ry-14);}
  else{lmRing(s.x,s.y,s.r,s.r,C.fl2,6);lmRing(s.x,s.y,s.core,s.core,C.fl2,3);lmText(s.name+' glow',s.x,s.y-s.r+14);}}
 for(const k of['sill','desk','crate','books']){const s=SPOT[k],i=spotInfo(k),x=s.x-60,y=s.y-20;g.globalAlpha=.65;g.fillStyle=lmColor(i.L);g.fillRect(x,y,120,24);g.globalAlpha=1;
  if((GROUPS[gp]||[]).includes(k)&&lightFeel(i,st.pref)==='ok')lmBox(x,y,120,24);lmText(k+' '+i.L.toFixed(2)+' · '+i.zone,s.x,s.y+20);}
 g.restore();}
function drawLightTags(){const rows=[],act=st.id;g.save();
 eachPlant(()=>{if(st.stage<0)return;const b=plantBox(),i=spotInfo(spotKey()),f=st.stage<1?'ok':lightFeel(i,st.pref),v=lmVerdict(f);
  const told=lmVerdict(st.lightState||'ok'),says=st.stage<1?' (seeds don\'t mind)':told!==v?' · it still says '+told:''; // too much light takes a while to bother it
  lmText(i.L.toFixed(2)+' '+v+' · '+i.zone+says+(st.night||st.nap>0?' (asleep)':''),b.x+b.w/2,Math.max(20,Math.round(b.y-14)));
  rows.push({name:NAMES[st.species]+' ('+STAGES[st.stage]+')',pref:st.pref,need:NEED[st.pref],L:i.L,act:st.id===act,v:v+says});});
 const src=lightSources(),patch=src[0],X=500,Y=8,BW=620,RH=36,h=168+rows.length*RH,bx=X+20,sx=v=>bx+Math.round(clamp(v,0,LM_MAX)/LM_MAX*BW);
 g.fillStyle='rgba(25,16,27,.88)';g.fillRect(X,Y,BW+40,h);g.fillStyle=C.ivory;g.textAlign='left';g.textBaseline='middle';g.font='16px "Pixelify Sans", monospace';
 g.fillText('Light map · '+phase(st.dayT)+' ('+st.dayT.toFixed(2)+')'+(st.night?' · night':'')+' · curtains '+st.curtain+' · sun patch '+(patch.harsh?'harsh (midday)':'gentle'),bx,Y+16);
 g.fillText('Grow lights: '+LAMPS.map(p=>p.name+' '+(lampOn(p)?'on':'off')).join(' · ')+' · room light everywhere else',bx,Y+38);
 for(let i=0;i<LM_STEPS.length;i++){const a=i?LM_STEPS[i-1][0]:0;if(a>=LM_MAX)break;g.fillStyle=LM_STEPS[i][1];g.fillRect(sx(a),Y+54,sx(LM_STEPS[i][0])-sx(a),14);}
 g.font='13px "Pixelify Sans", monospace';g.textAlign='center';g.fillStyle=C.ivory;for(const v of[0,.3,.6,.9,1.2]){g.fillRect(sx(v)-1,Y+68,2,5);g.fillText(v.toFixed(1),sx(v),Y+81);}
 g.textAlign='left';rows.forEach((r,i)=>{const y=Y+96+i*RH;g.fillStyle=C.vio;g.fillRect(sx(r.need),y,sx(LM_MAX)-sx(r.need),8);g.fillStyle=C.ivory;g.fillRect(sx(r.need),y-3,2,14);g.fillStyle=C.fl1;g.fillRect(sx(r.L)-2,y-5,4,18);
  g.fillStyle=C.ivory;g.fillText((r.act?'* ':'')+r.name+' likes '+r.pref+' (needs '+r.need.toFixed(2)+'+) · now '+r.L.toFixed(2)+' '+r.v,bx,y+21);});
 g.fillText('bar = light it\'s happy with · red tick = its light now · too bright only in midday sun or right under a lamp',bx,Y+h-48);
 g.fillText('yellow dots = the window\'s sun patch · orange rings = lamp grow light (inner ring = right under)',bx,Y+h-30);
 g.fillText('* = the one you\'re tending · white outline = where it would be happy',bx,Y+h-12);
 g.restore();}

/* ---------- NUDGE (debug): put one plant (species, age, spot) or the cat (pose, spot) in place, move it 1 px at a time ----------
   Each nudge is saved into NUDGE (js/nudges.js) at once and kept on this device; Copy table gives the text to paste into js/nudges.js for good. */
let nudgeKey=null;
const NUDGE_AGE={seed:0,sprout:1,kid:4,teen:6,adult:8},NUDGE_FITS={seed:['sill','desk'],sprout:['sill','desk'],kid:['crate','books','chair'],teen:['rug','chair'],adult:['rug','chair']};
const CAT_STATE={curl:'sleep',loaf:'sleep',side:'sleep',sit:'sniff',pet:'pet',belly:'pet',walk:'walk'};
function buildNudge(c){const q=s=>c.querySelector(s),kind=()=>q('#nKind').value;
 q('#nKind').onchange=()=>{q('#nPl').style.display=kind()==='plant'?'':'none';q('#nCt').style.display=kind()==='cat'?'':'none';};
 const show=()=>{const v=nudgeKey&&(nudgeKey.kind==='plant'?NUDGE.plant:NUDGE.cat)[nudgeKey.key];q('#nVal').textContent=nudgeKey?nudgeKey.key+': '+(v?v.join(', '):'0, 0'):'pick, then Show';};
 q('#nShow').onclick=()=>{if(kind()==='plant'){const age=q('#nAge').value,spot=q('#nSpot').value;
   if(!NUDGE_FITS[age].includes(spot)){say('A '+age+' can\'t use the '+spot+'. Try: '+NUDGE_FITS[age].join(', ')+'.',4,true);return;}
   st.stage=NUDGE_AGE[age];st.started=true;st.place=st.place||{};st.walk=null;st.nap=spot==='chair'?1e6:0; // asleep in the armchair until Done
   if(spot!=='rug'&&spot!=='chair')st.place[stageGroup()]=spot;pickChair();nudgeKey={kind:'plant',key:(st.species+1)+'|'+age+'|'+spot};}
  else{const pose=q('#nPose').value,spot=q('#nCSpot').value,s=spot==='byplant'?plantSideSpot():spot==='floor'?{x:800,y:SURFACE.floor,sc:.6}:CAT_SPOTS[spot];
   if(!s){say('The cat sits by a plant only when a teen or adult is on the rug.',4,true);return;}
   Object.assign(cat,{hold:true,spot:pose==='walk'?'floor':spot,x:s.x,y:s.y,sc:s.sc,pose,state:CAT_STATE[pose],belly:pose==='belly',dir:1,path:null,t:0,nap:1e6});
   nudgeKey={kind:'cat',key:pose+'|'+(pose==='walk'?'floor':spot)};}
  show();};
 c.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{if(!nudgeKey)return;const t=nudgeKey.kind==='plant'?NUDGE.plant:NUDGE.cat,[dx,dy]=b.dataset.n.split(',').map(Number),v=t[nudgeKey.key]||[0,0];
  const n=dx||dy?[v[0]+dx,v[1]+dy]:[0,0];if(n[0]||n[1])t[nudgeKey.key]=n;else delete t[nudgeKey.key];
  try{localStorage.setItem('mp-nudges',JSON.stringify(NUDGE));}catch(e){}show();});
 q('#nDone').onclick=()=>{if(nudgeKey&&nudgeKey.kind==='plant'&&st.nap>1e5)st.nap=0;cat.hold=false;if(cat.nap>1e5)cat.nap=rnd(30,70);nudgeKey=null;show();};
 q('#nCopy').onclick=()=>{const t='const NUDGE='+JSON.stringify(NUDGE)+';',o=q('#nOut');o.style.display='block';o.value=t;o.select();if(navigator.clipboard)navigator.clipboard.writeText(t).catch(()=>{});say('Nudge table copied. Paste it over the NUDGE line in js/nudges.js (or send it to Claude).',6,true);}; // if the browser won't copy, the selected text box is there to copy by hand
 show();}
