'use strict';
/* The sampler on the top shelf (Jackie, Nov 16): tap it and its own app, sampler.html, opens over the room.
   The app is a separate page in a frame, so nothing of it loads until it is opened, and closing it throws
   the whole thing away (the record that was playing, the pads, its audio). The game keeps none of it. */
const SAMPLER={x:1252,y:152,w:182,h:72}; // the same box as the 'drum' fidget in js/fidgets.js
/* The milk crate under the window opens the same app (Nov 16): The Crates is for digging through records, and that
   is a crate. Only the crate's body, below the book on top (the book still opens the books, js/care.js). */
const CRATE={x:250,y:660,w:180,h:110};
let samplerEl=null;
function openSampler(){
 if(samplerEl)return;
 samplerEl=document.createElement('div');samplerEl.className='screen sampler';
 const f=document.createElement('iframe');f.src='sampler.html';f.title='The sampler';f.setAttribute('allow','autoplay');
 samplerEl.appendChild(f);ui.appendChild(samplerEl);}
function closeSampler(){if(!samplerEl)return;samplerEl.remove();samplerEl=null;}
addEventListener('message',e=>{if(e.data==='mp-sampler-close'&&samplerEl&&e.source===samplerEl.firstChild.contentWindow)closeSampler();});
