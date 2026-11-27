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
let mvFilm=MV_SHELVES[0].films[0];
let mvEl=null,mvState='closed',mvTimer=0;
function movieRoomOpen(){return !!(mvEl&&mvEl.isConnected);}
function mvPct(b){return 'left:'+(b.x/MV.W*100)+'%;top:'+(b.y/MV.H*100)+'%;width:'+(b.w/MV.W*100)+'%;height:'+(b.h/MV.H*100)+'%';}
/* The curtains draw like the study room's (Jackie, Nov 27: "Should we have the curtains animated like in the plant room?"): the picture of
   the closed curtains is uncovered from each side toward the middle in twelve whole steps, and covered again the same way to
   open. k is how far shut they are, 0 to 1. While they move the state is 'half'. */
const MV_SWEEP=12,MV_SWEEP_MS=36;
function mvCurtainK(k){if(!mvEl)return;const p=100-k*50,L=mvEl.querySelector('.mvcurtL'),R=mvEl.querySelector('.mvcurtR');L.style.clipPath='inset(0 '+p+'% 0 0)';R.style.clipPath='inset(0 0 0 '+p+'%)';L.hidden=R.hidden=k<=0;mvEl.dataset.k=k;}
function mvSet(s){mvState=s;if(!mvEl)return;mvEl.dataset.state=s;if(s==='closed')mvCurtainK(1);else if(s==='open')mvCurtainK(0);
 const w=mvEl.querySelector('.mvseats');if(w){if(s!=='closed'&&w.hidden)mvSeats();w.hidden=s==='closed';}mvLightApply();}
let mvSweepT=[];function mvCurtains(open,then){mvSweepT.forEach(clearTimeout);mvSweepT=[];clearTimeout(mvTimer);mvSet('half');for(let i=1;i<=MV_SWEEP;i++)mvSweepT.push(setTimeout(()=>{mvCurtainK(open?1-i/MV_SWEEP:i/MV_SWEEP);if(i===MV_SWEEP){mvSet(open?'open':'closed');if(then)then();}},i*MV_SWEEP_MS));} // every step is set at once, so they keep their order however time is stepped
let mvNoteT=0;function mvNote(t,stay){const n=mvEl&&mvEl.querySelector('.mvnote');if(!n)return;clearTimeout(mvNoteT);n.textContent=t||'';n.hidden=!t;if(t&&!stay)mvNoteT=setTimeout(()=>{n.hidden=true;},5000);} // a film's name shows for a few seconds; trouble stays
/* Jackie, Nov 27: "you can open the curtains but I think you should be able to close them too by clicking the screen and only
   control playback with the remote". A tap on the curtains or the screen opens or closes the curtains and nothing else; closing
   them pauses the film where it is. The remote starts and pauses the film, and opens the curtains first if they are closed. */
function mvLoad(){const v=mvEl.querySelector('video'),f=mvFilm,src=mvSrc(f);if(v.dataset.film!==src){v.src=src;v.dataset.film=src;}v.loop=!!f.loop;return v;}
function mvStart(){const v=mvLoad(),p=v.play();mvEl.dataset.paused='';mvLightApply();if(p&&p.catch)p.catch(()=>mvNote('The film could not start. It needs a connection.',true));}
function mvScreen(){if(!mvEl||mvState==='half')return;const v=mvEl.querySelector('video');sfx('paper');
 if(mvState==='closed'){mvLoad();mvEl.dataset.paused=v.paused?'1':'';mvCurtains(true);}
 else{v.pause();mvEl.dataset.paused='1';mvCurtains(false);}}
function mvPlay(){if(!mvEl||mvState==='half')return;const v=mvEl.querySelector('video'),f=mvFilm;
 if(mvState==='closed'){mvNote(f.t+', '+f.by);sfx('paper');mvLoad();mvCurtains(true,mvStart);return;}
 if(v.paused)mvStart();else{v.pause();mvEl.dataset.paused='1';mvLightApply();}}
function mvEnd(){if(!mvEl||mvState==='closed')return;if(!mvFilm.loop&&mvFilm.f)mvSeenAdd(mvFilm);const v=mvEl.querySelector('video');v.pause();mvEl.dataset.paused='';mvCurtains(false,()=>{try{v.currentTime=0;}catch(e){}mvNote('');});}
/* THE WATCHERS (Jackie, Nov 26: "when they sit down to watch, you see them from the backside a little bit kind of like MST3K").
   While the curtains are open, the monsters sit on the couch as dark shapes against the screen, their lower halves
   hidden behind the couch back (Jackie, later the same day: "Maybe it's just your monster(s)"; the cat has its own places, below). A dark shape from behind is the same as from the front, so each monster's own picture is used,
   filled in dark. They are drawn once when the film starts. */
