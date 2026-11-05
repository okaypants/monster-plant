'use strict';
/* NAMES (Jackie, Nov 4): every monster gets a silly, cute two-part name when its eyes open (when it becomes a kid).
   Edit these lists freely: short first names, silly last names, all easy to say out loud, nothing mean, no real brands or characters.
   The plant's nature flavors the sound (its strongest lean: good / evil / lawful / chaotic); an easygoing plant mixes them all.
   Two plants never share a first name. You can rename a plant by tapping its name in the journal. */
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

function nameFlavor(p){const g=p.nge||0,l=p.nlc||0;if(Math.max(Math.abs(g),Math.abs(l))<=.15)return null; // easygoing: a mix of everything
 return Math.abs(g)>=Math.abs(l)?(g>0?'good':'evil'):(l>0?'lawful':'chaotic');}
function firstName(p=st){return p&&p.name?String(p.name).trim().split(/\s+/)[0]:'';}
function makeName(p){const f=nameFlavor(p),pool=L=>f?L[f]:Object.values(L).flat(),pick=a=>a[Math.floor(Math.random()*a.length)];
 const taken=new Set(allRaw().filter(q=>q!==p&&q.id!==p.id).map(q=>firstName(q).toLowerCase()).filter(Boolean));
 let firsts=pool(NAME_FIRST).filter(n=>!taken.has(n.toLowerCase()));if(!firsts.length)firsts=Object.values(NAME_FIRST).flat().filter(n=>!taken.has(n.toLowerCase())); // never two plants with the same first name
 return pick(firsts)+' '+pick(pool(NAME_LAST));}
// every plant whose eyes are open has a name (old saves, debug ages, a second plant): named quietly; the hello caption is only for eyes opening
function namesTick(){eachPlant(()=>{if(st.stage>=4&&!st.name)st.name=makeName(st);});}
