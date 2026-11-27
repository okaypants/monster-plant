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
 {id:'reel',name:'Magic lantern',about:'Trick films and fairy stories from the first years of cinema.',pic:'movieroom/acc_reel.png',at:[{x:112,y:400,w:66,h:76}],films:[
  {t:'A Trip to the Moon',by:'Georges Méliès, France, 1902',len:'11 min',id:'ATripToTheMoon20Fps',f:'TripToTheMoon20Fps_512kb.mp4'},
  {t:'The Impossible Voyage',by:'Georges Méliès, France, 1904',len:'20 min',id:'The_Impossible_Voyage',f:'The_Impossible_Voyage_512kb.mp4'},
  {t:'The Kingdom of the Fairies',by:'Georges Méliès, France, 1903',len:'17 min',id:'silent-le-royaume-des-fes-aka-the-kingdom-of-the-fairies',f:'Le royaume des fes AKA The Kingdom of the Fairies.mp4'},
  {t:'The Mermaid',by:'Georges Méliès, France, 1904',len:'4 min',id:'la-sirene-1904-georges-melies',f:'La Sirène - (1904) - Georges Méliès.ia.mp4'},
  {t:'The Electric Hotel',by:'Segundo de Chomón, 1908',len:'7 min',id:'silent-the-electric-hotel',f:'The Electric Hotel.mp4'},
  {t:'Alice in Wonderland',by:'Hepworth and Stow, Britain, 1903',len:'8 min',id:'Alice_in_Wonderland_1903',f:'Alice_in_Wonderland_1903_512kb.mp4'}]},
 {id:'vhs',name:'Paper, puppets and ink',about:'Early cartoons, cut paper and puppets from Japan, Russia, Germany, France and America.',pic:'movieroom/acc_vhs.png',at:[{x:178,y:380,w:124,h:96}],films:[
  {t:'The Dull Sword',by:'Jun’ichi Kōuchi, Japan, 1917',len:'4 min',id:'namakura-gatana-1917',f:'Namakura Gatana 1917 restoration.ia.mp4'},
  {t:'The Animal Olympics',by:'Yasuji Murata, Japan, 1928',len:'13 min',id:'dobutsu-olympic-taikai_1928',f:'dobutsu-olympic-taikai_1928.ia.mp4'},
  {t:'The Insects’ Christmas',by:'Ladislas Starevich, Russia, 1913',len:'7 min',id:'silent-rozhdestvo-obitateley-lesa-aka-the-insects-christmas',f:'Rozhdestvo obitateley lesa AKA The Insect\'s Christmas.mp4'},
  {t:'Cinderella',by:'Lotte Reiniger, Germany, 1922',len:'13 min',id:'silent-aschenputtel-aka-cinderella',f:'Aschenputtel AKA Cinderella.mp4'},
  {t:'Gertie the Dinosaur',by:'Winsor McCay, America, 1914',len:'12 min',id:'silent-gertie-the-dinosaur',f:'Gertie the Dinosaur.mp4'},
  {t:'Fantasmagorie',by:'Émile Cohl, France, 1908',len:'1 min',id:'silent-fantasmagorie-aka-a-fantasy',f:'Fantasmagorie AKA A Fantasy.mp4'}]},
 {id:'bluray',name:'Slapstick matinee',about:'Silent comedies.',pic:'movieroom/acc_bluray.png',at:[{x:304,y:380,w:64,h:96}],films:[
  {t:'One Week',by:'Buster Keaton, America, 1920',len:'25 min',id:'silent-one-week',f:'One Week.mp4'},
  {t:'The Scarecrow',by:'Buster Keaton, America, 1920',len:'18 min',id:'silent-the-scarecrow',f:'The Scarecrow.mp4'},
  {t:'The Boat',by:'Buster Keaton, America, 1921',len:'23 min',id:'silent-the-boat',f:'The Boat.mp4'},
  {t:'The Rink',by:'Charlie Chaplin, America, 1916',len:'24 min',id:'silent-the-rink',f:'The Rink.mp4'}]},
 {id:'swim',name:'Things that swim',about:'Sea creatures, divers and plain waves, from 1900 to 1929.',pic:'movieroom/acc_reel.png',at:[{x:270,y:250,w:98,h:100}],films:[
  {t:'Hyas and Stenorhynchus',by:'Jean Painlevé, France, 1929',len:'10 min',id:'painleve-jean-hyas-et-stenorinques',f:'Painleve-Jean_Hyas-et-stenorinques.mp4'},
  {t:'The Pearl Fisher',by:'Pathé, France, 1907',len:'8 min',id:'silent-le-pcheur-de-perles-aka-the-pearl-fisher',f:'Le pcheur de perles AKA The Pearl Fisher.mp4'},
  {t:'Romance of Pearl Culture in Japan',by:'filmed in Ise, Japan, 1922',len:'10 min',id:'RomanceOfPearlCultureInJapan1922',f:'RomanceOfPearlCultureInJapan1922.mp4'},
  {t:'Sea Effects',by:'France, 1906',len:'2 min',id:'silent-effets-de-mer',f:'Effets de mer.mp4'},
  {t:'Rough Sea',by:'1900',len:'1 min',id:'silent-rough-sea',f:'Rough Sea.mp4'}]},
 {id:'small',name:'Small lives',about:'Flowers, butterflies and insects, some real and some puppets.',pic:'movieroom/acc_reel.png',with:'swim',films:[
  {t:'Fruits and Flowers',by:'Gaumont, France, 1912, in early colour',len:'3 min',id:'1912-chronochrome-gaumont-flowers',f:'1912 Chronochrome Gaumont Flowers.ia.mp4'},
  {t:'The Ant and the Grasshopper',by:'Ladislas Starevich, Russia, about 1911',len:'5 min',id:'LadislasStarevichTheAntAndTheGrasshopper1911',f:'Ladislas Starevich - The Ant And The Grasshopper (1911).mp4'},
  {t:'The Beautiful Leukanida',by:'Ladislas Starevich, Russia, 1912',len:'9 min',id:'1912LadislasStarevichTheBeautifulLeukanida.3gp',f:'1912 Ladislas Starevich - The Beautiful Leukanida.mp4'},
  {t:'A Butterfly’s Metamorphosis',by:'Gaston Velle, France, 1904',len:'2 min',id:'silent-la-mtamorphose-du-papillon-aka-a-butterflys-metamorphosis',f:'La mtamorphose du papillon AKA A Butterfly\'s Metamorphosis.mp4'},
  {t:'The Tulips',by:'Segundo de Chomón, France, 1907',len:'4 min',id:'LesTulipes',f:'1907SegundoDeChomnLesTulipestheTulips.mp4'}]},
 {id:'colour',name:'Colour before colour',about:'Films painted by hand, frame by frame, and the first tries at real colour.',pic:'movieroom/acc_reel.png',with:'reel',films:[
  {t:'Annabelle Butterfly Dance',by:'Edison, America, 1894',len:'1 min',id:'annabelle-butterfly-dance-1894',f:'Annabelle Butterfly Dance (1894).mp4'},
  {t:'Serpentine Dance by Mme Bob Walter',by:'Alice Guy, France, 1897',len:'2 min',id:'danse-serpentine-par-mme-bob-walter',f:'Danse serpentine par Mme Bob Walter.ia.mp4'},
  {t:'Creation of the Serpentine',by:'Segundo de Chomón, France, 1908',len:'5 min',id:'CrationDeLaSerpentine',f:'SegundoDeChomnCrationDeLaSerpentine1908CreationOfTheSerpentine_512kb.mp4'},
  {t:'Loie Fuller',by:'Pathé, France, 1902',len:'2 min',id:'silent-loie-fuller',f:'Loie Fuller.mp4'},
  {t:'A Trip to Jupiter',by:'Segundo de Chomón, France, 1909',len:'8 min',id:'silent-le-voyage-sur-jupiter-aka-a-trip-to-jupiter',f:'Le voyage sur Jupiter AKA A Trip to Jupiter.mp4'},
  {t:'Venice, Queen of the Adriatic',by:'Gaumont, France, 1912, in early colour',len:'8 min',id:'1912-chronochrome-gaumont-venice',f:'1912 Chronochrome Gaumont Venice.ia.mp4'}]}];