const MV_SEAT={top:697,dark:'#0a060d',xs:[770,650,890],show:.66}; // small enough that only the tops of their heads reach the screen (Jackie, Nov 27: "the plant needs to be smaller so the screen is less obscured")
function mvShadow(src,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(src,0,0,w,h);x.globalCompositeOperation='source-in';x.fillStyle=MV_SEAT.dark;x.fillRect(0,0,w,h);return c;}
function mvSeats(){const c=mvEl&&mvEl.querySelector('.mvseats');if(!c)return;const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);let n=0;
 const sit=(im,cx)=>{const y=Math.round(MV_SEAT.top-im.height*MV_SEAT.show);x.drawImage(im,Math.round(cx-im.width/2),y);};
 if(st.started)for(const p of allRaw()){if(p.stage==null||p.stage<4||n>=MV_SEAT.xs.length)continue; // a seed or a sprout stays in the study room
  let pic=null;try{pic=plantPortrait(p.id,150,200);}catch(e){}if(pic&&pic.width>1)sit(mvShadow(pic,pic.width,pic.height),MV_SEAT.xs[n++]);}
 c.dataset.n=n;}
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
const MV_KNOB={x:1592,y:290,w:64,h:68},MV_KNOB_TAP={x:1566,y:272,w:104,h:108},MV_LAMPS=[{x:0,y:112,w:100,h:170},{x:1570,y:112,w:100,h:158}], /* the knob's picture is small, and on a phone it was about a quarter of an inch across: too small to hit reliably (Jackie, Nov 27: "the light switch still isnt working"). Its tap area is now well over twice the size, and a tap on either wall lamp does the same thing. */MV_LIGHTS=[1,.62,.34,.14],MV_LIGHT_SAY=['Lights up.','Lights low.','Lights lower.','Lights nearly out.'];let mvSound=true,mvLight=0;
function mvSoundSet(on){mvSound=!!on;if(!mvEl)return;mvEl.querySelector('video').muted=!mvSound;}
function mvLightApply(){if(!mvEl)return;const v=mvEl.querySelector('video'),playing=mvState==='open'&&mvEl.dataset.paused!=='1'&&v&&v.getAttribute('src');
 const lv=playing?Math.max(mvLight,1):mvLight;mvEl.style.setProperty('--mvb',MV_LIGHTS[lv]);mvEl.dataset.light=lv;mvEl.querySelector('.mvknobon').hidden=mvLight!==0;mvEl.querySelectorAll('.mvsconce').forEach(e=>{e.hidden=lv!==0;});} // the wall lamps are lit only while the lights are right up; in the base picture they are off
function mvLightStep(){mvLight=(mvLight+1)%MV_LIGHTS.length;sfx('tick');mvLightApply();mvNote(MV_LIGHT_SAY[mvLight]);}
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
 {id:'iss-earth',t:'The Earth from the space station',by:'NASA, live',yt:'ROboUHfPUrU'},
 {id:'iss',t:'The space station’s cameras',by:'NASA, live',yt:'M3HKLzjvKPc'},
 {id:'kilauea',t:'Kīlauea volcano',by:'U.S. Geological Survey, live',yt:'HggWKlZv9yk'}];
let mvTvEl=null;
function mvTvClose(){if(mvTvEl){mvTvEl.remove();mvTvEl=null;}}
function mvTv(ch){mvTrayClose();mvTvClose();const v=mvEl&&mvEl.querySelector('video');if(v&&!v.paused){v.pause();mvEl.dataset.paused='1';mvLightApply();}
 mvTvEl=document.createElement('div');mvTvEl.className='screen mvtv';
 mvTvEl.innerHTML='<div class="mvtvbar"><b></b><button type="button" class="mvrbtn mvtvx">Back to the room</button></div><div class="mvtvbox"><iframe title="" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>';
 mvTvEl.querySelector('b').textContent=ch.t+' · '+ch.by;const f=mvTvEl.querySelector('iframe');f.title=ch.t;f.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(ch.yt)+'?autoplay=1&playsinline=1&rel=0';
 mvTvEl.querySelector('.mvtvx').onclick=mvTvClose;ui.appendChild(mvTvEl);sfx('tick');}
