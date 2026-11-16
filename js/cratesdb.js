'use strict';
/* What the sampler keeps on purpose (Jackie, Nov 16), shared by sampler.html and the radio (js/radio.js).
   It lives in this site's own storage on the phone (IndexedDB 'mp-crates'), never in the game's save. Stores:
   work    - the one work in progress, key 'wip': the pads (sound, title, pitch), tempo, bars, LOCK and the loop
   songs   - finished songs: {id, n, name, made, bpm, bars, secs, radio}; radio = sent to the radio
   songpcm - each song played out, ready for the radio: {id, sr, pcm (Int16)}; kept apart so listing songs stays light
   beats, pads - beats saved the first way (Nov 16, before work in progress); still listed, so nothing saved is lost */
let cratesP=null;
function cratesDB(){return cratesP||(cratesP=new Promise((ok,no)=>{let r;try{r=indexedDB.open('mp-crates',2)}catch(e){cratesP=null;return no(e)}
  r.onupgradeneeded=()=>{const d=r.result;
    for(const [n,o] of [['beats',{keyPath:'id',autoIncrement:true}],['pads',{keyPath:'id'}],['work',{}],['songs',{keyPath:'id',autoIncrement:true}],['songpcm',{keyPath:'id'}]])
      if(!d.objectStoreNames.contains(n))d.createObjectStore(n,o)};
  r.onsuccess=()=>ok(r.result);r.onerror=r.onblocked=()=>{cratesP=null;no(r.error)}}))}
function cratesTx(stores,mode,fn){return cratesDB().then(db=>new Promise((ok,no)=>{const tx=db.transaction(stores,mode);let out;
  fn(tx,v=>out=v);tx.oncomplete=()=>ok(out);tx.onerror=tx.onabort=()=>no(tx.error)}))}
function cratesAll(store){return cratesTx([store],'readonly',(tx,put)=>{const r=tx.objectStore(store).getAll();r.onsuccess=()=>put(r.result||[])})}
function cratesGet(store,key){return cratesTx([store],'readonly',(tx,put)=>{const r=tx.objectStore(store).get(key);r.onsuccess=()=>put(r.result)})}
// Int16 sound back into something Web Audio plays; no audio context needed
function cratesBuf(pcm,sr,ac){const b=typeof AudioBuffer==='function'?new AudioBuffer({length:Math.max(1,pcm.length),sampleRate:sr,numberOfChannels:1}):ac.createBuffer(1,Math.max(1,pcm.length),sr);
  const o=b.getChannelData(0);for(let k=0;k<pcm.length;k++)o[k]=pcm[k]/32768;return b}
function cratesI16(f,gain=1){const o=new Int16Array(f.length);for(let k=0;k<f.length;k++){const v=Math.max(-1,Math.min(1,f[k]*gain));o[k]=v<0?v*32768:v*32767}return o}
