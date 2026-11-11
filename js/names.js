'use strict';
/* NAMES (Jackie, Nov 4): every monster gets a silly, cute two-part name when its eyes open (when it becomes a kid).
   Edit these lists freely: short first names, silly last names, all easy to say out loud, nothing mean, no real brands or characters.
   The plant's nature flavors the sound (its strongest lean: good / evil / lawful / chaotic); an easygoing plant mixes them all.
   Two plants never share a first name. You can rename a plant by tapping its name in the journal. */
/* WHERE A GROWN MONSTER MIGHT WANT TO GO (Jackie, Nov 8): edit freely. Each line: [how the ask reads after the monster's name, what its keepsake says on "Out in the world"].
   The monster picks from its own nature (both, if it's two things); an easygoing one uses neutral. */
const GO_REASONS={
 good:[["wants to help out at a friend's garden down the road","Helping out at a friend's garden down the road"],["has heard the community garden needs a welcoming committee","Welcoming everyone at the community garden"],["has a friend by the pond who could use some company","Keeping a friend company by the pond"]],
 lawful:[["has been offered a spot in a very tidy greenhouse","In a very tidy greenhouse"],["has heard the botanical garden needs someone to keep the labels straight","Keeping the labels straight at the botanical garden"]],
 chaotic:[["wants to see the ocean","Off to see the ocean"],["has heard about a kite festival by the sea","Following a kite festival by the sea"],["has spotted a parade that could use one more","Marching with a parade"]],
 evil:[["has heard a big spooky conservatory needs a new resident","Living in a big spooky conservatory"],["has been invited to a very old, very drafty castle greenhouse","Lurking in a drafty castle greenhouse"]],
 neutral:[["is curious what's out there","Finding out what's out there"],["has been wondering what's over the next hill","Somewhere over the next hill"]]};
// Sloth's letter asking to have a monster come stay (Jackie, Nov 8): placeholder wording, edit freely. n = the monster's name.
const slothLetter=n=>'Dear friend, I would love to have '+n+' come stay with me for a while. May '+n+' come?';
const NAME_FIRST={
 good:['Pip','Mallow','Bun','Lulu','Honey','Posy','Tuffet','Mimi'],
 evil:['Grimble','Mortie','Hex','Vexy','Murkle','Nox','Skritch'],
 lawful:['Bartholomew','Penny','Percy','Mabel','Clementine','Rupert','Hettie'],
 chaotic:['Zib','Wonky','Boop','Ziggy','Bonk','Fizz','Kazoo','Tumble']};
const NAME_LAST={
 good:['Puddingtoes','Dewdrop','Wobblebean','Snugglepuff','Butterbloom','Honeyfluff','Mossmuffin','Peachpetal'],
 evil:['Gloomsnack','Nibblethorn','Grumbleroot','Shadowpip','Mudgrin','Crookleaf','Spookspore'],
 lawful:['Buttonworth','Tidyroot','Primblossom','Neatleaf','Teacup','Pennywhistle','Doilybottom'],
 chaotic:['Wigglebottom','Flapdoodle','Bumblesnort','Zigzagger','Noodlewump','Fumblesprout','Boingleton','Splatworth']};

// the cat's name (one word, cozy); picked once, rename it on his journal page
const CAT_NAMES=['Biscuit','Mochi','Pumpkin','Noodle','Waffles','Socks','Toast','Pickles','Marmalade','Butterscotch','Fig','Crumpet','Muffin','Tofu','Pudding'];
function catName(cap=true){if(!st.catName)st.catName=CAT_NAMES[Math.floor(Math.random()*CAT_NAMES.length)];return st.catName;} // captions say his name, never "it"
function nameFlavor(p){const g=p.nge||0,l=p.nlc||0;if(Math.max(Math.abs(g),Math.abs(l))<=.15)return null; // easygoing: a mix of everything
 return Math.abs(g)>=Math.abs(l)?(g>0?'good':'evil'):(l>0?'lawful':'chaotic');}
function firstName(p=st){return p&&p.name?String(p.name).trim().split(/\s+/)[0]:'';}
function makeName(p){const f=nameFlavor(p),pool=L=>f?L[f]:Object.values(L).flat(),pick=a=>a[Math.floor(Math.random()*a.length)];
 const taken=new Set(allRaw().filter(q=>q!==p&&q.id!==p.id).map(q=>firstName(q).toLowerCase()).filter(Boolean));
 let firsts=pool(NAME_FIRST).filter(n=>!taken.has(n.toLowerCase()));if(!firsts.length)firsts=Object.values(NAME_FIRST).flat().filter(n=>!taken.has(n.toLowerCase())); // never two plants with the same first name
 return pick(firsts)+' '+pick(pool(NAME_LAST));}
// every plant whose eyes are open has a name (old saves, debug ages, a second plant): named quietly; the hello caption is only for eyes opening
// the little name tags at the bottom left: one per named monster; hidden on menus and the journal
let tagKey='';
function nameTagsDraw(){const el=document.getElementById('nameTags');if(!el)return;const show=st.started&&!document.querySelector('.screen');
 const P=show?allRaw().filter(q=>q.stage>=0&&q.name):[],key=P.map(q=>q.id+':'+q.name+':'+q.look).join('|');if(key===tagKey)return;tagKey=key;el.innerHTML='';
 for(const q of P){const b=document.createElement('button'),lk=lookOf(q);b.type='button';b.className='tsb';b.style.setProperty('--tint',lk.tint);b.style.setProperty('--nm',lk.name); // its tint, name color and symbol (js/textstyle.js)
  b.appendChild(tsGlyph(lk.sym,lk.name));b.appendChild(document.createTextNode(q.name));b.addEventListener('click',e=>{e.stopPropagation();openJournal('p'+q.id);});el.appendChild(b);}}
function namesTick(){looksTick();nameTagsDraw();if(st.started)catName();eachPlant(()=>{if(st.stage>=4&&!st.name)st.name=makeName(st);});}

/* THE CHOICES (Jackie, Nov 10): every two-way choice in the room, in one place to edit: [key, button word, one short line under it
   saying what happens, 'yes' (sage, check) or 'wait' (cream, hourglass), and a different icon when an hourglass doesn't fit] */
const CHOICES={
 sloth:[['y','Yes, please','arrives in the morning','yes'],['n','Not yet','waits in the journal','wait']],
 go:[['y','Yes','leaves tomorrow morning','yes'],['n','Not yet','asks again in a few days','wait']],
 letter:[['y','Yes','sets off in the morning','yes'],['n','Not yet','waits in the journal','wait']],
 seed:[['s','Send it to Sloth, PhD','flies off right away','yes','plane'],['k','Keep it here','both parents head off in the morning','wait','heart']],
 night:[['y','Goodnight','sleep until morning','yes'],['n','Not yet','stay up a while','wait']],
 wake:[['y','Good morning','start a new day','yes'],['n','Let it sleep','stay in the night','wait','moon']]};
const SLOTH_CHOICES=CHOICES.sloth;