function mvLiveOn(ch){if(ch.yt){mvTv(ch);return;}mvChoose(ch);} // a satellite loop is shown like a film
function mvRemote(){const v=mvEl.querySelector('video'),on=mvState==='open'&&!v.paused;
 const el=mvPanel('mvremotep','<img src="movieroom/acc_remote_on.png" alt="" draggable="false"><div class="mvplist"><h2>The remote</h2><button type="button" class="mvrbtn mvrplay">'+(on?'Pause':'Play')+'</button><p>Live</p>'+
  MV_LIVE.map((c,i)=>'<button type="button" class="mvpfilm" data-i="'+i+'"><b></b><span></span></button>').join('')+'</div>');
 el.querySelector('.mvrplay').onclick=()=>{mvTrayClose();mvPlay();};
 el.querySelectorAll('.mvpfilm').forEach(b=>{const c=MV_LIVE[+b.dataset.i];b.querySelector('b').textContent=c.t;b.querySelector('span').textContent=c.by+(c.yt?' · opens close up':'');b.onclick=()=>{mvTrayClose();mvLiveOn(c);};});sfx('tick');}
/* THE THINGS ON THE SHELVES (Jackie, Nov 27: "I want to work on all the stuff in the shelves they should work"). Each does one thing:
   the popcorn machine and the stack of buckets offer five kinds of popcorn; the machine pops for a moment, a bucket lands on the couch,
     and every monster in the room that is old enough to eat is a little fuller;
   the soda fountain and the cups offer three sodas; the tap pours, a cup lands on the couch, and nobody in the room is thirsty;
   the 3D glasses turn the film amber, blue or rose, as silent films were often tinted, and then plain again;
   the row of books opens the books about film, and the box set opens its three books, each read a page at a time. */
const MV_CORN=[['butter','Butter popcorn'],['caramel','Caramel popcorn'],['cheese','Cheese popcorn'],['seaweed','Seaweed popcorn'],['charcoal','Charcoal popcorn']],
 MV_SODA=[['red','Cherry soda'],['blue','Blueberry soda'],['yellow','Lemon soda']],MV_TINTS=['','amber','blue','rose'],MV_TINT_NAME={'':'No tint.',amber:'Amber tint.',blue:'Blue tint.',rose:'Rose tint.'},
 MV_SPOTS={machine:{x:126,y:162,w:148,h:186},buckets:{x:1316,y:504,w:66,h:88},fountain:{x:1326,y:178,w:150,h:170},cups:{x:1480,y:176,w:78,h:172},glasses:{x:1384,y:540,w:80,h:52},boxset:{x:1470,y:496,w:82,h:96},books:{x:110,y:500,w:260,h:92}},
 MV_ON={corn:{x:560,y:697,k:.42},cup:{x:1262,y:697,k:.4},pop:{x:124,y:160,w:152,h:192},pour:{x:1322,y:174,w:158,h:176}};
let mvTrayEl=null,mvPopT=0,mvBooks=null,mvTint=0;
function mvTrayClose(){if(mvTrayEl){mvTrayEl.remove();mvTrayEl=null;}}
function mvPanel(cls,html){mvTrayClose();mvPickClose();const el=document.createElement('div');el.className='screen mvpick '+cls;el.innerHTML='<div class="mvpbox">'+html+'<button type="button" class="mvpx" aria-label="Close">×</button></div>';
 el.querySelector('.mvpx').onclick=mvTrayClose;el.onclick=e=>{if(e.target===el)mvTrayClose();};ui.appendChild(el);mvTrayEl=el;return el;}
function mvOver(cls,src,box,ms){if(!mvEl)return null;let im=mvEl.querySelector('.'+cls);if(!im){im=document.createElement('img');im.className='mvover '+cls;im.alt='';im.draggable=false;mvEl.querySelector('.mvstage').insertBefore(im,mvEl.querySelector('.mvcat'));}
 im.src=src;im.style.cssText=mvPct(box);im.hidden=false;if(ms)setTimeout(()=>{im.hidden=true;},ms);return im;}
