'use strict';
/* The radio on the desk (Jackie, Nov 16). Tap it: it switches on and its dial opens. Two bands:
   CRATES: old records that are free for everyone (the same library as the sampler: digitized 78s published 101 or more
     years ago), and now and then one of the songs you finished in the sampler and sent to the radio. Your song gets a
     caption, and the monsters bop along. The songs come from js/cratesdb.js.
   WORLD: 81 live stations Jackie asked for (cool, weird, arty, underground or just fun, Art Bell reruns and UFO talk, a lot
     from Asia, Africa, the Middle East and Central Asia, plus jazz, folk, tango, fado, classical and lo-fi), hand-picked and checked, laid along the dial west to east, Seattle to
     New Caledonia, then the ones that live only online. Drag the dial or
     tap the arrows; between stations you hear a real recording of a radio being tuned (sounds/tune.m4a). Live radio is
     only for listening: it never goes into the sampler or the crates.
   Everything is streamed, never downloaded whole. The band and the station are remembered (localStorage 'mp-radio').
   Off when the game starts; quiet while the sampler is open. */
const RADIO={x:1078,y:468,w:106,h:60}; // the same box as the 'radio' fidget in js/fidgets.js
const RADIO_VOL=.55,RADIO_MINE=.35; // how loud; the chance one of your songs is next (it comes after two records at the latest)
const radio={on:false,el:null,src:null,gain:null,tok:0,since:0,last:null,fails:0,hold:false,band:'crates',wi:0,panel:null,hiss:null,pre:[null,null,null,null,null]};
try{const r=JSON.parse(localStorage.getItem('mp-radio')||'{}');if(r.band==='world')radio.band='world';if(r.wi>=0)radio.wi=r.wi;if(Array.isArray(r.pre))radio.pre=[0,1,2,3,4].map(k=>r.pre[k]||null)}catch(e){}
function radioKeep(){try{localStorage.setItem('mp-radio',JSON.stringify({band:radio.band,wi:radio.wi,pre:radio.pre}))}catch(e){}}
function radioTap(){if(radio.panel){radioPanelClose();return}if(!radio.on)radioOn(true);radioPanel()}
function radioOn(quiet){if(!AC)audioInit();radio.on=true;radio.fails=0;wakeOn();if(!quiet)tell('The radio is on.',{kind:'info',key:'radioOn'});if(radio.band==='world')worldPlay(radio.wi);else radioNext();radioPanelShow()}
function radioOff(said){radio.on=false;radio.tok++;radioStop();hissStop();wakeOff();radioPanelShow();if(said)tell('The radio is off.',{kind:'info',key:'radioOff'})}
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
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&radio.on)wakeOn();if(radio.el&&radio.on&&!radio.src){if(document.hidden)radio.el.pause();else radio.el.play().catch(()=>{})}});
// the screen stays awake while the radio is on (Jackie, Nov 16: Garry's phone went to sleep and the music stopped). Uses the
// browser's Screen Wake Lock where it has one (iPhone Safari 16.4 and up, Chrome on Android); elsewhere nothing changes.
// The phone lets go of it by itself whenever the game is in the background, so it is asked for again on coming back.
let WAKE=null;
async function wakeOn(){if(WAKE||!radio.on||document.hidden||!navigator.wakeLock)return;try{const w=await navigator.wakeLock.request('screen');if(!radio.on){w.release().catch(()=>{});return}WAKE=w;w.addEventListener('release',()=>{if(WAKE===w)WAKE=null})}catch(e){}}
function wakeOff(){const w=WAKE;WAKE=null;if(w)w.release().catch(()=>{})}

/* ---------- WORLD: live stations ----------
   n name, k what it plays, p where, u the stream (https, plain MP3 or AAC so it plays everywhere), x how far east (the
   dial runs west to east; the ones that live only online sit at the far end). All checked Nov 16, in a browser too
   (SomaFM was left out: it refuses to stream to web pages). The two Art Bell reruns come from an unofficial relay that
   may vanish (Jackie: keep it, just skip it if it disappears; a dead station already skips to the next).
   Freeform and DJ stations talk between records now and then, and anything can come on: that's the fun of them. */
