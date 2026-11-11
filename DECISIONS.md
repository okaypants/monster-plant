# DECISIONS (newest first, with why)

Everything Jackie has decided about Monster Plant, with the reason. Add new entries at the top. The rules that never change are in [RULES.md](RULES.md).

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
