# Monster Plant

A cozy monster-plant raising game: Tamagotchi meets Little Shop of Horrors, with a touch of Animal Crossing and Cult of the Lamb. Maximum ASMR, earned dopamine hits, lots of grace, crazy cute.

© 2026 Jackie Carlson. All rights reserved. Code and art may not be reused without permission.

---

## Play it

- **On the web:** open `index.html` from the hosted site (GitHub Pages).
- **On iPhone, full screen:** open the site in Safari → Share → **Add to Home Screen**. It gets its own icon and opens without browser bars. Hold the phone sideways.
- **On Android:** open in Chrome → menu → **Install app** (or Add to Home screen).
- Saves live in each browser on each device (localStorage key `mp-proto-v2`). The Home Screen app and Safari keep separate saves.
- **Debug drawer** (top right, "debug"): opening it switches to **TEST MODE**, a copy of your real save at that moment. Everything you change happens on the copy, and a red TEST MODE label shows. **Back to my game** brings your real game back exactly as it was. **Keep these changes in my real game** saves them for real, only after a second tap. It slides in on the right, and the room shrinks to fit beside it; **Hide** tucks it away so you can look at the room with your settings (the ◂ debug tab brings it back). Live controls, in collapsible groups: **World** (time of day slider and buttons, season auto/override, day, speed, pause time, clock, curtains, every lamp, light map); **Plants** (a tab per plant; species, age, eyes, light preference, good/evil and lawful/chaotic now and born-with, thirst, lonely, fullness, nap, spot or rug x/y, charms, titles, reset quirks, grow one age, add/remove, make two adults, breed now, end day; changing species or age keeps it the same plant); **Cat** (trust with its level name, state, send to any spot, hold any pose); **Effects and reactions** (on/off and replay for each effect, plus the plant moves, boing, idle wiggle, cat purr); **Presets** (built-in setups, save/load your own on this device, reset to your real save, brand-new game in test mode); **Nudge** (the 1 px positions tool; that table is saved on this device for every game, not in your save).

## Put it online (GitHub Pages)

1. On GitHub, make a **public** repository called `monster-plant`. License: **None**.
2. Upload every file in this folder (keep them all at the top level, plus the `js` and `tests` folders). GitHub's web uploader takes about 100 files at a time, so drag them in 3 batches, or use GitHub Desktop to add the whole folder at once.
3. Repository **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder = `/ (root)`. Save.
4. After a minute or two the site is at `https://<your-account>.github.io/monster-plant/`.
5. To update: upload changed files (same names) and commit. Pages republishes on its own.

`.nojekyll` tells GitHub Pages to serve files as they are. Keep it.

## Run it on a computer

From this folder: `python3 -m http.server 8765`, then open `http://localhost:8765/`.
(Opening `index.html` directly as a file mostly works, but some browsers block image reads that the fidgets use.)

## Tests

```
pip install playwright && python -m playwright install chromium
python tests/smoke_test.py
```

Checks a brand-new game, an old save, the gift seed, breeding, night/morning, and the iPhone landscape view. **Run it after every change, before playing.**

Run `python tests/smoke_test.py` from this folder: it plays 16 cases (also a teen, a kid on the book stack, the cat in every nap spot, curtains closed with lamps off) for a minute of game time each at speed 20 in about 20 seconds, fails on any error or missing image, and saves a screenshot of each case to `tests/screenshots/` (kept on your computer, not uploaded).

`python tests/light_map_shots.py` saves the Light map at morning, noon, golden hour and night, curtains open/closed, lamps on/off, to `tests/screenshots/lightmap/` (with a contact sheet).

`python tests/thirst_shots.py` checks and pictures thirst from full color to fully gray for an adult, a kid and a sprout (the gray comes on gradually), and that watering brings the color back smoothly over about 2 seconds; saved to `tests/screenshots/thirst/`.

`python tests/cat_cover.py` puts plants in every spot (and right in front of the crate, book stack, armchair and cat bed), lets the cat pick and settle again and again, and fails if he's ever more than 20% covered. It also checks that he moves when a plant comes in front of him while he naps.

`python tests/cat_huff.py` plays the cat having had enough (petted too many times, touched again while settling, shy) and saves a picture of every step to `tests/screenshots/huff/`.

`python tests/debug_test.py` opens the debug drawer on an iPhone 13 held sideways, works a control in every group, and fails if the real save changes by a single byte during TEST MODE. It also checks that Back to my game brings the real game back exactly, and that Keep saves only after a second tap. Screenshots go to `tests/screenshots/debug/`.

