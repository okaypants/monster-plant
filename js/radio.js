'use strict';
/* The radio on the desk (Jackie, Nov 16). Tap it: it switches on and its dial opens. Two bands:
   CRATES: old records that are free for everyone (the same library as the sampler: digitized 78s published 101 or more
     years ago), and now and then one of the songs you finished in the sampler and sent to the radio. Your song gets a
     caption, and the monsters bop along. The songs come from js/cratesdb.js.
   WORLD: 78 live stations Jackie asked for (cool, weird, arty, underground or just fun, Art Bell reruns and UFO talk, a lot
     from Asia, plus jazz, folk, tango, fado, classical and lo-fi), hand-picked and checked, laid along the dial west to east, San Francisco to
     New Caledonia, then the ones that live only online. Drag the dial or
     tap the arrows; between stations you hear a real recording of a radio being tuned (sounds/tune.m4a). Live radio is
     only for listening: it never goes into the sampler or the crates.
   Everything is streamed, never downloaded whole. The band and the station are remembered (localStorage 'mp-radio').
   Off when the game starts; quiet while the sampler is open. */
const RADIO={x:1078,y:468,w:106,h:60}; // the same box as the 'radio' fidget in js/fidgets.js
const RADIO_VOL=.55,RADIO_MINE=.35; // how loud; the chance one of your songs is next (it comes after two records at the latest)
const radio={on:false,el:null,src:null,gain:null,tok:0,since:0,last:null,fails:0,hold:false,band:'crates',wi:0,panel:null,hiss:null};
try{const r=JSON.parse(localStorage.getItem('mp-radio')||'{}');if(r.band==='world')radio.band='world';if(r.wi>=0)radio.wi=r.wi}catch(e){}
function radioKeep(){try{localStorage.setItem('mp-radio',JSON.stringify({band:radio.band,wi:radio.wi}))}catch(e){}}
function radioTap(){if(radio.panel){radioPanelClose();return}if(!radio.on)radioOn(true);radioPanel()}
function radioOn(quiet){if(!AC)audioInit();radio.on=true;radio.fails=0;if(!quiet)tell('The radio is on.',{kind:'info',key:'radioOn'});if(radio.band==='world')worldPlay(radio.wi);else radioNext();radioPanelShow()}
function radioOff(said){radio.on=false;radio.tok++;radioStop();hissStop();radioPanelShow();if(said)tell('The radio is off.',{kind:'info',key:'radioOff'})}
function radioStop(){
  if(radio.el){try{radio.el.onended=radio.el.onerror=null;radio.el.pause();radio.el.removeAttribute('src');radio.el.load()}catch(e){}}
  if(radio.src){try{radio.src.onended=null;radio.src.stop()}catch(e){}radio.src=null}}
async function radioNext(){
  if(!radio.on)return;if(radio.band==='world')return worldPlay(radio.wi);const tok=++radio.tok;radioStop();
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
    radioCheer(m);radioPanelShow(m.name+', by you!');return true}catch(e){return false}}
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
      radioPanelShow('“'+(t||'An old record').slice(0,48)+'”'+(it.year?' ('+it.year+')':''));return true}catch(e){if(e instanceof TypeError||e.name==='NotAllowedError')return false}}
  return false}
// quiet while the sampler is open, and while the game is in the background
function radioHold(on){if(on){radioPanelClose();radio.hold=radio.on;if(radio.on)radioOff(false)}else if(radio.hold){radio.hold=false;radioOn(true)}}
document.addEventListener('visibilitychange',()=>{if(radio.el&&radio.on&&!radio.src){if(document.hidden)radio.el.pause();else radio.el.play().catch(()=>{})}});

/* ---------- WORLD: live stations ----------
   n name, k what it plays, p where, u the stream (https, plain MP3 or AAC so it plays everywhere), x how far east (the
   dial runs west to east; the ones that live only online sit at the far end). All checked Nov 16, in a browser too
   (SomaFM was left out: it refuses to stream to web pages). The two Art Bell reruns come from an unofficial relay that
   may vanish (Jackie: keep it, just skip it if it disappears; a dead station already skips to the next).
   Freeform and DJ stations talk between records now and then, and anything can come on: that's the fun of them. */
