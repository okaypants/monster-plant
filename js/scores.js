'use strict';
/* YOUR SOUNDTRACKS (Jackie, Nov 27: the Kalimbasizer "has the option to track old public domain silents and shorts", "and maybe it has
   the option to upload somewhere accessible that could be saved for the movie room"). A recording made on the Kalimbasizer while a
   film plays is kept on this device, under that film, and the movie room can play it with the film. Nothing leaves the device.
   Kept in the browser's own database (IndexedDB), which holds sound files; used by kalimba.html and js/movieroom.js. */
const SCORES_DB='mp-scores',SCORES_STORE='s';
function scoresOpen(){return new Promise((res,rej)=>{let r;try{r=indexedDB.open(SCORES_DB,1);}catch(e){rej(e);return;}r.onupgradeneeded=()=>{r.result.createObjectStore(SCORES_STORE);};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
function scoresDo(mode,fn){return scoresOpen().then(db=>new Promise((res,rej)=>{const tx=db.transaction(SCORES_STORE,mode),q=fn(tx.objectStore(SCORES_STORE));tx.oncomplete=()=>{db.close();res(q&&q.result);};tx.onerror=tx.onabort=()=>{db.close();rej(tx.error);};}));}
const scoreKey=f=>f.id+(f.f?'/'+f.f:''); // one soundtrack a film
function scorePut(f,take){return scoresDo('readwrite',s=>s.put({blob:take.blob,mime:take.mime,dur:take.dur,created:take.created||Date.now(),meta:take.meta||'',film:f.t,title:take.title||'',by:take.by||'',card:take.card||0},scoreKey(f)));}
/* SO IT NEVER FILLS A PHONE (Jackie, Nov 27: "how do we make sure this doesn't kill anyones phone cumulatively overtime"). A
   soundtrack is recorded small (about a quarter of a megabyte a minute), there is one a film, and all of them together may take
   no more than SCORES_MAX; past that, one has to be removed before another is kept. scoreList gives each one's size so the
   movie room can show it. The films themselves are never stored: they stream. */
const SCORES_MAX=40*1048576;
function scoreList(){return Promise.all([scoresDo('readonly',s=>s.getAllKeys()),scoresDo('readonly',s=>s.getAll())]).then(([K,V])=>K.map((k,i)=>({key:k,title:V[i].title||'',by:V[i].by||'',film:V[i].film||'',dur:V[i].dur||0,size:(V[i].blob&&V[i].blob.size)||0,created:V[i].created||0,card:V[i].card||0,from:V[i].from||0})).sort((a,b)=>b.created-a.created)).catch(()=>[]);}
function scoreDropKey(k){return scoresDo('readwrite',s=>s.delete(k));}
function scoreGetKey(k){return scoresDo('readonly',s=>s.get(k)).catch(()=>null);}
/* PASSING ONE ON (Jackie, Nov 27: "we need to be able to share them via whatever with other people and then for them to be able to
   like load it into their own things so that they can like watch the movie with other people's scores"). A soundtrack goes out as
   one small file: the letters MPS1, the length of a short description (which film, the title, who scored it, the card colour, how
   long), the description, then the sound. Someone else adds the file in their movie room and it is kept beside their own, under
   the film's key with '#' and a few letters after it, so it never replaces theirs. Nothing is sent anywhere by the game itself. */
const scoreFilmKey=k=>String(k).split('#')[0];
function scoreFile(k){return scoreGetKey(k).then(r=>{if(!r)return null;const head=new TextEncoder().encode(JSON.stringify({v:1,key:scoreFilmKey(k),film:r.film||'',title:r.title||'',by:r.by||'',card:r.card||0,dur:r.dur||0,mime:r.mime||''})),n=new Uint8Array(4);new DataView(n.buffer).setUint32(0,head.length);
 const name=((r.title||r.film||'soundtrack')+(r.by?' by '+r.by:'')).replace(/[^\w \-]+/g,'').trim().slice(0,60)||'soundtrack';return new File([new TextEncoder().encode('MPS1'),n,head,r.blob],name+'.mpscore',{type:'application/octet-stream'});});}
function scoreFromFile(file){return file.arrayBuffer().then(buf=>{const u=new Uint8Array(buf);if(u.length<12||String.fromCharCode(u[0],u[1],u[2],u[3])!=='MPS1')throw new Error('not a soundtrack');const n=new DataView(buf).getUint32(4);if(n>4000||8+n>=u.length)throw new Error('not a soundtrack');
 const h=JSON.parse(new TextDecoder().decode(u.subarray(8,8+n)));if(!h||typeof h.key!=='string'||!/^audio\//.test(h.mime||''))throw new Error('not a soundtrack');
 return {key:h.key,film:String(h.film||'').slice(0,80),title:String(h.title||'').slice(0,40),by:String(h.by||'').slice(0,30),card:Math.max(0,Math.min(3,h.card|0)),dur:+h.dur||0,mime:h.mime,blob:new Blob([u.subarray(8+n)],{type:h.mime})};});}
function scoreAdd(rec){return scoreList().then(L=>{if(L.reduce((n,q)=>n+q.size,0)+rec.blob.size>SCORES_MAX)throw new Error('full');const k=rec.key+'#'+Math.random().toString(36).slice(2,8);
 return scoresDo('readwrite',s=>s.put({blob:rec.blob,mime:rec.mime,dur:rec.dur,created:Date.now(),meta:'',film:rec.film,title:rec.title,by:rec.by,card:rec.card,from:1},k)).then(()=>k);});}
function scoreRoom(f,size){return scoreList().then(L=>L.filter(q=>q.key!==scoreKey(f))/* your own one for a film replaces your last; other people's stay */.reduce((n,q)=>n+q.size,0)+size<=SCORES_MAX);} // is there room for this one, replacing the film's old one?
const scoreSize=n=>n<1048576?Math.max(1,Math.round(n/1024))+' KB':(n/1048576).toFixed(1)+' MB';
function scoreGet(f){return scoresDo('readonly',s=>s.get(scoreKey(f))).catch(()=>null);}
function scoreDrop(f){return scoresDo('readwrite',s=>s.delete(scoreKey(f)));}
function scoreKeys(){return scoresDo('readonly',s=>s.getAllKeys()).catch(()=>[]);}
