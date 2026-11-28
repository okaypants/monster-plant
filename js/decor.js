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
/* SECOND ROUND (Jackie, Nov 27: "let's start completely over with decorations and string lights", after "maybe get chat to make a
   beach ball? and then rethink everything in that way -- like things that indicate a season or holiday or fun event", and
   "WHEN WE ARE CONSIDERING DECORATIONS WE SHOULD CONSIDER MORE REASONS TO DECORATE THAN HOLIDAYS"). The thirty sets are gone.
   A set is now one object standing on the floor (decor/t_<id>.png, cut by tools/decor2_build.py), chosen from four
   groups, with a garland for the window (decor/g_<id>.png; see DECOR_GARLAND below). Nothing goes in the bookcase cubby any more, so the
   framed cat stays where it is. The big pumpkin and the big tree, which rock and sway when tapped (js/seasonal.js), are kept as
   two more things to put out. Names follow reports/Respectful seasonal and holiday decor.md: a holiday's object is listed under
   the holiday's own name. */
const DECOR_GROUPS=[['Seasons and weather',[['boots','Rain boots'],['beachball','Beach ball'],['leaves','Raked leaves'],['sledge','Sledge'],['umbrellas','Umbrella stand'],['stormlamp','Storm lantern'],['fan','Fan'],['pinwheels','Pinwheels'],
  ['moonlamp','Moon lamp'],['seedlings','Seedlings'],['squash','Pumpkins and squash'],['pumpkin','The big pumpkin'],['sunflower','Sunflower'],['firewood','Firewood'],['sandbucket','Sand bucket'],['picnic','Picnic']]],
 ['Home and hobbies',[['present','A birthday'],['newhome','New home'],['trophy','A win'],['sickday','Sick day'],['catbox','A box for the cat'],['backpack','Back to school'],['movienight','Movie night'],['fort','Blanket fort'],
  ['boardgame','Game night'],['teatray','Tea'],['ballgame','Game day'],['crafts','Crafts'],['books','Reading day'],['mop','Cleaning day']]],
 ['Holidays, January to July',[['newyear','New Year'],['kumquat','Lunar New Year'],['valentine','Valentine’s Day'],['peach','Peach blossom'],['holi','Holi'],['hyacinth','Nowruz'],['eggtree','Easter'],['waterjar','Songkran'],
  ['eidlantern','Eid'],['irises','Children’s Day'],['lotus','Vesak'],['hibiscus','Juneteenth'],['midsummer','Midsummer'],['pride','Pride'],['tanabata','Tanabata'],['morningglory','Summer festival']]],
 ['Holidays, August to December',[['pampas','Mid-Autumn'],['bojagi','Chuseok'],['rangoli','Diwali'],['jackolantern','Halloween'],['marigolds','Day of the Dead'],['dreidel','Hanukkah'],['winterlantern','Winter lights'],['smalltree','Christmas'],['tree','The big tree'],
  ['kwanzaa','Kwanzaa'],['applepie','Harvest'],['snowglobe','Snow globe'],['poinsettia','Poinsettia'],['presents','Presents'],['paperlantern','Paper lantern'],['mandarins','Mandarins'],['skates','Ice skates']]]];
/* Jackie, seeing the cut sheet, Nov 27: "no telescope, guitar, globe". Those three are out of the list and their pictures are not kept.
   Two pieces were first held back, the morning glory (its bamboo frame ends in two small crosses) and the moon garland (a star
   beside each crescent); asked about them she said "all are fine", so both are in. */
/* SETS, NOT SEPARATE PICKS (Jackie, Nov 27, after a first build where the garland had its own list: "No I don't want them separate, I
   want sets lol"). Every decoration is a set again: its thing for the floor and the garland that goes with it, put out and put
   away together by one choice. Thirteen garlands serve the sixty-two sets, so related sets share one. */
