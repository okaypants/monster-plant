'use strict';
/* The radio on the desk (Jackie, Nov 16): tap it to switch it on or off. While it is on it plays a station: old records
   that are free for everyone (the same library as the sampler: digitized 78s published 101 or more years ago), and now
   and then one of the songs you finished in the sampler and sent to the radio. Your song gets a caption, and the
   monsters bop along. Records are streamed, never downloaded whole; nothing here is saved. The songs come from
   js/cratesdb.js. Off when the game starts; quiet while the sampler is open. */
const RADIO={x:1078,y:468,w:106,h:60}; // the same box as the 'radio' fidget in js/fidgets.js
const RADIO_VOL=.55,RADIO_MINE=.35; // how loud; the chance one of your songs is next (it comes after two records at the latest)
const radio={on:false,el:null,src:null,gain:null,tok:0,since:0,last:null,fails:0,hold:false};
function radioTap(){if(radio.on)radioOff(true);else radioOn()}
function radioOn(quiet){if(!AC)audioInit();radio.on=true;radio.fails=0;if(!quiet)tell('The radio is on.',{kind:'info',key:'radioOn'});radioNext()}
function radioOff(said){radio.on=false;radio.tok++;radioStop();if(said)tell('The radio is off.',{kind:'info',key:'radioOff'})}
function radioStop(){
  if(radio.el){try{radio.el.onended=radio.el.onerror=null;radio.el.pause();radio.el.removeAttribute('src');radio.el.load()}catch(e){}}
  if(radio.src){try{radio.src.onended=null;radio.src.stop()}catch(e){}radio.src=null}}
async function radioNext(){
  if(!radio.on)return;const tok=++radio.tok;radioStop();
  let songs=[];try{songs=(await cratesAll('songs')).filter(s=>s.radio)}catch(e){}
  if(tok!==radio.tok)return;
  if(songs.length&&(radio.since>=2||Math.random()<RADIO_MINE)&&await radioSong(songs,tok))return;
  if(tok!==radio.tok)return;
  if(await radioRecord(tok))return;
  if(tok!==radio.tok)return;
  if(songs.length&&await radioSong(songs,tok))return; // no internet: your songs only
  if(tok!==radio.tok)return;
  tell('Only static. The radio needs the internet, or a song of yours sent from the sampler.',{kind:'info',key:'radioStatic'});radioOff(false)}
// one of your songs, played from the phone's storage
async function radioSong(songs,tok){
  try{const pick=songs.length>1?songs.filter(s=>s.id!==radio.last):songs,m=pick[Math.floor(Math.random()*pick.length)];
    const d=await cratesGet('songpcm',m.id);if(!d||tok!==radio.tok||!AC)return false;
    if(AC.state!=='running')AC.resume();
    const n=AC.createBufferSource(),gn=AC.createGain();n.buffer=cratesBuf(d.pcm,d.sr,AC);gn.gain.value=RADIO_VOL*1.4;n.connect(gn).connect(AC.destination);n.start();
    radio.src=n;radio.last=m.id;radio.since=0;n.onended=()=>{if(radio.src===n){radio.src=null;radioNext()}};
    radioCheer(m);return true}catch(e){return false}}
function radioCheer(m){
  const n=plantCount(),one=n===1?firstName():'';
  tell('On the radio: '+m.name+', by you! '+(n===0?'':n===1?one+' bops along.':'Everyone bops along.'),{kind:'important',key:'onAir'+m.id});
  try{eachPlant(()=>{if(st.stage<0)return;const b=plantBox();burst('heart',b.x+b.w/2,b.y-20,2)});plantBoing(0)}catch(e){}}
// an old record from the library, streamed
const RADIO_CUT=new Date().getFullYear()-101; // US sound recordings are public domain 100 years after publication, on the following 1 January
async function radioRecord(tok){
  for(let tries=0;tries<3;tries++){
    try{const q=['mediatype:audio','collection:(georgeblood OR edison-recordings OR 78rpm_bostonpubliclibrary)','year:[1880 TO '+RADIO_CUT+']','NOT access-restricted-item:true'].join(' AND ');
      const u=new URLSearchParams({q,rows:50,page:1+Math.floor(Math.random()*20),output:'json'});['identifier','title','year'].forEach(f=>u.append('fl[]',f));u.append('sort[]','downloads desc');
      const docs=((await (await fetch('https://archive.org/advancedsearch.php?'+u)).json()).response||{}).docs||[];if(tok!==radio.tok)return true;
      const it=docs[Math.floor(Math.random()*docs.length)];if(!it)continue;
      const md=await (await fetch('https://archive.org/metadata/'+encodeURIComponent(it.identifier))).json();if(tok!==radio.tok)return true;
      const f=(md.files||[]).filter(f=>!f.private&&f.name&&/mp3/i.test(f.format||'')).sort((a,b)=>a.name.includes('/')-b.name.includes('/'))[0];if(!f)continue;
      if(!radio.el){radio.el=new Audio();radio.el.setAttribute('playsinline','');radio.el.preload='none'}
      const a=radio.el;a.volume=RADIO_VOL;a.src='https://archive.org/download/'+encodeURIComponent(it.identifier)+'/'+f.name.split('/').map(encodeURIComponent).join('/');
      a.onended=()=>{radio.since++;radioNext()};a.onerror=()=>{if(++radio.fails<4)setTimeout(()=>radioNext(),1200);else radioOff(false)};
      await a.play();radio.fails=0;
      const t=String(it.title||'').trim();if(t)tell('The radio plays “'+t.slice(0,60)+'”'+(it.year?' ('+it.year+')':'')+'.',{kind:'ambient'});
      return true}catch(e){if(e instanceof TypeError||e.name==='NotAllowedError')return false}}
  return false}
// quiet while the sampler is open, and while the game is in the background
function radioHold(on){if(on){radio.hold=radio.on;if(radio.on)radioOff(false)}else if(radio.hold){radio.hold=false;radioOn(true)}}
document.addEventListener('visibilitychange',()=>{if(radio.el&&radio.on&&!radio.src){if(document.hidden)radio.el.pause();else radio.el.play().catch(()=>{})}});
