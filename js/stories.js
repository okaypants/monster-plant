'use strict';
/* THE BOOKS (Jackie, Nov 15): each of the four special books holds many reads, and all of them are real.
   Poems and old texts are word for word (spelling and punctuation as printed), free to use (published before 1931).
   Sloth's Almanac is true facts told by Sloth, PhD; the grimoire is real folklore, with the place it comes from named.
   A book goes through all of its reads in a shuffled order before any comes round again (nextRead below).

   To add a read, add an entry to its book:
     t    the title, shown on the first page          by   the author and year, or where it's told (shown under the title)
     p    the pages, in order: about 12 words each so they fit on a phone; \n starts a new line (poems keep their lines)
     src  for facts and folklore: where to check it (never shown in the game)
   "from" in a title means it's a part of a longer piece. The open book shows two pages at a time; the title is the first page. */
const STORIES={
 fairy:[
  {t:'Who Has Seen the Wind?',by:'Christina Rossetti, 1872',p:[
   'Who has seen the wind?\nNeither I nor you:',
   'But when the leaves hang trembling,\nThe wind is passing through.',
   'Who has seen the wind?\nNeither you nor I:',
   'But when the trees bow down their heads,\nThe wind is passing by.']},
  {t:'Paper Boats',by:'Rabindranath Tagore, 1913',p:[
   'Day by day I float my paper boats one by one down the running stream.',
   'In big black letters I write my name on them and the name of the village where I live.',
   'I hope that someone in some strange land will find them and know who I am.',
   'I load my little boats with shiuli flowers from our garden,',
   'and hope that these blooms of the dawn will be carried safely to land in the night.',
   'I launch my paper boats and look up into the sky',
   'and see the little clouds setting their white bulging sails.',
   'I know not what playmate of mine in the sky sends them down the air to race with my boats!',
   'When night comes I bury my face in my arms',
   'and dream that my paper boats float on and on under the midnight stars.',
   'The fairies of sleep are sailing in them,',
   'and the lading is their baskets full of dreams.']},
  {t:'from The Fairies',by:'William Allingham, 1850',p:[
   'Up the airy mountain,\nDown the rushy glen,',
   'We daren’t go a-hunting\nFor fear of little men;',
   'Wee folk, good folk,\nTrooping all together;',
   'Green jacket, red cap,\nAnd white owl’s feather!']}],
 nonsense:[
  {t:'The Owl and the Pussy-Cat',by:'Edward Lear, 1871',p:[
   'The Owl and the Pussy-cat went to sea\nIn a beautiful pea-green boat,',
   'They took some honey, and plenty of money,\nWrapped up in a five-pound note.',
   'The Owl looked up to the stars above,\nAnd sang to a small guitar,',
   '“O lovely Pussy! O Pussy, my love,\nWhat a beautiful Pussy you are,',
   'You are,\nYou are!\nWhat a beautiful Pussy you are!”',
   'Pussy said to the Owl, “You elegant fowl!\nHow charmingly sweet you sing!',
   'O let us be married! too long we have tarried:\nBut what shall we do for a ring?”',
   'They sailed away, for a year and a day,\nTo the land where the Bong-Tree grows',
   'And there in a wood a Piggy-wig stood\nWith a ring at the end of his nose,',
   'His nose,\nHis nose,\nWith a ring at the end of his nose.',
   '“Dear Pig, are you willing to sell for one shilling\nYour ring?” Said the Piggy, “I will.”',
   'So they took it away, and were married next day\nBy the Turkey who lives on the hill.',
   'They dined on mince, and slices of quince,\nWhich they ate with a runcible spoon;',
   'And hand in hand, on the edge of the sand,\nThey danced by the light of the moon,',
   'The moon,\nThe moon,\nThey danced by the light of the moon.']},
  {t:'The Purple Cow',by:'Gelett Burgess, 1895',p:[
   'I never saw a Purple Cow,\nI never hope to see one;',
   'But I can tell you, anyhow,\nI’d rather see than be one!']},
  {t:'Two Limericks',by:'Edward Lear, 1846',p:[
   'There was an Old Man with a beard,\nWho said, “It is just as I feared!—',
   'Two Owls and a Hen,\nFour Larks and a Wren,',
   'Have all built their nests in my beard!”',
   'There was an Old Man in a tree,\nWho was horribly bored by a Bee;',
   'When they said, “Does it buzz?”\nHe replied, “Yes, it does!',
   'It’s a regular brute of a Bee!”']}],
 almanac:[
  {t:'On Sloths',by:'Sloth’s Almanac',src:'Three-toed sloths (Bradypus): weekly descent and fur algae, Pauli et al. 2014, Proc. R. Soc. B; digestion up to about a month, Montgomery & Sunquist 1978; swimming, Smithsonian National Zoo sloth fact sheet',p:[
   'Ah, sloths. A subject I know from the inside.',
   'A three-toed sloth climbs down from its tree about once a week.',
   'The rest of the week is spent up high, mostly holding still.',
   'Green algae grows in a sloth’s fur. It helps a sloth hide among the leaves.',
   'One leafy meal can take a sloth most of a month to digest.',
   'Sloths are fine swimmers, and quicker in water than on land.',
   'I mention the swimming to anyone who calls me slow.']},
  {t:'On Leaves with Holes',by:'Sloth’s Almanac',src:'Monstera deliciosa: name from Latin monstrum; leaf holes (fenestration) appear as the plant matures; light-capture idea, Muir 2013, The American Naturalist; edible ripe fruit, Kew Plants of the World Online and Missouri Botanical Garden',p:[
   'Some plants grow leaves with holes in them, on purpose.',
   'The best known is the monstera. The name comes from the Latin for “monster”.',
   'A young monstera leaf is whole. The holes arrive as the plant grows up.',
   'Nobody is sure why. Botanists are still arguing, politely.',
   'One idea: a leaf with holes can spread wider and catch more scattered sunlight.',
   'Another: wind and rain slip through instead of tearing the leaf.',
   'The ripe fruit is said to taste of pineapple and banana. I intend to find out.']},
  {t:'On the Flytrap That Counts',by:'Sloth’s Almanac',src:'Venus flytrap (Dionaea muscipula): two touches within about 20-30 seconds close the trap, about five start digestion, Böhm et al. 2016, Current Biology; native range, the Carolinas, USA',p:[
   'The Venus flytrap can count. I would not joke about arithmetic.',
   'Inside each trap are tiny trigger hairs.',
   'One touch does nothing. It might be a raindrop.',
   'A second touch within about twenty seconds, and the trap snaps shut.',
   'Around five touches, and the plant begins its dinner.',
   'So a flytrap never wastes a meal on a false alarm.',
   'Flytraps are native to just one small corner of the world: the Carolinas.']}],
 grimoire:[
  {t:'The Rabbit in the Moon',by:'told in China, Japan and Korea',src:'Jade Rabbit and Chang’e (Mid-Autumn Festival, China); tsuki no usagi pounding mochi (Japan); daltokki (Korea); rabbit on the moon in Aztec legend (Florentine Codex, Sahagún)',p:[
   'Look at the full moon. Some people see a face. Many see a rabbit.',
   'In China, the Jade Rabbit lives on the moon with Chang’e, the moon goddess.',
   'The rabbit stands under a cassia tree, pounding herbs in a mortar.',
   'The herbs, people say, make the medicine of long life.',
   'In Japan and Korea, the rabbit is pounding rice into soft rice cakes.',
   'Far away in Mexico, the Aztec saw a rabbit on the moon too.',
   'At the Mid-Autumn Festival, families share round mooncakes and look up.']},
  {t:'The Mandrake',by:'told across Europe and the Middle East',src:'Mandragora officinarum, nightshade family (Solanaceae, with tomato and potato); root shape and the shriek legend, Josephus, The Jewish War 7.6 and medieval herbals; Shakespeare, Romeo and Juliet 4.3',p:[
   'The mandrake is a real plant, a cousin of the tomato and the potato.',
   'A mandrake root often forks in two, like a little person with legs.',
   'So people long ago said the root was alive.',
   'Pull one from the ground, the old books warn, and the mandrake shrieks.',
   'Careful gatherers stopped their ears and dug by moonlight.',
   'Shakespeare wrote of “shrieks like mandrakes torn out of the earth”.',
   'Best, the old books agree, to let a sleeping mandrake lie.']},
  {t:'from Macbeth',by:'William Shakespeare, about 1606',p:[
   'Double, double toil and trouble;\nFire burn and cauldron bubble.',
   'Fillet of a fenny snake,\nIn the cauldron boil and bake;',
   'Eye of newt and toe of frog,\nWool of bat and tongue of dog,',
   'Adder’s fork and blind-worm’s sting,\nLizard’s leg and howlet’s wing,',
   'For a charm of powerful trouble,\nLike a hell-broth boil and bubble.',
   'Double, double toil and trouble;\nFire burn and cauldron bubble.']}]};

// the pages of a read as the open book shows them: the title page first
function readPages(s){return s?[{t:s.t,by:s.by}].concat(s.p):[];}
/* Which read comes next for a book. st.shelf[book] is the order still to come (saved); when it runs out it is shuffled again,
   never starting with the one just read. */
function nextRead(book){const all=STORIES[book]||[];if(!all.length)return null;st.shelf=st.shelf||{};st.shelfLast=st.shelfLast||{};
 let q=(st.shelf[book]||[]).filter(i=>i>=0&&i<all.length);
 if(!q.length){q=all.map((_,i)=>i);for(let i=q.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[q[i],q[j]]=[q[j],q[i]];}
  if(q.length>1&&q[0]===st.shelfLast[book])q.push(q.shift());}
 const i=q.shift();st.shelf[book]=q;st.shelfLast[book]=i;return all[i];}
