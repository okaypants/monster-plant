'use strict';
/* THE MOVIE ROOM (Jackie, Nov 26: "a movie room where you can actually watch public domain films - like a home theater with a big
   screen you're facing"). A first version to try the screen: the room's picture (movieroom/room.png, tools/movieroom_build.py) lies
   over a film that plays behind its see-through screen. The curtains are closed until a film starts ("closed by default until you
   start watching"), draw open like the study room's, and close again when it ends. Everything you touch here is about watching.
   The film streams from the Internet Archive, so it needs a connection; it plays muted (the copy's music is not known to be free).
   You get here from the Leave button (below). */
const MV={W:1670,H:941,screen:{x:424,y:118,w:824,h:468},curtain:{x:366,y:98,w:940,h:504},step:260};
/* THE COLLECTION (Jackie, Nov 26: "a movie collection with reels, vhs, and bluray"). Shelves of films, each opened by tapping its things on the left-hand shelving; a shelf can hold more than one
   collection, shown as buttons at the top of its list. Every film is public domain in the United States (published before 1931) and its Internet
   Archive copy was confirmed to exist (research_notes/movieroom/channels.md). They are silent films and play muted. None has been
   watched all the way through yet, so this list is a first shelf, to be checked. id = the Archive's item, f = its file. */
const MV_SHELVES=[
 {id:'reel',name:'Trick films and fairy tales',about:'Trick films and fairy stories from the first years of cinema.',pic:'movieroom/acc_reel.png',at:[{x:112,y:400,w:66,h:76}],films:[
  {t:'A Trip to the Moon',by:'Georges Méliès, France, 1902',len:'11 min',id:'ATripToTheMoon20Fps',f:'TripToTheMoon20Fps_512kb.mp4'},
  {t:'The Impossible Voyage',by:'Georges Méliès, France, 1904',len:'20 min',id:'The_Impossible_Voyage',f:'The_Impossible_Voyage_512kb.mp4'},
  {t:'The Kingdom of the Fairies',by:'Georges Méliès, France, 1903',len:'17 min',id:'silent-le-royaume-des-fes-aka-the-kingdom-of-the-fairies',f:'Le royaume des fes AKA The Kingdom of the Fairies.mp4'},
  {t:'The Mermaid',by:'Georges Méliès, France, 1904',len:'4 min',id:'la-sirene-1904-georges-melies',f:'La Sirène - (1904) - Georges Méliès.ia.mp4'},
  {t:'The Electric Hotel',by:'Segundo de Chomón, 1908',len:'7 min',id:'silent-the-electric-hotel',f:'The Electric Hotel.mp4'},
  {t:'Alice in Wonderland',by:'Hepworth and Stow, Britain, 1903',len:'8 min',id:'Alice_in_Wonderland_1903',f:'Alice_in_Wonderland_1903_512kb.mp4'}]},
 {id:'vhs',name:'Early cartoons and puppets',about:'Early cartoons, cut paper and puppets from Japan, Russia, Germany, France and America.',pic:'movieroom/acc_vhs.png',at:[{x:178,y:380,w:124,h:96}],films:[
  {t:'The Dull Sword',by:'Jun’ichi Kōuchi, Japan, 1917',len:'4 min',id:'namakura-gatana-1917',f:'Namakura Gatana 1917 restoration.ia.mp4'},
  {t:'The Animal Olympics',by:'Yasuji Murata, Japan, 1928',len:'13 min',id:'dobutsu-olympic-taikai_1928',f:'dobutsu-olympic-taikai_1928.ia.mp4'},
  {t:'The Insects’ Christmas',by:'Ladislas Starevich, Russia, 1913',len:'7 min',id:'silent-rozhdestvo-obitateley-lesa-aka-the-insects-christmas',f:'Rozhdestvo obitateley lesa AKA The Insect\'s Christmas.mp4'},
  {t:'Cinderella',by:'Lotte Reiniger, Germany, 1922',len:'13 min',id:'silent-aschenputtel-aka-cinderella',f:'Aschenputtel AKA Cinderella.mp4'},
  {t:'Gertie the Dinosaur',by:'Winsor McCay, America, 1914',len:'12 min',id:'silent-gertie-the-dinosaur',f:'Gertie the Dinosaur.mp4'},
  {t:'Fantasmagorie',by:'Émile Cohl, France, 1908',len:'1 min',id:'silent-fantasmagorie-aka-a-fantasy',f:'Fantasmagorie AKA A Fantasy.mp4'}]},
 {id:'bluray',name:'Silent comedies',about:'Silent comedies.',pic:'movieroom/acc_bluray.png',at:[{x:304,y:380,w:64,h:96}],films:[
  {t:'One Week',by:'Buster Keaton, America, 1920',len:'25 min',id:'silent-one-week',f:'One Week.mp4'},
  {t:'The Scarecrow',by:'Buster Keaton, America, 1920',len:'18 min',id:'silent-the-scarecrow',f:'The Scarecrow.mp4'},
  {t:'The Boat',by:'Buster Keaton, America, 1921',len:'23 min',id:'silent-the-boat',f:'The Boat.mp4'},
  {t:'The Rink',by:'Charlie Chaplin, America, 1916',len:'24 min',id:'silent-the-rink',f:'The Rink.mp4'}]},
 {id:'swim',name:'Sea life',about:'Sea creatures, divers and plain waves, from 1900 to 1929.',pic:'movieroom/acc_reel.png',at:[{x:270,y:250,w:98,h:100}],films:[
  {t:'Hyas and Stenorhynchus',by:'Jean Painlevé, France, 1929',len:'10 min',id:'painleve-jean-hyas-et-stenorinques',f:'Painleve-Jean_Hyas-et-stenorinques.mp4'},
  {t:'The Pearl Fisher',by:'Pathé, France, 1907',len:'8 min',id:'silent-le-pcheur-de-perles-aka-the-pearl-fisher',f:'Le pcheur de perles AKA The Pearl Fisher.mp4'},
  {t:'Romance of Pearl Culture in Japan',by:'filmed in Ise, Japan, 1922',len:'10 min',id:'RomanceOfPearlCultureInJapan1922',f:'RomanceOfPearlCultureInJapan1922.mp4'},
  {t:'Sea Effects',by:'France, 1906',len:'2 min',id:'silent-effets-de-mer',f:'Effets de mer.mp4'},
  {t:'Rough Sea',by:'1900',len:'1 min',id:'silent-rough-sea',f:'Rough Sea.mp4'}]},
 {id:'small',name:'Flowers and insects',about:'Flowers, butterflies and insects, some real and some puppets.',pic:'movieroom/acc_reel.png',with:'swim',films:[
  {t:'Fruits and Flowers',by:'Gaumont, France, 1912, in early colour',len:'3 min',id:'1912-chronochrome-gaumont-flowers',f:'1912 Chronochrome Gaumont Flowers.ia.mp4'},
  {t:'The Ant and the Grasshopper',by:'Ladislas Starevich, Russia, about 1911',len:'5 min',id:'LadislasStarevichTheAntAndTheGrasshopper1911',f:'Ladislas Starevich - The Ant And The Grasshopper (1911).mp4'},
  {t:'The Beautiful Leukanida',by:'Ladislas Starevich, Russia, 1912',len:'9 min',id:'1912LadislasStarevichTheBeautifulLeukanida.3gp',f:'1912 Ladislas Starevich - The Beautiful Leukanida.mp4'},
  {t:'A Butterfly’s Metamorphosis',by:'Gaston Velle, France, 1904',len:'2 min',id:'silent-la-mtamorphose-du-papillon-aka-a-butterflys-metamorphosis',f:'La mtamorphose du papillon AKA A Butterfly\'s Metamorphosis.mp4'},
  {t:'The Tulips',by:'Segundo de Chomón, France, 1907',len:'4 min',id:'LesTulipes',f:'1907SegundoDeChomnLesTulipestheTulips.mp4'}]},
 {id:'colour',name:'Early colour films',about:'Films painted by hand, frame by frame, and the first tries at real colour.',pic:'movieroom/acc_reel.png',with:'reel',films:[
  {t:'Annabelle Butterfly Dance',by:'Edison, America, 1894',len:'1 min',id:'annabelle-butterfly-dance-1894',f:'Annabelle Butterfly Dance (1894).mp4'},
  {t:'Serpentine Dance by Mme Bob Walter',by:'Alice Guy, France, 1897',len:'2 min',id:'danse-serpentine-par-mme-bob-walter',f:'Danse serpentine par Mme Bob Walter.ia.mp4'},
  {t:'Creation of the Serpentine',by:'Segundo de Chomón, France, 1908',len:'5 min',id:'CrationDeLaSerpentine',f:'SegundoDeChomnCrationDeLaSerpentine1908CreationOfTheSerpentine_512kb.mp4'},
  {t:'Loie Fuller',by:'Pathé, France, 1902',len:'2 min',id:'silent-loie-fuller',f:'Loie Fuller.mp4'},
  {t:'A Trip to Jupiter',by:'Segundo de Chomón, France, 1909',len:'8 min',id:'silent-le-voyage-sur-jupiter-aka-a-trip-to-jupiter',f:'Le voyage sur Jupiter AKA A Trip to Jupiter.mp4'},
  {t:'Venice, Queen of the Adriatic',by:'Gaumont, France, 1912, in early colour',len:'8 min',id:'1912-chronochrome-gaumont-venice',f:'1912 Chronochrome Gaumont Venice.ia.mp4'}]}];
const MV_REMOTE={x:1326,y:380,w:54,h:96};
const mvSrc=f=>f.src?(f.loop&&/noaa\.gov/.test(f.src)?f.src+'?t='+Math.floor(Date.now()/12e5):f.src)/* only the satellite loops are asked for afresh; the Internet Archive refuses a file's address with anything added to it, which is why the television channels said they could not start */:'https://archive.org/download/'+encodeURIComponent(f.id)+'/'+encodeURIComponent(f.f); // a live loop is asked for afresh every twenty minutes
let mvFilm=null; /* nothing is on until you choose (Jackie, Nov 27: "when the screen opens by tapping IT shouldn't automatically play anything it should be black until you select") */
let mvEl=null,mvState='closed',mvTimer=0;
function movieRoomOpen(){return !!(mvEl&&mvEl.isConnected);}
function mvPct(b){return 'left:'+(b.x/MV.W*100)+'%;top:'+(b.y/MV.H*100)+'%;width:'+(b.w/MV.W*100)+'%;height:'+(b.h/MV.H*100)+'%';}
/* The curtains draw like the study room's (Jackie, Nov 27: "Should we have the curtains animated like in the plant room?"): the picture of
   the closed curtains is uncovered from each side toward the middle in twelve whole steps, and covered again the same way to
   open. k is how far shut they are, 0 to 1. While they move the state is 'half'. */
const MV_SWEEP=12,MV_SWEEP_MS=36;
function mvCurtainK(k){if(!mvEl)return;const p=100-k*50,L=mvEl.querySelector('.mvcurtL'),R=mvEl.querySelector('.mvcurtR');L.style.clipPath='inset(0 '+p+'% 0 0)';R.style.clipPath='inset(0 0 0 '+p+'%)';L.hidden=R.hidden=k<=0;mvEl.dataset.k=k;}
function mvSet(s){mvState=s;if(!mvEl)return;mvEl.dataset.state=s;if(s==='closed')mvCurtainK(1);else if(s==='open')mvCurtainK(0);
 const w=mvEl.querySelector('.mvseats');if(w&&w.hidden){mvSeats();w.hidden=false;}mvLightApply();} // the monsters sit down as soon as you come in
let mvSweepT=[];function mvCurtains(open,then){mvSweepT.forEach(clearTimeout);mvSweepT=[];clearTimeout(mvTimer);mvSet('half');for(let i=1;i<=MV_SWEEP;i++)mvSweepT.push(setTimeout(()=>{mvCurtainK(open?1-i/MV_SWEEP:i/MV_SWEEP);if(i===MV_SWEEP){mvSet(open?'open':'closed');if(then)then();}},i*MV_SWEEP_MS));} // every step is set at once, so they keep their order however time is stepped
/* word of trouble goes away by itself after eight seconds, and at once when a picture starts playing; it never stays up */
let mvTroubleOn=false;function mvTrouble(t){mvNote(t,true);mvTroubleOn=true;clearTimeout(mvNoteT);mvNoteT=setTimeout(mvTroubleOver,8000);}function mvTroubleOver(){if(!mvTroubleOn)return;mvTroubleOn=false;mvNote('');}
let mvNoteT=0;function mvNote(t,stay){const n=mvEl&&mvEl.querySelector('.mvnote');if(!n)return;clearTimeout(mvNoteT);mvTroubleOn=false;n.textContent=t||'';n.hidden=!t;if(t&&!stay)mvNoteT=setTimeout(()=>{n.hidden=true;},5000);} // a film's name shows for a few seconds; trouble stays
/* Jackie, Nov 27: "you can open the curtains but I think you should be able to close them too by clicking the screen and only
   control playback with the remote". A tap on the curtains or the screen opens or closes the curtains and nothing else; closing
   them pauses the film where it is. The remote starts and pauses the film, and opens the curtains first if they are closed. */
function mvLoad(){const v=mvEl.querySelector('video'),f=mvFilm,src=mvSrc(f);if(v.dataset.film!==src){v.src=src;v.dataset.film=src;}
 if(mvSeekTo>0){const t=mvSeekTo,go=()=>{try{v.currentTime=Math.min(t,Math.max(0,(v.duration||t)-3));}catch(e){}};mvSeekTo=0;if(v.readyState>=1)go();else v.addEventListener('loadedmetadata',go,{once:true});} // a channel is joined part-way through
 v.loop=!!f.loop;if(mvMode==='mine'&&!mvHasScore(f))mvMode='film';v.muted=mvMode!=='film'||!!f.mute;return v;}
let mvBegun=null; // the film or channel item that has been started since the room was opened
function mvStart(){const v=mvLoad(),p=v.play();mvBegun=mvFilm;mvCardShow();mvEl.dataset.paused='';mvLightApply();if(p&&p.catch)p.catch(e=>{if(e&&e.name==='AbortError')return;mvTrouble('The film could not start. It needs a connection.');});} /* starting something else before the last thing had begun also ends up here, as an AbortError, which is no trouble at all: it used to put the message up and leave it there (Jackie, Nov 27: "sometimes a 'the film could not start it needs a connection' gets stuck on screen i hate it") */
function mvScreen(){if(!mvEl||mvState==='half')return;if(mvInterEnd())return;const v=mvEl.querySelector('video');sfx('paper');
 if(mvState==='closed'){if(mvFilm&&mvBegun===mvFilm){mvLoad();mvCurtains(true,mvStart);}else{mvEl.dataset.paused=v.paused?'1':'';mvCurtains(true);}} /* opening the curtains on something already chosen starts it playing again from where it stopped (Jackie, Nov 27: "make the video automatically start playing again when you reopen the curtain in a single session without having to press play again"); only something that has already been playing since you came in does this; otherwise the curtains open on a still or black screen, as before */
 else{v.pause();mvEl.dataset.paused='1';mvCurtains(false);}}
