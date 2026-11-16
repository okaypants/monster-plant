'use strict';
/* KEEP IT SAFE (Jackie, Nov 16): four ways the game guards your progress, which lives only in this phone's browser.
   1. It asks the browser to keep the game's storage (navigator.storage.persist), so it isn't cleared to free up space.
   2. Copies on the phone: every 10 minutes of play, and before Start over or loading a backup, a copy of the save goes into a
      second store (IndexedDB 'mp-keep'); only the last 3 are kept, each new one replacing the oldest. The start screen offers the newest one back if the save itself is gone.
   3. A backup file: the journal's Keep it safe page saves everything (the game, the radio's presets, the sampler's work and
      songs) as one small file to keep in Files, iCloud or an email, and loads one back, on this phone or a new one. The file always has
      the same name, so a new backup saved in the same place replaces the last one.
   4. How to put the game on the Home Screen, for this device (iPhone and iPad, Android, a computer's browser), as one small
      line on the loading screen and the start screen (Jackie: "a little reminder during a load screen", smooth on every
      device; nothing pops up during play). Where the browser can do it in one tap (Chrome and Edge), a button does it.
      Safari clears a site's storage after 7 days of Safari use without a visit, but not for a game played from its icon.
      Not shown when the game is already playing from its icon. The Keep it safe page says it too.
   Never during the debug drawer's test mode (the copy being played there isn't the real save). */
const KS_EVERY=10*60*1000,KS_KEEP=3,KS_STORES=['work','songs','songpcm','beats','pads'];

// 1. ask the browser to keep it (quietly; some browsers only say yes for a game on the Home Screen)
function ksPersist(){try{const s=navigator.storage;if(s&&s.persist)s.persisted().then(p=>p||s.persist()).catch(()=>{})}catch(e){}}
ksPersist();

// 2. copies on the phone
let ksP=null;
function ksDB(){return ksP||(ksP=new Promise((ok,no)=>{let r;try{r=indexedDB.open('mp-keep',1)}catch(e){ksP=null;return no(e)}
  r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('copies'))d.createObjectStore('copies',{keyPath:'t'})};
  r.onsuccess=()=>ok(r.result);r.onerror=r.onblocked=()=>{ksP=null;no(r.error)}}))}
function ksTx(mode,fn){return ksDB().then(db=>new Promise((ok,no)=>{const tx=db.transaction(['copies'],mode);let out;fn(tx.objectStore('copies'),v=>out=v);
  tx.oncomplete=()=>ok(out);tx.onerror=tx.onabort=()=>no(tx.error)}))}
function ksCopies(){return ksTx('readonly',(s,put)=>{const r=s.getAll();r.onsuccess=()=>put((r.result||[]).sort((a,b)=>b.t-a.t))}).catch(()=>[])}
function ksCopy(why){if(TESTING)return Promise.resolve();let json=null,s=null;try{json=localStorage.getItem(KEY);s=JSON.parse(json)}catch(e){}
  if(!s||!s.started)return Promise.resolve();
  return ksTx('readwrite',st0=>{st0.put({t:Date.now(),day:s.day||1,why,json});const r=st0.getAllKeys();r.onsuccess=()=>{const k=(r.result||[]).sort((a,b)=>a-b);for(const old of k.slice(0,Math.max(0,k.length-KS_KEEP)))st0.delete(old)}}).catch(()=>{})}
let ksLast=Date.now()-KS_EVERY+60000; // the first copy a minute into play, then every 10 minutes
function ksMaybeCopy(){const now=Date.now();if(now-ksLast<KS_EVERY)return;ksLast=now;ksCopy('auto')}

