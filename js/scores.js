'use strict';
/* YOUR SOUNDTRACKS (Jackie, Nov 27: the Kalimbasizer "has the option to track old public domain silents and shorts", "and maybe it has
   the option to upload somewhere accessible that could be saved for the movie room"). A recording made on the Kalimbasizer while a
   film plays is kept on this device, under that film, and the movie room can play it with the film. Nothing leaves the device.
   Kept in the browser's own database (IndexedDB), which holds sound files; used by kalimba.html and js/movieroom.js. */
const SCORES_DB='mp-scores',SCORES_STORE='s';
function scoresOpen(){return new Promise((res,rej)=>{let r;try{r=indexedDB.open(SCORES_DB,1);}catch(e){rej(e);return;}r.onupgradeneeded=()=>{r.result.createObjectStore(SCORES_STORE);};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
function scoresDo(mode,fn){return scoresOpen().then(db=>new Promise((res,rej)=>{const tx=db.transaction(SCORES_STORE,mode),q=fn(tx.objectStore(SCORES_STORE));tx.oncomplete=()=>{db.close();res(q&&q.result);};tx.onerror=tx.onabort=()=>{db.close();rej(tx.error);};}));}
const scoreKey=f=>f.id+(f.f?'/'+f.f:''); // one soundtrack a film
function scorePut(f,take){return scoresDo('readwrite',s=>s.put({blob:take.blob,mime:take.mime,dur:take.dur,created:take.created||Date.now(),meta:take.meta||'',film:f.t,title:take.title||'',card:take.card||0},scoreKey(f)));}
/* SO IT NEVER FILLS A PHONE (Jackie, Nov 27: "how do we make sure this doesn't kill anyones phone cumulatively overtime"). A
   soundtrack is recorded small (about a quarter of a megabyte a minute), there is one a film, and all of them together may take
   no more than SCORES_MAX; past that, one has to be removed before another is kept. scoreList gives each one's size so the
   movie room can show it. The films themselves are never stored: they stream. */
const SCORES_MAX=40*1048576;
function scoreList(){return Promise.all([scoresDo('readonly',s=>s.getAllKeys()),scoresDo('readonly',s=>s.getAll())]).then(([K,V])=>K.map((k,i)=>({key:k,title:V[i].title||'',film:V[i].film||'',dur:V[i].dur||0,size:(V[i].blob&&V[i].blob.size)||0,created:V[i].created||0,card:V[i].card||0})).sort((a,b)=>b.created-a.created)).catch(()=>[]);}
function scoreDropKey(k){return scoresDo('readwrite',s=>s.delete(k));}
function scoreRoom(f,size){return scoreList().then(L=>L.filter(q=>q.key!==scoreKey(f)).reduce((n,q)=>n+q.size,0)+size<=SCORES_MAX);} // is there room for this one, replacing the film's old one?
const scoreSize=n=>n<1048576?Math.max(1,Math.round(n/1024))+' KB':(n/1048576).toFixed(1)+' MB';
function scoreGet(f){return scoresDo('readonly',s=>s.get(scoreKey(f))).catch(()=>null);}
function scoreDrop(f){return scoresDo('readwrite',s=>s.delete(scoreKey(f)));}
function scoreKeys(){return scoresDo('readonly',s=>s.getAllKeys()).catch(()=>[]);}