const WORLD=[
 {n:'KPISS.FM',k:'Weird internet radio',p:'Seattle, USA',u:'https://streaming.live365.com/a18444',x:-122.33},
 {n:'Coast to Coast AM',k:'Reruns of Art Bell\'s call-in show about aliens and ghosts',p:'From the desert, in spirit',u:'https://radio.dopebeat.xyz/C2C',x:-116.0},
 {n:'Midnight in the Desert',k:'More reruns of Art Bell\'s late-night show',p:'From the desert, in spirit',u:'https://radio.dopebeat.xyz/MITD',x:-115.99},
 {n:'Free People of the Cosmos',k:'UFO and paranormal shows',p:'USA',u:'https://podradio.us/stream/free-cosmos',x:-98.0},
 {n:'Radio is a Foreign Country',k:'Rare tapes, records and field recordings',p:'USA',u:'https://s5.radio.co/s20251311a/listen',x:-95.0},
 {n:'Montez Press Radio: The Sounded Word',k:'Sound and poetry',p:'New York, USA',u:'https://stream.montezpress.com/icecast/reading-and-poetry-the-sounded-word',x:-74.01},
 {n:'La 2x4',k:'Tango',p:'Buenos Aires, Argentina',u:'https://media.radios.ar:9270/',x:-58.38},
 {n:'Radio Nacional Folklórica',k:'Argentine folk',p:'Buenos Aires, Argentina',u:'https://sa.mp3.icecast.magma.edge-access.net/sc_rad38',x:-58.37},
 {n:'Caboradio',k:'Cape Verdean music',p:'Cape Verde',u:'https://listen.radioking.com/radio/281506/stream/327253',x:-23.5},
 {n:'Radio Thiossane',k:'Senegalese music',p:'Dakar, Senegal',u:'https://listen.senemultimedia.net:8112/stream',x:-17.44},
 {n:'Radio Quântica',k:'Club and underground',p:'Lisbon, Portugal',u:'https://libretime.radioquantica.com/main.mp3',x:-9.14},
 {n:'Rádio Fado de Coimbra',k:'Fado',p:'Coimbra, Portugal',u:'https://nl.digitalrm.pt:8048/stream',x:-8.42},
 {n:'Radio Malijet',k:'Malian music',p:'Mali',u:'https://stream-157.zeno.fm/yerp85sughwtv',x:-8.0},
 {n:'Medina FM Amazigh',k:'Amazigh (Berber) music',p:'Morocco',u:'https://medinaamazigh.ice.infomaniak.ch/medinaamazigh-128.mp3',x:-7.6},
 {n:'Radio Relativa',k:'Underground',p:'Madrid, Spain',u:'https://streamer.radio.co/sd6131729c/listen',x:-3.7},
 {n:'Noods Radio',k:'DJs, anything goes',p:'Bristol, UK',u:'https://noods-radio.radiocult.fm/stream',x:-2.59},
 {n:'ROKit Radio Science Fiction',k:'Old sci-fi radio plays',p:'UK',u:'https://streaming05.liveboxstream.uk/proxy/roksta12/stream',x:-1.0},
 {n:'Oroko Radio',k:'Underground',p:'Accra, Ghana',u:'https://oroko-radio.radiocult.fm/stream',x:-0.2},
 {n:'NTS 1',k:'DJs from everywhere',p:'London, UK',u:'https://stream-relay-geo.ntslive.net/stream',x:-0.12},
 {n:'Resonance Extra',k:'Sound art and experimental music',p:'London, UK',u:'https://stream.resonance.fm/resonance-extra',x:-0.118},
 {n:'FIP',k:'Many kinds of music',p:'Paris, France',u:'https://icecast.radiofrance.fr/fip-hifi.aac',x:2.35},
 {n:'Antinea Radio',k:'Kabyle radio',p:'Tizi Ouzou, Algeria',u:'https://listen.radioking.com/radio/6640/stream/347',x:4.05},
 {n:'Kiosk Radio',k:'DJs broadcasting from a park kiosk',p:'Brussels, Belgium',u:'https://kioskradiobxl.out.airtime.pro/kioskradiobxl_b',x:4.35},
 {n:'Radio WORM',k:'Experimental, from a music venue',p:'Rotterdam, Netherlands',u:'https://origin.streamnerd.nl/worm/worm/icecast.audio',x:4.48},
 {n:'LYL Radio',k:'Underground and odd',p:'Lyon, France',u:'https://icecast.lyl.live/live',x:4.83},
 {n:'Noise Radio',k:'Noise and field recordings',p:'Netherlands',u:'https://a2.asurahosting.com:7890/radio.mp3',x:5.3},
 {n:'Radio Meuh',k:'Groovy and eclectic',p:'The French Alps',u:'https://radiomeuh2.ice.infomaniak.ch/radiomeuh2-128.mp3',x:6.5},
 {n:'Radio Raheem',k:'DJs and odd records',p:'Milan, Italy',u:'https://radioraheem.out.airtime.pro/radioraheem_a',x:9.19},
 {n:'Mosaique FM Tarab',k:'Tarab, classic Arabic songs',p:'Tunis, Tunisia',u:'https://radio.mosaiquefm.net/mosatarab',x:10.18},
 {n:'NRK Folkemusikk',k:'Norwegian folk',p:'Norway',u:'https://lyd.nrk.no/icecast/aac/high/s0w7hwn47m/folkemusikk',x:10.75},
 {n:'Radio 80000',k:'DJs and weird pop',p:'Munich, Germany',u:'https://radio80k.out.airtime.pro:8000/radio80k_a',x:11.58},
 {n:'Radio Arts Tripoli',k:'Arts radio',p:'Tripoli, Libya',u:'https://stream.zeno.fm/z9wfrdpmgg0uv',x:13.19},
 {n:'Cashmere Radio',k:'Experimental',p:'Berlin, Germany',u:'https://cashmereradio.out.airtime.pro/cashmereradio_b',x:13.4},
 {n:'Refuge Worldwide',k:'DJs and community shows',p:'Berlin, Germany',u:'https://streaming.radio.co/s3699c5e49/listen',x:13.41},
 {n:'Radio Mix Congolaise',k:'Congolese rumba and soukous',p:'Kinshasa, DR Congo',u:'https://stream.zeno.fm/qe5g83upga0uv',x:15.3},
 {n:'Radio Helsinki',k:'Free community radio',p:'Graz, Austria',u:'https://live.helsinki.at:8088/live160.mp3',x:15.44},
 {n:'Bush Radio',k:'Community radio',p:'Cape Town, South Africa',u:'https://zas4.ndx.co.za:9100/stream',x:18.42},
 {n:'Palanga Street Radio',k:'Underground by the sea',p:'Palanga, Lithuania',u:'https://stream.palanga.live:8443/palanga128.mp3',x:21.07},
 {n:'ERT Kosmos',k:'Music from all over the world',p:'Athens, Greece',u:'https://radiostreaming.ert.gr/ert-kosmos',x:23.73},
 {n:'XRaydio',k:'Mixed electronic and vaporwave',p:'Bulgaria',u:'https://xraydio.ddns.net/live',x:25.0},
 {n:'Amapiano FM',k:'Amapiano',p:'Johannesburg, South Africa',u:'https://stream.zeno.fm/xs6zeac1ts8uv',x:28.04},
 {n:'Radio Antalya',k:'Downtempo, electronica and indie',p:'Antalya, Turkey',u:'https://my.radiolize.com/radio/8000/radio.mp3',x:30.7},
 {n:'Radio alHara',k:'Experimental music from many cities',p:'Bethlehem, Palestine',u:'https://stream.radioalhara.net/ra',x:35.2},
 {n:'Wa3 Radio',k:'Ambient, dabke and drum and bass',p:'Beirut, Lebanon',u:'https://stream.wa3.live/wa3.mp3',x:35.5},
 {n:'Tizta FM',k:'Slow Ethiopian tizita songs',p:'Addis Ababa, Ethiopia',u:'https://stream.zeno.fm/55nlq5yzqlftv',x:38.74},
 {n:'Radyo Şiran',k:'Turkish folk',p:'Turkey',u:'https://live.radyositesihazir.com/8078/stream',x:39.1},
 {n:'Kurd1 Radyo',k:'Kurdish folk songs',p:'Kurdish, broadcast from France',u:'https://listen.radioking.com/radio/119251/stream/158701',x:43.0},
 {n:'Mutant Radio',k:'Underground',p:'Tbilisi, Georgia',u:'https://listen.radioking.com/radio/282820/stream/328621',x:44.8},
 {n:'Radio Rock Madagascar',k:'Malagasy rock',p:'Madagascar',u:'https://tanjona.radioca.st/stream',x:47.5},
 {n:'Yurd FM',k:'Azerbaijani folk',p:'Baku, Azerbaijan',u:'https://icecast.livetv.az/yurdfm',x:49.86},
 {n:'RadioSimorgh',k:'Classical Persian music',p:'Iran',u:'https://stream.zeno.fm/9svfnobkrxrvv',x:51.4},
 {n:'Qazaq radiosy',k:'Kazakh folk and steppe songs',p:'Kazakhstan',u:'https://radio-streams.kaztrk.kz/qazradio/qazradio/icecast.audio',x:71.4},
 {n:'Coldstar Radio',k:'Deep house and techno',p:'Kyrgyzstan',u:'https://ice.coldstar.online/high.mp3',x:74.6},
 {n:'Bollywood Gaane Purane',k:'Old Bollywood songs',p:'India',u:'https://stream.zeno.fm/6n6ewddtad0uv',x:77.2},
 {n:'Radio Sangwari',k:'Chhattisgarhi folk',p:'Chhattisgarh, India',u:'https://servidor19.brlogic.com:7002/live',x:81.63},
 {n:'Mellow Bangla',k:'Bangla music',p:'Bangladesh',u:'https://radio.mellowbangla.com/stream',x:90.4},
 {n:'Looktung Eingdoi',k:'Luk thung, Thai country music',p:'Northern Thailand',u:'https://inter.lannaradio.com/radio/8000/radio.mp3',x:98.98},
 {n:'BKK.FM',k:'Alternative and electronic',p:'Bangkok, Thailand',u:'https://rsas.bkk.fm/radio',x:100.5},
 {n:'Bangkok Community Radio',k:'Underground DJs',p:'Bangkok, Thailand',u:'https://bcr.radiocult.fm/stream',x:100.51},
 {n:'Pop Radio 21',k:'Khmer pop and folk',p:'Phnom Penh, Cambodia',u:'https://listen.radioking.com/radio/318317/stream/365846',x:104.9},
 {n:'Hà Nội Community Radio',k:'Underground DJs and live music',p:'Hanoi, Vietnam',u:'https://ha-noi-community-radio.radiocult.fm/stream',x:105.85},
 {n:'Elgen Nutag',k:'Mongolian folk, stories and talk',p:'Mongolia',u:'https://a6.asurahosting.com:7210/radio.mp3',x:106.9},
 {n:'Mettaswara Koplo',k:'Dangdut koplo dance music',p:'Java, Indonesia',u:'https://mettaswara.com:8700//koplo',x:110.0},
 {n:'Radio Campursari',k:'Campursari, gamelan with keyboards',p:'Yogyakarta, Indonesia',u:'https://a8.siar.us/listen/campursari/stream',x:110.37},
 {n:'FM Belowground',k:'Electronic',p:'Hong Kong',u:'https://listen.belowground.fm/radio/8000/radio.mp3',x:114.17},
 {n:'90s Pinoy Alternative',k:'Filipino alt-rock from the 90s',p:'Philippines',u:'https://cast3.my-control-panel.com/proxy/ronald/stream',x:120.97},
 {n:'Pinoy Rap Radio',k:'Filipino hip-hop',p:'Philippines',u:'https://stream.zeno.fm/0cdp55nqam0uv',x:120.99},
 {n:'Taipei Classical Radio',k:'Classical',p:'Taipei, Taiwan',u:'https://stream.zeno.fm/w66d3dp6ynhvv',x:121.5},
 {n:'Budots FM',k:'Budots dance remixes from Davao',p:'Philippines',u:'https://stream.zeno.fm/2uhuu5hvzqzuv',x:125.6},
 {n:'yojosuknam Radio',k:'Gugak, jazz and lo-fi',p:'Korea',u:'https://stream.yojosuknam.com/live.mp3',x:127.0},
 {n:'Ashiya Radio',k:'Bossa nova and mellow tunes',p:'Ashiya, Japan',u:'https://s3.radio.co/sc8d895604/listen',x:135.3},
 {n:'Japan City Pop',k:'Japanese city pop',p:'Japan',u:'https://play.streamafrica.net/japancitypop',x:139.0},
 {n:'Moon Mission Recordings',k:'Deep house from a Tokyo label',p:'Tokyo, Japan',u:'https://uk5.internet-radio.com/proxy/mmr?mp=/stream;',x:139.7},
 {n:'NIA Radio Lo-Fi',k:'Lo-fi beats',p:'New Caledonia',u:'https://radio.nia.nc/radio/8020/lofi-hq-stream.aac',x:166.45},
 {n:'Nightride FM Spacesynth',k:'Space-age synths',p:'Somewhere online',u:'https://stream.nightride.fm/spacesynth.mp3',x:999},
 {n:'Nightwave Plaza',k:'Vaporwave',p:'Somewhere online',u:'https://radio.plaza.one/mp3',x:999.1},
 {n:'Dark Matter Sessions',k:'Experimental broadcasts',p:'Signal City, somewhere online',u:'https://signalcity.tv/dark_matter.mp3',x:999.3},
 {n:'LISTEN.moe K-pop',k:'K-pop, fan-run',p:'Somewhere online',u:'https://listen.moe/kpop/fallback',x:999.4},
 {n:'LISTEN.moe',k:'J-pop and anime songs, fan-run',p:'Somewhere online',u:'https://listen.moe/fallback',x:999.5},
 {n:'Gensokyo Radio',k:'Fan music for the Touhou games',p:'Gensokyo, in spirit',u:'https://stream.gensokyoradio.net/3',x:999.6},
 {n:'Miku Radio',k:'Vocaloid songs',p:'Somewhere online',u:'https://miku.fm/listen/miku/mp3-128',x:999.7}];
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
   '<div class="rrow"><button type="button" class="rbtn rarrow" data-d="-1" aria-label="Back">◀</button><div class="rname"><b></b><span></span><em></em></div><button type="button" class="rbtn rarrow" data-d="1" aria-label="Next">▶</button></div>'+
   '<div class="rpre">'+[1,2,3,4,5].map(k=>'<button type="button" class="rbtn" data-p="'+(k-1)+'" aria-label="Preset '+k+'">'+k+'</button>').join('')+'</div>';
  const tk=el.querySelector('.rticks');for(let i=0;i<WORLD.length;i++){const t=document.createElement('i');t.style.left=((i+.5)/WORLD.length*100)+'%';tk.appendChild(t)}
  el.addEventListener('pointerdown',e=>e.stopPropagation());el.addEventListener('click',e=>e.stopPropagation());
  el.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{sfx('tick');radioBand(b.dataset.b)});
  el.querySelector('.rpow').onclick=()=>{sfx('tick');if(radio.on)radioOff(true);else radioOn(true)};
  el.querySelector('.rx').onclick=()=>{sfx('tick');radioPanelClose()};
  el.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{sfx('tick');radioStep(+b.dataset.d)});
  el.querySelectorAll('[data-p]').forEach(b=>{let t0=0;b.addEventListener('pointerdown',()=>{t0=performance.now();b.classList.add('rhold')});
    b.addEventListener('pointerleave',()=>{t0=0;b.classList.remove('rhold')});
    b.addEventListener('pointerup',()=>{b.classList.remove('rhold');if(!t0)return;const held=performance.now()-t0>=PRESET_HOLD;t0=0;sfx('tick');if(held)presetSave(+b.dataset.p);else presetGo(+b.dataset.p)})});
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
  let left,top=RADIO.y*S-h-10;
  if(top>=48)left=clamp((RADIO.x+RADIO.w/2)*S-w/2,4,W*S-w-4); // room above the radio
  else{left=clamp(RADIO.x*S-w-10,4,W*S-w-4);top=clamp((RADIO.y+RADIO.h/2)*S-h/2,48,H*S-h-4)} // a short phone screen: beside it, so the radio stays tappable, below the corner buttons
  el.style.left=Math.round(left)+'px';el.style.top=Math.round(top)+'px'}