const MV_REMOTE={x:1326,y:380,w:54,h:96};
const mvSrc=f=>f.src?f.src+'?t='+Math.floor(Date.now()/12e5):'https://archive.org/download/'+encodeURIComponent(f.id)+'/'+encodeURIComponent(f.f); // a live loop is asked for afresh every twenty minutes
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
let mvNoteT=0;function mvNote(t,stay){const n=mvEl&&mvEl.querySelector('.mvnote');if(!n)return;clearTimeout(mvNoteT);n.textContent=t||'';n.hidden=!t;if(t&&!stay)mvNoteT=setTimeout(()=>{n.hidden=true;},5000);} // a film's name shows for a few seconds; trouble stays
/* Jackie, Nov 27: "you can open the curtains but I think you should be able to close them too by clicking the screen and only
   control playback with the remote". A tap on the curtains or the screen opens or closes the curtains and nothing else; closing
   them pauses the film where it is. The remote starts and pauses the film, and opens the curtains first if they are closed. */
function mvLoad(){const v=mvEl.querySelector('video'),f=mvFilm,src=mvSrc(f);if(v.dataset.film!==src){v.src=src;v.dataset.film=src;}v.loop=!!f.loop;if(mvMode==='mine'&&!mvHasScore(f))mvMode='film';v.muted=mvMode!=='film';return v;}
function mvStart(){const v=mvLoad(),p=v.play();mvCardShow();mvEl.dataset.paused='';mvLightApply();if(p&&p.catch)p.catch(()=>mvNote('The film could not start. It needs a connection.',true));}
function mvScreen(){if(!mvEl||mvState==='half')return;if(mvInterEnd())return;const v=mvEl.querySelector('video');sfx('paper');
 if(mvState==='closed'){mvEl.dataset.paused=v.paused?'1':'';mvCurtains(true);} // the curtains only: whatever was on is still there, paused, and if nothing was chosen the screen is black
 else{v.pause();mvEl.dataset.paused='1';mvCurtains(false);}}
function mvPlay(){if(!mvEl||mvState==='half')return;if(mvInterEnd())return;const v=mvEl.querySelector('video'),f=mvFilm;
 if(!f){mvPick();mvNote('Choose something to watch.');return;}
 if(mvState==='closed'){mvNote(f.t+', '+f.by);sfx('paper');mvLoad();mvCurtains(true,mvStart);return;}
 if(v.paused)mvStart();else{v.pause();mvEl.dataset.paused='1';mvLightApply();}}
