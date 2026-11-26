'use strict';
/* BIRTH CHARTS AND HOROSCOPES (Jackie, Nov 16): a real birth chart for everyone in the room (you, the cat, each monster),
   a horoscope for each of them every day, and how each pair gets along, today and always. The CHARTS button in the moon box.
   - Birth moments: a monster's is the minute it sprouted (st.bornAt, kept from Nov 16; older monsters get an estimate from
     their age, marked "about"); the cat is about 1.34 years old when the game starts (Jackie, Nov 16), so its birth is 1.34
     years before the moment the game began (st.catBornAt, the moment you met; for older games, an estimate
     from the first monster's); yours is the birthday you enter (st.you: date, and if you know them a birth time and the city
     you were born in, picked from a list of the world's cities, data/cities.json).
   - Places: your rising sign needs your birth city and time. The cat and the monsters were born where you play, worked out
     from the phone's time zone (its biggest city), so they have rising signs too.
   - The sky is real (js/sky.js). The meanings are the traditional ones, written as plain sentences (Jackie, Nov 16: no
     clever paired lines, just straightforward prose): each body is about one part of a personality and each sign has a
     character, for example "The moon is about feelings, and Leo is a warm, confident sign."
   - Today's horoscope: the strongest one or two angles today's sky makes to someone's sun, moon or rising sign, each as
     one sentence. Together: whether today's moon suits both charts, and how the two suns and the two moons fit.
   No genders anywhere: everyone is said by name. */
const SIGN_IS=['a bold, impatient sign','a steady, comfort-loving sign','a curious, talkative sign','a caring, home-loving sign','a warm, confident sign','a careful, practical sign','a friendly, fair-minded sign','an intense, private sign','an adventurous, optimistic sign','a patient, hard-working sign','an independent, original sign','a dreamy, gentle sign'];
const BODY_ABOUT={sun:'who someone is at heart',moon:'feelings',asc:'how someone comes across to others',mercury:'thinking and talking',venus:'love and what someone enjoys',mars:'energy and drive',jupiter:'luck and growth',saturn:'discipline and hard lessons'};
const BODY_THE={sun:'The sun',moon:'The moon',asc:'The rising sign',mercury:'Mercury',venus:'Venus',mars:'Mars',jupiter:'Jupiter',saturn:'Saturn'};
const BODY_NAME={sun:'Sun',moon:'Moon',asc:'Rising',mercury:'Mercury',venus:'Venus',mars:'Mars',jupiter:'Jupiter',saturn:'Saturn'};
const BODY_GLYPH={sun:'☉',moon:'☽',asc:'AC',mercury:'☿',venus:'♀',mars:'♂',jupiter:'♃',saturn:'♄'};
// today's sky on someone: by the moving body, an easy aspect and a hard one
// today's sky on someone, by the moving body: what an easy angle, a tense angle and a meeting usually bring
const TRANSIT={moon:{easy:'so the mood should be relaxed',hard:'so moods may swing a little',big:'so feelings will be strong'},
  sun:{easy:'so it is a good day to get things done',hard:'so things may take more effort',big:'so it is a good day to start something'},
  mercury:{easy:'so it is a good day for talking and ideas',hard:'so messages may get mixed up',big:'so there will be a lot to think and talk about'},
  venus:{easy:'so expect extra affection',hard:'so someone may want more attention',big:'so it should be an affectionate day'},
  mars:{easy:'so there will be plenty of energy',hard:'so tempers may be short',big:'so there will be a lot of energy to use up'},
  jupiter:{easy:'so some good luck is likely',hard:'so it is easy to overdo things',big:'so this is a lucky stretch'},
  saturn:{easy:'so steady work will pay off',hard:'so the day may feel heavy',big:'so this is a time for patience'}};
const POINT_OF={sun:'sun',moon:'moon',asc:'rising sign'};
const CAT_AGE0=1.34; // how old the cat is, in years, when the game starts
let CITIES=null,citiesP=null;
function citiesLoad(){return citiesP||(citiesP=fetch('data/cities.json').then(r=>r.json()).then(j=>{CITIES=j;return j}).catch(e=>{citiesP=null;throw e}))}
function cityRow(r){return {n:r[0],lat:r[1],lon:r[2],tz:CITIES.tz[r[3]],cc:r[4],region:r[5],country:CITIES.country[r[4]]||r[4]}}
function cityLabel(c){return c.n+(c.region&&c.region!==c.n?', '+c.region:'')+', '+c.country}
const fold=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
function citySearch(q,n=8){if(!CITIES)return [];q=fold(q.trim());if(q.length<2)return [];const out=[];
  for(const r of CITIES.cities){const a=fold(r[0]),b=r[7]?fold(r[7]):'';if(a.startsWith(q)||b.startsWith(q)){out.push(cityRow(r));if(out.length>=n)break}}
  if(out.length<n)for(const r of CITIES.cities){const a=fold(r[0]);if(!a.startsWith(q)&&a.includes(q)){out.push(cityRow(r));if(out.length>=n)break}}
  return out}