`python tests/placement_test.py` drags plants with the mouse. It checks that a kid goes from the book stack to the rug and a teen from the rug onto the crate. An adult dropped on the book stack lands on the floor; an adult in the armchair sits there awake. A teen can't take the armchair from a napping kid, two plants can't share the crate, and a teen on the crate that grows up moves to the floor. Drops onto an occupied book stack, armchair or bit of floor never leave two plants overlapping; with no clear floor, the plant goes back. Screenshots go to `tests/screenshots/placement/`. If another copy of the game is running its tests at the same time, use another port: `MP_PORT=8791 python tests/placement_test.py`.

`python tests/perspective_shots.py` puts a seedling, a kid, a teen, an adult and the cat at every spot and lines them up at the same scale in `tests/screenshots/perspective/every_spot.png`, plus two kids asleep (armchair and book stack) and the debug Depth lines view. It checks that everything follows one depth curve, that a teen is 1.45x a kid and an adult 1.9x at every depth, and that the two sleeping kids are the same size.

`python tests/carafe_test.py` carries the carafe on a phone held sideways over a kid and an adult, right- and left-handed. It checks that the tilt and pour frames are mirrored for right-handed play, the carafe sits up and to the side of the finger, a tap waters the plant only when the spout is over it, the drops fall under the spout, and the journal's left-handed setting flips everything back. Screenshots go to `tests/screenshots/carafe/`.

