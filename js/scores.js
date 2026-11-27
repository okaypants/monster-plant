'use strict';
/* YOUR SOUNDTRACKS (Jackie, Nov 27: the Kalimbasizer "has the option to track old public domain silents and shorts", "and maybe it has
   the option to upload somewhere accessible that could be saved for the movie room"). A recording made on the Kalimbasizer while a
   film plays is kept on this device, under that film, and the movie room can play it with the film. Nothing leaves the device.
   Kept in the browser's own database (IndexedDB), which holds sound files; used by kalimba.html and js/movieroom.js. */
const SCORES_DB='mp-scores',SCORES_STORE='s';
function scoresOpen(){return new Promise((res,rej)=>{let r;try{r=indexedDB.open(SCORES_DB,1);}catch(e){rej(e);return;}r.onupgradeneeded=()=>{r.result.createObjectStore(SCORES_STORE);};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
function scoresDo(mode,fn){return scoresOpen().then(db=>new Promise((res,rej)=>{const tx=db.transaction(SCORES_STORE,mode),q=fn(tx.objectStore(SCORES_STORE));tx.oncomplete=()=>{db.close();res(q&&q.result);};tx.onerror=tx.onabort=()=>{db.close();rej(tx.error);};}));}
const scoreKey=f=>f.id+(f.f?'/'+f.f:''); // one soundtrack a film
function scorePut(f,take){return scoresDo('readwrite',s=>s.put({blob:take.blob,mime:take.mime,dur:take.dur,created:take.created||Date.now(),meta:take.meta||'',film:f.t},scoreKey(f)));}
function scoreGet(f){return scoresDo('readonly',s=>s.get(scoreKey(f))).catch(()=>null);}
function scoreDrop(f){return scoresDo('readwrite',s=>s.delete(scoreKey(f)));}
function scoreKeys(){return scoresDo('readonly',s=>s.getAllKeys()).catch(()=>[]);}
