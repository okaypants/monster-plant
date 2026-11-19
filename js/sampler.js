'use strict';
/* The sampler on the top shelf (Jackie, Nov 16): tap it and its own app, sampler.html, opens over the room.
   The app is a separate page in a frame, so nothing of it loads until it is opened, and closing it throws
   the whole thing away (the record that was playing, the pads, its audio). The game keeps none of it. */
const SAMPLER={x:1220,y:140,w:186,h:88}; // the same box as the 'drum' fidget in js/fidgets.js
let samplerEl=null;
function samplerOpen(){return !!(samplerEl&&samplerEl.isConnected);} // its pads light up in the room while its screen is open
function openSampler(){
 if(samplerEl)return;
 radioHold(true); // the radio goes quiet while the sampler is open
 samplerEl=document.createElement('div');samplerEl.className='screen sampler';
 const f=document.createElement('iframe');f.src='sampler.html';f.title='The sampler';f.setAttribute('allow','autoplay');
 samplerEl.appendChild(f);ui.appendChild(samplerEl);}
function closeSampler(){if(!samplerEl)return;samplerEl.remove();samplerEl=null;radioHold(false);}
addEventListener('message',e=>{if(e.data==='mp-sampler-close'&&samplerEl&&e.source===samplerEl.firstChild.contentWindow)closeSampler();});