function mvPlay(){if(!mvEl||mvState==='half')return;if(mvInterEnd())return;const v=mvEl.querySelector('video'),f=mvFilm;
 if(!f){mvPick();mvNote('Choose something to watch.');return;}
 if(mvState==='closed'){mvNote(f.chan!=null?'':f.t+', '+f.by); /* a channel says what it is on the screen itself, so the cream note stays away and does not cover it */sfx('paper');mvLoad();mvCurtains(true,mvStart);return;}
 if(v.paused)mvStart();else{v.pause();mvEl.dataset.paused='1';mvLightApply();}}
function mvEnd(){if(!mvEl||mvState==='closed'||!mvFilm)return;if(mvChan&&!mvChan.live){mvTune(mvChan,true);return;} /* on a channel something else simply begins, from its start */if(!mvFilm.loop&&mvFilm.f)mvSeenAdd(mvFilm);const v=mvEl.querySelector('video');v.pause();mvEl.dataset.paused='';mvCurtains(false,()=>{try{v.currentTime=0;}catch(e){}mvNote('');});}
/* THE WATCHERS (Jackie, Nov 26: "when they sit down to watch, you see them from the backside a little bit kind of like MST3K").
   While the curtains are open, the monsters sit on the couch as dark shapes against the screen, their lower halves
   hidden behind the couch back (Jackie, later the same day: "Maybe it's just your monster(s)"; the cat has its own places, below). A dark shape from behind is the same as from the front, so each monster's own picture is used,
   filled in dark. They are drawn once when the film starts. */
const MV_SEAT={top:697,dark:'#0a060d',xs:[835,560,1110],show:.66,box:{teen:[125,170],adult:[170,230]}}; /* seats well apart, and each monster at its own size: a teenager is smaller than a grown one. Kids and younger stay in the study room (Jackie, Nov 27: "the monsters should be seated a bit further apart and should be relative to their actual sizes, although babies can't go") */ // small enough that only the tops of their heads reach the screen (Jackie, Nov 27: "the plant needs to be smaller so the screen is less obscured")
function mvShadow(src,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(src,0,0,w,h);x.globalCompositeOperation='source-in';x.fillStyle=MV_SEAT.dark;x.fillRect(0,0,w,h);return c;}
let mvWho=[]; // who is on the couch: {id, name, x (seat), pic (dark shape), hop (pixels up, for a moment)}
function mvSeats(){const c=mvEl&&mvEl.querySelector('.mvseats');if(!c)return;const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);
 if(!mvWho.length&&st.started)for(const p of allRaw()){if(p.stage==null||p.stage<6||mvWho.length>=MV_SEAT.xs.length)continue; // seeds, sprouts and kids stay in the study room
  let pic=null;const bx=MV_SEAT.box[p.stage>=8?'adult':'teen'];try{pic=plantPortrait(p.id,bx[0],bx[1]);}catch(e){}if(pic&&pic.width>1)mvWho.push({id:p.id,name:p.name||'The monster',ge:p.ge||0,lc:p.lc||0,x:MV_SEAT.xs[mvWho.length],pic:mvShadow(pic,pic.width,pic.height),hop:0});}
 for(const w of mvWho)x.drawImage(w.pic,Math.round(w.x-w.pic.width/2),Math.round(MV_SEAT.top-w.pic.height*MV_SEAT.show)-w.hop);
 c.dataset.n=mvWho.length;}
function mvHop(w,n=2){let k=0;const up=()=>{w.hop=6;mvSeats();setTimeout(()=>{w.hop=0;mvSeats();if(++k<n)setTimeout(up,130);},130);};up();} // a happy hop: six pixels up and down again, whole pixels
/* THE CAT IN THE MOVIE ROOM (Jackie, Nov 26: "The cat can come in that room and sleep and interact on the floor or in the back of
   the couch", "On the back"). Each time you come in, the cat is asleep in one of three places: along the top of the couch back, or
   on the floor at either end of the rug. A tap wakes it and it sits up; a tap while it sits is a pet (its two petted poses, swapped);
   left alone for a while it goes back to sleep. Its own pictures, swapped whole; it is not a dark shape. */
const MV_CAT_SPOTS=[{x:1000,y:702,k:.44,sleep:['loaf2','curl1']},{x:205,y:912,k:.62,sleep:['curl1','side1']},{x:1475,y:912,k:.62,sleep:['curl1','loaf2']}],MV_CAT_NAP=12000;
let mvCat=null,mvCatT=0;
function mvCatShow(name){const im=mvEl&&mvEl.querySelector('.mvcat'),f=typeof CATF!=='undefined'&&CATF[name];if(!im||!f||!mvCat)return;
 const put=()=>{const w=f.naturalWidth*mvCat.k,h=f.naturalHeight*mvCat.k;im.src=f.src;im.dataset.pose=name;im.style.cssText='left:'+((mvCat.x-w/2)/MV.W*100)+'%;top:'+((mvCat.y-h)/MV.H*100)+'%;width:'+(w/MV.W*100)+'%;height:'+(h/MV.H*100)+'%';im.hidden=false;};
 if(ok(f))put();else f.addEventListener('load',put,{once:true});}
function mvCatSleep(){if(!mvCat)return;mvCat.awake=false;mvCatShow(mvCat.nap);}
function mvCatTap(){if(!mvCat)return;clearTimeout(mvCatT);sfx('tick');
 if(!mvCat.awake){mvCat.awake=true;mvCatShow('sit1');}
 else{mvCatShow('pet1');setTimeout(()=>{if(mvCat&&mvCat.awake)mvCatShow('pet2');},260);setTimeout(()=>{if(mvCat&&mvCat.awake)mvCatShow('sit2');},700);}
 mvCatT=setTimeout(mvCatSleep,MV_CAT_NAP);}
function mvCatEnter(){if(!st.started){mvCat=null;return;}const sp=MV_CAT_SPOTS[Math.floor(Math.random()*MV_CAT_SPOTS.length)];mvCat={...sp,nap:sp.sleep[Math.floor(Math.random()*sp.sleep.length)],awake:false};mvCatSleep();}
/* SOUND AND LIGHTS (Jackie, Nov 27: "Maybe the far right gold knob can control lighting (I'd like to be able to turn the room way down
   during a movie) and the receiver can do audio"). The receiver on the right-hand shelf turns the film's sound off and on; sound
   starts on ("I want sound on movies etc if available"). The music on these copies was added by whoever uploaded them and is not
   known to be free to use; she chose sound knowing that.
   The gold knob on the wall steps the room's light down: up, low, lower, nearly out, and round to up again. While a film is
   playing the room is never brighter than low, as before. Everything but the screen dims: the room, the curtains, the cat and
   what is on the couch. Light may blend (RULES), so this is a plain darkening. */
/* The knob is the room's own picture at every setting (Jackie, Nov 27: "the lights on and lights off switches are dif tho": with the lights up it had been covered by a differently drawn knob from the accessories sheet). A small dark mark on its dial shows the setting: at the top for up, then round to the right, the bottom and the left as the lights go down. */
const MV_KNOB_C={x:1624,y:323},MV_KNOB_AT=[[0,-13],[13,0],[0,13],[-13,0]];
const MV_KNOB={x:1592,y:290,w:64,h:68},MV_KNOB_TAP={x:1566,y:272,w:104,h:108},MV_LAMPS=[{x:0,y:112,w:100,h:170},{x:1570,y:112,w:100,h:158}], /* the knob's picture is small, and on a phone it was about a quarter of an inch across: too small to hit reliably (Jackie, Nov 27: "the light switch still isnt working"). Its tap area is now well over twice the size, and a tap on either wall lamp does the same thing. */MV_LIGHTS=[1,.62,.34,.14],MV_LIGHT_SAY=['Lights up.','Lights low.','Lights lower.','Lights nearly out.'];let mvSound=true,mvLight=0;
function mvSoundSet(on){mvSound=!!on;if(!on)mvMode='off';else if(mvMode==='off')mvMode='film';mvSoundApply();}
function mvLightApply(){if(!mvEl)return;const v=mvEl.querySelector('video'),playing=mvState==='open'&&mvEl.dataset.paused!=='1'&&v&&v.getAttribute('src');
 const lv=playing?Math.max(mvLight,1):mvLight;mvEl.style.setProperty('--mvb',MV_LIGHTS[lv]);mvEl.dataset.light=lv;{const t=mvEl.querySelector('.mvknobtick'),p=MV_KNOB_AT[mvLight];t.style.cssText=mvPct({x:MV_KNOB_C.x+p[0]-4,y:MV_KNOB_C.y+p[1]-4,w:8,h:8});}mvEl.querySelectorAll('.mvsconce').forEach(e=>{e.hidden=lv!==0;});} // the wall lamps are lit only while the lights are right up; in the base picture they are off
function mvLightStep(){mvLight=(mvLight+1)%MV_LIGHTS.length;sfx('tick');mvLightApply();mvNote(MV_LIGHT_SAY[mvLight]);}
/* THE KALIMBASIZER (Jackie, Nov 27: "I think I'd like to replace the books with the kalimbasizer, where it has the option to track old
   public domain silents and shorts", "i mean the lotr boxset not the books", "I do like a monster-plant custom version of
   kalimbasizer"). Her kalimba instrument, in the game's own copy (kalimba.html), opens from the box set's place on the bottom right
   shelf, over the room, as the sampler does in the study room. In it you choose a film and SCORE IT: the film and the recorder
   start together, and what you play is kept on this device as that film's soundtrack (js/scores.js).
   The receiver then has three settings where a film has one: the film's own sound, your soundtrack, and off. Your soundtrack
   plays in step with the film: it starts, pauses and stops with it. */
let kalEl=null,mvScores=new Set(),mvMode='film',mvScoreP=null,mvScoreKey='';
function mvScoresLoad(){return scoreKeys().then(k=>{mvScores=new Set(k);});}
let mvScorePick=''; /* which soundtrack to play for a film that has more than one (yours, and others added from files): the one chosen in Your films, else your own, else the first there is */
function mvScoreFor(f){if(!f)return '';const fk=scoreKey(f);if(mvScorePick&&scoreFilmKey(mvScorePick)===fk&&mvScores.has(mvScorePick))return mvScorePick;if(mvScores.has(fk))return fk;for(const k of mvScores)if(scoreFilmKey(k)===fk)return k;return '';}
function mvHasScore(f){return !!mvScoreFor(f);}
function mvScoreStop(){if(mvScoreP)mvScoreP.stop();}
/* A soundtrack is a set of parts on the film's timeline (js/scores.js); the player sounds whichever belong to the moment. It is
   asked again each time the film reports its place, so parts start and stop as the film reaches them. */
function mvScoreTick(){if(!mvEl||!mvScoreP||mvMode!=='mine')return;const v=mvEl.querySelector('video');mvScoreP.sync(v.currentTime,!v.paused&&mvState==='open');}
function mvSoundApply(){if(!mvEl)return;const v=mvEl.querySelector('video'),mine=mvMode==='mine'&&mvHasScore(mvFilm);v.muted=mvMode!=='film'||!!(mvFilm&&mvFilm.mute);mvSound=mvMode!=='off';
 if(!mine){mvScoreStop();return;}
 const k=mvScoreFor(mvFilm);if(mvScoreKey===k&&mvScoreP){mvScoreTick();return;}
 mvScoreStop();scoreGetKey(k).then(t=>{if(!t||!mvEl||mvScoreFor(mvFilm)!==k)return;if(mvScoreP)mvScoreP.free();mvScoreP=scorePlayer(t);mvScoreKey=k;mvScoreTick();});}
function mvSoundStep(){const L=mvHasScore(mvFilm)?['film','mine','off']:['film','off'];mvMode=L[(L.indexOf(mvMode)+1)%L.length]||'film';sfx('tick');mvSoundApply();mvNote(mvMode==='film'?'The film’s own sound.':mvMode==='mine'?'Your soundtrack.':'Sound off.');}
function mvKalimbaFilms(){return MV_SHELVES.filter(q=>!q.talk).concat(MV_MORE);} function mvKalimbaSrc(f){return mvSrc(f);} // what the Kalimbasizer's page asks this one for (a page can call another page's functions, not read its constants)
function kalimbaOpen(){return !!(kalEl&&kalEl.isConnected);}
function openKalimba(){if(kalEl||!mvEl)return;mvTrayClose();const v=mvEl.querySelector('video');if(!v.paused){v.pause();mvEl.dataset.paused='1';mvLightApply();}mvScoreStop();
 if(typeof radioHold==='function')radioHold(true);kalEl=document.createElement('div');kalEl.className='screen sampler kalimba';
 const f=document.createElement('iframe');f.src='kalimba.html?v='+encodeURIComponent(window.MP_VERSION||'')+'&film='+encodeURIComponent(mvFilm&&mvFilm.f?mvFilm.id:''); /* the version is in the address so a phone fetches the instrument afresh after every update (Jackie, Nov 27: "kalimba score is still the same": its page was the one thing not tied to the version, so phones kept an old copy) */f.title='Kalimba-Score';f.setAttribute('allow','autoplay');kalEl.appendChild(document.createElement('i'));kalEl.appendChild(document.createElement('i'));kalEl.appendChild(f);document.body.appendChild(kalEl);document.documentElement.classList.add('kal-open');kalFit();} /* it covers the whole screen, whichever way the phone is held, and while it is open the "turn your phone sideways" screen stays away: it is played upright, for the thumbs (Jackie, Nov 27: "I think we need to switch kalimba-score to a vertical for thumb comfort") */
/* A phone turned from sideways to upright while the game is on its home screen can go on reporting the old, shorter height, which
   left a dark strip under the instrument. So the instrument's ground is sized from the screen itself there, and again whenever
   the phone turns. In a browser tab, where the screen is taller than the page, the page's own height is used. */
function kalFit(){if(!kalEl)return;const alone=navigator.standalone===true||(window.matchMedia&&(matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches));
 let top=0;{const p=document.createElement('div');p.style.cssText='position:fixed;left:0;top:0;width:0;height:env(safe-area-inset-top,0px);visibility:hidden';document.body.appendChild(p);top=p.getBoundingClientRect().height||0;p.remove();}
 const vh=Math.max(innerHeight,document.documentElement.clientHeight,(window.visualViewport&&visualViewport.height)||0),full=Math.max(screen.width,screen.height),up=window.matchMedia&&matchMedia('(orientation: portrait)').matches;
 kalEl.style.height=(alone&&up?Math.min(vh+top,full):vh)+'px';kalEl.style.bottom='auto';} // from the home screen, upright, the page reports itself shorter than the screen by the clock bar: that much is added back, never past the screen's own height
