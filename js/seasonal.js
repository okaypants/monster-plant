'use strict';
/* Seasonal items (Jackie, Nov 15), cut from her season sheets (magenta keyed out only; tools/season_cut.py).
   Autumn: now and then a single leaf drifts down outside the window, seen only through the glass (window_glass.png, tools/window_glass.py),
   in the daytime and at golden hour. The pumpkin sits on the milk crate: tap it and it rocks. It wears the same face day and night
   (closed eyes, black mouth: Jackie, Nov 16; tools/pumpkin_eyes.py).
   Winter: the potted tree with its six ornaments sits there instead: tap it and it sways and the ornaments swing.
   The leaf pile waits for an outdoor space. While a plant sits on the crate the seasonal item makes room (it isn't drawn); the cat naps elsewhere while it's out. */
const LEAVES=['maple','redmaple','ginkgo','oak','twig','round'].map(n=>img('leaf_'+n+'.png'));
const GLASS_AT={x:PANES.x,y:PANES.y},GLASS_W=PANES.w,GLASS_H=PANES.h; // the window's panes (js/room.js): the room is drawn over the leaves, so they show only through the glass
const PUMPKIN=[1,2,3].map(i=>img('pumpkin'+i+'.png')); // idle, rock one way, rock the other
const TREE=[img('tree1.png'),img('tree2.png')];
// each ornament: its two swing frames, where its hook hangs on the tree (in tree1.png's pixels) and the hook's column in its own art
const ORNAMENTS=[['star',70,55,60],['ball',128,57,56],['heart',40,112,56],['mushroom',152,112,57],['bell',65,180,56],['pot',135,182,54]]
 .map(([n,x,y,hx])=>({f:[img('ornament_'+n+'1.png'),img('ornament_'+n+'2.png')],x,y,hx,swing:0}));
const LEAF_SC=.2,PUMPKIN_SC=.3,TREE_SC=.56,ORN_SC=.15; // sizes set here, never by resizing the art
const STACK_TOP={x:336,y:660}; // the middle of the milk crate's top (room art), where the item's bottom row rests (Jackie, Nov 18: the book stack is gone, so they sit on the crate)
/* While the bassinet stands in the crate's place (Jackie, Nov 23: "Find them a spot") the item stands on the floor in the front left
   corner, in front of the bookcase. That is the front of the room, so it is drawn larger there, by the same rule as everything else. */
const SEASON_FLOOR={x:100,y:886,k:1.4}; // clear of the name tag in the bottom left corner
function seasonAt(){return SEASON_FLOOR;} /* always on the floor, in the front left corner (Jackie, Nov 26: "i'm curious why the big decoration that's supposed to be on the floor is on the crate every time. which won't work if there's a baby there"). It used to stand on the milk crate and only move to the floor while the bassinet stood in the crate's place */
const SWAP_MS=150; // one frame of a rock, sway or swing
let sLeaves=[],sLeafNext=0,sRock=0,sSway=0;const leafCv=document.createElement('canvas');leafCv.width=GLASS_W;leafCv.height=GLASS_H;const leafG=leafCv.getContext('2d');leafG.imageSmoothingEnabled=false;

/* ---------- autumn: leaves drifting past the window ---------- */
// one leaf at a time (two at most), every 5-12 s; it drifts slowly down in whole pixels (13-20 px a second, slowed for Jackie, Nov 17) and sways gently side to side
function drawFallingLeaves(tk){const now=performance.now();
 if(seasonNow()!=='autumn'||tk==='night'||st.curtain==='closed'&&curK>.98||tsCalm()){sLeaves=[];sLeafNext=0;return;}
 if(!sLeafNext)sLeafNext=now+rnd(1,4)*1000;
 if(now>=sLeafNext&&sLeaves.length<2){const im=LEAVES[Math.floor(Math.random()*LEAVES.length)];
  sLeaves.push({im,x:rnd(10,GLASS_W-40),y:-40,vy:rnd(13,20),a:rnd(6,14),w:rnd(.8,1.3),ph:rnd(0,6.28)});sLeafNext=now+rnd(5,12)*1000;}
 if(!sLeaves.length)return;
 leafG.clearRect(0,0,GLASS_W,GLASS_H);
 for(const L of sLeaves){L.y+=L.vy*dtDraw;L.ph+=L.w*dtDraw;if(!ok(L.im))continue;
  leafG.drawImage(L.im,Math.round(L.x+Math.sin(L.ph)*L.a),Math.round(L.y),Math.round(L.im.naturalWidth*LEAF_SC),Math.round(L.im.naturalHeight*LEAF_SC));}
 sLeaves=sLeaves.filter(L=>L.y<GLASS_H);
 g.drawImage(leafCv,GLASS_AT.x,GLASS_AT.y);}