const DECOR_GARLAND={boots:'rain',beachball:'citrus',leaves:'leaves',sledge:'snow',umbrellas:'rain',stormlamp:'rain',fan:'citrus',pinwheels:'bunting',moonlamp:'moons',seedlings:'blossom',squash:'leaves',pumpkin:'leaves',sunflower:'citrus',firewood:'evergreen',sandbucket:'citrus',picnic:'citrus',
 present:'bunting',newhome:'bunting',trophy:'bunting',sickday:'hearts',catbox:'hearts',backpack:'leaves',movienight:'lanterns',fort:'lanterns',boardgame:'bunting',teatray:'blossom',ballgame:'bunting',crafts:'blossom',books:'leaves',mop:'citrus',
 newyear:'bunting',kumquat:'lanterns',valentine:'hearts',peach:'blossom',holi:'blossom',hyacinth:'blossom',eggtree:'eggs',waterjar:'blossom',eidlantern:'lanterns',irises:'blossom',lotus:'lanterns',hibiscus:'bunting',midsummer:'blossom',pride:'pennants',tanabata:'lanterns',morningglory:'lanterns',
 pampas:'moons',bojagi:'leaves',rangoli:'marigold',jackolantern:'bats',marigolds:'marigold',dreidel:'snow',winterlantern:'evergreen',smalltree:'evergreen',tree:'evergreen',kwanzaa:'snow',applepie:'leaves',snowglobe:'snow',poinsettia:'evergreen',presents:'bunting',paperlantern:'lanterns',mandarins:'lanterns',skates:'snow'};
const DECOR_SETS=[].concat(...DECOR_GROUPS.map(([group,L])=>L.map(([id,name])=>({id,name,group,garland:DECOR_GARLAND[id],floor:id==='pumpkin'||id==='tree'?id:'t_'+id}))));
const GARLAND_KINDS=[['blossom','Blossom'],['citrus','Orange and lemon'],['leaves','Autumn leaves'],['snow','Snowflakes'],['rain','Rain and clouds'],['moons','Moons'],['hearts','Hearts'],['eggs','Painted eggs'],['bats','Bats'],['evergreen','Evergreen and bows'],['marigold','Marigolds'],['pennants','Rainbow pennants'],['lanterns','Paper lanterns'],['bunting','Birthday bunting']];
const DECOR_IMG={};for(const s of DECOR_SETS)if(s.floor[1]==='_')DECOR_IMG[s.floor]=img('decor/'+s.floor+'.png');for(const [id] of GARLAND_KINDS)DECOR_IMG['g_'+id]=img('decor/g_'+id+'.png');
// what a save from the thirty old sets turns into: the nearest new set
const DECOR_OLD={lny:'kumquat',hina:'peach',nowruz:'hyacinth',blossom:'peach',easter:'eggtree',songkran:'waterjar',eid:'eidlantern',kodomo:'irises',vesak:'lotus',juneteenth:'hibiscus',obon:'',autumn:'pumpkin',midautumn:'pampas',chuseok:'bojagi',diwali:'rangoli',halloween:'jackolantern',muertos:'marigolds',harvest:'applepie',advent:'winterlantern',hanukkah:'dreidel',solstice:'snowglobe',christmas:'tree',birthday:'present'};
function decorOld(k){const o=DECOR_OLD[st[k]];if(o!==undefined)st[k]=o||null;}
function decorNow(){decorOld('decor');return DECOR_SETS.find(s=>s.id===st.decor)||null;}
function decorOffered(){return DECOR_SETS;}
function decorBoxes(){return [];} // nothing stands on the shelf or the desk in this round
// what stands on the floor spot: 'pumpkin', 'tree' or the name of a decoration picture (drawn by js/seasonal.js)
function decorFloor(){const s=decorNow();return s?s.floor:null;}
function decorInCubby(){return false;} // the framed cat keeps its place
function drawDecor(){}
function garlandNow(){const d=decorNow();return d?d.garland:'';} // the garland of the set that is out
// the garland's little lights blink now and then (Jackie: "1 light animation for every occasion"): every 6 to 16 seconds they go dim and
// bright three times, a frame swap between the garland's two pictures. Not with reduced motion.
const LIGHTS_GAP=[6000,16000],LIGHTS_STEP=160;let lightsAt=0;
function lightsDim(){const now=performance.now();if(!lightsAt)lightsAt=now+rnd(LIGHTS_GAP[0],LIGHTS_GAP[1]);if(now<lightsAt)return false;const k=Math.floor((now-lightsAt)/LIGHTS_STEP);if(k>=6){lightsAt=now+rnd(LIGHTS_GAP[0],LIGHTS_GAP[1]);return false;}return k%2===0;}
/* INSIDE THE WINDOW (Jackie: "garland and stuff should go behind the curtains, but in front of the windows ... they're like inside").
   The garland is drawn only through the shape of the window's opening between the open curtains (decor/winmask.png), and before the
   closed curtains are drawn, so cloth always covers it. */