['resize','orientationchange'].forEach(ev=>addEventListener(ev,()=>{kalFit();setTimeout(kalFit,350);}));
function closeKalimba(){if(!kalEl)return;kalEl.remove();kalEl=null;document.documentElement.classList.remove('kal-open');if(typeof radioHold==='function')radioHold(false);mvScoresLoad();}
addEventListener('message',e=>{if(!kalEl||e.source!==kalEl.querySelector('iframe').contentWindow)return;if(e.data==='mp-kalimba-close')closeKalimba();else if(e.data==='mp-kalimba-score'){mvScoreStop();mvScoreKey='';mvScoresLoad();}});
/* THE REMOTE (Jackie, Nov 27: "the remote can maybe change to a streaming live tv that you find", then "Let's build the remote"). It
   opens a small panel: start or pause what is on the screen, and Live, a short list of live pictures from public bodies.
   Two kinds (research_notes/movieroom/live_streams.md):
   - the weather satellites' pictures, which are plain public-domain video files that NOAA renews every few minutes. They play on
     the room's own screen like a film, round and round, and are fetched afresh every twenty minutes;
   - NASA's and the Geological Survey's live cameras, which are public domain but are only given out through YouTube's player.
     YouTube does not allow anything to be drawn over its player, or the player to be small, so these open as a close-up of the
     screen: the player alone, large, with nothing of the room in front of it. Their addresses change whenever the owner restarts
     a stream, so they are kept together here to be corrected. */
const MV_LIVE=[
 {id:'goes-pnw',t:'The Pacific Northwest from space',by:'NOAA weather satellite, the last few hours',src:'https://cdn.star.nesdis.noaa.gov/GOES18/ABI/SECTOR/pnw/GEOCOLOR/GOES18-PNW-GEOCOLOR-600x600.mp4',loop:true},
 {id:'goes-usa',t:'North America from space',by:'NOAA weather satellite, the last few hours',src:'https://cdn.star.nesdis.noaa.gov/GOES19/ABI/CONUS/GEOCOLOR/GOES19-CONUS-GEOCOLOR-625x375.mp4',loop:true},
 /* Old television that plays in the room's own screen as it is (Jackie, Nov 27: "remove the youtube ones from the TV and instead find
    live feeds that will just play in the room as is if possible otherwise find tv shows or something you can put in there";
    "something that seems tv like i guess as long as it's kind of good"). Each is a file on the Internet Archive marked public
    domain there (the test card is under a Creative Commons attribution licence), checked on Nov 27 to answer as a video. */
 {id:'tv-test',t:'Test card',by:'Television test patterns, 1950s · Internet Archive',src:'https://archive.org/download/IMB_SF_R30_C9/IMB_SF_R30_C9_512kb.mp4',loop:true},
 {id:'tv-egg',t:'The Crystal Egg',by:'Tales of Tomorrow, 1951 · science fiction',src:'https://archive.org/download/tales_of_tomorrow_09_the_crystal_egg/tales_of_tomorrow_9_the_crystal_egg.mp4'},
 {id:'tv-holmes',t:'The Case of the Haunted Gainsborough',by:'Sherlock Holmes, 1954 · mystery',src:'https://archive.org/download/SherlockHolmes1954/Sherlock%20Holmes%2035%20The%20Case%20of%20the%20Haunted%20Gainsborough.mp4'},
 {id:'tv-zro',t:'Leonardo da Vinci',by:'Captain Z-Ro, 1956 · a time machine show for children',src:'https://archive.org/download/CaptainZ-Ro/Ep23-560520LeonardoDaVinci.mp4'},
 {id:'tv-burns',t:'The Kleebob Card Game',by:'Burns and Allen, 1950 · comedy',src:'https://archive.org/download/pdburnsallen/S01e01TheKleebobCardGame.mp4'},
 {id:'tv-bet',t:'You Bet Your Life',by:'Groucho Marx, 1950s · quiz show',src:'https://archive.org/download/You_Bet_Your_Life_Groucho/You_Bet_Your_Life_Groucho_Marx.ia.mp4'}];
/* The live cameras that were here (NASA's and the Geological Survey's) are only given out through YouTube's player, which had to
   open as a close-up; they were taken off. What follows is how that close-up worked, kept in case a camera comes back. */
/* A live camera on the room's own screen (Jackie, Nov 27: "Can you not figure out a way to kind of incorporate the youtube ones into
   the screen w/o a popup?"). YouTube's rules stand: its player may not be smaller than 200 pixels either way, and nothing may be
   drawn over it. On a phone the room's screen is smaller than that. So the room leans in: the curtains open, the whole room is
   enlarged about the middle of its screen until the screen nearly fills the view, and the player is set exactly in the screen at
   its real size, with nothing over it (the monsters' heads fall just below it). Back steps the room out again. */
const MV_TV={x:500,y:164,w:670,h:377}; // the largest 16:9 that is clear of the curtains, in the room's own pixels
let mvTvEl=null;
function mvTvClose(){if(!mvTvEl)return;mvTvEl.remove();mvTvEl=null;const st2=mvEl&&mvEl.querySelector('.mvstage');if(st2){st2.style.transform='translateY(-50%)';st2.style.transformOrigin='';}if(mvEl)delete mvEl.dataset.tv;}
function mvTvPlace(){if(!mvTvEl||!mvEl)return;const st2=mvEl.querySelector('.mvstage'),H=mvEl.getBoundingClientRect(),k=H.width/MV.W,sh=MV.H*k; // k: screen pixels to one room pixel before leaning in
 const f=Math.max(1,Math.min(H.width*.94/(MV_TV.w*k),H.height*.86/(MV_TV.h*k))),cx=(MV_TV.x+MV_TV.w/2)*k,cy=(MV_TV.y+MV_TV.h/2)*k,top0=H.height/2-sh/2;
 st2.style.transformOrigin=cx+'px '+cy+'px';st2.style.transform='translate('+(H.width/2-cx)+'px,'+(H.height/2-(top0+cy))+'px) translateY(-50%) scale('+f+')';
 const w=Math.max(200,MV_TV.w*k*f),h=Math.max(200,MV_TV.h*k*f);mvTvEl.style.cssText='left:'+(H.width/2-w/2)+'px;top:'+(H.height/2-h/2)+'px;width:'+w+'px;height:'+h+'px';}
function mvTv(ch){mvTrayClose();mvTvClose();const v=mvEl.querySelector('video');if(!v.paused){v.pause();mvEl.dataset.paused='1';mvLightApply();}mvScoreStop();
 const show=()=>{if(!mvEl)return;mvTvEl=document.createElement('div');mvTvEl.className='mvtv';mvTvEl.innerHTML='<iframe title="" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><button type="button" class="mvrbtn mvtvx">Back</button>';
  const f=mvTvEl.querySelector('iframe');f.title=ch.t;f.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(ch.yt)+'?autoplay=1&playsinline=1&rel=0';mvTvEl.querySelector('.mvtvx').onclick=mvTvClose;mvEl.appendChild(mvTvEl);mvEl.dataset.tv='1';mvTvPlace();mvNote('');sfx('tick');};
 if(mvState==='closed')mvCurtains(true,show);else show();}
addEventListener('resize',()=>mvTvPlace());
function mvLiveOn(ch){if(ch.yt){mvTv(ch);return;}mvChoose(ch);} // a satellite loop is shown like a film
/* THE REMOTE AND THE CHANNELS (Jackie, Nov 27: "i'd like it to be more like a real one ... pull a lot more random videos to turn into
   playlists for channels as well as actual channels that we can do an up down button to randomly tune into and maybe an onscreen
   tv guide ... and then we could have the film library button as well ... play pause forward rewind etc would be for the active
   title so it would have to be on the side i guess so most of the screen is visible"; "maybe there's an onscreen tv guide and
   then you have to type in a specific number on the remote like a channel to get there").
   A CHANNEL is a number, a name and a playlist (movieroom/channels.json, made by tools/channels_build.py; the old television and
   the satellite loops are added here). Tuning to a channel lands on something from its playlist, a long film part-way through as on a real set, and when it ends
   something else begins (see mvChanPick).
   THE REMOTE is a slim panel down the right of the room, so the screen stays in view. It has a number pad (type a channel's
   number), channel up and down, back ten seconds, play or pause, on ten seconds, GUIDE and the film library.
   THE GUIDE is drawn on the screen itself: every channel with its number, its name and what kind of thing it shows. A tap on a
   row tunes to it, or its number can be typed on the remote. */
let MV_MORE=[]; /* shelves of the film library made from the channels (Jackie, Nov 27: "don't forget to include titles there and in the film library", "as well as super super short films", "in both"): the very short first films, each to be watched from its start or scored */
let MV_CH=[],mvChan=null,mvSeekTo=0,mvRemEl=null,mvDigits='',mvDigitT=0,mvGuideT=0;
const MV_CH_OWN=[{n:4,add:[{src:MV_LIVE[3].src,t:'The Crystal Egg',y:'1951',d:1427},{src:MV_LIVE[4].src,t:'The Case of the Haunted Gainsborough',y:'1954',d:1600},{src:MV_LIVE[5].src,t:'Captain Z-Ro: Leonardo da Vinci',y:'1956',d:1587},{src:MV_LIVE[6].src,t:'Burns and Allen: The Kleebob Card Game',y:'1950',d:1766},{src:MV_LIVE[7].src,t:'You Bet Your Life',y:'1950s',d:1765}]}],
 MV_CH_LIVE=[{n:8,name:'The Northwest from Space',about:'A weather satellite, the last few hours',live:MV_LIVE[0]},{n:9,name:'North America from Space',about:'A weather satellite, the last few hours',live:MV_LIVE[1]},{n:10,name:'Test Card',about:'Nothing is on',live:MV_LIVE[2]}];
function mvChannelsSet(j){const L=((j&&j.channels)||[]).map(c=>({n:c.n,name:c.name,about:c.about,list:(c.list||[]).slice()}));for(const o of MV_CH_OWN){let c=L.find(q=>q.n===o.n);if(!c){c={n:o.n,name:'The Late Show',about:'Old television: drama, comedy and quiz',list:[]};L.push(c);}c.list=o.add.concat(c.list);}
 {const lenOf=d=>d<90?Math.round(d)+' sec':Math.round(d/60)+' min',mk=(c,it)=>({id:it.id||('tv:'+it.t),f:it.f,src:it.src,t:it.t,by:c.name+(it.y?', '+it.y:''),len:lenOf(it.d),d:it.d}),sh=L.find(c=>c.n===11),rest=L.filter(c=>c.n>0&&c.n!==11);MV_MORE=[];
  if(sh&&sh.list.length)MV_MORE.push({id:'short',name:'One-minute films',pic:'movieroom/acc_reel.png',about:'The very first films, a minute or less each.',films:sh.list.map(it=>mk(sh,it)).sort((a,b)=>a.d-b.d)});
  /* what the channels show stays on the channels (Jackie, Nov 27: "the channels should not be in the film archive tho"); only the one-minute films are also a shelf */}
 const ads=(L.find(c=>c.n===0)||{list:[]}).list; /* old commercials are programmed in between the films, two at a time, as a station would (Jackie, Nov 27: "old commercials programmed in") */
 for(const c of L){if(c.n===0||!ads.length)continue;const out=[];c.list.forEach((it,k)=>{out.push(it);for(let j=0;j<2;j++)out.push(Object.assign({ad:1},ads[(k*2+j+c.n*5)%ads.length]));});c.list=out;}
 MV_CH=L.filter(c=>c.n>0&&c.list.length).concat(MV_CH_LIVE).sort((a,b)=>a.n-b.n);}
/* THE LIBRARY'S SECOND HELPING (Jackie, Nov 27: "I want a much bigger film library", "including film and tv that have fallen into
   public domain before their time and other ephemera as good as what you've already found", "a larger quantity of viewing
   options"). movieroom/library.json, made and checked by tools/library_build.py, holds more collections: abstract films, Dada,
   city films, puppets and silhouettes, early records of far places, industrial films, odd sponsored films, colour cartoons,
   features and 1950s science fiction whose copyrights lapsed, and two long silents. They join the six collections above in the
   library's list. A film marked mute plays without its copy's sound (a modern score, or a record with its own term). Tonight's
   film is still drawn from the first six only, and Kalimba-Score is offered only the silent ones. */
function mvLibrarySet(j){if(!j||!Array.isArray(j.shelves))return;for(const sh of j.shelves){if(MV_SHELVES.some(q=>q.id===sh.id))continue;MV_SHELVES.push({id:sh.id,name:sh.name,about:sh.about,pic:'movieroom/acc_reel.png',extra:1,talk:sh.films.some(f=>!f.mute),films:sh.films});}}
fetch('movieroom/library.json').then(r=>r.ok?r.json():null).then(mvLibrarySet).catch(()=>{});
mvChannelsSet(null);fetch('movieroom/channels.json').then(r=>r.ok?r.json():null).then(j=>{if(j)mvChannelsSet(j);}).catch(()=>{});
/* what a channel is showing at a moment: {it, i, off (seconds in), left (seconds to go), next} */
function mvOnAir(ch,at){if(ch.live)return {it:{t:ch.about,d:0},off:0,left:0,next:null,live:true};const L=ch.list,tot=L.reduce((a,b)=>a+b.d,0);let p=((at===undefined?Date.now()/1000:at)+ch.n*977)%tot,i=0;while(p>=L[i].d){p-=L[i].d;i++;}return {it:L[i],i,off:p,left:L[i].d-p,next:L[(i+1)%L.length]};}
function mvChanFilm(ch,it){return ch.live?Object.assign({},ch.live,{chan:ch.n}):{id:it.id,f:it.f,src:it.src,t:it.t,by:'Channel '+ch.n+' · '+ch.name+(it.ad?' · a word from our sponsors':it.y?' · '+it.y:''),len:mvClock(it.d),chan:ch.n};}
function mvBanner(ch,title){const b=mvEl&&mvEl.querySelector('.mvchb');if(!b)return;b.innerHTML='<b></b><span></span>';b.querySelector('b').textContent=ch.n+'  '+ch.name;b.querySelector('span').textContent=title||'';b.hidden=false;clearTimeout(mvBanner.t);mvBanner.t=setTimeout(()=>{b.hidden=true;},4000);}
/* A channel lands on something different each time (Jackie, Nov 27: "i wish ... the channels started on random things when you
   switched back to them from the playlist of possibilities ... including commercials"). Tuning in picks any item of the channel's
   playlist, commercials among them, never the one just seen; a long one is joined part-way through, a short one or a commercial
   from its start. When it ends another is picked. (At first each channel followed the clock, so going back found the same film.)
   Where you come in is the channel's doing, not yours ("the viewer shouldn't be able to control where they catch it"): back and
   on do nothing on a channel. But a channel you have left is still showing the same thing for MV_CH_HOLD seconds, moved along by
   the time you were away, so you can go back and catch it ("if they leave the channel after watching, they should be able to
   catch it again for like 5 minutes"). She thought a further rule about having watched ten seconds "may be too convoluted", so
   there is only that rule, and one more she added: "if you watched for more than 5 minutes you should be allowed to pick up where
   you left off". So a channel watched for MV_CH_KEEP seconds or more keeps your exact place in what was on, however long you
   are away. */
