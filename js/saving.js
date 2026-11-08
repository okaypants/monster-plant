'use strict';
/* Saving: the save (st), shared room keys (GLOBAL), swapping plants in and out, loading old saves. */
/* ---------- state ---------- */
const KEY='mp-proto-v2';
function fresh(){return {started:false,species:0,stage:-1,timer:0,day:1,dayT:0,night:false,curtain:'open',needs:{thirst:0,hunger:0,attention:0},light:0,lightBad:0,lightState:'ok',ge:0,lc:0,pref:['sun','shade','night'][Math.floor(Math.random()*3)],eye:Math.floor(Math.random()*16),parch:0,credit:0,met:{},over:0,overType:'',nap:0,listen:0,pets:[],hunch:0,hint:{thirst:0,hunger:0,attention:0,light:0},taught:{},speed:2,mode:'visit',hints:'auto',youUsed:-9};}
let st=fresh();
// MORE THAN ONE PLANT (Jackie, Nov 3): 'st' always holds the ACTIVE plant's fields + shared room state; the other plants wait in st.others.
// eachPlant() swaps each one in, so every existing plant function just works on whichever plant is swapped in.
const GLOBAL=new Set(['started','day','dayT','night','curtain','lamp','desk','speed','mode','hints','taught','hint','lastSeen','goldenSaid','catTrust','catGain','catDayN','others','pots','youUsed','nextId','breedDay','giftSeed','bloomT','leftHand','giftAskDay','bugNote','bugJournal','bugSend','catNaps','catSeen','catName','catBond']);
function freshPlant(){const f=fresh(),o={};for(const k in f)if(!GLOBAL.has(k))o[k]=f[k];o.id=(st.nextId=(st.nextId||1)+1);o.stage=0;giveNature(o);return o;}
function giveNature(o){const r=()=>{const v=rnd(.36,.6);return Math.random()<.5?v:-v;};o.nge=r();o.nlc=r();if(Math.random()<.25)(Math.random()<.5?o.nge=0:o.nlc=0);o.ge=o.nge;o.lc=o.nlc;} // most seeds lean two ways; some only one
function swapIn(i){const a={};for(const k of Object.keys(st))if(!GLOBAL.has(k)){a[k]=st[k];delete st[k];}Object.assign(st,st.others[i]);st.others[i]=a;}
function eachPlant(f){f(-1);const n=(st.others||[]).length;for(let i=0;i<n;i++){swapIn(i);try{f(i);}finally{swapIn(i);}}}
const MAX_PLANTS=2; // never more than two plants in the room at once (Jackie, Nov 4)
function plantCount(){return (st.started&&st.stage>=0?1:0)+(st.others||[]).length;}
function allRaw(){return [st].concat(st.others||[]);}
function otherPos(){return allRaw().filter(p=>p.id!==st.id&&p._pos).map(p=>p._pos);}
try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.started)st=Object.assign(fresh(),s);}catch(e){}
st.stage={2:1,3:1,5:6,7:8}[st.stage]??st.stage;for(const q of [st].concat(st.others||[]))if(q.credit){if(GROW_FOR[q.stage])q.timer=Math.max(q.timer||0,Math.max(.5,q.credit)*GROW_FOR[q.stage]);delete q.credit;} // old saves: a night of credit becomes at least half the age grown
if(st.id==null)st.id=1;if(st.nge==null&&st.started){st.nge=Math.abs(st.ge)>.15?st.ge*.8:(Math.random()<.5?.4:-.4);st.nlc=Math.abs(st.lc)>.15?st.lc*.8:(Math.random()<.5?.4:-.4);}st.others=(st.others||[]).map(o=>{const f=fresh(),q={};for(const k in f)if(!GLOBAL.has(k))q[k]=f[k];Object.assign(q,o);if(q.nge==null){q.nge=Math.abs(q.ge)>.15?q.ge*.8:.4*(Math.random()<.5?1:-1);q.nlc=Math.abs(q.lc)>.15?q.lc*.8:.4*(Math.random()<.5?1:-1);}return q;});if(st.speed===1)st.speed=2; // old saves -> the five ages
// TEST MODE (debug): while the debug drawer is open the game plays a copy; saves go to TEST_KEY and the real save (KEY) is never touched.
let TESTING=false;const TEST_KEY='mp-test';
function save(){st.lastSeen=Date.now();try{localStorage.setItem(TESTING?TEST_KEY:KEY,JSON.stringify(st));}catch(e){}}
function withPlant(id,f){if(st.id===id)return f();const i=(st.others||[]).findIndex(q=>q.id===id);if(i<0)return;swapIn(i);try{f();}finally{swapIn(i);}}
const LOADED_LAST_SEEN=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}').lastSeen||0;}catch(e){return 0;}})();