// 3. the backup file: typed arrays (the sampler's sounds) travel as base64
function ksB64(u8){let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)}
function ksU8(b64){const s=atob(b64),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u}
const ksOut=(k,v)=>ArrayBuffer.isView(v)?{__ta:v.constructor.name,b64:ksB64(new Uint8Array(v.buffer,v.byteOffset,v.byteLength))}:v;
const ksIn=(k,v)=>v&&v.__ta&&typeof window[v.__ta]==='function'?new window[v.__ta](ksU8(v.b64).buffer):v;
function ksDump(n){return cratesTx([n],'readonly',(tx,put)=>{const out=[],c=tx.objectStore(n).openCursor();c.onsuccess=()=>{const q=c.result;if(q){out.push([q.primaryKey,q.value]);q.continue()}else put(out)}})}
async function ksBundle(){if(!TESTING)save();const b={app:'monster-plant',v:1,made:Date.now(),day:st.day,game:localStorage.getItem(KEY),radio:localStorage.getItem('mp-radio'),crates:{}};
  for(const n of KS_STORES){try{b.crates[n]=await ksDump(n)}catch(e){}}
  return JSON.stringify(b,ksOut)}
// one name, always (Jackie: backups should replace each other, not pile up): saving it to the same place again replaces the old one;
// the date it was made is inside the file, and loading it says which day it is
function ksName(){return 'monster-plant-backup.json'}
async function ksSaveFile(){
  let text;try{text=await ksBundle()}catch(e){tell('The backup could not be made.',{kind:'info'});return}
  const name=ksName(),file=new File([text],name,{type:'application/json'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'Monster Plant backup'});ksSaid();return}catch(e){if(e.name==='AbortError')return}}
  const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);ksSaid()}
function ksSaid(){tell('Backup made. Keep the file somewhere safe, like Files, iCloud or an email to yourself.',{kind:'info',key:'ksMade'})}
// read a backup file, check it, ask, then put everything back and start again from it
function ksPickFile(then){const i=document.createElement('input');i.type='file';i.accept='.json,application/json';i.style.display='none';
  i.onchange=()=>{const f=i.files&&i.files[0];i.remove();if(!f)return;const r=new FileReader();r.onload=()=>then(String(r.result||''));r.readAsText(f)};document.body.appendChild(i);i.click()}
function ksParse(text){try{const b=JSON.parse(text,ksIn);if(b&&b.app==='monster-plant'&&typeof b.game==='string'&&JSON.parse(b.game).started)return b}catch(e){}return null}
function ksLoadFile(){ksPickFile(text=>{const b=ksParse(text);
  if(!b){tell('That file isn\'t a Monster Plant backup.',{kind:'info',key:'ksBad'});return}
  const when=new Date(b.made||Date.now()).toLocaleDateString(undefined,{month:'long',day:'numeric'});
  ksAsk('Load the backup from '+when+' (day '+(b.day||1)+')? It replaces the room you have now. The room you have now is kept as a copy on this phone first.',()=>ksRestore(b))})}
async function ksRestore(b){await ksCopy('before loading a backup');
  try{localStorage.setItem(KEY,b.game);if(b.radio)localStorage.setItem('mp-radio',b.radio)}catch(e){tell('The backup could not be loaded.',{kind:'info'});return}
  for(const n of KS_STORES){const rows=b.crates&&b.crates[n];if(!Array.isArray(rows))continue;
    try{await cratesTx([n],'readwrite',tx=>{const s=tx.objectStore(n);s.clear();for(const [k,v] of rows){if(s.keyPath)s.put(v);else s.put(v,k)}})}catch(e){}}
  location.reload()}
function ksAsk(text,yes){const d=screen('<h1>Load a backup?</h1><p>'+text+'</p><div class="opts"><button data-k="y">Load it</button><button data-k="n">Not now</button></div>',{y:d=>{d.remove();yes()},n:d=>d.remove()})}

