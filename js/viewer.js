'use strict';
/* THE VIEWFINDER (Jackie, Nov 17: "a viewfinder where you can like look at it and see cool fun ... random public domain images";
   Nov 18: "a unique large collection of photos and illustrations and really interesting stuff", not a museum). The wood and brass
   viewer on the lower wall shelf. A tap clicks its lever and opens it. Its pictures come in reels, like the cards of a real viewer:
   eight reels of twelve (js/viewerdata.js), each on one subject. Every picture is shown as it is (never pixelated or recoloured),
   with its name, who made it and when. All are in the public domain and are kept with the game (viewer/), so the viewfinder works
   with no internet and nothing about the player is sent anywhere. The pictures were gathered from Wikimedia Commons.
   Each time you open it, it shows the next picture of the reel you were on. */
const VIEW_FROM='Wikimedia Commons';
let viewEl=null,viewR=0,viewI=-1;
function viewReel(){return VIEW_REELS[viewR];}
function viewShow(){if(!viewEl)return;const r=viewReel(),v=r.pics[viewI],im=viewEl.querySelector('.vwpic'),cap=viewEl.querySelector('.vwcap');
 im.alt=v.t;im.src='viewer/'+v.f;cap.innerHTML='';
 const a=document.createElement('div');a.className='vwt';a.textContent=v.t;const b=document.createElement('div');b.className='vwby';b.textContent=[v.by,v.d].filter(Boolean).join(', ')+'.';
 const c=document.createElement('div');c.className='vwreel';c.textContent=r.name+', picture '+(viewI+1)+' of '+r.pics.length+'. '+VIEW_FROM+'.';cap.appendChild(a);cap.appendChild(b);cap.appendChild(c);
 const nx=r.pics[(viewI+1)%r.pics.length];if(nx){const p=new Image();p.src='viewer/'+nx.f;}} // the next picture is fetched ahead, so a tap shows it at once
function viewStep(n){const L=viewReel().pics.length;viewI=(viewI+n+L)%L;sfx('tick');viewShow();}
function viewNextReel(){viewR=(viewR+1)%VIEW_REELS.length;viewI=0;sfx('pop');viewShow();}
function openViewer(){if(viewEl||typeof VIEW_REELS==='undefined'||!VIEW_REELS.length)return;
 viewEl=document.createElement('div');viewEl.className='screen viewer';
 viewEl.innerHTML='<div class="tsb tspop vwbox"><button type="button" class="tsb tx vwx" aria-label="Close">×</button>'+
  '<div class="vwstage"><img class="vwpic" alt="" draggable="false"></div><div class="vwcap"></div>'+
  '<div class="vwrow"><button type="button" class="tmore" data-k="prev">‹ Previous</button><button type="button" class="tmore" data-k="reel">Change the reel</button><button type="button" class="tmore" data-k="next">Next ›</button></div></div>';
 viewEl.addEventListener('click',e=>{if(e.target===viewEl)closeViewer();});
 viewEl.querySelector('.vwx').addEventListener('click',e=>{e.stopPropagation();closeViewer();});
 viewEl.querySelector('.vwrow').addEventListener('click',e=>{const k=e.target&&e.target.dataset&&e.target.dataset.k;if(!k)return;e.stopPropagation();if(k==='reel')viewNextReel();else viewStep(k==='next'?1:-1);});
 viewEl.querySelector('.vwpic').addEventListener('click',e=>{e.stopPropagation();viewStep(1);}); // a tap on the picture is the lever: the next one
 viewEl.querySelector('.vwpic').addEventListener('error',()=>{if(viewEl)viewEl.querySelector('.vwcap').textContent='That picture did not load.';});
 ui.appendChild(viewEl);viewI=(viewI+1)%viewReel().pics.length;viewShow();}
function closeViewer(){if(!viewEl)return;viewEl.remove();viewEl=null;sfx('tick');}