function mvEnd(){if(!mvEl||mvState==='closed'||!mvFilm)return;if(!mvFilm.loop&&mvFilm.f)mvSeenAdd(mvFilm);const v=mvEl.querySelector('video');v.pause();mvEl.dataset.paused='';mvCurtains(false,()=>{try{v.currentTime=0;}catch(e){}mvNote('');});}
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
let kalEl=null,mvScores=new Set(),mvMode='film',mvScoreA=null,mvScoreKey='';
function mvScoresLoad(){return scoreKeys().then(k=>{mvScores=new Set(k);});}
let mvScorePick=''; /* which soundtrack to play for a film that has more than one (yours, and others added from files): the one chosen in Your films, else your own, else the first there is */
function mvScoreFor(f){if(!f)return '';const fk=scoreKey(f);if(mvScorePick&&scoreFilmKey(mvScorePick)===fk&&mvScores.has(mvScorePick))return mvScorePick;if(mvScores.has(fk))return fk;for(const k of mvScores)if(scoreFilmKey(k)===fk)return k;return '';}
function mvHasScore(f){return !!mvScoreFor(f);}
function mvScoreStop(){if(mvScoreA){try{mvScoreA.pause();}catch(e){}}}
function mvSoundApply(){if(!mvEl)return;const v=mvEl.querySelector('video'),mine=mvMode==='mine'&&mvHasScore(mvFilm);v.muted=mvMode!=='film';mvSound=mvMode!=='off';
 if(!mine){mvScoreStop();return;}
 const k=mvScoreFor(mvFilm),go=()=>{if(!mvScoreA||mvMode!=='mine')return;if(v.paused||mvState!=='open'){mvScoreA.pause();return;}if(Math.abs(mvScoreA.currentTime-v.currentTime)>.35){try{mvScoreA.currentTime=Math.min(v.currentTime,mvScoreA.duration||v.currentTime);}catch(e){}}const p=mvScoreA.play();if(p&&p.catch)p.catch(()=>{});};
 if(mvScoreKey===k&&mvScoreA){go();return;}
 mvScoreStop();scoreGetKey(k).then(t=>{if(!t||!mvEl||mvScoreFor(mvFilm)!==k)return;if(mvScoreA&&mvScoreA.src)URL.revokeObjectURL(mvScoreA.src);mvScoreA=new Audio(URL.createObjectURL(t.blob));mvScoreKey=k;go();});}
function mvSoundStep(){const L=mvHasScore(mvFilm)?['film','mine','off']:['film','off'];mvMode=L[(L.indexOf(mvMode)+1)%L.length]||'film';sfx('tick');mvSoundApply();mvNote(mvMode==='film'?'The film’s own sound.':mvMode==='mine'?'Your soundtrack.':'Sound off.');}
function mvKalimbaFilms(){return MV_SHELVES;} function mvKalimbaSrc(f){return mvSrc(f);} // what the Kalimbasizer's page asks this one for (a page can call another page's functions, not read its constants)
function kalimbaOpen(){return !!(kalEl&&kalEl.isConnected);}
function openKalimba(){if(kalEl||!mvEl)return;mvTrayClose();const v=mvEl.querySelector('video');if(!v.paused){v.pause();mvEl.dataset.paused='1';mvLightApply();}mvScoreStop();
 if(typeof radioHold==='function')radioHold(true);kalEl=document.createElement('div');kalEl.className='screen sampler kalimba';
 const f=document.createElement('iframe');f.src='kalimba.html?film='+encodeURIComponent(mvFilm&&mvFilm.f?mvFilm.id:'');f.title='The Kalimbasizer';f.setAttribute('allow','autoplay');kalEl.appendChild(f);ui.appendChild(kalEl);}
function closeKalimba(){if(!kalEl)return;kalEl.remove();kalEl=null;if(typeof radioHold==='function')radioHold(false);mvScoresLoad();}
addEventListener('message',e=>{if(!kalEl||e.source!==kalEl.firstChild.contentWindow)return;if(e.data==='mp-kalimba-close')closeKalimba();else if(e.data==='mp-kalimba-score'){mvScoreStop();mvScoreKey='';mvScoresLoad();}});
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
function mvRemote(){const v=mvEl.querySelector('video'),on=mvState==='open'&&!v.paused;
 const el=mvPanel('mvremotep','<img src="movieroom/acc_remote_on.png" alt="" draggable="false"><div class="mvplist"><h2>The remote</h2><button type="button" class="mvrbtn mvrplay">'+(!mvFilm?'Film library':on?'Pause':'Play')+'</button>'+(mvFilm?' <button type="button" class="mvrbtn mvrlib">Film library</button>':'')+'<p>Channels</p>'+
  MV_LIVE.map((c,i)=>'<button type="button" class="mvpfilm" data-i="'+i+'"><b></b><span></span></button>').join('')+'</div>');
 el.querySelector('.mvrplay').onclick=()=>{mvTrayClose();mvPlay();};const lib=el.querySelector('.mvrlib');if(lib)lib.onclick=()=>{mvTrayClose();mvPick();};
 el.querySelectorAll('.mvpfilm').forEach(b=>{const c=MV_LIVE[+b.dataset.i];b.querySelector('b').textContent=c.t;b.querySelector('span').textContent=c.by;b.onclick=()=>{mvTrayClose();mvLiveOn(c);};});sfx('tick');}
/* THE THINGS ON THE SHELVES (Jackie, Nov 27: "I want to work on all the stuff in the shelves they should work"). Each does one thing:
   the popcorn machine and the stack of buckets offer five kinds of popcorn; the machine pops for a moment, a bucket lands on the couch,
     and every monster in the room that is old enough to eat is a little fuller;
   the soda fountain and the cups offer four drinks; the tap pours, a cup lands on the couch, and nobody in the room is thirsty;
   the 3D glasses turn the film amber, blue or rose, as silent films were often tinted, and then plain again;
   the row of books opens the books about film, and the box set opens its three books, each read a page at a time. */
