'use strict';
/* THE MOVIE ROOM (Jackie, Nov 26: "a movie room where you can actually watch public domain films - like a home theater with a big
   screen you're facing"). A first version to try the screen: the room's picture (movieroom/room.png, tools/movieroom_build.py) lies
   over a film that plays behind its see-through screen. The curtains are closed until a film starts ("closed by default until you
   start watching"), open in two steps (frame swaps), and close again when it ends. Everything you touch here is about watching.
   The film streams from the Internet Archive, so it needs a connection; it plays muted (the copy's music is not known to be free).
   You get here from the Leave button (below). */
const MV={W:1670,H:941,screen:{x:428,y:117,w:816,h:468},curtain:{x:366,y:98,w:940,h:504},step:260};
/* THE COLLECTION (Jackie, Nov 26: "a movie collection with reels, vhs, and bluray"). Three shelves of films, each opened by tapping
   its things on the left-hand shelving. Every film is public domain in the United States (published before 1931) and its Internet
   Archive copy was confirmed to exist (research_notes/movieroom/channels.md). They are silent films and play muted. None has been
   watched all the way through yet, so this list is a first shelf, to be checked. id = the Archive's item, f = its file. */
const MV_SHELVES=[
 {id:'reel',name:'Magic lantern',about:'Trick films and fairy stories from the first years of cinema.',pic:'movieroom/acc_reel.png',at:[{x:112,y:250,w:256,h:100},{x:112,y:400,w:66,h:76}],films:[
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
  {t:'The Rink',by:'Charlie Chaplin, America, 1916',len:'24 min',id:'silent-the-rink',f:'The Rink.mp4'}]}];
const MV_REMOTE={x:1326,y:380,w:54,h:96};
const mvSrc=f=>'https://archive.org/download/'+encodeURIComponent(f.id)+'/'+encodeURIComponent(f.f);
let mvFilm=MV_SHELVES[0].films[0];
let mvEl=null,mvState='closed',mvTimer=0;
function movieRoomOpen(){return !!(mvEl&&mvEl.isConnected);}
function mvPct(b){return 'left:'+(b.x/MV.W*100)+'%;top:'+(b.y/MV.H*100)+'%;width:'+(b.w/MV.W*100)+'%;height:'+(b.h/MV.H*100)+'%';}
function mvSet(s){mvState=s;if(!mvEl)return;mvEl.dataset.state=s;const c=mvEl.querySelector('.mvcurtain');
 c.hidden=s==='open';if(s!=='open')c.src='movieroom/curtain_'+(s==='half'?'half':'closed')+'.png';
 const w=mvEl.querySelector('.mvseats');if(w){if(s!=='closed'&&w.hidden)mvSeats();w.hidden=s==='closed';}}
function mvCurtains(open,then){clearTimeout(mvTimer);mvSet('half');mvTimer=setTimeout(()=>{mvSet(open?'open':'closed');if(then)then();},MV.step);}
let mvNoteT=0;function mvNote(t,stay){const n=mvEl&&mvEl.querySelector('.mvnote');if(!n)return;clearTimeout(mvNoteT);n.textContent=t||'';n.hidden=!t;if(t&&!stay)mvNoteT=setTimeout(()=>{n.hidden=true;},5000);} // a film's name shows for a few seconds; trouble stays
function mvPlay(){const v=mvEl.querySelector('video'),f=mvFilm;
 if(mvState==='closed'){if(v.dataset.film!==f.id+'/'+f.f){v.src=mvSrc(f);v.dataset.film=f.id+'/'+f.f;}mvNote(f.t+', '+f.by);sfx('paper');
  mvCurtains(true,()=>{const p=v.play();if(p&&p.catch)p.catch(()=>mvNote('The film could not start. It needs a connection.',true));});return;}
 if(mvState!=='open')return;
 if(v.paused){const p=v.play();if(p&&p.catch)p.catch(()=>{});mvEl.dataset.paused='';}else{v.pause();mvEl.dataset.paused='1';}}
function mvEnd(){if(!mvEl||mvState==='closed')return;mvSeenAdd(mvFilm);const v=mvEl.querySelector('video');v.pause();mvEl.dataset.paused='';mvCurtains(false,()=>{try{v.currentTime=0;}catch(e){}mvNote('');});}
/* THE WATCHERS (Jackie, Nov 26: "when they sit down to watch, you see them from the backside a little bit kind of like MST3K").
   While the curtains are open, the monsters and the cat sit on the couch as dark shapes against the screen, their lower halves
   hidden behind the couch back. A dark shape from behind is the same as from the front, so each monster's own picture is used,
   filled in dark; the cat is its from-behind pose. They are drawn once when the film starts. */
const MV_SEAT={top:697,dark:'#1b0f1e',xs:[770,650,890],catX:1000,show:.68};
function mvShadow(src,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(src,0,0,w,h);x.globalCompositeOperation='source-in';x.fillStyle=MV_SEAT.dark;x.fillRect(0,0,w,h);return c;}
function mvSeats(){const c=mvEl&&mvEl.querySelector('.mvseats');if(!c)return;const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);let n=0;
 const sit=(im,cx)=>{const y=Math.round(MV_SEAT.top-im.height*MV_SEAT.show);x.drawImage(im,Math.round(cx-im.width/2),y);};
 if(st.started)for(const p of allRaw()){if(p.stage==null||p.stage<4||n>=MV_SEAT.xs.length)continue; // a seed or a sprout stays in the plant room
  let pic=null;try{pic=plantPortrait(p.id,230,300);}catch(e){}if(pic&&pic.width>1)sit(mvShadow(pic,pic.width,pic.height),MV_SEAT.xs[n++]);}
 const f=typeof CATF!=='undefined'&&(CATF.back||CATF.sit1);if(ok(f)&&st.started){const k=.8;sit(mvShadow(f,Math.round(f.naturalWidth*k),Math.round(f.naturalHeight*k)),MV_SEAT.catX);}
 c.dataset.n=n;}