const WORLD=[
 {n:'BFF.fm',k:'Indie and local',p:'San Francisco, USA',u:'https://stream.bff.fm/1/mp3.mp3',x:-122.42},
 {n:'KPISS.FM',k:'Gloriously weird',p:'Seattle, USA',u:'https://streaming.live365.com/a18444',x:-122.33},
 {n:'KALX',k:'College radio, anything goes',p:'Berkeley, USA',u:'https://stream.kalx.berkeley.edu:8443/kalx-128.mp3',x:-122.27},
 {n:'Radio Paradise World/Etc',k:'World music and surprises',p:'California, USA',u:'https://stream.radioparadise.com/world-etc-128',x:-121.6},
 {n:'dublab',k:'Arty and experimental',p:'Los Angeles, USA',u:'https://dublab.out.airtime.pro/dublab_a',x:-118.24},
 {n:'Coast to Coast AM',k:'Art Bell reruns: aliens, ghosts and callers',p:'From the desert, in spirit',u:'https://radio.dopebeat.xyz/C2C',x:-116.0},
 {n:'Midnight in the Desert',k:'More Art Bell reruns, late-night strange',p:'From the desert, in spirit',u:'https://radio.dopebeat.xyz/MITD',x:-115.99},
 {n:'Free People of the Cosmos',k:'UFO and paranormal shows',p:'USA',u:'https://podradio.us/stream/free-cosmos',x:-98.0},
 {n:'Radio is a Foreign Country',k:'Rare tapes, records and field recordings',p:'USA',u:'https://s5.radio.co/s20251311a/listen',x:-95.0},
 {n:'Conyers Old Time Radio',k:'Old-time radio shows',p:'Conyers, Georgia, USA',u:'https://s8.yesstreaming.net:17011/stream',x:-84.02},
 {n:'WFMU',k:'Freeform: anything at all',p:'Jersey City, USA',u:'https://stream0.wfmu.org/freeform-128k',x:-74.08},
 {n:'WFMU Rock\'n\'Soul Ichiban',k:'Old rock\'n\'roll and soul',p:'Jersey City, USA',u:'https://stream0.wfmu.org/ichiban',x:-74.079},
 {n:'WFMU Give the Drummer Radio',k:'Freeform, more of it',p:'Jersey City, USA',u:'https://stream0.wfmu.org/drummer',x:-74.078},
 {n:'Montez Press Radio: The Sounded Word',k:'Sound and poetry',p:'New York, USA',u:'https://stream.montezpress.com/icecast/reading-and-poetry-the-sounded-word',x:-74.01},
 {n:'Montez Press Radio',k:'Art radio',p:'New York, USA',u:'https://stream.montezpress.com/icecast/recent',x:-74.0},
 {n:'La 2x4',k:'Tango',p:'Buenos Aires, Argentina',u:'https://media.radios.ar:9270/',x:-58.38},
 {n:'Radio Nacional Folklórica',k:'Argentine folk',p:'Buenos Aires, Argentina',u:'https://sa.mp3.icecast.magma.edge-access.net/sc_rad38',x:-58.37},
 {n:'Radio Thiossane',k:'Senegalese music',p:'Dakar, Senegal',u:'https://listen.senemultimedia.net:8112/stream',x:-17.44},
 {n:'Radio Quântica',k:'Club and underground',p:'Lisbon, Portugal',u:'https://libretime.radioquantica.com/main.mp3',x:-9.14},
 {n:'Rádio Fado de Coimbra',k:'Fado',p:'Coimbra, Portugal',u:'https://nl.digitalrm.pt:8048/stream',x:-8.42},
 {n:'Radio Relativa',k:'Underground',p:'Madrid, Spain',u:'https://streamer.radio.co/sd6131729c/listen',x:-3.7},
 {n:'Dundee Radio Club',k:'Community DJs',p:'Dundee, Scotland',u:'https://dundee-radio-club.radiocult.fm/stream',x:-2.97},
 {n:'Noods Radio',k:'DJs, anything goes',p:'Bristol, UK',u:'https://noods-radio.radiocult.fm/stream',x:-2.59},
 {n:'ROKit Radio Science Fiction',k:'Old sci-fi radio plays',p:'UK',u:'https://streaming05.liveboxstream.uk/proxy/roksta12/stream',x:-1.0},
 {n:'Oroko Radio',k:'Underground',p:'Accra, Ghana',u:'https://oroko-radio.radiocult.fm/stream',x:-0.2},
 {n:'NTS 1',k:'DJs from everywhere',p:'London, UK',u:'https://stream-relay-geo.ntslive.net/stream',x:-0.12},
 {n:'NTS 2',k:'DJs from everywhere',p:'London, UK',u:'https://stream-relay-geo.ntslive.net/stream2',x:-0.119},
 {n:'Resonance Extra',k:'Sound art and strange music',p:'London, UK',u:'https://stream.resonance.fm/resonance-extra',x:-0.118},
 {n:'FIP',k:'A bit of everything',p:'Paris, France',u:'https://icecast.radiofrance.fr/fip-hifi.aac',x:2.35},
 {n:'Kiosk Radio',k:'From a kiosk in a park',p:'Brussels, Belgium',u:'https://kioskradiobxl.out.airtime.pro/kioskradiobxl_b',x:4.35},
 {n:'Radio WORM',k:'Experimental, from a music venue',p:'Rotterdam, Netherlands',u:'https://origin.streamnerd.nl/worm/worm/icecast.audio',x:4.48},
 {n:'LYL Radio',k:'Underground and odd',p:'Lyon, France',u:'https://icecast.lyl.live/live',x:4.83},
 {n:'Echobox Radio',k:'Underground',p:'Amsterdam, Netherlands',u:'https://play.streamnerd.nl/echobox/echobox/icecast.audio',x:4.9},
 {n:'Noise Radio',k:'Noise and field recordings',p:'Netherlands',u:'https://a2.asurahosting.com:7890/radio.mp3',x:5.3},
 {n:'Radio Meuh',k:'Groovy and eclectic',p:'The French Alps',u:'https://radiomeuh2.ice.infomaniak.ch/radiomeuh2-128.mp3',x:6.5},
 {n:'Radio Swiss Jazz',k:'Jazz',p:'Switzerland',u:'https://stream.srg-ssr.ch/m/rsj/mp3_128',x:7.44},
 {n:'Radio Raheem',k:'DJs and odd records',p:'Milan, Italy',u:'https://radioraheem.out.airtime.pro/radioraheem_a',x:9.19},
 {n:'NRK Folkemusikk',k:'Norwegian folk',p:'Norway',u:'https://lyd.nrk.no/icecast/aac/high/s0w7hwn47m/folkemusikk',x:10.75},
 {n:'Radio 80000',k:'DJs and weird pop',p:'Munich, Germany',u:'https://radio80k.out.airtime.pro:8000/radio80k_a',x:11.58},
 {n:'Venice Classic Radio',k:'Classical',p:'Venice, Italy',u:'https://uk2.streamingpulse.com/ssl/vcr1',x:12.33},
 {n:'Cashmere Radio',k:'Experimental',p:'Berlin, Germany',u:'https://cashmereradio.out.airtime.pro/cashmereradio_b',x:13.4},
 {n:'Refuge Worldwide',k:'DJs and community shows',p:'Berlin, Germany',u:'https://streaming.radio.co/s3699c5e49/listen',x:13.41},
 {n:'Radio Helsinki',k:'Free community radio',p:'Graz, Austria',u:'https://live.helsinki.at:8088/live160.mp3',x:15.44},
 {n:'Palanga Street Radio',k:'Underground by the sea',p:'Palanga, Lithuania',u:'https://stream.palanga.live:8443/palanga128.mp3',x:21.07},
 {n:'ERT Kosmos',k:'Music from all over the world',p:'Athens, Greece',u:'https://radiostreaming.ert.gr/ert-kosmos',x:23.73},
 {n:'XRaydio',k:'A kaleidoscope of sound',p:'Bulgaria',u:'https://xraydio.ddns.net/live',x:25.0},
 {n:'Radio alHara',k:'Arty, from many cities',p:'Bethlehem, Palestine',u:'https://stream.radioalhara.net/ra',x:35.2},
 {n:'Mutant Radio',k:'Underground',p:'Tbilisi, Georgia',u:'https://listen.radioking.com/radio/282820/stream/328621',x:44.8},
 {n:'Qazaq radiosy',k:'Kazakh folk and steppe songs',p:'Kazakhstan',u:'https://radio-streams.kaztrk.kz/qazradio/qazradio/icecast.audio',x:71.4},
 {n:'Bollywood Gaane Purane',k:'Old Bollywood songs',p:'India',u:'https://stream.zeno.fm/6n6ewddtad0uv',x:77.2},
 {n:'Looktung Eingdoi',k:'Luk thung, Thai country music',p:'Northern Thailand',u:'https://inter.lannaradio.com/radio/8000/radio.mp3',x:98.98},
 {n:'BKK.FM',k:'Alternative and electronic',p:'Bangkok, Thailand',u:'https://rsas.bkk.fm/radio',x:100.5},
 {n:'Bangkok Community Radio',k:'Underground DJs',p:'Bangkok, Thailand',u:'https://bcr.radiocult.fm/stream',x:100.51},
 {n:'Pop Radio 21',k:'Khmer pop and folk',p:'Phnom Penh, Cambodia',u:'https://listen.radioking.com/radio/318317/stream/365846',x:104.9},
 {n:'Hà Nội Community Radio',k:'Underground DJs and live music',p:'Hanoi, Vietnam',u:'https://ha-noi-community-radio.radiocult.fm/stream',x:105.85},
 {n:'Elgen Nutag',k:'Mongolian folk, stories and talk',p:'Mongolia',u:'https://a6.asurahosting.com:7210/radio.mp3',x:106.9},
 {n:'Mettaswara Koplo',k:'Dangdut koplo: wild Javanese dance music',p:'Java, Indonesia',u:'https://mettaswara.com:8700//koplo',x:110.0},
 {n:'Radio Campursari',k:'Campursari: gamelan meets keyboards',p:'Yogyakarta, Indonesia',u:'https://a8.siar.us/listen/campursari/stream',x:110.37},
 {n:'FM Belowground',k:'Electronic',p:'Hong Kong',u:'https://listen.belowground.fm/radio/8000/radio.mp3',x:114.17},
 {n:'90s Pinoy Alternative',k:'Filipino alt-rock from the 90s',p:'Philippines',u:'https://cast3.my-control-panel.com/proxy/ronald/stream',x:120.97},
 {n:'OPM Radio',k:'OPM: Original Pilipino Music',p:'Philippines',u:'https://listen.streamaudio.co/proxy/kaibiganradio/opm',x:120.98},
 {n:'Pinoy Rap Radio',k:'Filipino hip-hop',p:'Philippines',u:'https://stream.zeno.fm/0cdp55nqam0uv',x:120.99},
 {n:'Taipei Classical Radio',k:'Classical',p:'Taipei, Taiwan',u:'https://stream.zeno.fm/w66d3dp6ynhvv',x:121.5},
 {n:'Budots FM',k:'Budots: Davao\'s homemade dance remixes',p:'Philippines',u:'https://stream.zeno.fm/2uhuu5hvzqzuv',x:125.6},
 {n:'yojosuknam Radio',k:'Gugak, jazz and lo-fi',p:'Korea',u:'https://stream.yojosuknam.com/live.mp3',x:127.0},
 {n:'Ashiya Radio',k:'Bossa nova and mellow tunes',p:'Ashiya, Japan',u:'https://s3.radio.co/sc8d895604/listen',x:135.3},
 {n:'Japan City Pop',k:'Japanese city pop',p:'Japan',u:'https://play.streamafrica.net/japancitypop',x:139.0},
 {n:'Jazz Sakura',k:'Japanese jazz',p:'Japan',u:'https://kathy.torontocast.com:3330/;',x:139.1},
 {n:'Moon Mission Recordings',k:'Deep house from a Tokyo label',p:'Tokyo, Japan',u:'https://uk5.internet-radio.com/proxy/mmr?mp=/stream;',x:139.7},
 {n:'NIA Radio Lo-Fi',k:'Lo-fi beats',p:'New Caledonia',u:'https://radio.nia.nc/radio/8020/lofi-hq-stream.aac',x:166.45},
 {n:'Nightride FM Spacesynth',k:'Space-age synths',p:'Somewhere online',u:'https://stream.nightride.fm/spacesynth.mp3',x:999},
 {n:'Nightwave Plaza',k:'Vaporwave',p:'Somewhere online',u:'https://radio.plaza.one/mp3',x:999.1},
 {n:'Radio Brennpunkt',k:'Sound art and odd music',p:'Somewhere online',u:'https://radio-brennpunkt.radiocult.fm/stream',x:999.2},
 {n:'Dark Matter Sessions',k:'Strange signals',p:'Signal City, somewhere online',u:'https://signalcity.tv/dark_matter.mp3',x:999.3},
 {n:'LISTEN.moe K-pop',k:'K-pop, fan-run',p:'Somewhere online',u:'https://listen.moe/kpop/fallback',x:999.4},
 {n:'LISTEN.moe',k:'J-pop and anime songs, fan-run',p:'Somewhere online',u:'https://listen.moe/fallback',x:999.5},
 {n:'Gensokyo Radio',k:'Fan music for the Touhou games',p:'Gensokyo, in spirit',u:'https://stream.gensokyoradio.net/3',x:999.6},
 {n:'Miku Radio',k:'Vocaloid: Hatsune Miku and friends',p:'Somewhere online',u:'https://miku.fm/listen/miku/mp3-128',x:999.7}];