const MV_CH_HOLD=300,MV_CH_KEEP=300;
function mvChanLeave(){const ch=mvChan;if(!ch||ch.live||!mvEl)return;const now=Date.now()/1000,v=mvEl.querySelector('video');ch.leftAt=now;if(ch.on&&ch.since&&now-ch.since>=MV_CH_KEEP)ch.resume={it:ch.on.it,pos:v.currentTime||0};}
function mvChanPick(ch,fromStart){if(ch.live)return {it:{t:ch.about,d:0},off:0};const now=Date.now()/1000;
 if(!fromStart&&ch.resume){const r=ch.resume;ch.resume=null;if(r.pos<r.it.d-3){ch.on={it:r.it,t0:now-r.pos};return {it:r.it,off:r.pos};}} // watched five minutes or more before leaving: it picks up exactly where you left it
 if(!fromStart&&ch.on&&ch.leftAt&&now-ch.leftAt<MV_CH_HOLD){const pos=now-ch.on.t0;if(pos<ch.on.it.d-3)return {it:ch.on.it,off:pos};} // back within five minutes: the same thing is still on, further along by the time away
 const L=ch.list;let i=Math.floor(Math.random()*L.length);if(L.length>1&&ch.on&&L[i]===ch.on.it)i=(i+1+Math.floor(Math.random()*(L.length-1)))%L.length;const it=L[i],off=fromStart||it.ad||it.d<200?0:Math.floor(Math.random()*it.d*.7);ch.on={it,t0:now-off};return {it,off};}
function mvTune(ch,fromStart){if(!mvEl||!ch)return;if(mvChan&&mvChan!==ch)mvChanLeave();if(mvChan!==ch||!ch.since)ch.since=Date.now()/1000;ch.leftAt=0;mvChan=ch;const a=mvChanPick(ch,fromStart),f=mvChanFilm(ch,a.it);mvSeekTo=a.off;mvRemShow();mvGuideClose();if(!fromStart)sfx('tick'); /* no click when one thing follows another on a channel, only when you change it yourself (Jackie, Nov 27: "no click between segments in channels") */
 if(mvState==='open'&&!mvInter){mvFilm=f;mvEl.dataset.paused='';if(mvMode==='mine')mvMode='film';mvStart();mvBanner(ch,ch.live?ch.about:a.it.t);mvNote('');}
 else{mvChoose(f);mvChan=ch;setTimeout(()=>mvBanner(ch,ch.live?ch.about:a.it.t),900);}}
function mvTuneBy(d){if(!MV_CH.length)return;const i=mvChan?MV_CH.indexOf(mvChan):(d>0?-1:0);mvTune(MV_CH[((i+d)%MV_CH.length+MV_CH.length)%MV_CH.length]);}
function mvDigit(k){mvDigits=(mvDigits+k).slice(-2);mvRemShow();sfx('tick');clearTimeout(mvDigitT);mvDigitT=setTimeout(()=>{const n=+mvDigits;mvDigits='';const ch=MV_CH.find(c=>c.n===n);if(ch)mvTune(ch);else{mvNote('Nothing is on channel '+n+'.');mvRemShow();}},mvDigits.length>=2?350:1300);}
/* REWIND AND FAST FORWARD (Jackie, Nov 27: "change the >> button and << button to fast forward and rewind not next", "but only for
   films not tv"). The two keys used to jump ten seconds. Now a press starts the film running back or on at about eight times
   its speed, in steps, with the picture showing as it goes; the same key again, or play, watches from there. It stops by itself
   at either end. A channel cannot be wound, as before. */
let mvScanT=0,mvScanDir=0;const MV_SCAN_MS=250,MV_SCAN_STEP=2;
function mvScanStop(play){if(!mvScanT)return false;clearInterval(mvScanT);mvScanT=0;mvScanDir=0;const v=mvEl&&mvEl.querySelector('video');if(v&&play!==false&&mvState==='open')v.play().catch(()=>{});mvNote('');mvRemShow();return true;}
function mvScan(dir){if(!mvEl||!mvFilm||mvState!=='open')return;if(mvChan){mvNote('A channel can’t be wound back or on.');sfx('tick');return;}const v=mvEl.querySelector('video');if(mvScanDir===dir){mvScanStop();return;}mvScanStop(false);
 mvScanDir=dir;v.pause();sfx('tick');mvNote(dir>0?'Fast forward. Press it again, or play, to watch from here.':'Rewinding. Press it again, or play, to watch from here.');
 mvScanT=setInterval(()=>{if(!mvEl||!mvEl.isConnected||mvState!=='open'){mvScanStop(false);return;}const d=v.duration||0,t=v.currentTime+dir*MV_SCAN_STEP;if(t<=0||(d&&t>=d-1)){try{v.currentTime=Math.max(0,d?Math.min(d-1,t):t);}catch(e){}mvScanStop();return;}try{v.currentTime=t;}catch(e){}},MV_SCAN_MS);mvRemShow();}
function mvSkip(d){if(!mvEl||!mvFilm||mvState!=='open')return;if(mvChan){mvNote('A channel can’t be wound back or on.');sfx('tick');return;}const v=mvEl.querySelector('video');try{v.currentTime=Math.max(0,Math.min((v.duration||1e9)-1,v.currentTime+d));}catch(e){}sfx('tick');}
function mvRemShow(){if(!mvRemEl)return;{const bk=mvRemEl.querySelector('[data-a=back]'),fw=mvRemEl.querySelector('[data-a=fwd]');if(bk)bk.classList.toggle('on',mvScanDir<0);if(fw)fw.classList.toggle('on',mvScanDir>0);}{const on=mvState!=='closed'&&mvFilm,tv=mvRemEl.querySelector('[data-a=tv]'),fm=mvRemEl.querySelector('[data-a=film]');if(tv)tv.classList.toggle('on',!!(on&&mvChan));if(fm)fm.classList.toggle('on',!!(on&&!mvChan));}const v=mvEl.querySelector('video'),on=mvState==='open'&&!v.paused,d=mvRemEl.querySelector('.mvremd');
 d.textContent=mvDigits?'CH '+mvDigits+'_':mvChan?'CH '+mvChan.n+' · '+mvChan.name:mvFilm?mvFilm.t:'Nothing on';mvRemEl.querySelector('.mvrplay').textContent=on?'⏸':'▶';}
/* THE POWER KEY (Jackie, Nov 27: "and also a power button for the screen so someone knows what to do to start"). The first key on the
   remote. With the screen dark it tunes to the channel last watched, or the first one; with something on, it stops it and the
   curtains close. */
function mvPower(){if(!mvEl)return;mvScanStop(false);const v=mvEl.querySelector('video');if(mvState!=='closed'&&mvFilm){mvChanLeave();v.pause();mvEl.dataset.paused='';mvGuideClose();sfx('tick');mvCurtains(false,()=>{mvNote('The screen is off.');mvRemShow();});return;}
 if(MV_CH.length)mvTune(mvChan||MV_CH[0]);else if(mvFilm)mvPlay();else mvNote('The channels are still warming up. Try again in a moment.');}
/* THE INFORMATION KEY, a circled i where the film library's key was (Jackie, Nov 27: "maybe an information button instead of the
   library", "circled i"). It says what is on at the bottom of the screen, where the channel's words go: the title, who made it or
   which channel it is on, and how long it runs. With the screen dark it says how to start. */
function mvInfo(){const b=mvEl&&mvEl.querySelector('.mvchb');if(!b)return;sfx('tick');b.innerHTML='<b></b><span></span>';const on=mvState!=='closed'&&mvFilm;
 b.querySelector('b').textContent=on?mvFilm.t:'Nothing is on';b.querySelector('span').textContent=on?[mvFilm.by,mvFilm.len].filter(Boolean).join(' · '):'Press POWER to turn the screen on.';b.hidden=false;clearTimeout(mvBanner.t);mvBanner.t=setTimeout(()=>{b.hidden=true;},6000);}
function mvRemote(){if(!mvEl)return;if(mvRemEl){mvRemClose();return;}mvTrayClose();sfx('tick');mvRemEl=document.createElement('div');mvRemEl.className='mvrem';
 mvRemEl.innerHTML='<button type="button" class="mvremx" aria-label="Put the remote down">×</button><div class="mvremd"></div>'+
  '<div class="mvremrow one"><button type="button" class="mvrk mvrpower" data-a="power" aria-label="Turn the screen on or off">POWER</button></div>'+
  '<div class="mvremrow chrow"><button type="button" class="mvrk" data-a="up" aria-label="Channel up">CH ▲</button><button type="button" class="mvrk" data-a="down" aria-label="Channel down">CH ▼</button></div>'+
  '<div class="mvrempad">'+[1,2,3,4,5,6,7,8,9].map(k=>'<button type="button" class="mvrk" data-k="'+k+'">'+k+'</button>').join('')+'<button type="button" class="mvrk mvrguide" data-a="guide" aria-label="Guide">≡</button><button type="button" class="mvrk" data-k="0">0</button><button type="button" class="mvrk mvrinfo" data-a="info" aria-label="What is on">ⓘ</button></div>'+
  '<div class="mvremrow modes"><button type="button" class="mvrk" data-a="tv" aria-label="Television channels">TV</button><button type="button" class="mvrk" data-a="film" aria-label="Film library">FILM</button></div>'+ /* two wide keys under the numbers to go between the channels and the films in the library (Jackie, Nov 27: "maybe have a wide tv and a wide film button below the numbers to switch between tv and the films we have in the film catalogue") */ /* smaller number keys, and no key for the film library: the films are on the shelf (Jackie, Nov 27: "on the remote, the numbers can be a little smaller, and maybe no link to the dvds and stuff") */
  '<div class="mvremrow three"><button type="button" class="mvrk" data-a="back" aria-label="Rewind">⏪</button><button type="button" class="mvrk mvrplay" data-a="play" aria-label="Play or pause">▶</button><button type="button" class="mvrk" data-a="fwd" aria-label="Fast forward">⏩</button></div>';
 mvRemEl.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();if(b.classList.contains('mvremx')){mvRemClose();return;}if(b.dataset.k!==undefined){mvDigit(b.dataset.k);return;}const a=b.dataset.a;
  if(a==='power')mvPower();else if(a==='tv'){if(MV_CH.length)mvTune(mvChan||MV_CH[0]);}else if(a==='film'){mvGuideClose();mvPick();}else if(a==='info')mvInfo();else if(a==='up')mvTuneBy(1);else if(a==='down')mvTuneBy(-1);else if(a==='guide')mvGuide();else if(a==='back')mvScan(-1);else if(a==='fwd')mvScan(1);else if(a==='play'){if(mvScanStop())return;if(!mvFilm&&MV_CH.length)mvTune(MV_CH[0]);else mvPlay();setTimeout(mvRemShow,60);}});
 mvEl.querySelector('.mvstage').appendChild(mvRemEl);mvRemShow();}
function mvRemClose(){if(mvRemEl){mvRemEl.remove();mvRemEl=null;}mvGuideClose();}
function mvGuideClose(){clearInterval(mvGuideT);const g=mvEl&&mvEl.querySelector('.mvguide');if(g)g.remove();}
function mvGuide(){if(!mvEl)return;if(mvEl.querySelector('.mvguide')){mvGuideClose();return;}const g=document.createElement('div');g.className='mvguide';g.style.cssText=mvPct(MV.screen);
 const draw=()=>{const now=new Date(),a=null,hm=x=>String(x.getHours()).padStart(2,'0')+':'+String(x.getMinutes()).padStart(2,'0');g.innerHTML='<div class="mvgh"><b>TV GUIDE</b><span>'+hm(now)+'</span></div>'+MV_CH.map((c,i)=>'<button type="button" class="mvgrow'+(c===mvChan?' on':'')+'" data-i="'+i+'"><i></i><b></b><span></span><em></em></button>').join('');
  g.querySelectorAll('.mvgrow').forEach(b=>{const c=MV_CH[+b.dataset.i];b.querySelector('i').textContent=c.n;b.querySelector('b').textContent=c.name;b.querySelector('span').textContent=c.about;b.querySelector('em').textContent=''; /* the guide is of channels, not of what is on (Jackie, Nov 27: "the tv guide can be for channels not shows") */b.onclick=e=>{e.stopPropagation();mvTune(c);};});};
 draw();g.addEventListener('click',mvGuideClose);mvEl.querySelector('.mvstage').appendChild(g);clearInterval(mvGuideT);mvGuideT=setInterval(()=>{if(mvEl&&mvEl.querySelector('.mvguide'))draw();else clearInterval(mvGuideT);},5000);if(mvState==='closed')mvScreen();}
/* THE THINGS ON THE SHELVES (Jackie, Nov 27: "I want to work on all the stuff in the shelves they should work"). Each does one thing:
   the popcorn machine and the stack of buckets offer five kinds of popcorn; the machine pops for a moment, a bucket lands on the couch,
     and every monster in the room that is old enough to eat is a little fuller;
   the soda fountain and the cups offer four drinks; the tap pours, a cup lands on the couch, and nobody in the room is thirsty;
   the 3D glasses turn the film amber, blue or rose, as silent films were often tinted, and then plain again;
   the row of books opens the books about film, and the box set opens its three books, each read a page at a time. */
const MV_CORN=[['butter','Butter popcorn'],['caramel','Caramel popcorn'],['cheese','Cheese popcorn'],['seaweed','Trash popcorn'],['charcoal','Gravel popcorn']]/* the flavours are butter, caramel, cheese, trash and gravel (Jackie, Nov 27); the last two were seaweed and charcoal and keep those pictures and inner names */,
 MV_SODA=[['yellow','Honeysuckle tea'],['red','Cherry soda'],['blue','Beetle brew'],['swamp','Swamp fizz']], /* Jackie's names (Nov 27): "they'll be honeysuckle tea, cherry soda, beetle brew, and swamp fizz" */MV_TINTS=['','amber','blue','rose'],MV_TINT_NAME={'':'No tint.',amber:'Amber tint.',blue:'Blue tint.',rose:'Rose tint.'},
 MV_SPOTS={machine:{x:126,y:162,w:148,h:186},buckets:{x:1316,y:504,w:66,h:88},fountain:{x:1326,y:178,w:150,h:170},cups:{x:1480,y:176,w:78,h:172},glasses:{x:1384,y:540,w:80,h:52},boxset:{x:1470,y:496,w:82,h:96},books:{x:110,y:500,w:260,h:92}},
 MV_ON={corn:{x:560,y:697,k:.42},cup:{x:1262,y:697,k:.4},pop:{x:124,y:160,w:152,h:192},pour:{x:1322,y:174,w:158,h:176}};