addEventListener('resize',()=>setTimeout(radioPanelPlace,60));
function radioPanelName(s,line){const el=radio.panel;if(!el)return;const b=el.querySelector('.rname b'),sp=el.querySelector('.rname span'),pl=el.querySelector('.rname em');
  if(s){b.textContent=s.n;sp.textContent=line||s.k;pl.textContent=s.p}else{b.textContent='· · ·';sp.textContent=line||'Static';pl.textContent=''}}
// what the panel shows now; msg replaces the second line for a moment (a record's title, No signal…)
function radioPanelShow(msg){const el=radio.panel;if(!el)return;
  el.querySelectorAll('[data-b]').forEach(b=>b.classList.toggle('on',b.dataset.b===radio.band));
  const pw=el.querySelector('.rpow');pw.textContent=radio.on?'ON':'OFF';pw.classList.toggle('on',radio.on);
  el.classList.toggle('rworld',radio.band==='world');el.classList.toggle('roff',!radio.on);
  el.querySelectorAll('[data-p]').forEach(b=>{const q=radio.pre[+b.dataset.p];b.classList.toggle('on',!!q&&radio.on&&presetIs(q));b.classList.toggle('rempty',!q)});
  const nd=el.querySelector('.rneedle');if(!nd.classList.contains('rnow'))nd.style.left=((radio.wi+.5)/WORLD.length*100)+'%';
  if(msg==='…')return radioPanelName(null);
  if(!radio.on)return radioPanelName(null,'Off. Tap ON, or pick a band.');
  if(radio.band==='world')return radioPanelName(WORLD[radio.wi],msg);
  el.querySelector('.rname b').textContent='The Crates';el.querySelector('.rname span').textContent=msg||'Old 78s and your own songs';el.querySelector('.rname em').textContent=msg?'':'Sent from the sampler'}

