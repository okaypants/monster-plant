'use strict';
/* THE BOOKS (Jackie, Nov 15): each of the twelve books holds many reads, and all of them are real.
   THE BAR (Jackie, Nov 17): for clever older kids through adults. No nursery material and nothing a Western reader already
   knows. Uncommon, real, and short: cut hard, but keep the voice and the heart of the thing. Words in another language appear
   only as the original text, copied from a named source, with English made from that original (never from another translation).
   Poems and old texts are word for word (spelling and punctuation as printed), free to use (published before 1931).
   Sloth's Almanac is true facts told by Sloth, PhD; the grimoire is real folklore, with the place it comes from named.
   Folktales, facts and old texts that can't be quoted word for word are written for the game in plain words: the title page names
   where they come from ("told in …", "retold from …"), and src says where to check them.
   A book goes through all of its reads in a shuffled order before any comes round again (nextRead below).

   To add a read, add an entry to its book:
     t    the title, shown on the first page          by   the author and year, or where it's told (shown under the title)
     p    the pages, in order: about 12 words each so they fit on a phone; \n starts a new line (poems keep their lines)
     src  for facts and folklore: where to check it (never shown in the game)
   A page can also be {o, l, e} (Jackie, Nov 16): o = the words in their original script, l = the language, e = the English.
   The book shows these as facing pages, the original on the left and the English on the right (readPages below).
   Only where a real source text exists, copied exactly; the comment by the read says where it is from.
   A read can carry rec, a real record to play: see THE SONG BOOK below.
   "from" in a title means it's a part of a longer piece. The open book shows two pages at a time; the title is the first page. */