// where you play: the biggest city in the phone's time zone
function homePlace(){if(st.home)return st.home;let tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone}catch(e){}
  if(!CITIES||!tz)return null;const i=CITIES.tz.indexOf(tz);if(i<0)return null;const r=CITIES.cities.find(r=>r[3]===i);if(!r)return null;
  const c=cityRow(r);st.home={n:c.n,lat:c.lat,lon:c.lon,tz:c.tz,auto:1};save();return st.home}
// a wall-clock time in a time zone, as a moment (daylight saving included, as the phone's own time-zone rules know it)
function tzOffset(t,tz){try{const p=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).formatToParts(new Date(t)),g=k=>+p.find(x=>x.type===k).value;
  return Date.UTC(g('year'),g('month')-1,g('day'),g('hour')%24,g('minute'),g('second'))-t}catch(e){return 0}}
function wallToUTC(y,mo,d,h,mi,tz){const guess=Date.UTC(y,mo,d,h,mi);let t=guess-tzOffset(guess,tz);t=guess-tzOffset(t,tz);return t}
function fmtWhen(t,tz){try{return new Date(t).toLocaleString(undefined,{year:'numeric',month:'long',day:'numeric',hour:'numeric',minute:'2-digit',...(tz?{timeZone:tz}:{})})}catch(e){return new Date(t).toLocaleString()}}
// everyone in the room who has a birth moment: you (once entered), the cat, the monsters that have sprouted
function plantAgeMs(q){const f=q.stage>=1?[0,3600,3600+86400,3600+86400+172800][[1,4,6,8].indexOf(q.stage)]:null;return f==null?null:(f+(q.timer||0))*1000}
function chartPeople(){const home=homePlace(),P=[];
  if(st.you&&st.you.date){const y=st.you,[Y,M,D]=y.date.split('-').map(Number),[h,mi]=(y.time||'12:00').split(':').map(Number),tz=(y.place&&y.place.tz)||(home&&home.tz)||'UTC';
    P.push({k:'you',name:'You',t:wallToUTC(Y,M-1,D,h,mi,tz),tz,place:y.time&&y.place?y.place:null,noTime:!y.time,when:y.date})}
  else P.push({k:'you',name:'You',t:null});
  if(st.started){let t=st.catBornAt,about=false;if(!t){const q=allRaw().filter(q=>q.stage>=1)[0];t=q?(q.bornAt||Date.now()-plantAgeMs(q))-5*60000:Date.now();about=true}
    t-=CAT_AGE0*365.2425*864e5; // born 1.34 years before you met
    P.push({k:'cat',name:catName(),t,about,tz:home&&home.tz,place:home,look:'cat'})}
  for(const q of allRaw())if(q.stage>=1){const about=!q.bornAt,t=q.bornAt||Date.now()-plantAgeMs(q);P.push({k:'p'+q.id,name:nameOf(q,true),t,about,tz:home&&home.tz,place:home,q})}
  return P}