const HISS_VOL=.22; // the tuning sound between stations: quiet
let HISS_BUF=null,hissLoading=false;
function hissLoad(){if(HISS_BUF||hissLoading||!AC)return;hissLoading=true;fetch('sounds/tune.m4a').then(r=>r.arrayBuffer()).then(b=>new Promise((ok,no)=>AC.decodeAudioData(b,ok,no))).then(b=>{HISS_BUF=b}).catch(()=>{hissLoading=false})}
// a burst of tuning noise (dur seconds), or held until hissStop() when dur is 0 (while you drag the dial)
function hiss(dur){hissLoad();if(!HISS_BUF||!AC)return;hissStop();if(AC.state!=='running')AC.resume();
  const n=AC.createBufferSource(),g=AC.createGain(),t=AC.currentTime;n.buffer=HISS_BUF;n.loop=true;n.loopStart=3;n.loopEnd=Math.min(13,HISS_BUF.duration);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(HISS_VOL,t+.04);n.connect(g).connect(AC.destination);n.start(t,3+Math.random()*8);
  radio.hiss={n,g};if(dur){g.gain.setValueAtTime(HISS_VOL,t+dur);g.gain.exponentialRampToValueAtTime(0.0001,t+dur+.35);n.stop(t+dur+.4)}}