const STORIES={
 fairy:[
  {t:'The Sun and the Moon',by:'told in Korea',src:'해와 달이 된 오누이 (the brother and sister who became the sun and the moon), a Korean folktale; the tiger’s line "떡 하나 주면 안 잡아먹지" is its best-known sentence; the red sorghum stalks are the tale’s ending.',p:[
   'A mother was walking home over the hills at night with a basket of rice cakes.',
   'A tiger stepped onto the path.',
   {o:'떡 하나 주면 안 잡아먹지.',l:'ko',e:'“Give me one rice cake and I won’t eat you.”'},
   'It said so at every hill, until the basket was empty. Then it ate her, put on her clothes and went to her house.',
   'Her two children saw the tail under the skirt. They climbed a tree and begged the sky for a rope.',
   'A strong rope came down, and they climbed up. The tiger asked too, and got a rotten one.',
   'It fell into a field of sorghum. That is why sorghum stalks are stained red.',
   'The brother became the moon. The sister became the sun.']},
  {t:'Why the Sky Is High',by:'told in the Philippines',src:'A Bukidnon tale from Mindanao, in Mabel Cook Cole, Philippine Folk Tales (1916), "How the Moon and the Stars Came to Be"; retold.',p:[
   'Long ago the sky hung so low you could reach up and touch it.',
   'One day a woman went out to pound rice.',
   'She took off her beads and her comb and hung them on the sky to keep them out of the way.',
   'Each time she lifted her pestle, it knocked against the sky.',
   'She lifted it higher, and hit harder. The sky began to rise.',
   'It rose so far that she never got her things back.',
   'Her comb became the moon. Her beads scattered and became the stars.']},
  {t:'The Toad Who Sued Heaven',by:'told in Vietnam',src:'Cóc kiện Trời, a Vietnamese folktale; the saying "Con cóc là cậu ông Trời, hễ ai đánh nó thì trời đánh cho" comes from it.',p:[
   'It had not rained for three years. Toad decided to go up and complain to Heaven.',
   'On the way Toad was joined by Crab, Bear, Tiger, Fox and a swarm of bees.',
   'At the gate of Heaven stood a great drum. Toad beat it.',
   'Heaven sent a rooster to peck Toad. Fox caught it. Heaven sent a dog. Bear dealt with the dog.',
   'Heaven sent the god of thunder. The bees stung him, Crab pinched him and Tiger sat on him.',
   'So Heaven listened. “Uncle Toad,” Heaven said, “next time just grind your teeth, and I will send rain.”',
   {o:'Con cóc là cậu ông Trời.',l:'vi',e:'The toad is Heaven’s uncle. People in Vietnam still say it, and toads still croak before rain.'}]},
  {t:'The Smell of Soup',by:'told from Turkey to Central Asia',src:'A Nasreddin Hodja tale (Nasreddin, Molla Nasreddin, Afandi), told across Turkey, Iran, the Caucasus and Central Asia.',p:[
   'A poor man had only a piece of dry bread. He held it over the steam of a cook’s soup pot to soften it.',
   'The cook grabbed him. “You took the smell of my soup. Pay for it.”',
   'They went before the judge, who that day was Nasreddin.',
   'Nasreddin listened. Then he took out his own purse and shook it next to the cook’s ear.',
   '“Did you hear the coins?”\n“Yes,” said the cook.',
   '“Then you are paid. The sound of money is the price of the smell of soup.”']},
  {t:'The Tea-Kettle',by:'told in Japan',src:'Bunbuku Chagama (分福茶釜), a folktale attached to Morin-ji temple in Tatebayashi, Gunma, where a kettle said to be the one is kept.',p:[
   'A priest bought an old iron tea-kettle and set it on the fire.',
   'The kettle shouted “Hot!” It grew a head, four legs and a bushy tail, and ran around the room.',
   'It was a tanuki, a raccoon dog, and tanuki can change their shape.',
   'The frightened priest sold it to a tinker for almost nothing.',
   'That night the kettle spoke. “Feed me well and never put me on a fire, and I will make you rich.”',
   'The tinker put up a tent. Crowds paid to watch a tea-kettle walk a tightrope with a fan and a parasol.',
   'When the tinker had enough money, the kettle went home to the temple. The temple says it is still there.']},
  {t:'The Bird Who Raised a King',by:'told in Iran',src:'The story of Zal and the Simurgh in Ferdowsi’s Shahnameh (about 1010); retold.',p:[
   'A baby was born with hair as white as snow. The baby’s name was Zal.',
   'Zal’s father, a great warrior, was ashamed. He left the baby on a mountain.',
   'On that mountain lived the Simurgh, a bird so old it had seen the world end three times.',
   'It carried the baby to its nest and raised Zal with its own chicks.',
   'Years later the father came back, sorry, to look for his child.',
   'The Simurgh let Zal go, and gave a parting gift of its own feathers.',
   '“Burn one if you are ever in trouble,” it said, “and I will come.”',
   'Zal grew up to rule a kingdom. Twice in his life he burned a feather, and both times the bird came.']}],
 nonsense:[
  {t:'Khichuri',by:'Sukumar Ray, 1923',src:'সুকুমার রায়, খিচুড়ি, the first poem of আবোল তাবোল (Abol Tabol, 1923); Bengali as printed in সুকুমার রায় রচনাবলী vol. 1, from Bengali Wikisource (proofread page 27), lines 1-4 and 13-14. English from the Bengali.',p:[
   'In 1923 a Bengali writer, Sukumar Ray, published a book of nonsense poems. It is still one of the best-loved children’s books in Bengal.',
   'The first poem is named after khichuri, a dish of rice and lentils cooked into one mush. In it, animals get mixed the same way.',
   {o:'হাঁস ছিল, সজারু, (ব্যাকরণ মানি না),\nহয়ে গেলে ‘হাঁসজারু’ কেমনে তা জানি না।',l:'bn'},
   'There was a duck, and a porcupine (I don’t obey grammar). They became a duckupine. How, I don’t know.',
   {o:'বক কহে কচ্ছপে—“বাহবা কি ফুর্তি!\nঅতি খাসা আমাদের বকচ্ছপ মূর্তি।”',l:'bn'},
   'The stork says to the turtle, “Bravo, what fun! Our storkturtle shape is very fine.”',
   {o:'হাতিমির দশা দেখ-তিমি ভাবে জলে যাই,\nহাতি বলে, “এই বেলা জঙ্গলে চল ভাই।”',l:'bn'},
   'Look at the poor elewhale. The whale thinks, “To the water.” The elephant says, “Time for the jungle, brother.”']},
  {t:'Das große Lalulā',by:'Christian Morgenstern, 1905',src:'Christian Morgenstern, Galgenlieder (1905); text as on German Wikisource (Alle Galgenlieder, p. 19), first stanza and refrain. The words are invented, so there is nothing to translate.',p:[
   'A German poet wrote this in 1905. It is not in German, or in any other language.',
   'Kroklokwafzi? Semememi!\nSeiokrontro – prafriplo:',
   'Bifzi, bafzi; hulalemi:\nquasti basti bo...',
   'Lalu, lalu lalu lalu la!',
   'He once said, joking, that it was the record of a chess game. Read it out loud and decide for yourself.']},
  {t:'Karawane',by:'Hugo Ball, 1917',src:'Hugo Ball, Karawane, performed at the Cabaret Voltaire, Zurich, June 1916; printed in Dada Almanach (Berlin, 1920), p. 53; text as on German Wikisource, lines 1-9.',p:[
   'In 1916, in a café in Zurich, a man walked on stage dressed in a tall cardboard tube and recited a poem with no words in it.',
   'He said he wanted to get away from language that newspapers had worn out.',
   'jolifanto bambla ô falli bambla\ngrossiga m’pfa habla horem',
   'égiga goramen\nhigo bloiko russula huju\nhollaka hollala',
   'anlogo bung\nblago bung\nblago bung\nbosso fataka',
   'The title means “caravan”. Some people hear elephants walking.']},
  {t:'The Great Panjandrum',by:'Samuel Foote, 1755',src:'Attributed to Samuel Foote, 1755, written to test the memory of the actor Charles Macklin, who claimed he could repeat anything after hearing it once; first printed in Maria Edgeworth, Harry and Lucy Concluded (1825).',p:[
   'An actor boasted that he could repeat any speech after hearing it once. A rival wrote this to test him. The actor gave up.',
   'So she went into the garden to cut a cabbage-leaf to make an apple-pie;',
   'and at the same time a great she-bear, coming up the street, pops its head into the shop.',
   '“What! no soap?” So he died, and she very imprudently married the barber;',
   'and there were present the Picninnies, and the Joblillies, and the Garyulies,',
   'and the great Panjandrum himself, with the little round button at top.']}],
 almanac:[
  {t:'On Sloths',by:'Sloth’s Almanac',src:'Three-toed sloths (Bradypus): weekly descent and fur algae, Pauli et al. 2014, Proc. R. Soc. B; digestion about 6 to 30 days, averaging about 16 (Cliffe et al. 2015, PeerJ; Foley et al. 1995); swimming, Smithsonian National Zoo sloth fact sheet',p:[
   'Ah, sloths. A subject I know from the inside.',
   'A three-toed sloth climbs down from its tree about once a week.',
   'The rest of the week is spent up high, mostly holding still.',
   'Green algae grows in a sloth’s fur. It may help a sloth hide among the leaves.',
   'One leafy meal can take a sloth weeks to digest, sometimes up to a month.',
   'Sloths are fine swimmers, and quicker in water than on land.',
   'I mention the swimming to anyone who calls me slow.']},
  {t:'On Leaves with Holes',by:'Sloth’s Almanac',src:'Monstera deliciosa: name from Latin monstrum; leaf holes (fenestration) appear as the plant matures; light-capture idea, Muir 2013, The American Naturalist; edible ripe fruit, Kew Plants of the World Online and Missouri Botanical Garden',p:[
   'Some plants grow leaves with holes in them, on purpose.',
   'The best known is the monstera. The name probably comes from the Latin for “monster”.',
   'A young monstera leaf is whole. The holes arrive as the plant grows up.',
   'Nobody is sure why. Botanists are still arguing, politely.',
   'One idea: a leaf with holes can spread wider and catch more scattered sunlight.',
   'Another: wind and rain slip through instead of tearing the leaf.',
   'The fully ripe fruit is said to taste of pineapple and banana. Unripe, it stings the mouth. I shall wait.']},
  {t:'On the Flytrap That Counts',by:'Sloth’s Almanac',src:'Venus flytrap (Dionaea muscipula): two touches within about 20-30 seconds close the trap, about five start digestion, Böhm et al. 2016, Current Biology; native range, the Carolinas, USA',p:[
   'The Venus flytrap can count. I would not joke about arithmetic.',
   'Inside each trap are tiny trigger hairs.',
   'One touch does nothing. It might be a raindrop.',
   'A second touch within about half a minute, and the trap snaps shut.',
   'Around five touches, and the plant begins its dinner.',
   'So a flytrap rarely wastes a meal on a false alarm.',
   'Flytraps are native to just one small corner of the world: the Carolinas.']},
  {t:'On Flowers That Listen',by:'Sloth’s Almanac',src:'Evening primrose (Oenothera drummondii): within three minutes of the sound of a flying bee, or a recording at the same pitch, nectar sugar rose by about 20 percent; higher-pitched sound did nothing (Veits et al., Ecology Letters, 2019).',p:[
   'Some flowers can hear. I did not believe it either.',
   'The beach evening primrose is a yellow flower shaped like a small bowl.',
   'When a bee buzzes nearby, the petals shake very slightly at the same pitch.',
   'Within three minutes, the flower makes its nectar about a fifth sweeter.',
   'Scientists played it recordings to be sure. Bee sounds worked. Higher sounds did nothing.',
   'Sweeter nectar means the bee stays longer and comes back.']},
  {t:'On the Plant That Learns',by:'Sloth’s Almanac',src:'Mimosa pudica: leaves fold when touched or dropped; plants dropped repeatedly from 15 cm stopped folding within one session and still did not fold a month later, while folding normally when shaken (Gagliano et al., Oecologia, 2014).',p:[
   'The sensitive plant folds its leaves shut the moment anything touches it.',
   'A scientist in Australia wondered if it could learn to stop.',
   'She dropped potted plants a short way onto soft foam, again and again. It gave them a fright and did them no harm.',
   'At first they folded up every time. After a few dozen drops, they stopped bothering.',
   'They still folded when they were shaken, so they were not just tired.',
   'A month later she dropped them again. They remembered, and stayed open.',
   'A plant has no brain. Nobody yet knows where it keeps the memory.']}],
 grimoire:[
  {t:'Abracadabra',by:'a Roman cure, about the year 200',src:'Quintus Serenus Sammonicus, Liber Medicinalis, chapter 51 (2nd-3rd century): the first known record of the word, written out losing a letter each line and worn around the neck against fever.',p:[
   'The oldest book that mentions this word is a Roman doctor’s, from about 1,800 years ago. It was medicine.',
   'For a fever, he says, write the word on a slip of paper. Under it write it again with the last letter gone, and go on to the end.',
   'ABRACADABRA\nABRACADABR\nABRACADAB\nABRACADA\nABRACAD\nABRACA',
   'ABRAC\nABRA\nABR\nAB\nA',
   'Tie the paper round the neck with a linen thread and wear it for nine days.',
   'As the word shrinks to nothing, the fever is supposed to shrink with it.']},
  {t:'The Square',by:'a charm found at Pompeii',src:'The Sator (Rotas) square: the oldest examples were scratched on walls at Pompeii before the eruption of AD 79; later used across Europe and Ethiopia as a charm against fire, fever and mad dogs. AREPO appears nowhere else in Latin.',p:[
   'Five Latin words, five letters each.',
   'SATOR\nAREPO\nTENET\nOPERA\nROTAS',
   'Read it left to right, right to left, top to bottom or bottom to top. It says the same thing every way.',
   'Someone scratched it on a wall in Pompeii before the volcano buried the town in the year 79.',
   'For the next 1,800 years people wrote it on houses to stop fires and on bread to cure dog bites.',
   'Nobody can say for sure what it means. One of the five words, AREPO, has never been found anywhere else.']},
  {t:'A Scroll as Tall as You',by:'made in Ethiopia',src:'Ethiopian healing (protective) scrolls in Ge’ez, made by a dabtara from the hide of an animal chosen for the patient and cut to the patient’s height, with prayers, names and talismanic drawings, often of eyes (see J. Mercier, Ethiopian Magic Scrolls, 1979).',p:[
   'In the highlands of Ethiopia, a person who is ill or unlucky can have a scroll made.',
   'A scholar called a dabtara makes it from the skin of a sheep or goat chosen for that one person.',
   'The strip is cut exactly as long as the person is tall, so it protects them from head to foot.',
   'It is filled with prayers in Ge’ez, an old church language, and with drawings.',
   'Many of the drawings are faces with wide-open eyes. They stare back at whatever is causing the trouble.',
   'The owner keeps the scroll rolled in a leather case and wears it, sometimes for life.']},
  {t:'Shine, Shine, Monk',by:'a weather charm from Japan',src:'Teru teru bōzu (てるてる坊主): a doll of white paper or cloth hung under the eaves for fine weather; a face is drawn on it only after the wish comes true; hung upside down to ask for rain.',p:[
   'In Japan, on the night before a picnic or a sports day, children make a small ghost-shaped doll from white paper or cloth.',
   {o:'てるてる坊主',l:'ja',e:'It is called a teru teru bōzu. The name means “shine, shine, monk”.'},
   'They hang it by the window and ask it for a sunny day.',
   'It has no face yet. If the sun comes out, it gets one drawn on as a thank-you.',
   'Hang it upside down, and you are asking for rain.']},
  {t:'The Mandrake',by:'told across Europe and the Middle East',src:'Mandragora officinarum, nightshade family (Solanaceae, with tomato and potato); root shape and the shriek legend from medieval herbals; pulling it up with a dog from Josephus, The Jewish War 7.6.3 (a root he calls baaras).',p:[
   'The mandrake is a real plant, a cousin of the tomato and the potato.',
   'Its root often forks in two, like a little person with legs.',
   'So people said the root was alive, and that it screamed when it was pulled up.',
   'The scream was supposed to kill whoever heard it.',
   'Old books give the method. Stop your ears with wax, tie a hungry dog to the plant, and throw the dog some food from far away.']}],
 /* THE SONG BOOK (Jackie, Nov 17): the true story of a real song, told in plain words, and the song itself. Every one is a record
    in the crates (the same library of old free 78s the radio and the sampler use), so the open book has a Play the record
    button that streams it (js/care.js). rec = {id: the record at archive.org, f: its sound file, by: who plays it and the year}.
    Only songs with a record there, published 101 or more years ago, go in this book. */
 songs:[
  {t:'Yes! We Have No Bananas',by:'Frank Silver and Irving Cohn, 1923',rec:{id:'78_yes-we-have-no-bananas_billy-west-frank-silver-and-irving-cohn_gbia0099334a',f:'Yes! We Have No Bananas - Billy West - Frank Silver and Irving Cohn.mp3',by:'Billy West, 1923'},
   src:'Written by Frank Silver and Irving Cohn for the revue Make It Snappy; number one in the US for five weeks in 1923. Silver said the line came from a Greek fruit seller on Long Island. Sung by Belfast dock workers on strike in 1932.',p:[
   'In 1923 this was the biggest song in America for five weeks.',
   'One of its writers said he got the title from a fruit seller on Long Island.',
   'The man started every answer with “yes”, even when the answer was no.',
   'So when he ran out of bananas, that is what he said.',
   'The shop in the song has beans, onions, cabbages and scallions. It has every kind of fruit except the one you asked for.',
   'Nine years later, workers on strike in Belfast marched to it. It was the one song both sides of the city knew.']},
  {t:'Ain’t We Got Fun',by:'Richard Whiting, Raymond Egan and Gus Kahn, 1921',rec:{id:'78_aint-we-got-fun_billy-jones-kahn-egan-whiting_gbia0332266a',f:'AIN\'T WE GOT FUN - BILLY JONES - Kahn - Egan.mp3',by:'Billy Jones, 1921'},
   src:'Music Richard A. Whiting, words Raymond B. Egan and Gus Kahn, 1921. Played by Klipspringer in The Great Gatsby (1925), chapter 5.',p:[
   'This is a cheerful song about having no money at all.',
   'The rent is not paid. The landlord is at the door. The couple in the song are having a lovely time anyway.',
   'It came out in 1921, when a lot of people were broke and tired of being sad about it.',
   'Four years later it turned up in a famous novel, The Great Gatsby.',
   'A house guest plays it on the piano in a millionaire’s mansion.']},
  {t:'St. Louis Blues',by:'W. C. Handy, 1914',rec:{id:'78_st-louis-blues_lieut-jim-europes-369th-u-s-inf-hell-fighters-band-handy_gbia0298608b',f:'ST. LOUIS BLUES - Lieut. JIM EUROPE\'S 369th U. S. Inf. ("Hell Fighters") Band.mp3',by:'the 369th Infantry “Hell Fighters” Band, 1919'},
   src:'W. C. Handy, 1914; in Father of the Blues (1941) he says the line came from a woman he heard in St. Louis in 1892. The 369th Infantry Regiment band under James Reese Europe played in France in 1918 and recorded for Pathé in March 1919.',p:[
   'W. C. Handy wrote this in 1914. It became one of the most recorded songs there is.',
   'Years before, broke and sleeping outdoors in St. Louis, he heard a woman talking to herself in the street.',
   'She said her man had a heart like a rock cast in the sea.',
   'Handy never forgot it, and he put it in the song.',
   'The band on this record were soldiers. They were a Black regiment from New York who fought in France in 1918.',
   'Their band played for French towns that had never heard music like it. They made this record a few weeks after coming home.']},
  {t:'Aloha ʻOe',by:'Liliʻuokalani, 1878',rec:{id:'78_aloha-oe-farewell-to-thee_royal-hawaiian-troubadours_gbia0301530a',f:'ALOHA OE. (Farewell to Thee.) - Royal Hawaiian Troubadours..mp3',by:'the Royal Hawaiian Troubadours, 1904'},
   src:'Written in 1878 by Princess Liliʻuokalani (queen 1891-1893, the last monarch of the Hawaiian Kingdom) after a visit to Maunawili ranch on Oʻahu, where she saw a farewell embrace. Aloha ʻoe = farewell to you.',p:[
   'A princess wrote this song on a horseback ride home.',
   'In 1878 Liliʻuokalani visited a ranch on the island of Oʻahu.',
   'As her party left, she saw two people hug goodbye at the gate.',
   'She hummed a tune all the way back over the mountains, and the song was finished soon after.',
   'The title means “farewell to you”.',
   'She became queen of Hawaiʻi in 1891. She was its last monarch, and she wrote more than a hundred songs.']},
  {t:'Cielito Lindo',by:'Quirino Mendoza y Cortés, Mexico, 1882',rec:{id:'edison-60038_01_9582',f:'cusb_ed_60038_01_9582_0a.mp3',by:'María Luisa Escobar, 1924'},
   src:'Written in 1882 by Quirino Mendoza y Cortés. Chorus: "Ay, ay, ay, ay, canta y no llores" (sing and don’t cry). Sung by Mexico supporters at football matches.',p:[
   'If you have heard a stadium full of people sing “ay, ay, ay, ay”, you have heard this song.',
   'A Mexican songwriter wrote it in 1882.',
   'The title is a pet name. It means something like “lovely little sky”, or “sweetheart”.',
   'The chorus says to sing and not cry, because singing cheers up the heart.',
   'Mexico’s football fans sing it when their team is winning. They also sing it when their team is losing.']},
  {t:'ʻO Sole Mio',by:'Giovanni Capurro and Eduardo di Capua, Naples, 1898',rec:{id:'78_o-sole-mio-my-sunshine_enrico-caruso-g-capurro-e-di-capua_gbia0566091a',f:'O sole mio (My Sunshine) - Enrico Caruso.mp3',by:'Enrico Caruso'},
   src:'Words Giovanni Capurro, music Eduardo di Capua, 1898, in Neapolitan; di Capua wrote the tune while on tour in Odessa. The 1920 Antwerp Olympics story is widely told. Recorded by Enrico Caruso in 1916.',p:[
   'This is a song about the sun in Naples, in the south of Italy.',
   'The man who wrote the tune was not in Naples at the time. He was on tour in Odessa, by the Black Sea, far from home.',
   'The words are in Neapolitan, the language of Naples. The title means “my sun”.',
   'The story goes that at the 1920 Olympics the band could not find the music for Italy’s anthem.',
   'So they played this instead, and the crowd sang along.',
   'The singer on this record is Enrico Caruso, who grew up in Naples.']}],
 stars:[
  {t:'The Weaver and the Cowherd',by:'told in China, Japan and Korea',src:'Qixi (China), Tanabata (Japan), Chilseok (Korea), the 7th day of the 7th month; Vega (Zhinü, Orihime) and Altair (Niulang, Hikoboshi) on either side of the Milky Way; the magpie bridge (crows and magpies in Korea, Ojakgyo); wishes on paper strips (tanzaku) hung on bamboo.',p:[
   'On summer nights, look for two bright stars, one on each side of the Milky Way.',
   'In China, Japan and Korea, they are the Weaver and the Cowherd.',
   'The Weaver wove the clouds. The Cowherd minded the cows. They fell in love and stopped working.',
   'So the Milky Way, a river of stars, was put between them.',
   'Once a year, on the seventh night of the seventh month, magpies fly up and make a bridge with their wings.',
   'In Korea, people say magpies look bald after that night, from being stepped on.',
   'The stars are real. Vega is the Weaver, and Altair is the Cowherd.']},
  {t:'The Rabbit in the Moon',by:'told in China, Japan, Korea and Mexico',src:'Jade Rabbit and Chang’e (Mid-Autumn Festival, China); tsuki no usagi pounding mochi (Japan); daltokki (Korea); the rabbit on the moon in Aztec legend (Florentine Codex, Sahagún, book 7).',p:[
   'Look at the full moon. Some people see a face. Many more see a rabbit.',
   'In China, the Jade Rabbit lives on the moon with Chang’e, the moon goddess, and pounds the medicine of long life in a mortar.',
   'In Japan and Korea, the rabbit is pounding rice into soft rice cakes.',
   'The Aztecs of Mexico saw a rabbit too, with no way of having heard it from Asia.',
   'In their story, the moon was once as bright as the sun. One of the gods threw a rabbit at its face to dim it.']},
  {t:'The Emu in the Sky',by:'told in Australia',src:'The Emu in the Sky (Gawarrgay in Kamilaroi and Euahlayi tradition): a dark constellation from the Coalsack beside the Southern Cross along the Milky Way’s dust lanes toward Scorpius; its changing posture through autumn and winter marks emu egg season (Fuller et al., Journal of Astronomical History and Heritage, 2014).',p:[
   'Most star pictures are made by joining bright stars. This one is made of the dark.',
   'Along the Milky Way there are black patches, where clouds of dust hide the stars behind them.',
   'Aboriginal Australians see an emu in those patches. Its head is the dark spot beside the Southern Cross.',
   'Its neck, body and legs stretch out along the Milky Way.',
   'Through the year the emu changes. In autumn it looks as if it is running. That is when real emus lay their eggs.',
   'In winter its legs disappear and it seems to sit. Then it is time to go and collect the eggs.']},
  {t:'Stars with Arabic Names',by:'a true fact about star names',src:'Arabic star names passed into Latin through medieval translations of Arabic astronomy: Aldebaran (al-dabarān), Vega (an-nasr al-wāqiʿ), Altair (an-nasr aṭ-ṭāʾir), Deneb (dhanab ad-dajāja), Betelgeuse (yad al-jawzāʾ, misread) (Kunitzsch and Smart, A Dictionary of Modern Star Names).',p:[
   'Most of the bright stars have Arabic names. Astronomers writing in Arabic kept the best star lists for hundreds of years.',
   {o:'الدبران',l:'ar',e:'Aldebaran means “the follower”. It rises just after the Pleiades and follows them across the sky.'},
   {o:'النسر الواقع',l:'ar',e:'Vega comes from the end of this name, “the swooping eagle”.'},
   {o:'النسر الطائر',l:'ar',e:'Altair is “the flying eagle”.'},
   {o:'يد الجوزاء',l:'ar',e:'Betelgeuse was “the hand of al-Jawza”. A translator misread the first letter, and the mistake stuck.'}]},
  {t:'The Star Compass',by:'from the islands of the Pacific',src:'Pacific wayfinding: the Carolinian star compass (rising and setting points of stars around the horizon), taught with stones or shells laid in a circle; Mau Piailug of Satawal navigated Hōkūleʻa from Hawaiʻi to Tahiti in 1976 without instruments.',p:[
   'The people of the Pacific found islands thousands of miles apart with no compass and no map.',
   'A star always rises at the same point on the horizon and sets at the same point on the other side.',
   'A navigator learned those points for dozens of stars. As one star climbed too high to steer by, the next rose in its place.',
   'Children learned it on the ground, with stones laid in a circle around a canoe made of leaves.',
   'In 1976 a navigator from the island of Satawal, Mau Piailug, guided a canoe from Hawaiʻi to Tahiti this way. It took a month.']},
  {t:'Matariki',by:'told in Aotearoa New Zealand and Japan',src:'The Pleiades (M45): about 440 light-years away, over 1,000 stars; Matariki, whose rising before dawn in midwinter marks the Māori new year, a public holiday in New Zealand since 2022; Subaru (昴) in Japan, the six-star badge.',p:[
   'There is a tiny cluster of stars that people everywhere have noticed.',
   'In New Zealand, it is Matariki. When it rises before dawn in midwinter, it is the Māori new year, and the whole country has the day off.',
   'People look at how bright each star is to guess how the year’s food will grow.',
   'In Japan, the cluster is Subaru. It is the six stars on the front of the cars.',
   'Most people can count six or seven stars there. Astronomers have counted more than a thousand.']}],
 /* CATS (Jackie, Nov 17: "replace riddles with something else entirely, maybe more nonfiction", "fun facts related to something
    specific -- a book", "cats but like all cat history and facts"). One subject, like a real nonfiction book. Every read is true,
    told in plain words, and src says where to check it. Old texts are in their original language, copied from the printed
    source named beside them. The book keeps the id 'riddles' so old saves and its place on the shelves still work. */
 riddles:[
  {t:'How Cats Moved In',by:'Cats, chapter 1',src:'Driscoll et al., Science 2007 (all domestic cats descend from Felis lybica, Near East, about 10,000 years ago); Vigne et al., Science 2004 (cat buried with a human at Shillourokambos, Cyprus, about 9,500 years ago); Ottoni et al., Nature Ecology & Evolution 2017 (spread by ship; an Egyptian lineage at the Viking-age port of Ralswiek).',p:[
   'Nobody tamed the cat. Cats moved in by themselves.',
   'About ten thousand years ago, people in the Middle East began storing grain. The grain brought mice, and the mice brought wildcats.',
   'The bold ones stayed. Every house cat alive comes from that one kind of small desert wildcat.',
   'On Cyprus, someone was buried beside a cat 9,500 years ago. No cats are native to the island, so that cat came by boat.',
   'Cats kept taking boats. Sailors wanted them for the rats.',
   'A cat from an Egyptian family line has been dug up at a Viking port on the Baltic Sea.']},
  {t:'The Hidden Cry',by:'Cats, chapter 2',src:'McComb et al., Current Biology 2009 ("The cry embedded within the purr"): solicitation purrs carry a high-frequency voiced component (about 220-520 Hz) that people rate as more urgent. Cats also purr when injured or frightened.',p:[
   'A purr does not always mean a cat is happy. Cats also purr when they are hurt or scared.',
   'They have a special purr for breakfast.',
   'When a cat wants food, it tucks a small, high cry inside the low rumble.',
   'The cry is pitched close to a human baby’s.',
   'In tests, people who had never owned a cat still found that purr harder to ignore.',
   'The cat has worked out the one sound you can’t sleep through.']},
  {t:'A Word Just for You',by:'Cats, chapter 3',src:'Adult cats rarely meow at one another; meowing is directed mostly at people (Bradshaw, Cat Sense, 2013; Yeon et al. 2011 on feral versus house cats). Slow blinking: Humphrey et al., Scientific Reports 2020.',p:[
   'Grown cats almost never meow at each other.',
   'Kittens meow for their mothers, then grow out of it. Cats who live wild stay mostly quiet.',
   'The meow is kept for people. Each cat and its person end up with their own set of meows.',
   'Cats have a slower way to say something friendly. They narrow their eyes and blink, very slowly.',
   'In 2020 scientists tested it. Cats blinked back at people who slow-blinked at them, and walked up to them more often.',
   'Try it on a cat you know.']},
  {t:'Pangur Bán',by:'an Irish monk, about the year 850',src:'Old Irish poem of about the 9th century in the Reichenau Primer (St. Paul im Lavanttal, Cod. 86b/1, f. 1v); text and translation in Stokes and Strachan, Thesaurus Palaeohibernicus vol. 2 (1903), p. 293.',p:[
   'About 1,200 years ago, an Irish monk at an abbey in what is now Germany wrote a poem in the corner of his notebook.',
   'It was about his white cat, Pangur.',
   {o:'Messe ocus Pangur Bán,\ncechtar nathar fria saindan',l:'sga',e:'I and Pangur Bán, each of us two at his special art:'},
   {o:'bíth a menmasam fri seilgg,\nmu menma céin im saincheirdd.',l:'sga',e:'his mind is at hunting, my own mind is in my special craft.'},
   'The cat hunts mice. The monk hunts the meaning of hard words. Neither gets in the other’s way.',
   'It is the oldest poem we have that someone wrote about their own pet.']}, // Old Irish as printed in Stokes and Strachan, Thesaurus Palaeohibernicus vol. 2 (1903), p. 293, verse 1 (from Wikisource's proofread page); the English is their translation, same page, without "(mice)". Reichenau Primer, St. Paul im Lavanttal, Cod. 86b/1.
  {t:'The Scribe’s Curse',by:'a scribe in Deventer, about 1420',src:'Cologne, Historisches Archiv, G.B. quarto 249, f. 68r (the Deventer scribe, about 1420); Dubrovnik State Archives, Lettere e commissioni di Levante vol. 13, 1445, found by Emir O. Filipović in 2011.',p:[
   'Before printing, every book was written by hand. Cats lived in the writing rooms to keep mice off the pages.',
   'In 1445, in Dubrovnik, a cat stepped in the ink and walked across an open book. The four paw prints are still there.',
   'A scribe in the Dutch town of Deventer had it worse. A cat peed on his book in the night.',
   'He drew a cat on the ruined page and wrote a curse beside it, in Latin.',
   {o:'Confundatur pessimus cattus qui minxit super librum istum in nocte Daventrie.',l:'la',e:'Curses on the wicked cat that peed on this book in the night at Deventer.'},
   {o:'Et cavendum valde ne permittantur libri aperti per noctem ubi cattie venire possunt.',l:'la',e:'And take great care not to leave books open at night where cats can get at them.'}]}, // Latin as transcribed by Thijs Porck, "Paws, Pee and Mice: Cats among Medieval Manuscripts" (medievalfragments, 2013); English from the Latin
  {t:'The Palace Cats',by:'Cats, chapter 6',src:'Hermitage cats: decree of Empress Elizabeth, 1745, ordering cats from Kazan for the Winter Palace; several dozen cats live in the museum basement today, with their own press secretary and an annual day in their honor.',p:[
   'In 1745 the Winter Palace in Saint Petersburg was full of mice.',
   'Empress Elizabeth of Russia sent an order to Kazan, a city famous for its mousers. She wanted its best cats.',
   'Their descendants never left. The palace is now the Hermitage, one of the biggest art museums in the world.',
   'A few dozen cats live in its basement, on duty against mice.',
   'They have their own kitchen, a small hospital and a press secretary.',
   'The cats are not allowed in the galleries upstairs.']},
  {t:'Why Orange Cats Are Boys',by:'Cats, chapter 7',src:'The orange gene is on the X chromosome: roughly 80% of orange cats are male, and calico and tortoiseshell cats are almost always female (X inactivation). The mutation itself, a deletion near ARHGAP36, was identified in 2025 (Kaelin et al.; Toh et al., Current Biology).',p:[
   'About four out of five orange cats are male.',
   'A cat with patches of orange and black is almost always female.',
   'The reason is where the orange gene sits. It is on the X chromosome.',
   'A male has one X. If it carries orange, he is orange all over.',
   'A female has two. In each patch of her skin, one X is switched off at random, so she can be orange here and black there.',
   'People knew the pattern for a hundred years. The gene itself was only found in 2025.']},
  {t:'Silver Vine',by:'Cats, chapter 8',src:'About a third of cats do not respond to catnip (inherited); most of those respond to silver vine, Actinidia polygama, matatabi in Japan (Bol et al., BMC Veterinary Research 2017). Rubbing transfers nepetalactol to the fur and repels Aedes albopictus mosquitoes (Uenoyama et al., Science Advances 2021).',p:[
   'About one cat in three does not care about catnip. It runs in families.',
   'Most of those cats go wild for a different plant, silver vine. In Japan it is called matatabi, and cats have been given it for centuries.',
   'For a long time nobody knew why cats roll in these plants.',
   'In 2021 scientists in Japan found a reason. The leaves hold a chemical that mosquitoes hate.',
   'A cat that has rubbed its face and head in the leaves gets far fewer bites.',
   'So the rolling is fun, and it is also bug spray.']},
  {t:'The Cat-Book Poems',by:'Cats, chapter 9',src:'Tamra Maew (ตำราแมว), Thai folding-book manuscripts believed to go back to the Ayutthaya period, most surviving copies 19th century: painted cats with verses, typically seventeen auspicious kinds and sometimes six inauspicious ones; includes the wichianmat (Siamese) and the korat.',p:[
   'In old Thailand there were books made only to describe cats.',
   'They were long folded books of dark paper, painted by hand, with a poem beside each cat.',
   'Each poem says what the cat looks like and what luck it brings its owner.',
   'There are seventeen lucky kinds. One is pale with a dark face, ears, feet and tail. We call it the Siamese.',
   'Another is silver-gray all over with green eyes, and is said to bring rain.',
   'Some copies add six unlucky kinds at the back, as a warning.']},
  {t:'Tobermory',by:'Saki, 1911',src:'Saki (H. H. Munro), "Tobermory", in The Chronicles of Clovis (London: John Lane, 1911); Project Gutenberg ebook 3688.',p:[
   'At a country house party a guest announces that the family cat, Tobermory, has been taught to talk. Tobermory is sent for.',
   '“Will you have some milk, Tobermory?” asked Lady Blemley in a rather strained voice.',
   '“I don’t mind if I do,” was the response, couched in a tone of even indifference.',
   '“I’m afraid I’ve spilt a good deal of it,” she said apologetically.',
   '“After all, it’s not my Axminster,” was Tobermory’s rejoinder.',
   'An Axminster is an expensive carpet. Tobermory then starts repeating what the guests have said about each other when they thought only a cat was listening.']},
  {t:'Mr Bloom’s Cat',by:'James Joyce, 1922',src:'James Joyce, Ulysses (Paris: Shakespeare and Company, 1922), episode 4; Project Gutenberg ebook 4300.',p:[
   'Ulysses is a very long novel about one day in Dublin. Early that morning Leopold Bloom is making breakfast, and the cat comes in. Joyce spells what the cat says three different ways.',
   '—Mkgnao!\n—O, there you are, Mr Bloom said, turning from the fire.',
   'Mr Bloom watched curiously, kindly the lithe black form. Clean to see: the gloss of her sleek hide, the white button under the butt of her tail, the green flashing eyes.',
   '—Milk for the pussens, he said.\n—Mrkgnao! the cat cried.',
   'They call them stupid. They understand what we say better than we understand them.',
   'Wonder what I look like to her. Height of a tower? No, she can jump me.']},
  {t:'Black Cat',by:'Rainer Maria Rilke, 1908',src:'Rainer Maria Rilke, "Schwarze Katze", in Der neuen Gedichte anderer Teil (Leipzig: Insel-Verlag, 1908), p. 53 of the 1918 printing; German as on German Wikisource. English made for the game from the German, line for line, without the rhyme.',p:[
   'A poem about what happens when you look at a black cat, and then the cat looks at you.',
   {o:'Ein Gespenst ist noch wie eine Stelle,\ndran dein Blick mit einem Klange stößt;',l:'de',e:'Even a ghost is like a place\nyour look bumps into with a sound;'},
   {o:'aber da an diesem schwarzen Felle\nwird dein stärkstes Schauen aufgelöst:',l:'de',e:'but there, on this black fur,\nyour hardest looking is dissolved:'},
   {o:'Doch auf einmal kehrt sie, wie geweckt,\nihr Gesicht und mitten in das deine:',l:'de',e:'But all at once, as if woken, she turns\nher face, and straight into yours:'},
   {o:'und da triffst du deinen Blick im geelen\nAmber ihrer runden Augensteine',l:'de',e:'and there you meet your own look,\nin the yellow amber of her round eye-stones,'},
   {o:'unerwartet wieder: eingeschlossen\nwie ein ausgestorbenes Insekt.',l:'de',e:'again, unexpected: shut inside\nlike an insect that died out long ago.'}]},
  {t:'I Am a Cat',by:'Natsume Sōseki, 1905',src:'Natsume Sōseki, Wagahai wa neko de aru (吾輩は猫である), serialised in Hototogisu from January 1905, opening lines; Japanese as on Aozora Bunko (card 789). English made for the game from the Japanese.',p:[
   'One of the most famous novels in Japan is told by a house cat with a very high opinion of itself and a low one of people. It begins like this.',
   {o:'吾輩は猫である。名前はまだ無い。',l:'ja',e:'I am a cat. As yet I have no name.'},
   {o:'どこで生れたかとんと見当がつかぬ。',l:'ja',e:'Where I was born, I have not the faintest idea.'},
   {o:'何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。',l:'ja',e:'All I remember is crying “nyaa, nyaa” in some dim, damp place.'},
   {o:'吾輩はここで始めて人間というものを見た。',l:'ja',e:'It was here that I first saw the thing called a human being.'},
   'The cat uses a grand old word for “I”, the kind a lord would use. The cat never does get a name.']}],
 proverbs:[
  {t:'Wasted on Them',by:'sayings from Japan, China and India',src:'Japanese: 猫に小判 (neko ni koban); Chinese: 對牛彈琴 (duì niú tán qín), from the Mouzi Lihuolun; Hindi: बंदर क्या जाने अदरक का स्वाद.',p:[
   {o:'猫に小判',l:'ja',e:'Gold coins to a cat.\n— Japan'},
   {o:'對牛彈琴',l:'zh-Hant',e:'Playing the lute to a cow.\n— China'},
   {o:'बंदर क्या जाने अदरक का स्वाद',l:'hi',e:'What does a monkey know of the taste of ginger?\n— India'}]},
  {t:'When the Big Ones Fight',by:'sayings from Korea and East Africa',src:'Korean: 고래 싸움에 새우 등 터진다; Swahili: Wapiganapo tembo, nyasi huumia.',p:[
   {o:'고래 싸움에 새우 등 터진다',l:'ko',e:'When whales fight, the shrimp’s back bursts.\n— Korea'},
   {o:'Wapiganapo tembo, nyasi huumia.',l:'sw',e:'When elephants fight, it is the grass that gets hurt.\n— Swahili'}]},
  {t:'Food First',by:'sayings from Japan, the Philippines and Turkey',src:'Japanese: 花より団子 (hana yori dango); Tagalog: Kapag may tiyaga, may nilaga; Turkish: Bir fincan kahvenin kırk yıl hatırı vardır.',p:[
   {o:'花より団子',l:'ja',e:'Dumplings over flowers. Said of people at a blossom-viewing picnic who came for the snacks.\n— Japan'},
   {o:'Kapag may tiyaga, may nilaga.',l:'tl',e:'Where there is patience, there is stew.\n— Tagalog, the Philippines'},
   {o:'Bir fincan kahvenin kırk yıl hatırı vardır.',l:'tr',e:'One cup of coffee is remembered for forty years.\n— Turkey'}]},
  {t:'The Old Man’s Horse',by:'a saying from China, with its story',src:'塞翁失馬，焉知非福, from the Huainanzi (2nd century BC), chapter 18 (人間訓).',p:[
   'An old man on the border lost his horse. The neighbors were sorry. “How do you know this isn’t good luck?” he said.',
   'The horse came back with a second, finer horse. The neighbors were glad. “How do you know this isn’t bad luck?”',
   'His son rode the new horse, fell and broke a leg. The neighbors were sorry again.',
   'Then war came, and every young man was sent to fight. The son, with his bad leg, stayed home.',
   {o:'塞翁失馬，焉知非福',l:'zh-Hant',e:'The old man on the border lost his horse. Who can say it isn’t good fortune?'}]},
  {t:'How It Looks from Here',by:'sayings from Arabic, Persian and Akan',src:'Arabic: القرد في عين أمه غزال; Persian: هر که بامش بیش، برفش بیشتر; Akan (Ghana): Sankofa, "Sɛ wo werɛ firi na wosan kɔfa a, yɛnkyiri".',p:[
   {o:'القرد في عين أمه غزال',l:'ar',e:'In its mother’s eye, the monkey is a gazelle.\n— Arabic'},
   {o:'هر که بامش بیش، برفش بیشتر',l:'fa',e:'The bigger your roof, the more snow on it.\n— Persian'},
   {o:'Sɛ wo werɛ firi na wosan kɔfa a, yɛnkyiri.',l:'ak',e:'It is not wrong to go back for what you forgot.\n— Akan, Ghana'}]}],
 letters:[
  {t:'Lovely Things',by:'retold from The Pillow Book, Japan, about 1000',src:'Sei Shōnagon, Makura no Sōshi: section 1 ("In spring, the dawn"); "Adorable things" (a child’s face drawn on a melon, a sparrow hopping closer when you chirp at it, tiny lotus leaves from a pond, and "anything small is lovely")',p:[
   'About a thousand years ago, Sei Shōnagon filled a notebook called a pillow book.',
   'It was full of lists: lovely things, annoying things, things that make the heart beat faster.',
   {o:'春はあけぼの。',l:'ja',e:'In spring, the notebook says, the dawn is best.'},
   {o:'夏は夜。秋は夕暮れ。冬はつとめて。',l:'ja',e:'In summer, the night. In autumn, the evening. In winter, the early morning.'},
   {o:'雀の子の、ねずなきするにをどりくる。',l:'ja',e:'Some lovely things: a sparrow hopping closer when you chirp at it.'},
   {o:'瓜にかきたるちごの顔。',l:'ja',e:'A child’s face drawn on a melon.'},
   {o:'蓮の浮葉のいとちひさきを、池よりとりあげたる。',l:'ja',e:'Tiny lotus leaves pulled from a pond.'},
   {o:'なにもなにも、ちひさきものはみなうつくし。',l:'ja',e:'Anything small, the notebook says, is lovely.'}]}, // Japanese: the 三巻本 text, in its old kana, as on manapedia.jp (うつくしきもの) and houkagonojisyushitsu.jp
  {t:'A Birthday Invitation',by:'Claudia Severa, about the year 100',src:'Vindolanda Tablet 291 (British Museum): Claudia Severa to Sulpicia Lepidina, about AD 100, at a Roman fort in northern Britain; most of it in a scribe’s hand, the closing lines in her own. Latin as transcribed in Tab. Vindol. II 291 (accent marks and brackets left out). English from the Latin.',p:[
   'This is a party invitation, written in ink on a slice of wood as thin as a postcard. It is 1,900 years old.',
   'It was found at a Roman army fort in the north of Britain. The commander’s wife at one fort is writing to her friend at the next.',
   {o:'iii Idus Septembres, soror, ad diem sollemnem natalem meum',l:'la',e:'On 11 September, sister, for my birthday party,'},
   {o:'rogo libenter facias ut venias ad nos',l:'la',e:'I ask you warmly to come to us.'},
   'A scribe wrote that part. Then she took the pen and added the ending herself.',
   {o:'sperabo te soror\nvale soror anima mea',l:'la',e:'I will be expecting you, sister. Goodbye, sister, my soul.'},
   'Those lines are some of the oldest handwriting by a woman in Latin that still exists.']},
  {t:'The Copper Complaint',by:'Nanni, about 1750 BC',src:'Clay tablet from Ur, about 1750 BC (British Museum 131236): Nanni to the merchant Ea-nasir, complaining about the grade of copper ingots and the treatment of his messenger; found with other letters of complaint in the house thought to be Ea-nasir’s.',p:[
   'The oldest complaint letter we have is about 3,750 years old. It is pressed into a lump of clay small enough to hold in one hand.',
   'A man named Nanni is writing to a copper merchant named Ea-nasir, in the city of Ur.',
   'Nanni had paid in advance for good copper. What arrived was poor, and Ea-nasir was rude to the messenger sent to fetch it.',
   'Nanni says he will not accept copper that is not fine quality, and that from now on he will pick out each bar himself, in his own yard.',
   'The letter was dug up in what seems to be Ea-nasir’s own house.',
   'It was not the only one. Other customers had written to complain too, and he had kept them all.']},
  {t:'Onfim’s Homework',by:'Onfim, about 1260',src:'Birch-bark documents nos. 199-210 and 331 from Novgorod, about 1240-1260, by a boy named Onfim, aged about six or seven: alphabet and syllable exercises, psalm phrases, drawings of riders and battles, a beast labeled "I am a wild beast", and "Greetings from Onfim to Danilo".',p:[
   'In the Russian city of Novgorod, people used to write notes on strips of birch bark, scratching the letters in with a point.',
   'The wet ground there kept hundreds of them from rotting. Seventeen belong to one boy, Onfim, who was about seven.',
   'They are his schoolwork from about the year 1260. He practiced his alphabet, forward, then in syllables.',
   'Then he got bored and drew on them: knights on horses, battles, himself as a hero with a spear.',
   'On one he drew a creature with a long neck and a curly tail and wrote beside it, “I am a wild beast.”',
   'Next to the beast he wrote, “Greetings from Onfim to Danilo.” Danilo was probably the boy at the next desk.']},
  {t:'Sorry About Last Night',by:'a model letter from Dunhuang, China, 856',src:'A manuscript of model letters from the Dunhuang caves dated 856 (British Library, Stein collection), with a letter of apology for drunken behavior and the host’s polite reply; retold, not quoted.',p:[
   'In a cave in western China, sealed up for nine hundred years, there was a book of letters to copy.',
   'It gave the correct words for every occasion. One of them is for the morning after you got drunk at someone’s dinner.',
   'The writer says that he drank too much yesterday and went past all limits, and that he did not know what he was saying.',
   'He says that when friends told him this morning what he had said, he wished the ground would swallow him.',
   'He promises to come and apologize in person.',
   'The book also has the host’s answer, to copy if you need it. It says, more or less, don’t worry about it.']}],
 recipes:[
  {t:'Moon-Viewing Dumplings',by:'a recipe from Japan',src:'Tsukimi dango: shiratamako (sweet rice flour) and water, rolled, boiled until they float, cooled in water; stacked in a pyramid for the autumn full moon (jūgoya) with susuki pampas grass',p:[
   'In Japan, on the autumn full moon, people make tsukimi dango to share with the moon.',
   'Mix sweet rice flour with water, a little at a time, until it feels as soft as an earlobe.',
   'Roll it into little balls, as round as the moon.',
   'Drop them into boiling water. When they float, give them two minutes more.',
   'Cool them in a bowl of cold water.',
   'Stack them in a little pyramid by the window, with a few stalks of pampas grass.',
   'Then look up and eat them slowly. The rabbit in the moon is making some too.']},
  {t:'Mint Tea',by:'a recipe from Morocco',src:'Moroccan mint tea (atay): green gunpowder tea rinsed first, fresh spearmint, sugar; poured from a height to make foam; offered to guests in small glasses, often three',p:[
   'In Morocco, a pot of mint tea is how you say welcome.',
   'Rinse a spoonful of green tea in the pot with a splash of hot water. Pour that out.',
   'Add boiling water, a big handful of fresh mint, and sugar.',
   'Let it steep for a few minutes.',
   'Now pour it into small glasses from high up, so it bubbles.',
   'The foam on top shows it was poured with care.',
   'A guest who can stay gets three glasses.']},
  {t:'Fairy Floss',by:'a recipe and a true story, 1897',src:'Cotton candy machine invented 1897 by William Morrison, a dentist, and John C. Wharton, a candy maker, in Nashville; sold as Fairy Floss at the 1904 St. Louis World’s Fair (about 68,000 boxes)',p:[
   'Machine-spun cotton candy began with a candy maker and, of all people, a dentist.',
   'In 1897, the two built a machine that spun hot sugar out through tiny holes.',
   'The sugar cooled in the air into threads finer than hair.',
   'They called it Fairy Floss.',
   'At the 1904 World’s Fair, they sold tens of thousands of boxes.',
   'The recipe is just sugar, and maybe a drop of color.',
   'The secret is the spinning.']},
  {t:'Mix-Mix',by:'a recipe from the Philippines',src:'Halo-halo ("mix-mix"): shaved ice and evaporated milk over sweetened beans, coconut gel, jackfruit, purple yam and more; traced to Japanese migrants’ mong-ya (sweet mung beans on shaved ice) stalls in Manila before the Second World War.',p:[
   'Halo-halo means “mix-mix”, which is also the only instruction.',
   'Into a tall glass go sweet red beans, chewy cubes of coconut jelly, strips of jackfruit and whatever else is in the house.',
   'Pack the glass to the top with shaved ice. Pour evaporated milk over it.',
   'On top goes a spoon of purple yam jam, a slice of caramel custard, or both.',
   'It began with Japanese shopkeepers in Manila about a hundred years ago, who sold sweet beans on shaved ice. Filipinos kept adding things.',
   'Now mix it all into a purple mess and eat it with a long spoon.']},
  {t:'Three Cups',by:'a custom from Ethiopia',src:'The Ethiopian and Eritrean coffee ceremony (buna): green beans roasted in a pan, the smoke wafted to guests, ground by hand, brewed in a clay jebena; three rounds, abol, tona and baraka; often served with popcorn.',p:[
   'Coffee comes from Ethiopia, and there it is not something you grab on the way out.',
   'The host starts with green beans and roasts them in a flat pan over coals while everyone talks.',
   'When they smoke, the pan is carried around so each guest can wave the smell toward their face.',
   'The beans are pounded and boiled in a round clay pot with a long neck.',
   'There are three rounds from the same grounds, each one weaker. They have names: abol, tona and baraka.',
   'The third is the blessing. It is rude to leave before it. There is usually popcorn.']},
  {t:'The Oldest Stew',by:'a recipe from Babylon, about 1750 BC',src:'Yale Babylonian Collection tablets YBC 4644, 8958 and 4648, about 1750 BC: about 25 stew recipes in Akkadian; tuh’u, a stew of lamb and beets with onion, leek, garlic, cumin, coriander and beer (Bottéro; Barjamovic et al., 2019).',p:[
   'The oldest recipes in the world are on three clay tablets from Babylon. They are about 3,750 years old.',
   'Most of them are stews. They are short, because they were written for cooks who already knew how.',
   'One is for a lamb and beet stew, as red as it sounds.',
   'Brown the lamb in fat. Add salt, beer, onion, and a leafy green.',
   'Add cumin and beets, and let it cook.',
   'At the end, crush leek and garlic together and stir them in. Scatter fresh coriander on top.',
   'People have cooked it from the tablet. They say it is good.']}],
 ghost:[
  {t:'The House Child',by:'told in Japan',src:'Zashiki-warashi, a house spirit of Iwate in northern Japan; Kunio Yanagita, Tōno Monogatari (1910), tales 17-18 (old houses have one; a house with one prospers; luck leaves when it is seen leaving); the footprints in the ashes are wider folk tradition.',p:[
   'In the north of Japan, some old houses have a zashiki-warashi.',
   'It is a house spirit that looks like a child of five or six.',
   'It patters about the guest room at night and leaves small footprints in the ashes of the fire.',
   'Nobody minds. A house with a zashiki-warashi has good luck.',
   'If it is ever seen leaving, the luck goes with it, and the family is soon poor.',
   'So people keep the guest room comfortable and leave out sweets.']},
  {t:'The Kapre',by:'told in the Philippines',src:'The kapre of Philippine folklore: a tall, dark, hairy giant that sits in large trees (balete, acacia, mango) smoking; it leads travelers astray, and turning one’s shirt inside out breaks the spell.',p:[
   'In the Philippines, if you see a small red glow high in a big old tree at night, do not go and look.',
   'It is the end of a cigar. The one smoking it is a kapre.',
   'A kapre is a giant, taller than the house, dark and hairy, who sits in the branches of balete and mango trees.',
   'Mostly a kapre just sits and smokes. Sometimes it takes a liking to a person and follows them through life.',
   'Its favorite trick is to make travelers walk in circles on a path they know well.',
   'If that happens, take off your shirt and put it back on inside out. Then you will find your way home.']},
  {t:'A Hundred Years Old',by:'told in Japan',src:'Tsukumogami (付喪神): tools that reach a hundred years gain a spirit (Tsukumogami-ki, Muromachi period); the year-end cleaning (susuharai) and memorial services for used needles (hari-kuyō) and dolls; kasa-obake, the umbrella with one eye and one leg.',p:[
   'In Japan, people say a tool that reaches its hundredth birthday comes alive.',
   'An old paper umbrella grows one eye and one leg, and hops. An old sandal runs about the house at night.',
   'A thing that was looked after turns out friendly. A thing that was thrown in a corner comes back to complain.',
   'So for centuries, households cleared out their old tools at the end of each year, before any could turn ninety-nine.',
   'Some things are still given a proper goodbye. Every February, tailors take their bent and broken needles to a temple.',
   'They stick them into a block of soft tofu, to thank them and let them rest.']},
  {t:'Dokkaebi',by:'told in Korea',src:'Dokkaebi (도깨비) of Korean folklore: not spirits of the dead; said to form from discarded household objects such as brooms; fond of buckwheat jelly (memil-muk), wrestling (ssireum) and tricks; carry a club (bangmangi) that produces what is asked for.',p:[
   'A dokkaebi is a Korean goblin. It was never a person. It starts out as some old thing thrown away, like a worn broom.',
   'Dokkaebi come out at night and stop travelers on the road. What they want is a wrestling match.',
   'They are very strong and not very clever. In the stories, people usually win by a trick.',
   'They love buckwheat jelly, songs and bets, and they cannot stand to owe anyone.',
   'Each one carries a club. Tap it on the ground and ask, and gold or dinner appears.',
   'In the morning, the traveler finds an arm wrapped tight around an old broomstick.']},
  {t:'The Hopping Ghost',by:'told in China',src:'Jiangshi (殭屍), the "stiff corpse" of Chinese folklore: hops with arms outstretched; stopped by a paper talisman on the forehead, sticky rice, or holding one’s breath; often linked to accounts of "corpse-driving" in western Hunan (Xiangxi).',p:[
   'The Chinese ghost called a jiangshi cannot walk. Its body is too stiff to bend.',
   'So it hops, with both arms held straight out in front.',
   'It finds people by their breath. If one comes close, hold yours.',
   'A strip of yellow paper with the right words on it, stuck to its forehead, stops it where it stands.',
   'Sticky rice thrown on the ground will also slow it down.',
   'One old explanation: families paid to have a relative who died far away carried home.',
   'The carriers walked at night with the body upright between bamboo poles. From a distance, it bobbed.']},
  {t:'Foxfire',by:'told in Japan',src:'Kitsunebi (狐火) and the fox’s wedding procession (kitsune no yomeiri); explanations: marsh gas burning in the air, and glowing fungi in rotting wood (the "foxfire" of Armillaria).',p:[
   'On damp nights, people have seen rows of small lights floating over the fields.',
   'In Japan they are kitsunebi, foxfire. They are lanterns carried by foxes walking to a wedding.',
   'A fox wedding is also why rain sometimes falls while the sun is shining.',
   'Follow the lights and they go out. Then they light again farther off.',
   'Some were probably swamp gas, which can catch and flicker in the air.',
   'Some may have been fungi. There are mushrooms that grow in rotting wood and glow green in the dark.']}],
 field:[
  {t:'The Garden Snail',by:'Field guide',src:'Cornu aspersum: eyes at the tips of the upper tentacles, which roll in when touched; the radula, with thousands of tiny teeth; mucus to glide on; an epiphragm of dried mucus to wait out dry weather',p:[
   'The garden snail carries its house wherever it goes.',
   'Its eyes are at the tips of its two long tentacles. Touch one, and it rolls back inside.',
   'A snail’s tongue is covered in thousands of tiny teeth, for scraping leaves.',
   'It glides on a ribbon of slime, which keeps it from getting scratched.',
   'In dry weather, it seals its doorway with a lid of dried slime and waits for rain.',
   'Look for snails after rain, on cool, gray mornings.']},
  {t:'The Dandelion',by:'Field guide',src:'Taraxacum officinale: from French dent de lion; a flower head of many small florets; closes at night and in dull weather; each seed has a pappus whose air flow forms a ring vortex above it (Cummins et al. 2018, Nature); seeds can travel many miles',p:[
   'The name dandelion comes from the French dent de lion: lion’s tooth, for its jagged leaves.',
   'Each yellow flower is really a crowd of tiny flowers packed together.',
   'It opens in the sun, and closes at night and on rainy days.',
   'Then it turns into a puffball of seeds, each with its own little parachute.',
   'Above each parachute, the air spins in a tiny ring that slows its fall.',
   'A good breeze can carry a seed a mile or more.']},
  {t:'Moss',by:'Field guide',src:'Mosses (Bryophyta): no true roots (rhizoids), no flowers or seeds, spread by spores; can dry out and revive within hours of wetting; Sphagnum peat moss holds up to about 20 times its dry weight in water; found on every continent, including Antarctica',p:[
   'Moss has no roots, no flowers and no seeds.',
   'It holds on with tiny threads and spreads by spores, as fine as dust.',
   'Many mosses can dry out completely and look dead.',
   'Add water, and within hours it turns green again.',
   'Peat moss can soak up about twenty times its own weight in water.',
   'Moss grows on every continent, even Antarctica.',
   'Look for it on the shady side of rocks and trees, wherever it stays damp.']},
  {t:'The Banana Slug',by:'Field guide',src:'Ariolimax (Pacific banana slug), coastal forests from California to Alaska: up to about 25 cm; breathes through a pneumostome on the right side of the mantle; mucus contains an anesthetic; feeds on fungi and leaf litter and spreads spores and seeds.',p:[
   'The banana slug lives in the wet forests of the Pacific coast, from California to Alaska.',
   'It is bright yellow, sometimes spotted like an old banana, and can grow as long as a pencil.',
   'It breathes through a single hole in its right side, which opens and closes.',
   'Its slime numbs the mouth of anything that tries to eat it. Raccoons roll them in dirt first.',
   'It eats mushrooms and dead leaves and leaves rich soil behind it.',
   'Look for one on the forest floor on a damp morning.']},
  {t:'The Slime Mold',by:'Field guide',src:'Physarum polycephalum: a single giant cell with many nuclei, no brain or nerves; finds the shortest path through a maze (Nakagaki et al., Nature, 2000); connected oat flakes laid out as cities around Tokyo with a network like the rail system (Tero et al., Science, 2010).',p:[
   'A slime mold is a yellow smear on a rotting log. It is not a plant, an animal or a fungus.',
   'The whole thing is one single cell, sometimes as big as a dinner plate.',
   'It creeps along at about a thumb’s width an hour, looking for food.',
   'It has no brain. Scientists put one in a maze with food at both ends, and it found the shortest way through.',
   'Others laid out oat flakes on a map where the cities around Tokyo are.',
   'The slime mold joined them up with a web of tubes. It looked very much like the real Tokyo train map.']},
  {t:'The Pill Bug',by:'Field guide',src:'Armadillidium vulgare: a land-living crustacean (isopod); breathes with gill-like pleopods that must stay moist; conglobation; females carry eggs in a brood pouch; individuals infected with an iridovirus turn blue.',p:[
   'The pill bug under your flowerpot is not an insect. It is a crustacean, a cousin of crabs and shrimp.',
   'It still breathes with gills, so it has to stay damp. That is why it hides under things.',
   'When it is scared it rolls into a ball, armor out.',
   'A mother carries her eggs in a pouch on her belly, like a kangaroo.',
   'Once in a while you may find a bright blue one. It has caught a virus that forms tiny crystals under the shell.',
   'Turn over a stone or a log, and put it back the way you found it.']}],
 /* TWO MORE BOOKS, New poems and Small strange things. Five were made; three (The moderns, Detective stories, Odd novels) were taken out the same day: "forget most of the new books. they are formatted poorly and they don't read very well", "i like the old ones better". They were excerpts from longer works; these two hold whole short pieces. (Jackie, Nov 27: "i feel like our library is missing sooo much good stuff esp stuff that's recently public domain
    the modernists and detective stories virginia woolf and stuff i don't even know about"; shown a list of six, "All six").
    These are well-known writers, which the first twelve books avoid; she asked for them. Every quoted page is word for word from
    the edition named in src (a Project Gutenberg transcription of it, read on Nov 27, 2026), with the printer's italics dropped.
    Everything here was first published in 1930 or earlier, so it is free to use in the United States. Several of these writers
    died after 1955 and are still in copyright in Britain and Europe. */
 poems:[
  {t:'The Negro Speaks of Rivers',by:'Langston Hughes, 1921',src:'Langston Hughes, "The Negro Speaks of Rivers" (The Crisis, June 1921), as printed in The Weary Blues (New York: Alfred A. Knopf, 1926); Project Gutenberg ebook 74745.',p:[
   'Langston Hughes was eighteen, on a train crossing the Mississippi at sunset, when he wrote this on the back of an envelope.',
   'I’ve known rivers:\nI’ve known rivers ancient as the world and older than the flow of human blood in human veins.',
   'My soul has grown deep like the rivers.',
   'I bathed in the Euphrates when dawns were young.\nI built my hut near the Congo and it lulled me to sleep.',
   'I looked upon the Nile and raised the pyramids above it.',
   'I’ve known rivers:\nAncient, dusky rivers.']},
  {t:'Thirteen Ways of Looking at a Blackbird',by:'Wallace Stevens, 1917',src:'Wallace Stevens, "Thirteen Ways of Looking at a Blackbird" (Others, 1917), as printed in Harmonium (New York: Alfred A. Knopf, 1923), sections I, II, V and XIII; Project Gutenberg ebook 78743.',p:[
   'Wallace Stevens worked at an insurance company all his life and made up poems on the walk to the office. This one has thirteen parts. Here are four.',
   'Among twenty snowy mountains,\nThe only moving thing\nWas the eye of the black bird.',
   'I was of three minds,\nLike a tree\nIn which there are three blackbirds.',
   'I do not know which to prefer,\nThe beauty of inflections\nOr the beauty of innuendoes,\nThe blackbird whistling\nOr just after.',
   'It was evening all afternoon.\nIt was snowing\nAnd it was going to snow.\nThe blackbird sat\nIn the cedar-limbs.']},
  {t:'Oread',by:'H. D., 1914',src:'H. D. (Hilda Doolittle), "Oread" (first printed 1914), as printed in Some Imagist Poets: An Anthology (Boston: Houghton Mifflin, 1915); Project Gutenberg ebook 30276.',p:[
   'An oread is a mountain spirit. This one is talking to the sea, and cannot tell the waves from the pine trees. That is the whole poem.',
   'Whirl up, sea—\nWhirl your pointed pines,\nSplash your great pines\nOn our rocks,',
   'Hurl your green over us,\nCover us with your pools of fir.',
   'Hilda Doolittle signed her poems with her initials. Six lines made her famous.']},
  {t:'Poetry',by:'Marianne Moore, 1919',src:'Marianne Moore, "Poetry" (Others, July 1919), as printed in Poems (London: The Egoist Press, 1921); Project Gutenberg ebook 62833.',p:[
   'A poem about poetry, by a poet who begins by saying she does not care for it either.',
   'I too, dislike it: there are things that are important beyond all this fiddle.',
   'Reading it, however, with a perfect contempt for it, one discovers that there is in it after all, a place for the genuine.',
   'Hands that can grasp, eyes\nthat can dilate, hair that can rise\nif it must,',
   'Marianne Moore kept rewriting this poem for fifty years. The last version is three lines long.']},
  {t:'First Fig',by:'Edna St. Vincent Millay, 1920',src:'Edna St. Vincent Millay, "First Fig" and "Second Fig", in A Few Figs from Thistles (New York: Frank Shay, 1920); Project Gutenberg ebook 4399.',p:[
   'Two very short poems that open the same book. Half of New York could recite the first one.',
   'My candle burns at both ends;\nIt will not last the night;\nBut ah, my foes, and oh, my friends—\nIt gives a lovely light!',
   'Safe upon the solid rock the ugly houses stand:\nCome and see my shining palace built upon the sand!',
   'The saying “burning the candle at both ends” was already old. After this poem it sounded like a good idea.']},
  {t:'The Panther',by:'Rainer Maria Rilke, 1907',src:'Rainer Maria Rilke, "Der Panther. Im Jardin des Plantes, Paris", in Neue Gedichte (Leipzig: Insel-Verlag, 1907), p. 37; German as proofread on German Wikisource from that edition. English made for the game from the German, line for line, without the rhyme.',p:[
   'The sculptor Rodin told the young poet Rilke to go to the zoo in Paris and look at one animal until he could really see it. Rilke went and looked at the panther.',
   {o:'Sein Blick ist vom Vorübergehn der Stäbe\nso müd geworden, daß er nichts mehr hält.',l:'de',e:'His gaze, from the bars going past,\nhas grown so tired that it holds nothing any more.'},
   {o:'Ihm ist, als ob es tausend Stäbe gäbe\nund hinter tausend Stäben keine Welt.',l:'de',e:'To him it is as if there were a thousand bars\nand behind a thousand bars no world.'},
   {o:'Nur manchmal schiebt der Vorhang der Pupille\nsich lautlos auf –. Dann geht ein Bild hinein,',l:'de',e:'Only sometimes the curtain of the pupil\nslides open without a sound. Then a picture goes in,'},
   {o:'geht durch der Glieder angespannte Stille –\nund hört im Herzen auf zu sein.',l:'de',e:'goes through the tensed stillness of the limbs\nand in the heart stops being.'}]},
  {t:'Ithaka',by:'C. P. Cavafy, 1911',src:'C. P. Cavafy, "Ιθάκη", written 1910, first printed 1911 (Grammata, Alexandria); Greek as on Greek Wikisource. English made for the game from the Greek.',p:[
   'Odysseus took ten years to sail home to the island of Ithaka. Cavafy, a Greek poet who lived in Egypt, wrote this to anyone setting out for anywhere.',
   {o:'Σα βγεις στον πηγαιμό για την Ιθάκη,\nνα εύχεσαι νάναι μακρύς ο δρόμος,',l:'el',e:'When you set out on the way to Ithaka,\nwish for the road to be long,'},
   {o:'γεμάτος περιπέτειες, γεμάτος γνώσεις.',l:'el',e:'full of adventures, full of things to learn.'},
   {o:'Πάντα στον νου σου νάχεις την Ιθάκη.\nΤο φθάσιμον εκεί είν\' ο προορισμός σου.',l:'el',e:'Keep Ithaka always in your mind.\nArriving there is what you are bound for.'},
   {o:'Αλλά μη βιάζεις το ταξίδι διόλου.',l:'el',e:'But do not hurry the journey at all.'},
   {o:'Η Ιθάκη σ\' έδωσε το ωραίο ταξίδι.\nΧωρίς αυτήν δεν θάβγαινες στον δρόμο.',l:'el',e:'Ithaka gave you the beautiful journey.\nWithout her you would not have set out.'},
   {o:'Αλλο δεν έχει να σε δώσει πια.',l:'el',e:'She has nothing else to give you now.'}]}],
 /* SMALL STRANGE THINGS, the fifth of the new books (Nov 27): very short forms. */
 small:[
  {t:'Stray Birds',by:'Rabindranath Tagore, 1916',src:'Rabindranath Tagore, Stray Birds (New York: Macmillan, 1916), numbers 1, 6, 18 and 43, written in English by the author; Project Gutenberg ebook 6524.',p:[
   'Rabindranath Tagore wrote in Bengali and won the Nobel Prize. In Japan people kept asking him to write something on their fans.',
   'These short sayings came of it. He wrote them in English himself.',
   'Stray birds of summer come to my window to sing and fly away.',
   'And yellow leaves of autumn, which have no songs, flutter and fall there with a sigh.',
   'If you shed tears when you miss the sun, you also miss the stars.',
   'What you are you do not see, what you see is your shadow.',
   'The fish in the water is silent, the animal on the earth is noisy, the bird in the air is singing,',
   'But Man has in him the silence of the sea, the noise of the earth and the music of the air.']},
  {t:'Natural Histories',by:'Jules Renard, 1896',src:'Jules Renard, Histoires naturelles (first edition Paris: Flammarion, 1896; these pieces from the enlarged editions of 1899 to 1904); French as in Project Gutenberg ebook 44255. English made for the game from the French.',p:[
   'Jules Renard grew up on a farm in France. He described animals in as few words as he could, sometimes one line each.',
   {o:'LE PAPILLON\nCe billet doux plié en deux cherche une adresse de fleurs.',l:'fr',e:'THE BUTTERFLY\nThis love letter folded in two is looking for a flower’s address.'},
   {o:'LA PUCE\nUn grain de tabac à ressort.',l:'fr',e:'THE FLEA\nA grain of tobacco on a spring.'},
   {o:'LE VER\nEn voilà un qui s\'allonge comme une belle nouille.',l:'fr',e:'THE WORM\nNow here is one who stretches out like a fine noodle.'},
   {o:'LES FOURMIS\nChacune d\'elle ressemble au chiffre 3.\nEt il y en a! il y en a!',l:'fr',e:'THE ANTS\nEach of them looks like the number 3.\nAnd there are so many! so many!'},
   {o:'LA PIE\nElle était toute noire; mais elle a passé l\'hiver dernier aux champs et il lui reste de la neige.',l:'fr',e:'THE MAGPIE\nShe was all black; but she spent last winter in the fields and still has some snow on her.'}]},
  {t:'Incantation by Laughter',by:'Velimir Khlebnikov, 1910',src:'Velimir Khlebnikov, "Заклятие смехом", written 1908 to 1909, first printed in Studiya impressionistov (St Petersburg, 1910); Russian as on Russian Wikisource (from Tvoreniya, Moscow, 1986). The English is an explanation, not a translation.',p:[
   'A Russian poet took one word, “smekh”, which means laughter, and built a whole poem by adding beginnings and endings to it. Most of these words had never existed before.',
   {o:'О, рассмейтесь, смехачи!\nО, засмейтесь, смехачи!',l:'ru',e:'O, laugh it out, you laughers!\nO, laugh it up, you laughers!'},
   {o:'Смейево, смейево,\nУсмей, осмей, смешики, смешики,\nСмеюнчики, смеюнчики.',l:'ru',e:'Laughdom, laughdom,\nlaugh off, laugh at, laughlets, laughlets,\nlaugherlings, laugherlings.'},
   'It cannot really be translated. Read the left-hand page aloud: smey, smey, smey. It sounds like what it is about.']}]};