/* TONIGHT'S FILM, AND WHAT YOU HAVE SEEN. The amplifier on the right-hand shelf puts on tonight's film: one of the collection, the
   same all day and a different one tomorrow. A film watched to its end is remembered on this device and marked "seen" in its list. */
const MV_AMP={x:1392,y:398,w:156,h:78},MV_SEEN_KEY='monsterplant.films.seen';
function mvSeen(){try{return JSON.parse(localStorage.getItem(MV_SEEN_KEY)||'[]');}catch(e){return [];}}
function mvSeenAdd(f){try{const L=mvSeen();if(!L.includes(f.id)){L.push(f.id);localStorage.setItem(MV_SEEN_KEY,JSON.stringify(L));}}catch(e){}}
function mvTonight(){const all=MV_SHELVES.flatMap(s=>s.films),d=new Date(),n=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()))/864e5);return all[n%all.length];}
/* choosing a film: a tap on the reels, the tapes or the discs opens that shelf's list */
let mvPickEl=null;
function mvPickClose(){if(mvPickEl){mvPickEl.remove();mvPickEl=null;}}
function mvChoose(f){mvPickClose();const v=mvEl.querySelector('video');mvFilm=f;
 const start=()=>{try{v.pause();}catch(e){}mvEl.dataset.paused='';mvSet('closed');mvPlay();};
 if(mvState==='closed')start();else{v.pause();mvCurtains(false,start);}} // a film already showing: the curtains close on it first
function mvPick(sh){if(mvPickEl||!mvEl)return;sfx('tick');const seen=mvSeen();mvPickEl=document.createElement('div');mvPickEl.className='screen mvpick';
 mvPickEl.innerHTML='<div class="mvpbox"><img src="'+sh.pic+'" alt="" draggable="false"><div class="mvplist"><h2>'+sh.name+'</h2><p>'+sh.about+'</p>'+
  sh.films.map((f,i)=>'<button type="button" class="mvpfilm" data-i="'+i+'"><b>'+f.t+'</b><span>'+f.by+' · '+f.len+(seen.includes(f.id)?' · seen':'')+'</span></button>').join('')+'</div><button type="button" class="mvpx" aria-label="Close">×</button></div>';
 mvPickEl.querySelectorAll('.mvpfilm').forEach(b=>b.onclick=()=>mvChoose(sh.films[+b.dataset.i]));mvPickEl.querySelector('.mvpx').onclick=mvPickClose;
 mvPickEl.onclick=e=>{if(e.target===mvPickEl)mvPickClose();};ui.appendChild(mvPickEl);}
function openMovieRoom(){
 if(mvEl)return;
 mvEl=document.createElement('div');mvEl.className='screen movieroom';
 mvEl.innerHTML='<div class="mvstage"><video playsinline muted preload="none" style="'+mvPct(MV.screen)+'"></video>'+
  '<img class="mvroom" src="movieroom/room.png" alt="" draggable="false"><img class="mvcurtain" alt="" draggable="false" style="'+mvPct(MV.curtain)+'">'+
  '<canvas class="mvseats" width="'+MV.W+'" height="'+MV.H+'" hidden></canvas>'+
  '<button type="button" class="mvtap" aria-label="Start or pause the film" style="'+mvPct(MV.curtain)+'"></button>'+
  MV_SHELVES.map((sh,i)=>sh.at.map(r=>'<button type="button" class="mvhot" data-shelf="'+i+'" aria-label="'+sh.name+'" style="'+mvPct(r)+'"></button>').join('')).join('')+
  '<button type="button" class="mvhot mvamp" aria-label="Tonight\'s film" style="'+mvPct(MV_AMP)+'"></button>'+
  '<button type="button" class="mvhot mvremote" aria-label="Start or pause the film" style="'+mvPct(MV_REMOTE)+'"></button>'+
  '<div class="mvnote" hidden></div><button type="button" class="mvback">Leave</button></div>';
 const v=mvEl.querySelector('video');v.addEventListener('ended',mvEnd);v.addEventListener('error',()=>{if(v.getAttribute('src'))mvNote('The film could not be reached. It needs a connection.',true);});
 mvEl.querySelector('.mvtap').onclick=mvPlay;mvEl.querySelector('.mvremote').onclick=mvPlay;mvEl.querySelector('.mvamp').onclick=()=>{const f=mvTonight();if(mvState==='open'&&mvFilm===f)return;mvChoose(f);mvNote('Tonight’s film is '+f.t+'.');};mvEl.querySelectorAll('.mvhot[data-shelf]').forEach(b=>b.onclick=()=>mvPick(MV_SHELVES[+b.dataset.shelf]));mvEl.querySelector('.mvback').onclick=openRooms;
 ui.appendChild(mvEl);mvSet('closed');}
function closeMovieRoom(){if(!mvEl)return;mvPickClose();clearTimeout(mvTimer);const v=mvEl.querySelector('video');try{v.pause();v.removeAttribute('src');v.load();}catch(e){}mvEl.remove();mvEl=null;mvState='closed';}
/* LEAVING A ROOM (Jackie, Nov 26: "Maybe somewhere in each room there's a leave button basically and you can then choose a room from a
   screen"). Each room has a Leave button; it opens a screen with a picture of every room, and a tap on one takes you there. Pausing a
   film is left to the film: leaving the movie room stops it. */
const ROOMS=[{id:'main',name:'The plant room',pic:'movieroom/thumb_main.png'},{id:'movie',name:'The movie room',pic:'movieroom/thumb_movie.png'}];
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