function chartOf(p){if(!p.t)return null;if(!p._c)p._c=skyChart(p.t,p.place);return p._c}
function chartLine(p,b,c){return BODY_THE[b]+' is about '+BODY_ABOUT[b]+', and '+c[b].name+' is '+SIGN_IS[c[b].i]+'.'}
// today's horoscope for one person: the strongest aspects today's sky makes to their sun, moon and rising
function horoscope(p,now){const c=chartOf(p);if(!c)return null;const sky=skyChart(now);const hits=[];
  const pts=['sun','moon'].concat(c.asc?['asc']:[]),weight={moon:3,sun:2,venus:2,mars:2,mercury:1.5,jupiter:1.2,saturn:1.2},pw={sun:1.2,moon:1,asc:.8};
  for(const tb of ['moon','sun','mercury','venus','mars','jupiter','saturn'])for(const np of pts){if(p.noTime&&np==='moon'&&tb!=='moon')continue;const a=skyAspect(sky[tb].lon,c[np].lon,true);if(a)hits.push({tb,np,a,s:weight[tb]*pw[np]*(1-a.off/8)})}
  hits.sort((x,y)=>y.s-x.s);const who=p.k==='you'?'your':p.name+'’s';
  const say=h=>{const kind=h.a.n==='conjunct'?'big':(h.a.n==='trine'||h.a.n==='sextile')?'easy':'hard';
    const rel={conjunct:'in the same place as',trine:'at an easy angle to',sextile:'at a helpful angle to',square:'at a tense angle to',opposite:'opposite'}[h.a.n];
    return BODY_THE[h.tb]+' is '+rel+' '+who+' '+POINT_OF[h.np]+' today, '+TRANSIT[h.tb][kind]+'.'};
  if(hits.length){const out=[say(hits[0])];const h2=hits.find(h=>h.tb!==hits[0].tb&&h.np!==hits[0].np);if(h2&&h2.s>1)out.push(say(h2));return out.join(' ')}
  const m=sky.moon,same=m.element===c.sun.element;return 'The moon is in '+m.name+' today. '+(same?'That is the same element as '+who+' sun, so it should be an easy day.':'Nothing in the sky is at a strong angle to '+who+' chart, so it should be a quiet day.')}
// two people: today, and always
const ELEM_FIT=(a,b)=>a===b?'same':({fire:'air',air:'fire',earth:'water',water:'earth'})[a]===b?'pair':'diff';
function together(p1,p2,now){const c1=chartOf(p1),c2=chartOf(p2);if(!c1||!c2)return null;const m=skyChart(now).moon;
  const f1=ELEM_FIT(m.element,c1.sun.element),f2=ELEM_FIT(m.element,c2.sun.element),good=v=>v!=='diff',you=p1.k==='you'||p2.k==='you',two=you?'the two of you':'the two of them';
  const P=(p,cap)=>p.k==='you'?(cap?'Your':'your'):p.name+'’s';
  const today='The moon is in '+m.name+' today, which '+(good(f1)&&good(f2)?'suits both charts, so it is a good day for '+two+' to do something together.':good(f1)||good(f2)?'suits one chart more than the other, so '+two+' may need to be patient with each other.':'suits neither chart, so '+two+' may want some space from each other.');
  const sf=ELEM_FIT(c1.sun.element,c2.sun.element),mf=ELEM_FIT(c1.moon.element,c2.moon.element);
  const always=P(p1,1)+' sun and '+P(p2)+' sun are '+(sf==='same'?'both in '+c1.sun.element+' signs, which usually makes for an easy friendship.':'in '+c1.sun.element+' and '+c2.sun.element+' signs, which '+(sf==='pair'?'usually get along well.':'are quite different, so '+two+' may see things differently.'))
    +' The two moons are in '+(mf==='diff'?'different kinds of signs, so '+two+' may react to things differently.':'compatible signs, so '+two+' tend to feel things in similar ways.');
  return {today,always}}
/* THE LITTLE ROUND ICONS (Jackie, Nov 25: the sign icons should be "cuter and more even in size in relation to each other, and spacing
   in relation with the text"). The signs used to be the font's own zodiac characters, which every phone draws at a different size and
   weight. Each sign and each body is now a small drawing made here, all on the same 24 by 24 grid with the same round line, set in a
   round chip the height of the text beside it. A sign's chip is coloured by its element: fire pink, earth green, air lilac, water blue. */
const SIGN_ART=['M12 20V9M12 9C12 4 5 3 5 8M12 9C12 4 19 3 19 8','M5 4C6 9 9 10 12 10C15 10 18 9 19 4M12 10a5 5 0 1 0 .01 0','M6 4C10 6 14 6 18 4M6 20C10 18 14 18 18 20M9 5.5V18.5M15 5.5V18.5',
 'M5.5 9C7 4 15 4 19 7M18.5 15C17 20 9 20 5 17M8 6.5a2.5 2.5 0 1 0 .01 0M16 12.5a2.5 2.5 0 1 0 .01 0','M8 11a3 3 0 1 0 .01 0M11 14C11 8 9 5 13 5C17 5 16 10 15 14C14 18 16 20 19 18',
 'M4 6V18M4 8C4 5 9 5 9 8V18M9 8C9 5 14 5 14 8V17C14 20 17 21 19 19M14 12C18 9 20 13 17 16C16 17 15 18 13 19','M4 19H20M4 15H9C7 13 7 7 12 7C17 7 17 13 15 15H20',
 'M4 6V18M4 8C4 5 9 5 9 8V18M9 8C9 5 14 5 14 8V17C14 19 16 20 19 18M17 15.5L19.5 18L17 20.5','M5 19L19 5M12 5H19V12M7 11L13 17','M4 6L8 16L11 7C12 12 13 16 16 17C19 18 20 14 17 13C14 13 13 17 15 20',
 'M4 10L7 7L10 10L13 7L16 10L19 7M4 16L7 13L10 16L13 13L16 16L19 13','M6 4C10 8 10 16 6 20M18 4C14 8 14 16 18 20M5 12H19'];
