'use strict';
/* THE MOON PAGE (Jackie, Nov 25: "Let's redo the moon thing", then a page "plus the evening's astrological significance or features in
   different cultures"). A tap on the moon dial opens one card about tonight's moon: its picture (the same little moon that hangs in
   the window, drawn large), its phase and how lit it is, when the next full or new moon comes, the sign it is in and when it moves on,
   and then what tonight is called elsewhere (js/moonlore.js). A festival is listed only on its own night. Nothing is sent anywhere:
   it is all worked out on the phone from the date. */
let moonEl=null;
function moonPhaseLines(t){const name=moonName(t),lit=Math.round(moonLit(t)*100),a=moonAge(t),nights=x=>x===1?'tomorrow night':'in '+x+' nights',out=[];
 out.push(name==='new moon'?'Tonight is the new moon, when the sky is dark.':name==='full moon'?'Tonight is the full moon.':/quarter/.test(name)?'Tonight the moon is at its '+name+', half lit.':'Tonight the moon is a '+name+', '+lit+'% lit.');
 const half=MOON_MONTH/2,toFull=Math.round(((half-a)%MOON_MONTH+MOON_MONTH)%MOON_MONTH),toNew=Math.round(((MOON_MONTH-a)%MOON_MONTH+MOON_MONTH)%MOON_MONTH);
 if(name!=='full moon'&&toFull>0&&toFull<=toNew)out.push('The full moon is '+nights(toFull)+'.');else if(name!=='new moon'&&toNew>0)out.push('The new moon is '+nights(toNew)+'.');
 return out;}
function moonSignLines(t){if(typeof skyChart!=='function')return [];const sky=skyChart(t).moon;let u=t,nx=sky;for(let h=1;h<=80&&nx.i===sky.i;h++){u=t+h*36e5;nx=skyChart(u).moon;}
 const days=Math.round((new Date(u).setHours(0,0,0,0)-new Date(t).setHours(0,0,0,0))/864e5),when=days<=0?'later today':days===1?'tomorrow':'on '+new Date(u).toLocaleDateString(undefined,{weekday:'long'});
 return ['The moon is in '+sky.name+'. '+chartLine(null,'moon',{moon:sky}),'It moves into '+nx.name+' '+when+'.'];}
function openMoonPage(){if(moonEl)return;const t=Date.now(),el=document.createElement('div');moonEl=el;el.className='screen moonpg';
 const add=(p,tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;p.appendChild(e);return e;};
 const x=add(el,'button','tsb mpx','×');x.type='button';x.setAttribute('aria-label','Close');
 const card=add(el,'div','tsb mpcard');
 const top=add(card,'div','mptop');
 try{const c=moonPic(seasonNow(),moonAge(t)),im=add(top,'img','mppic');im.alt='';im.draggable=false;im.src=c.toDataURL();}catch(e){}
 const tt=add(top,'div','mptt');const nm=moonName(t);add(tt,'h2','mph',nm[0].toUpperCase()+nm.slice(1));
 for(const s of moonPhaseLines(t))add(tt,'p','',s);
 const sg=moonSignLines(t);if(sg.length){add(card,'h3','mpsub','In the zodiac');for(const s of sg)add(card,'p','',s);}
 if(typeof moonElsewhere==='function'){const E=moonElsewhere(t);
  if(E.fest.length){add(card,'h3','mpsub','Tonight');for(const s of E.fest)add(card,'p','mpfest',s);}
  add(card,'h3','mpsub','Tonight elsewhere');for(const l of E.lines)add(card,'p','',l.say);}
 el.addEventListener('click',e=>{if(e.target===el)closeMoonPage();});x.addEventListener('click',e=>{e.stopPropagation();closeMoonPage();});
 ui.appendChild(el);}
function closeMoonPage(){if(!moonEl)return;moonEl.remove();moonEl=null;sfx('tick');}