function mvOnCouch(cls,src,at){const pic=new Image();pic.onload=()=>{const w=pic.naturalWidth*at.k,h=pic.naturalHeight*at.k;mvOver(cls,src,{x:at.x-w/2,y:at.y-h,w,h});};pic.src=src;}
function mvServe(kind,id,name){mvTrayClose();sfx('chime');
 if(kind==='corn'){mvOver('mvpop','movieroom/acc_machine_pop.png',MV_ON.pop,1600);mvOnCouch('mvcorn','movieroom/acc_corn_'+id+'.png',MV_ON.corn);if(st.started)eachPlant(()=>{if(st.stage>=4)st.full=clamp((st.full||0)+.35,0,1);});}
 else{mvOver('mvpour','movieroom/acc_soda_pour_'+id+'.png',MV_ON.pour,1400);mvOnCouch('mvcup','movieroom/acc_cup_'+id+'.png',MV_ON.cup);if(st.started)eachPlant(()=>{if(st.stage>=0)st.needs.thirst=0;});}
 if(st.started)save();mvNote(name+' for the couch.');}
function mvOffer(kind){const L=kind==='corn'?MV_CORN:MV_SODA,pre=kind==='corn'?'acc_corn_':'acc_cup_';
 const el=mvPanel('mvoffer','<div class="mvplist"><h2>'+(kind==='corn'?'Popcorn':'Soda')+'</h2><div class="mvtiles">'+L.map(([id,name])=>'<button type="button" class="mvtile" data-id="'+id+'"><img src="movieroom/'+pre+id+'.png" alt="" draggable="false"><span>'+name+'</span></button>').join('')+'</div></div>');
 el.querySelectorAll('.mvtile').forEach(b=>b.onclick=()=>{const it=L.find(q=>q[0]===b.dataset.id);mvServe(kind,it[0],it[1]);});}
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
function mvFilmBooks(){if(mvBooks&&mvBooks.length)mvShelfOfBooks('Books about film','Old books about the movies, in their own words.',mvBooks);else{mvNote('These books are still being copied out.');}}
fetch('movieroom/books.json').then(r=>r.ok?r.json():null).then(j=>{if(j&&j.books)mvBooks=j.books.filter(b=>b.pages&&b.pages.length).map(b=>({t:b.title,by:b.by+', '+b.year,pages:b.pages}));}).catch(()=>{});
function mvThingsWire(){const st2=mvEl.querySelector('.mvstage'),add=(k,label,fn)=>{const b=document.createElement('button');b.type='button';b.className='mvhot mvthing';b.dataset.k=k;b.setAttribute('aria-label',label);b.style.cssText=mvPct(MV_SPOTS[k]);b.onclick=fn;st2.insertBefore(b,mvEl.querySelector('.mvnote'));};
 add('machine','Popcorn',()=>mvOffer('corn'));add('buckets','Popcorn',()=>mvOffer('corn'));add('fountain','Soda',()=>mvOffer('soda'));add('cups','Soda',()=>mvOffer('soda'));
 add('glasses','Tint the film',mvGlasses);add('boxset','The box set',mvBoxSet);add('books','Books about film',mvFilmBooks);mvEl.dataset.tint=MV_TINTS[mvTint];}
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
function mvPick(sh){if(!mvEl)return;mvPickClose();sfx('tick');sh=sh||mvLast;mvLast=sh;const seen=mvSeen(),sibs=MV_SHELVES; /* one menu for the whole collection, whichever film thing was tapped (Jackie, Nov 27: "maybe we need all those movie clicks to lead to the same menu"); it opens on the collection you last looked at */mvPickEl=document.createElement('div');mvPickEl.className='screen mvpick';
 mvPickEl.innerHTML='<div class="mvpbox"><img src="'+sh.pic+'" alt="" draggable="false"><div class="mvplist"><button type="button" class="mvrbtn mvtonight"></button>'+(sibs.length>1?'<div class="mvptabs">'+sibs.map(q=>'<button type="button" class="mvptab'+(q===sh?' on':'')+'" data-id="'+q.id+'">'+q.name+'</button>').join('')+'</div>':'')+'<h2>'+sh.name+'</h2><p>'+sh.about+'</p>'+
  sh.films.map((f,i)=>'<button type="button" class="mvpfilm" data-i="'+i+'"><b>'+f.t+'</b><span>'+f.by+' · '+f.len+(seen.includes(f.id)?' · seen':'')+'</span></button>').join('')+'</div><button type="button" class="mvpx" aria-label="Close">×</button></div>';
 mvPickEl.querySelectorAll('.mvpfilm').forEach(b=>b.onclick=()=>mvChoose(sh.films[+b.dataset.i]));mvPickEl.querySelector('.mvpx').onclick=mvPickClose;{const tb=mvPickEl.querySelector('.mvtonight'),tf=mvTonight();tb.textContent='Tonight’s film: '+tf.t;tb.onclick=()=>{mvChoose(tf);mvNote('Tonight’s film is '+tf.t+'.');};}mvPickEl.querySelectorAll('.mvptab').forEach(b=>b.onclick=()=>mvPick(MV_SHELVES.find(q=>q.id===b.dataset.id)));
 mvPickEl.onclick=e=>{if(e.target===mvPickEl)mvPickClose();};ui.appendChild(mvPickEl);}