let mvTrayEl=null,mvPopT=0,mvBooks=null,mvTint=0;
function mvTrayClose(){if(mvTrayEl){mvTrayEl.remove();mvTrayEl=null;}}
function mvPanel(cls,html){mvTrayClose();mvPickClose();const el=document.createElement('div');el.className='screen mvpick '+cls;el.innerHTML='<div class="mvpbox">'+html+'<button type="button" class="mvpx" aria-label="Close">×</button></div>';
 el.querySelector('.mvpx').onclick=mvTrayClose;el.onclick=e=>{if(e.target===el)mvTrayClose();};ui.appendChild(el);mvTrayEl=el;return el;}
function mvOver(cls,src,box,ms,under){if(!mvEl)return null;const one=cls.split(' ').pop();let im=mvEl.querySelector('.'+one);if(!im){im=document.createElement('img');im.className='mvover '+cls;im.alt='';im.draggable=false;mvEl.querySelector('.mvstage').insertBefore(im,mvEl.querySelector(under?'.mvseats':'.mvcat'));} // under: behind the monsters on the couch
 im.src=src;im.style.cssText=mvPct(box);im.hidden=false;if(ms)setTimeout(()=>{im.hidden=true;},ms);return im;}
function mvOnCouch(cls,src,at,under){const im=mvOver(cls,src,{x:at.x,y:at.y,w:0,h:0},0,under);if(!im)return null;const fit=()=>{const w=im.naturalWidth*at.k,h=im.naturalHeight*at.k;im.style.cssText=mvPct({x:at.x-w/2,y:at.y-h,w,h})+(im.onclick?';pointer-events:auto;cursor:pointer':'');};if(im.complete&&im.naturalWidth)fit();else im.addEventListener('load',fit,{once:true});return im;} // it is there at once and takes its size when its picture arrives
/* POPCORN AND SODA, SECOND VERSION (Jackie, Nov 27: "I don't like this 'popcorn for the couch' and 'cherry soda for the couch' and then
   they're placed randomly -- let's think of a more fun use for these", then of five ideas, "I like all of the popcorn and soda
   options").
   - Pop it yourself: hold the machine and kernels pop while you hold. Hold too long and it overflows: kernels spill to the floor
     and the cat comes awake for them. Let go (or just tap) and you choose the kind.
   - Hand it to someone: with more than one monster on the couch you tap the one it is for; the bucket or cup sits beside that
     monster. Each monster has a favourite popcorn that follows its nature, found by trying; given its favourite, it hops.
   - Throw it at the screen: tap a monster that has popcorn and kernels arc up, bounce off the screen and drop behind the couch. One
     goes astray toward the cat, which pounces.
   - Soda burps: a monster with a soda lets a bubble go now and then, the colour of its soda, and it floats up.
   - Intermission: halfway through a film longer than fifteen minutes the curtains close for a minute and the lights come up.
   All of the motion is small squares on the room's pixel grid, moved by whole pixels. */
const MV_FAV=w=>w.ge>.3?'caramel':w.ge<-.3?'charcoal':w.lc>.3?'butter':w.lc<-.3?'cheese':'seaweed';
const MV_SODA_COL={red:'#e23b2e',blue:'#2f7fe0',yellow:'#f2c230',swamp:'#7d8a3a'};
let mvFx=[],mvFxOn=false,mvHeld=null,mvPopping=null,mvBurpT=0;
function mvFxLoop(){const c=mvEl&&mvEl.querySelector('.mvfx');if(!c){mvFxOn=false;return;}const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);const U=4;
 for(const p of mvFx){if(p.pop){mvPopStep(p);mvPopDraw(x,p,U);continue;}p.vy+=p.g;p.x+=p.vx;p.y+=p.vy;p.life--;
  if(p.hitY!=null&&p.vy<0&&p.y<=p.hitY){p.vy=Math.abs(p.vy)*.25;p.vx*=-.5;p.hitY=null;} // it meets the screen and drops
  if(p.floor!=null&&p.y>=p.floor&&p.vy>0){p.y=p.floor;p.vy=p.vy>2?-p.vy*.35:0;p.vx*=.6;if(p.land){const f=p.land;p.land=null;f();}}
  if(p.sway)p.vx=Math.sin(p.life/11)*.5;
  const X=Math.round(p.x/U)*U,Y=Math.round(p.y/U)*U;x.fillStyle=p.c;
  if(p.b){x.fillRect(X-4,Y-8,8,16);x.fillRect(X-8,Y-4,16,8);x.fillStyle='rgba(255,255,255,.55)';x.fillRect(X-4,Y-4,4,4);}else{x.fillRect(X-4,Y-4,8,8);x.fillStyle='#fff8e6';x.fillRect(X-4,Y-4,4,4);}}
 mvFx=mvFx.filter(p=>p.life>0&&p.y<p.end);
 const now=performance.now();if(now>mvBurpT){mvBurpT=now+rnd(5000,10000);const L=mvWho.filter(w=>w.soda);if(L.length){const w=L[Math.floor(Math.random()*L.length)];mvFx.push({x:w.x+rnd(-10,10),y:MV_SEAT.top-w.pic.height*MV_SEAT.show-6,vx:0,vy:-1.1,g:0,sway:true,life:230,end:1e9,b:true,c:MV_SODA_COL[w.soda]});}}
 if(mvFx.length||mvWho.some(w=>w.soda)||mvPopping||mvPopFly)requestAnimationFrame(mvFxLoop);else mvFxOn=false;}
/* POPCORN THAT FLIES (Jackie, Nov 27: "when popcorn is popping i want it to fly out of the machine and bounce off the floor lightly
   with real popcorn physics and i want it to be for a hot minute"). Starting the machine sets it popping for MV_POP_FOR: slowly at
   first, then a rush, then stragglers, as a real pan does. Each piece leaves the top of the machine at its own speed and angle,
   falls under gravity with a little drag, and bounces on the floor a few times. A popped kernel is light and lumpy, so each bounce
   keeps well under half its height and kicks it a little sideways, and it tumbles (its picture swaps between shapes) until it
   settles. It lies there a few seconds and is gone. Pieces that land beside the couch may land anywhere on that floor; pieces that
   carry past the couch's arm land on the strip of floor in front of it. Whole-pixel moves and picture swaps only. */
const MV_POP_FOR=45000,MV_POP_G=.42,MV_POP_SHAPES=[[[0,0],[4,-4],[-4,-4],[0,-8]],[[0,0],[4,0],[-4,-4],[4,-4]],[[0,0],[-4,0],[0,-4],[4,-8]]];let mvPopFly=null,mvPopFlyT=0;
function mvPopFloor(p){return p.x<430||p.x>1250?p.f1:p.f2;}
function mvPopStep(p){if(p.rest){p.life--;return;}p.vy+=MV_POP_G;p.vx*=.992;p.vy*=.998;p.x+=p.vx;p.y+=p.vy;const fl=mvPopFloor(p);
 if(p.x<16){p.x=16;p.vx=Math.abs(p.vx)*.4;}if(p.x>MV.W-16){p.x=MV.W-16;p.vx=-Math.abs(p.vx)*.4;}
 if(p.y>=fl&&p.vy>0){p.y=fl;p.n++;if(p.vy<2.2||p.n>5){p.rest=true;p.vx=p.vy=0;p.life=rnd(240,420);if(p.land){const f=p.land;p.land=null;f();}}
  else{p.vy=-p.vy*p.e;p.vx=p.vx*.62+rnd(-1,1)*Math.abs(p.vy)*.3;p.s=(p.s+1)%MV_POP_SHAPES.length;}}}
function mvPopDraw(x,p,U){const X=Math.round(p.x/U)*U,Y=Math.round(p.y/U)*U,S=MV_POP_SHAPES[p.s];if(p.rest&&p.life<40&&p.life%8<4)return; // it blinks away at the end
 x.fillStyle='#b98a3e';for(const[a,b]of S)x.fillRect(X+a-2,Y+b-2,8,8);x.fillStyle=p.c;for(const[a,b]of S)x.fillRect(X+a-4,Y+b-4,8,8);x.fillStyle='#fffdf2';x.fillRect(X+S[1][0]-4,Y+S[1][1]-4,4,4);}
function mvPopOne(){const o=MV_ON.pop;mvFx.push({pop:true,x:o.x+76+rnd(-34,34),y:o.y+34,vx:rnd(-2.5,9.5)*(Math.random()<.85?1:.4),vy:rnd(-13,-6),e:rnd(.28,.46),n:0,s:Math.floor(rnd(0,3)),f1:rnd(772,930),f2:rnd(918,936),life:900,end:1e9,c:Math.random()<.2?'#fff3c4':'#f6e3a1',land:Math.random()<.04?()=>mvCatPounce(300):null});if(mvFx.length>260)mvFx.shift();mvFxGo();}
function mvPopFlyGo(){const now=performance.now();if(mvPopFly){mvPopFly.t0=Math.min(mvPopFly.t0,now-MV_POP_FOR*.15);mvPopFly.end=now+MV_POP_FOR*.85;return;} /* started again while popping: it keeps going from the rush */mvPopFly={t0:now,end:now+MV_POP_FOR};
 const tick=()=>{if(!mvPopFly||!mvEl)return;const t=performance.now(),k=(t-mvPopFly.t0)/(mvPopFly.end-mvPopFly.t0);if(k>=1){mvPopFly=null;return;}
  mvPopOne();if(k>.15&&k<.7&&Math.random()<.45)mvPopOne();if(Math.random()<.12)sfx('tick');
  const gap=k<.15?420-k/.15*340:k<.7?80:80+(k-.7)/.3*620;mvPopFlyT=setTimeout(tick,gap*rnd(.6,1.4));};tick();}
function mvFxGo(){if(!mvFxOn){mvFxOn=true;requestAnimationFrame(mvFxLoop);}}
function mvKernel(x,y,vx,vy,o){mvFx.push(Object.assign({x,y,vx,vy,g:.5,life:400,end:MV_SEAT.top-2,c:'#f6e3a1'},o||{}));if(mvFx.length>220)mvFx.shift();mvFxGo();}
function mvCatPounce(x){if(!mvCat)return;clearTimeout(mvCatT);mvCat.awake=true;if(mvCat.y<800){mvCatShow('sit1');mvCatT=setTimeout(mvCatSleep,MV_CAT_NAP);return;} /* on the couch's back it only looks up */mvCatShow(x<mvCat.x?'leap_l':'pounce');setTimeout(()=>{if(mvCat&&mvCat.awake)mvCatShow('sit1');},900);mvCatT=setTimeout(mvCatSleep,MV_CAT_NAP);}
/* holding the machine */
function mvPopDown(){if(mvPopping)return;const t0=performance.now();mvPopping={t0,spilled:false};mvOver('mvpop','movieroom/acc_machine_pop.png',MV_ON.pop);sfx('tick');mvFxGo();mvPopFlyGo();
 const tick=()=>{if(!mvPopping||!mvEl)return;const held=performance.now()-mvPopping.t0;
  mvKernel(MV_ON.pop.x+76+rnd(-30,30),MV_ON.pop.y+120,rnd(-1.5,1.5),rnd(-5,-2),{g:.4,life:26,end:1e9}); // popping inside the glass
  if(held>3200){if(!mvPopping.spilled){mvPopping.spilled=true;mvNote('It’s overflowing.');} // over the top, down to the floor on the left, for the cat
   mvKernel(MV_ON.pop.x+rnd(10,140),MV_ON.pop.y+150,rnd(-3.5,-1),rnd(-4,-1),{end:1e9,floor:rnd(880,925),life:900,land:Math.random()<.2?()=>mvCatPounce(140):null});}
  mvPopT=setTimeout(tick,90);};tick();}
const MV_POP_MIN=1300; // a tap still pops for a moment before the kinds are offered (Jackie, Nov 27: "the popcorn doesn't pop": on a phone a tap was over before anything showed)
function mvPopPicOff(){if(mvPopFly){setTimeout(mvPopPicOff,500);return;}if(mvPopping)return;const im=mvEl&&mvEl.querySelector('.mvpop');if(im)im.hidden=true;}
function mvPopUp(){if(!mvPopping||mvPopping.ending)return;const left=MV_POP_MIN-(performance.now()-mvPopping.t0),end=()=>{if(!mvPopping)return;clearTimeout(mvPopT);mvPopping=null;if(mvEl)mvOffer('corn');mvPopPicOff();}; /* the machine's popping picture stays while pieces are still flying out */
 if(left>0){mvPopping.ending=true;setTimeout(end,left);}else end();}
