'use strict';
/* HOLIDAY DECORATIONS (Jackie, Nov 25). They are kept in the cupboard at the bottom of the right bookcase: open it, choose
   Decorations, and pick what to decorate for. Any set can go up on any day, one at a time, and it is remembered.
   After a first round of art that had no fixed places, Jackie had it started over: "we start over completely with decorations with a
   fresh prompt and all new categories based on fit", for four spaces: "Desk, window hanging, shelves, and floor where pumpkin is".
   Every occasion has one thing for each (art_src/decor/, cut and sized by tools/decor_build.py into decor/<id>_<space>.png):
     w  the window: a garland with little lights, hung across the top of the window, in front of the glass and behind the curtains
     s  the shelf: a small upright thing in the cubby of the left bookcase, in the framed cat's place (the frame is put away meanwhile)
     d  the desk: a low, wide thing between the radio and the desk lamp (drawn, but not put up: see DECOR_USE)
     f  the floor: a large thing on the crate, or in the front corner while the bassinet is out. Autumn's is the pumpkin and
        Christmas's is the tree, which rock and sway when tapped (js/seasonal.js)
   The garland's lights blink now and then. Nothing else here can be tapped or played with: several of these things are sacred to
   the people who keep the day, so they are shown plainly. */
const DECOR_SETS=[['newyear','New Year'],['lny','Lunar New Year'],['valentine','Valentine’s Day'],['hina','Hinamatsuri'],['holi','Holi'],['nowruz','Nowruz'],['blossom','First day of spring'],['easter','Easter'],
 ['songkran','Songkran'],['eid','Eid'],['kodomo','Children’s Day'],['vesak','Vesak'],['juneteenth','Juneteenth'],['midsummer','Midsummer'],['pride','Pride'],['tanabata','Tanabata'],['obon','Obon'],['autumn','Autumn'],
 ['midautumn','Mid-Autumn'],['chuseok','Chuseok'],['diwali','Diwali'],['halloween','Halloween'],['muertos','Day of the Dead'],['harvest','Harvest and Thanksgiving'],['advent','Advent and St. Lucia'],['hanukkah','Hanukkah'],
 ['solstice','Winter solstice'],['christmas','Christmas'],['kwanzaa','Kwanzaa'],['birthday','A birthday']].map(([id,name])=>({id,name,floor:id==='autumn'?'pumpkin':id==='christmas'?'tree':id+'_f'}));
// where they go (room pixels): the middle of each thing's bottom edge
const DECOR_SPOT={s:{x:97,y:438},d:{x:1264,y:551}},DECOR_USE=['s']; /* which of the shelf and desk pieces are put up. The desk pieces are drawn and cut (decor/<id>_d.png) but not used: Jackie, publishing this, Nov 25: "Publish but no shelf decor or desk", then "Jk shelf is ok". Add 'd' here to bring them back */
const DECOR_IMG={};for(const s of DECOR_SETS){for(const k of ['w','w_dim'].concat(DECOR_USE))DECOR_IMG[s.id+'_'+k]=img('decor/'+s.id+'_'+k+'.png');if(s.floor.endsWith('_f'))DECOR_IMG[s.floor]=img('decor/'+s.floor+'.png');}
function decorNow(){return DECOR_SETS.find(s=>s.id===st.decor)||null;}
function decorOffered(){return DECOR_SETS;}
// the shelf thing and the desk thing of the set that is up, with their places: {n, k, im, x, y, w, h}
function decorBoxes(){const s=decorNow();if(!s)return [];const out=[];
 for(const k of DECOR_USE){const n=s.id+'_'+k,im=DECOR_IMG[n],sp=DECOR_SPOT[k];if(!ok(im))continue;const w=im.naturalWidth,h=im.naturalHeight;out.push({n,k,im,x:sp.x-Math.round(w/2),y:sp.y-h,w,h});}
 return out;}
// what stands on the floor spot for the set that is up: 'pumpkin', 'tree' or the name of a decoration picture (drawn by js/seasonal.js)
function decorFloor(){const s=decorNow();return s?s.floor:null;}
// true while a decoration stands in the bookcase cubby: the framed cat is put away (js/room.js) and cannot be tipped (js/fidgets.js)
function decorInCubby(){return !!decorNow();}
function drawDecor(){if(!st.started)return;for(const b of decorBoxes())g.drawImage(litPic(b.im,lightAt(b.x+b.w/2,b.y+b.h)),b.x,b.y);}
// the garland's little lights blink now and then (Jackie: "1 light animation for every occasion"): every 6 to 16 seconds they go dim and
// bright three times, a frame swap between the garland's two pictures. Not with reduced motion.
const LIGHTS_GAP=[6000,16000],LIGHTS_STEP=160;let lightsAt=0;
function lightsDim(){const now=performance.now();if(!lightsAt)lightsAt=now+rnd(LIGHTS_GAP[0],LIGHTS_GAP[1]);if(now<lightsAt)return false;const k=Math.floor((now-lightsAt)/LIGHTS_STEP);if(k>=6){lightsAt=now+rnd(LIGHTS_GAP[0],LIGHTS_GAP[1]);return false;}return k%2===0;}
/* INSIDE THE WINDOW (Jackie: "garland and stuff should go behind the curtains, but in front of the windows ... they're like inside").
   The garland is drawn only through the shape of the window's opening between the open curtains (decor/winmask.png), and before the
   closed curtains are drawn, so cloth always covers it. */
const WIN_AT={x:240,y:118,cx:444,top:150},WIN_MASK=img('decor/winmask.png');
/* ON THE RIGHT-HAND WALL (Jackie: "I thought we were putting garland on the right side of the room? But it also has to look cute, like
   not cover everything"). The same garland hangs a second time on the bare wall above the right-hand shelves, drawn only through the
   shape of that bare wall (decor/wallmask.png), so it sits behind the shell, the sampler and the plant and covers nothing. */
const WALL_AT={x:1040,y:34,cx:1240,top:40},WALL_MASK=img('decor/wallmask.png');
const GARLANDS=[[WIN_AT,WIN_MASK,document.createElement('canvas')],[WALL_AT,WALL_MASK,document.createElement('canvas')]];
function drawGarland(n){if(!st.started)return;const s=decorNow(),[at,mask,cv]=GARLANDS[n];if(!s||!ok(mask))return;
 const dimmed=DECOR_IMG[s.id+'_w_dim'],im=lightsDim()&&ok(dimmed)&&!tsCalm()?dimmed:DECOR_IMG[s.id+'_w'];if(!ok(im))return;
 if(cv.width!==mask.naturalWidth){cv.width=mask.naturalWidth;cv.height=mask.naturalHeight;}const x=cv.getContext('2d');
 x.globalCompositeOperation='source-over';x.clearRect(0,0,cv.width,cv.height);x.drawImage(litPic(im,lightAt(at.cx,at.top+im.naturalHeight)),at.cx-at.x-Math.round(im.naturalWidth/2),at.top-at.y);
 x.globalCompositeOperation='destination-in';x.drawImage(mask,0,0);g.drawImage(cv,at.x,at.y);}
function drawDecorWindow(){drawGarland(0);}
function drawDecorWall(){drawGarland(1);}
function decorSet(id){const s=DECOR_SETS.find(q=>q.id===id);st.decor=s?s.id:null;sfx(s?'chime':'tick');tell(s?'The room is decorated for '+s.name+'.':'The decorations are back in the cupboard.',{kind:'info',key:'decor',now:true});save();}