// 4. the Home Screen how-to, for this device
const IPAD=/iPad/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1),ANDROID=/Android/.test(navigator.userAgent);
let ksInstall=null; // Chrome and Edge offer to install the game; kept, so our own button can ask at a good moment instead of a pop-up
addEventListener('beforeinstallprompt',e=>{e.preventDefault();ksInstall=e;ksHintShow()});
addEventListener('appinstalled',()=>{ksInstall=null;document.querySelectorAll('.kshint').forEach(h=>h.remove())});
function ksHowTo(){if(HOMESCREEN)return '';const ua=navigator.userAgent;
  if(IPHONE||IPAD)return 'Keep your room safe: tap Share, then Add to Home Screen, and play from that icon.';
  if(ANDROID)return ksInstall?'Keep your room safe: add the game to your Home screen and play from that icon.':'Keep your room safe: tap ⋮, then Add to Home screen, and play from that icon.';
  if(ksInstall)return 'Keep your room safe: install the game and play it from its own window.';
  if(/Edg\//.test(ua)||/Chrome\//.test(ua))return 'Keep your room safe: install the game with the install button in the address bar.';
  if(/Safari\//.test(ua)&&/Macintosh/.test(ua))return 'Keep your room safe: in Safari, choose File, then Add to Dock.';
  return '';}
// the little line (and, where the browser can, a button that does it); put into a loading or start screen's card
function ksHint(card){if(!card)return;const old=card.querySelector('.kshint');if(old)old.remove();const t=ksHowTo();if(!t)return;
  const h=document.createElement('div');h.className='kshint';h.appendChild(document.createTextNode(t));
  if(ksInstall){const b=document.createElement('button');b.type='button';b.className='tsb kshbtn';b.textContent=ANDROID?'Add to Home screen':'Install';
    b.addEventListener('click',async e=>{e.stopPropagation();const p=ksInstall;if(!p)return;ksInstall=null;try{await p.prompt();await p.userChoice}catch(x){}ksHintShow()});h.appendChild(b)}
  card.appendChild(h)}
function ksHintShow(){for(const c of document.querySelectorAll('#loading .tsscreen,.screen:not(.journal) .tsscreen.ksstart'))ksHint(c);if(jEl&&jPage==='safe')renderJournal()}
ksHint(document.querySelector('#loading .tsscreen'));
function ksStart(el){const c=el&&el.firstChild;if(!c)return;c.classList.add('ksstart');ksHint(c)} // the start screen's card

// the journal's Keep it safe page
function keepPages(L,R){
  L.appendChild(jdiv('jname',[],'Keep it safe'));
  L.appendChild(jdiv('ksnote',[],'Your room lives only on this phone. Now and then, save a backup and keep the file somewhere safe: Files, iCloud, or an email to yourself. If anything is ever lost, or on a new phone, load it back.'));
  const c=jdiv('kschoices');c.innerHTML=tsChoices([['save','Save a backup','A small file','yes','check'],['load','Load a backup','From a file','wait','hourglass']]);
  c.querySelector('[data-k=save]').addEventListener('click',e=>{e.stopPropagation();sfx('tick');ksSaveFile()});
  c.querySelector('[data-k=load]').addEventListener('click',e=>{e.stopPropagation();sfx('tick');ksLoadFile()});L.appendChild(c);
  R.appendChild(jdiv('jlab',[],'Copies on this phone'));
  const list=jdiv('kslist',[],'…');R.appendChild(list);
  ksCopies().then(cs=>{list.textContent='';if(!cs.length){list.textContent='The first one is made a few minutes into play.';return}
    list.textContent='The game keeps its last '+KS_KEEP+' saves here by itself, in case one goes wrong. Newest: day '+cs[0].day+', '+new Date(cs[0].t).toLocaleString(undefined,{weekday:'long',hour:'numeric',minute:'2-digit'})+'.'});
  const how=jdiv('kstip');ksHint(how);if(how.firstChild)R.appendChild(how);}

// the start screen, when there's no save: bring back the newest copy on this phone, if there is one
function ksOffer(el){ksCopies().then(cs=>{const c=cs.find(x=>{try{return JSON.parse(x.json).started}catch(e){return false}});if(!c||!el.isConnected)return;
  const o=el.querySelector('.opts');if(!o||o.querySelector('[data-k=ksback]'))return;const b=document.createElement('button');b.type='button';b.className='tsb';b.dataset.k='ksback';
  b.textContent='Bring back day '+c.day;b.addEventListener('click',()=>{try{localStorage.setItem(KEY,c.json)}catch(e){return}location.reload()});o.appendChild(b)})}