const BODY_ART={sun:'M12 6a6 6 0 1 0 .01 0M12 11.2a.8 .8 0 1 0 .01 0',moon:'M15 4A8 8 0 1 0 15 20A6.5 6.5 0 1 1 15 4Z',asc:'M4 19H20M12 16V5M8 9L12 5L16 9',mercury:'M12 7a4 4 0 1 0 .01 0M12 15V21M9 18.5H15M8 3C8 6 16 6 16 3',
 venus:'M12 4a5 5 0 1 0 .01 0M12 14V21M9 18H15',mars:'M10 9a5 5 0 1 0 .01 0M13.5 10.5L19 5M14.5 5H19V9.5',jupiter:'M6 8C8 4 13 5 12 9C11 12 8 14 6 15H18M15 6V20',saturn:'M8 4V16M5 7H11M8 11C10 8 15 9 15 13C15 16 13 17 13 19C13 20.5 15 21 16 20'};
function chip(path,cls,label){const s=document.createElement('span');s.className='zchip '+cls;s.setAttribute('role','img');s.setAttribute('aria-label',label);
 s.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+path+'" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';return s}
function signChip(s){return chip(SIGN_ART[s.i],'z'+s.element,s.name)}
function bodyChip(b){return chip(BODY_ART[b],'zbody',BODY_NAME[b])}
/* ---------- the CHARTS page in the moon box ---------- */
let chartSel='cat';
function chartsShow(){tr={k:'charts',step:'charts',cards:[],open:[]};tarotTabs();const st0=tStage();st0.innerHTML='<div class="chwrap"><div class="chcard"></div></div>';tSay('');
  // FEWER BOXES (Jackie, Nov 17: "too many buttons ... the charts page (with the sun moon boxes plus the selection menu)"): the people
  // are plain names along the top row, the picked one filled in; sun, moon and rising are one plain row with no boxes; the
  // note about where the charts come from is the last line of the chart, not a strip along the bottom
  const pk=tarotEl.querySelector('.tpick');pk.innerHTML='<div class="chpeople"></div>';tStage().querySelector('.chcard').textContent='Loading the sky…';
  citiesLoad().catch(()=>{}).finally(()=>{if(!tarotEl||tr.k!=='charts')return;chartsDraw()})}