const WIN_AT={x:240,y:118,cx:444,top:150,lx:444,ly:560},WIN_MASK=img('decor/winmask.png');
/* STRING LIGHTS ALONG THE TOP OF THE WALL (Jackie, Nov 26: "we could have string lights all the way across the top very small";
   asked which, "Across"). One strand runs the width of the room just under the ceiling, drawn only through the bare wallpaper there
   (decor/topmask.png), so it passes behind the hanging plants and covers nothing. It replaces the garland that hung on the
   right-hand wall; the occasion's garland stays in the window. Her sheet has six strands, each drawn lit and dark
   (tools/lights_build.py): warm white on ordinary days, and one of the others while the room is decorated for an occasion.
   While lit, two bulbs at a time show their dark picture for a
   moment, a twinkle made of whole frame swaps; with reduced motion they hold still. */
const WALL_AT={x:1040,y:34,cx:1240,top:40},WALL_MASK=img('decor/wallmask.png'); // the right-hand wall's shape, kept for anything hung there later
const LIGHTS_AT={x:35,y:38},TOP_AT={x:0,y:30},TOP_MASK=img('decor/topmask.png'),LIGHTS_TWINK=1700,LIGHTS_OUT=2;
const LIGHTS_KINDS_IDS=['warm','blossom','sunshine','leaves','snow','rainbow','redgold','orange','bluewhite','lantern'],LIGHTS_OLD={multi:'rainbow',star:'warm',pastel:'blossom',ember:'orange'}; /* the second sheet's ten strands (Jackie, Nov 27); a save that names one of the first six gets the nearest of these */
const LIGHTS_IMG={};let LIGHTS_META=null;LIGHTS_KINDS_IDS.forEach(n=>{LIGHTS_IMG[n+'_on']=img('decor/lights_'+n+'_on.png');LIGHTS_IMG[n+'_off']=img('decor/lights_'+n+'_off.png');});
fetch('decor/lights.json').then(r=>r.json()).then(j=>{LIGHTS_META=j;}).catch(()=>{});
const lightsCv=document.createElement('canvas');
const LIGHTS_KINDS=[['warm','Warm white'],['blossom','Blossom'],['sunshine','Sunshine'],['leaves','Falling leaves'],['snow','Snow day'],['rainbow','Rainbow'],['redgold','Red and gold'],['orange','Orange and purple'],['bluewhite','Blue and white'],['lantern','Paper lanterns']];
/* SEASONS AND HOLIDAYS (Jackie, Nov 27: "for the string lights choose seasonal for the general seasonal choice and then break up the
   decoration categories into seasonal (spring summer fall winter), and then specific holidays"). Four of the thirty sets are the
   seasons' own; the rest are holidays. The lights' "Seasonal" choice goes with whatever is up, and with the time of year when
   nothing is: pastel in spring, many colours in summer, orange and purple in autumn, gold stars in winter. */
/* STRING LIGHTS ARE NOT PART OF A SET (Jackie, Nov 27: "string lights aren't included in decoration packages"). Putting decorations out never changes the strand. "Seasonal" goes by the time of year alone: blossom in spring, sunshine in summer, falling leaves in autumn, snow day in winter. */
const LIGHTS_SEASON={spring:'blossom',summer:'sunshine',autumn:'leaves',winter:'snow'};
function lightsAuto(){return LIGHTS_SEASON[typeof seasonNow==='function'?seasonNow():'winter']||'warm';}
function lightsStrand(){if(LIGHTS_OLD[st.lightsKind])st.lightsKind=LIGHTS_OLD[st.lightsKind];if(st.lightsKind&&LIGHTS_IMG[st.lightsKind+'_on'])return st.lightsKind;return lightsAuto();} // a strand you chose yourself stays up; otherwise it follows the decorations
function lightsPick(id){st.lightsKind=id||'';if(st.noLights)st.noLights=false;st.lightsDark=false;sfx('chime');const n=(LIGHTS_KINDS.find(q=>q[0]===id)||[])[1];tell(n?'The string lights are '+n.toLowerCase()+'.':'The string lights follow the season.',{kind:'info',key:'decor',now:true});save();}
/* Always lit, day and night, unless you turn them off by tapping them; tap again and they are lit again (Jackie, Nov 27: "I want the
   string lights to always be lit up and twinkles here and there or you can turn them off i guess if you click them"). Off, the
   strand hangs dark; taking it down altogether is still in the cupboard. */