const MV_CORN=[['butter','Butter popcorn'],['caramel','Caramel popcorn'],['cheese','Cheese popcorn'],['seaweed','Seaweed popcorn'],['charcoal','Charcoal popcorn']],
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
 for(const p of mvFx){p.vy+=p.g;p.x+=p.vx;p.y+=p.vy;p.life--;
  if(p.hitY!=null&&p.vy<0&&p.y<=p.hitY){p.vy=Math.abs(p.vy)*.25;p.vx*=-.5;p.hitY=null;} // it meets the screen and drops
  if(p.floor!=null&&p.y>=p.floor&&p.vy>0){p.y=p.floor;p.vy=p.vy>2?-p.vy*.35:0;p.vx*=.6;if(p.land){const f=p.land;p.land=null;f();}}
  if(p.sway)p.vx=Math.sin(p.life/11)*.5;
  const X=Math.round(p.x/U)*U,Y=Math.round(p.y/U)*U;x.fillStyle=p.c;
  if(p.b){x.fillRect(X-4,Y-8,8,16);x.fillRect(X-8,Y-4,16,8);x.fillStyle='rgba(255,255,255,.55)';x.fillRect(X-4,Y-4,4,4);}else{x.fillRect(X-4,Y-4,8,8);x.fillStyle='#fff8e6';x.fillRect(X-4,Y-4,4,4);}}
 mvFx=mvFx.filter(p=>p.life>0&&p.y<p.end);
 const now=performance.now();if(now>mvBurpT){mvBurpT=now+rnd(5000,10000);const L=mvWho.filter(w=>w.soda);if(L.length){const w=L[Math.floor(Math.random()*L.length)];mvFx.push({x:w.x+rnd(-10,10),y:MV_SEAT.top-w.pic.height*MV_SEAT.show-6,vx:0,vy:-1.1,g:0,sway:true,life:230,end:1e9,b:true,c:MV_SODA_COL[w.soda]});}}
 if(mvFx.length||mvWho.some(w=>w.soda)||mvPopping)requestAnimationFrame(mvFxLoop);else mvFxOn=false;}
function mvFxGo(){if(!mvFxOn){mvFxOn=true;requestAnimationFrame(mvFxLoop);}}
function mvKernel(x,y,vx,vy,o){mvFx.push(Object.assign({x,y,vx,vy,g:.5,life:400,end:MV_SEAT.top-2,c:'#f6e3a1'},o||{}));if(mvFx.length>220)mvFx.shift();mvFxGo();}
function mvCatPounce(x){if(!mvCat)return;clearTimeout(mvCatT);mvCat.awake=true;mvCatShow(x<mvCat.x?'leap_l':'pounce');setTimeout(()=>{if(mvCat&&mvCat.awake)mvCatShow('sit1');},900);mvCatT=setTimeout(mvCatSleep,MV_CAT_NAP);}
/* holding the machine */
function mvPopDown(){if(mvPopping)return;const t0=performance.now();mvPopping={t0,spilled:false};mvOver('mvpop','movieroom/acc_machine_pop.png',MV_ON.pop);sfx('tick');mvFxGo();
 const tick=()=>{if(!mvPopping||!mvEl)return;const held=performance.now()-mvPopping.t0;
  mvKernel(MV_ON.pop.x+76+rnd(-30,30),MV_ON.pop.y+120,rnd(-1.5,1.5),rnd(-5,-2),{g:.4,life:26,end:1e9}); // popping inside the glass
  if(held>3200){if(!mvPopping.spilled){mvPopping.spilled=true;mvNote('It’s overflowing.');} // over the top, down to the floor on the left, for the cat
   mvKernel(MV_ON.pop.x+rnd(10,140),MV_ON.pop.y+150,rnd(-3.5,-1),rnd(-4,-1),{end:1e9,floor:rnd(880,925),life:900,land:Math.random()<.2?()=>mvCatPounce(140):null});}
  mvPopT=setTimeout(tick,90);};tick();}
