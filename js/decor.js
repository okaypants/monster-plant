'use strict';
/* HOLIDAY DECORATIONS (Jackie, Nov 25: "I also want decorations on all kinds of holidays", then "we need to have the option to decorate
   for any of these things. maybe in the cabinet we can choose cat stuff or decorations"). The decorations are Jackie's four sheets
   (art_src/decor/, cut by tools/decor_build.py into decor/). They are kept in the cupboard at the bottom of the right bookcase: open
   it, choose Decorations, and pick what to decorate for. You can put any of them up on any day, and take them down again. One set is
   up at a time. Long things hang under the curtain rod, small things stand on the windowsill and the desk, flat things hang on the wall.
   They are decoration only: nothing here can be tapped or played with, since several are sacred to the people who keep the day. */
const DECOR_SETS=[
 {id:'newyear',name:'New Year',items:['ny_stars','kagami_mochi']},{id:'lny',name:'Lunar New Year',items:['lny_lanterns','lny_oranges']},{id:'valentine',name:'Valentine’s Day',items:['valentine_hearts']},
 {id:'hina',name:'Hinamatsuri',items:['hina_dolls']},{id:'holi',name:'Holi',items:['holi_powder']},{id:'nowruz',name:'Nowruz',items:['nowruz_sprouts']},{id:'blossom',name:'First day of spring',items:['blossom_jar']},
 {id:'easter',name:'Easter',items:['easter_eggs']},{id:'songkran',name:'Songkran',items:['songkran_bowl']},{id:'eid',name:'Eid',items:['eid_lantern']},{id:'kodomo',name:'Children’s Day',items:['koinobori']},{id:'vesak',name:'Vesak',items:['vesak_lotus']},
 {id:'juneteenth',name:'Juneteenth',items:['juneteenth_bunting']},{id:'midsummer',name:'Midsummer',items:['midsummer_wreath']},{id:'pride',name:'Pride',items:['pride_flag']},{id:'tanabata',name:'Tanabata',items:['tanabata_bamboo']},
 {id:'obon',name:'Obon',items:['obon_lantern']},{id:'midautumn',name:'Mid-Autumn and Chuseok',items:['midautumn_cakes','rabbit_lantern']},{id:'diwali',name:'Diwali',items:['diwali_lamps','rangoli']},
 {id:'halloween',name:'Halloween',items:['halloween_bats']},{id:'muertos',name:'Day of the Dead',items:['papel_picado','marigolds']},{id:'harvest',name:'Harvest and Thanksgiving',items:['harvest_corn']},
 {id:'advent',name:'Advent and St. Lucia',items:['advent_candles']},{id:'hanukkah',name:'Hanukkah',items:['menorah']},{id:'solstice',name:'Winter solstice',items:['solstice_garland']},
 {id:'christmas',name:'Christmas',items:['xmas_lights','xmas_wreath','parol']},{id:'kwanzaa',name:'Kwanzaa',items:['kinara']},{id:'birthday',name:'A birthday',items:['birthday_bunting','birthday_cake']}];
// what kind of thing each one is: H hangs under the curtain rod, S stands on a surface, W hangs on the wall
const DECOR_KIND={H:['ny_stars','lny_lanterns','valentine_hearts','vesak_lotus','juneteenth_bunting','diwali_lamps','halloween_bats','papel_picado','solstice_garland','xmas_lights','birthday_bunting'],
 W:['koinobori','midsummer_wreath','rangoli','harvest_corn','xmas_wreath','parol']};
const decorKind=n=>DECOR_KIND.H.includes(n)?'H':DECOR_KIND.W.includes(n)?'W':'S';
// where they go (room pixels). H: its middle and its top edge, just under the rod. S: the middle of its bottom edge, on the windowsill and on the desk. W: the middle of its bottom edge, above the wall lamp and above the big picture.
const DECOR_SPOT={H:[{x:446,y:126,top:true}],S:[{x:362,y:531},{x:1228,y:551}],W:[{x:980,y:152},{x:786,y:116}]};
const DECOR_IMG={};DECOR_SETS.forEach(s=>s.items.forEach(n=>DECOR_IMG[n]=img('decor/'+n+'.png')));
function decorNow(){return DECOR_SETS.find(s=>s.id===st.decor)||null;}
// each thing of the set that is up, with its place: {n, im, x, y, w, h}
function decorBoxes(){const s=decorNow();if(!s)return [];const used={H:0,S:0,W:0},out=[];
 for(const n of s.items){const k=decorKind(n),sp=DECOR_SPOT[k][used[k]++],im=DECOR_IMG[n];if(!sp||!ok(im))continue;const w=im.naturalWidth,h=im.naturalHeight;out.push({n,im,x:sp.x-Math.round(w/2),y:sp.top?sp.y:sp.y-h,w,h});}
 return out;}
function drawDecor(){if(!st.started)return;for(const b of decorBoxes())g.drawImage(litPic(b.im,lightAt(b.x+b.w/2,b.y+b.h)),b.x,b.y);}
function decorSet(id){const s=DECOR_SETS.find(q=>q.id===id);st.decor=s?s.id:null;sfx(s?'chime':'tick');tell(s?'The room is decorated for '+s.name+'.':'The decorations are back in the cupboard.',{kind:'info',key:'decor',now:true});save();}
