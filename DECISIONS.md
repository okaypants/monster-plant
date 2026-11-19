# DECISIONS (newest first, with why)

Everything Jackie has decided about Monster Plant, with the reason. Add new entries at the top. The rules that never change are in [RULES.md](RULES.md).

### A new room, on one picture (Nov 18)

- Jackie reworked the room's look in ChatGPT: deep teal wallpaper over olive panelling, a mini fridge "for food now", a water cooler, a wall lamp, a patterned rug, and every small object chosen one by one. The base is ChatGPT's crisp filled room; only the trunk was swapped for the earlier drawing ("i wish the moon was bigger and it looked more like it used to").
- Jackie's picks: a moon dial replaces the armillary and tells tonight's moon (the sun's sign stays in the charts); the ammonite stays as a toy; the books beside it go; the forks only rattle; the old SNACKS cabinet is Tofu's cupboard; watering is "fill a cup, carry it"; the pumpkin and tree sit on the crate; the music box tune is dropped; the butterflies go; a crystal ball replaces the snow globe; a viewfinder replaces the red box; "wind up cat" replaces the snail.
- "I actually prefer for some of these objects if not most to be integrated": almost everything is painted into the room. The cup and the coins are separate ("like the cup no of course that should be singular"). The wind-up cat is cut out so its cubby can be empty; the moon dial's phase, the crystal ball's mist and the trunk's lid are small changes drawn over the painted object.
- Golden hour, night, the three lamps and shut curtains are light worked out in code from the one picture (RULES 1 already allows light to blend). The window's panes are see-through with the sky drawn behind.
- Stand-ins until the art is drawn: the view from the window, the closed curtains, both framed pictures.
- **Why:** Jackie did not like "the warm salmon dark palette" of the old room, and wanted everything touchable to do something. One picture means a change to the room is made once, where the old room needed thirty matching pictures.

### The lidded jar holds coins (Nov 17)

- Jackie, going over the room's containers: "I think lidded jar should be coins".
- The jar on the left bookcase now spills gold coins (a gold square with a dark rim and one bright pixel) where it spilled colored buttons.
- **Why:** Jackie's pick for what is in the jar.

### Everything you can touch in the room does something of its own (Nov 17)

- Jackie: "everything in the room, other than like surfaces and things like shelves and stuff, that is touchable or clickable, is interactive in some way. So if it's like a container, it needs to be filled with stuff that we can fuck with. Otherwise, we need to replace it if that's just too much. So like the snail moving doesn't really work because of how it is inside of the bookshelf ... Not everything has to be super involved. It can just be like a little micro interaction, kind of like the leaves".
- **Already real** (unchanged): window and curtains, both lamps, the armchair, the carafe, SNACKS, every book, the sampler, the radio, the moon box, the desk drawers (files), the snow globe, the vines and the shelf plant, the ammonite's dust, the cat and the windowsill.
- **Containers, now with something in them:** the lidded jar on the left bookcase spills buttons that bounce along its shelf. The red box on the trinket shelf is a music box that plays one of five short tunes with notes floating up. The lockbox opens the journal at Keep it safe. The milk crate holds the records, so a tap puts the next one on the radio.
- **Things that only bounced or swung, now with one thing of their own:** the butterfly frame lets a butterfly out; the moon panel says what tonight's real moon is; the armillary says which sign the sun is in; the cat's picture gives hearts; the flower painting drops petals; the glass throws drops.
- **Things that did nothing:** the stool and the desk chair now wobble.
- **The snail** no longer hops up into the shelf above. It trundles a short way along its own shelf and back, further if you wind it more than once. It has not been replaced: a replacement needs new room art in every light.
- **Still bounce-only on purpose:** the pillow, the pet bed and the book stack (furniture the cat and monsters use, and the stack's books open the reading tray).
- All of it is code-drawn pixels on the room art's own grid and whole-pixel moves, with no new art.
- **Why:** a thing you can tap and get nothing from feels broken, and a box should have something in it.

### A birthday can't be in the future (Nov 17)

- Jackie: "When filling out my birth year it lets me pick the future".
- The form already told the phone that today is the latest date, but an iPhone's date wheel doesn't obey that. The date is now checked when it changes and again on "Show my chart". A future date is not saved, and a line under the form says "That day hasn't happened yet. Pick your birthday." Years before 1900 are refused the same way.
- **Why:** a chart for a day that hasn't happened is nonsense.

### A seedling's journal after Start over (Nov 17)

- Jackie, with a picture of a blank journal and an error ("undefined is not an object (evaluating 'q.id')"): "This happens when I open a seedlings journal".
- Start over made the new seed without an id, and it only got one the next time the game was loaded. Until then its journal broke whenever it opened on a relationship spread (the book remembers which spread it was last on). Every plant now has an id from the moment it is made, and the journal falls back to the main page if a spread is about someone who isn't in the room.
- **Why:** it was a bug.

### "It's golden hour" only in golden hour (Nov 17)

- Jackie: "The game said 'get out your cameras it's golden hour!' when I started the game over but it's not".
- The line was said the first time each day that the clock was past the start of golden hour, which also covered dusk, the night and the hours before sunrise. A game started in the evening or at night said it at once. It is now said only during golden hour itself, the hour and a half before sunset.
- **Why:** it was a bug. The line should be true when it is said.

### The artist and the book are each named once (Nov 17)

- Jackie, after both notes came off the pages: "Yeah find a single place for that and the iching".
- The tarot's artist (Pamela Colman Smith, London, 1909, her initials in a corner of each picture) is a small line under the three spreads on the choose-a-spread screen.
- The I Ching's age (about 3,000 years, coins for at least a thousand) is a small line under the coins before the first toss.
- **Why:** each is worth saying once, at the door, and not on every page.

### No book note on every hexagram (Nov 17)

- Jackie: "The book note at the end of every I Ching thing is also redundant".
- The line "The I Ching, or Book of Changes, was put together in China about 3,000 years ago..." is gone from the hexagram pages.
- **Why:** the same sentence on all 64 pages is noise.

### No artist note on every card (Nov 17)

- Jackie: "The artist note is redundant at the end of every single tarot card".
- The line "Pamela Colman Smith drew all 78 cards in London in 1909..." is gone from the card pages. She is still credited in the README and in the code.
- **Why:** the same sentence on all 78 pages is noise.

### Choose a spread on its own screen; the Celtic Cross's top row steps through its cards (Nov 17)

- Jackie: "Actually the top menu in Celtic cross should be next or previous card - there should be no other tarot spreads in that menu since ppl can go back".
- Tarot on the box's menu now opens a screen with three big buttons (Card of the day, Three cards, Celtic Cross), each with a small drawing of how it is laid and a tick if it has been read today. The row of spread tabs at the top of every tarot screen is gone.
- The back button goes one step at a time: a card's page, then the spread, then the three spreads, then the box's menu.
- In the Celtic Cross the top row is "Turn card 3" while the cards are being turned, then "‹ Previous card" and "Next card ›". The other spreads have an empty top row.
- This puts Previous and Next back after the entry below took them out of the words column. They are the only buttons in that row now.
- **Why:** the top row should be about the screen you are on. Switching spreads is a step back, and the back button does that.

### Charts with fewer boxes, and space between everything (Nov 17)

- Jackie: "Make sure there's space between all items. Some pages have too many buttons like the Celtic cross and the charts page (with the sun moon boxes plus the selection menu)".
- **Charts:** the people (You, the cat, each monster) are plain names along the top row with the picked one filled in, where they used to be a column of outlined bubbles down the left. Sun, moon and rising are one plain row with no boxes. "Change my birth details" is a link. The line about where the charts come from is the last line of the chart, so nothing runs along the bottom.
- **Space:** the top row is as tall as the close and back buttons, so nothing below starts beside them. The picture-and-words group can no longer squeeze up into the top row; on a phone the three cards are a little smaller to make room. The small note under a spread is shorter ("Tap a card for more about it."); the line about tomorrow's reading is on the whole-summary page.
- **Why:** the same as the entry below. Fewer outlines, and room around each thing.

### Fewer buttons in the moon box (Nov 17)

- Jackie: "Some pages have too many buttons like the Celtic cross".
- **Celtic Cross:** Previous and Next are gone. Tapping a card on the map shows it, and a short line says so. That leaves the close and back buttons, the three spreads, and one link.
- **"Read all of it"** is a plain underlined link on every screen, where it used to be an outlined bubble.
- **What the reading is about** (Everything, Work, People, Mind, Home) is five plain words under the deck with the picked one filled in green, where it used to be five outlined bubbles.
- **Why:** when everything is an outlined bubble, nothing stands out and the page looks busy.

### One square back button beside the close button (Nov 17)

- Jackie: "there should be a back button more similar to the x button not like a bubble menu".
- The "‹ Moon box" pill in the tab row and the "Back" pill on a card's or hexagram's page are gone. A square ‹ button, the same size and look as the × button, sits right beside it. It closes a page if one is open; otherwise it goes back to the box's menu. It is hidden on the menu itself.
- **Why:** going back is the same kind of control as closing, so it should look like one, and the tab row is now only the three spreads.

### The moon box's spacing: one group in the middle (Nov 17)

- Jackie, with a picture of the card of the day (a small card near the top, its meaning under it, then a wide gap, then the reading pinned to the bottom): "I really dislike this spacing and similar please review".
- **Every screen in the box:** the picture and its words are now one group, 12 pixels apart, in the middle of the box, with the empty room split evenly above and below. Nothing sits alone at the bottom. This covers the menu, the deck, the cut, the three cards, the coins and the hexagrams. The Celtic Cross and the charts still fill the height.
- **Card of the day:** the card is large on the left (about two thirds of the box's height), and beside it are its name, its meaning, the line about its suit and the small note. The meaning is no longer said twice.
- **Celtic Cross** (Jackie, the same day: "The Celtic cross is also bad. Should you rethink how every one is formatted? They should be beautifully balanced"): three columns of the same height, evenly spaced: the map of the ten cards, the card you are on, and its words. The map's cards are about a third bigger than before. Once all ten are turned, the summary sits at the foot of the words column under a thin line, with "Read all of it". Nothing runs along the bottom of the box.
- **A card's or hexagram's page:** the picture now sits clear of the close button, which used to cover its corner.
- The two rules for every screen in the box: one picture goes on the left with its words on the right (card of the day, Celtic Cross, a card's page); a row of pictures is centered with its words centered under it (the menu, the deck, three cards, the hexagrams).
- **Why:** words far from the thing they describe, with a hole in between, look unfinished.

### The moon box's words keep off the edges (Nov 17)

- Jackie: "Move the writing at the bottom up - it's not good when text hugs the bottom edge, or the top center edge where message bubbles from the game obscure anything behind it".
- The line of words at the bottom of the box now sits 30 pixels above the edge (22 on a phone), up from 14 (8).
- The box is drawn above the game's speech bubbles and name tags, so a bubble at the top center or a name tag at the bottom left can no longer cover what is in the box. The full screen and debug buttons in the top right corner are also behind it while it is open, since the full screen button sat on top of the Celtic Cross tab.
- **Why:** words against an edge look cramped, and words under a bubble can't be read.

### A tarot reading can be about one part of life (Nov 17)

- Jackie, asked what a reading should be pointed at, chose an area of life picked before shuffling, "but use more scrutiny in choosing categories just 1 per category and maybe no love".
- Under the deck are five one-word buttons: **Everything, Work, People, Mind, Home.** Everything is picked to begin with and means no focus. There is no Love.
- The four come from the deck itself, one per suit, so they don't overlap and nothing is made up: Wands for work (what you make and do), Cups for people, Swords for the mind (thoughts, worries, decisions), Pentacles for home (the place, money, everyday things).
- The pick opens the summary ("For your work, this reading moves from ...") and the cards of its suit are pointed out as the ones to look at first, or it says none came up. It is kept with the day's reading.
- **Why:** a reading with nothing to aim at feels vague, and Jackie doesn't want a question. Tying each area to a suit is how readers already use the suits.

### The tarot leans on the modern reading, with Waite underneath (Nov 17)

- Jackie, after Waite's harsh quotes were hidden: "I mean it can includes Waite's wording but the overall reading should lean toward modern interpretation."
- The meaning under each card, at the top of its page and in the summary is now how readers read the card today, upright or reversed (js/tarotread.js). A reversed card is read the modern way, as the upright meaning blocked, turned inward, overdone or ending, so the Ten of Swords reversed is "Recovery, and the worst being over."
- Waite's 1910 words are back on every card's page, harsh ones included, followed by "Waite in plain words". This replaces the hiding of his quotes in the entry below. The I Ching still leaves out Legge's rough lines.
- **Why:** Waite's meanings are the source, but many are odd or bleak to a reader now. The modern reading is the one people know and it is kinder.

### Harsh quotations are left out (Nov 17)

- Asked whether Waite's and Legge's harsh quotes should be hidden too, Jackie chose to hide them.
- **Tarot:** a card's page leaves out Waite's 1910 words when they speak of death, lies, cruelty, illness, enemies, ruin and the like (about a third of the upright cards and nearly half of the reversed ones). The plain meaning, "Readers today" and the rest of the page stay. Nothing marks the gap.
- **I Ching:** Legge's English is left out for a few Judgments (43 and 44) and for the rough changing lines (noses cut off, concubines, blood, prisoners). The original Chinese still shows, with one line saying the English is left out. Legge's "there will be evil" stays, since it is his way of saying bad luck.
- The quotes are picked by a list of words (TAROT_HARSH in js/tarot.js, ICH_HARSH in js/iching.js), so the list can be made longer or shorter.
- **Why:** the same reason as softening the readings. An old author's bluntness shouldn't land on someone in a cozy game.

### Readings don't accuse or frighten (Nov 17)

- Jackie: "We don't want the readings to imply anything too negative iykwim lies and betrayal etc".
- 22 of the tarot's plain meanings were reworded so that none speaks of lies, tricks, betrayal, cruelty, greed or people who can't be trusted. "Lies and two-faced behavior" is now "Mixed messages and a hard choice"; "Cruelty and bad intentions" is "Harshness and being too strict"; "Tricks and broken promises" is "Plans that fall through". The short meanings used in the summary changed to match, and the Celtic Cross summary says "At its best this brings" and "It leads toward".
- Hard cards still read as hard (heartbreak, a loss, a low point). They describe a feeling or a situation and don't point at a person.
- Waite's own 1910 words on a card's page are unchanged, since they are a quotation under his name. Some of them are harsh.
- **Why:** a reading that tells someone they are being lied to or betrayed can land badly, and this is a cozy game.

### The I Ching is the third thing in the moon box (Nov 17)

- Jackie: "Maybe when you open the box you can select from tarot, charts, or I Ching - then let's work on I Ching".
- **How it works:** the traditional coin method. Toss three coins six times. The side with writing counts 2 and the plain side counts 3, so each toss adds up to 6, 7, 8 or 9 and draws one line from the bottom up (7 solid, 8 broken, 9 solid and changing, 6 broken and changing). Six lines make one of the 64 hexagrams. Changing lines flip to make a second hexagram, which is where things are heading. No question is asked. One reading a day, kept until tomorrow, like the tarot.
- **What it shows:** the hexagram with its Chinese name, how it is said and a short English name; its meaning in plain words; a few sentences under it that sum up the reading. A hexagram's page has its two halves (fire below, mountain above), the Judgment in the original Chinese, James Legge's 1882 English for it, and for each changing line the original line with Legge's English.
- **Where the words come from:** the Chinese is from Chinese Wikisource. Legge's hexagrams 1 to 32 are from English Wikisource, which is proofread. Wikisource stops there, so 33 to 64 come from two scans of the 1882 book on the Internet Archive, compared with each other and tidied by hand; a scanning slip may remain. The plain meanings and English names were written for the game from the Judgments.
- **Left for later:** the yarrow-stalk method, the commentaries (the Ten Wings), and plain-word versions of the 384 line texts. Legge's line texts can be grim in places (noses cut off, concubines), since that is what the book says.
- **Why:** Jackie asked for it by name. It is a real method with real rules and its original text, and it needs no art beyond lines and coins.

### The moon box opens on a menu (Nov 17)

- Jackie: "Maybe when you open the box you can select from tarot, charts, or I Ching".
- Tapping the box now shows one big button for each thing inside, with a small picture, its name and one line. "‹ Moon box" at the left of the top row goes back to the menu from anywhere. Charts is no longer a fourth tab next to the tarot spreads.
- **Why:** charts sat in a row of tarot spreads as if it were one of them, and a third kind of reading needs somewhere to go.

### What a tarot card's page holds (Nov 17)

- Jackie: "each individual card should include the Waite deal; the interpretation or other potential meanings; and then any other cool details about the card itself or how it can be read that is special to it."
- A card's page now reads, in order: the plain meaning; **A. E. Waite, 1910** (his own words for the card as it came up, quoted from The Pictorial Key to the Tarot); **Readers today** (how most readers read it now, which is often different, such as Death as the end of a chapter); what it would mean the other way up; **How to read it** for court cards and Aces; **Special to this card** for 30 cards (the High Priestess's half-hidden scroll, the Chariot with no reins, the loose ropes on the Eight of Swords, the Tree of Life on the Ten of Pentacles); then the picture, the deck, the astrology and the artist as before.
- This brings Waite's wording back. On Nov 16 Jackie had it taken out when it sat behind its own button; now it is one part of the page.
- "Readers today" and "Special to this card" were written for the game from common knowledge of the deck and are in js/tarotread.js.
- **Why:** one plain line per card was thin. The page should give the source, the other ways to take it, and the things only that card has.

### The reading summed up under the spread (Nov 17)

- Jackie: "I want a summary of the reading in the spread page (that you can expand if it's too long)".
- Once every card is turned, a few sentences under the spread put each card's short meaning in its place ("This reading moves from big plans in the past, through a truce now, toward hope."), followed by the traditional count of Major Arcana, the leading suit and reversals. The Celtic Cross gets a sentence for each pair of places.
- It shows three lines at most (two on a phone). When it doesn't fit, a "Read all of it" button opens the whole summary with every card and its meaning listed underneath.
- Each card has a short meaning for this, upright and reversed (js/tarotread.js), cut down from the plain meanings that come from Waite.
- **Why:** the cards were explained one at a time, and nothing said what the spread adds up to.

### Tarot readings ask no question (Nov 17)

- Jackie: "For the tarots, I don't want them to be question related if at all possible."
- The deck no longer says "Think of a question" or "Think about your day". It says "Tap the deck to shuffle it." The line that reads the spread no longer mentions "the question", and the Celtic Cross places no longer speak of "the matter".
- **Why:** a reading is about you and the day, with nothing to ask first.

### The Home Screen line says "to keep your progress saved" (Nov 17)

- Jackie, on the line under the loading screen: "I think it should say 'to keep your progress saved' or something more direct like that".
- Every version of the line (iPhone, Android, desktop) now ends "to keep your progress saved" in place of "to keep your room safe".
- **Why:** it says plainly what is at stake.

### The opening sprout is smaller and holds still (Nov 17)

- Jackie, on the new loading screen: "looks nicer but maybe a smaller plant with no animation".
- The pot is one still picture (the small sprout) at 73 pixels wide, down from 121, on both opening screens. It no longer grows. The stars still blink.
- **Why:** the growing plant was too big and too busy for a screen you see for a second.

### The opening screens are a night sky with a growing seed (Nov 17)

- Jackie, on the loading screen and the turn-your-phone screen: "I don't like this brown opening page (very bland and American girl)".
- Both screens are now the night outside the room: dark plum, a seed growing in its checkered pot (the six seedling pictures, swapped every half second), "Monster Plant" in the monsters' green, cream words with no paper card, and a few square stars, some of which blink. The sprout emoji is gone.
- This is the one place words sit straight on the dark with no paper card. The cards inside the game keep the paper look.
- Nothing fades; the seed and the stars are frame swaps, and they hold still if the phone asks for less motion.
- **Why:** a brown page with a cream card says nothing about the game. The seed in its pot is the game's own picture, and it matches the app icon.

### No bar under the opening screens (Nov 17)

- Jackie, with two phone pictures of the loading screen and the turn-your-phone screen: "I don't like ... the weird bar at the bottom".
- The bar was the page itself showing. On an iPhone the screen is a little taller than the area a full-page cover can fill, and the two covers were brown while the page behind them is dark plum. Both covers are now the page's color (#19101b), so there is no edge to see.
- **Why:** a strip of another color along the bottom looks like a mistake.

### Illustrated book covers (Nov 17)

- Jackie: "we need to make illustrative book covers", and made a sheet of twelve (one picture per book on a cream card with a colored border: a cottage under a flower, Sloth's paw with a sprig, a fish in a hat in a teacup, an eye in thorns, a moon with a music note, a constellation, a keyhole with a question-mark key, a tree with a bird, an envelope with a paw seal, a steaming pot, a ghost with a candle, a leaf with a beetle and a mushroom).
- Each cover is cut from the sheet at 42 x 60 pixels (books/, the sheet is kept there too) and replaces the small drawn book with a three-pixel emblem. It shows in the tray of four books, on the book in your hand (twice the size), on the book hopping home and as the journal's favorite story.
- **Why:** twelve books with a tiny emblem each were hard to tell apart; a picture says what kind of book it is at a glance.

### Every book gone over again to a higher bar (Nov 17)

- Jackie: "let's go over all of the book content again -- High quality, not basic choices, due to length, this often means major concision without losing voice or heart of the content/story/knowledge/thesis. No western common knowledge, when using non-english text they should be because it's the original version not your translation of a translation." Then, asked whether to see a list first: "Just write them."
- **Fairy tales:** the three poems (Rossetti, Tagore, Allingham) are gone. Six short folktales: the Sun and the Moon (Korea, with the tiger's line in Korean), Why the Sky Is High (Philippines), the Toad Who Sued Heaven (Vietnam, with its saying in Vietnamese), the Smell of Soup (Nasreddin), the Tea-Kettle (Japan) and the Bird Who Raised a King (Iran).
- **Nonsense poems:** Lear and the Purple Cow are gone. Sukumar Ray's Khichuri in Bengali (1923), Morgenstern's Das große Lalulā and Hugo Ball's Karawane (both made-up words, as printed), and the Great Panjandrum (1755).
- **Forbidden grimoire:** Macbeth is gone. Abracadabra as a Roman fever cure, the five-word square from Pompeii, Ethiopia's scrolls cut to a person's height, Japan's weather doll, and the mandrake (without Shakespeare).
- **The star book:** the Big Dipper read is gone. The Weaver and the Cowherd stays; the Rabbit in the Moon moved here from the grimoire; new are the Emu in the Sky, stars with Arabic names (in Arabic), the Pacific star compass and Matariki.
- **Proverbs:** the well-worn ones (a journey of a thousand miles, fall seven times) are gone. Less common sayings in their own scripts from Japan, China, India, Korea, East Africa, the Philippines, Turkey, the Arab world, Iran and Ghana, and the Chinese story of the old man's horse.
- **Letters and diaries:** Beatrix Potter and Dorothy Wordsworth are gone. The Pillow Book stays; new are a Roman birthday invitation (in Latin), the oldest complaint letter (Ur, about 1750 BC), a Novgorod boy's homework on birch bark, and a Tang Chinese form letter for apologizing after getting drunk.
- **Ghost stories:** Jack of the Lantern is gone. The House Child and Foxfire stay; new are the kapre (Philippines), hundred-year-old tools (Japan), dokkaebi (Korea) and the hopping ghost (China).
- **Added to the books Jackie liked:** two Almanac entries (flowers that hear bees, a plant that learns), three recipes (halo-halo, Ethiopia's three cups of coffee, the oldest stew), three Field guide entries (banana slug, slime mold, pill bug).
- Each read names its source in the file. The texts in other languages were checked against a printed or scholarly source before going in; the Japanese, Chinese, Korean, Hindi, Arabic, Persian, Turkish, Tagalog and Swahili sayings are standard forms written from memory and not yet checked against a dictionary.
- **Why:** Jackie's bar for the books is a clever ten-year-old through an adult who would open the book twice.

### A magnifying glass over the books (Nov 17)

- Jackie: "I would like a magnifying glass cursor to open a book maybe". On a computer, the cursor turns into a magnifying glass over any book you can open (both bookcases, the book on the crate, the book stack). It follows the same rules as the tap, so not at night and not over a monster or the cat sitting there. A phone has no cursor, so nothing changes there.

### The book's name under its cover and on the open book (Nov 17)

- Jackie: "I would kind of like to know what kind of book I'm reading/choosing". In the tray of four books, each cover has its book's name under it. The open book has its name on a tab at its top left corner, on every page. **Why:** a picture alone doesn't say "Letters and diaries".

### Cats replaces Riddles (Nov 17)

- Jackie: "Replace riddles with something else entirely, maybe more nonfiction of some kind -- fun facts", then "fun facts related to something specific -- a book", and for the subject: "Cats but like all cat history and facts not just japan turkey etc". A first try at a grab bag of trivia (wombats, Venus, Cleopatra) was dropped before it was saved.
- The Riddles book is now **Cats**, nine short chapters: how cats moved in with people, the cry hidden in a purr, the meow and the slow blink, the Old Irish poem Pangur Bán (in Old Irish with the 1903 English), a Dutch scribe's Latin curse on the cat that peed on his book, the Hermitage's palace cats, why orange cats are boys, silver vine, and Thailand's cat-book poems. Each chapter's source is noted in the file.
- It keeps its place on the shelves. Its cover is still the keyhole with a question mark until Jackie draws a cat cover.
- **Why:** one subject, told with real and uncommon facts, reads like a book you'd actually pick up.

### Humpty Dumpty is out of the Riddles book (Nov 17)

- Jackie: "OMG humpty dumpty is one of the things - what terrible". The nursery rhyme is gone from Riddles, and the Swahili riddle no longer ends with a line about it. Riddles keeps the Sphinx, the Old English riddle and the Swahili one. **Why:** the books are for clever older kids through adults, not nursery material.

### The Song book: true stories of real songs, with the record to play (Nov 17)

- Jackie on the old Songs and lullabies book ("Twinkle, Twinkle", Tennyson, Tagore): "very unfun", written for small children of the early 1900s, "not like smart clever funny older kids through adult adults". All three reads are gone.
- First try, dropped the same day: chords above the words and a tune the game played itself. Jackie: "Nevermind on the songbook - that looks bad. But maybe if there's an example in the crates you could have the option to play a sample."
- So each read is now the true story of a real song in plain words, like the mint tea recipe, and every song is one that has a record in the crates (the library of old free 78s the radio and the sampler use). The open book has a **Play the record** button that streams it, and a caption says who is playing. It keeps playing while you turn the pages; tap again or close the book to stop. The radio pauses meanwhile.
- The first six: Yes! We Have No Bananas (Billy West, 1923), Ain't We Got Fun (Billy Jones, 1921), St. Louis Blues (the 369th Infantry "Hell Fighters" Band, 1919), Aloha ʻOe (the Royal Hawaiian Troubadours, 1904), Cielito Lindo (María Luisa Escobar, 1924) and ʻO Sole Mio (Enrico Caruso).
- Not everything free to use is old: facts, recipes, customs and folklore told in our own words can be about anything. That is the plan for the other books Jackie finds dull, still to be gone through one by one. Fairy tales stay "if they are actually juicy or cool in some way".
- Dropped: tabs for the Kalimbasizer (Jackie's kalimba synth game): "let's forget" it.
- **Why:** a book in this room should be something a clever ten-year-old or an adult would want to open twice, and hearing the real hundred-year-old record beats reading about it.

### The journal's hand is only on the last page (Nov 17)

- Jackie: "the hand in the journal is covering some text". The carafe hand (left- or right-handed) sat in the bottom corner of every right-hand page, and a full page's words ran down under it. It is now only on the last page, Keep it safe, which is the inside of the back cover where it was first meant to be. That page keeps its bottom strip clear for the hand, and its tip sits a little closer to the words above. **Why:** every other page keeps its full room for words, and the hand never sits on any.
- Tried first and dropped: keeping the hand on every page and holding the bottom strip of every right-hand page clear. That pushed an ordinary adult's Quirks onto a second spread.

### Tarot: the reading under the cards, a new Celtic Cross page, details in the zoom (Nov 16)

- Jackie: "I would rather have the reading under the spread", with each card's name written beneath it "and then its role (the past, etc.) in parenthesis". Once a card is turned, its name, its place in parentheses and its meaning are under it: "The Star (the past)", then the meaning. The card of the day has just its name ("it doesn't need to say today because it's the card of the day").
- "The Celtic Cross page looks dumb": ten cards with their readings don't fit side by side on a phone, so the cards were tiny with empty space around them. Now the cross is a small numbered map on the left, and the card you're on is shown large beside it with its number, name, place and meaning. **Turn card 1, 2, 3…** turns them in order (card 2 lies across card 1, so the button is the sure way to turn card 1); once all are turned, tap any card on the map or use Previous card and Next card.
- "More details including about the card itself and the creation… dork details, in the zoom": tapping a turned card opens the zoom with the card large and, after its meaning, what is in the picture, its place in the deck, its sign, planet or element in the Golden Dawn's system (with a line when tonight's moon or sun is in that sign), a note on how the card was made where there is one (Waite swapping Strength and Justice, scenes borrowed from the Sola Busca deck, what older decks show), and Pamela Colman Smith as the artist. All 78 are in js/tarotlore.js, written as plain sentences.

### Plain prose in the game's text (Nov 16)

- Jackie flagged "The planets' places are real astronomy. What they mean is old tradition." as reading like AI writing, and asked for such lines to be found and replaced with straightforward prose. The pattern to avoid: neat paired sentences, a clipped phrase followed by a colon and a punchy tag, semicolon fragments, and cute flourishes.
- Rewritten as plain sentences: the charts' footer ("These charts use the real positions of the planets and the traditional astrological meanings."), every horoscope line ("Venus is at a helpful angle to Tofu's moon today, so expect extra affection."), the lines for pairs, the chart rows ("The moon is about feelings, and Leo is a warm, confident sign."), the tarot's summary of a spread, all 156 card meanings (no colons or semicolons), the Keep it safe page, and the radio's station descriptions.
- For new text: say the thing directly in a full, ordinary sentence.

### Tofu is about 1.34 years old when the game starts (Nov 16)

- Jackie: "make tofu about 1.34 years old when the game starts." The cat's birth moment, used for its birth chart and horoscopes, is now 1.34 years before the moment the game began (it used to be the moment the cat came into the room). The chart says "Born" with that date. In games started before birth moments were kept, the start is estimated from the first monster, as before.

### Tarot: Waite's words taken out (Nov 16)

- Jackie: "Remove the 'waite's words' or whatever." Reading a card now shows only its name, its place in the spread and its meaning in plain words; the "Waite's own words" button and the 1910 quote are gone. The plain meanings are still written from Waite's, and his wording stays in `js/tarotdata.js` as the record of where each one comes from, not shown in the game.
- The Two of Cups reversed (Waite gives no reversed meaning) now reads "The same as upright: love, friendship and getting along."

### Birth charts and daily horoscopes for everyone (Nov 16)

- Jackie: "birth charts and connected horoscopes for everyone who participates (Tofu, plant(s), you)". Your birth place is where you were born ("isn't birth chart birth place?"), and any city in the world can be picked; Jackie went with my picks for the rest: a built-in world city list you search by typing, a clean list layout (not a round chart), daily lines in the moon box.
- **Where:** a **Charts** button in the moon box beside the three spreads. Along the left: You, the cat, and each monster that has sprouted. Each chart: when they were born, the big three (sun, moon, rising) up top, **Today** (what the real sky is doing to their chart), **Together** (today with each of the others, and how their charts fit for good), and **The whole chart** (the sun, moon, rising, Mercury, Venus, Mars, Jupiter and Saturn, with retrogrades, each with one plain line).
- **Birth moments:** a monster's is the minute it sprouted (kept from now on; monsters from before get an estimate from their age, marked "about"); the cat's is when it first came into the room (an estimate for older games); yours is the birthday you enter, with a birth time and the city you were born in if you know them (time and city give your rising sign and an exact moon; without a time, if the moon changed signs that day, it says so). The cat and the monsters were born where you play, worked out from the phone's time zone. Birth times use the real time-zone rules of that place and date, daylight saving included.
- **The sky is real:** worked out on the phone with Paul Schlyter's method, checked against published positions (within a tenth of a degree for 1 Jan 2000), sign changes, the equinox, a full moon and a Mercury retrograde. **The meanings are tradition**, and the page says so: "The planets' places are real astronomy. What they mean is old tradition."
- **Cities:** the 34,216 cities with more than 15,000 people, from GeoNames (CC BY 4.0, data/CREDITS.md), loaded only when the charts open. Your birthday stays on the phone (and in the backup file).
- Everyone is said by name; no he or she.

### Tarot box: sleek cream (Nov 16)

- From the color options, Jackie picked the cream reading panel as closest, and wants "a sleeker look": not purple or blue, and not warm colors, which "read old guy castle and stuff". (Jackie plans to move the main room away from a lot of its warm colors too, redrawing it on the iPad.)
- The box is now a clean cream cloth with a white reading panel, near-black text and outlines, and only two accents: magenta (card names, the chosen spread, the numbers) and green (where the card sits in the spread).
- The card back matches: cream with a thin black frame, a magenta crescent and small magenta, green and black stars (no more blue field).

### Tarot cards: brighter and recentered (Nov 16)

- Jackie likes the cards but asked to "brighten and recenter the card images a little so they're all consistent and maybe slightly more modern feeling." All 78 were made again from the 1909 scans: cropped right at each card's printed black frame (no strip of old paper, so every card sits the same way), white-balanced so the yellowed paper reads as clean white, with brighter, fuller colors. Smith's pictures themselves are unchanged.
- The box's colors (purple velvet, brass and cream) are going: Jackie found them "so muddy and old fashioned", and doesn't want purple or blue ("they feel very western anglo"). Its colors now live in one set of settings so a new scheme is a single swap.

### Tarot: all three spreads, once a day each (Nov 16)

- Jackie asked for all three kinds of reading, and: **"you should not be able to re-do it in the same calendar day"**, by the phone's clock.
- **Three spreads,** picked with buttons along the top of the cloth: **Card of the day** (one card), **Three cards** (past, present, future) and the **Celtic Cross** (ten cards), laid out as Waite gives it in *The Pictorial Key* (1910): six in a cross, with the second card laid across the first (what covers you, what crosses you, what crowns you, what is beneath you, what is behind you, what is before you), and four rising in a column beside it (yourself, your house, your hopes or fears, what will come). Waite wrote "him"; the game says "you". His Significator (a card picked to stand for the one asking) is left out, as most readers do today.
- **Once a day per spread:** once the cards are dealt, that spread is done for the calendar day (the phone's own date). Opening the box again shows today's cards face up to read again, the spread's button has a ✓, and the line ends "A new … comes tomorrow." The next day the deck is back. Kept on the phone (`mp-tarot`, just today's cards).
- New reading is gone (the other spreads are the buttons along the top).

### The moon box: a real tarot reading (Nov 16)

- Jackie wanted the moon box on the right bookcase to be an oracle that feels "super good and useful and involved and super simple and cool", "the best toy ever that you like from 10-50"; no wheel (it would echo the orrery above the desk); then **"an actual tarot deck… based on an actual real deck we can do an actual reading with"**, and **"stick with tarot. I think u can pick a spread."**
- **The deck:** the Rider–Waite–Smith tarot, all 78 cards: Pamela Colman Smith's pictures from the 1909 printing (public domain; scans from Wikimedia Commons, not the later recolored editions, which are still under copyright), made into the room's pixel style (72×124). The card back is our own: midnight blue, a brass border, a moon and stars. A few of Smith's cards have classical nudity (the Star, the Lovers, the World, the Devil), as drawn in 1909.
- **The meanings:** A. E. Waite's own, from *The Pictorial Key to the Tarot* (1910, public domain). Each card has a short plain-words meaning written for the game from Waite's (his 1910 wording is old-fashioned and often grim), upright and reversed, and Waite's own words one tap away. Waite gives no reversed meaning for the Two of Cups, and the game says so.
- **The spread (picked for Jackie):** the classic three cards, **the past, the present, the future**. Think of a question, tap the deck to shuffle, cut it into three piles and pick one, then turn the three cards over one by one. About one card in three comes up **reversed** (upside down), as in Waite's book. Tap a card to read it; once all three are up, a line reads the spread the traditional way (how many Major Arcana, which suit leads, whether several are reversed). New reading starts again.
- The pictures load only when the box opens and when a card is dealt, so the game starts no slower. Nothing is saved.

### The falling leaves are slower (Nov 17)

- Jackie asked to slow down the autumn leaves. They now fall at about half the speed (13-20 pixels a second instead of 26-40, about half a minute to cross the window) and sway side to side more slowly. How often a new leaf comes is the same (every 5-12 seconds, two at most).

### The pumpkin's eyes are closed (Nov 16)

- Jackie didn't like how the pumpkin looked with its eyes open, so it now has sleepy closed eyes. In the three day frames each eye arc is turned upside down in place, using its own pixels. Only the eyes changed, with Jackie's OK. The mouth, rock frames and sizes are the same as before (`tools/pumpkin_eyes.py`).
- Jackie likes only the closed eyes and the black mouth, so the lit night frame (glowing carved face) is gone: the pumpkin looks the same day and night.

### The moon in the window shows tonight's real phase (Nov 16)

- Jackie asked whether moon phases could be added without new pictures or slowing loading. Yes: at night the moon outside the window matches the real moon, worked out from the phone's date (no internet, no new pictures, nothing extra to load). Checked against real new, full and quarter moons from 2024 and 2025.
- Each season's night picture had its own painted moon (a crescent in spring, full in summer and autumn, none in winter). At night that one is painted over with the sky around it, and a chunky pixel moon is drawn in its place, lit like the real one, with the dark part a faint shade so the round shape still reads (at new moon there's nothing). Winter now has a moon too, in a clear patch of sky at the same height.
- Seen from the northern half of the world (a waxing moon is lit on the right). Behind the glass, so the curtains close over it; by day there's no moon drawn.
- `moonAge()`, `moonLit()` and `moonName()` (js/moon.js) are ready for the astrology box.

### Radio: superfluous stations off (Nov 16)

- Jackie: "Remove some superfluous channels on the radio." Off the dial (92 down to 81), picked as doubles or plain playlists next to the more distinctive ones: NTS 2 (NTS 1 stays), Montez Press Radio's general channel (The Sounded Word stays), Conyers Old Time Radio (the sci-fi radio plays stay), Radio Swiss Jazz, Venice Classic Radio, Jazz Sakura, OPM Radio, UbuntuFM Africa, Dundee Radio Club, Echobox Radio and Radio Brennpunkt. Any of them can come back.

### Keep it safe: guarding your progress (Nov 16)

- Jackie asked how to prevent losing progress on a device, and picked four layers (cloud saves are a bigger project for later):
  1. **The game asks the browser to keep its storage** (persistent storage), so it isn't cleared to free up space.
  2. **Copies on the phone:** every 10 minutes of play, and before Start over or loading a backup, a copy of the save goes into a second store. Only the **last 3** are kept, each new one replacing the oldest (Jackie: "backups to replace each other so they don't go nuts"). If the save itself is ever gone, the start screen offers **Bring back day N**.
  3. **A backup file:** a new **Keep it safe** ribbon in the journal (a lock) has **Save a backup** and **Load a backup**. The file holds everything: the game, the radio's presets, and the sampler's work and songs. On a phone it opens the share sheet (Files, iCloud, email). It's **always named monster-plant-backup.json**, so saving it to the same place replaces the last one. **Load a backup** is also on the start screen, for a new phone; loading asks first and keeps a copy of the current room.
  4. **How to put the game on the Home Screen,** for the device you're on (Jackie: "how to save on their home screen on android and iPhone and browser", "a little reminder during a load screen", smooth on every device): one small rust line on the loading screen and the start screen, and on the Keep it safe page. iPhone and iPad: Share, then Add to Home Screen. Android: ⋮, then Add to Home screen. Computers: the install button (Chrome, Edge) or File, then Add to Dock (Safari). Where the browser can do it in one tap, a button does it. Nothing pops up during play, and nothing shows when the game already plays from its icon. (Safari clears a site's storage after 7 days of Safari use without a visit, but not for a game played from its Home Screen icon.)
- The loading screen is often gone in under a second, so the same line also sits on the start screen, which waits for a tap.
- Each line starts with **"Playing in a browser?"** (Jackie, for audience clarity), so it's plain who it's for: "Playing in a browser? Tap Share, then Add to Home Screen, and play from that icon to keep your room safe."

### WORLD band: 21 stations from Africa, the Middle East, Central and South Asia (Nov 16)

- Jackie: "creative art shit out of the Middle East and Central Asia and Africa and South Asia." The dial grew from 71 to 92.
- **Middle East:** Wa3 Radio (Beirut: ambient, dabke and drum and bass), Radio Antalya (downtempo and indie), Radyo Şiran (Turkish folk), Kurd1 Radyo (Kurdish folk), RadioSimorgh (classical Persian), Yurd FM (Azerbaijani folk). **North Africa:** Mosaique FM Tarab (Tunis), Radio Arts Tripoli, Antinea Radio (Kabyle, Tizi Ouzou), Medina FM Amazigh (Morocco).
- **Africa:** Caboradio (Cape Verde), Radio Malijet (Mali), Radio Mix Congolaise (rumba and soukous), Tizta FM (tizita, slow nostalgic Ethiopian songs), Bush Radio (Cape Town community radio), UbuntuFM Africa, Amapiano FM, Radio Rock Madagascar.
- **Central and South Asia:** Coldstar Radio (Kyrgyzstan, deep house and techno), Radio Sangwari (Chhattisgarhi folk), Mellow Bangla (Bangladesh).
- All 92 checked playing in a browser. South Asia's art and underground stations (boxout.fm and others) mostly don't share a stream a game can play, so that corner is thinner than the rest.

### Fewer US stations on the WORLD band (Nov 16)

- Jackie: "Let's get rid of some of the more boring US ones which are basically all in California and Jersey lol." Off the dial: BFF.fm, Radio Paradise World/Etc, dublab, KALX, and WFMU with its two side channels. The US stations left are the weird ones (KPISS.FM, the Art Bell reruns, UFO talk, field recordings, old-time radio, Montez Press). 71 stations now; a preset kept on one that left says so.

### Five presets on the radio (Nov 16)

- Jackie wanted five preset channels, like an old car radio, to program favorites. A row of buttons 1 to 5 under the dial: **tap** one to jump to the station kept on it, **hold** it (half a second) to keep the station you're on there. The button for the station playing now is lit; empty ones are pale, and tapping one says how to fill it. CRATES can be kept on a preset too.
- Presets remember the station by name, so they survive the dial gaining or losing stations; if a kept station has left the dial, the button says so.
- With the extra row the dial is taller, so on a phone held sideways it now opens beside the radio instead of above it, keeping the radio tappable.

### The screen stays awake while the radio plays (Nov 16)

- Jackie: Garry's phone went to sleep and the music stopped. While the radio is on, the game now asks the phone to keep the screen awake (the browser's Screen Wake Lock: iPhone Safari 16.4 and up, Chrome on Android). It lets go when the radio goes off or the sampler opens, so the phone sleeps normally otherwise. If the game goes to the background anyway, the phone drops the lock, and it is asked for again on coming back.
- On a phone too old for it, nothing changes. On an iPhone, the game saved to the home screen needs iOS 18.4 or later for this.

### WORLD band: 24 stations from Asia (Nov 16)

- Jackie: "more out of Japan Korea Philippines and Asia more generally they have a lot of cool stuff and du cultures and interest in lots of genres." The dial grew from 54 to 78.
- **Japan:** Japan City Pop, Jazz Sakura, Moon Mission Recordings (Tokyo deep house), LISTEN.moe (J-pop and anime, fan-run), Gensokyo Radio (fan music for the Touhou games), Miku Radio (Vocaloid). **Korea:** yojosuknam Radio (gugak, jazz and lo-fi), LISTEN.moe K-pop. **Philippines:** Budots FM (Davao's homemade dance remixes), 90s Pinoy Alternative, OPM Radio, Pinoy Rap Radio.
- **Elsewhere:** Hà Nội Community Radio, Bangkok Community Radio, BKK.FM, Looktung Eingdoi (luk thung), Pop Radio 21 (Khmer pop and folk), Mettaswara Koplo (dangdut koplo) and Radio Campursari (Indonesia), FM Belowground (Hong Kong), Taipei Classical Radio, Bollywood Gaane Purane (old Bollywood), Elgen Nutag (Mongolian folk), Qazaq radiosy (Kazakh folk).
- All checked playing in a browser; a Casiopea-only station, Tamil 80's Radio and Radio Lantau didn't, so they were left out. Seoul Community Radio, Hong Kong Community Radio and boxout.fm (Delhi) would be great but don't publish a stream a web page can play.
- The dial's ticks are thinner so 78 fit.

### WORLD band: 24 more stations, underground and weirdo (Nov 16)

- Jackie: "the more underground but amazing the better", and asked for "alien or weirdo radio things too think art bell but 2026." Then: **"Keep it all. Just skip if it disappears."** The dial grew from 30 to 54; nothing was taken off.
- **Weirdo:** Coast to Coast AM and Midnight in the Desert (Art Bell reruns, from an unofficial relay that may vanish), Free People of the Cosmos (UFO and paranormal shows), Radio is a Foreign Country (rare tapes, records and field recordings), ROKit Radio Science Fiction (old sci-fi radio plays), Conyers Old Time Radio, Dark Matter Sessions (Signal City).
- **Underground:** KPISS.FM, KALX, Montez Press Radio (two channels), Radio Relativa, Dundee Radio Club, Oroko Radio (Accra), Radio WORM, LYL Radio, Echobox, Noise Radio, Radio Helsinki (Graz), Palanga Street Radio, XRaydio, Mutant Radio (Tbilisi), Nightwave Plaza (vaporwave), Radio Brennpunkt.
- All checked playing in a browser. Still west to east, San Francisco to New Caledonia, with the online-only stations at the far end. A station that disappears says No signal and skips to the next (already how it worked). No live numbers station exists to stream; those are shortwave only.
- Each station's description can now wrap to two lines on the dial.

### The radio's WORLD band: 30 live stations and a dial (Nov 16)

- Jackie wanted more choice on the radio: the crates, or a global radio of real stations, with the feel of changing stations. Picked: **hand-pick 30**, a mix of everything (jazz, folk, classical, lo-fi, traditional music), and above all **"COOL stations - weird good arty or just fun."** Live radio is **only for the radio**: never sampled, never saved.
- **Tapping the radio** now switches it on and opens a little dial above it: CRATES or WORLD, a tuning strip with a tick for each station, ◀ ▶, and the station's name, what it plays and where. Tap again to close the dial (the music keeps going); OFF switches it off.
- **WORLD** runs west to east along the dial, San Francisco to New Caledonia: freeform and art radio (WFMU and two of its side channels, NTS 1 and 2, dublab, Cashmere Radio, Resonance Extra, Radio alHara, Kiosk Radio, Radio 80000, Radio Raheem, Refuge Worldwide, Radio Quântica, Noods, BFF.fm, Radio Meuh, FIP, Radio Paradise World/Etc), plus tango (La 2x4), Argentine folk, fado, Senegalese music, Norwegian folk, world music from Athens, jazz, classical (Venice), bossa nova from Ashiya, lo-fi from New Caledonia, and space synths. Each one was checked to stream over https in a browser; SomaFM was left out because it refuses to play in web pages.
- **Changing stations:** a burst of a real recording of a radio being tuned (CC0, Freesound, sounds/tune.m4a), held while you drag the dial. Not synthesized, since Jackie dislikes the made-up sounds.
- Freeform and DJ stations talk between records now and then, and anything can come on; that's part of their charm. A dead station says No signal and skips to the next; if several fail, the radio says so and switches off.

### Five real recorded sounds (Nov 16)

- Garry won't be making foley (page turns and the like), so Jackie picked free recordings instead, from two to four CC0 takes for each sound in the game (all from Freesound; CC0 means free to use with no credit).
- **Picked:** turning a page (stories and the journal), opening a letter or Sloth's note (an envelope tearing open), the tap on buttons, the pop, and the hungry plant's tummy rumble. Each one is trimmed, faded at both ends and evened out; files and sources are in `sounds/` (`CREDITS.md`).
- **Everything else stays silent,** by Jackie's choice: pulling out a book, the chime, purr, watering, sipping, eating, planting, boing, and the voices (giggle, sigh, burp, hmm, hum). Paper moments that aren't page turns or opening a letter (pulling out a book, a letter landing, the curtain, the journal opening) are now a silent `paper` sound, so the page turn only plays on a turn.

### All the made-up sounds off (Nov 16)

- Jackie: "I dislike them period so tone doesn't matter." Every synthesized sound (taps, pages, chimes, purrs, pours, snacks, boings...) is now silent until Garry's real sounds arrive. The radio and the sampler play real recordings and still sound.
- They're kept, not deleted: `SFX_OFF` in `js/audio.js` lists them, and the debug drawer's Sounds group still plays each one.

### Page and tap sounds off for now (Nov 16)

- Jackie: still awful when picking a book or turning a page, even after the softening. Those are the synthesized paper sound (books, page turns, the journal, the curtains) and the tick on every tap, both made from noise, which doesn't sound like paper. Both are **off** until Garry's real sounds arrive (`SFX_OFF` in `js/audio.js`).
- **Debug drawer, Sounds:** a button per sound plays it (switched-off ones struck through), so Jackie can say which others to switch off or keep.

### Words in their original script in the books (Nov 16)

- Jackie wanted to see the original script of anything in the books that isn't English (Hangul for Korean, the Japanese text, and so on), **only where it really exists, never assumed**. Each original was checked against a real source; the notes are kept outside the repo.
- **Shown now** (the original on top in rust, the English under it):
  - Proverbs: 七転び八起き and 猿も木から落ちる (Kotobank), 하늘이 무너져도 솟아날 구멍이 있다 (Standard Korean Language Dictionary), बूँद-बूँद से घड़ा भरता है, the Sankofa saying in Twi spelling (Sɛ wo werɛ firi na wosan kɔfa a, yɛnkyiri), and Laozi's 千里之行，始於足下 (Wang Bi text).
  - The Swahili riddle: Nyumba yangu haina mlango.
  - The Pillow Book lines in the old kana of the standard text (春はあけぼの… うつくしきもの).
  - Tagore's "The Source": its opening stanza in the Bengali he first wrote, খোকা (1903), from proofread Bengali Wikisource.
  - The moth riddle in Old English, from the 1936 standard edition.
- **Left out on purpose:** "Paper Boats" (no source says which Bengali poem it comes from, and its text could only be read off a scan); the Sphinx riddle (the old Greek words differ from the English we tell); the retold tales, recipes and the house child (written plainly for the game, so there's no original to show). Swahili, Spanish and Irish were already in their own words.
- The Hindi and Twi spellings come from fewer sources than the rest (a dictionary for the words and a school textbook for the Hindi saying; adinkrasymbols.org and Twi Wikipedia for the Twi).
- How to add one: a page can be `{o, l, e}` in `js/stories.js` (original, language, English); `tests/reading_shots.py` checks every page still fits.

### Softer sounds, and the stool lit at night (Nov 16)

- **Sounds (Jackie: a lot of them were abrasive):** every sound now goes through one quiet bus (60%) with a gentle low-pass (nothing brighter than about 2.6 kHz). Only sine and triangle tones, no buzzy sawtooth or square (slurp, burp, giggle were); no high hiss (page turns, crinkle, fsss were high-passed noise); no attack faster than 8 ms, so no clicks; chimes an octave lower and quieter. The tick on every tap was a hiss; it's now a tiny soft knock. Each sound is a little quieter too. The radio and the sampler aren't on this bus.
- **The stool under the watering can (Jackie):** picking up the can showed a light square at night and golden hour, because the empty stool was daytime art. Now it's lit like the room picture: every pixel the can never covered comes straight from the room as it is now, and the bits the can hid take the colour that colour has now elsewhere around the stool, a little brighter or darker with the light nearby. A few outline pixels may still show at golden hour.

### Monsters, the cat and the rest are lit like the room (Nov 16)

- Jackie asked how the monsters get dimmed when appropriate, then said yes to building it. Until now the monsters, the cat, Sloth's paw and what it brings, and the pumpkin or tree were drawn at full daylight all the time; only the room picture changed.
- **How:** the same way the FILES sign was already shaded. Once the room is drawn (time of day, lamps, curtains), the game compares the room's colour just below each one's feet with the same spot in the daytime room, and lays that one flat tint over the sprite. They dim at golden hour and night, are warm near a lamp and blue in the dark, and always match the art.
- **Instant, no fade:** the tint changes only when the light does (in small steps). This is the code lighting RULES 1 already allows to blend.
- **Never too dark:** a floor (0.42) keeps faces, the good/evil tint and thirst grey readable at night, and the tint is a touch softer than the walls (0.85).
- **Not tinted:** name tags, captions, effects (hearts, Zzz) and anything on paper.
- Shut curtains only darken them where the room art itself gets darker; by the rug it hardly changes, so neither do they.
- Switch: `SPRITE_LIGHT.on` in `js/light.js`. `python3 tests/sprite_light_shots.py` pictures noon, golden hour, shut curtains and night with lamps on and off, and checks it.

### Pads stop by themselves when their sound is over (Nov 16)

- Jackie found pads didn't stop on their own after the sample was over. A pad relied on the browser saying its sound had ended, and iPhones don't always say so (for example after the audio is interrupted), so the pad stayed lit as if still playing.
- Now each pad also stops at the exact end of its clip (at its pitch) and goes dark on a timer as well, whether or not the browser says anything. `tests/beat_test.py` checks it with the browser's "ended" turned off.

### Clipping samples (Nov 16)

- Jackie asked to be able to clip samples. The first version had no trimming screen on purpose; this adds one.
- **CLIP** is a fourth page on the sampler's screen (DIG, BEAT, CLIP, SONGS). It shows the last pad you tapped as a waveform: the kept part in white, the cut parts grey, with an orange start line and end line. Drag either one (whichever is nearest your finger); letting go plays the clip. PLAY plays it again; RESET brings the whole sample back.
- **Nothing is thrown away:** the pad keeps its whole sound and just plays from the start line to the end line, so a clip can always be undone. The shortest clip is 0.05 s.
- The clip is used everywhere the pad plays: tapping it, the loop, finished songs. It's kept with your saved work, and the pad shows "clip" next to its number.

### Work in progress, finished songs, and the radio (Nov 16)

- **The click is never in the recording (Jackie).** The loop and songs hold only pad hits, never the click. The click now sounds only while recording (and the count-in) or on its own; when the loop just plays back, it's silent.
- **One work in progress (Jackie):** SAVE WORK keeps it (pads, pitch, tempo, bars, LOCK, the loop), and saving again replaces it; there's only ever one. It comes back by itself when the sampler opens. Leaving with unsaved changes warns once (tap ✕ again to leave anyway). The SAVED page is now **SONGS**.
- **Finished songs:** FINISH SONG (a second tap to confirm, since it clears the work in progress) plays the loop out a few times into a song of about half a minute, faded at the end, no click. Up to 12 songs, named Song 1, Song 2...; tap one to listen, ERASE then a song erases it.
- **Sending to the radio (Jackie):** each song has a RADIO key; sent songs can come on the radio in the room.
- **The radio on the desk (Jackie picked):** tap it to switch on or off (it used to do nothing). While on, it plays a station of old free records (the same library and rules as the sampler, streamed), and now and then one of your sent songs (about a third of the time, and always after two records). Your song gets a caption, "On the radio: Song 2, by you! Fig bops along." (Jackie picked a caption), and hearts over every monster. Quiet while the sampler is open. Without the internet it plays only your songs; with neither, it says it's static and switches off. Off whenever the game starts.
- **Storage:** all of it lives in the site's own storage on the phone (`js/cratesdb.js`), shared by the sampler and the radio, never in the game's save. Beats saved the earlier way (from an hour before) still show in SONGS; tapping one makes it the work in progress.
- **Follow-ups, not done:** money from airplay, and a game economy for buying things for the monsters and the house (Jackie: "at some point"); naming songs; something visible on the radio while it plays.

### The sampler gets a BEAT page and saved beats (Nov 16)

- Jackie asked for the sampler to pitch shift, slow down or speed up the tempo, have a metronome that samples can lock to, and record a little composition and save it. Built into the in-game sampler (The Crates); the separate MPC app isn't in this project.
- **Where:** the screen on the left now has three pages, **DIG** (the records, as before), **BEAT** and **SAVED**. The four lights in its corner follow the beat. Nothing new on the pad side, so sampling works as it did.
- **Pitch:** per pad, a semitone at a time, 12 up or down, on the last pad tapped. Like an old sampler, it changes speed along with pitch (no stretching). It shows on the pad as "1 · +2".
- **Tempo:** 40 to 200 BPM, starting at 90. Changing it while the loop plays speeds it up or slows it down from where it is.
- **Metronome (CLICK):** ticks by itself, higher on the first beat of each bar. 4/4 only.
- **Locking to the click:** recorded hits snap to the nearest sixteenth when **LOCK** is on (on to start). Pads you play live still sound the moment you tap them, so nothing feels late; it's the loop that comes out in time, the way an MPC does it.
- **Recording:** a loop of 1, 2 or 4 bars. REC from a standstill counts in one bar of clicks, then records every pass on top of the last until REC is pressed again. PLAY plays the loop; CLEAR empties it.
- **Saving (on purpose only; replaced the same day by work in progress and songs, above):** SAVE THIS BEAT keeps the pads' sound, their pitch, the tempo, the bars and the loop as "Beat 1", "Beat 2"... Up to 12, newest first; tap one to load it, ERASE then a beat to erase it. They're kept in the sampler page's own storage on the phone, separate from the game's save, which stays untouched. This changes the earlier rule that nothing in the sampler is saved: pads still vanish when it closes unless the beat is saved.
- **Colors:** settings you pick (bars, LOCK) are orange like the record source chips; things that are sounding (CLICK, PLAY, REC, the beat lights) are blue.
- `tests/beat_test.py` checks all of it without the internet.

### The milk crate does not open The Crates (Nov 16)

- I tried making the milk crate open the sampler app as well; Jackie said no: the crate isn't clearly full of records. Only the sampler on the top shelf opens it.

### The shelf sampler opens its own app, The Crates (Nov 16)

- Jackie asked for two versions of The Crates (the public-domain record finder and sampler built in the Phone-Game project): one for this game and its in-game sampler, and one for people to really use with an MPC. The MPC one stays its own app outside the game.
- **Where:** the sampler is the machine on the top shelf on the wall, above the radio (Jackie). Tapping it opens the app; it used to be a bouncy fidget only.
- **Its own app:** Jackie said the sampler needs its own app. It is a separate page, `sampler.html`, shown in a frame over the room. Why a frame: nothing of it loads until it is opened, none of its code mixes with the game's, and closing it throws the whole thing away.
- **How sampling works:** like the machine in the picture. Tap a record to play it, hold an empty pad while the bit you like plays, let go, and it is on the pad. Eight pads, two rows of four. No trimming screen and no files.
- **Listening:** records play one after another, and tapping the bar under the screen jumps anywhere in a record. There was a SKIM button at first; Jackie found it redundant with the bar, so it is gone.
- **Careful with storage and work (Jackie):** records are streamed, never downloaded whole; moving on forgets the last record; pads live in memory only and are gone when the sampler closes; nothing is saved and the game's save is untouched. Jackie: "you only save things on purpose."
- **Only free-to-use records:** library-digitized 78s published 101 or more years ago (US public domain), and Wikimedia Commons audio marked public domain or CC0. Records the Internet Archive has locked are left out.
- **Rule 1 holds in the app:** flat colors, whole-pixel presses, and a 2-frame blink while a pad records. No fades, gradients or glows.
- **Colors (Jackie, after several rounds):** white, greys and black, one orange, and one somewhat bright but tempered blue. Nothing else. Orange means "holds a sample" or "the thing to press"; blue means "sounding right now". Tried and dropped on the way: the room art's charcoal, coral and lime (hated); the game's cream-and-cocoa menu colors; a loud Teenage Engineering orange and blue (wanted subtler); warm greys with terracotta and sage (the green was disliked). This is the one screen that leaves the cream-and-cocoa text style, because it is a machine, not a page. The lettering stays Nunito.
- **Screen versus keys:** Jackie found the pads and the search too alike (both were pale boxes). The digging side is now a screen like the one on top: charcoal, plain text rows with hairlines, the playing record marked in blue. Only things you press to make sound are pale raised keys.
- **Pads are one color (Jackie):** every pad has the same stone face. What changes is a hard-edged line down its right and bottom sides, as if the pad is seen at an angle: grey when empty, orange when it holds a sample, blue while it sounds. A pressed pad moves down into its edge.
- **The keys under the pads are shades of grey (Jackie):** no color there. Play is the darkest of the three greys, and a key that is on (playing, or ERASE armed) goes graphite.
- **Idle wiggle:** the sampler now works, so it joined the idle wiggle list, per the Nov 4 rule.
- The radio was not part of this at first (it now plays a station and your songs; see "Work in progress, finished songs, and the radio").
- **Follow-ups, not done:** what the pads could do in the room (monsters reacting, the cat's opinion), keeping pads between visits, and Garry's sounds.

### Every quote and fact in the books checked (Nov 15)

- Jackie asked for every quote and idea in the books to be researched and verified. All 37 reads were checked against original printings and reliable sources; most were right. Fixed:
  - **Misquotes:** Tagore "shy buds" (not "timid"); the Macbeth refrain's comma; Rossetti's "thro’" and commas; Lear's Owl and the Pussy-Cat punctuation and "Oh! let us be married;"; Jane Taylor's "trav’ller"; Humpty Dumpty's dates.
  - **One wrong fact:** the duck's egg isn't on Sei Shōnagon's list of lovely things; it's now "a child's face drawn on a melon", which is.
  - **Overstated science, reworded:** sloth digestion (weeks, up to a month), the flytrap (about half a minute, rarely wastes a meal), the Pleiades (counted by astronomers, not seen in a telescope), the North Star (hundreds of years, not thousands), the dandelion's air ring (slows its fall), "many" mosses, the monstera name ("probably").
  - **Folklore made accurate:** the Sphinx sat on a mountain; the mandrake gatherers' dog instead of moonlight; turnip lanterns in Ireland and Scotland; foxfire as the English name for glowing wood; source notes corrected throughout.
- **Free to use, two swaps:**
  - The Beatrix Potter letter's copyright is uncertain (when it was first published is unknown), so that read now tells how the letter began and quotes the 1902 book's opening instead.
  - Dorothy Wordsworth's daffodils are now quoted as printed in 1897, with the left-out sentences marked "…".
- The full report with a verdict for every read is kept outside the repo.

### Twelve books, four at a time by where you tap (Nov 15)

- Jackie wanted more book genres: all eight suggested, but only four available at a time, depending on WHERE you tap for books (which bookcase row or shelf, the book stack, the book lying on the milk crate).
- **The twelve:** Fairy tales, Sloth's Almanac, Nonsense poems, Forbidden grimoire, plus Songs and lullabies, The star book, Riddles, Proverbs, Letters and diaries, Recipes, Ghost stories (gentle) and Field guide.
- **Where they are** (`BOOK_ZONES` in js/care.js): each of the 11 book spots holds its own four, and every book can be found in three or four places. The left bookcase's top row has the first four; the book stack has stars, riddles, proverbs and ghost stories; the crate book has recipes, the field guide, songs and letters.
- **Rewards:** a book's pot now comes after **10 reads** (it was 5). The new books count their reads from zero and have no reward yet; that's for later. (Pots are still paused, Nov 3.)
- **Nudges:** each new book nudges a monster a little, like the first four: songs and letters sweet, proverbs, recipes and the field guide tidy, riddles and stars wiggly, ghost stories a touch spooky. Each has its own listening caption.
- **Reads:** three or four real ones per new book, from all over (Tanzania, Japan, Korea, China, India, Ghana, Morocco, Ireland, Greece, England, the US). Poems and letters are word for word; folktales, facts and recipes are written plainly for the game, with where they come from on the title page and a source in the file.
- **Covers:** drawn in code for now (each its own color and a tiny symbol). Jackie will make real cover art from a prompt; it will replace them once it's in.
- `tests/reading_shots.py` checks that each place shows its own four, every book is in three places or more, and every read fits.
### Seasonal items: autumn leaves, the pumpkin and the tree (Nov 15)

- Jackie uploaded the season sheets (leaves, pumpkin, tree with ornaments). Jackie decided:
  - **No leaf pile in the room.** The leaf piles on the sheet are saved for an outdoor space.
  - **The pumpkin and the tree sit on the stack of books next to the desk.**
- **Autumn:** now and then a single leaf (maple, red maple, ginkgo, oak, twig, round) drifts down outside the window: one at a time, two at most, every 5-12 s, falling in whole pixels with a side-to-side sway. It shows only through the glass, never over the bars, curtains or armchair (`window_glass.png`, made from the four day windows: the glass is what changes between seasons). Daytime and golden hour only; not at night, not with the curtains shut, not with the phone's reduce-motion setting.
- **Autumn:** the pumpkin sits on the book stack. Tap it and it rocks (its two rocking frames, 6 swaps), then settles. At night it shows its lit frame.
- **Winter:** the potted tree sits there instead, with its six ornaments hung on its branches (star, ball, heart, mushroom, bell, little pot). Tap it and the tree sways and the ornaments swing a beat apart.
- **Sharing the book stack:** a plant placed on the book stack gets it, and the pumpkin or tree steps aside (isn't drawn) until the plant moves. The cat doesn't pick the book stack for naps while the pumpkin or tree is out.
- Both get the idle wiggle (seasonal items were already on the list of usable things), only while they're out.
- Spring and summer: nothing seasonal yet.
- Art is untouched: magenta keyed out only (`tools/season_cut.py`); sizes are set in code. `python3 tests/seasonal_shots.py` pictures and checks all of it.

### Nunito lettering (Nov 15)

- Jackie wanted the lettering swapped for something cleaner, rounder and cuter (the old one, Fredoka, read as Comic Sans style). From a sample sheet of six, Jackie picked **Nunito**.
- Every word in the game is now Nunito. Each weight went up one step so it reads as sturdy as before: reading text 600, names, titles, headings and buttons 800.
- Nunito runs a little wider, so the Files note and the journal's quirk stamps are set a touch tighter to still fit their pages. The game also asks for every weight of the lettering as it starts, so pages are laid out with the real letters. Sizes, colors and the rounded shapes are unchanged.
- The room's own pixel lettering (the FILES placard, SNACKS) is art and stays.

### Flipping back in the books (Nov 15)

- Jackie: you should be able to flip backwards in books and pages.
- **Pages:** tap the left page of the open book to go back two pages; tap the right page to go on, as before. Same 2-frame flip, the other way (it just appears with reduce motion).
- **Books:** on a title page, tapping the left page goes back to the read before this one in the same book, opened at its title. Each book remembers its last 30 reads (saved). At the very first read there's nothing before, so nothing happens.
- Finishing any read still closes the book, and the next time the book opens it brings a new read.
- The journal already had Back and Next arrows, so that didn't change.
- `tests/reading_shots.py` checks both with a real mouse.

### Cute, rounded, chunky text style (Nov 15)

- Jackie asked for a more cute, rounded, neo-brutalist type and UI style, for **everything with words**, with **round chunky corners** replacing the stepped pixel ones. This replaces the shape part of the Nov 10 text style ("stepped pixel corners, never round"); the colors, sizes, tints, symbols and contrast rules from Nov 10 all stay.
- **Shape:** big round corners (16 px), the same 3 px cocoa outline, and a hard cocoa shadow set 3 px right and 4 px down with no blur (it was a toffee shadow straight below). A pressed button sinks onto its shadow. Speech-bubble tails are plain triangles.
- **Where:** captions, speech bubbles, choice cards and buttons, name tags, notes, Sloth's letters, menus, the trays, and the journal, Files and story books (round page and cover corners; stamps and charm slots rounded too).
- **Lettering:** heavier for names, titles, headings, buttons and name tags (the font itself changed to Nunito the same day, see above).
- **Unchanged:** the room and everything drawn in it stay pixel art, including the FILES placard; words still appear in stepped pops with no fades.
- `tests/ui_shots.py` now checks for the round corners and the hard shadow.

### The books hold many real reads (Nov 15)

- Jackie: the four books should cycle between lots of reads in each genre, and the reads should be real, not made-up nonsense: an old poem that's free to use, or true facts told the way Blathers tells them in Animal Crossing.
- **What Jackie decided:**
  - Real pronouns are fine inside quoted real works (the no-genders rule still covers everything written for the game).
  - The four made-up stories are retired.
  - The almanac is **Sloth's Almanac**: true facts in Sloth, PhD's voice.
  - The grimoire is real folklore, connected to the game and able to shape its lore later. Nothing in it changes how the game works yet.
  - Poems and old texts are word for word.
  - Not all Western: reads come from anywhere, whatever fits each book best.
- **How it works:** each book goes through all of its reads in a shuffled order before any repeats, and never the same one twice running (`nextRead` in js/stories.js; the order to come is saved). The first page is the title with the author and year, or where the tale is told.
- **Free to use:** every quoted text was published before 1931. A translation has to be that old too, so each one is checked before it goes in.
- **Facts and folklore** are written for the game, with the place named on the title page and a source beside each read in the file (`src`, never shown) so Jackie can check them.
- **Long pieces** appear as a complete part, titled "from …". Whole poems run to about 15 pages at most.
- **First reads** (three per book; more to come from the list Jackie approved): Who Has Seen the Wind? (Rossetti), Paper Boats (Tagore), from The Fairies (Allingham); The Owl and the Pussy-Cat and two limericks (Lear), The Purple Cow (Burgess); On Sloths, On Leaves with Holes, On the Flytrap That Counts; The Rabbit in the Moon, The Mandrake, from Macbeth.
- Jackie asked for wider left and right margins on the book's pages: they're now a little more than twice as wide (40 px at full size, never under 14 px on a phone). Every page still fits.
- Jackie asked for the title page to be centered: the title and the line under it sit in the middle of the page. The reading pages stay left-aligned.
- The reading caption for the almanac is now "nods along to Sloth's Almanac."
- `tests/reading_shots.py` checks the cycling, that every read has a title, a by line and (for facts and folklore) a source, and that every page fits its paper on a phone; it pictures every read.

### The window opens for Sloth's paw (Nov 14)

- Jackie: the paw looked like it was reaching through a closed window, since it was drawn over the bars and glass. Jackie chose: **the lower sash slides up** first.
- **Now:** when a delivery comes, the bottom row of panes slides up one row (100 px) in front of the row above over 1 s, in whole pixels on a straight line. The paw reaches in through the open gap, and once it has slid back out the sash slides down over 1 s. Each trip is 2 s longer.
- **No new art:** the sash is the window's own bars moved up, and its glass stays see-through. The open gap shows the bottom row's own view, with the bars and edges filled by mirroring the view beside them. It's taken from what's already on screen, so it matches day, golden hour, every season and the lamps. Nothing changes behind the armchair.
- Curtains closing or night falling mid-reach still finishes the delivery at once, and the window is simply closed again.
- `tests/paw_shots.py` checks that the paw only comes in once the window is open, that the sash moves in whole pixels, and that the window looks exactly as before afterwards. New picture: `0_window_opening.png`.

### Growing up is a moment (Nov 10)

- Jackie: every age change (sprout to kid, kid to teen, teen to adult) gets a grow-up moment, with no new art. Why: growing up was a silent swap that could happen while she wasn't looking, or while the game was closed. A seed sprouting stays as it was (it just sprouts).
- **It waits for the player.** When a monster's time is up it is "ready" and stays as it is: while the game is closed or in a background tab, while dragging, carrying the carafe, feeding, reading a story, in the journal or a menu, while a choice card is open or Sloth's paw is reaching in, and while a caption is up. It grows when you tap it, or by itself 3 seconds after the room is calm. One monster at a time (lowest first; the next waits its own 3 seconds). Welcome back no longer says "grew into a teen": you see it happen. Time away still counts at half speed and at most one age.
- **Build-up:** it crouches 4, 8, 10 px (the body sinks, the pot stays; a sprout sinks into its pot), holds still for 0.7 s, rises back the same way.
- **The change:** the new age's sprite at 1/3, 2/3 and all of the way from the old size to the new, 0.16 s each, nearest-neighbor, feet on the same line. No fades, rotation or smooth scaling.
- **Spot hops:** if the new age can't stay where it is, it hops there first (8 whole-pixel steps: up a little, then over), then grows. A sprout hops to the nearest free milk crate or book stack (sill to crate, desk to book stack). A teen on the crate or book stack hops down to the floor. A monster on the floor whose bigger body would overlap its neighbor hops to the nearest clear floor.
- **Payoff:** one burst of the sparkle and heart effects, its signature move, and the caption: "<Name> opens its eyes!", "<Name> is a teen now!", "<Name> is an adult now!". Nothing loops afterward. These replace "is a teen now, with big ideas and a bigger pot." and "is all grown up and ready to eat everything!".
- **The cat** sits up and turns toward the monster for 3 s, then goes back to its nap. A cat that is fond of you or adores you walks over and sits near it, then dozes there. Existing frames only (the sit frame, mirrored so its tail is away from the monster).
- **Journal:** the silhouette for the new age is filled in fully, and a stamp under the growth line says it in words: "Grew up on a Tuesday evening in autumn." No numbers. Each age's stamp is saved; the page shows the latest one.
- **Reduce motion** (the phone's setting): no hop, crouch, steps, burst or move; it is simply the new size in its new spot, with the caption and the journal stamp. It still waits for you the same way.
- **Debug** (test mode only): **Grow up now**. `python3 tests/grow_up_shots.py` checks all of it and pictures every stage.
- Choices made where the request left room (Jackie can change any of them):
  - It also waits while the monster is asleep (night or a nap), floating in moon gravity, reading, or a sill sprout is behind closed curtains. Why: a sleeping or hidden monster can't be seen crouching.
  - The stamp uses the same day words as the journal's top corner (the device's weekday and time of day, the real season).
  - A monster that has outgrown its furniture lands at the front edge of the rug straight below, not at the back. Why: grown monsters stand at the front so the carafe, books, snacks and curtains stay reachable (Nov 4).
  - It never hops into the armchair by itself.
  - Picking the monster up, or night falling, mid-moment: it is simply grown at once, with its caption and stamp.
  - "an adult now" for the adult caption, so the grammar works.
  - While a monster is ready and waiting, the journal's growth line says "any time now".

### The journal shows growing and today, in words (Nov 10)

- Jackie asked for time and upcoming growth in the journal, with **no numbers anywhere**.
- **Growth row:** past ages and this one filled, later ones pale, and the next age's silhouette fills in from the bottom, one whole pixel row at a time, as the monster really grows (`silhouette` in js/journal.js). No bar, no percentage.
- **The line under it**, by first name: "<Name> will be a <next age> any time now" (within a quarter of an hour), "in a while" (later today), "tomorrow", or "in a few days", by when it will really grow at full speed. Adults: "<Name> is all grown up." While something is slowing its growing, a kind line says what instead: "could use a drink", "would love a little company", "is waiting for the right light", "would like a little shade", the same reasons the debug drawer shows (`growHolds`).
- **Top corner of every journal page:** today in words from the device's clock and the real season, e.g. "Tuesday morning · autumn" (morning from 5, afternoon from 12, evening from 17, night from 21). Not on the Files' keepsakes.
- All the words are in one place to reword: `GROW_WORDS` and `DAY_WORDS` at the bottom of js/names.js.
- To make room, the portrait on a monster's page is a little smaller and gives way when the page is full (a long name), so it never covers the name. The day line sits in the page's top margin, clear of the close button, so nothing else moves to the next page.
- `tests/journal_growth_test.py` checks the phrase getting closer, each reason, the day line, no numbers, nothing overlapping, and pictures a kid's page at a few growth points.

### The files never name the tools used to make them (Nov 10)

- Jackie: the files on GitHub say what was made and why, never which assistant or picture tool helped. The session instructions file is now [WORKING.md](WORKING.md) (same six rules, new name), and the few tool names in this file, the README and two code comments were reworded. New commits carry no tool credit line; the old commits stay as they are, since rewriting them would change the whole history.
### The time of day is the real clock; evenings never slow growing (Nov 10)

- Jackie: on the phone it was always golden hour and nobody seemed to grow. Why: the game kept its own day clock, which crept forward while the game was open and **stopped at the end of golden hour** (`Math.min(.7, …)`) until you said Goodnight, and that frozen time was saved. Golden hour that never ends is dim, so a sun-lover anywhere but the sun patch or a lamp counted as "wrong light" all day and grew at half speed. Nothing else pinned it (no debug override, no time-zone mix-up; no service worker either).
- **Now the time of day is the device's own local time**, read every frame (`clockTick` in js/room.js), never a saved game clock. Sunrise and sunset follow the month (`SUN_TIMES`, a cozy northern town, daylight saving included): golden hour is the last hour and a half before sunset, dusk the hour after it, night until sunrise. November: golden hour about 3:10-4:40 pm, dusk until about 5:40, night until about 7 am. The season was already the real calendar.
- **Morning comes by itself** at a real sunrise: one new day (Good morning), whether everyone is asleep or not, and only one however long you were away (Grace). Goodnight still works any time (everyone sleeps and the room goes dark), and Good morning can still be tapped early.
- **Growing** keeps the Nov 8 rules: real time, full speed while cared for, half speed while thirsty, lonely or in the wrong light, and coming back catches up at half speed, one age at most.
- **Light only counts in the bright hours** (morning and midday). Golden hour, dusk and night are dim for everyone, so nobody withers or grows slower for the evening; too bright right under a lamp still shows, but doesn't slow growing then.
- **Debug (test mode only):** the status line shows the clock (phone clock or held), the time of day, the season, and every monster's age, how far along it is, the time left and what's slowing it. Setting the time with the slider or buttons holds the clock there on the test copy (Clock: phone clock / held); Keep these changes always goes back to the phone clock.
- **Old copy on a phone:** there's no service worker; a Home Screen app can stay open in the background for days on the copy it loaded. To get the newest version, swipe it away in the app switcher and open it again.
- Tests run on a fixed local time (a Tuesday at 10 am in autumn) so every run looks the same; `tests/clock_test.py` checks the changeovers at real clock times, the sunrise morning, golden hour and night never slowing growth, the catch-up and the debug readout.
### A loading screen until the room is complete (Nov 10)

- Jackie: when the game loads, sometimes the background isn't there for a moment, so the game looks broken. Now a loading screen covers everything until every picture has arrived, and only then does the game start (the title screen, the room, the clock, saving), so the room is always complete the moment it shows.
- **How it looks:** the same cocoa background as the turn-your-phone note, with one cream card in the shared text style: "Monster Plant" and "Getting the room ready" with three dots that step on one at a time (a frame swap, no fades; still dots with reduce-motion). No bar or percentage (no meters). The words are placeholders for Jackie to rewrite.
- **How it works:** `img()` in js/core.js counts every picture asked for while the code loads; `whenLoaded` in js/main.js starts the game when the count reaches zero and takes `#loading` (index.html) away. A picture that fails to load still counts as arrived, so the screen can never stay up forever (the game says which picture is missing, as before).
- **Why wait for everything, not only the background:** the pictures are all asked for at once, so any of them (a lamp, the curtains, the cat) could be the one that's late.
- `python3 tests/loading_shots.py` holds the room's background back on purpose and checks the loading screen is up and nothing has started, then that the room is drawn once it arrives, on a desktop and an iPhone; pictures in `tests/screenshots/loading/`.

### Trays sit higher, away from the bottom edge (Nov 10)

- The treat tray (and the book tray, which sat the same way) were 6 px from the bottom, so on a phone a drag that started there could swipe the whole app away. Both now sit 14% of the screen height above the bottom (at least 48 px).

### Sloth, PhD delivers by paw, not paper airplane (Nov 10)

- Jackie's art: the sheet "Pixel Sloths with Taped Envelopes" (kept as `sloth_paw_sheet.png`) is cut into `sloth_paw_envelope.png`, `sloth_paw_seed.png`, `sloth_paw_empty.png`, `envelope.png` and `seed_packet.png`. Only the magenta was removed (a flood fill from the edges, then a 2 px peel of the dark-magenta fringe on the outer outline); nothing recolored, redrawn or stretched.
- **Scale: 1/3, nearest-neighbor**, drawn on whole pixels: the envelope paw is 148x95, as tall as the window's lower row of panes; the envelope is 79x53 and the seed packet 59x63 on the sill.
- **Which paw:** the envelope paw brings the seedling note and Sloth's letters; the seed paw brings the seedling (a seed packet the next morning, which you tap to plant in the little pot the usual way); the empty paw reaches in for a seed you send to Sloth, PhD (the packet goes on the sill first). When the paw lets go, the envelope or packet stays on the sill as its own piece.
- **Movement** (js/paw.js): slides in from behind the right edge of the window and the armchair over 3 s, pauses, settles the item one step (4 px) onto the sill, pauses, slides out over 3 s. Whole pixels, no easing, no rotation, never loops. The item rests on the sill at x 425, clear of the armchair.
- **Waits:** only through an open window, never at night, never while dragging, reading a story or in a menu; it comes about 2 s after things are calm. If the curtains close or night falls mid-reach, it finishes at once. Sill items hide behind closed curtains like the sill seedling. A letter or note waits while a packet is on the sill, and the cat doesn't nap on the sill while something from Sloth is there.
- **Words** (Jackie will rewrite): the first time ever, "A very slow paw reaches in through the window…"; then only what it brought: "A seed packet from Sloth, PhD is on the windowsill.", "The seed from Sloth, PhD is planted in the little pot.", "Off it goes to Sloth, PhD." The seed choice's line now reads "the paw comes for it", and the Files note says Sloth, PhD "sends a letter" instead of "a paper airplane". Letters have a paw-print stamp (the portrait slot `sloth_portrait.png` is gone) and are signed "— Sloth, PhD". Journal notes show the envelope.
- Old saves: a note that was on the sill shows as an envelope there. Debug (test mode): **Paw delivery now**.
- Note: a seed sitting in the little pot on the sill (x 400) can overlap an item at x 425; it's rare (a note comes only when one monster is in the room).
### Night windows for spring, summer and autumn (Nov 10)

- At night the window now shows the real-calendar season: spring (blossoms and a crescent moon), summer (a full green tree and a round moon) and autumn (orange leaves and a round moon) use the new pieces; winter keeps its snow. Golden hour and daytime are unchanged, and closed curtains cover the window as before.
- Made from three edited pictures of the night window. Each was lined up with the current night window (best scale and offset against the frame, curtains and armchair), and only the glass was taken: the four rows of panes minus the curtains and the armchair. Everything outside the glass (bars, frame, curtains, chair) is the existing night_window_winter.png pixel for pixel. Files: night_window_spring.png, night_window_summer.png, night_window_autumn.png (254x434, drawn at 318,88 like the others).
- **The pictures needed resizing:** they came as window-only crops at about 3.78x (959x1639), so they were brought down to the window's size with nearest-neighbor sampling only (about 0.264x; exact per image: autumn 0.2656 x 0.2637, spring 0.2646 x 0.2623, summer 0.2647 x 0.2647). No recoloring.
- **Which was which:** the files arrived labelled 1 = spring, 2 = summer, 3 = autumn, but picture 1 shows autumn leaves, 2 spring blossoms and 3 a green summer tree, so each was used for the season it shows.
- `python3 tests/night_window_shots.py` pictures the night room in all four seasons with the curtains open and closed and checks that only the glass differs.

### "Sloth, PhD" never splits across two lines (Nov 10)

- Jackie: on a phone, "Send it to Sloth, PhD" wrapped between "Sloth," and "PhD". The name now always stays on one line, in buttons, captions, cards, the letter's signature and the Files note (a no-wrap span, `tsKeepName` in js/textstyle.js); the words themselves are unchanged. `tests/textstyle_shots.py` checks the seed button.

### The paper-airplane character is Sloth, PhD (Nov 10)

- Jackie renamed the character who sends seedlings and letters by paper airplane (first Doctor Bug, then Slowmallow) to **Sloth, PhD**, everywhere: captions, the note on the sill, the journal's note, the letter and its signature, the seed choice ("Send it to Sloth, PhD"), the Files note, a keepsake's destination ("Staying with Sloth, PhD"), labels, comments, tests and the README. The possessive is "Sloth's" (e.g. "Sloth's paper airplane"), never "Sloth, PhD's". No genders, as always.
- Code names that came from Doctor Bug now say sloth: `slothNote`, `slothJournal`, `slothSend` (saved), `slothAsk`, `slothYes`, `slothNotYet`, `slothCard`, `slothArrive`, `slothReady`, `SLOTH_ASK`, `SLOTH_CHOICES` (`CHOICES.sloth`), `slothLetter`, the `.jslothnote` / `.jslothask` styles, and the smoke case `sloth_seed_next_morning`. `tests/bug_note_shots.py` is now `tests/sloth_note_shots.py`. The real-art slot is **`sloth_portrait.png`** (still off until the art exists: `LETTER_ART.ready` in js/plants.js).
- **Old saves keep working** (`migrateSave` in js/saving.js): `bugNote`, `bugJournal` and `bugSend` move to the new keys, so a note waiting on the sill or in the journal, or a seedling on its way, is still there; a keepsake's or a leaving monster's "Staying with Slowmallow" reads "Staying with Sloth, PhD". Debug presets saved earlier load the same way.
- The old decision entries below keep the old names; they're the history.
- `python3 tests/old_names_test.py` fails if an old name appears in any game file (except that one migration line) or in anything a player can read in play, and checks an old save loads with everything still waiting.

### The cat's patience: a real cat, separate from trust (Nov 10)

- Jackie asked for the cat to behave like a real cat, with a hidden short-term **patience** apart from trust. It lives only on the in-memory cat (js/cat.js, `PAT`): never saved, never shown in play, never changes trust. Full each morning and after every nap; it comes back slowly when the cat is left alone (about 2.5 minutes from empty, faster while it naps).
- **It goes down** when you pet past what the cat likes right now, touch it while it's walking and it didn't want to stop, touch it while it's winding down, or a monster makes a spooky face at it or bounces nearby (the moon bouncer).
- **Pets it enjoys in a row**, by trust: shy none (it only sniffs your hand while awake; asleep, it gets up and goes), trusting 1, fond 3 (as before), adores 5 (new). A full nap or a minute left alone starts the count again.
- **Body language**, existing frames only (sit, pet, walk, loaf, curl), whole-pixel moves, no expression marks: content = leans in (pet frames), purr and **one** heart (fond cats used to get two). The next pet is the fed-up one: it sits back up and its back end (the tail side of the sit frame) twitches 1 px, twice; no heart. The next: it has had enough, gets up (half a second) and walks off.
- **Walking off:** to a spot away from where you touched it and not next to a monster, likelier one it naps in most (this replaces "often somewhere higher"). Then the wind-down: it sits awake facing a little away (the sit frame mirrored so its back end is toward you) with a slow 1 px head bob a few times ("grooming") and a slow blink, then loafs with its eyes open (now 40-70 s, was 60-90), then **curls up** and naps (it used to doze in the loaf). The annoyed, back-turned and grooming frames are no longer used, as the brief limits it to the existing everyday frames.
- **Touched while walking:** trusting or better and patient = it stops, turns to you (pet frames), leans in for one pet with a purr and a heart, and carries on. Shy = no stop, a tiny pause mid-stride, and on it goes. Low patience (or already walking off) = it doesn't stop; it walks a touch quicker (1.35x) somewhere farther from you. **Touched while winding down:** it gets up and moves farther, as before; never a scold.
- **Captions** (placeholders for Jackie to rewrite): "<Cat> has had enough pets for now." only the first walk-off in a play session (the shy cat keeps its "is still shy" tip instead); "<Cat> wanders back over." when it comes back on its own.
- **Coming back:** after a walk-off, once its nap has refilled its patience, a fond cat comes to nap by the monster you're tending, and a cat that adores you comes to sit near the front of the room, beside that monster, for a pet (a sit with a slow blink for 25-40 s, then a doze).
- Never: swatting, hissing, leaving the room, lowering trust, flashing, or a loop that runs by itself.
- **Debug (test mode only):** the status line shows patience as a word (full / some / low); **Annoy cat** and **Calm cat** in the Cat group.

### One text style for every word (Nov 10)

- Jackie asked for one shared look for all the words in the game, with no wording changed. It lives in one place: `css/textstyle.css` and `js/textstyle.js`, used by captions, speech bubbles, choice cards, Slowmallow's notes and letter, the Files drawer, the journal and keepsakes, name tags, ribbons, menus, stories, the treat trays and the FILES placard.
- **Palette:** cream paper `#FFF4E0`, cocoa ink `#5B3A2E` for all text and outlines (never pure black or white), rust `#A84B26` for section headings and small icons, sage `#CFE3C2` for Yes, mint paper `#E4F4EA` with ink `#2F6B57` for Slowmallow only, toffee shadow `#B98C66`, brass `#E2B04A` with ink `#3A2406` for the FILES placard (with a toffee rim and cocoa outline).
- **Each monster's look**, given at birth in order, never shared in the room: grey-blue (star), butter (drop), sage (leaf), clay (triangle), mist (moon), sand (diamond), pond (ring). The cat: `#ECE7E1` / `#4A3F37`, paw. Each has a soft tint (its speech bubbles, its name tag and its ask), a deep name color and a ribbon color. Old saves get theirs the first time they load.
- **Pieces:** the caption pill (cream, at the top) and the speech bubble (the speaker's tint, a stepped pixel tail toward the speaker); names bold in their color with their symbol, in captions, bubbles, letters and the journal. Paper cards for notes and choices; Slowmallow's are mint with a postage stamp (the code-drawn sloth; real art later in the same slot). Book pages with small rust pixel icons over Likes (sun), Friends (heart) and Quirks (star); unseen quirks are a dashed stamp saying "not seen yet". Name tags and ribbons show the symbol, not just the color.
- **Choices:** the same size, side by side; Yes is sage with a pixel check, Not yet is cream with a pixel hourglass, and one short line under each says what happens. Those lines are new words, all in `CHOICES` at the bottom of js/names.js to edit: Slowmallow's seedling (arrives in the morning / waits in the journal), a monster asking to go (leaves tomorrow morning / asks again in a few days), the letter (sets off in the morning / waits in the journal), the seed (flies off right away / both parents head off in the morning, with a plane and a heart instead of check and hourglass), Goodnight (sleep until morning / stay up a while), Good morning (start a new day / stay in the night, with a moon).
- **Shape:** 3px cocoa outline, stepped pixel corners (clip-path, never round), a solid toffee shadow with no blur. Text is left-aligned in captions, bubbles, cards, letters, the Files note and stories; short headings stay centered.
- **Sizes on screen:** headings 24, captions and bubbles 18, notes and the journal 16, small print 14, never smaller; bigger screens scale up from there (captions stay about 31px on a laptop, as decided Nov 4). The journal and the letter are drawn scaled to fit, so their print is enlarged by however much the book is shrunk; on a phone that means whatever doesn't fit on a page moves, whole, to a next spread behind the page arrow (an adult with titles, charms and every quirk), and the Files note fills the left page before the right. A story opened on a phone is at least 430x190px so its words fit.
- **Accessibility, built in, no settings:** every text color is at least 4.5:1 on its paper and every icon at least 3:1 (checked for every look); never color alone; one message at a time (a caption waits while a choice card or the letter is open, then comes back); words appear in three stepped pops (no fade, no typewriter), and with the phone's reduce-motion setting they simply appear (the page turns, the story zoom and the Files opening steps too).
- **Where this differs from the brief:** it was written with Doctor Bug; per Jackie that's Slowmallow now, so the mint paper and stamp are Slowmallow's and the art slot stays `slowmallow_portrait.png`. The caption pill still moves along the top to keep clear of a monster's face (Nov 3) rather than staying exactly centered. The debug drawer keeps its own look (it isn't part of the game).

### The empty Files note never calls a monster "it" (Nov 10)

- "A grown monster might ask to go somewhere it has its heart set on. You can say yes, or ask it to stay a while longer." is now "A grown monster might ask to go somewhere special. You can say yes, or ask the monster to stay a while longer." No genders and no bare "it" in game text.

### The drawer sign says FILES, with bigger letters (Nov 10)

- The sign on the desk drawers now reads **FILES** instead of ARCHIVE, same SNACKS style (cream label, gold rim, wine letters), still over the top drawer's knob and lit like the wood around it.
- The shorter word frees up room, so the letters are as big as the plate allows: 8 pixels tall with 2-pixel stems (they were 6 tall, 1-pixel strokes), and the plate fills more of the drawer face (76x28 room units, was 78x24).
- Player-facing text says "Files" or "the desk", never "archive": the title over the empty drawer's note is now "Files". Code names (`openArchive`, `st.archive`, `ARCHIVE_NOTE`) stay as they are.

### A letter from Slowmallow can ask for a monster (Nov 8)

- Now and then Slowmallow's paper airplane lands on the windowsill, like the seedling note, asking to have an adult come stay. One roll a day: 8%, or 20% for an adult with an evil lean. Never a kid or teen, never within 3 days of another ask, never while another note, ask or seed choice is waiting, and other asks and the seedling note wait for it.
- Tap it for the letter over the room (cream paper, Fredoka) with a stamp in the corner: a code-drawn silhouette of a sloth hanging from a branch, in a dashed frame, for now. When the real art exists, add `slowmallow_portrait.png` to the game folder and set `LETTER_ART.ready` to true in js/plants.js.
- **Yes:** "<Name> will set off in the morning." The next morning `moveOut()` runs with "Staying with Slowmallow". **Not yet:** the letter waits in the journal (accept it anytime) and lands again in 3 days, exactly like the seedling note. No penalty. Tapping away leaves it on the sill.
- The brief was written for Doctor Bug and "the lab"; per Jackie's note those are Slowmallow now, so the placeholder reads "Dear friend, I would love to have <Name> come stay with me for a while. May <Name> come?" (`slowmallowLetter` in js/names.js) and the portrait slot is `slowmallow_portrait.png`.
- Debug (test mode): **Slowmallow letter now**. `python3 tests/letter_shots.py` checks it.

### Two adults can make a seed again, and you choose where it goes (Nov 8)

- Two content adults may make a seed even though they fill the room (this is the only case allowed past `MAX_PLANTS`, and nobody becomes a third monster on the spot). A bubble names both, with two choices.
- **Send it to Slowmallow:** a paper airplane carries the seed up and out of the room; both parents stay. Payment isn't decided, so `seedSentHook` in js/plants.js is the place for it.
- **Keep it here:** "<A> and <B> will head off in the morning to live their own lives." The next morning both move out ("Out living their own lives"), each keepsake still knowing the other, and the seed is on the windowsill with its own name and the usual hello. The curtains open so you can see it.
- **Decisions the brief left open:** the existing code would have bred every day, too often when the choice can send both parents away, so it's one roll a day (1 in 4, friends 2 in 5), adults settle in for 3 days first, and it shares the 3-day gap with the asks to move out. Tapping away decides nothing: the bubble comes back 15 seconds later, and a waiting seed is kept in the save. The caption before the bubble is still "Please excuse the mess."
- Debug (test mode): **Breed now** follows the same flow. `python3 tests/pollination_shots.py` checks it.

### A grown monster can ask to move out (Nov 8)

- Now and then a content adult asks to go somewhere that fits its nature: a cream bubble by the monster, naming it, with Yes / Not yet. The reasons are one easy list per nature, `GO_REASONS` at the top of js/names.js; each has what the ask says and what the keepsake's "Out in the world" page says.
- **How rare:** one roll a day at 1 in 5, after 20 calm seconds; never in the 3 days after any ask; a monster that just grew up settles in for 3 days first. Never a kid or teen, never an unhappy or napping monster, and never while another ask, Slowmallow's note or a seed is waiting.
- **Yes:** "<Name> will set off in the morning." The next morning `moveOut()` runs with that destination. **Not yet** (or tapping away): "<Name> snuggles back in." with a heart and a little bounce, no penalty of any kind; it asks again in 3 days.
- **When the last monster leaves** (the brief didn't cover this): the room stays empty for a moment so the caption can be read, then the start screen offers a new seed. The archive, the cat and the day stay. Why: an empty room with nothing to do would be a dead end.
- Debug (test mode): **Ask to go now**. `python3 tests/go_ask_shots.py` checks all of it.

### The Archive drawer holds the journals of monsters who moved out (Nov 8)

- Tapping the desk drawers opens the Archive over the room in 3 stepped frames, in the same keepsake-book style as the journal: one closed, code-drawn book per monster that has moved out, with its name and a tiny portrait. Two rows of three a page; more than a spread gets arrows, never a scrollbar. Close by tapping outside or the x. Journals keep opening from the name tags; there's no other journal button.
- Tap a book: that monster's journal as a read-only keepsake (no renaming, no charm toggling), frozen as of the day it left, relationship pages included, with a last page "Out in the world": where it went, the day it moved out in words, and an empty spot for postcards. The x goes back to the drawer. Its portrait is drawn healthy and awake, so nobody is thirsty forever.
- Empty drawer: Jackie's note, one paragraph per string in `ARCHIVE_NOTE` at the top of the archive section of js/journal.js (Jackie will rewrite it). The placeholder caption is `moveOutCaption` beside it.
- `moveOut(plant, destination)` is the one way out of the room: it saves a frozen copy in `st.archive`, removes the monster from the room, its name tag and its ribbon, and captions it. The cat's page stays live. Old saves load with an empty archive. Nothing in play calls it yet; for now only debug's **Move out** button does, on the test copy.
- **Two changes from the brief, because Jackie had already decided otherwise:** the brief said to reword the brass JOURNAL placard, but Jackie removed that plate on Nov 8 ("I hate that placement") for the SNACKS-style ARCHIVE sign on the top drawer, so the sign stays. And the brief's note and example said Doctor Bug and "the lab"; Doctor Bug is Slowmallow now and is meant to be less sciencey, so the note says Slowmallow and "anyone staying over".
- `python3 tests/archive_shots.py` checks save/load, the empty note, moving out, the keepsake, debug on the test copy and iPhone fit; pictures in `tests/screenshots/archive/`.

### A seedling on the windowsill hides behind closed curtains (Nov 8)

- Jackie: hide the seedling behind the curtains when they close. The closed curtains hang down past the ledge, so the fabric sweeps over the pot as they close (the same whole-pixel sweep as the curtains themselves), and once they're shut the seedling isn't drawn at all. Opening them shows it again.
- While hidden it can't be petted, dragged or watered; tapping there works the curtains. A seedling on the desk is never hidden, and one you're dragging stays in your hand.
- `python3 tests/curtain_seedling_shots.py` checks it: visible open, mid-sweep, gone when shut (the sill looks exactly like the room with no plant), tapping opens the curtains, back when open, never on the desk.

### The desk drawers are the Archive, not the journal (Nov 8)

- Jackie: the drawers shouldn't hold the current journal; they're the archive of past inhabitants, and with none yet they hold nothing, just a note about what will go in there once something happens.
- Tapping the drawers (or the ARCHIVE sign) opens a book titled Archive with no ribbons. With nobody moved out yet, its only content is the note: "Nothing here yet. When a monster grows up and moves out into the world, that monster's journal pages and keepsakes will be kept here, along with any postcards sent home." (on the left page, clear of the close button).
- The current journal opens from a monster's name tag (bottom left), as before; the cat's pages are a ribbon inside it.
- `st.archive` will list past monsters once moving out exists (nothing adds to it yet).

### Tamagotchi time: monsters grow on the real clock (Nov 8)

- Jackie: growth and progress felt too slow; go Tamagotchi time, but nobody should be sad about losing a monster, being away a while shouldn't be a big deal, and players who keep the game open shouldn't be burdened.
- **Pace** (normal speed, cared for): a seed sprouts in about 5 minutes, a sprout opens its eyes after about an hour, a kid becomes a teen after about a day, a teen grows up after about 2 more days. Growing goes on at night too. `GROW_FOR` in js/core.js.
- **Missing care slows, never stops or hurts.** Thirsty, lonely or in the wrong light, a monster grows at half speed until you help. (Planned as "pauses", but thirst comes back every few minutes, so pausing would make a game left open grow slower than one that's closed. Half speed matches being away, so keeping the game open never does worse.)
- **Away: half speed, at most one age per absence**, so nobody misses a whole age. A background tab counts as away too. Needs only drift to "a little thirsty". Nothing ever dies, gets sick or runs off. Welcome back says what grew ("While you were away: Pip grew into a teen!"), and you see it in the room.
- **Good morning no longer ages anyone.** Bedtime stays as a cozy thing to do; the morning line still names who slept well. Old saves: a night's growing credit counts as at least half the current age already grown.
- `python3 tests/growth_test.py` checks it: on-time growth with a caption, half speed when thirsty, no aging at Good morning, 3 hours away = half speed and one age at most, 5 days away = still one age, a 2-hour background tab counts as away.

### An ARCHIVE sign on the desk drawers replaces the JOURNAL plate (Nov 8)

- Jackie: the JOURNAL plate was so small it went unnoticed, and that spot was disliked. It's gone; instead a sign reading ARCHIVE in the same style as the SNACKS sign (cream label, gold rim, dark outline, clipped corners, wine letters) sits on the top drawer, in front of its knob. Drawn in code on whole 2-unit pixels with 4x6 pixel letters, lit like the drawer wood (darker at night, warm under the desk lamp), moves only with the drawers' idle wiggle, and tapping it opens the journal like the rest of the drawers.

### Doctor Bug is now Slowmallow, a sloth; every chatter line is backed by what you see (Nov 7)

- **Slowmallow** (Jackie): no more Doctor Bug, no doctor or professor. The one who sends seedlings is a cute sloth named Slowmallow (Jackie first wrote Slow Marmamallow, then settled on Slowmallow) who only communicates by paper airplane and is helping monsters become good members of society. Every caption, the journal note and the code comments use the new name; the paper-airplane note on the windowsill is the same.
- **Chatter lines** (follow-up to the welcome-back rule: anything said must be clearly there). Every pet, water and idle line now comes with an action the moment it's said: leaning toward your hand, a sly grin, a proper nod (a one-pixel dip), a wiggle, a bounce, hearts, eyes closed while humming, two little sips, two splashes of drops on the floor, leaning over toward a sleeping cat (only when the cat is asleep). Lines with nothing visible behind them were cut ("counting the books on the shelf", "trying to lick the window", "glows a little", "blows bubbles", "just vibing", "facing a different direction"). The smoke test checks that every line comes with something visible.

### Welcome back tells what happened, and it's really there (Nov 7)

- Jackie: the opening message should tell what happened and how everyone is, in fun ways that fit each monster's temperament, mood and relationships, with clear evidence; anytime a status or action is announced it must be clearly reflected in the room, not just a concept. (Before, one greeting per personality repeated every start, and lines like "is somehow facing a different direction" had nothing behind them.)
- The game now makes it happen, then says it. Away 30+ minutes: everyone got a little thirsty (paler); then, from what's true of them: **friends** scoot close together; **bickering** pairs sulk on opposite sides of the room with grumpy faces, then make up with hearts; a **very chaotic** one is bouncing in moon gravity; a **chaotic** one wandered to a new spot ("wandered over by the window"); after 6+ hours one **dozed off** (Zzz). **The cat** curls up next to the monster it naps with most (or a sweet one once fond of you), naps as far as possible from a **spooky** one, or else naps somewhere named.
- The welcome is a few short captions one after another (the hello, then each thing that happened), not one long one. Friends are placed side by side, never overlapping.
- The **greeting** is a small thing the monster does right then: a heart (sweet), a sly grin (mischievous), a happy wiggle (wiggly), a proper nod (tidy), a bounce (easygoing), about half the time.
- Follow-up: the same rule applies to the idle voice lines (e.g. "is counting the books on the shelf"); each will get a visible action or be cut.

### No "Plant another seed" on the start screen (Nov 7)

- Jackie: a second monster should only come through Doctor Bug. The start screen now offers just Continue and Start over; the second-seed code behind that button is gone. Doctor Bug's paper-airplane note (late teen, one plant, your yes) is the only way a second plant arrives.

### Every relationship gets its own spread in the journal (Nov 7)

- Jackie: in each animal's journal, each relationship should get its own page with fun details and milestones, simple and very nice.
- After an animal's main spread, little pixel arrows at the bottom corners flip to one spread per relationship (same 2-frame page turn): a monster has "Pip & you", "Pip & Mortie" (the other monster) and "Pip & Tofu"; the cat has "Tofu & you" and "Tofu & Pip" for each monster.
- **Left page:** the two side by side (your tiny hand for you, the cat's picture for the cat) with a heart or a squiggle between, and a fun detail: favorite treat and favorite story (the book read most) for you; "Best friends" / "Bicker, then make up" / "Getting to know each other" between monsters; "Naps close by" / "Keeps an eye on each other" / "Still sniffing around" with the cat; the cat's trust words, paws and favorite nap for the cat & you.
- **Right page:** milestones as stamps that fill in (faint until then). You: first hello, first pet, first treat, first story, a favorite treat, right on time, a title, all grown up. Two monsters: met, first bicker, made up, cheered up, friends. A monster & the cat: first sniff hello, napped nearby, cat buddy, spooky face. The cat & you: first sniff, first purr, lets you pet, naps by your monster, adores you.
- Most milestones come from what the save already knows, so old games fill in right away; the new ones (bicker, made up, friends, cheered up, right on time) are remembered from now on with the day they happened (`ms` on each monster). The carafe hand moved to the right page's bottom left to make room for the arrows.

### Tap a book and the story zooms open (Nov 7)

- Jackie: touching a book should open it right away instead of dragging. Tap a book in the tray and the story zooms open from it in three quick steps (small, bigger, full; no smooth scaling). You're the reader: the monster you're tending listens (or the other one if yours is asleep), cozy in the armchair with its eyes closed. Dragging a book onto a particular monster still works.

### Seeing their nature: quirks happen on screen (Nov 7)

- Jackie: the game notes monster behavior but we never see it. Now the quirks are things you watch, not just captions:
  - **Moon bouncer** (new): a really chaotic monster (lawful-chaotic -0.6 or wilder) on the floor sometimes floats up and bounces slowly around the room in moon gravity (a "boing" each landing, drifting side to side, turning at the room's edges), and keeps going until you drag it back down to earth. At bedtime it lands and stays. Caption: "Penny floats off in moon gravity! Drag Penny back down to earth." It's a quirk stamp in the journal.
  - **Bonks things:** it hops over toward the thing it bonks, then back, and the thing bounces as it lands.
  - **Spooky face:** a shark grin at the cat, with a hop toward the cat.
  - **Tidy:** a quick, neat little shuffle in place.
- All moves are whole steps of 5 room units (one art pixel). `python tests/nature_shots.py` pictures them.

### No genders; the cat's page shows how the cat feels about you and each monster (Nov 7)

- **No genders** (Jackie): no he/him/his or she/her in anything the game says. The cat's lines use the cat's name ("Tofu lets you give pets now.", "Tofu is still shy. Let Tofu nap."), the fairy tale's moss sprite is "the sprite", and the debug drawer says "the cat".

- Jackie asked for a place to see Tofu's relationship with her and with the monsters. It's the cat's journal page (the paw ribbon), not a separate menu, and stays wordless with no numbers (the journal's rules).
- **You:** a tiny hand next to the cat's trust paw prints (1-4).
- **Friends:** a tiny portrait of each monster with a heart (the cat naps curled up by it) or a little squiggle (it makes spooky faces at him more than he naps by it); nothing until something has happened between them. Counted from what actually happens in the room (new save field `catBond`).
- The numbers (naps by each monster / spooky faces, nap spots) are in the debug drawer's Cat section, under Trust.

### Story time in the armchair; kids in the armchair; the cat always answers (Nov 7)

- **Reading, take two** (Jackie: the book should open toward us, small enough to see the monster cozy in the chair, and she wants to see the story). A monster given a book hops into the armchair (if nobody's there; otherwise it reads where it is) and a small open book faces us on the right half of the room with the story on its pages, two at a time. Tap the book to turn the page (a 2-frame flip); after the last page it closes, hops back to the shelf, and the monster goes back to where it was. Tap the room to close it early. The in-room open book and rising symbols are gone.
- **The stories** live in **js/stories.js** for Jackie to edit: six short pages each for the fairy tales, the Almanac of Rules, the nonsense poems and the forbidden grimoire, about 12 words a page so they fit on a phone.
- **Any monster can sit in the armchair**, kids too (Jackie chose that), and dropping it anywhere over the chair, back or seat, counts. The cat gets up and leaves when a monster takes the armchair, napping or awake, and doesn't pick it while one is there.
- **The cat always answers a touch:** while walking he stops for a moment (a purr and a heart once he trusts you, a little "hmm" while shy); when he's had enough, a flick and a "hmm" and he keeps going.
- **Kids and big monster food:** a treat dropped on a kid goes back to the tray with "Pip is too little for big monster food."

### Reading: a book tray and a monster that reads in the room (Nov 7)

- Before, a text bubble listed the books, a plain rectangle followed your finger, and the monster just got a caption. Jackie: neither the delivery nor the reading was good.
- **Touch any book** (both bookcases, the book on the milk crate, the book stack by the desk) and a small cream tray of the four special books slides out along the bottom, each a pixel cover drawn in code in its own color with a little emblem. The tap areas are the rows of books only, kept clear of the snail, the boxes, the floor lamp, the snow globe, the moon box and SNACKS; a monster or the cat sitting on the crate or book stack is tapped first.
- **Drag a book to a monster** (kid, teen or adult, awake), same feel as the treat tray. Let go anywhere else and it goes back to the tray; the tray hides after a few seconds or when you tap away.
- **It reads in the room** for about 8 s: an open book in front of its body, a page standing up and landing every 1.4 s (a 2-frame swap), a few tiny symbols from that book rising on whole pixels (hearts, little squares, squiggles, sparkles), eyes softly closed while it listens. Then the book closes and hops back to the shelf. The reading caption and everything reading does (company, nature, pots) are as before.

### The opening, name tags, the cat's name, bigger captions, a wiggle every 10 s (Nov 4)

- **Every new game opens in the daytime with the curtains open and both lamps off** (from the quiz on), whatever the room was doing before.
- **The name comes with the seed.** When you plant (a new game or "Plant another seed"), the seed is named from js/names.js and the hello caption shares it: "Hello, Tuffet Mossmuffin! Your little seed is on the window sill growing, ...". No naming screen (Jackie chose that over a name step in the opening); rename anytime by tapping the name in the journal. When its eyes open: "Tuffet opens its eyes!" (a plant that somehow has no name yet still gets "Hello, ...! Its eyes are open.").
- **Name tags:** each monster's full name sits in a small cream pill at the bottom left of the room, side by side when there are two. Tap one to open that monster's journal page. Hidden on menus and in the journal. (Jackie asked for it, an exception to "no HUD".)
- **The cat has a name** too, from CAT_NAMES in js/names.js (Biscuit, Mochi, Pumpkin...), picked once per game and kept in the save. His journal page shows it (tap to rename) and his captions use it: "Biscuit sniffs your hand. A start.", "Biscuit curled up next to Tuffet.", "Pip made a spooky face at Biscuit. Biscuit is unimpressed and leaves."
- **Captions are about 25% bigger** (31 px at full size, at least 16 px on a phone).
- **Idle wiggle: one item every 10 s.** If something else is moving or you're touching the screen, it tries again a second later instead of waiting the full 10 s.

### Feeding: drag a treat from a tray to a monster (Nov 4)

- Jackie wanted feeding simple and satisfying with a finger or a mouse, with no new art.
- Tapping the SNACKS cabinet shows a small cream tray (the caption pill's style) along the bottom of the room, ending under the cabinet, with the seven treat pictures in a row, each a thumb-sized (46 px) target, no words. It sits low so it never covers a monster's face.
- Press a treat and drag: it follows the finger, drawn a little above and to the side (away from the thumb; the other side when left-handed). Pointer events, so a mouse drag is the same.
- Over a monster that can eat (teen or adult, awake, not full) that monster opens its mouth (mouthB_02). The drop area is its whole body plus a generous margin. Let go there: chomp (closed, open, closed; 110 ms each) with a 2 px squash on the open frame, then its usual treat reaction. Let go anywhere else, or over one that can't eat (a kid, asleep, full): the treat just goes back to the tray.
- The tray hides when you tap away, or 4 seconds after the last treat.
- Removed: the Treat jar bubble, the "Tap a monster to offer the treat." caption, and the unused floor-bouncing treats code. Kids no longer eat treats (teens and adults only, as asked).
- Tests: the smoke test drags a treat to an adult (it eats) and to the floor (it goes back); `python tests/feed_shots.py` does it with a real mouse on a phone-sized screen and saves the tray, the open mouth and the chomp to tests/screenshots/feed/.

### Seedling pot sits on top of the desk (Nov 4)

- The desk spot was at the bottom of the desk's front apron (y 558), so the pot hung in front of the desk and over the chair. It now stands on the desktop just behind the front edge (y 536), between the radio and the desk lamp (x 1268), in the lamp's pool of light. Same depth as the desk (its legs), so it stays about the radio's size.

### Captions always name the monster; seeds can be named early (Nov 4)

- With the cat and often two monsters in the room, a bare "it" doesn't say who. Every caption about a monster now names it first, and "it" only follows a name in the same caption: "Pip is full. Maybe later.", "Shh... Pip is sleeping off a snack.", "Burp! Pip is so full it's dozing off.", "Pip grew a pizza bow!", "Pip listens to the fairy tale, very still.", "A little frown: Pip is lonely. Pet it or read to it.", "Pip is already a teen with big ideas and a bigger pot.", "Pip, no longer a moss-monster? ...", "Hello, Pip Wobblebean! Its eyes are open." Unnamed seeds and sprouts are "The seed" / "The sprout".
- Mornings name who slept well ("Pip slept well...", or "Both slept well and their dreams were..."); before, only the plant you were last tending counted. Welcome back names everyone ("Pip and Mortie missed you."), and being away makes both a little thirsty ("Both got a little thirsty."), not just the one you were tending.
- The cat's lines say "The cat" ("The cat sniffs your hand. A start.", "The cat is still shy. Let it nap."). "Tap a monster to offer the treat." "Doctor Bug will send the seedling over in the morning."
- A new game starts as a seed, which had no name to tap, so Jackie couldn't name her monster. Now the journal title is tappable from the start: a seed or sprout shows its species there, and a tap names it. When its eyes open it keeps that name and the hello uses it.

### Every monster gets a silly, cute name (Nov 4)

- When a seed opens its eyes (becomes a kid) it gets a two-part name, and the caption says hello once: "Its eyes open! Hello, Pip Wobblebean!" The name is saved with the plant and goes everywhere with it (later: freed plants' postcards).
- The names live in **js/names.js** for Jackie to edit: 30 first names and 30 last names in four flavors. The plant's nature picks the flavor (its strongest lean): good = soft and sweet, evil = spooky-cute, lawful = tidy and proper, chaotic = wiggly and zany; an easygoing plant mixes them all. Two plants never share a first name.
- The journal page shows the name on top with the species small underneath. Tap the name to type a new one (16 letters at most); clearing it keeps the old name, with a gentle "Back to Pip Wobblebean." No other naming screens or buttons.
- Captions use the first name where a plant is the subject: voice lines ("Pip waves every leaf at you."), "Right on time! Pip loves a routine.", treat reactions ("Pip loves the cotton candy!", "Pip's usual!", "Pip eats it… politely."), friends and bickering ("Pip and Mortie are friends!"), "The cat curled up next to Pip." Seeds and sprouts are still "it".
- Old saves: plants that already have their eyes open get named quietly on load, with the same generator.

### A JOURNAL placard on the desk drawers (Nov 4; replaced by the ARCHIVE sign Nov 8)

- A little brass nameplate reading JOURNAL sits on the plain bottom panel of the desk drawers (under the third drawer, the only part of the drawer front with room for it; the drawers above each have a knob in the middle). Drawn in code from the room palette on whole 2-unit pixels, dark outline, a tiny 3x5 pixel-font label, four little screws. Why: like the SNACKS sign, it says what the drawers are for without any hint that blinks.
- It never glows, blinks or bounces; it moves only with the journal drawers' idle wiggle.
- Lit like the wood around it: the panel's color in the current room picture (time of day, lamps, curtains) against the daytime picture shades it, so it's darker at night and warm under the desk lamp. When lighting moves into code, it should use the same light as everything else.
- Tapping it opens the journal (it's inside the drawers' tap area). `python tests/placard_shots.py` pictures it at day, golden hour and night with the desk lamp on and off.

### The journal is a keepsake book (Nov 4)

- Jackie wanted the journal to be a cozy keepsake, not a status screen: calm, almost no words, no numbers, no meters, no settings screens, no new art.
- It's an open book over the room (cream pages, dark stepped pixel outline) that fits an iPhone held sideways with no scrolling. Ribbons along the top pick the page: one per plant (two at most) and one for the cat. A page turn is a 2-frame swap (the right page lifts, then lands on the left). Tap outside the book or the little x corner to close.
- **A plant's pages:** its portrait as it looks now (age, face, worn charm, drawn by the game itself), a growth row of five silhouettes from its own sprites filled in up to its age, "Born ..." from its nature; Likes (a sun, cloud or moon for its light, and the last treat it loved, blank until then); Friends (a tiny portrait of the other plant with a heart or a squiggle, or nothing); Titles as stamps once earned; Charms as stickers once earned (tap to wear, tap again to take it off); Quirks as ten stamp spots that fill in the first time each is seen (unseen = faint dashed outline).
- **The cat's pages:** his picture, trust as 1-4 paw prints, his three favorite nap spots as tiny icons (counted from where he settles), and four quirks as stamps (Sniffs hands, Purrs, Plant buddy, Had enough) that fill in the first time you see them.
- A hidden "Out in the world" page waits for later (freed plants, postcards, Doctor Bug's notes); it shows only once it has something in it.
- Gone from the journal: day, time of day, today's checklist, teaching paragraphs, the good/evil and lawful/chaotic bars, "Lately", the x/5 treat counters, Say goodnight (the armchair does that) and pots. All that save data is kept; the debug drawer's plant section shows treat counts, Lately, pots and today's checklist next to the alignment sliders.
- The left-handed carafe setting is a tiny hand inside the back cover (tap to flip); Doctor Bug's "Not yet" note is a little paper airplane tucked beside it.
- New save fields: `fav` (per plant), `catNaps` and `catSeen`.

### Idle wiggle: these seven, more often (Nov 4)

- For now only the floor lamp, desk lamp, snow globe, journal drawers, SNACKS cupboard, carafe and the readable books (the shelf the book menu opens from) wiggle. One at a time, every 30-60 s (was every 2.5-5 minutes), each under half a second (4 frames x 110 ms, one art pixel). Why: Jackie wants the things you can use to gently show themselves more often. The armchair, the shelf plant and the doodad fidgets (snail etc.) are off the list for now; the snow globe is perfect as an interaction as it is.

### Seedling pot sits on the windowsill (Nov 4)

- The windowsill spot was below the ledge (y 564, the bottom of its orange front) and right at the armchair's edge (x 478), so the seedling pot looked like it floated in front of the chair. Now it's on top of the ledge (y 539) in the open middle of the sill (x 400). The cat's sill nap spot uses the same surface, so he sits on the ledge too (he and a seedling never share the sill). Doctor Bug's note moved over to x 452 to stay on the sill.
- Removed the mischievous welcome-back greeting "... acts like it didn't notice you. It noticed." (Jackie asked.)

### The second plant is opt-in: Doctor Bug's note (Nov 4)

- When your only plant is a late teen (it has spent at least one night as a teen, or is already grown), a little pixel paper airplane from Doctor Bug glides onto the windowsill once and sits there. Nothing blinks or loops.
- Tapping it asks "I have a seedling in need of a home. May I send it over?" with **Yes, please** and **Not yet**.
  - Yes: the seed arrives the next morning in the little pot, with "Something taps the window and a seed drifts in on a paper airplane note from Doctor Bug." (A short "Doctor Bug will send it over in the morning." confirms the yes.)
  - Not yet: the note goes into the journal, where "Yes, please" works anytime, and Doctor Bug lands another note in 3 days.
  - Tapping away leaves the note on the sill.
- No note when there are already two plants. Why: Jackie wants nothing to appear without the player agreeing. The old window gift seed is gone. The only other ways to get a second plant are ones you start yourself: "Plant another seed" on the start screen, and the breeding offer (which asks first, and can't happen while two plants fill the room).
- `python tests/bug_note_shots.py` plays the whole flow and saves pictures to tests/screenshots/bug_note/.

### A softer UI look: Fredoka, cream pills (Nov 4)

- Jackie wanted the text bigger, cuter and less 16-bit. All HTML text (captions, bubbles, menus, the journal, buttons) now uses the rounded Google font Fredoka instead of Pixelify Sans, about 20-25% bigger, on phones too. The room and sprites stay pixel art.
- Captions are a cream pill (#fff4e2, text #4a2a4f, 2px #e8c9a8 border, 3px #d9b08c shadow) 3% from the top, still moving aside so they never cover a plant's face. The little tail is now a soft rounded point toward whoever is talking.
- Bubbles are the same cream with 18px corners. Buttons are soft peach/cream pills with no black outline and lift 1px on hover. The debug and full-screen buttons and the debug drawer are rounded to match.
- `python tests/ui_shots.py` checks the look and saves pictures to tests/screenshots/ui/.

### WORKING.md: how every session works (Nov 4)

- WORKING.md in the repo root, read at the start of every session, says: read README.md, RULES.md and DECISIONS.md first; change one thing per request; run tests/smoke_test.py before and after every change and fix what it breaks; show Jackie screenshots; log her decisions here with the reason; commit and push to main only when tests pass. Why: so every session follows the same habits without Jackie repeating them.
- The decisions moved out of README.md into this file so they're easy to find and add to.

### Captions in Jackie's words (Nov 4)

- Every caption now uses Jackie's final wording from her "Monster Plant captions" doc: short, a cozy storybook voice, no game terms or numbers (no good/evil/lawful/chaotic, no "2/5 toward ...", no "counts as company"). The journal holds the mechanics.
- No parenthetical hints like "(New quirk in the journal.)", and nothing flashes in their place.
- After a treat you only see its reaction ("Nom.", "Its favorite!", "It eats it… politely."). Each book has its own line. Mornings say "Morning! Day N." plus a line only after a perfect day; there's no "it would have grown faster with..." line, because that felt like being graded.
- The professor is **Doctor Bug**: the gift seed arrives "on a paper airplane note from Doctor Bug" (still asked in the consent bubble).
- A sprout gets one "A sprout!", not one line per sprout step. A faded charm says "No longer a moss-monster? ..." (the word comes from the treat).
- How long a caption shows: 2 s + 0.3 s a word, so short lines get 3-5 s and the longest 6-8 s (never more).
- Doc lines with no place in the game yet: the too-bright, too-dark, light-spot and "it scooted somewhere shadier" captions were taken out earlier (needs show on the monster, no light text boxes), so they weren't added back. The hunger hint is gone.

### Never more than two plants (Nov 4)

- At most two plants live in the room at once (`MAX_PLANTS` in js/saving.js). The window's gift seed doesn't ask when the room is full, "Plant another" on the start screen hides, and debug won't add a third.
- So two adults no longer make a seed: breeding needs two adults, and that already fills the room. The breeding code stays in place for if the cap ever changes.
- An old save that already has three plants keeps all three (nothing is taken away); no new one comes until there's room.

### Smaller sparkle, close to the plant (Nov 4)

- The sparkle that twinkles when a plant is listening (petted, read to, the cat nearby) is half its old size and tucked against the plant's upper right side, half on the plant. It used to be as big as a kid's face and sat far enough out that an adult's sparkle landed on the plant next to it.

### Fixes: no error box when plants move; slower drying (Nov 4)

- The error box that popped up when plants moved was a real bug: in the code that sends a plant on the floor toward better light, a comment swallowed the line that set up its variables ("bd is not defined"). That stopped the game's update each time, so plants froze for a moment. Fixed; the plant now walks to its light as it should.
- Drying is 3x slower: thirst rises at .11/3 per game minute (was .11). At normal speed the gray starts after ~6 min, it's thirsty after ~8 min and fully gray after ~12 min. Under the little flame it still dries twice as fast.
- The idle wiggle is now one art pixel (5 room units) instead of 1 room unit, which was too small to see, especially on a phone. Still a quick two-frame nudge, one item at a time, at most once every 2.5–5 minutes.
- Radio and pet bed are out of the idle wiggle until they really work (the radio plays and tunes; the pet bed calls the cat). The snow globe, snail and journal keep it.

### Idle wiggle: only things that work (Nov 4)

- **Rule for every future build:** only things that actually work get the idle wiggle. When a coming-soon item is built (radio, snow globe, snail, pet bed, scratcher, journal, seasonal items...), adding it to `IDLE_ITEMS` in js/fidgets.js is part of that build. Don't add anything ahead of time.
- Books: only the four special readable books, never the shelves, the book stack or the crate book.

### The shelf plant rustles (Nov 4)

- The plant on the trinket shelf rustles like the vines instead of bouncing as one piece. A tap nudges the leaves near your finger, and they sway back within about a second. Its pot (whose green diamonds look like leaves) stays still. Its rare idle wiggle moves only its leaves.

### New plants only with your OK (Nov 4)

- Nothing appears out of nowhere. The window's gift seed and a seed your two adults make are both offered in a little bubble by the window ("A little seed is tapping at the window. Plant it in the little pot?" / "Your … and your … made a seed together. Plant it?"), with Yes, plant it and Not now. A seed is planted only on yes.
- Not now, or tapping away, means no seed. The gift seed asks again 3 days later; two adults can make another seed on a later day. It never asks at night, or while you're carrying something or have a menu, a book or the journal open.
- Why: a second plant once appeared while Jackie was in the debug drawer, and it was confusing, not calm.
- Also: when you drag one plant, only that plant follows your finger (before, every plant was drawn following it). The debug drawer's plant tabs show each plant's age, so you can see which one you're changing.

### The old cat is back, for now (Nov 4)

- You missed the old cat (the new one looked warped), so `OLD_CAT=true` in js/cat.js draws the old frames from `old_cat/` again, at their own size on the same perspective curve. The new cat's PNGs are untouched; set `OLD_CAT=false` to bring him back.
- The old cat has 13 frames. Moments that only the new cat had a drawing for borrow the nearest old one: sitting for annoyed, back turned and grooming; his blink-sit for the slow blink; his normal pet frames instead of belly-up. Walking left mirrors his walk, as he used to. His old pet frames have the back-scratcher drawn in, so the separate one is off.
- Everything he does stays the same: naps, trust, the had-enough walk-off, never hidden behind a plant.

### Growing up again: the right light counts, and any tap at night says good morning (Nov 4; growing replaced by Tamagotchi time Nov 8)

- Plants were growing about half as fast as they should. "The right light" only counted for the day when you moved a plant out of bad light, so a plant that sat happily in its right light all day never got it, and topped out at 2 of the 3 needs (about an age every two nights). Now it counts once the plant has spent a little while in its right light that day (LIGHT_OK_FOR = 30 game s, about 15 s at normal speed).
- The goodnight caption says "Click anywhere to sleep until morning", but only the plant or the armchair worked. Now any tap at night (except the lamps and the curtains, which still switch) offers Good morning. Plants only age at Good morning, so a day has to be put to bed (Say goodnight in the journal) for them to grow.
- Bubbles stay inside the room when you tap near an edge.
- `python tests/growth_test.py` checks it: a fully cared-for kid grows overnight, and two nights of light and water grow it again.

### The carafe faces the way it's moving (Nov 4)

- While you carry the carafe, it faces the way it's moving: right = as drawn (spout on the right), left = mirrored. The tilt and pour frames flip with it, so it always pours from the spout on the side it faces, and the drops and the "over the plant" check follow that spout.
- An instant flip, no rotation or turning animation (DS rule). It only turns after moving 12 px the new way (FACE_TURN in js/care.js), so a jiggling or resting finger never flickers it, and it keeps its last facing while held still.
- When picked up it faces away from your thumb (right-handed: left). The left-handed setting still moves it to the up-and-right side of your finger.

### Where each age can go (Nov 4)

- Kids and teens can stand on the floor too: drag them onto the rug. They can also sit on the milk crate or the book stack.
- Adults are too big for the crate and the book stack. Dropped there, they land on the floor; a teen sitting on one that grows up moves down to the floor.
- Teens and adults can sit in the armchair awake: drag them into it. While one sits there, it's theirs: nobody else naps in it, and the cat doesn't take it. Any age can still nap in it when the chair is free.
- Never sharing a space or on top of each other (your rule): one plant per piece of furniture, and a plant only goes where its picture wouldn't overlap another plant's. Drag a plant near a free spot it fits on (the spots glow while you drag) and it sits there; drop it anywhere else and it stands on the nearest clear bit of floor. If there's no clear floor anywhere, it goes back where you picked it up. Seeds never land on a taken pot spot either. Plants walking around on the floor (scooting to their light, wandering) keep to clear floor the same way.
- Plants on the floor scoot toward their light and wander; plants on furniture stay put. The cat curls up next to a plant only when it's on the floor.
- Debug → Plants → Spot picks the floor, crate, book stack or armchair.

### One perspective for every size (Nov 4)

- All the separate size rules are now ONE: each spot has a depth, the row where its furniture touches the floor (the armchair's feet, the book stack's bottom, the crate's bottom, the desk's legs, the wall under the windowsill; on the rug, the plant's own row). One straight-line curve gives the scale: 100% at the front of the rug (918), 63% at the back wall (748). `DEPTH`, `depthK` and `spotDepth` in js/room.js.
- The curve's horizon (464) is set so the armchair comes out at the 66% you OK'd for plants asleep there. A kid in the armchair and a kid on the book stack are now the same size (~198 px). Before, the chair kid was 152 and the book-stack kid was drawn full size.
- At 100%: kid 297, teen 431 (1.45x), adult 565 (1.9x, the same 60% of the room as before). Every kid is the same height; a teen or adult drawn shorter than usual still isn't blown up, so species 4, 6, 15 and 16's teens come out at 1.13–1.36x.
- Seedlings, the cat, the carafe, treats and books all use the same curve. The cat keeps his old front-of-room size; carried things take the depth of the plant you hold them over.
- Kids and seedlings are smaller than before (they sit about 2/3 of the way back); adults at the back of the rug are 72% instead of 90%.
- Debug → World → Depth lines shows each spot's depth and scale.

### Carafe: pours from the left for right-handed play (Nov 3)

- With the phone held sideways in the right hand, the tilt and pour frames used to lean toward your thumb. They're now drawn mirrored (flipped when drawn; `carafe_tilt.png` and `carafe_pour.png` are unchanged), so the spout is on the left.
- The carried carafe sits a little up and to the left of your finger, so your thumb doesn't cover it or the spout.
- The pour frame, the "is it over the plant" check and the drops all follow the spout, not your finger: it waters when the end of the stream is over the plant.
- Journal → Settings → left-handed flips it back: the spout is on the right and the carafe sits up and to the right of your finger. It's one setting for the whole room, and it's saved.

### Captions: a cozy speech bubble that doesn't nag (Nov 3)

- Captions are a cream speech bubble at the top of the room, with a stepped pixel outline (no blur, no shadow). It's small on a phone, never covers a plant's face, and keeps clear of the buttons at the top right. When a plant or the cat is "speaking", a little tail points down at them; tips have no tail. It fades in and out and stays about 1 s per 4 words (at least 3 s).
- One caption manager (`tell` in core.js) decides what shows. Important lines always get through: welcome back, morning, goodnight, a new seed, a new age, pollen, a title, a new trait, the cat's trust milestones. Teaching tips show once ever, remembered in the save. Replies to what you just did can't repeat within 10 minutes. Ambient chatter (voice lines, quirks, friends and bickering) is limited to one every 45-90 s, and none while you're carrying something, dragging, holding a tap, or reading (treat jar, books, journal).
- No line repeats within 10 minutes. Neither does one event however it's worded: bickering, making friends, each plant's quirk. Voice lines come from a shuffle bag that never repeats any of the last 15 picked for that event, and stays quiet when every option was used recently. Why: the old bottom caption repeated itself and talked over everything.

### Debug never changes the real game (Nov 3)

- Opening the debug drawer switches to TEST MODE: the game keeps playing on a copy of the real save, saves go to a separate test slot (`mp-test`), and a red TEST MODE label shows. **Back to my game** brings back the real save and the cat exactly as they were. Anything the game had scheduled for later while testing (a seed arriving after Breed now, a title cheer) is dropped, and test captions are cleared. **Keep these changes in my real game** saves only after a second tap. Why: the old panel changed the real save directly (its Reset even deleted it).
- The drawer is phone-first: it slides in on the right and the room shrinks to fit beside it, so none of the room is covered. Collapsible groups, big touch targets, sliders for numbers. **Hide** shows the room full size with the settings applied. Presets are kept on the device (`mp-presets`), never in the save.

### When the cat has had enough, he leaves like a real cat (Nov 3)

- When he isn't into being touched (shy and napping, or petted more times than he likes), he gives a second of the annoyed look (ears back), then gets up and walks off at his normal pace. He goes to a spot a comfortable way from where you touched him and from the plants, often a higher one (milk crate, book stack, armchair, the windowsill when the curtains are open).
- There he sits awake for 30-90 s: back turned and looking over his shoulder, a little grooming (two frames swapped slowly), back turned again, then sitting with a slow blink now and then. Then he loafs with his eyes open for 60-90 s, and only then dozes off into a real nap.
- Touch him while he's settling and he calmly moves once more: no annoyed look, no penalty. Each move makes the settling at least 10 s longer, so it takes a little longer before he's open to pets again. Trust never goes down. Shy cats still warm up by sniffing your hand when they're awake.

### The cat is never hidden behind a plant (Nov 3)

- Before he takes a nap spot, the game checks his picture there against every plant drawn in front of him, with real pixels, not boxes. If more than 20% of him would be covered, the spot doesn't count. On the rug and next to a plant he slides sideways to where he's in view.
- If a plant moves, scoots, wanders or grows in front of him while he naps, he gets up after a moment and walks somewhere he can be seen. No trust is lost and there's no caption. Walking, he may pass behind a plant, but he never stops there: if his spot got covered on the way, he picks another.

### Calm down: still sleepers, rare Zzz, slower drying (Nov 3)

- The sleeping cat shows ONE picture per pose (curl1, loaf2, side1). Breathing is done in code: once every ~4.6 s his body rises 1 px for about 1.8 s and settles back. Whole pixels, never more than 1 px, and his paws stay on the surface (a row low in his body repeats). Why: swapping between two different drawings about once a second made him look like he was panting.
- Zzz, for the cat and the plants: one single Zzz drifts slowly up (40 px over 4.5 s), fades in, then fades out gently. Each sleeper gets a new one every 12-20 s (random), and never two in the room at once. Why: the constant Zzz loop was busy. The gentle fade is an exception to the no-fades rule, Jackie's call.
- Drying out is half as fast. There was never a separate sun rate: thirst rises at the same speed everywhere, doubled only for the extreme little-flame case, so the base rate was halved. At normal speed, from just watered: it starts graying after about 2 min (was 1), is thirsty after about 2.7 min (was 1.4) and fully gray after about 4 min (was 2). With the little flame, it's half those times.
- The gray comes on gradually in 16 tiny steps instead of 4 visible ones. Watering brings the color back smoothly over 2 s. Still pre-made, cached looks; nothing blends live.

### New cat (Nov 3)

- Jackie's new cat design replaces every old cat frame (old ones in `old_cat/`). Each pose was cut from the sheets by removing the magenta only (outlines kept, no resizing, recoloring or redrawing). Frames that swap (walking, petted, lying on his side, the back-scratcher) share one canvas, lined up on the sheet, so they don't jitter.
- Size is set in code, never by resizing the PNGs: one cat scale (`CAT_K` in js/cat.js) brings him back to the old cat's size in the room. `cat_poses.png` was drawn about 1.2x bigger than `cat_design.png`, so its frames (and the back-scratcher, drawn to match it) get a fixed `POSES_K` on top. That way every frame is the same cat size: sitting and blinking don't jump. He's drawn crisp (no smoothing).
- The back-scratcher is now its own sprite. While he's petted it rests on his head from above right, and its 2 frames swap with the 2 petted frames (a gentle rock). When he adores you (BFF trust) he sometimes rolls belly-up instead, with the scratcher over his tummy.
- Asleep on his side (Nov 3, later): a new 2-frame breathing pair (`cat_side_sheet.png`) replaces the poses-sheet one (kept in `old_cat/` as `*_poses_sheet.png`). It's drawn about 2x bigger, so `SIDE_K` makes him exactly as tall as the sleeper he replaces.
- Loaf: eyes open for a moment after he settles, then dozing (Zzz only once his eyes close). Sitting awake: a slow blink now and then. Walking left uses the drawn left frames. The curled breathing is a real frame now (no 1 px shift).
- Napping next to a plant, he sits far enough away to clear it even belly-up, and when he's on the same line as a plant he's drawn in front of it, never behind. His windowsill spot moved 20 px right so his longest poses stay on the sill. `python tests/cat_shots.py` pictures him in every spot and frame and fails if a cat pixel ever lands on a plant.

### Seedling pot art (Nov 3)

- The code-drawn seed pot is replaced by Jackie's seedling sheet: soil while it's a seed, the first sprout, then the bigger sprout halfway through the sprout stage, each swapping its 2 frames slowly (about every 1.7 s). Cut with the magenta removed only, outlines kept, every frame lined up on the pot's rim and bottom so only the plant moves.
- Drawn at exactly half size in code (`SEED_K`, js/plants.js), never resized: the sheet's pot is 238 px across and baby_01's is 140, so the seedling pot comes out a bit smaller (119), and halving keeps whole pixels crisp. It rests on the windowsill and desk surface lines by its real bottom like every other plant. Thirst gray and sun toast use the same steps as other plants; a leaning sprout moves only above the rim.

### Everything sits on its surface (Nov 3)

- Plants and the cat are placed by their real bottom (the lowest solid pixel row of each picture, measured automatically) on one table of surface lines read from the art (`SURFACE` in room.js): windowsill front edge 564, front of the desk top 558, front of the book on the milk crate 639, front of the top book 652, armchair seat 656, cat bed rim 888, the floor 925; on the rug any y is floor (790 back to 918 front). Why: the audit found kids sinking 9 px into the book stack, every teen and adult floating 3-5 px (4 empty rows under each pot), and the cat floating 5 px on the crate.
- Small leftovers go in one table (`NUDGE`, js/nudges.js), set with the debug Nudge tool. It's empty: nothing needed one.

### Needs show only on the monster (Nov 3)

- Light and water needs show only on the plant, in clear steps that heal in steps: withered (too dark: droops, hunches, curls in, a little dull), burned (too bright: squints, leans away, toasty scorched edges and tips; the flame only for a night-lover left in midday sun a long while), gray (thirsty), and a puddle with a soggy droop (overwatered; dries in 3 steps over 30 s). Why: the plant is the one thing you're watching, and hints on objects pulled the eye away and moved room art.
- Removed every hint on objects (carafe wobble and sparkle, curtain sway, window wobble, bouncing book, rattling jar) and the debug "Hints" setting that drove them.
- No light text in play (Nov 3): dropping or moving a plant no longer captions its spot, and there are no too bright, flame, too dark or scooted captions. Why: the placement captions described the spot by day with the curtains open, so a plant in the sun patch with the sheers closed was told it would get too bright. The journal still describes the spot, and the debug Light map shows the light right now.
- Usable things get a rare 1 px idle wiggle instead (once every 2.5 to 5 minutes at most, one at a time, never while touching). Books are left out until the four special books are placed in the room.
- RULES.md now holds the rules (was a README section).

### No curtain wiggle (Nov 3)

- Removed the curtain wiggle that hinted at wrong light: it shifted the whole closed-curtain layer, dragging armchair pixels and showing the pulled-back curtain behind. Light problems show only in the plant (squinting, leaning, hunching). The closed-curtain pieces were trimmed to fabric only (armchair, pillow, throw and wall pixels made transparent; outlines kept).

### Thirst fades to gray (Nov 3)

- A thirsty plant's colors drain in 4 clear steps (pre-made, cached levels, no live blending) until a parched plant is fully gray, pot and all; black outlines stay black. Watering brings the color back one step every half second. Seedlings and kids too. Why: gray reads as "needs something" at a glance and works for every plant color, where browning only touched green leaves.

### Light zones and grow lights (Nov 3)

- Light comes from what you can see: the window's sun patch, a grow-light circle around each lamp that's on, soft room light elsewhere. Why: a shade plant on the left of the rug used to read "too hot" at midday with no sun on it, and the desk lamp did nothing.
- Too much light is gentle: only the midday sun patch (curtains open) or right under a lamp, only for shade and night plants, and only after a while (about 20 seconds at normal speed). It squints and leans away first; the little flame is only for a night-lover left in midday sun much longer. Moving it out fixes it right away. Grown plants scoot off on their own before it gets that far.
- Lamps are grow lights, so sun-lovers grow with the curtains closed or after dark.
- Built so the coming code lighting (one base room + time-of-day grade + window patch + soft lamp glows) draws the same sources plants feel.

**Personality (Nov 3)**
- Every seed is **born with a nature** (leans good/evil and/or lawful/chaotic), shown when its eyes open. Treats, books and play push it; each night it drifts back toward its nature. Why: so personality shows from day one instead of a bland neutral.
- **Signature moves** (pixel offsets only): chaotic hop, lawful bow, good sway, evil grin + shiver, neutral bob.
- **Quirks** every ~1–1.5 min: chaotic bonks doodads / wanders; lawful tidies and loves its usual watering time; good keeps the cat company / cheers up lonely plants; evil makes spooky faces at the cat. Logged in the journal.
- **Treat likes** (the Cult of the Lamb flip): good loves wholesome, evil loves dark, lawful loves its usual, chaotic loves something new. Never refused for personality.
- **Friends and bickering:** same side = friends (moves together, hearts, pollinate sooner); opposite sides = bicker, grumpy faces, then always make up.
- **Titles** for reaching an extreme: Little saint, Little menace, Stickler, Wild child.
- Researched: Animal Crossing personalities, Black & White alignment looks, Cult of the Lamb traits, Petz "constrained randomness" and "never punish the player".

**Several plants and breeding (Nov 3)**
- Up to **3 plants** (to be raised). A seed drifts in through the open window once the first plant is a teen; "Plant another seed" on the start screen. Tap a plant to tend it.
- Two content adults **cross-pollinate** once a day; the baby takes body, eyes and light preference each from one parent (8% chance of something new) and a nature from both. Color/pattern genes not built yet; charms not inherited.
- Only one plant sleeps in the armchair; others sleep in place.

**Moving around the room (Nov 3)**
- Teens/adults can sit anywhere on the rug, front to back. Back of the room = 90% size and a little shadier, but **always clearly bigger than a kid** (teen ≥ 1.45×, adult ≥ 1.9× kid height).
- Plants stand side by side, never hidden behind each other.
- A plant in the wrong light for a while **scoots itself** to a spot it likes.

**The cat (Nov 3)**
- Naps all over (bed, rug, armchair, windowsill, milk crate, book stack), wakes, yawns, walks.
- **Earned affection:** shy → trusting → fond → adores you. Shy cats leave if petted asleep; say hi when it's awake. Fond cats nap beside teens/adults (petting it there makes the plant happy too). Adoring cats wait by the plant when you come back. Small daily cap; never goes down.
- Never on the windowsill when the curtains are closed; never in the armchair when a plant sleeps there.
- **Welcome back** when you return: the plant bounces, and a caption says what happened while you were away.

**Ages and sizes (Nov 3)**
- Five ages: seed → sprout → kid → teen → adult. Teens 45% of room height, adults 60%. Squat drawings aren't blown up. Face kit 0.54× original (eyes made smaller twice).
- Grows one age per night when well cared for. (Replaced Nov 8 by Tamagotchi time: growing on the real clock.)

**Treats and charms (Nov 2–3)**
- Food is optional; needs are water, light and company. Treats pop out of the SNACKS cabinet into your hand; tap the plant: it eats, then **pops** (boing + hearts). Too full = it refuses; a burp and a one-minute nap.
- 5 servings of one treat earns its **charm**, pinned at the side of the head. Give it at least every 3 days or it drifts away overnight; it comes back after 3 servings.
- Rejected art: cotton-candy hat ("brains"), gardener straw hat ("mobile gaming"), a plants-with-accessories sheet.

**Pots (Nov 3): PAUSED**
- Every plant keeps its cream-and-blue-check starter pot (`POTS_ON=false`). Compositing plants into other pots failed (floating, sinking, lost outlines). Future plan: Jackie draws each plant in each pot.

**Room (Nov 2–3)**
- Pink book room: day / golden hour / night swaps, floor and desk lamps toggle, curtains slide in steps, real-calendar seasons in the window.
- Tools live in the room: carafe on the stool = watering, SNACKS cabinet = treats, four special books = reading (good/evil, lawful/chaotic), desk drawers = journal, armchair = goodnight.
- Grown plants used to sit at the front edges so tools stay reachable; now free placement on the rug.
