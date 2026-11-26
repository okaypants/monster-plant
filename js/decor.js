'use strict';
/* HOLIDAY DECORATIONS (Jackie, Nov 25: "I also want decorations on all kinds of holidays", then "we need to have the option to decorate
   for any of these things. maybe in the cabinet we can choose cat stuff or decorations"). The decorations are Jackie's four sheets
   (art_src/decor/, cut by tools/decor_build.py into decor/). They are kept in the cupboard at the bottom of the right bookcase: open
   it, choose Decorations, and pick what to decorate for. You can put any of them up on any day, and take them down again. One set is
   up at a time. A set can have three kinds of thing (Jackie, Nov 25: "we need a floor, desk and garland/light decor ... for every occasion"): a garland
   or string of lights in the window, behind the curtains; something small on the bookcase shelf, where the framed cat stands; and something on the floor spot, where the pumpkin
   stands. Some sets also have a flat thing for the wall. Many sets do not have all three yet: their art is still to be drawn.
   The pumpkin used to come out by itself every autumn and the tree every winter; now the pumpkin is the Autumn set's floor decoration
   and the tree is Christmas's ("the floor decoration goes where the pumpkin is, who gets relegated to general fall").
   They are decoration only: nothing here can be tapped or played with, since several are sacred to the people who keep the day. */
const DECOR_SETS=[
 {id:'newyear',name:'New Year',items:['ny_stars','kagami_mochi']},{id:'lny',name:'Lunar New Year',items:['lny_lanterns','lny_oranges']},{id:'valentine',name:'Valentine’s Day',items:['valentine_hearts']},
 {id:'hina',name:'Hinamatsuri',items:['hina_dolls']},{id:'holi',name:'Holi',items:['holi_powder']},{id:'nowruz',name:'Nowruz',items:['nowruz_sprouts']},{id:'blossom',name:'First day of spring',items:['blossom_jar']},
 {id:'easter',name:'Easter',items:['easter_eggs']},{id:'songkran',name:'Songkran',items:['songkran_bowl']},{id:'eid',name:'Eid',items:['eid_lantern']},{id:'kodomo',name:'Children’s Day',items:['koinobori']},{id:'vesak',name:'Vesak',items:['vesak_lotus']},
 {id:'juneteenth',name:'Juneteenth',items:['juneteenth_bunting']},{id:'midsummer',name:'Midsummer',items:['midsummer_wreath']},{id:'pride',name:'Pride',items:['pride_flag']},{id:'tanabata',name:'Tanabata',items:['tanabata_bamboo']},
 {id:'obon',name:'Obon',items:['obon_lantern']},{id:'autumn',name:'Autumn',items:[],floor:'pumpkin'},{id:'midautumn',name:'Mid-Autumn',items:['rabbit_lantern','midautumn_cakes']},{id:'chuseok',name:'Chuseok',items:[]},{id:'diwali',name:'Diwali',items:['diwali_lamps','rangoli']},
 {id:'halloween',name:'Halloween',items:['halloween_bats']},{id:'muertos',name:'Day of the Dead',items:['papel_picado','marigolds']},{id:'harvest',name:'Harvest and Thanksgiving',items:['harvest_corn']},
 {id:'advent',name:'Advent and St. Lucia',items:['advent_candles']},{id:'hanukkah',name:'Hanukkah',items:['menorah']},{id:'solstice',name:'Winter solstice',items:['solstice_garland']},
 {id:'christmas',name:'Christmas',items:['xmas_lights','xmas_wreath','parol'],floor:'tree'},{id:'kwanzaa',name:'Kwanzaa',items:['kinara']},{id:'birthday',name:'A birthday',items:['birthday_bunting','birthday_cake']}];
// what kind of thing each one is: H hangs under the curtain rod, S stands on a surface, W hangs on the wall
const DECOR_KIND={H:['ny_stars','lny_lanterns','valentine_hearts','vesak_lotus','juneteenth_bunting','diwali_lamps','halloween_bats','papel_picado','solstice_garland','xmas_lights','birthday_bunting'],
 W:['koinobori','midsummer_wreath','rangoli','harvest_corn','xmas_wreath','parol']};
