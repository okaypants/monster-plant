'use strict';
/* THE CHEAT SHEET (Jackie, Nov 27: "maybe we should have a little cheat sheet help tab thing that pops up for everything that does
   something and says what", "like a translucent little ? in a circle you can click"). A small see-through ? in a circle sits
   in the bottom right corner of every room. A tap opens a sheet that lists everything in that room that does something, with
   what it does, in plain words. A tap on the ×, outside the sheet or on the ? again puts it away.
   The lists are written by hand from what the rooms really do (js/input.js, js/fidgets.js, js/movieroom.js): when a thing is
   added, changed or taken out, change its line here too. */
const HELP={main:{title:'The study',rows:[
  ['🌱','Your monster','Tap to pet it. Drag it to move it somewhere else.'],
  ['🏷️','A name tag','Tap to open that monster’s journal.'],
  ['💧','Water cooler','Tap to take a cup of water, then tap a monster to water it.'],
  ['🧊','Mini fridge','Snacks. Drag one to a monster.'],
  ['📚','Books on the shelves','Tap a row to see four books, then tap one to read it.'], /* Jackie, Nov 27: "u can just tap a book to read it" (this had said to drag it to a monster) */
  ['⭐','Star cupboard','Cat toys, decorations and string lights.'],
  ['💡','Lamps and string lights','Tap to turn them on or off.'],
  ['🪟','Window','Tap to open or close the curtains.'],
  ['🌙','Bassinet','Tap to say goodnight. The armchair does too when someone is in it.'],
  ['🗄️','Desk drawers','The files of your past monsters.'],
  ['📻','Radio','Tap to turn it on or off.'],
  ['🎛️','Sampler on the top shelf','The Crates: make songs from old records.'],
  ['💿','Milk crate','Puts a record on the radio.'],
  ['🔮','Crystal ball','Tap for a prophecy.'],
  ['🌗','Moon dial','Tells you about tonight’s moon.'],
  ['🃏','Moon box','Birth charts, tarot and I Ching readings.'], /* Jackie, Nov 27: "Moon box has birth charts, tarot, and i ching readings" */
  ['🖼️','Picture viewer','Old pictures to look through.'],
  ['🔒','Lockbox','Keep your game safe with a backup.'],
  ['🐈','The cat','Tap to pet.'],
  ['✨','Everything else','Bounces, rattles or rustles when you tap it.'],
  ['🚪','Rooms','Go to another room.']]},
 movie:{title:'The movie room',rows:[
  ['🎭','Curtains','Tap to open or close them. Closing pauses what is on.'],
  ['📱','Remote','Power, channels, the guide, TV or film, and play.'],
  ['🎞️','Reels, tapes and discs','The film library.'],
  ['🍿','Popcorn machine','Hold it down to pop. Tap the buckets to hand some out.'],
  ['🥤','Soda fountain','Tap for a soda to hand out.'],
  ['🕶️','Glasses','Tint the film.'],
  ['🔊','Speaker','The film’s own sound, your soundtrack, or off.'],
  ['💡','Light knob and wall lamps','Turn the room’s lights down or up.'],
  ['🎹','Scorimba','Play along with a film, or record a score for it.'],
  ['📖','Books','Old writing about the movies.'],
  ['🗄️','Six drawers','Left to right: decorations, string lights, blankets, curtains, ticket stubs, lost and found.'],
  ['🐈','The cat','Tap to pet.'],
  ['🚪','Rooms','Go to another room.']]}};
let helpEl=null;const helpBtn=document.createElement('button');helpBtn.id='helpBtn';helpBtn.type='button';helpBtn.textContent='?';helpBtn.setAttribute('aria-label','What does what');ui.appendChild(helpBtn);
function helpClose(){if(helpEl){helpEl.remove();helpEl=null;}}
function helpOpen(){if(helpEl){helpClose();return;}if(typeof sfx==='function')sfx('tick');const H=HELP[typeof roomNow==='function'?roomNow():'main']||HELP.main;helpEl=document.createElement('div');helpEl.className='screen helpsheet';
 helpEl.innerHTML='<div class="helpbox"><h2></h2><div class="helprows"></div><button type="button" class="helpx" aria-label="Close">×</button></div>';helpEl.querySelector('h2').textContent=H.title+': what does what';
 const R=helpEl.querySelector('.helprows');R.style.gridTemplateRows='repeat('+Math.ceil(H.rows.length/2)+',auto)'; /* two columns read downwards, left then right */for(const [ic,name,what] of H.rows){const d=document.createElement('div');d.className='helprow';const i=document.createElement('i');i.textContent=ic;i.setAttribute('aria-hidden','true');const b=document.createElement('b');b.textContent=name;const s=document.createElement('span');s.textContent=what;d.append(i,b,s);R.appendChild(d);}
 helpEl.querySelector('.helpx').onclick=helpClose;helpEl.addEventListener('click',e=>{if(e.target===helpEl)helpClose();});helpEl.addEventListener('pointerdown',e=>e.stopPropagation());ui.appendChild(helpEl);}
helpBtn.addEventListener('click',e=>{e.stopPropagation();helpOpen();});helpBtn.addEventListener('pointerdown',e=>e.stopPropagation());
/* It sits in the bottom right corner of the room, in from the edges (Jackie, Nov 27: "i also want it in the bottom right but also
   spaced away from margins"; it began beside the Rooms button). The style sheet places it; this only hides it while the game
   has not begun or a full page such as the journal, the sampler or Scorimba is open. It also steps aside for a tray along
   the bottom and for the remote, which use that corner (index.html). */
function helpPlace(){helpBtn.hidden=!st.started||[...document.querySelectorAll('.screen')].some(e=>!e.matches('.movieroom,.helpsheet'));}
/* No timer: it finds its place only when something that could move or hide it happens (the window changes size, or a page is
   opened or closed over the room), which costs a phone nothing while you simply play (Jackie, Nov 27: "do whatever is best also
   for the phone battery throughout all this and memory"). */
let helpDue=0;function helpSoon(){if(helpDue)return;helpDue=requestAnimationFrame(()=>{helpDue=0;helpPlace();});}
addEventListener('resize',helpSoon);new MutationObserver(helpSoon).observe(ui,{childList:true});new MutationObserver(helpSoon).observe(document.body,{childList:true});helpSoon();
