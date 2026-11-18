'use strict';
/* Details for the tarot zoom (js/tarot.js): for each of the 78 cards, what is in Pamela Colman Smith's picture (p), its sign,
   planet or element in the Golden Dawn's system (s), which Waite and Smith both knew as members of that order, and for
   some cards a note on how it was made or how it differs from older decks (n). Written for the game as plain sentences.
   The astrology: each Major Arcana card has a sign, a planet or an element; the suits are fire (Wands), water (Cups), air
   (Swords) and earth (Pentacles); the number cards 2 to 10 each have a decan, ten degrees of a sign ruled by a planet. */
const TAROT_LORE={
M00:{p:'A traveler steps toward the edge of a cliff, holding a white rose, with a small dog jumping alongside.',s:{e:'air'},n:'Older decks leave the Fool without a number or put it last. This deck numbers it 0 and puts it first.'},
M01:{p:'A figure points one hand at the sky and the other at the ground, with a cup, a sword, a wand and a pentacle on the table.',s:{pl:'mercury'},n:'The sideways figure eight above the head is the sign for infinity.'},
M02:{p:'A veiled figure sits between a black pillar and a white pillar, with a crescent moon at the feet.',s:{pl:'moon'},n:'The letters B and J on the pillars stand for Boaz and Jachin, the two pillars of Solomon\'s temple.'},
M03:{p:'A crowned figure rests on cushions in a field of ripe wheat, with a forest and a stream behind.',s:{pl:'venus'}},
M04:{p:'A ruler in armor sits on a stone throne carved with rams\' heads.',s:{sg:0}},
M05:{p:'A robed figure raises a hand in blessing over two kneeling followers, with two crossed keys below.',s:{sg:1}},
M06:{p:'Two people stand in a garden beneath an angel, each with a tree behind.',s:{sg:2},n:'Older decks show one person choosing between two others while Cupid aims an arrow. Smith drew a garden with an angel instead.'},
M07:{p:'A driver stands in a chariot pulled by two sphinxes, one black and one white.',s:{sg:3}},
M08:{p:'A figure crowned with flowers gently closes a lion\'s mouth.',s:{sg:4},n:'In older decks Strength is number 11 and Justice is number 8. Waite swapped them so that their signs, Leo and Libra, fall in the order of the zodiac.'},
M09:{p:'A cloaked figure stands on a snowy peak, holding up a lantern with a star inside.',s:{sg:5}},
M10:{p:'A wheel turns in the clouds with a sphinx sitting on top, and four winged creatures read books in the corners.',s:{pl:'jupiter'},n:'The letters on the wheel spell TARO, or ROTA, which is Latin for wheel.'},
M11:{p:'A robed judge sits between two pillars, holding a sword upright in one hand and scales in the other.',s:{sg:6},n:'In older decks Justice is number 8 and Strength is number 11. Waite swapped them so that their signs, Leo and Libra, fall in the order of the zodiac.'},
M12:{p:'A figure hangs calmly upside down by one foot from a living tree, with a halo around the head.',s:{e:'water'}},
M13:{p:'A skeleton in black armor rides a white horse and carries a flag with a white rose on it.',s:{sg:7}},
M14:{p:'An angel stands with one foot in a pool and pours water from one cup into another.',s:{sg:8}},
M15:{p:'A horned figure with bat wings crouches above two people who are held by loose chains.',s:{sg:9},n:'The chains around the two people are loose enough to lift off.'},
M16:{p:'Lightning strikes a tower and knocks off its crown, and two people fall from it.',s:{pl:'mars'}},
M17:{p:'A figure kneels by a pool under one large star and seven small ones, pouring water from two jugs.',s:{sg:10},n:'Each of the eight stars has eight points.'},
M18:{p:'A dog and a wolf howl at the moon while a crayfish climbs out of the water between two towers.',s:{sg:11}},
M19:{p:'A child rides a white horse under a large sun, with sunflowers growing behind a wall.',s:{pl:'sun'},n:'Older decks show two children standing by a wall. Smith drew one child on a horse.'},
M20:{p:'An angel blows a trumpet and people rise from their coffins with open arms.',s:{e:'fire'}},
M21:{p:'A dancer floats inside a wreath, with a human, an eagle, a bull and a lion in the four corners.',s:{pl:'saturn'},n:'The same four creatures appear in the corners of the Wheel of Fortune.'},
W01:{p:'A hand reaches out of a cloud holding a branch with new leaves.'},
W02:{p:'A figure holding a small globe looks out to sea from a castle wall, standing between two staves.',s:{d:['mars',0]}},
W03:{p:'A figure seen from behind watches ships crossing a golden sea.',s:{d:['sun',0]}},
W04:{p:'A garland hangs between four staves, and behind it people celebrate outside a castle.',s:{d:['venus',0]}},
W05:{p:'Five young people swing staves at each other in a scuffle.',s:{d:['saturn',4]}},
W06:{p:'A rider wearing a laurel wreath passes through a crowd holding staves.',s:{d:['jupiter',4]}},
W07:{p:'A figure on a hilltop holds off six staves that are raised from below.',s:{d:['mars',4]}},
W08:{p:'Eight staves fly through the air over open country.',s:{d:['mercury',8]},n:'This is one of the few cards in the deck with no people in it.'},
W09:{p:'A figure with a bandaged head leans on a staff in front of a row of eight more.',s:{d:['moon',8]}},
W10:{p:'A figure bends under a heavy bundle of ten staves while walking toward a town.',s:{d:['saturn',8]},n:'Smith based this scene on a card in the Sola Busca deck, made in Italy in the 1490s. The British Museum had put photographs of that deck on display in 1907.'},
W11:{p:'A young messenger in a feathered hat studies a tall staff in a desert with pyramids.'},
W12:{p:'A knight in armor rides a rearing horse past pyramids.'},
W13:{p:'A queen sits on a throne decorated with lions, holding a sunflower, with a black cat sitting in front.'},
W14:{p:'A king sits on a throne decorated with lions, holding a flowering staff, with a small salamander beside the throne.'},
C01:{p:'A hand reaches out of a cloud holding a cup that overflows in five streams, while a dove lowers a wafer into it.'},
C02:{p:'Two people hold out cups to each other beneath a lion\'s head with wings.',s:{d:['venus',3]}},
C03:{p:'Three dancers raise their cups together in a garden full of fruit.',s:{d:['mercury',3]}},
C04:{p:'A figure sits under a tree looking at three cups, while a hand from a cloud offers a fourth.',s:{d:['moon',3]}},
C05:{p:'A figure in a black cloak looks down at three spilled cups, with two more standing behind.',s:{d:['mars',7]}},
C06:{p:'A child hands another child a cup filled with flowers in an old courtyard.',s:{d:['sun',7]}},
C07:{p:'A figure in shadow faces seven cups floating in the clouds, each holding something different.',s:{d:['venus',7]}},
C08:{p:'A figure walks away from eight stacked cups toward the hills, under a moon.',s:{d:['saturn',11]}},
C09:{p:'A contented figure sits with folded arms in front of a curved shelf holding nine cups.',s:{d:['jupiter',11]},n:'Many readers call this the wish card.'},
C10:{p:'Two adults and two dancing children stand beneath a rainbow of ten cups.',s:{d:['mars',11]}},
C11:{p:'A page looks at a fish that is poking its head out of a cup.'},
C12:{p:'A knight wearing a winged helmet rides slowly forward, holding out a cup.'},
C13:{p:'A queen sits on a throne at the edge of the water, looking at an ornate cup with a lid.'},
C14:{p:'A king sits on a throne that floats on the sea, with a ship and a fish behind.'},
S01:{p:'A hand reaches out of a cloud gripping an upright sword with a crown and a wreath at its tip.'},
S02:{p:'A blindfolded figure sits holding two crossed swords, with the sea and a crescent moon behind.',s:{d:['moon',6]}},
S03:{p:'Three swords pierce a red heart under rain clouds.',s:{d:['saturn',6]},n:'Smith based this picture on a card in the Sola Busca deck, made in Italy in the 1490s. The British Museum had put photographs of that deck on display in 1907.'},
S04:{p:'A stone figure of a knight lies in prayer on a tomb beneath a stained-glass window.',s:{d:['jupiter',6]}},
S05:{p:'A figure gathers up swords while two others walk away toward the water.',s:{d:['venus',10]}},
S06:{p:'A ferryman poles a boat that carries two huddled passengers and six swords.',s:{d:['mercury',10]}},
S07:{p:'A figure tiptoes away from a camp carrying five swords and leaving two behind.',s:{d:['moon',10]}},
S08:{p:'A bound and blindfolded figure stands among eight swords stuck in the ground.',s:{d:['jupiter',2]}},
S09:{p:'A figure sits up in bed with head in hands, and nine swords hang on the dark wall.',s:{d:['mars',2]}},
S10:{p:'A figure lies face down with ten swords in the back, as the sun begins to rise.',s:{d:['sun',2]}},
S11:{p:'A page holds up a sword on a windy hill and looks over one shoulder.'},
S12:{p:'A knight charges forward at full gallop with a sword raised.'},
S13:{p:'A queen sits on a throne carved with butterflies, raising a sword in one hand and holding out the other.'},
S14:{p:'A king sits facing forward on a throne, holding a sword upright.'},
P01:{p:'A hand reaches out of a cloud holding a gold coin above a garden with an arch in its hedge.'},
P02:{p:'A juggler in a tall hat dances with two coins inside a looped ribbon, while ships ride big waves behind.',s:{d:['jupiter',9]},n:'The ribbon forms a sideways figure eight, the sign for infinity.'},
P03:{p:'A stonemason works on a cathedral arch while two others hold up the plans.',s:{d:['mars',9]}},
P04:{p:'A crowned figure holds one coin tightly, with another on the crown and one under each foot.',s:{d:['sun',9]}},
P05:{p:'Two ragged people walk through the snow past a lit church window.',s:{d:['mercury',1]}},
P06:{p:'A merchant holding scales drops coins into the hands of two kneeling people.',s:{d:['moon',1]}},
P07:{p:'A gardener leans on a hoe and looks at seven coins growing on a vine.',s:{d:['saturn',1]}},
P08:{p:'A craftsperson sits at a bench carving a star into a coin, with finished coins hanging on a post.',s:{d:['sun',5]}},
P09:{p:'A figure in a flowered robe stands in a vineyard with a hooded falcon on one hand.',s:{d:['venus',5]}},
P10:{p:'An old person sits with two dogs by an archway while a family passes, with ten coins in front of the scene.',s:{d:['mercury',5]}},
P11:{p:'A page stands in a green field looking at a coin held up in both hands.'},
P12:{p:'A knight sits on a heavy black horse that is standing still, holding out a coin.',n:'This is the only knight in the deck whose horse is not moving.'},
P13:{p:'A queen sits on a throne among flowers, holding a coin in both hands, and a rabbit sits nearby.'},
P14:{p:'A king in a robe covered with grapes sits in front of a castle, on a throne carved with bulls\' heads.'}};
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
