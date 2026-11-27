'use strict';
/* THE MOVIE ROOM (Jackie, Nov 26: "a movie room where you can actually watch public domain films - like a home theater with a big
   screen you're facing"). A first version to try the screen: the room's picture (movieroom/room.png, tools/movieroom_build.py) lies
   over a film that plays behind its see-through screen. The curtains are closed until a film starts ("closed by default until you
   start watching"), open in two steps (frame swaps), and close again when it ends. Everything you touch here is about watching.
   The film streams from the Internet Archive, so it needs a connection; it plays muted (the copy's music is not known to be free).
   You get here from the Leave button (below). */
const MV={W:1670,H:941,screen:{x:428,y:117,w:816,h:468},curtain:{x:366,y:98,w:940,h:504},step:260};
const MV_FILMS=[{t:'A Trip to the Moon',by:'Georges Méliès, 1902',src:'https://archive.org/download/ATripToTheMoon20Fps/TripToTheMoon20Fps_512kb.mp4'}];
let mvEl=null,mvState='closed',mvTimer=0;
function movieRoomOpen(){return !!(mvEl&&mvEl.isConnected);}
function mvPct(b){return 'left:'+(b.x/MV.W*100)+'%;top:'+(b.y/MV.H*100)+'%;width:'+(b.w/MV.W*100)+'%;height:'+(b.h/MV.H*100)+'%';}
function mvSet(s){mvState=s;if(!mvEl)return;mvEl.dataset.state=s;const c=mvEl.querySelector('.mvcurtain');
 c.hidden=s==='open';if(s!=='open')c.src='movieroom/curtain_'+(s==='half'?'half':'closed')+'.png';}
function mvCurtains(open,then){clearTimeout(mvTimer);mvSet('half');mvTimer=setTimeout(()=>{mvSet(open?'open':'closed');if(then)then();},MV.step);}
let mvNoteT=0;function mvNote(t,stay){const n=mvEl&&mvEl.querySelector('.mvnote');if(!n)return;clearTimeout(mvNoteT);n.textContent=t||'';n.hidden=!t;if(t&&!stay)mvNoteT=setTimeout(()=>{n.hidden=true;},5000);} // a film's name shows for a few seconds; trouble stays
function mvPlay(){const v=mvEl.querySelector('video'),f=MV_FILMS[0];
 if(mvState==='closed'){if(!v.getAttribute('src'))v.src=f.src;mvNote(f.t+', '+f.by);sfx('paper');
  mvCurtains(true,()=>{const p=v.play();if(p&&p.catch)p.catch(()=>mvNote('The film could not start. It needs a connection.',true));});return;}
 if(mvState!=='open')return;
 if(v.paused){const p=v.play();if(p&&p.catch)p.catch(()=>{});mvEl.dataset.paused='';}else{v.pause();mvEl.dataset.paused='1';}}
function mvEnd(){if(!mvEl||mvState==='closed')return;const v=mvEl.querySelector('video');v.pause();mvEl.dataset.paused='';mvCurtains(false,()=>{try{v.currentTime=0;}catch(e){}mvNote('');});}
function openMovieRoom(){
 if(mvEl)return;
 mvEl=document.createElement('div');mvEl.className='screen movieroom';
 mvEl.innerHTML='<div class="mvstage"><video playsinline muted preload="none" style="'+mvPct(MV.screen)+'"></video>'+
  '<img class="mvroom" src="movieroom/room.png" alt="" draggable="false"><img class="mvcurtain" alt="" draggable="false" style="'+mvPct(MV.curtain)+'">'+
  '<button type="button" class="mvtap" aria-label="Start or pause the film" style="'+mvPct(MV.curtain)+'"></button>'+
  '<div class="mvnote" hidden></div><button type="button" class="mvback">Leave</button></div>';
 const v=mvEl.querySelector('video');v.addEventListener('ended',mvEnd);v.addEventListener('error',()=>{if(v.getAttribute('src'))mvNote('The film could not be reached. It needs a connection.',true);});
 mvEl.querySelector('.mvtap').onclick=mvPlay;mvEl.querySelector('.mvback').onclick=openRooms;
 ui.appendChild(mvEl);mvSet('closed');}
function closeMovieRoom(){if(!mvEl)return;clearTimeout(mvTimer);const v=mvEl.querySelector('video');try{v.pause();v.removeAttribute('src');v.load();}catch(e){}mvEl.remove();mvEl=null;mvState='closed';}
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