function chartsDraw(){const P=chartPeople(),pe=tarotEl.querySelector('.chpeople');pe.innerHTML='';if(!P.find(p=>p.k===chartSel))chartSel=P[0].k;
  for(const p of P){const b=document.createElement('button');b.type='button';b.className='chp'+(p.k===chartSel?' on':'');b.textContent=p.name;
    b.addEventListener('click',e=>{e.stopPropagation();sfx('tick');chartSel=p.k;chartsDraw()});pe.appendChild(b)}
  const p=P.find(p=>p.k===chartSel),card=tarotEl.querySelector('.chcard');card.innerHTML='';card.scrollTop=0;
  if(p.k==='you'&&!p.t){chartForm(card);return}
  const c=chartOf(p),now=Date.now(),add=(cls,txt)=>{const d=document.createElement('div');d.className=cls;d.textContent=txt;card.appendChild(d);return d};
  add('chname',p.name);
  add('chborn',(p.k==='you'||p.k==='cat'?'Born ':'Sprouted ')+(p.about?'about ':'')+(p.k==='you'?new Date(p.when+'T12:00').toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})+(st.you.time?', '+st.you.time:''):fmtWhen(p.t,p.tz))+(p.place?' · '+p.place.n:''));
  const big=document.createElement('div');big.className='chbig';
  for(const b of ['sun','moon','asc']){const s=c[b],d=document.createElement('div');d.className='chb';
    d.innerHTML='<span class="chl"></span><span class="chs"></span>';const l=d.querySelector('.chl'),n=d.querySelector('.chs');l.append(bodyChip(b),document.createTextNode(BODY_NAME[b]));
    if(s)n.append(signChip(s),document.createTextNode(s.name));else n.textContent='—';big.appendChild(d)}
  card.appendChild(big);
  if(p.noTime){const m0=skySign(skyLon('moon',p.t-12*36e5)),m1=skySign(skyLon('moon',p.t+12*36e5));if(m0.i!==m1.i)add('chnote','Without a birth time, the moon could be in '+m0.name+' or '+m1.name+' (it changed signs that day).')}
  if(!c.asc)add('chnote',p.k==='you'?'Add your birth time and city to see your rising sign.':'');
  add('chh','Today');add('chtoday',horoscope(p,now));
  // your own tab is about you and nobody else (Jackie, Nov 25: "i don't want my horoscope page to say anything about the other guys on my individual tab only theirs"): how you get on with the cat or a monster is on their tab
  const others=p.k==='you'?[]:chartPeople().filter(q=>q.k!==p.k&&q.t);if(others.length){add('chh','Together');for(const q of others){const tg=together(p,q,now);if(!tg)continue;const d=add('chtog','');
    const h=document.createElement('b');h.textContent=(p.k==='you'?'You':p.name)+' & '+(q.k==='you'?'you':q.name)+'. ';d.append(h,document.createTextNode(tg.today+' '+tg.always))}}
  add('chh','The whole chart');
  for(const b of ['sun','moon','asc','mercury','venus','mars','jupiter','saturn']){const s=c[b];if(!s)continue;const d=add('chrow','');
    const h=document.createElement('b');h.textContent=BODY_NAME[b]+' in '+s.name+(s.rx?' (retrograde)':'')+'. ';const t=document.createElement('span');t.append(h,document.createTextNode(chartLine(p,b,c)));d.append(bodyChip(b),signChip(s),t)}
  if(p.k==='you'){const e=document.createElement('button');e.type='button';e.className='tmore chedit';e.textContent='Change my birth details';e.addEventListener('click',ev=>{ev.stopPropagation();chartForm(card)});card.appendChild(e)}
  add('chnote','These charts use the real positions of the planets and the traditional astrological meanings.')}
// your birth details: a date, a time if you know it, and the city you were born in
function chartForm(card){card.innerHTML='';const y=st.you||{};let city=y.place||null;
  card.innerHTML='<div class="chname">Your birth chart</div><div class="chnote">Your birthday stays on this phone (and in your backup file), nowhere else.</div>'+
    '<label class="chf">Birthday<input type="date" class="chdate"></label><label class="chf">Birth time, if you know it<input type="time" class="chtime"></label>'+
    '<label class="chf">City you were born in<input type="text" class="chcity" autocomplete="off" placeholder="Start typing…"></label><div class="chsug"></div>'+
    '<div class="chbtns"><button type="button" class="tsb chsave">Show my chart</button></div>';
  const D=card.querySelector('.chdate'),T=card.querySelector('.chtime'),C=card.querySelector('.chcity'),S=card.querySelector('.chsug');
  D.value=y.date||'';T.value=y.time||'';C.value=city?cityLabel(city):'';const today=tarotToday();D.max=today;D.min='1900-01-01'; // the phone's own date picker doesn't always obey these (iPhone lets you scroll past today), so the date is checked again below
  const warn=document.createElement('div');warn.className='chnote chwarn';card.querySelector('.chbtns').before(warn);
  const okDate=()=>{const v=D.value;warn.textContent=!v?'':v>today?'That day hasn’t happened yet. Pick your birthday.':v<D.min?'Pick a year from 1900 on.':'';return !!v&&!warn.textContent};
  D.addEventListener('change',okDate);D.addEventListener('input',okDate);
  for(const el of [D,T,C])['click','pointerdown','keydown'].forEach(ev=>el.addEventListener(ev,e=>e.stopPropagation()));
  C.addEventListener('input',()=>{city=null;S.innerHTML='';const go=()=>{for(const m of citySearch(C.value)){const b=document.createElement('button');b.type='button';b.className='chpick';b.textContent=cityLabel(m);
      b.addEventListener('click',e=>{e.stopPropagation();city={n:m.n,lat:m.lat,lon:m.lon,tz:m.tz,country:m.country,region:m.region};C.value=cityLabel(m);S.innerHTML=''});S.appendChild(b)}};
    if(CITIES)go();else citiesLoad().then(go).catch(()=>{})});
  card.querySelector('.chsave').addEventListener('click',e=>{e.stopPropagation();if(!D.value){D.focus();return}if(!okDate()){sfx('tick');return}sfx('tick');
    st.you={date:D.value,time:T.value||null,place:city};save();chartSel='you';chartsDraw()})}