const MV_POP_MIN=1300; // a tap still pops for a moment before the kinds are offered (Jackie, Nov 27: "the popcorn doesn't pop": on a phone a tap was over before anything showed)
function mvPopUp(){if(!mvPopping||mvPopping.ending)return;const left=MV_POP_MIN-(performance.now()-mvPopping.t0),end=()=>{if(!mvPopping)return;clearTimeout(mvPopT);mvPopping=null;const im=mvEl&&mvEl.querySelector('.mvpop');if(im)im.hidden=true;if(mvEl)mvOffer('corn');};
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
function mvRead(book,i=0){const n=book.pages.length;i=clamp(i,0,n-1);
 const el=mvPanel('mvread','<div class="mvplist"><h2></h2><p class="mvrby"></p><p class="mvrtext"></p><div class="mvrfoot"><button type="button" class="mvrbtn mvrprev">Back</button><span>Page '+(i+1)+' of '+n+'</span><button type="button" class="mvrbtn mvrnext">'+(i<n-1?'Next':'Close the book')+'</button></div></div>');
 el.querySelector('h2').textContent=book.t;el.querySelector('.mvrby').textContent=book.by;el.querySelector('.mvrtext').textContent=book.pages[i];
 const pv=el.querySelector('.mvrprev');pv.disabled=i===0;pv.onclick=()=>mvRead(book,i-1);el.querySelector('.mvrnext').onclick=()=>i<n-1?mvRead(book,i+1):mvTrayClose();sfx('paper');}
function mvShelfOfBooks(title,about,books){const el=mvPanel('mvbooks','<img src="movieroom/acc_book_open.png" alt="" draggable="false"><div class="mvplist"><h2>'+title+'</h2><p>'+about+'</p>'+
  books.map((b,i)=>'<button type="button" class="mvpfilm" data-i="'+i+'"><b></b><span></span></button>').join('')+'</div>');
 el.querySelectorAll('.mvpfilm').forEach(b=>{const k=books[+b.dataset.i];b.querySelector('b').textContent=k.t;b.querySelector('span').textContent=k.by;b.onclick=()=>mvRead(k);});}
function mvBoxSet(){mvShelfOfBooks('The box set','Three small books about a famous trilogy.',MV_BOXSET);}
function mvFilmBooks(){mvShelfOfBooks('Books about film','Old books about the movies, in their own words, and three small books about a famous trilogy.',(mvBooks||[]).concat(MV_BOXSET));} // the box set's three books live here now that the Kalimbasizer has its place
fetch('movieroom/books.json').then(r=>r.ok?r.json():null).then(j=>{if(j&&j.books)mvBooks=j.books.filter(b=>b.pages&&b.pages.length).map(b=>({t:b.title,by:b.by+', '+b.year,pages:b.pages}));}).catch(()=>{});
function mvThingsWire(){const st2=mvEl.querySelector('.mvstage'),add=(k,label,fn)=>{const b=document.createElement('button');b.type='button';b.className='mvhot mvthing';b.dataset.k=k;b.setAttribute('aria-label',label);b.style.cssText=mvPct(MV_SPOTS[k]);b.onclick=fn;st2.insertBefore(b,mvEl.querySelector('.mvnote'));};
 add('machine','Popcorn',()=>{});add('buckets','Popcorn',()=>mvOffer('corn'));{const m=st2.querySelector('.mvthing[data-k=machine]');m.onclick=null;m.style.touchAction='none';m.addEventListener('pointerdown',e=>{e.preventDefault();try{m.setPointerCapture(e.pointerId);}catch(x){}mvPopDown();});['pointerup','pointercancel'].forEach(ev=>m.addEventListener(ev,mvPopUp));m.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')mvOffer('corn');});}
 mvWho.forEach((w,i)=>{const b=document.createElement('button');b.type='button';b.className='mvhot mvwho';b.dataset.i=i;b.setAttribute('aria-label',w.name);const h=w.pic.height*MV_SEAT.show;b.style.cssText=mvPct({x:w.x-w.pic.width/2,y:MV_SEAT.top-h,w:w.pic.width,h});b.onclick=()=>mvWhoTap(i);st2.insertBefore(b,mvEl.querySelector('.mvnote'));});add('fountain','Soda',()=>mvOffer('soda'));add('cups','Soda',()=>mvOffer('soda'));
 for(const k in MV_DRAWERS){MV_SPOTS['dr_'+k]=MV_DRAWERS[k];add('dr_'+k,k==='decor'?'The decorations drawer':k==='toys'?'The cat toys drawer':'The string lights drawer',()=>mvDrawer(k));}
 add('glasses','Tint the film',mvGlasses);add('boxset','The Kalimbasizer',openKalimba);add('books','Books about film',mvFilmBooks);mvEl.dataset.tint=MV_TINTS[mvTint];}
/* THE DRAWERS (Jackie, Nov 27: "Maybe we should put something in each drawer in the movie room"; "Decorations go in a drawer. Cat toys
   in another. String lights in another."). The room has six drawers. Three are used so far:
   - the left-hand unit's drawer holds the decorations: choose an occasion and its garland hangs across the back of the couch
     and its floor piece stands at the left end of the rug (the screen is never covered);
   - the first drawer under the screen holds the cat's toys: choose one and the cat wakes to play with it;
   - the right-hand unit's drawer holds the string lights: a strand along the top of the wall, behind the plants, twinkling as
     in the study room.
   What is up is remembered with the save (mvDecor, mvLights). */
const MV_DRAWERS={decor:{x:118,y:604,w:246,h:60},lights:{x:412,y:606,w:200,h:50},toys:{x:628,y:606,w:202,h:50}}/* the first three drawers from the left, in the order you would dress a room: decorations, then string lights, then the cat's toys (Jackie, Nov 27: "we also want the drawers to be logically organized left to right"); the other three are empty for now */,MV_TOP_MASK=new Image();MV_TOP_MASK.src='movieroom/topmask.png';
let mvLightsT=0;
function mvLightsDraw(){const c=mvEl&&mvEl.querySelector('.mvlights');if(!c)return;const x=c.getContext('2d');x.globalCompositeOperation='source-over';x.clearRect(0,0,c.width,c.height);let n=st.mvLights;
 if(!n||typeof LIGHTS_IMG==='undefined')return;if(n==='auto')n=lightsAuto(st.mvDecor); /* Seasonal: with the movie room's decorations, or the time of year */const on=LIGHTS_IMG[n+'_on'],off=LIGHTS_IMG[n+'_off'];if(!ok(on)||!ok(off)||!MV_TOP_MASK.complete)return;const ox=35,oy=6;x.drawImage(on,ox,oy);
 const B=LIGHTS_META&&LIGHTS_META[n]&&LIGHTS_META[n].bulbs;if(B)for(const i of lightsOut(B.length)){const [bx,by,bw,bh]=B[i];x.clearRect(ox+bx,oy+by,bw,bh);x.drawImage(off,bx,by,bw,bh,ox+bx,oy+by,bw,bh);}
 x.globalCompositeOperation='destination-in';x.drawImage(MV_TOP_MASK,0,0);}
function mvLightsSet(n){st.mvLights=n||'';if(st.started)save();mvLightsDraw();sfx(n?'chime':'tick');mvNote(n?'The string lights are up.':'The string lights are back in the drawer.');}
function mvDecorShow(){if(!mvEl)return;const id=st.mvDecor,g=mvEl.querySelector('.mvgarland'),f=mvEl.querySelector('.mvfloorpiece');if(g)g.hidden=true;if(f)f.hidden=true;if(!id)return;
 mvOnCouch('mvgarland','decor/'+id+'_w.png',{x:835,y:818,k:1});const s=typeof DECOR_SETS!=='undefined'&&DECOR_SETS.find(q=>q.id===id),fl=s&&s.floor;
 if(fl)mvOnCouch('mvfloorpiece',fl==='pumpkin'?'pumpkin1.png':fl==='tree'?'tree1.png':'decor/'+fl+'.png',{x:96,y:912,k:fl==='pumpkin'||fl==='tree'?.5:1});}
function mvDecorSet(id){st.mvDecor=id||'';if(st.started)save();mvDecorShow();mvLightsDraw();sfx(id?'chime':'tick');const s=id&&DECOR_SETS.find(q=>q.id===id);mvNote(s?'The movie room is decorated for '+s.name+'.':'The decorations are back in the drawer.');}
/* THE DRAWERS' MENUS (Jackie, Nov 27: "within the drawers the menus should be neat with each image tightly managed"). All three
   are the same grid of equal tiles: a picture held inside a box of one size, with its name underneath. A decoration shows its floor
   piece, a strand shows its first few bulbs, a toy shows itself. Taking things down is the first tile when something is up. */
function mvDrawerTile(id,name,pic,on){return '<button type="button" class="mvdt'+(on?' on':'')+'" data-id="'+id+'"><i'+(pic?' style="background-image:url('+pic+')"':'')+(pic&&pic.includes('lights_')?' class="strand"':'')+'>'+(pic?'':'\u00d7')+'</i><span>'+name+'</span></button>';}
function mvDecorPic(s){return s.floor==='pumpkin'?PUMPKIN[0].src:s.floor==='tree'?TREE[0].src:'decor/'+s.floor+'.png';}
function mvDrawer(k){let h='',pick;
 if(k==='decor'){const t=s=>mvDrawerTile(s.id,s.name,mvDecorPic(s),st.mvDecor===s.id);pick=mvDecorSet;
  h='<h2>Decorations</h2><div class="mvdgrid">'+(st.mvDecor?mvDrawerTile('','Take them down',''):'')+'<div class="mvhead">Seasons</div>'+decorSeasonal().map(t).join('')+'<div class="mvhead">Holidays</div>'+decorHolidays().map(t).join('')+'</div>';}
 else if(k==='lights'){pick=mvLightsSet;h='<h2>String lights</h2><div class="mvdgrid">'+(st.mvLights?mvDrawerTile('','Take them down',''):'')+[['auto','Seasonal']].concat(LIGHTS_KINDS).map(([id,n])=>mvDrawerTile(id,n,'decor/lights_'+(id==='auto'?lightsAuto(st.mvDecor):id)+'_on.png',st.mvLights===id)).join('')+'</div>';}
 else{pick=id=>mvToy(CUB_TOYS.find(t=>t.id===id));h='<h2>Cat toys</h2><div class="mvdgrid">'+CUB_TOYS.map(t=>mvDrawerTile(t.id,t.name,CUB_IMG[t.id].src)).join('')+'</div>';}
 const el=mvPanel('mvdrawer','<div class="mvplist">'+h+'</div>');el.querySelectorAll('.mvdt').forEach(b=>b.onclick=()=>{mvTrayClose();pick(b.dataset.id);});}
function mvToy(t){if(!mvCat){mvNote('The cat is not here.');return;}const left=mvCat.x>835?-1:1;mvOnCouch('mvtoy',CUB_IMG[t.id].src,{x:mvCat.x+left*86,y:mvCat.y,k:mvCat.k*1.1});sfx('chime');
 clearTimeout(mvCatT);mvCat.awake=true;let at=0;for(const [pose,sec] of t.seq){if(!at)mvCatShow(pose);else setTimeout(()=>{if(mvCat&&mvCat.awake)mvCatShow(pose);},at*1000);at+=sec;} // the same poses, in the same order, as with that toy in the study room
 if(t.pic)setTimeout(()=>{const im=mvEl&&mvEl.querySelector('.mvtoy');if(im)im.src=CUB_IMG[t.pic].src;},300);mvCatT=setTimeout(mvCatSleep,MV_CAT_NAP);
 const who=typeof catName==='function'?catName():'The cat';mvNote(who+' '+t.say);}
/* TONIGHT'S FILM, AND WHAT YOU HAVE SEEN. The button at the top of the film menu puts on tonight's film: one of the collection, the
   same all day and a different one tomorrow. A film watched to its end is remembered on this device and marked "seen" in its list. */
const MV_AMP={x:1392,y:398,w:156,h:78},MV_SEEN_KEY='monsterplant.films.seen';
function mvSeen(){try{return JSON.parse(localStorage.getItem(MV_SEEN_KEY)||'[]');}catch(e){return [];}}
function mvSeenAdd(f){try{const L=mvSeen();if(!L.includes(f.id)){L.push(f.id);localStorage.setItem(MV_SEEN_KEY,JSON.stringify(L));}}catch(e){}}
function mvTonight(){const all=MV_SHELVES.flatMap(s=>s.films),d=new Date(),n=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()))/864e5);return all[n%all.length];}
/* choosing a film: a tap on the reels, the tapes or the discs opens that shelf's list */
let mvPickEl=null,mvLast=MV_SHELVES[0];
function mvPickClose(){if(mvPickEl){mvPickEl.remove();mvPickEl=null;}}
function mvChoose(f){mvPickClose();const v=mvEl.querySelector('video');mvFilm=f;
 const start=()=>{try{v.pause();}catch(e){}mvEl.dataset.paused='';mvSet('closed');mvPlay();};
 if(mvState==='closed')start();else{v.pause();mvCurtains(false,start);}} // a film already showing: the curtains close on it first
