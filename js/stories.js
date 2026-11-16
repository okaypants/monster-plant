'use strict';
/* THE BOOKS (Jackie, Nov 15): each of the twelve books holds many reads, and all of them are real.
   Poems and old texts are word for word (spelling and punctuation as printed), free to use (published before 1931).
   Sloth's Almanac is true facts told by Sloth, PhD; the grimoire is real folklore, with the place it comes from named.
   Folktales, facts and old texts that can't be quoted word for word are written for the game in plain words: the title page names
   where they come from ("told in …", "retold from …"), and src says where to check them.
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
   'But when the leaves hang trembling\nThe wind is passing thro’.',
   'Who has seen the wind?\nNeither you nor I:',
   'But when the trees bow down their heads\nThe wind is passing by.']},
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
   'The Owl and the Pussy-Cat went to sea\nIn a beautiful pea-green boat:',
   'They took some honey, and plenty of money\nWrapped up in a five-pound note.',
   'The Owl looked up to the stars above,\nAnd sang to a small guitar,',
   '“O lovely Pussy, O Pussy, my love,\nWhat a beautiful Pussy you are,',
   'You are,\nYou are!\nWhat a beautiful Pussy you are!”',
   'Pussy said to the Owl, “You elegant fowl,\nHow charmingly sweet you sing!',
   'Oh! let us be married; too long we have tarried:\nBut what shall we do for a ring?”',
   'They sailed away, for a year and a day,\nTo the land where the bong-tree grows;',
   'And there in a wood a Piggy-wig stood,\nWith a ring at the end of his nose,',
   'His nose,\nHis nose,\nWith a ring at the end of his nose.',
   '“Dear Pig, are you willing to sell for one shilling\nYour ring?” Said the Piggy, “I will.”',
   'So they took it away, and were married next day\nBy the Turkey who lives on the hill.',
   'They dined on mince and slices of quince,\nWhich they ate with a runcible spoon;',
   'And hand in hand, on the edge of the sand,\nThey danced by the light of the moon,',
   'The moon,\nThe moon,\nThey danced by the light of the moon.']},
  {t:'The Purple Cow',by:'Gelett Burgess, 1895',p:[
   'I never saw a Purple Cow,\nI never hope to see one;',
   'But I can tell you, anyhow,\nI’d rather see than be one!']},
  {t:'Two Limericks',by:'Edward Lear, 1861',p:[
   'There was an Old Man with a beard,\nWho said, “It is just as I feared!—',
   'Two Owls and a Hen,\nFour Larks and a Wren,',
   'Have all built their nests in my beard!”',
   'There was an Old Man in a tree,\nWho was horribly bored by a Bee;',
   'When they said, “Does it buzz?”\nHe replied, “Yes, it does!',
   'It’s a regular brute of a Bee!”']}],
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
   'Flytraps are native to just one small corner of the world: the Carolinas.']}],
 grimoire:[
  {t:'The Rabbit in the Moon',by:'told in China, Japan and Korea',src:'Jade Rabbit and Chang’e (Mid-Autumn Festival, China); tsuki no usagi pounding mochi (Japan); daltokki (Korea); rabbit on the moon in Aztec legend (Florentine Codex, Sahagún)',p:[
   'Look at the full moon. Some people see a face. Many see a rabbit.',
   'In China, the Jade Rabbit lives on the moon with Chang’e, the moon goddess.',
   'The rabbit pounds herbs in a mortar, and a cassia tree grows nearby.',
   'The herbs, people say, make the medicine of long life.',
   'In Japan and Korea, the rabbit is pounding rice into soft rice cakes.',
   'Far away in Mexico, the Aztec saw a rabbit on the moon too.',
   'At the Mid-Autumn Festival, families share round mooncakes and look up.']},
  {t:'The Mandrake',by:'told across Europe and the Middle East',src:'Mandragora officinarum, nightshade family (Solanaceae, with tomato and potato); root shape and the shriek legend from medieval herbals; pulling it up with a dog from Josephus, The Jewish War 7.6.3 (a root he calls baaras); Shakespeare, Romeo and Juliet 4.3',p:[
   'The mandrake is a real plant, a cousin of the tomato and the potato.',
   'A mandrake root often forks in two, like a little person with legs.',
   'So people long ago said the root was alive.',
   'Pull one from the ground, the old books warn, and the mandrake shrieks.',
   'Careful gatherers stopped their ears, and some tied a dog to the root to pull it up.',
   'Shakespeare wrote of “shrieks like mandrakes torn out of the earth”.',
   'Best, the old books agree, to let a sleeping mandrake lie.']},
  {t:'from Macbeth',by:'William Shakespeare, about 1606',p:[
   'Double, double toil and trouble;\nFire burn, and cauldron bubble.',
   'Fillet of a fenny snake,\nIn the cauldron boil and bake;',
   'Eye of newt and toe of frog,\nWool of bat and tongue of dog,',
   'Adder’s fork and blind-worm’s sting,\nLizard’s leg and howlet’s wing,',
   'For a charm of powerful trouble,\nLike a hell-broth boil and bubble.',
   'Double, double toil and trouble;\nFire burn, and cauldron bubble.']}],
 songs:[
  {t:'from The Star',by:'Jane Taylor, 1806',p:[
   'Twinkle, twinkle, little star,\nHow I wonder what you are!',
   'Up above the world so high,\nLike a diamond in the sky.',
   'When the blazing sun is gone,\nWhen he nothing shines upon,',
   'Then you show your little light,\nTwinkle, twinkle, all the night.',
   'Then the trav’ller in the dark,\nThanks you for your tiny spark,',
   'He could not see which way to go,\nIf you did not twinkle so.']},
  {t:'from Sweet and Low',by:'Alfred Tennyson, 1850',p:[
   'Sweet and low, sweet and low,\nWind of the western sea,',
   'Low, low, breathe and blow,\nWind of the western sea!',
   'Over the rolling waters go,\nCome from the dying moon, and blow,',
   'Blow him again to me;\nWhile my little one, while my pretty one, sleeps.']},
  {t:'from The Source',by:'Rabindranath Tagore, 1913',p:[
   'The sleep that flits on baby’s eyes—does anybody know from where it comes?',
   'Yes, there is a rumour that it has its dwelling where,',
   'in the fairy village among shadows of the forest dimly lit with glow-worms,',
   'there hang two shy buds of enchantment.',
   'From there it comes to kiss baby’s eyes.']}],
 stars:[
  {t:'The Weaver and the Cowherd',by:'told in China, Japan and Korea',src:'Qixi (China), Tanabata (Japan), Chilseok (Korea), the 7th day of the 7th month; Vega (Zhinü, Orihime) and Altair (Niulang, Hikoboshi) on either side of the Milky Way; the magpie bridge (crows and magpies in Korea, Ojakgyo); the traditional date is lunar, and most of Japan now keeps July 7; wishes on paper strips (tanzaku) hung on bamboo',p:[
   'On summer nights, look for two bright stars, one on each side of the Milky Way.',
   'In China, Japan and Korea, they are the Weaver and the Cowherd.',
   'The Weaver wove the clouds. The Cowherd minded the cows. The two fell in love.',
   'But the Milky Way, a river of stars, flowed between them.',
   'Once a year, on the seventh night of the seventh month, magpies fly up and make a bridge.',
   'And the Weaver and the Cowherd meet in the middle.',
   'In Japan, people write wishes on paper strips that night and hang them on bamboo.',
   'The stars are real. Vega is the Weaver, and Altair is the Cowherd.']},
  {t:'The Little Cluster',by:'told around the world',src:'The Pleiades (M45): about 444 light-years away, over 1,000 member stars, six or seven seen by eye; the Seven Sisters (Greece), Subaru (Japan), Matariki (Māori, whose rising in midwinter marks the new year)',p:[
   'There is a tiny clump of stars that people everywhere have noticed.',
   'In Greece, they were the Seven Sisters. In Japan, they are Subaru.',
   'In New Zealand, they are Matariki. When they rise before dawn in midwinter, many Māori mark the new year.',
   'Most people can count six or seven stars there.',
   'Astronomers have counted more than a thousand.',
   'The light you see left them about four hundred and forty years ago.']},
  {t:'The Seven Sages',by:'told in India, Britain and America',src:'The Big Dipper in Ursa Major: the Saptarishi, seven sages (India), the Plough (Britain); the pointer stars Merak and Dubhe line up with Polaris',p:[
   'Seven bright stars make the shape of a big ladle with a bent handle.',
   'In India, they are the Saptarishi, seven wise sages.',
   'In Britain, they are the Plough. In America, the Big Dipper.',
   'Find the two stars at the end of the cup, and follow the line they make.',
   'They point to the North Star, which hardly moves all night.',
   'For hundreds of years, travelers have found north this way.']}],
 riddles:[
  {t:'The Riddle of the Sphinx',by:'told in ancient Greece',src:'The riddle of the Sphinx on Mount Phicium near Thebes, from the story of Oedipus (Apollodorus, Library 3.5.8, where it is four-footed, two-footed and three-footed; morning, noon and evening are the later, familiar wording)',p:[
   'Long ago in Greece, a sphinx sat on a mountain outside the city of Thebes.',
   'It asked everyone who came by the same riddle.',
   'What walks on four legs in the morning,',
   'on two legs at noon,',
   'and on three legs in the evening?',
   '…',
   'A person!',
   'A baby crawls on hands and knees. A grown-up walks on two feet.',
   'And an old one walks with a cane.']},
  {t:'A Riddle in Old English',by:'retold from the Exeter Book, England, about 970',src:'Exeter Book Riddle 47 (Krapp-Dobbie numbering), the book-moth: a moth that ate words; answer, a moth or bookworm',p:[
   'More than a thousand years ago, someone in England wrote down this riddle.',
   'A creature ate words. It swallowed a song, in the dark.',
   'It gobbled up a glorious poem, and the strong page it stood on.',
   'But it was not one bit wiser for all the words it ate.',
   'What was it?',
   '…',
   'A moth! A little bookworm, nibbling the pages.']},
  {t:'Humpty Dumpty',by:'Mother Goose, 1700s and 1800s',src:'Earliest known printing 1797 (Samuel Arnold, Juvenile Amusements, per the Opies) and 1810 (Gammer Gurton’s Garland), both with other endings; the king’s horses and men from the 1840s, this wording as in Yale Songs (1882); the Opies say it may have begun as a riddle, and W. C. Richards heard it as one with the answer “an egg” (1844)',p:[
   'People used to tell this old rhyme as a riddle. Can you guess?',
   'Humpty Dumpty sat on a wall,\nHumpty Dumpty had a great fall;',
   'All the king’s horses and all the king’s men\nCouldn’t put Humpty together again.',
   'Who is Humpty Dumpty?',
   '…',
   'An egg!']},
  {t:'Kitendawili!',by:'told in Swahili, East Africa',src:'Swahili riddles open with the call "Kitendawili!" and the answer "Tega!"; "Nyumba yangu haina mlango" (my house has no door): yai, an egg',p:[
   'In East Africa, a Swahili riddle starts with a call and an answer.',
   'The riddler calls out, “Kitendawili!” A riddle!',
   'Everyone answers, “Tega!” Set it!',
   'My house has no door. What is it?',
   '…',
   'An egg! Yai.',
   'Humpty Dumpty, it turns out, has cousins all over the world.']}],
 proverbs:[
  {t:'Slowly, Slowly',by:'sayings in Swahili, Spanish and Hindi',src:'Swahili: "Pole pole ndio mwendo", "Haba na haba hujaza kibaba"; Spanish: "Poco a poco se va lejos"; Hindi: "Boond boond se ghada bharta hai"',p:[
   'Pole pole ndio mwendo.\nSlowly, slowly is the way to go.\n— Swahili',
   'Haba na haba hujaza kibaba.\nLittle by little fills the measure.\n— Swahili',
   'Poco a poco se va lejos.\nLittle by little, you go far.\n— Spanish',
   'Boond boond se ghada bharta hai.\nDrop by drop, the pot fills.\n— Hindi']},
  {t:'Falling Down',by:'sayings from Japan and Korea',src:'Japanese: "Nana korobi ya oki" (七転び八起き), "Saru mo ki kara ochiru" (猿も木から落ちる); Korean: "하늘이 무너져도 솟아날 구멍이 있다"',p:[
   'Nana korobi ya oki.\nFall down seven times, get up eight.\n— Japanese',
   'Saru mo ki kara ochiru.\nEven monkeys fall from trees.\n— Japanese',
   'Even if the sky falls, there is a hole to climb out of.\n— Korean']},
  {t:'Together, and Going Back',by:'sayings from Ireland, Ghana and China',src:'Irish: "Ar scáth a chéile a mhaireann na daoine"; Akan (Ghana): Sankofa, "Se wo were fi na wosankofa a yenkyi"; Chinese: Laozi, Tao Te Ching, chapter 64',p:[
   'Ar scáth a chéile a mhaireann na daoine.\nPeople live in each other’s shelter.\n— Irish',
   'Sankofa.\nIt is not wrong to go back for what you forgot.\n— Akan, Ghana',
   'A journey of a thousand miles begins beneath your feet.\n— after Laozi, China']}],
 letters:[
  {t:'How Peter Rabbit Began',by:'Beatrix Potter, 1902',src:'Potter’s picture letter to Noel Moore, 4 September 1893, written while Noel was ill (Morgan Library); The Tale of Peter Rabbit, Frederick Warne 1902 (privately printed 1901), quoted from Project Gutenberg #14838. The letter itself is not quoted: when it was first published, and so its copyright, is uncertain',p:[
   'In 1893, Beatrix Potter wrote a letter to Noel Moore, a child who was ill in bed.',
   'To cheer Noel up, the letter told a story, with drawings, about four little rabbits.',
   'Nine years later, the story became a book. It begins:',
   'Once upon a time there were four little Rabbits, and their names were—',
   'Flopsy,\nMopsy,\nCotton-tail,\nand Peter.',
   'They lived with their Mother in a sand-bank, underneath the root of a very big fir-tree.']},
  {t:'from a Journal',by:'Dorothy Wordsworth, April 15, 1802',src:'Quoted as printed in William Knight’s edition, Journals of Dorothy Wordsworth (Macmillan, 1897), Project Gutenberg #42856; the middle sentences are left out (…). Later editions from the manuscript (1941 on) read a little differently',p:[
   'When we were in the woods beyond Gowbarrow Park we saw a few daffodils close to the water-side.',
   '… I never saw daffodils so beautiful.',
   'They grew among the mossy stones about and above them;',
   'some rested their heads upon these stones, as on a pillow, for weariness;',
   'and the rest tossed and reeled and danced,',
   'and seemed as if they verily laughed with the wind, that blew upon them over the lake;',
   'they looked so gay, ever glancing, ever changing.']},
  {t:'Lovely Things',by:'retold from The Pillow Book, Japan, about 1000',src:'Sei Shōnagon, Makura no Sōshi: section 1 ("In spring, the dawn"); "Adorable things" (a child’s face drawn on a melon, a sparrow hopping closer when you chirp at it, tiny lotus leaves from a pond, and "anything small is lovely")',p:[
   'About a thousand years ago, Sei Shōnagon filled a notebook called a pillow book.',
   'It was full of lists: lovely things, annoying things, things that make the heart beat faster.',
   'In spring, the notebook says, the dawn is best.',
   'In summer, the night. In autumn, the evening. In winter, the early morning.',
   'Some lovely things: a sparrow hopping closer when you chirp at it.',
   'A child’s face drawn on a melon. Tiny lotus leaves pulled from a pond.',
   'Anything small, the notebook says, is lovely.']}],
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
   'The secret is the spinning.']}],
 ghost:[
  {t:'The House Child',by:'told in Japan',src:'Zashiki-warashi, a house spirit of Iwate in northern Japan; Kunio Yanagita, Tōno Monogatari (1910), tales 17-18 (old houses have one; a house with one prospers; luck leaves when it is seen leaving); the footprints in the ashes and leaving out a treat are wider folk tradition, not in those tales',p:[
   'In the north of Japan, some old houses have a zashiki-warashi.',
   'A zashiki-warashi is a house spirit that looks like a child.',
   'It patters about the guest room at night and leaves tiny footprints in the ashes.',
   'Nobody minds. A house with a zashiki-warashi has good luck.',
   'But if it is ever seen leaving, the luck goes with it.',
   'So people keep the guest room cozy, and leave out a little treat.',
   'If you hear a soft patter tonight, say goodnight.']},
  {t:'Jack of the Lantern',by:'told in Ireland',src:'The Irish tale of Stingy Jack; jack-o’-lanterns were first carved from turnips in Ireland and Scotland, then pumpkins in North America',p:[
   'In Ireland, they tell of Stingy Jack, who played one trick too many.',
   'Jack tricked the Devil up an apple tree, and kept the Devil stuck there.',
   'When Jack’s days were done, no place would take such a trickster in.',
   'So Jack wanders still, with a coal glowing inside a carved-out turnip to light the way.',
   'That is Jack of the lantern: the jack-o’-lantern.',
   'People in Ireland and Scotland carved turnip lanterns at Halloween, to keep Jack and other wandering spirits away.',
   'In America, pumpkins were bigger and easier to carve. So pumpkins it is.']},
  {t:'Foxfire',by:'told in Japan and across Europe',src:'Kitsunebi (fox fire) and the fox’s wedding lanterns, Japan; the will-o’-the-wisp, England; explanations: marsh gas burning in the air, and glowing fungi in rotting wood (the "foxfire" of Armillaria)',p:[
   'On damp nights, people have seen little lights floating over marshes.',
   'In Japan, they are kitsunebi, foxfire: lanterns carried by foxes on the way to a wedding.',
   'In England, they are will-o’-the-wisps, leading travelers off the path.',
   'Follow one, the old stories say, and you’ll only get your feet wet.',
   'Scientists think some were swamp gas, flickering as it burned in the air.',
   'Some may have been glowing fungi. In English, that soft green glow in rotting wood is also called foxfire.',
   'So a light in the marsh might be gas, or mushrooms, or foxes.']}],
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
   'Look for it on the shady side of rocks and trees, wherever it stays damp.']}]};

// the pages of a read as the open book shows them: the title page first
function readPages(s){return s?[{t:s.t,by:s.by}].concat(s.p):[];}
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