/* choosing, then handing over */
function mvOffer(kind){const L=kind==='corn'?MV_CORN:MV_SODA,pre=kind==='corn'?'acc_corn_':'acc_cup_';
 const el=mvPanel('mvoffer','<div class="mvplist"><h2>'+(kind==='corn'?'Popcorn':'Soda')+'</h2><div class="mvtiles">'+L.map(([id,name])=>'<button type="button" class="mvtile" data-id="'+id+'"><img'+(id==='swamp'?' class="mvswamp"':'')+' src="movieroom/'+pre+(id==='swamp'?'yellow':id)+'.png" alt="" draggable="false"><span>'+name+'</span></button>').join('')+'</div></div>');
 el.querySelectorAll('.mvtile').forEach(b=>b.onclick=()=>{const it=L.find(q=>q[0]===b.dataset.id);mvHand(kind,it[0],it[1].replace(/ \(.*/,''));});}
function mvHand(kind,id,name){mvTrayClose();if(kind==='soda')mvOver('mvpour','movieroom/acc_soda_pour_'+(id==='swamp'?'yellow':id)+'.png',MV_ON.pour,1400);
 if(!mvWho.length){mvNote('Nobody is here to have it.');return;}
 if(mvWho.length===1){mvGive(mvWho[0],kind,id,name);return;}
 mvHeld={kind,id,name};mvNote('Who is the '+name.toLowerCase()+' for? Tap a monster.',true);mvEl.dataset.give='1';}
function mvGive(w,kind,id,name){mvHeld=null;if(mvEl)delete mvEl.dataset.give;sfx('chime');const y=MV_SEAT.top;
 /* the bucket and the cup stand side by side on the monster's right, clear of the monster and of each other; the seats are far enough apart that the next monster is clear of them too (Jackie, Nov 27: "if the monsters are separate the popcorn and drinks may not overlap - just don't let them overlap") */
 const edge=w.x+w.pic.width/2;
 if(kind==='corn'){w.corn=id;mvOnCouch('mvcorn mvcorn'+w.id,'movieroom/acc_corn_'+id+'.png',{x:edge+31,y,k:.36});const fav=MV_FAV(w)===id;
  if(st.started)withPlant(w.id,()=>{st.full=clamp((st.full||0)+.35,0,1);});if(fav){mvHop(w,3);mvNote(w.name+' loves '+name.toLowerCase()+'. Tap '+w.name+' to throw some.');}else mvNote(w.name+' has the '+name.toLowerCase()+'. Tap '+w.name+' to throw some.');
  const b=mvEl.querySelector('.mvcorn'+w.id);if(b){b.onclick=()=>mvThrow(w);b.style.pointerEvents='auto';b.style.cursor='pointer';}}
 else{w.soda=id;mvOnCouch('mvcup mvcup'+w.id,'movieroom/acc_cup_'+(id==='swamp'?'yellow':id)+'.png',{x:edge+84,y,k:.34});mvBurpT=performance.now()+2500;mvFxGo();
  if(st.started)withPlant(w.id,()=>{st.needs.thirst=0;});mvNote(w.name+' has the '+name.toLowerCase()+'.');{const c=mvEl.querySelector('.mvcup'+w.id);if(c)c.classList.toggle('mvswamp',id==='swamp');}}
 if(st.started)save();}
function mvWhoTap(i){const w=mvWho[i];if(!w)return;if(mvHeld){mvGive(w,mvHeld.kind,mvHeld.id,mvHeld.name);return;}if(w.corn)mvThrow(w);else mvHop(w,1);} // a monster with popcorn throws some when tapped
/* intermission */
const MV_INTER={min:900,ms:60000};let mvInter=null,mvInterDone='';
function mvInterCheck(){if(!mvEl||mvInter||!mvFilm||mvFilm.loop)return;const v=mvEl.querySelector('video'),k=v.dataset.film;if(!(v.duration>MV_INTER.min)||mvInterDone===k||v.paused||v.currentTime<v.duration/2||v.currentTime>v.duration/2+20)return;
 mvInterDone=k;mvInter={light:mvLight};v.pause();mvEl.dataset.paused='1';mvLight=0;mvCurtains(false,()=>{mvNote('Intermission. Tap the screen to go on.',true);});mvInter.t=setTimeout(mvInterEnd,MV_INTER.ms);}
function mvInterEnd(){if(!mvInter)return false;clearTimeout(mvInter.t);mvLight=mvInter.light;mvInter=null;mvNote('');mvCurtains(true,mvStart);return true;}
/* throwing popcorn at the screen */
function mvThrow(w){if(!w.corn)return;sfx('tick');const x0=w.x+w.pic.width/2,y0=MV_SEAT.top-60,sc=MV.screen;
 for(let i=0;i<6;i++){const tx=sc.x+rnd(.2,.8)*sc.w;mvKernel(x0,y0,(tx-x0)/rnd(26,34),rnd(-17,-13),{hitY:sc.y+rnd(.25,.8)*sc.h});}
 if(mvCat)mvKernel(x0,y0,(mvCat.x-x0)/40,-12,{end:1e9,floor:mvCat.y-6,life:500,land:()=>mvCatPounce(x0)});mvHop(w,1);}
function mvGlasses(){mvTint=(mvTint+1)%MV_TINTS.length;if(mvEl)mvEl.dataset.tint=MV_TINTS[mvTint];sfx('tick');mvNote(MV_TINT_NAME[MV_TINTS[mvTint]]);}
/* reading: a book's pages one at a time */
/* THE MOVIE ROOM'S BOOKS OPEN LIKE BOOKS (Jackie, Nov 27: "make sure that every page in every book in both rooms look great and make
   sense in terms of publishing and reformat as necessary"). A book opens on two facing pages. The first left page is its title
   page: the title, who wrote it and when, and for the old books a line saying it is an extract in the author's own words. The
   words are then set out a few sentences to a page, never breaking a sentence, so every page fits its paper on a phone; a page
   that begins a new paragraph of the original is indented. Each page has its number at the foot. If the last page is a left
   page, a printer's flower closes the book on the right. Tap the right page (or Next) to turn on, the left (or Back) to go back. */
const MV_PAGE_CHARS=225;
function mvBookPages(book){if(book._pp)return book._pp;const P=[{t:book.t,by:book.by,note:book.own?'':'An extract, in the author’s own words'}];
 for(const para of book.pages){let S=para.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g)||[para];let cur='',first=true;
  S=S.flatMap(q=>{const out=[];while(q.length>MV_PAGE_CHARS){let k=Math.max(q.lastIndexOf(', ',MV_PAGE_CHARS),q.lastIndexOf('; ',MV_PAGE_CHARS),q.lastIndexOf(': ',MV_PAGE_CHARS));if(k<MV_PAGE_CHARS*.4)k=q.lastIndexOf(' ',MV_PAGE_CHARS)-1;out.push(q.slice(0,k+2));q=q.slice(k+2);}out.push(q);return out;}); // a sentence too long for one page turns the page at a comma
  for(const q of S){if(cur&&(cur+q).length>MV_PAGE_CHARS){P.push({x:cur.trim(),par:first});first=false;cur='';}cur+=q;}
  if(cur.trim())P.push({x:cur.trim(),par:first});}
 if(P.length%2)P.push({orn:1});return book._pp=P;}
function mvBookPage(el,pg,n){el.textContent='';el.className='mvbp '+(n%2?'mvbr':'mvbl');if(!pg)return;
 if(pg.t){el.classList.add('mvbtitle');const b=document.createElement('b');b.textContent=pg.t;const s=document.createElement('span');s.textContent=pg.by;el.append(b,s);if(pg.note){const k=document.createElement('i');k.textContent=pg.note;el.appendChild(k);}return;}
 if(pg.orn){el.classList.add('mvborn');el.textContent='❦';return;}
 const p=document.createElement('p');p.className='mvrtext'+(pg.par&&n>1?' par':'');p.textContent=pg.x;const f=document.createElement('span');f.className='mvfolio';f.textContent=n;el.append(p,f);}
function mvRead(book,i=0){const P=mvBookPages(book),n=P.length;i=clamp(i-(i%2),0,n-2);
 const el=mvPanel('mvread','<div class="mvplist"><h2 hidden></h2><div class="mvbook"><div class="mvbp"></div><div class="mvbp"></div></div><div class="mvrfoot"><button type="button" class="mvrbtn mvrprev">Back</button><span></span><button type="button" class="mvrbtn mvrnext">'+(i<n-2?'Next':'Close the book')+'</button></div></div>');
 el.querySelector('h2').textContent=book.t;const B=el.querySelectorAll('.mvbp');mvBookPage(B[0],P[i],i);mvBookPage(B[1],P[i+1],i+1);el.querySelector('.mvrfoot span').textContent=i?'Pages '+i+' and '+(i+1)+' of '+(n-1):'';
 const back=()=>mvRead(book,i-2),on=()=>i<n-2?mvRead(book,i+2):mvTrayClose();const pv=el.querySelector('.mvrprev');pv.disabled=i===0;pv.onclick=back;el.querySelector('.mvrnext').onclick=on;B[0].onclick=()=>{if(i>0)back();};B[1].onclick=on;sfx('paper');}
function mvShelfOfBooks(title,about,books){const el=mvPanel('mvbooks','<img src="movieroom/acc_book_open.png" alt="" draggable="false"><div class="mvplist"><h2>'+title+'</h2><p>'+about+'</p>'+
  books.map((b,i)=>'<button type="button" class="mvpfilm" data-i="'+i+'"><b></b><span></span></button>').join('')+'</div>');
 el.querySelectorAll('.mvpfilm').forEach(b=>{const k=books[+b.dataset.i];b.querySelector('b').textContent=k.t;b.querySelector('span').textContent=k.by;b.onclick=()=>mvRead(k);});}
