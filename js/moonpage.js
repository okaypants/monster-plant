'use strict';
/* THE MOON PAGE (Jackie, Nov 25: "Let's redo the moon thing", then a page "plus the evening's astrological significance or features in
   different cultures"). A tap on the moon dial opens one card about tonight's moon: its picture (the same little moon that hangs in
   the window, drawn large), its phase and how lit it is, what that does tonight, and then what tonight's moon
   is in several traditions, Western astrology among them, each on the same footing (js/moonlore.js). A festival is listed only on its own night. Nothing is sent anywhere:
   it is all worked out on the phone from the date. */
let moonEl=null;
/* THE MOON'S PICTURE (Jackie, Nov 25: "find images to represent the moon from classic public domain", "to replace the shitty one of for
   instance a waning gibbous"; shown the candidates: "Yes, Hevelius"). Johannes Hevelius watched the moon from a rooftop in Danzig and
   engraved it night by night through a whole month for the book Selenographia (1647). The 28 plates are kept with the game, each cut
   to the moon and otherwise untouched (moon/hNN.jpg, tools/moon_plates.py; scans from the Bibliothèque nationale de France, public
   domain). The page shows the plate nearest tonight's moon, by its age in days. Hevelius drew the moon as it stands in the northern
   sky; south of the equator the picture is turned upside down, which is how the moon looks from there. */
const MOON_PLATE_AGE=[0.0, 1.09, 2.18, 3.28, 4.37, 5.46, 6.55, 7.65, 8.74, 9.83, 10.92, 12.02, 13.11, 14.2, 15.3, 16.25, 17.19, 18.14, 19.08, 20.03, 20.98, 21.92, 22.87, 23.82, 24.76, 25.71, 26.65, 27.6];
function moonPlate(t){const a=moonAge(t);let best=0,bd=99;MOON_PLATE_AGE.forEach((p,i)=>{const d=Math.min(Math.abs(p-a),MOON_MONTH-Math.abs(p-a));if(d<bd){bd=d;best=i;}});return 'moon/h'+String(best+1).padStart(2,'0')+'.jpg';}
function moonSouth(){try{const h=typeof homePlace==='function'?homePlace():null;return !!h&&h.lat<0;}catch(e){return false;}}
// Only tonight (Jackie, Nov 25: "stay in the present and skip any reference to tomorrow's moon unless it explicitly affects today's reading"):
// no countdown to the next full or new moon, and no word on when the moon changes sign.
function moonPhaseLines(t){const name=moonName(t),lit=Math.round(moonLit(t)*100);
 return [name==='new moon'?'Tonight is the new moon, when the sky is dark.':name==='full moon'?'Tonight is the full moon.':/quarter/.test(name)?'Tonight the moon is at its '+name+', half lit.':'Tonight the moon is a '+name+', '+lit+'% lit.'];}
/* WHAT TONIGHT'S MOON DOES (Jackie, Nov 25: "I love significance -- I need to care ... what does that affect? tides? moods?"). Three plain
   lines for tonight's phase: the tides (the sun and moon pull together at new and full moon and against each other at the half moons),
   when the moon is up and how dark the night is, and what Western astrologers hold the phase to be good for, said as their view. */
const MOON_DOES={
 'new moon':['The sun and moon pull the sea in the same direction tonight, so the tides are about at their strongest. High tides are higher and low tides lower.','The moon is up in the daytime, so the night is at its darkest. It is the best night for seeing stars.','Astrologers call the new moon a time for beginning things.'],
 'waxing crescent':['The tides are getting gentler each day as the moon moves out of line with the sun.','The moon is low in the west after sunset and sets in the evening. The rest of the night is dark.','Astrologers call a growing moon a time for starting things and building them up.'],
 'first quarter':['The sun and moon pull the sea at right angles tonight, so the tides are about at their gentlest.','The moon is high at sunset and sets around midnight.','Astrologers call the first half moon a time for decisions and for pushing on.'],
 'waxing gibbous':['The tides are getting stronger each day as the moon comes into line with the sun.','The moon is up for most of the night and sets before dawn.','Astrologers call a growing moon a time for starting things and building them up.'],
 'full moon':['The sun and moon pull the sea along the same line tonight, so the tides are about at their strongest. High tides are higher and low tides lower.','The moon rises at sunset and is up all night. It is bright enough to cast shadows.','Astrologers call the full moon the time when things come to a head and feelings run high. People have long blamed it for restless nights. Studies have not found that it changes how people behave. A few have found people sleep a little less in the nights before it, and others have found nothing.'],
 'waning gibbous':['The tides are getting gentler each day as the moon moves out of line with the sun.','The moon rises after dark and is still up in the morning.','Astrologers call a shrinking moon a time for finishing things and letting them go.'],
 'last quarter':['The sun and moon pull the sea at right angles tonight, so the tides are about at their gentlest.','The moon rises around midnight and is high at dawn. The evening is dark.','Astrologers call the last half moon a time for clearing out and tidying up.'],
 'waning crescent':['The tides are getting stronger each day as the moon comes into line with the sun.','The moon rises in the last hours before dawn, so most of the night is dark.','Astrologers call a shrinking moon a time for finishing things and letting them go.']};
