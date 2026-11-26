'use strict';
/* THE MOON PAGE (Jackie, Nov 25: "Let's redo the moon thing", then a page "plus the evening's astrological significance or features in
   different cultures"). A tap on the moon dial opens one card about tonight's moon: its picture (the same little moon that hangs in
   the window, drawn large), its phase and how lit it is, what that does tonight, and then what tonight's moon
   is in several traditions, Western astrology among them, each on the same footing (js/moonlore.js). A festival is listed only on its own night. Nothing is sent anywhere:
   it is all worked out on the phone from the date. */
let moonEl=null;
// Only tonight (Jackie, Nov 25: "stay in the present and skip any reference to tomorrow's moon unless it explicitly affects today's reading"):
// no countdown to the next full or new moon, and no word on when the moon changes sign.
function moonPhaseLines(t){const name=moonName(t),lit=Math.round(moonLit(t)*100);
 return [name==='new moon'?'Tonight is the new moon, when the sky is dark.':name==='full moon'?'Tonight is the full moon.':/quarter/.test(name)?'Tonight the moon is at its '+name+', half lit.':'Tonight the moon is a '+name+', '+lit+'% lit.'];}
/* WHAT TONIGHT'S MOON DOES (Jackie, Nov 25: "I love significance -- I need to care ... what does that affect? tides? moods?"). Three plain
   lines for tonight's phase: the tides (the sun and moon pull together at new and full moon and against each other at the half moons),
   when the moon is up and how dark the night is, and what Western astrologers hold the phase to be good for, said as their view. */
const MOON_DOES={
 'new moon':['The sun and moon pull the sea in the same direction tonight, so the tides are at their strongest. High tides are higher and low tides lower.','The moon is up in the daytime, so the night is at its darkest. It is the best night for seeing stars.','Astrologers call the new moon a time for rest and for beginning things.'],
 'waxing crescent':['The tides are getting gentler each day as the moon moves out of line with the sun.','The moon is low in the west after sunset and sets in the evening. The rest of the night is dark.','Astrologers call a growing moon a time for starting things and building them up.'],
 'first quarter':['The sun and moon pull the sea at right angles tonight, so the tides are at their gentlest.','The moon is high at sunset and sets around midnight.','Astrologers call the first half moon a time for decisions and for pushing on.'],
 'waxing gibbous':['The tides are getting stronger each day as the moon comes into line with the sun.','The moon is up for most of the night and sets before dawn.','Astrologers call a growing moon a time for starting things and building them up.'],
 'full moon':['The sun and moon pull the sea along the same line tonight, so the tides are at their strongest. High tides are higher and low tides lower.','The moon rises at sunset and is up all night. It is bright enough to cast shadows.','Astrologers call the full moon the time when things come to a head and feelings run high. People have long blamed it for restless nights, though studies mostly have not found that.'],
 'waning gibbous':['The tides are getting gentler each day as the moon moves out of line with the sun.','The moon rises after dark and is still up in the morning.','Astrologers call a shrinking moon a time for finishing things and letting them go.'],
 'last quarter':['The sun and moon pull the sea at right angles tonight, so the tides are at their gentlest.','The moon rises around midnight and is high at dawn. The evening is dark.','Astrologers call the last half moon a time for clearing out and tidying up.'],
 'waning crescent':['The tides are getting stronger each day as the moon comes into line with the sun.','The moon rises shortly before dawn, so nearly the whole night is dark.','Astrologers call a shrinking moon a time for finishing things and letting them go.']};
function moonSignLines(t){if(typeof skyChart!=='function')return [];const sky=skyChart(t).moon;return ['In Western astrology the moon is in '+sky.name+', '+SIGN_IS[sky.i]+'.'];}
function openMoonPage(){if(moonEl)return;const t=Date.now(),el=document.createElement('div');moonEl=el;el.className='screen moonpg';
 const add=(p,tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;p.appendChild(e);return e;};
 const x=add(el,'button','tsb mpx','×');x.type='button';x.setAttribute('aria-label','Close');
 const card=add(el,'div','tsb mpcard');
 const top=add(card,'div','mptop');
 try{const c=moonPic(seasonNow(),moonAge(t)),im=add(top,'img','mppic');im.alt='';im.draggable=false;im.src=c.toDataURL();}catch(e){}
 const tt=add(top,'div','mptt');const nm=moonName(t);add(tt,'h2','mph',nm[0].toUpperCase()+nm.slice(1));
 for(const s of moonPhaseLines(t))add(tt,'p','',s);
 add(card,'h3','mpsub','What it does tonight');for(const l of MOON_DOES[nm]||[])add(card,'p','',l);
 if(typeof moonTraditions==='function'){const E=moonTraditions(t);
  if(E.fest.length){add(card,'h3','mpsub','Tonight');for(const s of E.fest)add(card,'p','mpfest',s);}
  add(card,'h3','mpsub','Tonight’s moon in different traditions');const cal=E.lines.filter(l=>l.where==='Calendars'),trad=E.lines.filter(l=>l.where!=='Calendars'); /* no tradition is the default one and the rest "elsewhere" (Jackie, Nov 25): Western astrology is one line among the others, listed in A to Z order of where each comes from */
  for(const s of moonSignLines(t))trad.push({where:'Western',say:s});trad.sort((a,b)=>a.where.localeCompare(b.where));for(const l of trad)add(card,'p','',l.say);
  if(cal.length){add(card,'h3','mpsub','Today’s date');for(const l of cal)add(card,'p','',l.say);}}
 el.addEventListener('click',e=>{if(e.target===el)closeMoonPage();});x.addEventListener('click',e=>{e.stopPropagation();closeMoonPage();});
 ui.appendChild(el);}
function closeMoonPage(){if(!moonEl)return;moonEl.remove();moonEl=null;sfx('tick');}