function openMovieRoom(){
 if(mvEl)return;
 mvEl=document.createElement('div');mvEl.className='screen movieroom';
 mvEl.innerHTML='<div class="mvstage"><video playsinline preload="none" style="'+mvPct(MV.screen)+'"></video>'+
  '<img class="mvroom" src="movieroom/room.png" alt="" draggable="false"><img class="mvcurtain mvcurtL" src="movieroom/curtain_closed.png" alt="" draggable="false" style="'+mvPct(MV.curtain)+'"><img class="mvcurtain mvcurtR" src="movieroom/curtain_closed.png" alt="" draggable="false" style="'+mvPct(MV.curtain)+'">'+
  '<canvas class="mvseats" width="'+MV.W+'" height="'+MV.H+'" hidden></canvas>'+
  '<button type="button" class="mvtap" aria-label="Open or close the curtains" style="'+mvPct(MV.curtain)+'"></button>'+
  MV_SHELVES.map((sh,i)=>(sh.at||[]).map(r=>'<button type="button" class="mvhot" data-shelf="'+i+'" aria-label="'+sh.name+'" style="'+mvPct(r)+'"></button>').join('')).join('')+
  '<img class="mvover mvsconce" src="movieroom/sconce_l_lit.png" alt="" draggable="false" style="'+mvPct({x:0,y:100,w:106,h:200})+'"><img class="mvover mvsconce" src="movieroom/sconce_r_lit.png" alt="" draggable="false" style="'+mvPct({x:1564,y:100,w:106,h:200})+'">'+
  '<img class="mvknobon" src="movieroom/acc_dimmer_high.png" alt="" draggable="false" hidden style="'+mvPct({x:MV_KNOB.x+4,y:MV_KNOB.y+4,w:56,h:63})+'">'+
  '<button type="button" class="mvhot mvknob" aria-label="Room lights" style="'+mvPct(MV_KNOB_TAP)+'"></button>'+MV_LAMPS.map(r=>'<button type="button" class="mvhot mvlamp" aria-label="Room lights" style="'+mvPct(r)+'"></button>').join('')+
  '<button type="button" class="mvhot mvamp" aria-label="Sound on or off" style="'+mvPct(MV_AMP)+'"></button>'+
  '<button type="button" class="mvhot mvremote" aria-label="The remote" style="'+mvPct(MV_REMOTE)+'"></button>'+
  '<img class="mvcat" alt="The cat" draggable="false" hidden>'+
  '<div class="mvnote" hidden></div><button type="button" class="mvback">Leave</button></div>';
 const v=mvEl.querySelector('video');v.addEventListener('ended',mvEnd);v.addEventListener('error',()=>{if(v.getAttribute('src'))mvNote('The film could not be reached. It needs a connection.',true);});
 mvEl.querySelector('.mvtap').onclick=mvScreen;mvEl.querySelector('.mvremote').onclick=mvRemote;mvEl.querySelector('.mvknob').onclick=mvLightStep;mvEl.querySelectorAll('.mvlamp').forEach(b=>b.onclick=mvLightStep);mvEl.querySelector('.mvamp').onclick=()=>{mvSoundSet(!mvSound);sfx('tick');mvNote(mvSound?'Sound on.':'Sound off.');};mvEl.querySelectorAll('.mvhot[data-shelf]').forEach(b=>b.onclick=()=>mvPick());mvEl.querySelector('.mvback').onclick=openRooms;
 mvEl.querySelector('.mvcat').onclick=mvCatTap;ui.appendChild(mvEl);mvSet('closed');mvSoundSet(mvSound);mvCatEnter();mvThingsWire();mvLightApply();}
function closeMovieRoom(){if(!mvEl)return;mvTvClose();mvSweepT.forEach(clearTimeout);mvSweepT=[];mvPickClose();mvTrayClose();clearTimeout(mvCatT);mvCat=null;clearTimeout(mvTimer);const v=mvEl.querySelector('video');try{v.pause();v.removeAttribute('src');v.load();}catch(e){}mvEl.remove();mvEl=null;mvState='closed';}
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