const LIGHTS_TAP={x:250,y:36,w:1170,h:60}; // the stretch of strand between the two hanging plants
function lightsLit(){return !st.lightsDark;}
function lightsTap(){st.lightsDark=!st.lightsDark;sfx('tick');tell(st.lightsDark?'The string lights are off.':'The string lights are on.',{kind:'info',key:'decor',now:true});save();}
function lightsOut(n){if(n&&typeof tantrumWild==='function'&&tantrumWild()){const k=Math.floor(performance.now()/170),out=[];let h=(k*2654435761)>>>0;for(let i=0;i<Math.ceil(n/2);i++){h=(Math.imul(h^(h>>>15),2246822519)+i*374761393)>>>0;out.push(h%n);}return out;} /* in a tantrum half the bulbs go dark, different ones every instant */
  // which bulbs are dark this moment: a few, chosen afresh every LIGHTS_TWINK ms, the same ones for the whole of that time
 if((typeof tsCalm==='function'&&tsCalm())||!n)return [];const k=Math.floor(performance.now()/LIGHTS_TWINK),out=[];let h=(k*2654435761)>>>0;
 for(let i=0;i<LIGHTS_OUT;i++){h=(Math.imul(h^(h>>>15),2246822519)+i*374761393)>>>0;out.push(h%n);}return out;}
function lightsSet(on){st.noLights=!on;sfx('tick');tell(on?'The string lights are up.':'The string lights are back in the cupboard.',{kind:'info',key:'decor',now:true});save();} // they can be taken down like the other decorations (Jackie, Nov 27: "we also need to be able to turn off the decorations")
function drawStringLights(){if(!st.started||st.noLights||!ok(TOP_MASK))return;const n=lightsStrand(),on=LIGHTS_IMG[n+'_on'],off=LIGHTS_IMG[n+'_off'];if(!ok(on)||!ok(off))return;
 const cv=lightsCv;if(cv.width!==TOP_MASK.naturalWidth){cv.width=TOP_MASK.naturalWidth;cv.height=TOP_MASK.naturalHeight;}const x=cv.getContext('2d'),ox=LIGHTS_AT.x-TOP_AT.x,oy=LIGHTS_AT.y-TOP_AT.y;
 x.globalCompositeOperation='source-over';x.clearRect(0,0,cv.width,cv.height);const dark=litPic(off,lightAt(W/2,LIGHTS_AT.y+40));
 if(!lightsLit())x.drawImage(dark,ox,oy);
 else{x.drawImage(on,ox,oy);const B=LIGHTS_META&&LIGHTS_META[n]&&LIGHTS_META[n].bulbs;if(B)for(const i of lightsOut(B.length)){const [bx,by,bw,bh]=B[i];x.clearRect(ox+bx,oy+by,bw,bh);x.drawImage(dark,bx,by,bw,bh,ox+bx,oy+by,bw,bh);}}
 x.globalCompositeOperation='destination-in';x.drawImage(TOP_MASK,0,0);g.drawImage(cv,TOP_AT.x,TOP_AT.y);}
const GARLANDS=[[WIN_AT,WIN_MASK,document.createElement('canvas')]];
function drawGarland(n){if(!st.started)return;const id=garlandNow(),[at,mask,cv]=GARLANDS[n];if(!id||!ok(mask))return;
 const im=DECOR_IMG['g_'+id];if(!ok(im))return;
 if(cv.width!==mask.naturalWidth){cv.width=mask.naturalWidth;cv.height=mask.naturalHeight;}const x=cv.getContext('2d');
 x.globalCompositeOperation='source-over';x.clearRect(0,0,cv.width,cv.height);x.drawImage(litPic(im,lightAt(at.lx||at.cx,at.ly||at.top+im.naturalHeight)),at.cx-at.x-Math.round(im.naturalWidth/2),at.top-at.y); // lit from the wall under the sill: the panes themselves are sky, which reads as full light even at night
 x.globalCompositeOperation='destination-in';x.drawImage(mask,0,0);g.drawImage(cv,at.x,at.y);}
function drawDecorWindow(){drawGarland(0);}
function drawDecorWall(){drawStringLights();} // the top of the wall: the string lights (the garland no longer hangs on the right-hand wall)
function decorSet(id){const s=DECOR_SETS.find(q=>q.id===id);st.decor=s?s.id:null;sfx(s?'chime':'tick');tell(s?'The decorations are out.':'The decorations are back in the cupboard.',{kind:'info',key:'decor',now:true});save();}