/* YOUR FILMS (Jackie, Nov 27: "when it records we can elect to add it to our own film library section with a custom title card").
   The film menu's last tab lists the films you have played a soundtrack for on the Kalimbasizer, each under the title you gave it,
   with how long it is and how much room it takes. Choosing one plays the film with your sound, after its title card. Remove takes
   one off this device. All of them together are held to SCORES_MAX (js/scores.js), and the films themselves are never stored. */
const MV_MINE={id:'mine',name:'Your films',pic:'movieroom/acc_reel.png',about:'Films that you or a friend scored.',films:[]},MV_CARDS=[['#1C1C1B','#FBF8F1'],['#F2B8A2','#1C1C1B'],['#BFD8B8','#1C1C1B'],['#C9C3E6','#1C1C1B']];
let mvCardNext=null,mvCardT=0;
const mvFilmByKey=k=>{k=scoreFilmKey(k);for(const sh of MV_SHELVES)for(const f of sh.films)if(scoreKey(f)===k)return f;return null;};
const mvClock=d=>Math.floor(d/60)+':'+String(Math.floor(d%60)).padStart(2,'0');
function mvCardShow(){const c=mvEl&&mvEl.querySelector('.mvcard'),q=mvCardNext;mvCardNext=null;if(!c||!q||!mvFilm||scoreKey(mvFilm)!==scoreFilmKey(q.key))return;const col=MV_CARDS[q.card]||MV_CARDS[0];
 c.style.background=col[0];c.style.color=col[1];c.innerHTML='<b></b><span></span>';c.querySelector('b').textContent=q.film||q.title;c.querySelector('span').textContent=[q.film?q.title:'',q.by?'scored by '+q.by:''].filter(Boolean).join(' · '); /* the film's own title is the biggest thing on the card (Jackie, Nov 27: "the title of the movie has to be bigger than anything"); the name you gave your soundtrack and who scored it go under it */ /* Jackie, Nov 27: the card "shouldn't say played by or played on the kalimbasizer, instead it should say scored by and then whatever the player's chosen name is"; with no name given, that part is left off */c.hidden=false;clearTimeout(mvCardT);mvCardT=setTimeout(()=>{c.hidden=true;},3500);}
