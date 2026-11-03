# Monster Plant

A cozy monster-plant raising game: Tamagotchi meets Little Shop of Horrors, with a touch of Animal Crossing and Cult of the Lamb. Maximum ASMR, earned dopamine hits, lots of grace, crazy cute.

© 2026 Jackie Carlson. All rights reserved. Code and art may not be reused without permission.

---

## Play it

- **On the web:** open `index.html` from the hosted site (GitHub Pages).
- **On iPhone, full screen:** open the site in Safari → Share → **Add to Home Screen**. It gets its own icon and opens without browser bars. Hold the phone sideways.
- **On Android:** open in Chrome → menu → **Install app** (or Add to Home screen).
- Saves live in each browser on each device (localStorage key `mp-proto-v2`). The Home Screen app and Safari keep separate saves.
- **Debug panel** (top right, "debug"): species, age, speed, time mode, hints, eye style, disposition, light preference, End day, Cat trust +, Add adult, Breed now, Light map (the light zones: the window's sun patch, lamp grow-light circles, and how much light each spot gets right now, with each plant's needs), Reset.

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

`python tests/thirst_shots.py` checks and pictures every thirst step (full color to fully gray) for an adult, a kid and a sprout, and that watering brings the color back one step every half second; saved to `tests/screenshots/thirst/`.

`python tests/curtain_shots.py` checks closed curtains at day, golden hour and night with a plant in the wrong light: the plant shows it, and the curtains stay perfectly still; saved to `tests/screenshots/curtains/`.

---

## How it's built

- One page: `index.html` holds the HTML and CSS, then loads the game code from the `js` folder. Everything else is art.
- The code is split into sections, one file each. They are plain scripts that share everything, loaded in this order (`main.js` must stay last, because it starts the game):

  | File | What |
  | --- | --- |
  | `core.js` | Canvas and screen fitting, image loading, errors, palette, captions and bubbles, effects, full screen |
  | `audio.js` | The little synth sounds (`sfx`) |
  | `saving.js` | The save (`st`), shared room keys (`GLOBAL`), swapping plants in and out, loading old saves |
  | `room.js` | Room pictures, seasons, curtains, lamps, time of day, spots, drawing each frame |
  | `light.js` | Light zones: the window's sun patch, lamp grow lights, room light; what plants feel (`lightInfo`) and the shapes to draw (`lightSources`) |
  | `plants.js` | Ages, sprites, faces, charms, pots (paused), needs, scooting, personality, friends, titles, seeds and breeding |
  | `care.js` | Watering, treats, books, petting |
  | `cat.js` | The cat: naps, walks, trust, petting |
  | `fidgets.js` | Springy props, snow globe, vines, book spines, bouncing treats (sound slots `fplay`) |
  | `journal.js` | The desk-drawer journal |
  | `input.js` | Taps, drags, and what each spot in the room does |
  | `start.js` | Title screen, seed quiz, welcome back, goodnight and morning |
  | `debug.js` | The debug panel |
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
| `baby_01..16.png`, `baby_NN_sleep.png` | Kids (+ sleeping) |
| `teen_01..16.png`, `adult_01..16.png` | Teens and adults |
| `elder_01..16.png` | Old stand-ins (fallback only) |
| `eyes_NN_open/blink.png`, `mouthB_01..12.png` | Face kit for teens and adults (`mouth_NN` = older set, unused) |
| `cat_*.png` | Cat: curl, loaf, side, sit, pet (back-scratcher), walk, yawn |
| `charm_*.png` | Charms earned with treats |
| `treat_*.png`, `carafe_up/tilt/pour.png` | Things you carry |
| `fx_*.png` | Effects (2 frames each): hearts, Zzz, sparkles, drops, puddle, flames, sweat... |
| `pot_*.png`, `topper_*.png` | Paused (kept for later) |
| `books_special.png`, `stool_empty.png`, `curtains_closed_layer.png`, `lampoff_*.png` | Room pieces |
| `icon-*.png`, `apple-touch-icon.png`, `manifest.webmanifest` | Home-screen app files |

---

## RULES (Jackie's non-negotiables)

1. **Simple, web + DS friendly animation:** frame swaps (2–4 frames) and whole-pixel moves only. No fades, rotation, smooth scaling, gradients or glows. Physics is fine if drawn on whole pixels. (Exception, decided Nov 3: light itself may blend softly, for the coming code lighting.)
2. **No HUD, no meters.** Needs show IN the plant: color (fading to gray in 4 steps = thirsty; outlines and pot keep their colors), face, posture (hunching = too dark), squinting and leaning away (too much light, after a while), one small flame only in the extreme case, Zzz only when actually asleep.
3. **Grace.** Nothing is ever lost for good, nothing punishes. Plants never starve; treats are optional; bickering plants always make up; cat trust never goes down; charms that fade come back faster.
4. **Fidgets:** squishy, bouncy, endlessly repeatable, visual-first (sound comes later from Garry).
5. **Cute, not scary.** Removed for being scary or cluttered: thought bubbles, hunger asterisks, bouncing book, dust/crack marks, petrifying cracks, eye-following.
6. **Art is untouched.** Background removal only; no recoloring or redrawing without Jackie's OK. **Black outlines always stay.** No blush on faces.
7. **Every room variant is an edit of the default room**, never an edit of another edit.
8. **One session edits the game at a time.** Run the tests before playing.
9. **Light comes from zones the player can see** (`js/light.js`): the window's sun patch (on the rug and the windowsill, fading across the room; time of day and curtains set its strength, closed = soft and dim), a grow-light circle around every lamp that's on (the milk crate is in the floor lamp's, the desk in the desk lamp's), and soft room light everywhere else. Too bright only for shade and night plants, only after a while, and only in the midday sun patch with the curtains open or right under a lamp. Moving out fixes it right away. Plants, the Light map and the coming code lighting all use the same light sources.

## DECISIONS (newest first, with why)

### No curtain wiggle (Nov 3)

- Removed the curtain wiggle that hinted at wrong light: it shifted the whole closed-curtain layer, dragging armchair pixels and showing the pulled-back curtain behind. Light problems show only in the plant (squinting, leaning, hunching). The closed-curtain pieces were trimmed to fabric only (armchair, pillow, throw and wall pixels made transparent; outlines kept).

### Thirst fades to gray (Nov 3)

- A thirsty plant's colors drain in 4 clear steps (pre-made, cached levels, no live blending) until a parched plant is fully gray; black outlines and the pot keep their colors. Watering brings the color back one step every half second. Seedlings and kids too. Why: gray reads as "needs something" at a glance and works for every plant color, where browning only touched green leaves.

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