function hissStop(fade){const h=radio.hiss;if(!h)return;radio.hiss=null;try{const t=AC.currentTime;h.g.gain.cancelScheduledValues(t);h.g.gain.setValueAtTime(h.g.gain.value,t);h.g.gain.exponentialRampToValueAtTime(0.0001,t+(fade||.05));h.n.stop(t+(fade||.05)+.05)}catch(e){}}
function worldPlay(i){if(!(radio.wi<WORLD.length))radio.wi=0;
  if(!radio.on)return;i=(i%WORLD.length+WORLD.length)%WORLD.length;radio.wi=i;radioKeep();const tok=++radio.tok;radioStop();
  const s=WORLD[i];hiss(.9);radioPanelShow();
  if(!radio.el){radio.el=new Audio();radio.el.setAttribute('playsinline','');radio.el.preload='none'}
  const a=radio.el;a.volume=RADIO_VOL;a.onended=null;
  a.onerror=()=>{if(tok!==radio.tok)return;radioPanelShow('No signal. Trying the next one…');if(++radio.fails<4)setTimeout(()=>{if(tok===radio.tok)worldPlay(i+1)},1500);else{radioOff(false);tell('No signal on the WORLD band. The radio needs the internet.',{kind:'info',key:'worldNone'})}};
  a.onplaying=()=>{if(tok!==radio.tok)return;radio.fails=0;hissStop(.35);radioPanelShow()};
  a.src=s.u;a.play().catch(e=>{if(tok===radio.tok&&e.name!=='AbortError')a.onerror()});
  if(!radio.panel)tell('On the radio: '+s.n+', '+s.p+'.',{kind:'ambient'})}