/* Share hands the soundtrack's file to the phone's own share sheet (messages, mail, AirDrop, whatever is there); where there is no
   share sheet it is saved as a download. Adding one reads a file someone sent: it must be for a film in this collection and fit. */
function mvShare(k){scoreFile(k).then(file=>{if(!file)return;if(navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:file.name}).catch(()=>{});return;}
 const u=URL.createObjectURL(file),a=document.createElement('a');a.href=u;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);mvNote('Saved as a file you can send.');}).catch(()=>mvNote('It could not be shared.',true));}
function mvAddFile(file){return scoreFromFile(file).then(rec=>{if(!mvFilmByKey(rec.key)){mvNote('That soundtrack is for a film that is not in this collection.',true);return;}
 return scoreAdd(rec).then(()=>mvScoresLoad()).then(()=>{mvNote('Added '+(rec.title||rec.film)+(rec.by?', scored by '+rec.by:'')+'.');mvPickMine();});}).catch(e=>mvNote(e&&e.message==='full'?'Your films is full. Remove one first.':'That file is not a soundtrack.',true));}
function mvPickMine(){scoreList().then(L=>{if(!mvPickEl)return;const box=mvPickEl.querySelector('.mvmine');if(!box)return;const used=L.reduce((n,q)=>n+q.size,0);
 box.innerHTML=(L.length?L.map((q,i)=>'<div class="mvminerow"><button type="button" class="mvpfilm" data-i="'+i+'"><b></b><span></span></button><button type="button" class="mvrbtn mvmines" data-i="'+i+'">Share</button><button type="button" class="mvrbtn mvminex" data-i="'+i+'">Remove</button></div>').join(''):'<p>Nothing here yet. Tap the kalimba on the shelf, choose a film, and press Record.</p>')+'<button type="button" class="mvrbtn mvmineadd">Add a soundtrack someone sent you</button><input type="file" class="mvminefile" hidden><p class="mvmineuse">Using '+scoreSize(used)+' of '+scoreSize(SCORES_MAX)+'.</p>';
 box.querySelectorAll('.mvmines').forEach(b=>b.onclick=()=>mvShare(L[+b.dataset.i].key));const fi=box.querySelector('.mvminefile');box.querySelector('.mvmineadd').onclick=()=>fi.click();fi.onchange=()=>{if(fi.files&&fi.files[0])mvAddFile(fi.files[0]);};
 box.querySelectorAll('.mvpfilm').forEach(b=>{const q=L[+b.dataset.i],f=mvFilmByKey(q.key);b.querySelector('b').textContent=q.title||q.film;b.querySelector('span').textContent=(q.title?q.film+' · ':'')+(q.by?'scored by '+q.by+' · ':'')+mvClock(q.dur)+' · '+scoreSize(q.size);b.disabled=!f;b.onclick=()=>{mvMode='mine';mvScorePick=q.key;mvCardNext=q;mvChoose(f);};});
 box.querySelectorAll('.mvminex').forEach(b=>b.onclick=()=>{const q=L[+b.dataset.i];scoreDropKey(q.key).then(()=>{if(mvScoreKey===q.key){mvScoreStop();mvScoreKey='';}return mvScoresLoad();}).then(()=>{mvNote('Removed from your films.');mvPickMine();});});});}