/* ---------- the pumpkin (autumn) and the tree (winter) on the milk crate ---------- */
function seasonOut(){return typeof decorFloor==='function'?decorFloor():null;} // what stands on the floor spot: the pumpkin (the Autumn decorations), the tree (Christmas) or another set's floor decoration (js/decor.js). Until Nov 25 the pumpkin came out by itself in autumn and the tree in winter
// out on the crate unless a plant sits there (the cat leaves the crate to it)
function seasonItem(){return seasonOut()||null;} // out whenever a set with a floor piece is up: it is on the floor, so nothing on the crate is in its way
function stackOff(){return {x:0,y:0};} // it no longer rides on the crate
function seasonIdle(n){return idleOn&&idleOn.it.n===n?idleOffset(performance.now()):0;}
function seasonBox(){const k=seasonItem();if(!k)return null;const f=k==='pumpkin'?PUMPKIN[0]:k==='tree'?TREE[0]:DECOR_IMG[k];if(!ok(f))return null;const at=seasonAt(),sc=(k==='pumpkin'?PUMPKIN_SC:k==='tree'?TREE_SC:1)*at.k,w=Math.round(f.naturalWidth*sc),h=Math.round(f.naturalHeight*sc);
 return {k,sc,osc:ORN_SC*at.k,x:at.x-Math.round(w/2),y:at.y-h,w,h};}
/* its light is read from the floor just to its right. Under the piece itself the room's picture is nearly black by day (the corner by the lamp's foot), which made the reading useless and left the piece at full brightness in a dark room (Jackie, Nov 27: "The lighting is a little off") */
function drawSeasonItem(){const b=seasonBox();if(!b)return;const now=performance.now(),o=stackOff(),x0=b.x+o.x+seasonIdle(b.k),y0=b.y+o.y;
 const L=lightAt(b.x+b.w+60,b.y+b.h-20),put=(im,x,y,sc)=>{if(ok(im))g.drawImage(litPic(im,L),Math.round(x),Math.round(y),Math.round(im.naturalWidth*sc),Math.round(im.naturalHeight*sc));};
 if(b.k==='pumpkin'){const rock=now<sRock?1+Math.floor((sRock-now)/SWAP_MS)%2:0;put(PUMPKIN[rock],x0,y0,b.sc);return;}
 if(b.k!=='tree'){put(DECOR_IMG[b.k],x0,y0,b.sc);return;} // another set's floor decoration: one still picture
 put(TREE[now<sSway?Math.floor((sSway-now)/SWAP_MS)%2:0],x0,y0,b.sc);
 for(const o2 of ORNAMENTS){const f=o2.f[now<o2.swing?Math.floor((o2.swing-now)/SWAP_MS)%2:0];if(!ok(f))continue;
  put(f,x0+o2.x*b.sc-o2.hx*b.osc,y0+o2.y*b.sc,b.osc);}}
// a tap: the pumpkin rocks (6 frames); the tree sways and every ornament swings, each a beat apart
function seasonPoke(x,y){const b=seasonBox();if(!b||x<b.x||x>=b.x+b.w||y<b.y||y>=b.y+b.h)return false;const now=performance.now();
 if(b.k==='pumpkin'){sRock=now+6*SWAP_MS;fplay('pumpkin_rock');}
 else if(b.k!=='tree')return false;
 else{sSway=now+4*SWAP_MS;ORNAMENTS.forEach((o2,i)=>{o2.swing=now+(4+i%3)*SWAP_MS;});fplay('tree_jingle');}
 return true;}