function radioBand(b){if(radio.band===b)return;radio.band=b;radioKeep();if(!radio.on)radioOn(true);else if(b==='world')worldPlay(radio.wi);else{hissStop();radioNext()}radioPanelShow()}
function radioStep(d){if(!radio.on){radioOn(true);return}if(radio.band==='world')worldPlay(radio.wi+d);else{radio.since++;radioNext()}}

/* ---------- the dial: a little panel above the radio ---------- */
function radioPanel(){
  if(radio.panel)return;hissLoad();const el=document.createElement('div');el.className='rpanel tsb tspop';el.innerHTML=
   '<div class="rtop"><button type="button" class="rbtn" data-b="crates">CRATES</button><button type="button" class="rbtn" data-b="world">WORLD</button>'+
   '<button type="button" class="rbtn rpow">ON</button><button type="button" class="rbtn rx" aria-label="Close">✕</button></div>'+
   '<div class="rdial"><div class="rticks"></div><div class="rneedle"></div></div>'+
   '<div class="rrow"><button type="button" class="rbtn rarrow" data-d="-1" aria-label="Back">◀</button><div class="rname"><b></b><span></span><em></em></div><button type="button" class="rbtn rarrow" data-d="1" aria-label="Next">▶</button></div>';
  const tk=el.querySelector('.rticks');for(let i=0;i<WORLD.length;i++){const t=document.createElement('i');t.style.left=((i+.5)/WORLD.length*100)+'%';tk.appendChild(t)}
  el.addEventListener('pointerdown',e=>e.stopPropagation());el.addEventListener('click',e=>e.stopPropagation());
  el.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{sfx('tick');radioBand(b.dataset.b)});
  el.querySelector('.rpow').onclick=()=>{sfx('tick');if(radio.on)radioOff(true);else radioOn(true)};
  el.querySelector('.rx').onclick=()=>{sfx('tick');radioPanelClose()};
  el.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{sfx('tick');radioStep(+b.dataset.d)});
  const dial=el.querySelector('.rdial'),nd=el.querySelector('.rneedle');let drag=false;
  const at=e=>{const r=dial.getBoundingClientRect();return clamp((e.clientX-r.left)/r.width,0,1)};
  const near=f=>clamp(Math.round(f*WORLD.length-.5),0,WORLD.length-1);
  dial.addEventListener('pointerdown',e=>{e.preventDefault();if(radio.band!=='world'){radioBand('world');return}if(!radio.on)radioOn(true);drag=true;dial.setPointerCapture?.(e.pointerId);
    radio.tok++;radioStop();hiss(0);nd.classList.add('rnow');nd.style.left=at(e)*100+'%';radioPanelShow('…')});
  dial.addEventListener('pointermove',e=>{if(!drag)return;const f=at(e);nd.style.left=f*100+'%';const i=near(f),c=(i+.5)/WORLD.length;
    radioPanelName(Math.abs(f-c)<.35/WORLD.length?WORLD[i]:null)});
  const up=e=>{if(!drag)return;drag=false;nd.classList.remove('rnow');worldPlay(near(at(e)))};
  dial.addEventListener('pointerup',up);dial.addEventListener('pointercancel',up);
  document.addEventListener('pointerdown',radioOutside,true);
  ui.appendChild(el);radio.panel=el;radioPanelShow();radioPanelPlace()}
