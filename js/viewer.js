'use strict';
/* THE VIEWFINDER (Jackie, Nov 17: "a viewfinder where you can like look at it and see cool fun ... random public domain images";
   "both" a picked set and a surprise; "Show as they are"). The wood and brass viewer on the lower wall shelf. A tap clicks its
   lever and opens one picture, shown as it is (never pixelated or recoloured), with its name, who made it and when.
   The picked set is twelve pictures kept with the game (viewer/v01.jpg ...), all public domain, from the Art Institute of Chicago's
   open collection. "Surprise me" asks that museum for one more public-domain picture, so it needs the internet; without it the
   game says so and the picked set still works. A surprise is skipped if the museum's own subject words mark it as a nude or as
   something grim, since the game is for ages ten and up. Nothing about the player is sent. */
const VIEWS=[
 {f:'v01.jpg',t:'Under the Wave off Kanagawa',by:'Katsushika Hokusai',d:'about 1831'},
 {f:'v02.jpg',t:'The Bedroom',by:'Vincent van Gogh',d:'1889'},
 {f:'v03.jpg',t:'A Sunday on La Grande Jatte',by:'Georges Seurat',d:'1884 to 1886'},
 {f:'v04.jpg',t:'Water Lilies',by:'Claude Monet',d:'1906'},
 {f:'v05.jpg',t:'The Great Halley’s Comet',by:'José Guadalupe Posada',d:'1899'},
 {f:'v06.jpg',t:'Flower Clouds',by:'Odilon Redon',d:'about 1903'},
 {f:'v07.jpg',t:'Zodiaque',by:'Alphonse Mucha',d:'1896'},
 {f:'v08.jpg',t:'The Poet’s Garden',by:'Vincent van Gogh',d:'1888'},
 {f:'v09.jpg',t:'Shower Below the Summit',by:'Katsushika Hokusai',d:'about 1831'},
 {f:'v10.jpg',t:'Cranes on a Snow-covered Pine',by:'Katsushika Hokusai',d:'about 1834'},
 {f:'v11.jpg',t:'Moonrise',by:'George Inness',d:'1891'},
 {f:'v12.jpg',t:'Moon Jar',by:'a potter in Korea',d:'about 1700'}];
const VIEW_FROM='Art Institute of Chicago';
const VIEW_API='https://api.artic.edu/api/v1/artworks/search',VIEW_IMG=id=>'https://www.artic.edu/iiif/2/'+id+'/full/843,/0/default.jpg';
const VIEW_SKIP=/nud|erot|bather|venus|crucifi|martyr|death|dead|corpse|war\b|battle|execution|skull|violence|weapon/i;
let viewEl=null,viewI=Math.floor(Math.random()*VIEWS.length),viewBusy=false;
function viewShow(v){if(!viewEl)return;const im=viewEl.querySelector('.vwpic'),cap=viewEl.querySelector('.vwcap');
 im.alt=v.t;im.src=v.src||('viewer/'+v.f);
 cap.innerHTML='';const a=document.createElement('div');a.className='vwt';a.textContent=v.t;const b=document.createElement('div');b.className='vwby';
 b.textContent=[v.by,v.d].filter(Boolean).join(', ')+'. '+VIEW_FROM+'.';cap.appendChild(a);cap.appendChild(b);}
function viewStep(n){viewI=(viewI+n+VIEWS.length)%VIEWS.length;sfx('tick');viewShow(VIEWS[viewI]);}
// one more public-domain picture from the museum; up to five tries to find one with a picture that isn't skipped
async function viewSurprise(){if(viewBusy||!viewEl)return;viewBusy=true;const cap=viewEl.querySelector('.vwcap'),say=t=>{cap.innerHTML='';const d=document.createElement('div');d.className='vwby';d.textContent=t;cap.appendChild(d);};
 say('Looking for a picture.');sfx('tick');
 try{for(let i=0;i<5;i++){const page=1+Math.floor(Math.random()*900),u=VIEW_API+'?query%5Bterm%5D%5Bis_public_domain%5D=true&limit=1&page='+page+'&fields=id,title,artist_title,date_display,image_id,term_titles,subject_titles';
   const r=await fetch(u);if(!r.ok)throw 0;const d=((await r.json()).data||[])[0];if(!d||!d.image_id)continue;
   if(VIEW_SKIP.test([d.title].concat(d.term_titles||[],d.subject_titles||[]).join(' ')))continue;
   if(!viewEl)break;viewShow({src:VIEW_IMG(d.image_id),t:d.title,by:d.artist_title||'',d:(d.date_display||'').replace(/\s+/g,' ')});viewBusy=false;return;}
  if(viewEl)say('No picture came through this time. Try again.');}
 catch(e){if(viewEl)say('No new picture came through. Surprise me needs the internet.');}
 viewBusy=false;}
function openViewer(){if(viewEl)return;
 viewEl=document.createElement('div');viewEl.className='screen tarot viewer';
 viewEl.innerHTML='<div class="tbox tsb tspop vwbox"><button type="button" class="tsb tx" aria-label="Close">×</button>'+
  '<div class="vwstage"><img class="vwpic" alt="" draggable="false"></div><div class="vwcap"></div>'+
  '<div class="vwrow"><button type="button" class="tmore" data-k="prev">‹ Previous picture</button><button type="button" class="tmore" data-k="any">Surprise me</button><button type="button" class="tmore" data-k="next">Next picture ›</button></div></div>';
 viewEl.addEventListener('click',e=>{if(e.target===viewEl)closeViewer();});
 viewEl.querySelector('.tx').addEventListener('click',e=>{e.stopPropagation();closeViewer();});
 viewEl.querySelector('.vwrow').addEventListener('click',e=>{const k=e.target&&e.target.dataset&&e.target.dataset.k;if(!k)return;e.stopPropagation();if(k==='any')viewSurprise();else viewStep(k==='next'?1:-1);});
 viewEl.querySelector('.vwpic').addEventListener('error',()=>{if(viewEl)viewEl.querySelector('.vwcap').textContent='That picture did not load.';});
 ui.appendChild(viewEl);viewI=(viewI+1)%VIEWS.length;viewShow(VIEWS[viewI]);} // each time you look, the next picture of the set
function closeViewer(){if(!viewEl)return;viewEl.remove();viewEl=null;sfx('tick');}
