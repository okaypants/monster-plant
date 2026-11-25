'use strict';
/* Details for the tarot zoom (js/tarot.js): for each of the 78 cards, what is in the card's picture (p: Jackie's deck of Nov 25, animals in place of the people of Pamela Colman Smith's 1909 pictures), its sign,
   planet or element in the Golden Dawn's system (s), which Waite and Smith both knew as members of that order, and for
   some cards a note on how it was made or how it differs from older decks (n). Written for the game as plain sentences.
   The astrology: each Major Arcana card has a sign, a planet or an element; the suits are fire (Wands), water (Cups), air
   (Swords) and earth (Pentacles); the number cards 2 to 10 each have a decan, ten degrees of a sign ruled by a planet. */
const TAROT_LORE={
M00:{p:'A fox in a feathered hat steps toward the edge of a cliff, holding a white rose, with a bundle on a stick and a small white dog alongside.',s:{e:'air'},n:'Older decks leave the Fool without a number or put it last. This deck numbers it 0 and puts it first.'},
M01:{p:'A raccoon raises a wand to the sky and points the other paw at the ground, with a cup, a sword, a wand and a pentacle on the table.',s:{pl:'mercury'},n:'The sideways figure eight above the head is the sign for infinity.'},
M02:{p:'An owl in a moon crown sits between a dark pillar and a pale pillar, holding a scroll, with a crescent moon at its feet.',s:{pl:'moon'}},
M03:{p:'A deer with a crown of stars rests on a cushion in a field of ripe wheat, with trees and a waterfall behind.',s:{pl:'venus'}},
M04:{p:'A crowned ram sits on a stone throne carved with rams\' heads, holding an ankh scepter and a gold orb.',s:{sg:0}},
M05:{p:'A heron in a tall crown raises one wing in blessing between two pillars, with two small birds and a pair of crossed keys below.',s:{sg:1}},
M06:{p:'Two swans face each other beneath a great white bird and the sun, with a fruit tree on one side and a tree of flames on the other.',s:{sg:2},n:'Older decks show one person choosing between two others while Cupid aims an arrow. The 1909 deck changed it to a garden with an angel, and this deck keeps that arrangement.'},
M07:{p:'A stag stands in a chariot under a canopy of stars, with a black cat and a white cat sitting in front.',s:{sg:3}},
M08:{p:'A hare gently holds the jaws of a lion.',s:{sg:4},n:'In older decks Strength is number 11 and Justice is number 8. Waite swapped them so that their signs, Leo and Libra, fall in the order of the zodiac.'},
M09:{p:'A tortoise stands on a mountain peak, holding up a lantern with a star inside and leaning on a staff.',s:{sg:5}},
M10:{p:'A wheel hangs in the sky with a sphinx on top, a snake on one side and a red jackal on the other, and four creatures in the corners.',s:{pl:'jupiter'}},
M11:{p:'A crowned crane sits between two pillars, holding a sword upright in one wing and a pair of scales in the other.',s:{sg:6},n:'In older decks Justice is number 8 and Strength is number 11. Waite swapped them so that their signs, Leo and Libra, fall in the order of the zodiac.'},
M12:{p:'A bat hangs calmly upside down from a leafy branch, with light around its head.',s:{e:'water'}},
M13:{p:'A raven rides a white horse and carries a black flag with a white rose, while the sun rises between two towers.',s:{sg:7}},
M14:{p:'A swan stands in a pool and pours water from one cup into another, with irises on the bank.',s:{sg:8}},
M15:{p:'A winged goat sits on a block holding a torch, and two mice sit below on a loose chain.',s:{sg:9},n:'The chain around the two mice is loose enough to lift off.'},
M16:{p:'Lightning strikes a tall tower, knocking the crown from its top and setting it on fire.',s:{pl:'mars'}},
M17:{p:'A heron kneels by a pool under a great star and pours water from two jugs, one into the pool and one onto the land.',s:{sg:10}},
M18:{p:'A dog and a wolf howl at the moon between two towers, while a crayfish climbs out of a pool.',s:{sg:11}},
M19:{p:'A kitten rides a white horse under a huge sun, holding an orange banner, with sunflowers along a wall.',s:{pl:'sun'},n:'Older decks show two children standing by a wall. The 1909 deck changed it to one child on a horse, and here the rider is a kitten.'},
M20:{p:'A great white bird blows a trumpet from the clouds, and rabbits stand up out of open boxes on the water with their paws raised.',s:{e:'fire'}},
M21:{p:'A hare dances inside a wreath holding two wands, with a dove, an eagle, a bull and a lion in the corners.',s:{pl:'saturn'},n:'The same four creatures appear in the corners of the Wheel of Fortune.'},
W01:{p:'A leafy branch grows from a cloud, with a castle on a hill below.'},
W02:{p:'A fox stands on a castle wall holding a globe, between two wands, and looks out to sea.',s:{d:['mars',0]}},
W03:{p:'A fox stands on a cliff among three wands and watches a ship on the sea.',s:{d:['sun',0]}},
W04:{p:'Two foxes raise bunches of flowers beneath a garland hung on four wands, with a castle behind.',s:{d:['venus',0]}},
W05:{p:'Five young foxes wave their wands at each other in a tangle.',s:{d:['saturn',4]}},
W06:{p:'A fox in a laurel wreath rides a white horse and carries a wand with a wreath on it, while other foxes walk alongside.',s:{d:['jupiter',4]}},
W07:{p:'A fox stands on a hilltop holding a wand across its body, with six more wands rising from below.',s:{d:['mars',4]}},
W08:{p:'Eight wands fly through the air over a river and green hills.',s:{d:['mercury',8]},n:'This is one of the few cards in the deck with no figure in it.'},
W09:{p:'A fox leans on a wand and glances to one side, with eight more wands standing behind it.',s:{d:['moon',8]}},
W10:{p:'A fox bends forward under a bundle of ten wands and walks toward a town.',s:{d:['saturn',8]},n:'Smith based this scene on a card in the Sola Busca deck, made in Italy in the 1490s. The British Museum had put photographs of that deck on display in 1907.'},
W11:{p:'A young fox in a feathered hat stands in the desert and looks up at a tall wand.'},
W12:{p:'A fox in armor rides a rearing horse and holds a wand, with pyramids behind.'},
W13:{p:'A crowned fox sits on a throne with lions on its arms, holding a wand and a sunflower, with a black cat in front.'},
W14:{p:'A crowned fox sits on a throne decorated with lions and salamanders, holding a flowering wand, with a salamander at its feet.'},
C01:{p:'Streams of water pour from a large cup on a cloud into a pond of lilies, and a dove flies down to it.'},
C02:{p:'Two otters face each other and touch cups, beneath a winged lion\'s head and a staff with two snakes.',s:{d:['venus',3]}},
C03:{p:'Three otters dance and raise their cups together, with fruit and a pumpkin at their feet.',s:{d:['mercury',3]}},
C04:{p:'An otter sits under a tree with its arms crossed, with three cups in front of it and a fourth offered from a cloud.',s:{d:['moon',3]}},
C05:{p:'An otter in a dark cloak looks down at three spilled cups, with two cups still standing behind and a bridge beyond.',s:{d:['mars',7]}},
C06:{p:'A bigger otter hands a cup of white flowers to a smaller otter, with five more cups of flowers in front.',s:{d:['sun',7]}},
C07:{p:'An otter looks up at seven cups on a cloud, each holding something different: a castle, jewels, a wreath, a dragon, a snake, a star and a shape under a cloth.',s:{d:['venus',7]}},
C08:{p:'An otter with a pack and a staff walks away from eight cups toward the mountains under a moon.',s:{d:['saturn',11]}},
C09:{p:'A contented otter sits on a bench with its arms crossed, beneath an arch of nine cups.',s:{d:['jupiter',11]},n:'Many readers call this the wish card.'},
C10:{p:'Two otters and two small ones raise their arms to a rainbow of ten cups, with a house and a river behind.',s:{d:['mars',11]}},
C11:{p:'A young otter in a feathered hat stands by the sea and looks at a fish peeking out of a cup.'},
C12:{p:'An otter in armor and a winged helmet rides a calm white horse and holds out a cup.'},
C13:{p:'A crowned otter sits on a shell throne at the edge of the sea and gazes at an ornate covered cup.'},
C14:{p:'A crowned otter sits on a throne on the sea, holding a cup and a scepter, with a fish leaping and a ship behind.'},
S01:{p:'A sword stands upright on a cloud, its tip passing through a crown hung with two leafy branches.'},
S02:{p:'A blindfolded crow perches on a bench by the sea, holding two crossed swords, under a crescent moon.',s:{d:['moon',6]}},
S03:{p:'Three swords pierce a red heart under rain clouds.',s:{d:['saturn',6]},n:'Smith based this picture on a card in the Sola Busca deck, made in Italy in the 1490s. The British Museum had put photographs of that deck on display in 1907.'},
S04:{p:'A crow sleeps on a stone bench with its head tucked under its wing, beneath three hanging swords and a stained-glass window, with a fourth sword below.',s:{d:['jupiter',6]}},
S05:{p:'A crow holds three swords under its wing and watches two other crows walk away, with two swords left on the ground.',s:{d:['venus',10]}},
S06:{p:'A crow poles a boat across the water with two passengers and six swords standing in the bow.',s:{d:['mercury',10]}},
S07:{p:'A crow hurries away from a camp of tents carrying five swords, leaving two stuck in the ground.',s:{d:['moon',10]}},
S08:{p:'A blindfolded crow stands among eight swords stuck in the ground, with a castle on the hill behind.',s:{d:['jupiter',2]}},
S09:{p:'A crow sits up in bed with its head bowed, beneath nine swords on the dark wall.',s:{d:['mars',2]}},
S10:{p:'Ten swords stand in the ground by the water, as the sun begins to rise.',s:{d:['sun',2]}},
S11:{p:'A young crow in a scarf stands on a windy rock and holds up a sword.'},
S12:{p:'A crow in a cape rides a galloping white horse with a sword raised, past trees bent by the wind.'},
S13:{p:'A crowned crow perches on a throne among the clouds, holding a sword upright and raising its other wing.'},
S14:{p:'A crowned crow perches facing forward on a tall throne, holding a sword, with butterflies and crescent moons beside it.'},
P01:{p:'A large gold coin rests on a cloud above a garden with an arch in its hedge.'},
P02:{p:'A badger in a tall hat dances with two coins inside a looped ribbon, while ships ride big waves behind.',s:{d:['jupiter',9]},n:'The ribbon forms a sideways figure eight, the sign for infinity.'},
P03:{p:'A badger stonemason works on a cathedral arch while two others hold up the plans.',s:{d:['mars',9]}},
P04:{p:'A crowned badger sits hugging one coin, with one on its head and one under each foot.',s:{d:['sun',9]}},
P05:{p:'Two badgers in scarves walk through the snow past a lit window with five coins in it.',s:{d:['mercury',1]}},
P06:{p:'A badger in a robe holds a pair of scales and drops coins to two kneeling badgers.',s:{d:['moon',1]}},
P07:{p:'A badger leans on a spade and looks at a bush with seven coins growing on it.',s:{d:['saturn',1]}},
P08:{p:'A badger at a workbench hammers a coin, with six finished coins hanging on the wall and one at its feet.',s:{d:['sun',5]}},
P09:{p:'A badger in a flowered robe stands in a vineyard with a hunting bird on its paw, and a snail passes by.',s:{d:['venus',5]}},
P10:{p:'An old badger sits with two white dogs beneath an arch of ten coins, with a family and a castle behind.',s:{d:['mercury',5]}},
P11:{p:'A young badger stands in a meadow of flowers and holds up a single coin to look at it.'},
P12:{p:'A badger in armor sits on a black horse that is standing still, holding a coin, beside a ploughed field.',n:'This is the only knight in the deck whose horse is not moving.'},
P13:{p:'A crowned badger sits on a throne under an arch of flowers with a coin in its lap, and a white rabbit sits nearby.'},
P14:{p:'A crowned badger in a robe covered with grapes sits on a throne carved with bulls\' heads, holding a coin and a scepter.'}};
const TAROT_SUIT_ELEMENT={W:'fire',C:'water',S:'air',P:'earth'};
const TAROT_ROMAN=['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'];
const TAROT_RANK=['','Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'];
// the details as plain sentences: the picture, its place in the deck, its astrology (with tonight's sky if it matches), a note
function tarotLore(c,now){const L=TAROT_LORE[c.id]||{},out=[],maj=c.id[0]==='M',num=+c.id.slice(1),cap=w=>w[0].toUpperCase()+w.slice(1);
  if(L.p)out.push(['In the picture',L.p]);
  if(maj)out.push(['In the deck','This is card '+TAROT_ROMAN[num]+' of the 22 Major Arcana, which are numbered 0 to XXI.']);
  else{const su=SUIT[c.id[0]];out.push(['In the deck','This is one of the 14 '+su.n+' cards. '+su.n+' are the suit of '+su.m+'.'])}
  const s=L.s||{};let sky='',sg=null;
  if(s.sg!=null){sg=s.sg;sky='This card belongs to the sign '+SIGNS[sg]+'.'}
  else if(s.pl)sky='This card belongs to '+(s.pl==='sun'||s.pl==='moon'?'the '+s.pl:cap(s.pl))+'.';
  else if(s.e)sky='This card belongs to the element of '+s.e+'.';
  else if(s.d){sg=s.d[1];const which=['first','middle','last'][(num-2)%3];sky='This card belongs to the '+which+' ten days of '+SIGNS[sg]+', which '+(s.d[0]==='sun'||s.d[0]==='moon'?'the '+s.d[0]:cap(s.d[0]))+' rules.'}
  else sky=num===1?'The Ace stands for the whole element of '+TAROT_SUIT_ELEMENT[c.id[0]]+', the element of '+SUIT[c.id[0]].n+'.':'As a court card it belongs to '+TAROT_SUIT_ELEMENT[c.id[0]]+', the element of '+SUIT[c.id[0]].n+'.';
  if(typeof skyLon==='function'){const t=now||Date.now(),ms=skySign(skyLon('moon',t)).i,ss=skySign(skyLon('sun',t)).i;
    if(sg!=null&&ms===sg)sky+=' The moon is in '+SIGNS[sg]+' right now.';else if(sg!=null&&ss===sg)sky+=' The sun is in '+SIGNS[sg]+' right now.';
    else if(s.pl&&s.pl!=='sun'&&s.pl!=='moon'&&skyChart(t)[s.pl].rx)sky+=' '+cap(s.pl)+' is retrograde right now.'}
  out.push(['In astrology',sky]);
  if(L.n)out.push(['About this card',L.n]);
  else if(!maj&&num>=2&&num<=10)out.push(['About this card','Before this deck, most number cards showed only a pattern of '+SUIT[c.id[0]].n.toLowerCase()+'. Smith gave every number card a full scene.']);
  return out}