function mvBoxSet(){mvShelfOfBooks('The box set','Three small books about a famous trilogy.',MV_BOXSET);}
MV_BOXSET.forEach(k=>k.own=true); /* written for the game, so their title pages do not call them extracts */
function mvFilmBooks(){mvShelfOfBooks('Books about film','Old books about the movies, in their own words, and three small books about a famous trilogy.',(mvBooks||[]).concat(MV_BOXSET));} // the box set's three books live here now that the Kalimbasizer has its place
fetch('movieroom/books.json').then(r=>r.ok?r.json():null).then(j=>{if(j&&j.books)mvBooks=j.books.filter(b=>b.pages&&b.pages.length).map(b=>({t:b.title,by:b.by+', '+b.year,pages:b.pages}));}).catch(()=>{});
function mvThingsWire(){const st2=mvEl.querySelector('.mvstage'),add=(k,label,fn)=>{const b=document.createElement('button');b.type='button';b.className='mvhot mvthing';b.dataset.k=k;b.setAttribute('aria-label',label);b.style.cssText=mvPct(MV_SPOTS[k]);b.onclick=fn;st2.insertBefore(b,mvEl.querySelector('.mvnote'));};
 add('machine','Popcorn',()=>{});add('buckets','Popcorn',()=>mvOffer('corn'));{const m=st2.querySelector('.mvthing[data-k=machine]');m.onclick=null;m.style.touchAction='none';m.addEventListener('pointerdown',e=>{e.preventDefault();try{m.setPointerCapture(e.pointerId);}catch(x){}mvPopDown();});['pointerup','pointercancel'].forEach(ev=>m.addEventListener(ev,mvPopUp));m.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')mvOffer('corn');});}
 mvWho.forEach((w,i)=>{const b=document.createElement('button');b.type='button';b.className='mvhot mvwho';b.dataset.i=i;b.setAttribute('aria-label',w.name);const h=w.pic.height*MV_SEAT.show;b.style.cssText=mvPct({x:w.x-w.pic.width/2,y:MV_SEAT.top-h,w:w.pic.width,h});b.onclick=()=>mvWhoTap(i);st2.insertBefore(b,mvEl.querySelector('.mvnote'));});add('fountain','Soda',()=>mvOffer('soda'));add('cups','Soda',()=>mvOffer('soda'));
 for(const k in MV_DRAWERS){MV_SPOTS['dr_'+k]=MV_DRAWERS[k];add('dr_'+k,{decor:'The decorations drawer',lights:'The string lights drawer',blankets:'The blankets drawer',curtains:'The curtains drawer',tickets:'The ticket stubs drawer',lost:'Lost and found'}[k]||'A drawer',()=>mvDrawer(k));}
 add('glasses','Tint the film',mvGlasses);add('boxset','Kalimba-Score',openKalimba);add('books','Books about film',mvFilmBooks);mvEl.dataset.tint=MV_TINTS[mvTint];}
/* THE DRAWERS (Jackie, Nov 27: "Maybe we should put something in each drawer in the movie room"; "Decorations go in a drawer. Cat toys
   in another. String lights in another."). The room has six drawers. Three are used so far:
   - the left-hand unit's drawer holds the decorations: choose an occasion and its garland hangs across the back of the couch
     and its floor piece stands at the left end of the rug (the screen is never covered);
   - the first drawer under the screen holds the cat's toys: choose one and the cat wakes to play with it;
   - the right-hand unit's drawer holds the string lights: a strand along the top of the wall, behind the plants, twinkling as
     in the study room.
   What is up is remembered with the save (mvDecor, mvLights). */
const MV_DRAWERS={decor:{x:118,y:604,w:246,h:60},lights:{x:412,y:606,w:200,h:50},blankets:{x:627,y:606,w:200,h:50},curtains:{x:842,y:606,w:202,h:50},tickets:{x:1058,y:606,w:200,h:50},lost:{x:1312,y:604,w:250,h:60}}/* THE SIX DRAWERS, left to right: decorations, string lights, blankets, curtains, ticket stubs, lost and found (Jackie, Nov 27: "we need 4 drawers because i got rid of toys", then "i like curtains, lost and found, blankets, and ticket stubs") *//* the cat toys drawer was taken out (Jackie, Nov 27: "get rid of toys"); the toy code below is kept, unused, in case it comes back *//* the first three drawers from the left, in the order you would dress a room: decorations, then string lights, then the cat's toys (Jackie, Nov 27: "we also want the drawers to be logically organized left to right"); the other three are empty for now */,MV_TOP_MASK=new Image();MV_TOP_MASK.src='movieroom/topmask.png';
let mvLightsT=0;
function mvLightsDraw(){const c=mvEl&&mvEl.querySelector('.mvlights');if(!c)return;const x=c.getContext('2d');x.globalCompositeOperation='source-over';x.clearRect(0,0,c.width,c.height);let n=st.mvLights;
 if(!n||typeof LIGHTS_IMG==='undefined')return;if(LIGHTS_OLD[n])n=st.mvLights=LIGHTS_OLD[n];if(n==='auto')n=lightsAuto(); /* Seasonal: with the movie room's decorations, or the time of year */const on=LIGHTS_IMG[n+'_on'],off=LIGHTS_IMG[n+'_off'];if(!ok(on)||!ok(off)||!MV_TOP_MASK.complete)return;const ox=35,oy=6;x.drawImage(on,ox,oy);
 const B=LIGHTS_META&&LIGHTS_META[n]&&LIGHTS_META[n].bulbs;if(B)for(const i of lightsOut(B.length)){const [bx,by,bw,bh]=B[i];x.clearRect(ox+bx,oy+by,bw,bh);x.drawImage(off,bx,by,bw,bh,ox+bx,oy+by,bw,bh);}
 x.globalCompositeOperation='destination-in';x.drawImage(MV_TOP_MASK,0,0);}
function mvLightsSet(n){st.mvLights=n||'';if(st.started)save();mvLightsDraw();sfx(n?'chime':'tick');mvNote(n?'The string lights are up.':'The string lights are back in the drawer.');}
/* WHERE THE MOVIE ROOM'S DECORATIONS GO (Jackie, Nov 27: "garland across top left and top right unit and decoration on left side a
   little below the shelving and kinda larger but not huge"). The garland hangs twice, once along the top of each shelf unit, so
   the screen and the couch are left clear. The floor piece stands on the floor at the left, just below the left unit, at
   MV_DECOR.fk times its size in the study. (They used to be one garland along the couch's back and a small floor piece in the
   front left corner.) */
const MV_DECOR={gl:{x:238,y:196,k:1.05},gr:{x:1437,y:196,k:1.05},f:{x:192,y:806},fk:1.4};
function mvDecorShow(){if(!mvEl)return;if(typeof decorOld==='function')decorOld('mvDecor');const id=st.mvDecor,gd=((id&&typeof DECOR_SETS!=='undefined'&&DECOR_SETS.find(q=>q.id===id))||{}).garland||'';for(const c of ['.mvgarland','.mvgarland2','.mvfloorpiece']){const e=mvEl.querySelector(c);if(e)e.hidden=true;}
 if(gd){mvOnCouch('mvgarland','decor/g_'+gd+'.png',MV_DECOR.gl);mvOnCouch('mvgarland2','decor/g_'+gd+'.png',MV_DECOR.gr);}const s=id&&typeof DECOR_SETS!=='undefined'&&DECOR_SETS.find(q=>q.id===id),fl=s&&s.floor;
 if(fl)mvOnCouch('mvfloorpiece',fl==='pumpkin'?'pumpkin1.png':fl==='tree'?'tree1.png':'decor/'+fl+'.png',{x:MV_DECOR.f.x,y:MV_DECOR.f.y,k:(fl==='pumpkin'||fl==='tree'?.5:1)*MV_DECOR.fk});}
function mvDecorSet(id){st.mvDecor=id||'';if(st.started)save();mvDecorShow();mvLightsDraw();sfx(id?'chime':'tick');mvNote(id?'The decorations are out.':'The decorations are back in the drawer.');} /* a set is its thing for the floor and its garland, which hangs on both shelf units (Jackie, Nov 27: "I don't want them separate, I want sets") */
/* THE BLANKETS DRAWER (Jackie, Nov 27: "i like curtains, lost and found, blankets, and ticket stubs"). Six throws from her sheet take
   the place of the cream throw over the left end of the couch's back. Each is one picture laid over the room's own, covering
   the old throw with a patch of bare couch and the new throw on it (tools/decor2_build.py); the cream one is the room's
   picture with nothing over it. Monsters and the cat on the couch are drawn in front, as before. */
const MV_BLANKET_AT={x:430,y:676,w:210,h:204},MV_BLANKETS=[['','Cream with blue bands'],['check','Red check'],['daisy','Daisies'],['knit','Green cable knit'],['patch','Patchwork'],['cloud','Clouds'],['moon','Moon and stars']];
function mvBlanketApply(){if(!mvEl)return;const id=MV_BLANKETS.some(q=>q[0]===st.mvBlanket)?st.mvBlanket:'',e=mvEl.querySelector('.mvblanket');if(!id){if(e)e.hidden=true;return;}mvOver('mvblanket','movieroom/blanket_'+id+'.png',MV_BLANKET_AT,0,true);}
function mvBlanketSet(id){st.mvBlanket=id||'';if(st.started)save();mvBlanketApply();sfx('paper');mvNote('A different blanket is over the couch.');}
/* THE DRAWERS' MENUS (Jackie, Nov 27: "within the drawers the menus should be neat with each image tightly managed"). All three
   are the same grid of equal tiles: a picture held inside a box of one size, with its name underneath. A decoration shows its floor
   piece, a strand shows its first few bulbs, a toy shows itself. Taking things down is the first tile when something is up. */
function mvDrawerTile(id,name,pic,on){return '<button type="button" class="mvdt'+(on?' on':'')+'" data-id="'+id+'"><i'+(pic?' style="background-image:url('+pic+')"':'')+(pic&&pic.includes('lights_')?' class="strand"':'')+'>'+(pic?'':'📦')+'</i>'/* a tile with no picture of its own shows an emoji that fits, here the box things go back into (Jackie, Nov 27: "Use relevant emojis" where a crude stand-in was drawn; it was a plain cross) */+'<span>'+name+'</span></button>';}
function mvDecorPic(s){return s.floor==='pumpkin'?PUMPKIN[0].src:s.floor==='tree'?TREE[0].src:'decor/'+s.floor+'.png';}
/* TICKET STUBS: one for every film watched to its end, kept in the drawer. */
function mvTickets(){const seen=mvSeen(),all=MV_SHELVES.concat(MV_MORE).flatMap(s=>s.films),got=[];for(const id of seen){const f=all.find(q=>q.id===id);if(f&&!got.includes(f))got.push(f);}
 const el=mvPanel('mvdrawer','<div class="mvplist"><h2>Ticket stubs</h2><p>'+(got.length?'You have watched '+got.length+' of '+new Set(all.map(f=>f.id)).size+' films to the end.':'Watch a film to its end and its ticket is kept here.')+'</p><div class="mvstubs">'+got.map((f,i)=>'<div class="mvstub" data-i="'+i+'"><i>ADMIT ONE</i><b></b><span></span></div>').join('')+'</div></div>');
 el.querySelectorAll('.mvstub').forEach(d=>{const f=got[+d.dataset.i];d.querySelector('b').textContent=f.t;d.querySelector('span').textContent=f.by;});}
/* THE CURTAINS' COLOUR (Jackie, Nov 27, choosing the drawers: "i like curtains, lost and found, blankets, and ticket stubs"). The
   screen's curtains can be red velvet (as painted), midnight blue, forest green, old gold or plum. Nothing is redrawn: the
   painted red is turned to the other colour, on the closed and half-open curtains and on the open ones at the sides of the screen
   (a second copy of the room picture, cut to the curtains' place, carries the colour there). Kept with the game's settings. */
const MV_CURT=[['','Red velvet','#c8202a',''],['blue','Midnight blue','#27408f','hue-rotate(228deg) saturate(.85) brightness(.78)'],['green','Forest green','#2f7a3c','hue-rotate(118deg) saturate(.8) brightness(.74)'],['gold','Old gold','#d9a520','hue-rotate(44deg) saturate(1.15) brightness(1.22)'],['plum','Plum','#7a2f7a','hue-rotate(292deg) saturate(.8) brightness(.8)']];
function mvCurtApply(){if(!mvEl)return;const c=MV_CURT.find(q=>q[0]===(st.mvCurt||''))||MV_CURT[0],t=mvEl.querySelector('.mvroomtint');mvEl.style.setProperty('--mvcf',c[3]||'none');if(t)t.hidden=!c[3];}
function mvCurtSet(id){st.mvCurt=id||'';if(st.started)save();mvCurtApply();sfx('paper');const c=MV_CURT.find(q=>q[0]===st.mvCurt)||MV_CURT[0];mvNote('The curtains are '+c[1].toLowerCase()+'.');}
function mvCurtDrawer(){const el=mvPanel('mvdrawer','<div class="mvplist"><h2>Curtains</h2><div class="mvdgrid">'+MV_CURT.map(c=>'<button type="button" class="mvdt'+((st.mvCurt||'')===c[0]?' on':'')+'" data-id="'+c[0]+'"><i class="swatch" style="background:'+c[2]+'"></i><span>'+c[1]+'</span></button>').join('')+'</div></div>');
 el.querySelectorAll('.mvdt').forEach(b=>b.onclick=()=>{mvTrayClose();mvCurtSet(b.dataset.id);});}
/* LOST AND FOUND: one small thing somebody left behind, a different one each day, the same all day. Only to look at. */
const MV_LOST=[['🧦','One sock.','Nobody has come back for it.'],['🧤','A single mitten.','It is very small.'],['🔑','A key.','It does not fit anything in this room.'],['🪙','A coin from another country.','It has a fish on it.'],['🎟️','Half a ticket.','The film on it finished years ago.'],['🧢','A cap.','There is popcorn in it.'],['☂️','An umbrella.','It only opens halfway.'],['🕶️','A pair of dark glasses.','Somebody wore them in the dark.'],['🧣','A long scarf.','It still smells of butter.'],['🔦','A torch.','The battery is nearly flat.'],['📎','A paper clip, bent into a heart.',''],['🖍️','A crayon.','It is the colour called Macaroni.'],['🪥','A toothbrush.','Whoever left it planned to stay.'],['🧩','One jigsaw piece.','It is all sky.'],['🪀','A yo-yo.','The string is in a knot.'],['📮','A postcard that was never sent.','It only says “The film was long.”'],['🪮','A comb.','It is missing three teeth.'],['🧸','A small bear.','It has been here longest.'],['🕰️','A watch.','It is exactly one hour wrong.'],['🍬','A sweet, still wrapped.','Best left wrapped.'],['🪶','A feather.','No bird has been in.'],['🎈','A balloon, mostly flat.',''],['🧲','A fridge magnet shaped like a pear.',''],['📏','A ruler.','Somebody measured the screen.'],['🪩','A very small mirror ball.',''],['🧷','A safety pin.','It held something up once.'],['🥄','A spoon.','There is no ice cream here.'],['🎀','A ribbon.','It was round a present.'],['🪁','A kite tail.','Only the tail.'],['🔔','A bell with no clapper.','It is very quiet.'],['🧵','A reel of red thread.','It matches the curtains.']];
function mvLostNow(){const d=new Date();return MV_LOST[Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5)%MV_LOST.length];}
function mvLostDrawer(){const o=mvLostNow(),box=mvPanel('mvdrawer','<div class="mvplist mvlost"><h2>Lost and found</h2><div class="mvlostbig" aria-hidden="true">'+o[0]+'</div><p><b></b> <span></span></p><p class="mvlostnote">Check back tomorrow. Something else may turn up.</p></div>');const el=box.querySelector('.mvlost');el.querySelector('b').textContent=o[1];el.querySelector('span').textContent=o[2];sfx('paper');}
function mvDrawer(k){let h='',pick;if(k==='tickets'){mvTickets();return;}if(k==='curtains'){mvCurtDrawer();return;}if(k==='lost'){mvLostDrawer();return;}
 if(k==='decor'){const t=s=>mvDrawerTile(s.id,s.name,mvDecorPic(s),st.mvDecor===s.id);pick=mvDecorSet;
  h='<h2>Decorations</h2><div class="mvdgrid">'+DECOR_GROUPS.map(([gn],i)=>'<div class="mvhead">'+gn+'</div>'+(i===0&&st.mvDecor?mvDrawerTile('','Take them down',''):'')+DECOR_SETS.filter(q=>q.group===gn).map(t).join('')).join('')+'</div>';}
 else if(k==='blankets'){pick=mvBlanketSet;h='<h2>Blankets</h2><div class="mvdgrid">'+MV_BLANKETS.map(([id,n])=>mvDrawerTile(id,n,'movieroom/blanket_'+(id||'cream')+'_icon.png',(st.mvBlanket||'')===id)).join('')+'</div>';}
 else if(k==='lights'){pick=mvLightsSet;h='<h2>String lights</h2><div class="mvdgrid">'+(st.mvLights?mvDrawerTile('','Take them down',''):'')+[['auto','Seasonal']].concat(LIGHTS_KINDS).map(([id,n])=>mvDrawerTile(id,n,'decor/lights_'+(id==='auto'?lightsAuto():id)+'_on.png',st.mvLights===id)).join('')+'</div>';}
 else{pick=id=>mvToy(CUB_TOYS.find(t=>t.id===id));h='<h2>Cat toys</h2><div class="mvdgrid">'+CUB_TOYS.map(t=>mvDrawerTile(t.id,t.name,CUB_IMG[t.id].src)).join('')+'</div>';}
 const el=mvPanel('mvdrawer','<div class="mvplist">'+h+'</div>');el.querySelectorAll('.mvdt').forEach(b=>b.onclick=()=>{mvTrayClose();pick(b.dataset.id);});}
/* THE CAT PLAYS ON THE FLOOR (Jackie, Nov 27: "the cat interacts weird with the toys in the movie room and also pops over the couch
   so it doesn't look natural when they are in front of the couch"). A toy used to be set down wherever the cat was, so with the
   cat asleep along the couch's back the toy and the playing cat hung in front of the couch. Now a cat on the couch's back hops
   down to the floor beside the couch first, on whichever side is nearer, and the toy is set on the floor next to it. It naps
   there afterwards. Popcorn landing only makes a cat on the floor pounce; on the couch's back it just looks up. */
function mvCatDown(){if(!mvCat||mvCat.y>800)return;const sp=mvCat.x<835?MV_CAT_SPOTS[1]:MV_CAT_SPOTS[2];Object.assign(mvCat,{x:sp.x,y:sp.y,k:sp.k,nap:sp.sleep[Math.floor(Math.random()*sp.sleep.length)]});}
function mvToy(t){if(!mvCat){mvNote('The cat is not here.');return;}mvCatDown();const left=mvCat.x>835?-1:1;mvOnCouch('mvtoy',CUB_IMG[t.id].src,{x:mvCat.x+left*86,y:mvCat.y,k:mvCat.k*1.1});sfx('chime');
 clearTimeout(mvCatT);mvCat.awake=true;let at=0;for(const [pose,sec] of t.seq){if(!at)mvCatShow(pose);else setTimeout(()=>{if(mvCat&&mvCat.awake)mvCatShow(pose);},at*1000);at+=sec;} // the same poses, in the same order, as with that toy in the study room
 if(t.pic)setTimeout(()=>{const im=mvEl&&mvEl.querySelector('.mvtoy');if(im)im.src=CUB_IMG[t.pic].src;},300);mvCatT=setTimeout(mvCatSleep,MV_CAT_NAP);
 const who=typeof catName==='function'?catName():'The cat';mvNote(who+' '+t.say);}
/* TONIGHT'S FILM, AND WHAT YOU HAVE SEEN. The button at the top of the film menu puts on tonight's film: one of the collection, the
   same all day and a different one tomorrow. A film watched to its end is remembered on this device and marked "seen" in its list. */
const MV_AMP={x:1392,y:398,w:156,h:78},MV_SEEN_KEY='monsterplant.films.seen';
function mvSeen(){try{return JSON.parse(localStorage.getItem(MV_SEEN_KEY)||'[]');}catch(e){return [];}}
function mvSeenAdd(f){try{const L=mvSeen();if(!L.includes(f.id)){L.push(f.id);localStorage.setItem(MV_SEEN_KEY,JSON.stringify(L));}}catch(e){}}
function mvTonight(){const all=MV_SHELVES.filter(q=>!q.extra).flatMap(s=>s.films),d=new Date(),n=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()))/864e5);return all[n%all.length];}
/* choosing a film: a tap on the reels, the tapes or the discs opens that shelf's list */
let mvPickEl=null,mvLast=MV_SHELVES[0];
function mvPickClose(){if(mvPickEl){mvPickEl.remove();mvPickEl=null;}}
function mvChoose(f){mvPickClose();const v=mvEl.querySelector('video');mvFilm=f;if(f.chan==null){mvChanLeave();mvChan=null;} /* something from the library or the shelves: no channel is on */if(mvRemEl)setTimeout(mvRemShow,50);
 const start=()=>{try{v.pause();}catch(e){}mvEl.dataset.paused='';mvSet('closed');mvPlay();};
 if(mvState==='closed')start();else{v.pause();mvCurtains(false,start);}} // a film already showing: the curtains close on it first
