# DECISIONS (newest first, with why)

Everything Jackie has decided about Monster Plant, with the reason. Add new entries at the top. The rules that never change are in [RULES.md](RULES.md).

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

### A JOURNAL placard on the desk drawers (Nov 4)

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

### CLAUDE.md: how every session works (Nov 4)

- CLAUDE.md in the repo root, which Claude Code reads at the start of every session, says: read README.md, RULES.md and DECISIONS.md first; change one thing per request; run tests/smoke_test.py before and after every change and fix what it breaks; show Jackie screenshots; log her decisions here with the reason; commit and push to main only when tests pass. Why: so every session follows the same habits without Jackie repeating them.
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

### Growing up again: the right light counts, and any tap at night says good morning (Nov 4)

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
- Grows one age per night when well cared for.

**Treats and charms (Nov 2–3)**
- Food is optional; needs are water, light and company. Treats pop out of the SNACKS cabinet into your hand; tap the plant: it eats, then **pops** (boing + hearts). Too full = it refuses; a burp and a one-minute nap.
- 5 servings of one treat earns its **charm**, pinned at the side of the head. Give it at least every 3 days or it drifts away overnight; it comes back after 3 servings.
- Rejected art: cotton-candy hat ("brains"), gardener straw hat ("mobile gaming"), ChatGPT plants-with-accessories sheet.

**Pots (Nov 3): PAUSED**
- Every plant keeps its cream-and-blue-check starter pot (`POTS_ON=false`). Compositing plants into other pots failed (floating, sinking, lost outlines). Future plan: Jackie draws each plant in each pot.

**Room (Nov 2–3)**
- Pink book room: day / golden hour / night swaps, floor and desk lamps toggle, curtains slide in steps, real-calendar seasons in the window.
- Tools live in the room: carafe on the stool = watering, SNACKS cabinet = treats, four special books = reading (good/evil, lawful/chaotic), desk drawers = journal, armchair = goodnight.
- Grown plants used to sit at the front edges so tools stay reachable; now free placement on the rug.