const decorKind=n=>DECOR_KIND.H.includes(n)?'H':DECOR_KIND.W.includes(n)?'W':'S';
// where they go (room pixels). S: the middle of its bottom edge. The first stands in the cubby of the left bookcase, in the framed cat's place, and the frame is put away while it is there (Jackie, Nov 25: "the picture on the shelf of the cat is also replaceable"; asked if a decoration may stand there: "Yes on shelf - I don't think things sit nicely on the desk atm"). A second one, in the one set that has two, stands on the desk. W: the middle of its bottom edge, above the wall lamp and above the big picture.
const DECOR_SPOT={S:[{x:97,y:438,cubby:true},{x:1236,y:551}],W:[{x:980,y:152},{x:786,y:116}]};
const DECOR_IMG={};DECOR_SETS.forEach(s=>s.items.forEach(n=>DECOR_IMG[n]=img('decor/'+n+'.png')));DECOR_IMG.xmas_lights_dim=img('decor/xmas_lights_dim.png');
// the string lights blink now and then: every 6 to 16 seconds they go dim and bright three times, a frame swap
const LIGHTS_GAP=[6000,16000],LIGHTS_STEP=160;let lightsAt=0;
function lightsDim(){const now=performance.now();if(!lightsAt)lightsAt=now+rnd(LIGHTS_GAP[0],LIGHTS_GAP[1]);if(now<lightsAt)return false;const k=Math.floor((now-lightsAt)/LIGHTS_STEP);if(k>=6){lightsAt=now+rnd(LIGHTS_GAP[0],LIGHTS_GAP[1]);return false;}return k%2===0;}
function decorNow(){return DECOR_SETS.find(s=>s.id===st.decor)||null;}
// each thing of the set that is up, with its place: {n, im, x, y, w, h}
function decorBoxes(){const s=decorNow();if(!s)return [];const used={S:0,W:0},out=[];
 for(const n of s.items){const k=decorKind(n),im=DECOR_IMG[n];if(k==='H'||!ok(im))continue;const w=im.naturalWidth,h=im.naturalHeight; // a garland hangs in the window (drawDecorWindow below), not here
  const sp=DECOR_SPOT[k][used[k]++];if(sp)out.push({n,im,x:sp.x-Math.round(w/2),y:sp.y-h,w,h});}
 return out;}
// what stands on the floor spot for the set that is up: 'pumpkin', 'tree' (both drawn by js/seasonal.js, where they rock and sway) or the name of a decoration picture
// true while a decoration stands in the bookcase cubby: the framed cat is put away (js/room.js) and cannot be tipped (js/fidgets.js)
function decorInCubby(){const s=decorNow();return !!s&&s.items.some(n=>decorKind(n)==='S');}
function decorFloor(){const s=decorNow();return s&&s.floor||null;}
// the sets there is something to put up for: one with no pictures yet (Chuseok, until its art is drawn) is not offered
function decorOffered(){return DECOR_SETS.filter(s=>s.items.length||s.floor);}
function drawDecor(){if(!st.started)return;for(const b of decorBoxes())g.drawImage(litPic(b.im,lightAt(b.x+b.w/2,b.y+b.h)),b.x,b.y);}
/* INSIDE THE WINDOW (Jackie, Nov 25: "i also want lights and garland on the inside of the window behind the curtains"). The set's garland
   hangs across the top of the window, inside the room and behind the curtains (for a while garlands also hung right across the ceiling;
   Jackie: "make the garland just the window actually"): it is drawn only through the shape of the window's
   opening between the open curtains (decor/winmask.png), before the closed curtains are drawn, so cloth always covers it. */
const WIN_AT={x:240,y:118,cx:444,top:150},WIN_MASK=img('decor/winmask.png'),winCv=document.createElement('canvas');
function drawDecorWindow(){if(!st.started)return;const s=decorNow(),n=s&&s.items.find(i=>decorKind(i)==='H');if(!n||!ok(WIN_MASK))return;
 const im=n==='xmas_lights'&&lightsDim()&&ok(DECOR_IMG.xmas_lights_dim)&&!tsCalm()?DECOR_IMG.xmas_lights_dim:DECOR_IMG[n];if(!ok(im))return;
 if(winCv.width!==WIN_MASK.naturalWidth){winCv.width=WIN_MASK.naturalWidth;winCv.height=WIN_MASK.naturalHeight;}const x=winCv.getContext('2d');
 x.globalCompositeOperation='source-over';x.clearRect(0,0,winCv.width,winCv.height);x.drawImage(litPic(im,lightAt(WIN_AT.cx,WIN_AT.top+im.naturalHeight)),WIN_AT.cx-WIN_AT.x-Math.round(im.naturalWidth/2),WIN_AT.top-WIN_AT.y);
 x.globalCompositeOperation='destination-in';x.drawImage(WIN_MASK,0,0);g.drawImage(winCv,WIN_AT.x,WIN_AT.y);}
function decorSet(id){const s=DECOR_SETS.find(q=>q.id===id);st.decor=s?s.id:null;sfx(s?'chime':'tick');tell(s?'The room is decorated for '+s.name+'.':'The decorations are back in the cupboard.',{kind:'info',key:'decor',now:true});save();}