function moonSignLines(t){if(typeof skyChart!=='function')return [];const sky=skyChart(t).moon;return ['In Western astrology the moon is in '+sky.name+', '+SIGN_IS[sky.i]+'.'];}
function openMoonPage(){if(moonEl)return;const t=Date.now(),el=document.createElement('div');moonEl=el;el.className='screen moonpg';
 const add=(p,tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;p.appendChild(e);return e;};
 const x=add(el,'button','tsb mpx','×');x.type='button';x.setAttribute('aria-label','Close');
 const card=add(el,'div','tsb mpcard');
 const top=add(card,'div','mptop');
 const fig=add(top,'div','mpfig'),im=add(fig,'img','mppic');im.alt='';im.draggable=false;im.src=moonPlate(t);if(moonSouth())im.classList.add('mpsouth');add(fig,'div','mpcredit','Johannes Hevelius, 1647');
 const tt=add(top,'div','mptt');const nm=moonName(t);add(tt,'h2','mph',nm[0].toUpperCase()+nm.slice(1));
 for(const s of moonPhaseLines(t))add(tt,'p','',s);
 /* Each line sits in its own little rounded box with a coloured tag saying what it is about (Jackie, Nov 25: "each little thing ... in its
    own cute little rounded box like on its own card in that card ... a lot more kawaii AND cool"). The colours are flat pastels with the
    game's dark outline; a tag's colour goes with its box. */
 const box=(grid,tag,text,tint)=>{const b=add(grid,'div','mpitem mp'+tint);add(b,'span','mpchip',tag);add(b,'p','',text);return b;};
 const sect=(title)=>{add(card,'h3','mpsub',title);return add(card,'div','mpgrid');};
 const D=MOON_DOES[nm]||[],g1=sect('What it does tonight');[['Tides','aqua'],['Sky','lilac'],['Astrologers say','pink']].forEach(([tag,tint],k)=>{if(D[k])box(g1,tag,D[k],tint);});
 if(typeof moonTraditions==='function'){const E=moonTraditions(t);
  if(E.fest.length){const g=sect('Tonight');for(const s of E.fest)box(g,'Festival',s,'gold');}
  const g2=sect('Tonight’s moon in different traditions'),cal=E.lines.filter(l=>l.where==='Calendars'),trad=E.lines.filter(l=>l.where!=='Calendars'); /* no tradition is the default one and the rest "elsewhere" (Jackie, Nov 25): Western astrology is one box among the others, in A to Z order of where each comes from */
  for(const s of moonSignLines(t))trad.push({where:'Western',say:s});trad.sort((a,b)=>a.where.localeCompare(b.where));
  const TAG={Arabic:['Arabic','sand'],'Hawaiʻi':['Hawaiian','mint'],India:['Indian','peach'],Japan:['Japanese','pink'],Western:['Western','lilac']};
  for(const l of trad){const[tag,tint]=TAG[l.where]||[l.where,'sand'];box(g2,tag,l.say,tint);}
  if(cal.length){const g3=sect('Today’s date');for(const l of cal)box(g3,'Calendars',l.say,'aqua');}}
 el.addEventListener('click',e=>{if(e.target===el)closeMoonPage();});x.addEventListener('click',e=>{e.stopPropagation();closeMoonPage();});
 ui.appendChild(el);}
function closeMoonPage(){if(!moonEl)return;moonEl.remove();moonEl=null;sfx('tick');}