`python tests/caption_test.py` checks the caption bubble on a phone and a laptop, day and night (top of the room, never over a plant's face or the buttons, a tail only for speakers, reading time). It also checks the rules (10-minute repeats, once-ever tips, ambient pacing, important lines) and prints every line from an hour of busy play with how often it showed. Screenshots go to `tests/screenshots/captions/`.

`python tests/calm_shots.py` plays the sleeping cat (each nap pose) next to a sleeping plant for 3 minutes each at normal speed and checks the calm-down rules: one still frame per sleeping pose, a 1 px breath every ~4.6 s, one Zzz at a time, every 12-20 s per sleeper. It also times how fast a plant dries in full sun. Pictures go to `tests/screenshots/calm/`.

`python tests/curtain_shots.py` checks closed curtains at day, golden hour and night with a plant in the wrong light: the plant shows it, and the curtains stay perfectly still; saved to `tests/screenshots/curtains/`.

`python tests/needs_shots.py` checks and pictures every need state on one plant, step by step (withered, burned, gray, puddle) and that each heals in steps, plus the idle wiggle rules (rare, 1 px, never while touching, never books); saved to `tests/screenshots/needs/` with a sheet of everything that can wiggle.

`python tests/cat_shots.py` saves the cat in every spot (bed, rug, armchair, windowsill, milk crate, book stack, next to a plant, walking) in every frame (petted with the back-scratcher and belly-up too) to `tests/screenshots/cat/`, and fails if he ever overlaps a plant.

`python tests/seedling_shots.py` pictures the seedling pot at every stage and frame on the windowsill and the desk, checks it rests on the surface line and the frames line up, and compares its size to baby_01; saved to `tests/screenshots/seedlings/` (committed).

`python tests/position_audit.py` renders every species at every age in every spot, and the cat in every nap spot and pose, measures whether each pot (or the cat) rests on its surface, floats or sinks, and saves contact sheets plus `off_by_more_than_2px.txt` to `tests/screenshots/positions/` (these are committed).

---

## How it's built

- One page: `index.html` holds the HTML and CSS, then loads the game code from the `js` folder. Everything else is art.
- The code is split into sections, one file each. They are plain scripts that share everything, loaded in this order (`main.js` must stay last, because it starts the game):

  | File | What |
  | --- | --- |
  | `core.js` | Canvas and screen fitting, image loading, errors, palette, captions and bubbles, effects, full screen |
  | `audio.js` | The little synth sounds (`sfx`) |
  | `saving.js` | The save (`st`), shared room keys (`GLOBAL`), swapping plants in and out, loading old saves |
  | `nudges.js` | Small per-species and per-frame position fixes (`NUDGE`), set with the debug Nudge tool |
  | `room.js` | Room pictures, seasons, curtains, lamps, time of day, spots, drawing each frame |
  | `light.js` | Light zones: the window's sun patch, lamp grow lights, room light; what plants feel (`lightInfo`) and the shapes to draw (`lightSources`) |
  | `plants.js` | Ages, sprites, faces, charms, pots (paused), needs, scooting, personality, friends, titles, seeds and breeding |
  | `care.js` | Watering, treats, books, petting |
  | `cat.js` | The cat: naps, walks, trust, petting |
  | `fidgets.js` | Springy props, snow globe, vines, book spines, bouncing treats (sound slots `fplay`) |
  | `journal.js` | The desk-drawer journal |
  | `input.js` | Taps, drags, and what each spot in the room does |
  | `start.js` | Title screen, seed quiz, welcome back, goodnight and morning |
  | `debug.js` | The debug drawer and TEST MODE (a copy of the save; the real one is never touched), the Light map, the Nudge tool |
  | `main.js` | The game loop; starts everything |
- The room is drawn at 1670 × 942 and scaled to fit the screen (whole room always visible).

### Key code ideas

- `st` = the save. It holds the **active plant's** fields plus shared room state (time, lamps, curtains, cat trust...). Other plants wait in `st.others`; `eachPlant()` swaps each one in so every plant function works on whichever plant is swapped in. Shared keys are listed in `GLOBAL`. `withPlant(id, f)` runs code on one specific plant.
- Five ages: internal stage numbers `0` seed, `1` sprout, `4` kid, `6` teen, `8` adult (`NEXT`, `AGES`). File names still say `baby_` (kid) and `elder_` (old stand-ins).
- Spots: seed = windowsill or desk; kid = milk crate or book stack; teen/adult = anywhere on the rug (`st.free`, depth-scaled).
- Room scenes: `ROOMS` (day/golden/night base), `MIX` (exact lamp/curtain pictures), `LOFF` lamp-off cut-outs, `CURTS` curtain layers, `WIN_SEASON` window pieces.
- Sound: named slots (`sfx(...)`, `fplay(...)`) are ready for Garry's sounds.

### File map

| Files | What |
| --- | --- |
| `room_day/golden/night.png`, `room_<time>_[closed_]floorOn/Off_deskOn/Off.png` | Whole-room pictures |
| `<time>_floorlamp_off.png`, `<time>_desklamp_off.png`, `<time>_curtains_closed.png` | Lamp and curtain pieces |
| `day_window_<season>.png`, `night_window_winter.png` | Season windows (drawn at 318,88) |
| `seedling_soil1/2.png`, `seedling_sprout1/2.png`, `seedling_bigsprout1/2.png` | Seedling pot: seed (soil), first sprout, bigger sprout, 2 frames each (cut from `seedling_sheet.png`) |
| `baby_01..16.png`, `baby_NN_sleep.png` | Kids (+ sleeping) |
| `teen_01..16.png`, `adult_01..16.png` | Teens and adults |
| `elder_01..16.png` | Old stand-ins (fallback only) |
| `eyes_NN_open/blink.png`, `mouthB_01..12.png` | Face kit for teens and adults (`mouth_NN` = older set, unused) |
| `cat_*.png` | Cat (Nov 3 redesign, cut from `cat_design.png`, `cat_poses.png`, `cat_backscratcher.png`): sit1/sit2 (blink), curl1/curl2 (breathing), loaf1 (eyes open)/loaf2 (dozing), side1/side2 (asleep on his side, from `cat_side_sheet.png`), pet1/pet2, belly (belly-up roll), walk1/walk2 (right), walkL1/walkL2 (left), yawn, scratcher1/scratcher2 (the back-scratcher), and extras for jumping, play and "had enough": leap_r/leap_l, playbow, pounce, stalk, groom1/groom2, stand_side, stand_front, annoyed, back |
| `old_cat/` | The old cat frames (kept, unused) |
| `charm_*.png` | Charms earned with treats |
| `treat_*.png`, `carafe_up/tilt/pour.png` | Things you carry |
| `fx_*.png` | Effects (2 frames each): hearts, Zzz, sparkles, drops, puddle, flames, sweat... |
| `pot_*.png`, `topper_*.png` | Paused (kept for later) |
| `books_special.png`, `stool_empty.png`, `curtains_closed_layer.png`, `lampoff_*.png` | Room pieces |
| `icon-*.png`, `apple-touch-icon.png`, `manifest.webmanifest` | Home-screen app files |

---

## RULES

Jackie's non-negotiables live in [RULES.md](RULES.md). Read them before changing anything.

## DECISIONS (newest first, with why)

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

- Nothing appears out of nowhere. The window's gift seed and a seed your two adults make are both offered in a little bubble by the window ("Something taps the window and a seed drifts in on a paper airplane note from Doctor Bug. Plant it in the little pot?" / "Your … and your … made a seed together. Plant it?"), with Yes, plant it and Not now. A seed is planted only on yes.
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

## Open / next

See the build checklist doc (Claude Docs): lighting and season windows, plants beyond 3, smoother grabbing, kid on the book stack, seedling pot + windowsill placement, cat interactions, pots per plant, charm spots per adult, more fun feeding, then the hand-drawn pixel-accurate art pass.

**Not now:** App Store version (Capacitor), Garry's sounds and music, color/pattern genes, snow globe memories, radio stations, the four books' special effects, a second room.
