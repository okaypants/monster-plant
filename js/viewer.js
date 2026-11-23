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
 cap.appendChild(a);cap.appendChild(b);const nx=VIEW_CARDS[(viewI+1)%VIEW_CARDS.length];if(nx){const p=new Image();p.src='viewer/'+nx.f;}} // the next card is fetched ahead
// the card is pulled out (the slide is empty for a beat) and the next one is dropped in: two frame swaps, no slide or fade
function viewStep(n){if(viewBusy||!viewEl)return;viewBusy=true;sfx('paper');const L=VIEW_CARDS.length,sl=viewEl.querySelector('.vwslide');sl.classList.add('vwout');
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
 viewEl.querySelector('.vwslide').addEventListener('click',e=>{e.stopPropagation();viewStep(1);});
 viewEl.querySelector('.vwpic').addEventListener('error',()=>{if(viewEl)viewEl.querySelector('.vwcap').textContent='That card did not load.';});
 ui.appendChild(viewEl);viewBusy=false;viewI=(viewI+1)%VIEW_CARDS.length;viewShow();}
function closeViewer(){if(!viewEl)return;viewEl.remove();viewEl=null;sfx('tick');}
