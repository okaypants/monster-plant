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

`python tests/names_shots.py` lets a sprout open its eyes on a phone held sideways, checks the hello caption has its new name, and shows the journal page with the name on top; saved to `tests/screenshots/names/`. The smoke test also checks old saves get named, two plants never share a first name, and renaming in the journal (16 letters, cleared = back to the old name).

`python tests/placard_shots.py` pictures the JOURNAL nameplate on the desk drawers at day, golden hour and night (desk lamp on and off), checks it's lit like the wood around it, and that tapping it opens the journal; saved to `tests/screenshots/placard/`.

`python tests/journal_shots.py` opens the keepsake journal on an iPhone 13 held sideways (a kid's page; an adult with titles, charms and quirks; two friends; the cat at low and high trust), checks the book fits with nothing scrolling, and saves pictures to `tests/screenshots/journal/`. The smoke test also opens it with one plant, two plants and an old save, turns pages with the ribbons, and wears and takes off a charm.

`python tests/bug_note_shots.py` plays Doctor Bug's note (lands on the sill for a late teen, the question, "Not yet" into the journal, the seed the next morning) and saves pictures to `tests/screenshots/bug_note/`.

`python tests/ui_shots.py` checks the soft UI look (Fredoka text, cream caption pill, rounded bubbles, outline-free pill buttons) and saves the start screen, a caption, the treat jar bubble and the journal, laptop and phone, to `tests/screenshots/ui/`.

`python tests/light_map_shots.py` saves the Light map at morning, noon, golden hour and night, curtains open/closed, lamps on/off, to `tests/screenshots/lightmap/` (with a contact sheet).

`python tests/thirst_shots.py` checks and pictures thirst from full color to fully gray for an adult, a kid and a sprout (the gray comes on gradually), and that watering brings the color back smoothly over about 2 seconds; saved to `tests/screenshots/thirst/`.

`python tests/cat_cover.py` puts plants in every spot (and right in front of the crate, book stack, armchair and cat bed), lets the cat pick and settle again and again, and fails if he's ever more than 20% covered. It also checks that he moves when a plant comes in front of him while he naps.

`python tests/cat_huff.py` plays the cat having had enough (petted too many times, touched again while settling, shy) and saves a picture of every step to `tests/screenshots/huff/`.

`python tests/debug_test.py` opens the debug drawer on an iPhone 13 held sideways, works a control in every group, and fails if the real save changes by a single byte during TEST MODE. It also checks that Back to my game brings the real game back exactly, and that Keep saves only after a second tap. Screenshots go to `tests/screenshots/debug/`.

`python tests/placement_test.py` drags plants with the mouse. It checks that a kid goes from the book stack to the rug and a teen from the rug onto the crate. An adult dropped on the book stack lands on the floor; an adult in the armchair sits there awake. A teen can't take the armchair from a napping kid, two plants can't share the crate, and a teen on the crate that grows up moves to the floor. Drops onto an occupied book stack, armchair or bit of floor never leave two plants overlapping; with no clear floor, the plant goes back. Screenshots go to `tests/screenshots/placement/`. If another copy of the game is running its tests at the same time, use another port: `MP_PORT=8791 python tests/placement_test.py`.

`python tests/perspective_shots.py` puts a seedling, a kid, a teen, an adult and the cat at every spot and lines them up at the same scale in `tests/screenshots/perspective/every_spot.png`, plus two kids asleep (armchair and book stack) and the debug Depth lines view. It checks that everything follows one depth curve, that a teen is 1.45x a kid and an adult 1.9x at every depth, and that the two sleeping kids are the same size.

`python tests/carafe_test.py` carries the carafe on a phone held sideways over a kid and an adult, right- and left-handed (switched with the tiny hand inside the journal's back cover). It checks that the tilt and pour frames are mirrored for right-handed play, the carafe sits up and to the side of the finger, a tap waters the plant only when the spout is over it, the drops fall under the spout, and the journal's left-handed setting flips everything back. Screenshots go to `tests/screenshots/carafe/`.

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
  | `names.js` | The monsters' names: first and last name lists by nature (edit freely) and the name generator |
  | `journal.js` | The desk-drawer journal: a keepsake book with ribbons (a page per plant, one for the cat), page turns, charms, the carafe-hand icon |
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

## DECISIONS

Every decision, newest first and with the reason, lives in [DECISIONS.md](DECISIONS.md).

## Open / next

See the build checklist doc (Claude Docs): lighting and season windows, plants beyond 3, smoother grabbing, kid on the book stack, seedling pot + windowsill placement, cat interactions, pots per plant, charm spots per adult, more fun feeding, then the hand-drawn pixel-accurate art pass.

**Not now:** App Store version (Capacitor), Garry's sounds and music, color/pattern genes, snow globe memories, radio stations, the four books' special effects, a second room.
