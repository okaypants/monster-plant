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
 good↔evil ${st.ge.toFixed(2)} · lawful↔chaotic ${st.lc.toFixed(2)} · <b>${align()}</b><br>
 treats: ${SNACKS.map(t=>t.name.split(' ')[0]+' '+((st.treats||{})[t.id]||0)+'/'+TRAIT_AT).join(' · ')}<br>traits: ${(st.traits||[]).join(', ')||'none yet'}<br><br>
`;}
function buildDbgCtl(){const c=dbg.querySelector('#dCtl');c.innerHTML=` Species <select id="dSpc">${NAMES.map((n,i)=>`<option value="${i}" ${st.species==i?'selected':''}>${i+1} ${n}</option>`).join('')}</select><br>
 Stage <select id="dStg">${AGES.map(i=>`<option value="${i}" ${st.stage==i?'selected':''}>${['seed','sprout','','','kid','','teen','','adult'][i]}</option>`).join('')}</select><br>
 Speed <select id="dSp">${[1,5,20,60].map(v=>`<option ${st.speed==v?'selected':''}>${v}</option>`).join('')}</select>
 Time <select id="dMo">${['visit','ambient','actions'].map(v=>`<option ${st.mode==v?'selected':''}>${v}</option>`).join('')}</select><br>
 Hints <select id="dHi">${['auto','always','off'].map(v=>`<option ${st.hints==v?'selected':''}>${v}</option>`).join('')}</select>
 Eyes <select id="dEy">${EYE_NAMES.map((n,i)=>`<option value="${i}" ${st.eye==i?'selected':''}>${i+1} ${n}</option>`).join('')}</select>
 Disposition <select id="dAl"><option value="">(set…)</option>${['Lawful Good','Neutral Good','Chaotic Good','Lawful Neutral','True Neutral','Chaotic Neutral','Lawful Evil','Neutral Evil','Chaotic Evil'].map(n=>`<option>${n}</option>`).join('')}</select><br>
 Light <select id="dPf">${['sun','shade','night'].map(v=>`<option ${st.pref==v?'selected':''}>${v}</option>`).join('')}</select><br>
 <button id="dPots">All pots</button><button id="dDay">End day</button><button id="dCat">Cat trust +</button><button id="dAdd">Add adult</button><button id="dBreed">Breed now</button><button id="dRe">Reset</button>`;
 const on=(id,f)=>c.querySelector(id).onchange=e=>f(e.target.value);
 on('#dSpc',v=>{st.species=+v;});on('#dStg',v=>{st.stage=+v;st.started=true;});on('#dSp',v=>st.speed=+v);on('#dMo',v=>st.mode=v);on('#dHi',v=>st.hints=v);on('#dPf',v=>st.pref=v);on('#dEy',v=>{st.eye=+v;save();});on('#dAl',v=>{if(!v)return;const[a,b]=v==='True Neutral'?['Neutral','Neutral']:v.split(' ');st.lc=a==='Lawful'?.6:a==='Chaotic'?-.6:0;st.ge=b==='Good'?.6:b==='Evil'?-.6:0;save();});
 c.querySelector('#dPots').onclick=()=>{st.pots=POTS.map(p=>p.id);st.potOn=POTS[(POTS.findIndex(p=>p.id===st.potOn)+1)%POTS.length].id;save();};
 c.querySelector('#dAdd').onclick=()=>{if(plantCount()>=3)return;const p=freshPlant();p.species=Math.floor(Math.random()*16);p.stage=8;addPlant(p);save();};
 c.querySelector('#dBreed').onclick=()=>{const A=allRaw().filter(q=>q.stage>=8);if(A.length>=2&&plantCount()<3)crossPollinate(A[0],A[1]);else say('Needs two adults and fewer than 3 plants.',3);};
 c.querySelector('#dCat').onclick=()=>{const t=catTrust();st.catTrust=t<TRUST_SHY?TRUST_SHY:t<TRUST_FOND?TRUST_FOND:t<TRUST_BFF?TRUST_BFF:0;save();};
 c.querySelector('#dDay').onclick=()=>{st.night=true;wake();};
 c.querySelector('#dRe').onclick=()=>{try{localStorage.removeItem(KEY);}catch(e){}location.reload();};}