function radioOutside(e){if(radio.panel&&!radio.panel.contains(e.target)){const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/S,y=(e.clientY-r.top)/S;if(!inR(x,y,RADIO))radioPanelClose()}}
function radioPanelClose(){if(!radio.panel)return;radio.panel.remove();radio.panel=null;document.removeEventListener('pointerdown',radioOutside,true)}
function radioPanelPlace(){const el=radio.panel;if(!el)return;const w=el.offsetWidth,h=el.offsetHeight;
  const top=clamp(RADIO.y*S-h-10,4,H*S-h-4),right=top<48?160:4; // on a short phone screen it slides left, clear of the debug and full-screen buttons
  el.style.left=Math.round(clamp((RADIO.x+RADIO.w/2)*S-w/2,4,W*S-w-right))+'px';el.style.top=Math.round(top)+'px'}
addEventListener('resize',()=>setTimeout(radioPanelPlace,60));
function radioPanelName(s,line){const el=radio.panel;if(!el)return;const b=el.querySelector('.rname b'),sp=el.querySelector('.rname span'),pl=el.querySelector('.rname em');
  if(s){b.textContent=s.n;sp.textContent=line||s.k;pl.textContent=s.p}else{b.textContent='· · ·';sp.textContent=line||'Static';pl.textContent=''}}
// what the panel shows now; msg replaces the second line for a moment (a record's title, No signal…)
function radioPanelShow(msg){const el=radio.panel;if(!el)return;
  el.querySelectorAll('[data-b]').forEach(b=>b.classList.toggle('on',b.dataset.b===radio.band));
  const pw=el.querySelector('.rpow');pw.textContent=radio.on?'ON':'OFF';pw.classList.toggle('on',radio.on);
  el.classList.toggle('rworld',radio.band==='world');el.classList.toggle('roff',!radio.on);
  const nd=el.querySelector('.rneedle');if(!nd.classList.contains('rnow'))nd.style.left=((radio.wi+.5)/WORLD.length*100)+'%';
  if(msg==='…')return radioPanelName(null);
  if(!radio.on)return radioPanelName(null,'Off. Tap ON, or pick a band.');
  if(radio.band==='world')return radioPanelName(WORLD[radio.wi],msg);
  el.querySelector('.rname b').textContent='The Crates';el.querySelector('.rname span').textContent=msg||'Old 78s and your own songs';el.querySelector('.rname em').textContent=msg?'':'Sent from the sampler'}