/* ---------- five presets, like an old car radio (Jackie, Nov 16) ----------
   Tap a number to jump to the station kept on it; hold it (half a second or more) to keep the station you're on there.
   A preset remembers the station by name, so it still works when the dial gains or loses stations; CRATES can be kept too. */
const PRESET_HOLD=500;
function presetNow(){return radio.band==='world'?{band:'world',n:WORLD[radio.wi].n}:{band:'crates'}}
function presetIs(q){return q.band===radio.band&&(q.band==='crates'||(WORLD[radio.wi]&&q.n===WORLD[radio.wi].n))}
function presetSave(k){const q=presetNow();radio.pre[k]=q;radioKeep();radioPanelShow('Kept on '+(k+1)+'. Tap '+(k+1)+' to come back.');tell((q.band==='world'?q.n:'The Crates')+' is on preset '+(k+1)+'.',{kind:'info',key:'preset'+k})}
function presetGo(k){const q=radio.pre[k];
  if(!q){radioPanelShow('Nothing on '+(k+1)+' yet. Hold it to keep this station there.');return}
  if(q.band==='crates'){if(!radio.on)radio.band='crates',radioOn(true);else radioBand('crates');return}
  const i=WORLD.findIndex(w=>w.n===q.n);if(i<0){radioPanelShow('That station is no longer on the dial.');return}
  radio.band='world';if(!radio.on){radio.wi=i;radioOn(true)}else worldPlay(i);radioKeep();radioPanelShow()}