// the pages of a read as the open book shows them: the title page first
/* FACING PAGES (Jackie, Nov 27: "for books we read; have translations be like, the original language on the left page and the
   translation on the right"). The open book shows two pages at a time, the title on the first left page. A page that carries
   its original words becomes two: the original alone on a left page, with the name of its language at the foot, and the English
   alone on the right page facing it. Where that would start on a right page, a printer's flower fills the right page first,
   as a book does to bring a new piece onto a fresh opening. The same flower closes a read that ends on a left page. */
const LANG_NAMES={ko:'Korean',vi:'Vietnamese',bn:'Bengali',ja:'Japanese',ar:'Arabic',sga:'Old Irish',la:'Latin',hi:'Hindi',ak:'Akan',fa:'Persian','zh-Hant':'Chinese',sw:'Swahili',tl:'Tagalog',tr:'Turkish',fr:'French',de:'German',ru:'Russian',el:'Greek'};
function readPages(s){if(!s)return [];const P=[{t:s.t,by:s.by}],L=s.p;for(let i=0;i<L.length;i++){const pg=L[i];if(pg&&typeof pg==='object'&&pg.o){if(P.length%2)P.push({orn:1});P.push({o:pg.o,l:pg.l});
  if(pg.e)P.push({e:pg.e,l:pg.l});else if(typeof L[i+1]==='string')P.push(L[++i]);else P.push({orn:1});}else P.push(pg);}if(P.length%2)P.push({orn:1}); /* a read that ends on a left page has the flower on the last right page, so no page is left bare */return P;} // an original with no English of its own (Khichuri) is faced by the page that follows it, which is its English
/* Which read comes next for a book. st.shelf[book] is the order still to come (saved); when it runs out it is shuffled again,
   never starting with the one just read. */
function nextRead(book){const all=STORIES[book]||[];if(!all.length)return null;st.shelf=st.shelf||{};st.shelfLast=st.shelfLast||{};
 let q=(st.shelf[book]||[]).filter(i=>i>=0&&i<all.length);
 if(!q.length){q=all.map((_,i)=>i);for(let i=q.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[q[i],q[j]]=[q[j],q[i]];}
  if(q.length>1&&q[0]===st.shelfLast[book])q.push(q.shift());}
 const i=q.shift();st.shelf[book]=q;st.shelfLast[book]=i;
 st.shelfHist=st.shelfHist||{};const h=st.shelfHist[book]=(st.shelfHist[book]||[]).concat(i).slice(-30);return all[i];} // the last 30, for flipping back
// the read that came before this one in its book (flipping back from a title page), or null at the very first
function prevRead(book,s){const all=STORIES[book]||[],h=((st.shelfHist||{})[book]||[]).filter(i=>i>=0&&i<all.length),at=h.lastIndexOf(all.indexOf(s));return at>0?all[h[at-1]]:null;}
