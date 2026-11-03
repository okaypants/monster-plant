'use strict';
/* Nudges: small per-species and per-frame position fixes, on top of placing every picture by its real bottom (see SURFACE in room.js). Set them with the debug Nudge tool. */
// plants: 'species|age|spot' -> [dx, dy] in room pixels (+dy = down). species 1-16; age seed/sprout/kid/teen/adult; spot sill/desk/crate/books/rug/chair.
// cat: 'pose|spot' -> [dx, dy]. pose curl/loaf/side/sit/pet/belly/walk/yawn; spot bed/rug/chair/sill/crate/books/byplant/floor (walking).
const NUDGE={plant:{},cat:{}};
// nudges saved with the debug tool on this device are added on top (Copy table puts them here for good)
try{const s=JSON.parse(localStorage.getItem('mp-nudges'));if(s){Object.assign(NUDGE.plant,s.plant||{});Object.assign(NUDGE.cat,s.cat||{});}}catch(e){}
