'use strict';
/* Debug panel (top right). */
/* ---------- debug ---------- */
const dbg=document.getElementById('dbg');let dbgOpen=false;
document.getElementById('dbgBtn').addEventListener('click',e=>{e.stopPropagation();dbgOpen=!dbgOpen;dbg.style.display=dbgOpen?'block':'none';dbgBuilt=false;if(dbgOpen)renderDbg();});
// status text refreshes every second; the controls are built once per open, so dropdowns don't snap shut (iPad fix)
let dbgBuilt=false;
function renderDbg(){
 if(!dbgBuilt){dbg.innerHTML='<div id="dStat"></div><div id="dCtl"></div>';buildDbgCtl();dbgBuilt=true;}
 dbg.querySelector('#dStat').innerHTML=`<b>Day ${st.day}</b> · ${phase(st.dayT)} (${st.dayT.toFixed(2)}) · curtains ${st.curtain} · cat trust ${(st.catTrust||0).toFixed(2)}<br>
 species #${st.species+1} ${NAMES[st.species]} · ${st.stage<0?'—':STAGES[st.stage]} · likes ${st.pref}<br>
 thirst ${st.needs.thirst.toFixed(2)} · full ${(st.full||0).toFixed(2)} · attention ${st.needs.attention.toFixed(2)}<br>
 light ${st.light.toFixed(2)} (${st.lightState}) · growth ${st.credit.toFixed(2)}<br>
 looks: gray ${st.dryLv||0}/4 · withered ${st.witherLv||0}/3 · burned ${st.burnLv||0}/3 · puddle ${st.puddleLv||0}/3<br>
 good↔evil ${st.ge.toFixed(2)} · lawful↔chaotic ${st.lc.toFixed(2)} · <b>${align()}</b><br>
 treats: ${SNACKS.map(t=>t.name.split(' ')[0]+' '+((st.treats||{})[t.id]||0)+'/'+TRAIT_AT).join(' · ')}<br>traits: ${(st.traits||[]).join(', ')||'none yet'}<br><br>
`;}
function buildDbgCtl(){const c=dbg.querySelector('#dCtl');c.innerHTML=` Species <select id="dSpc">${NAMES.map((n,i)=>`<option value="${i}" ${st.species==i?'selected':''}>${i+1} ${n}</option>`).join('')}</select><br>
 Stage <select id="dStg">${AGES.map(i=>`<option value="${i}" ${st.stage==i?'selected':''}>${['seed','sprout','','','kid','','teen','','adult'][i]}</option>`).join('')}</select><br>
 Speed <select id="dSp">${[1,5,20,60].map(v=>`<option ${st.speed==v?'selected':''}>${v}</option>`).join('')}</select>
 Time <select id="dMo">${['visit','ambient','actions'].map(v=>`<option ${st.mode==v?'selected':''}>${v}</option>`).join('')}</select><br>
 Eyes <select id="dEy">${EYE_NAMES.map((n,i)=>`<option value="${i}" ${st.eye==i?'selected':''}>${i+1} ${n}</option>`).join('')}</select>
 Disposition <select id="dAl"><option value="">(set…)</option>${['Lawful Good','Neutral Good','Chaotic Good','Lawful Neutral','True Neutral','Chaotic Neutral','Lawful Evil','Neutral Evil','Chaotic Evil'].map(n=>`<option>${n}</option>`).join('')}</select><br>
 Light <select id="dPf">${['sun','shade','night'].map(v=>`<option ${st.pref==v?'selected':''}>${v}</option>`).join('')}</select><br>
 <button id="dPots">All pots</button><button id="dDay">End day</button><button id="dCat">Cat trust +</button><button id="dAdd">Add adult</button><button id="dBreed">Breed now</button><button id="dWig">Wiggle now</button><button id="dLm">Light map: ${lightMap?'on':'off'}</button><button id="dRe">Reset</button>
 <div style="border-top:1px solid #6c61a4;margin-top:6px;padding-top:4px"><b>Nudge</b> (1 px at a time; uses the Species above)<br>
 <select id="nKind"><option value="plant">plant</option><option value="cat">cat</option></select>
 <span id="nPl">age <select id="nAge">${['seed','sprout','kid','teen','adult'].map(a=>`<option>${a}</option>`).join('')}</select> spot <select id="nSpot">${['sill','desk','crate','books','rug','chair'].map(a=>`<option>${a}</option>`).join('')}</select></span>
 <span id="nCt" style="display:none">pose <select id="nPose">${['curl','loaf','side','sit','pet','belly','walk'].map(a=>`<option>${a}</option>`).join('')}</select> spot <select id="nCSpot">${['bed','rug','chair','sill','crate','books','byplant','floor'].map(a=>`<option>${a}</option>`).join('')}</select></span>
 <button id="nShow">Show</button><br>
 <button data-n="-1,0">←</button><button data-n="1,0">→</button><button data-n="0,-1">↑</button><button data-n="0,1">↓</button><button data-n="0,0">reset</button> <span id="nVal">pick, then Show</span><br>
 <button id="nDone">Done</button><button id="nCopy">Copy table</button><textarea id="nOut" style="display:none;width:100%;height:60px;font-size:11px"></textarea></div>`;
 const on=(id,f)=>c.querySelector(id).onchange=e=>f(e.target.value);
 on('#dSpc',v=>{st.species=+v;});on('#dStg',v=>{st.stage=+v;st.started=true;});on('#dSp',v=>st.speed=+v);on('#dMo',v=>st.mode=v);on('#dPf',v=>st.pref=v);on('#dEy',v=>{st.eye=+v;save();});on('#dAl',v=>{if(!v)return;const[a,b]=v==='True Neutral'?['Neutral','Neutral']:v.split(' ');st.lc=a==='Lawful'?.6:a==='Chaotic'?-.6:0;st.ge=b==='Good'?.6:b==='Evil'?-.6:0;save();});
 c.querySelector('#dPots').onclick=()=>{st.pots=POTS.map(p=>p.id);st.potOn=POTS[(POTS.findIndex(p=>p.id===st.potOn)+1)%POTS.length].id;save();};
 c.querySelector('#dAdd').onclick=()=>{if(plantCount()>=3)return;const p=freshPlant();p.species=Math.floor(Math.random()*16);p.stage=8;addPlant(p);save();};
 c.querySelector('#dBreed').onclick=()=>{const A=allRaw().filter(q=>q.stage>=8);if(A.length>=2&&plantCount()<3)crossPollinate(A[0],A[1]);else say('Needs two adults and fewer than 3 plants.',3);};
 c.querySelector('#dCat').onclick=()=>{const t=catTrust();st.catTrust=t<TRUST_SHY?TRUST_SHY:t<TRUST_FOND?TRUST_FOND:t<TRUST_BFF?TRUST_BFF:0;save();};
 c.querySelector('#dDay').onclick=()=>{st.night=true;wake();};
 c.querySelector('#dWig').onclick=()=>{idleNext=1;}; // the next frame tries an idle wiggle (still skipped while you're touching something)
 c.querySelector('#dLm').onclick=e=>{lightMap=!lightMap;e.target.textContent='Light map: '+(lightMap?'on':'off');};
 buildNudge(c);
 c.querySelector('#dRe').onclick=()=>{try{localStorage.removeItem(KEY);}catch(e){}location.reload();};}

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