/* YOUR FILMS (Jackie, Nov 27: "when it records we can elect to add it to our own film library section with a custom title card").
   The film menu's last tab lists the films you have played a soundtrack for on the Kalimbasizer, each under the title you gave it,
   with how long it is and how much room it takes. Choosing one plays the film with your sound, after its title card. Remove takes
   one off this device. All of them together are held to SCORES_MAX (js/scores.js), and the films themselves are never stored. */
const MV_MINE={id:'mine',name:'Your films',pic:'movieroom/acc_reel.png',about:'Films that you or a friend scored.',films:[]},MV_CARDS=[['#1C1C1B','#FBF8F1'],['#F2B8A2','#1C1C1B'],['#BFD8B8','#1C1C1B'],['#C9C3E6','#1C1C1B']];
let mvCardNext=null,mvCardT=0;
const mvFilmByKey=k=>{k=scoreFilmKey(k);for(const sh of MV_SHELVES.concat(MV_MORE))for(const f of sh.films)if(scoreKey(f)===k)return f;return null;};
const mvClock=d=>Math.floor(d/60)+':'+String(Math.floor(d%60)).padStart(2,'0');
function mvCardShow(){const c=mvEl&&mvEl.querySelector('.mvcard'),q=mvCardNext;mvCardNext=null;if(!c||!q||!mvFilm||scoreKey(mvFilm)!==scoreFilmKey(q.key))return;const col=MV_CARDS[q.card]||MV_CARDS[0];
 c.style.background=col[0];c.style.color=col[1];c.innerHTML='<b></b><span></span>';c.querySelector('b').textContent=q.film;c.querySelector('span').textContent=q.by?'scored by '+q.by:''; /* no title for the soundtrack itself (Jackie, Nov 27: "No song title, it's just the score"): the card reads like the film's own, with who scored it */ /* the film's own title is the biggest thing on the card (Jackie, Nov 27: "the title of the movie has to be bigger than anything"); the name you gave your soundtrack and who scored it go under it */ /* Jackie, Nov 27: the card "shouldn't say played by or played on the kalimbasizer, instead it should say scored by and then whatever the player's chosen name is"; with no name given, that part is left off */c.hidden=false;clearTimeout(mvCardT);mvCardT=setTimeout(()=>{c.hidden=true;},3500);}
/* Share hands the soundtrack's file to the phone's own share sheet (messages, mail, AirDrop, whatever is there); where there is no
   share sheet it is saved as a download. Adding one reads a file someone sent: it must be for a film in this collection and fit. */
function mvShare(k){scoreFile(k).then(file=>{if(!file)return;if(navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:file.name}).catch(()=>{});return;}
 const u=URL.createObjectURL(file),a=document.createElement('a');a.href=u;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);mvNote('Saved as a file you can send.');}).catch(()=>mvNote('It could not be shared.',true));}
function mvAddFile(file){return scoreFromFile(file).then(rec=>{if(!mvFilmByKey(rec.key)){mvNote('That soundtrack is for a film that is not in this collection.',true);return;}
 return scoreAdd(rec).then(()=>mvScoresLoad()).then(()=>{mvNote('Added '+rec.film+(rec.by?', scored by '+rec.by:'')+'.');mvPickMine();});}).catch(e=>mvNote(e&&e.message==='full'?'Your films is full. Remove one first.':'That file is not a soundtrack.',true));}
function mvPickMine(){scoreList().then(L=>{if(!mvPickEl)return;const box=mvPickEl.querySelector('.mvmine');if(!box)return;const used=L.reduce((n,q)=>n+q.size,0);
 box.innerHTML=(L.length?L.map((q,i)=>'<div class="mvminerow"><button type="button" class="mvpfilm" data-i="'+i+'"><b></b><span></span></button><button type="button" class="mvrbtn mvmines" data-i="'+i+'">📤 Share</button><button type="button" class="mvrbtn mvminex" data-i="'+i+'">🗑️ Remove</button></div>').join(''):'<p>Nothing here yet. Tap the kalimba on the shelf, choose a film, and press Record.</p>')+'<button type="button" class="mvrbtn mvmineadd">📥 Add a soundtrack someone sent you</button><input type="file" class="mvminefile" hidden><p class="mvmineuse">Using '+scoreSize(used)+' of '+scoreSize(SCORES_MAX)+'.</p>';
 box.querySelectorAll('.mvmines').forEach(b=>b.onclick=()=>mvShare(L[+b.dataset.i].key));const fi=box.querySelector('.mvminefile');box.querySelector('.mvmineadd').onclick=()=>fi.click();fi.onchange=()=>{if(fi.files&&fi.files[0])mvAddFile(fi.files[0]);};
 box.querySelectorAll('.mvpfilm').forEach(b=>{const q=L[+b.dataset.i],f=mvFilmByKey(q.key);b.querySelector('b').textContent=q.film;b.querySelector('span').textContent=(q.by?'scored by '+q.by+' · ':'')+mvClock(q.dur)+(q.parts>1?' · '+q.parts+' parts':'')+' · '+scoreSize(q.size);b.disabled=!f;b.onclick=()=>{mvMode='mine';mvScorePick=q.key;mvCardNext=q;mvChoose(f);};});
 box.querySelectorAll('.mvminex').forEach(b=>b.onclick=()=>{const q=L[+b.dataset.i];scoreDropKey(q.key).then(()=>{if(mvScoreKey===q.key){mvScoreStop();mvScoreKey='';}return mvScoresLoad();}).then(()=>{mvNote('Removed from your films.');mvPickMine();});});});}
function mvPick(sh){if(!mvEl)return;mvPickClose();sfx('tick');sh=sh||mvLast;mvLast=sh;const seen=mvSeen(),sibs=MV_SHELVES.concat(MV_MORE,MV_MINE); /* one menu for the whole collection, whichever film thing was tapped (Jackie, Nov 27: "maybe we need all those movie clicks to lead to the same menu"); it opens on the collection you last looked at */mvPickEl=document.createElement('div');mvPickEl.className='screen mvpick';
 /* THE FILM LIBRARY'S OWN PAGE (Jackie, Nov 27: "in the film library i want it to say film library at the top and clearly organize the
    library so the ui and menu are compelling and clean"). A title bar that says Film library, with tonight's film on its right;
    under it the collections in one column down the left, each with how many films it holds, and the chosen collection's films on
    the right. It had been a picture of a reel beside a row of wrapping tabs with the collection's name as the only heading. */
 mvPickEl.innerHTML='<div class="mvpbox mvlib"><div class="mvlibhead"><h1>Film library</h1></div><div class="mvlibbody">'+
  '<div class="mvptabs">'+sibs.map(q=>'<button type="button" class="mvptab'+(q===sh?' on':'')+'" data-id="'+q.id+'" data-n="'+q.films.length+'">'+q.name+'</button>').join('')+'</div>'+
  '<div class="mvplist"><h2>'+sh.name+'</h2><p>'+sh.about+'</p>'+(sh===MV_MINE?'<div class="mvmine"></div>':'')+
  sh.films.map((f,i)=>'<button type="button" class="mvpfilm" data-i="'+i+'"><b>'+f.t+'</b><span>'+f.by+' · '+f.len+(seen.includes(f.id)?' · seen':'')+'</span></button>').join('')+'</div></div><button type="button" class="mvpx" aria-label="Close">×</button></div>';
 mvPickEl.querySelectorAll('.mvpfilm').forEach(b=>b.onclick=()=>mvChoose(sh.films[+b.dataset.i]));mvPickEl.querySelector('.mvpx').onclick=mvPickClose;/* no "Tonight's film" button (Jackie, Nov 27: "I don't want a 'tonight's film' either") */mvPickEl.querySelectorAll('.mvptab').forEach(b=>b.onclick=()=>mvPick(sibs.find(q=>q.id===b.dataset.id)));if(sh===MV_MINE)mvPickMine();
 mvPickEl.onclick=e=>{if(e.target===mvPickEl)mvPickClose();};ui.appendChild(mvPickEl);}
function openMovieRoom(){
 if(mvEl)return;
 mvEl=document.createElement('div');mvEl.className='screen movieroom';
 mvEl.innerHTML='<div class="mvstage"><video playsinline preload="none" style="'+mvPct(MV.screen)+'"></video><div class="mvcard" hidden style="'+mvPct(MV.screen)+'"></div><div class="mvchb" hidden style="'+mvPct(MV.screen)+'"></div>'+
  '<img class="mvroom" src="movieroom/room.png" alt="" draggable="false"><img class="mvroomtint" src="movieroom/room_curtains.png" alt="" draggable="false" hidden><img class="mvcurtain mvcurtL" src="movieroom/curtain_closed.png" alt="" draggable="false" style="'+mvPct(MV.curtain)+'"><img class="mvcurtain mvcurtR" src="movieroom/curtain_closed.png" alt="" draggable="false" style="'+mvPct(MV.curtain)+'">'+
  '<canvas class="mvseats" width="'+MV.W+'" height="'+MV.H+'" hidden></canvas>'+'<canvas class="mvfx" width="'+MV.W+'" height="'+MV.H+'"></canvas>'+'<canvas class="mvlights" width="'+MV.W+'" height="100"></canvas>'+
  '<button type="button" class="mvtap" aria-label="Open or close the curtains" style="'+mvPct(MV.curtain)+'"></button>'+
  MV_SHELVES.map((sh,i)=>(sh.at||[]).map(r=>'<button type="button" class="mvhot" data-shelf="'+i+'" aria-label="'+sh.name+'" style="'+mvPct(r)+'"></button>').join('')).join('')+
  '<img class="mvover mvsconce" src="movieroom/sconce_l_lit.png" alt="" draggable="false" style="'+mvPct({x:0,y:100,w:106,h:200})+'"><img class="mvover mvsconce" src="movieroom/sconce_r_lit.png" alt="" draggable="false" style="'+mvPct({x:1564,y:100,w:106,h:200})+'">'+
  '<i class="mvknobtick"></i>'+
  '<button type="button" class="mvhot mvknob" aria-label="Room lights" style="'+mvPct(MV_KNOB_TAP)+'"></button>'+MV_LAMPS.map(r=>'<button type="button" class="mvhot mvlamp" aria-label="Room lights" style="'+mvPct(r)+'"></button>').join('')+
  '<button type="button" class="mvhot mvamp" aria-label="Sound on or off" style="'+mvPct(MV_AMP)+'"></button>'+
  '<button type="button" class="mvhot mvremote" aria-label="The remote" style="'+mvPct(MV_REMOTE)+'"></button>'+
  '<img class="mvcat" alt="The cat" draggable="false" hidden>'+
  '<div class="mvnote" hidden></div><button type="button" class="mvback" aria-label="Go to another room">🚪 Rooms</button></div>';
 const v=mvEl.querySelector('video');v.addEventListener('ended',mvEnd);['play','pause','seeked','ended'].forEach(ev=>v.addEventListener(ev,()=>mvSoundApply()));['play','pause'].forEach(ev=>v.addEventListener(ev,()=>mvRemShow()));v.addEventListener('timeupdate',mvScoreTick);v.addEventListener('timeupdate',mvInterCheck);v.addEventListener('error',()=>{if(v.getAttribute('src'))mvTrouble('The film could not be reached. It needs a connection.');});v.addEventListener('playing',mvTroubleOver);
 mvEl.querySelector('.mvtap').onclick=mvScreen;mvEl.querySelector('.mvremote').onclick=mvRemote;mvEl.querySelector('.mvknob').onclick=mvLightStep;mvEl.querySelectorAll('.mvlamp').forEach(b=>b.onclick=mvLightStep);mvEl.querySelector('.mvamp').onclick=mvSoundStep;mvEl.querySelectorAll('.mvhot[data-shelf]').forEach(b=>b.onclick=()=>mvPick());mvEl.querySelector('.mvback').onclick=openRooms;
 mvEl.querySelector('.mvcat').onclick=mvCatTap;ui.appendChild(mvEl);mvSet('closed');mvCurtApply();mvBlanketApply();mvSoundApply();mvCatEnter();mvThingsWire();mvLightApply();mvScoresLoad();mvDecorShow();mvLightsDraw();MV_TOP_MASK.complete||MV_TOP_MASK.addEventListener('load',mvLightsDraw,{once:true});clearInterval(mvLightsT);mvLightsT=setInterval(mvLightsDraw,LIGHTS_TWINK);}
function closeMovieRoom(){if(!mvEl)return;mvBegun=null;clearInterval(mvLightsT);if(mvInter){clearTimeout(mvInter.t);mvLight=mvInter.light;mvInter=null;}clearTimeout(mvPopT);clearTimeout(mvPopFlyT);mvPopFly=null;mvRemEl=null;mvChan=null;clearInterval(mvGuideT);clearTimeout(mvDigitT);mvDigits='';mvPopping=null;mvHeld=null;mvFx=[];mvWho=[];mvScoreStop();closeKalimba();mvTvClose();mvSweepT.forEach(clearTimeout);mvSweepT=[];mvPickClose();mvTrayClose();clearTimeout(mvCatT);mvCat=null;clearTimeout(mvTimer);const v=mvEl.querySelector('video');try{v.pause();v.removeAttribute('src');v.load();}catch(e){}mvEl.remove();mvEl=null;mvState='closed';}
/* LEAVING A ROOM (Jackie, Nov 26: "Maybe somewhere in each room there's a leave button basically and you can then choose a room from a
   screen"). Each room has a Leave button; it opens a screen with a picture of every room, and a tap on one takes you there. Pausing a
   film is left to the film: leaving the movie room stops it. */
const ROOMS=[{id:'main',name:'The study room',pic:'movieroom/thumb_main.png'},{id:'movie',name:'The movie room',pic:'movieroom/thumb_movie.png'}];
let roomsEl=null;
function roomNow(){return movieRoomOpen()?'movie':'main';}
function closeRooms(){if(roomsEl){roomsEl.remove();roomsEl=null;}}
function goRoom(id){closeRooms();if(id===roomNow())return;if(id==='movie')openMovieRoom();else closeMovieRoom();sfx('paper');}
function openRooms(){
 if(roomsEl)return;const v=mvEl&&mvEl.querySelector('video');if(v&&!v.paused){v.pause();mvEl.dataset.paused='1';}
 roomsEl=document.createElement('div');roomsEl.className='screen rooms';const here=roomNow();
 roomsEl.innerHTML='<h2 class="rmtitle">Where would you like to go?</h2><div class="rmrow">'+ROOMS.map(r=>'<button type="button" class="rmcard" data-id="'+r.id+'"><img src="'+r.pic+'" alt="" draggable="false"><span>'+r.name+(r.id===here?' (you are here)':'')+'</span></button>').join('')+'</div>';
 roomsEl.querySelectorAll('.rmcard').forEach(b=>b.onclick=()=>goRoom(b.dataset.id));ui.appendChild(roomsEl);}
document.getElementById('leaveBtn').addEventListener('click',e=>{e.stopPropagation();openRooms();});
