'use strict';
/* THE VIEWFINDER (Jackie, Nov 17: "a viewfinder where you can like look at it and see cool fun ... random public domain images";
   Nov 23: "i thought we were just looking at those double image pictures"). The wood and brass viewer on the lower wall shelf is a
   stereoscope, and what it shows is stereo cards: the real double-picture cards people slid into viewers like it from the 1850s to
   the 1920s. A tap clicks its lever and opens it on a card, held in the viewer's wooden slide. Tap the card (or the arrows) for the
   next one. Each card is shown whole and as it is (never pixelated, cropped or recoloured), with its title, who published it and
   when. All are in the public domain, from the Library of Congress's stereograph collection, and are kept with the game (viewer/),
   so it works with no internet and nothing about the player is sent anywhere. The list is js/viewerdata.js. */
const VIEW_FROM='Library of Congress';
let viewEl=null,viewI=-1,viewBusy=false;
function viewShow(){if(!viewEl)return;const v=VIEW_CARDS[viewI],im=viewEl.querySelector('.vwpic'),cap=viewEl.querySelector('.vwcap');
 im.alt=v.t;im.src='viewer/'+v.f;cap.innerHTML='';
 const a=document.createElement('div');a.className='vwt';a.textContent=v.t;const b=document.createElement('div');b.className='vwby';b.textContent=[v.by,v.d].filter(Boolean).join(', ')+'. '+VIEW_FROM+'.';
 cap.appendChild(a);cap.appendChild(b);if(v.s){const h=document.createElement('div');h.className='vwby vwhint';h.textContent='Tap the card to look through the viewer.';cap.appendChild(h);}const nx=VIEW_CARDS[(viewI+1)%VIEW_CARDS.length];if(nx){const p=new Image();p.src='viewer/'+nx.f;}} // the next card is fetched ahead
// the card is pulled out (the slide is empty for a beat) and the next one is dropped in: two frame swaps, no slide or fade
function viewStep(n){if(viewBusy||!viewEl)return;viewLookEnd(true);viewBusy=true;sfx('paper');const L=VIEW_CARDS.length,sl=viewEl.querySelector('.vwslide');sl.classList.add('vwout');
 setTimeout(()=>{viewI=(viewI+n+L)%L;viewShow();if(viewEl){sl.classList.remove('vwout');sfx('tick');}viewBusy=false;},170);}
function openViewer(){if(viewEl||typeof VIEW_CARDS==='undefined'||!VIEW_CARDS.length)return;
 if(viewI<0)viewI=Math.floor(Math.random()*VIEW_CARDS.length)-1; // a different card to start on each time you play
 viewEl=document.createElement('div');viewEl.className='screen viewer';
 viewEl.innerHTML='<button type="button" class="tsb vwx" aria-label="Close">×</button>'+
  '<div class="vwrow"><button type="button" class="vwarrow" data-k="prev" aria-label="Previous card">‹</button>'+
  '<div class="vwslide"><span class="vwclip vwc1"></span><span class="vwclip vwc2"></span><img class="vwpic" alt="" draggable="false"></div>'+
  '<button type="button" class="vwarrow" data-k="next" aria-label="Next card">›</button></div><div class="vwcap"></div>';
 viewEl.addEventListener('click',e=>{if(e.target===viewEl)closeViewer();});
 viewEl.querySelector('.vwx').addEventListener('click',e=>{e.stopPropagation();closeViewer();});
 viewEl.querySelectorAll('.vwarrow').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();viewStep(b.dataset.k==='next'?1:-1);}));
 viewEl.querySelector('.vwslide').addEventListener('click',e=>{e.stopPropagation();viewLook();}); // tap the card: look through the viewer (the arrows change the card)
 viewEl.querySelector('.vwpic').addEventListener('error',()=>{if(viewEl)viewEl.querySelector('.vwcap').textContent='That card did not load.';});
 ui.appendChild(viewEl);viewBusy=false;viewI=(viewI+1)%VIEW_CARDS.length;viewShow();}
function closeViewer(){if(!viewEl)return;viewLookEnd(true);viewEl.remove();viewEl=null;sfx('tick');}
/* LOOKING THROUGH IT (Jackie, Nov 25: "Is there any way to kind of simulate the experience of looking through the viewer"). A stereo card
   is two photographs taken a few inches apart, one for each eye, and the viewer's lenses merge them into one picture with depth. A flat
   screen cannot do that, so the old trick is used: the view swaps between the left picture and the right one a few times a second, and
   near things shift while far things hold still. Tap the card and the screen goes dark but for the shape you see through a pair of
   lenses, with the one picture filling it. Tap again to step back to the card. A frame swap only; with reduced motion the left
   picture is shown still. Where the two pictures line up on each card is worked out by tools/viewer_build.py (the card's 's'). */
const VIEW_SWAP=0; /* 0 = the view holds still (Jackie, Nov 25: "I don't like the viewing experience, it would be more 3d not moving"); it was 240 ms between swaps */const VIEW_LAYER=.3; /* how strongly the right photograph lies over the left (Jackie, Nov 26: "I want to layer") */let viewLookT=0,viewEye=0;
function viewLookDraw(){const lk=viewEl&&viewEl.querySelector('.vwlook');if(!lk)return;const v=VIEW_CARDS[viewI],im=viewEl.querySelector('.vwpic'),c=lk.querySelector('canvas');if(!v.s||!im.naturalWidth)return;
 const[lx,ly,rx,ry,w,h]=v.s;if(c.width!==w||c.height!==h){c.width=w;c.height=h;}c.parentNode.style.setProperty('--ar',(w/h).toFixed(4)); // the frame takes the photograph's own shape, so all of it shows
 const g=c.getContext('2d');g.globalAlpha=1;g.drawImage(im,lx,ly,w,h,0,0,w,h);g.globalAlpha=VIEW_LAYER;g.drawImage(im,rx,ry,w,h,0,0,w,h);g.globalAlpha=1;} // the card's two photographs, one laid over the other where they line up: what is at the matched distance is sharp, nearer and farther things double a little
function viewLook(){if(!viewEl||viewEl.querySelector('.vwlook'))return;const v=VIEW_CARDS[viewI];if(!v.s)return;sfx('tick');
 const lk=document.createElement('div');lk.className='vwlook';lk.innerHTML='<div class="vwhood"><canvas></canvas></div>';
 lk.addEventListener('click',e=>{e.stopPropagation();viewLookEnd();});viewEl.appendChild(lk);viewEye=0;viewLookDraw();
 if(VIEW_SWAP&&!(typeof tsCalm==='function'&&tsCalm()))viewLookT=setInterval(()=>{viewEye^=1;viewLookDraw();},VIEW_SWAP);}
function viewLookEnd(quiet){if(viewLookT){clearInterval(viewLookT);viewLookT=0;}const lk=viewEl&&viewEl.querySelector('.vwlook');if(lk){lk.remove();if(!quiet)sfx('tick');}}
