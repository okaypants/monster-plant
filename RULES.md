# RULES (Jackie's non-negotiables)

Monster Plant's rules. Every change keeps to these; the README links here.

1. **Simple, web + DS friendly animation:** frame swaps (2–4 frames) and whole-pixel moves only. No fades, rotation, smooth scaling, gradients or glows. Physics is fine if drawn on whole pixels. (Exception, decided Nov 3: light itself may blend softly, for the coming code lighting.)
2. **No HUD, no meters.** Needs show IN the plant (see rule 10): its colors, face and posture. Zzz only when actually asleep.
3. **Grace.** Nothing is ever lost for good, nothing punishes. Plants never starve; treats are optional; bickering plants always make up; cat trust never goes down; charms that fade come back faster.
4. **Fidgets:** squishy, bouncy, endlessly repeatable, visual-first (sound comes later from Garry).
5. **Cute, not scary.** Removed for being scary or cluttered: thought bubbles, hunger asterisks, bouncing book, dust/crack marks, petrifying cracks, eye-following.
6. **Art is untouched.** Background removal only; no recoloring or redrawing without Jackie's OK. **Black outlines always stay.** No blush on faces.
7. **Every room variant is an edit of the default room**, never an edit of another edit.
8. **One session edits the game at a time.** Run the tests before playing.
9. **Light comes from zones the player can see** (`js/light.js`): the window's sun patch (on the rug and the windowsill, fading across the room; time of day and curtains set its strength, closed = soft and dim), a grow-light circle around every lamp that's on (the milk crate is in the floor lamp's, the desk in the desk lamp's), and soft room light everywhere else. Too bright only for shade and night plants, only after a while, and only in the midday sun patch with the curtains open or right under a lamp. Moving out stops the squinting and leaning right away; the scorching heals in steps. Plants, the Light map and the coming code lighting all use the same light sources.
10. **Light and water needs show ONLY physically on the monster, never on tools, curtains or the room.**
    - Not enough light: it **withers** (droops and hunches, leaves curl in, colors slightly dull), more withered the longer it lasts.
    - Too much light: it **burns** (squints and leans away; toasty, scorched edges and tips in a few clear steps; the tiny flame only for the most extreme case).
    - Not enough water: it **fades to gray** (the desaturation steps), pot and all; black outlines stay black.
    - Too much water: it **sits in a puddle** (the puddle under its pot, plus a soggy droop), which dries up over time.
    - Each fixes itself in steps once the need is met.
    - **No hints on objects:** no carafe wobble or sparkle, curtain sway, window wobble, bouncing book or jar.
    - **Idle wiggle:** things you can use may give a VERY occasional, subtle idle wiggle (1 px, a couple of frames, at most once every few minutes, never two at once, never while Jackie is touching something). Only usable things: the carafe, SNACKS cabinet, lamps, desk drawers (journal), armchair, the doodad fidgets and seasonal items. For books, ONLY the four special readable books, never the other books on the shelves.
