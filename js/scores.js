'use strict';
/* YOUR SOUNDTRACKS (Jackie, Nov 27: the Kalimbasizer "has the option to track old public domain silents and shorts", "and maybe it has
   the option to upload somewhere accessible that could be saved for the movie room"). A recording made on the Kalimbasizer while a
   film plays is kept on this device, under that film, and the movie room can play it with the film. Nothing leaves the device.
   Kept in the browser's own database (IndexedDB), which holds sound files; used by kalimba.html and js/movieroom.js. */
const SCORES_DB='mp-scores',SCORES_STORE='s';
function scoresOpen(){return new Promise((res,rej)=>{let r;try{r=indexedDB.open(SCORES_DB,1);}catch(e){rej(e);return;}r.onupgradeneeded=()=>{r.result.createObjectStore(SCORES_STORE);};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
function scoresDo(mode,fn){return scoresOpen().then(db=>new Promise((res,rej)=>{const tx=db.transaction(SCORES_STORE,mode),q=fn(tx.objectStore(SCORES_STORE));tx.oncomplete=()=>{db.close();res(q&&q.result);};tx.onerror=tx.onabort=()=>{db.close();rej(tx.error);};}));}
const scoreKey=f=>f.id+(f.f?'/'+f.f:''); // one soundtrack a film
/* A SOUNDTRACK IS MADE OF PARTS (Jackie, Nov 27: "you should be able to record in parts and record the parts easily that will
   assemble into a single recording you can save into a finished movie"; "or multi track lol"). Each part is a short recording with
   the moment of the film it starts at. Together they are one soundtrack: one entry in Your films, one file to share. Where parts
   cover the same moment they are all heard, one over the other, so a second pass adds to the first. A soundtrack kept before parts
   existed is one part from the film's start.
   (The parts are kept side by side, not melted into one sound file: a phone has no quick way to do that, and played in step with
   the film they sound the same.) */
function scoreParts(r){if(!r)return [];if(r.parts&&r.parts.length)return r.parts;return r.blob?[{t:0,dur:r.dur||0,blob:r.blob,mime:r.mime||r.blob.type||''}]:[];}
const scoreBytes=r=>scoreParts(r).reduce((n,p)=>n+((p.blob&&p.blob.size)||0),0),scoreEnd=r=>scoreParts(r).reduce((n,p)=>Math.max(n,p.t+p.dur),0);
function scoreCover(P){const S=P.map(p=>[p.t,p.t+p.dur]).sort((a,b)=>a[0]-b[0]);let n=0,e=-1;for(const[a,b]of S){if(b<=e)continue;n+=b-Math.max(a,e);e=b;}return n;} // seconds of film with sound, counting overlaps once
function scorePut(f,take){const parts=scoreParts(take).map(p=>({t:p.t,dur:p.dur,blob:p.blob,mime:p.mime}));return scoresDo('readwrite',s=>s.put({parts,dur:scoreEnd({parts}),created:take.created||Date.now(),meta:take.meta||'',film:f.t,title:'',by:take.by||'',card:take.card||0},scoreKey(f)));}
/* Plays every part that belongs to the film's current moment. sync(t, playing) is called often while a film runs. */
function scorePlayer(rec){const P=scoreParts(rec).map(p=>({t:p.t,dur:p.dur,a:new Audio(URL.createObjectURL(p.blob))}));
 return {n:P.length,sync(t,playing){for(const p of P){const on=playing&&t>=p.t&&t<p.t+p.dur;if(!on){if(!p.a.paused)try{p.a.pause();}catch(e){}continue;}const want=t-p.t;if(Math.abs(p.a.currentTime-want)>.35)try{p.a.currentTime=want;}catch(e){}if(p.a.paused){const q=p.a.play();if(q&&q.catch)q.catch(()=>{});}}},
  stop(){for(const p of P)try{p.a.pause();}catch(e){}},free(){this.stop();for(const p of P)URL.revokeObjectURL(p.a.src);}};}
/* SO IT NEVER FILLS A PHONE (Jackie, Nov 27: "how do we make sure this doesn't kill anyones phone cumulatively overtime"). A
   soundtrack is recorded small (about a quarter of a megabyte a minute), there is one a film, and all of them together may take
   no more than SCORES_MAX; past that, one has to be removed before another is kept. scoreList gives each one's size so the
   movie room can show it. The films themselves are never stored: they stream. */
const SCORES_MAX=40*1048576;
function scoreList(){return Promise.all([scoresDo('readonly',s=>s.getAllKeys()),scoresDo('readonly',s=>s.getAll())]).then(([K,V])=>K.map((k,i)=>({key:k,title:V[i].title||'',by:V[i].by||'',film:V[i].film||'',dur:scoreEnd(V[i])||V[i].dur||0,size:scoreBytes(V[i]),parts:scoreParts(V[i]).length,created:V[i].created||0,card:V[i].card||0,from:V[i].from||0})).sort((a,b)=>b.created-a.created)).catch(()=>[]);}
function scoreDropKey(k){return scoresDo('readwrite',s=>s.delete(k));}
function scoreGetKey(k){return scoresDo('readonly',s=>s.get(k)).catch(()=>null);}
/* PASSING ONE ON (Jackie, Nov 27: "we need to be able to share them via whatever with other people and then for them to be able to
   like load it into their own things so that they can like watch the movie with other people's scores"). A soundtrack goes out as
   one small file: the letters MPS1, the length of a short description (which film, who scored it, the card colour, and where each
   part starts and how big it is), the description, then the parts' sound one after another. Someone else adds the file in their movie room and it is kept beside their own, under
   the film's key with '#' and a few letters after it, so it never replaces theirs. Nothing is sent anywhere by the game itself. */
const scoreFilmKey=k=>String(k).split('#')[0];
function scoreFile(k){return scoreGetKey(k).then(r=>{if(!r)return null;const P=scoreParts(r),head=new TextEncoder().encode(JSON.stringify({v:2,key:scoreFilmKey(k),film:r.film||'',by:r.by||'',card:r.card||0,parts:P.map(p=>({t:+p.t.toFixed(2),dur:+p.dur.toFixed(2),size:p.blob.size,mime:p.mime||p.blob.type||''}))})),n=new Uint8Array(4);new DataView(n.buffer).setUint32(0,head.length);
 const name=((r.film||'soundtrack')+(r.by?' scored by '+r.by:'')).replace(/[^\w \-]+/g,'').trim().slice(0,60)||'soundtrack';return new File([new TextEncoder().encode('MPS1'),n,head].concat(P.map(p=>p.blob)),name+'.mpscore',{type:'application/octet-stream'});});}
function scoreFromFile(file){return file.arrayBuffer().then(buf=>{const u=new Uint8Array(buf),bad=()=>{throw new Error('not a soundtrack');};if(u.length<12||String.fromCharCode(u[0],u[1],u[2],u[3])!=='MPS1')bad();const n=new DataView(buf).getUint32(4);if(n>20000||8+n>=u.length)bad();
 const h=JSON.parse(new TextDecoder().decode(u.subarray(8,8+n)));if(!h||typeof h.key!=='string')bad();
 const L=Array.isArray(h.parts)?h.parts:[{t:0,dur:+h.dur||0,size:u.length-8-n,mime:h.mime}],parts=[];let o=8+n; /* a file from before parts is one part from the start */
 if(!L.length||L.length>200)bad();for(const q of L){const size=q.size|0;if(size<=0||o+size>u.length||!/^audio\//.test(q.mime||''))bad();parts.push({t:Math.max(0,+q.t||0),dur:Math.max(0,+q.dur||0),mime:q.mime,blob:new Blob([u.subarray(o,o+size)],{type:q.mime})});o+=size;}
 return {key:h.key,film:String(h.film||'').slice(0,80),by:String(h.by||'').slice(0,30),card:Math.max(0,Math.min(3,h.card|0)),parts};});}
function scoreAdd(rec){return scoreList().then(L=>{if(L.reduce((n,q)=>n+q.size,0)+scoreBytes(rec)>SCORES_MAX)throw new Error('full');const k=rec.key+'#'+Math.random().toString(36).slice(2,8);
 return scoresDo('readwrite',s=>s.put({parts:rec.parts,dur:scoreEnd(rec),created:Date.now(),meta:'',film:rec.film,title:'',by:rec.by,card:rec.card,from:1},k)).then(()=>k);});}
function scoreRoom(f,size){return scoreList().then(L=>L.filter(q=>q.key!==scoreKey(f))/* your own one for a film replaces your last; other people's stay */.reduce((n,q)=>n+q.size,0)+size<=SCORES_MAX);} // is there room for this one, replacing the film's old one?
const scoreSize=n=>n<1048576?Math.max(1,Math.round(n/1024))+' KB':(n/1048576).toFixed(1)+' MB';
function scoreGet(f){return scoresDo('readonly',s=>s.get(scoreKey(f))).catch(()=>null);}
function scoreDrop(f){return scoresDo('readwrite',s=>s.delete(scoreKey(f)));}
function scoreKeys(){return scoresDo('readonly',s=>s.getAllKeys()).catch(()=>[]);}