function mvPick(sh){if(!mvEl)return;mvPickClose();sfx('tick');sh=sh||mvLast;mvLast=sh;const seen=mvSeen(),sibs=MV_SHELVES.concat(MV_MINE); /* one menu for the whole collection, whichever film thing was tapped (Jackie, Nov 27: "maybe we need all those movie clicks to lead to the same menu"); it opens on the collection you last looked at */mvPickEl=document.createElement('div');mvPickEl.className='screen mvpick';
 mvPickEl.innerHTML='<div class="mvpbox"><img src="'+sh.pic+'" alt="" draggable="false"><div class="mvplist"><button type="button" class="mvrbtn mvtonight"></button>'+(sibs.length>1?'<div class="mvptabs">'+sibs.map(q=>'<button type="button" class="mvptab'+(q===sh?' on':'')+'" data-id="'+q.id+'">'+q.name+'</button>').join('')+'</div>':'')+'<h2>'+sh.name+'</h2><p>'+sh.about+'</p>'+(sh===MV_MINE?'<div class="mvmine"></div>':'')+
  sh.films.map((f,i)=>'<button type="button" class="mvpfilm" data-i="'+i+'"><b>'+f.t+'</b><span>'+f.by+' · '+f.len+(seen.includes(f.id)?' · seen':'')+'</span></button>').join('')+'</div><button type="button" class="mvpx" aria-label="Close">×</button></div>';
 mvPickEl.querySelectorAll('.mvpfilm').forEach(b=>b.onclick=()=>mvChoose(sh.films[+b.dataset.i]));mvPickEl.querySelector('.mvpx').onclick=mvPickClose;{const tb=mvPickEl.querySelector('.mvtonight'),tf=mvTonight();tb.textContent='Tonight’s film: '+tf.t;tb.onclick=()=>{mvChoose(tf);mvNote('Tonight’s film is '+tf.t+'.');};}mvPickEl.querySelectorAll('.mvptab').forEach(b=>b.onclick=()=>mvPick(sibs.find(q=>q.id===b.dataset.id)));if(sh===MV_MINE)mvPickMine();
 mvPickEl.onclick=e=>{if(e.target===mvPickEl)mvPickClose();};ui.appendChild(mvPickEl);}
function openMovieRoom(){
 if(mvEl)return;
 mvEl=document.createElement('div');mvEl.className='screen movieroom';
 mvEl.innerHTML='<div class="mvstage"><video playsinline preload="none" style="'+mvPct(MV.screen)+'"></video><div class="mvcard" hidden style="'+mvPct(MV.screen)+'"></div>'+
  '<img class="mvroom" src="movieroom/room.png" alt="" draggable="false"><img class="mvcurtain mvcurtL" src="movieroom/curtain_closed.png" alt="" draggable="false" style="'+mvPct(MV.curtain)+'"><img class="mvcurtain mvcurtR" src="movieroom/curtain_closed.png" alt="" draggable="false" style="'+mvPct(MV.curtain)+'">'+
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
 const v=mvEl.querySelector('video');v.addEventListener('ended',mvEnd);['play','pause','seeked','ended'].forEach(ev=>v.addEventListener(ev,()=>mvSoundApply()));v.addEventListener('timeupdate',mvInterCheck);v.addEventListener('error',()=>{if(v.getAttribute('src'))mvNote('The film could not be reached. It needs a connection.',true);});
 mvEl.querySelector('.mvtap').onclick=mvScreen;mvEl.querySelector('.mvremote').onclick=mvRemote;mvEl.querySelector('.mvknob').onclick=mvLightStep;mvEl.querySelectorAll('.mvlamp').forEach(b=>b.onclick=mvLightStep);mvEl.querySelector('.mvamp').onclick=mvSoundStep;mvEl.querySelectorAll('.mvhot[data-shelf]').forEach(b=>b.onclick=()=>mvPick());mvEl.querySelector('.mvback').onclick=openRooms;
 mvEl.querySelector('.mvcat').onclick=mvCatTap;ui.appendChild(mvEl);mvSet('closed');mvSoundApply();mvCatEnter();mvThingsWire();mvLightApply();mvScoresLoad();mvDecorShow();mvLightsDraw();MV_TOP_MASK.complete||MV_TOP_MASK.addEventListener('load',mvLightsDraw,{once:true});clearInterval(mvLightsT);mvLightsT=setInterval(mvLightsDraw,LIGHTS_TWINK);}
function closeMovieRoom(){if(!mvEl)return;clearInterval(mvLightsT);if(mvInter){clearTimeout(mvInter.t);mvLight=mvInter.light;mvInter=null;}clearTimeout(mvPopT);mvPopping=null;mvHeld=null;mvFx=[];mvWho=[];mvScoreStop();closeKalimba();mvTvClose();mvSweepT.forEach(clearTimeout);mvSweepT=[];mvPickClose();mvTrayClose();clearTimeout(mvCatT);mvCat=null;clearTimeout(mvTimer);const v=mvEl.querySelector('video');try{v.pause();v.removeAttribute('src');v.load();}catch(e){}mvEl.remove();mvEl=null;mvState='closed';}
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
