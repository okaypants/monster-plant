'use strict';
/* BIRTH CHARTS AND HOROSCOPES (Jackie, Nov 16): a real birth chart for everyone in the room (you, the cat, each monster),
   a horoscope for each of them every day, and how each pair gets along, today and always. The CHARTS button in the moon box.
   - Birth moments: a monster's is the minute it sprouted (st.bornAt, kept from Nov 16; older monsters get an estimate from
     their age, marked "about"); the cat's is when it first came into the room (st.catBornAt; for older games, an estimate
     from the first monster's); yours is the birthday you enter (st.you: date, and if you know them a birth time and the city
     you were born in, picked from a list of the world's cities, data/cities.json).
   - Places: your rising sign needs your birth city and time. The cat and the monsters were born where you play, worked out
     from the phone's time zone (its biggest city), so they have rising signs too.
   - The sky is real (js/sky.js). What it means is the old tradition, said plainly: each body is one part of a personality
     (the sun who you are, the moon your feelings, rising how you meet the world, Mercury talking and thinking, Venus love and
     taste, Mars drive, Jupiter luck and growth, Saturn lessons), and each sign is a way of doing it.
   - Today's horoscope: what today's real sky is doing to each chart (the moon, the sun and the planets making aspects to
     someone's sun, moon or rising), the strongest one or two, in plain words. Together: today's moon against both suns, and,
     to keep, how the two charts' suns and moons fit (same element, complementary elements, or different).
   No genders anywhere: everyone is said by name. */
const SIGN_HOW=['boldly and fast, first in line','steadily, with comfort and good things','curiously, in many directions at once','tenderly, close to home','warmly and with flair','carefully, noticing every detail','gracefully, looking for balance','deeply and intensely','freely, with big hopes','patiently, building for the long run','in an original way, a little apart from the crowd','dreamily, with a big, soft heart'];
const BODY_DOES={sun:'shines',moon:'feels',asc:'meets the world',mercury:'thinks and talks',venus:'loves',mars:'goes after things',jupiter:'grows and finds luck',saturn:'learns life\'s lessons'};
const BODY_NAME={sun:'Sun',moon:'Moon',asc:'Rising',mercury:'Mercury',venus:'Venus',mars:'Mars',jupiter:'Jupiter',saturn:'Saturn'};
const BODY_GLYPH={sun:'☉',moon:'☽',asc:'AC',mercury:'☿',venus:'♀',mars:'♂',jupiter:'♃',saturn:'♄'};
// today's sky on someone: by the moving body, an easy aspect and a hard one
const TRANSIT={moon:{easy:'an easy, comfy mood',hard:'some moody moments, so go gently',big:'feelings run big'},
  sun:{easy:'a day to shine',hard:'a little friction; take it slow',big:'a fresh-start feeling'},
  mercury:{easy:'good for chatting and new ideas',hard:'mixed-up messages',big:'a busy, chatty head'},
  venus:{easy:'extra affection all around',hard:'wanting a bit more attention',big:'a sweet, cuddly day'},
  mars:{easy:'lots of get-up-and-go',hard:'a short fuse; burn off the extra energy',big:'bursting with energy'},
  jupiter:{easy:'lucky breaks',hard:'too much of a good thing',big:'a big, lucky, growing time'},
  saturn:{easy:'steady progress',hard:'a tiring, serious day',big:'a time to be patient and build'}};
const POINT_OF={sun:'sun',moon:'moon',asc:'rising sign'};
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
    P.push({k:'cat',name:catName(),t,about,tz:home&&home.tz,place:home,look:'cat'})}
  for(const q of allRaw())if(q.stage>=1){const about=!q.bornAt,t=q.bornAt||Date.now()-plantAgeMs(q);P.push({k:'p'+q.id,name:nameOf(q,true),t,about,tz:home&&home.tz,place:home,q})}
  return P}
function chartOf(p){if(!p.t)return null;if(!p._c)p._c=skyChart(p.t,p.place);return p._c}
function chartLine(p,b,c){const s=c[b];return p.name+' '+(p.k==='you'?BODY_DOES[b].replace('shines','shine').replace('feels','feel').replace('meets','meet').replace('thinks and talks','think and talk').replace('loves','love').replace('goes','go').replace('grows and finds','grow and find').replace('learns','learn'):BODY_DOES[b])+' '+SIGN_HOW[s.i]+'.'}
// today's horoscope for one person: the strongest aspects today's sky makes to their sun, moon and rising
function horoscope(p,now){const c=chartOf(p);if(!c)return null;const sky=skyChart(now);const hits=[];
  const pts=['sun','moon'].concat(c.asc?['asc']:[]),weight={moon:3,sun:2,venus:2,mars:2,mercury:1.5,jupiter:1.2,saturn:1.2},pw={sun:1.2,moon:1,asc:.8};
  for(const tb of ['moon','sun','mercury','venus','mars','jupiter','saturn'])for(const np of pts){if(p.noTime&&np==='moon'&&tb!=='moon')continue;const a=skyAspect(sky[tb].lon,c[np].lon,true);if(a)hits.push({tb,np,a,s:weight[tb]*pw[np]*(1-a.off/8)})}
  hits.sort((x,y)=>y.s-x.s);const who=p.k==='you'?'your':p.name+'’s';
  const say=h=>{const kind=h.a.n==='conjunct'?'big':(h.a.n==='trine'||h.a.n==='sextile')?'easy':'hard',tone=TRANSIT[h.tb][kind];
    const verb={conjunct:'sits right on',trine:'flows easily with',sextile:'gently helps',square:'rubs against',opposite:'pulls against'}[h.a.n];
    return 'Today’s '+(h.tb==='sun'||h.tb==='moon'?h.tb:BODY_NAME[h.tb])+' '+verb+' '+who+' '+POINT_OF[h.np]+': '+tone+'.'};
  if(hits.length){const out=[say(hits[0])];const h2=hits.find(h=>h.tb!==hits[0].tb&&h.np!==hits[0].np);if(h2&&h2.s>1)out.push(say(h2));return out.join(' ')}
  const m=sky.moon,same=m.element===c.sun.element;return 'The moon is in '+m.name+' today. '+(same?'That suits '+(p.k==='you'?'you':p.name)+': a comfortable, easy day.':'A quiet day, sky-wise: nothing big pulling '+(p.k==='you'?'at you':'at '+p.name)+'.')}
// two people: today, and always
const ELEM_FIT=(a,b)=>a===b?'same':({fire:'air',air:'fire',earth:'water',water:'earth'})[a]===b?'pair':'diff';
function together(p1,p2,now){const c1=chartOf(p1),c2=chartOf(p2);if(!c1||!c2)return null;const m=skyChart(now).moon;
  const f1=ELEM_FIT(m.element,c1.sun.element),f2=ELEM_FIT(m.element,c2.sun.element),good=v=>v!=='diff';
  const today=good(f1)&&good(f2)?'a sweet day together; plan something fun.':good(f1)||good(f2)?'one of you is in the mood and one isn’t; meet in the middle.':'give each other a little space today.';
  const sf=ELEM_FIT(c1.sun.element,c2.sun.element),mf=ELEM_FIT(c1.moon.element,c2.moon.element);
  const an=w=>(/^[aeiou]/.test(w)?'An ':'A ')+w,an2=w=>(/^[aeiou]/.test(w)?'an ':'a ')+w;
  const always=(sf==='same'?'Both suns are '+c1.sun.element+' signs: natural friends who just get each other':sf==='pair'?an(c1.sun.element)+' sun and '+an2(c2.sun.element)+' sun: you spark each other':an(c1.sun.element)+' sun and '+an2(c2.sun.element)+' sun: different, and you can learn a lot from each other')
    +(mf==='same'||mf==='pair'?', and your moons feel things the same way.':', though your moons feel things differently.');
  return {today:'With the moon in '+m.name+': '+today,always}}
/* ---------- the CHARTS page in the moon box ---------- */
let chartSel='cat';
function chartsShow(){tr={k:'charts',step:'charts',cards:[],open:[]};tarotTabs();const st0=tStage();st0.innerHTML='<div class="chwrap"><div class="chpeople"></div><div class="chcard"></div></div>';tSay('');
  const sayEl=tarotEl.querySelector('.tsay');sayEl.textContent='Loading the sky…';
  citiesLoad().catch(()=>{}).finally(()=>{if(!tarotEl||tr.k!=='charts')return;sayEl.textContent='The planets’ places are real astronomy. What they mean is old tradition.';chartsDraw()})}
function chartsDraw(){const P=chartPeople(),pe=tarotEl.querySelector('.chpeople');pe.innerHTML='';if(!P.find(p=>p.k===chartSel))chartSel=P[0].k;
  for(const p of P){const b=document.createElement('button');b.type='button';b.className='tsb chp'+(p.k===chartSel?' on':'');b.textContent=p.name;
    b.addEventListener('click',e=>{e.stopPropagation();sfx('tick');chartSel=p.k;chartsDraw()});pe.appendChild(b)}
  const p=P.find(p=>p.k===chartSel),card=tarotEl.querySelector('.chcard');card.innerHTML='';card.scrollTop=0;
  if(p.k==='you'&&!p.t){chartForm(card);return}
  const c=chartOf(p),now=Date.now(),add=(cls,txt)=>{const d=document.createElement('div');d.className=cls;d.textContent=txt;card.appendChild(d);return d};
  add('chname',p.name);
  add('chborn',(p.k==='you'?'Born ':p.k==='cat'?'Came to the room ':'Sprouted ')+(p.about?'about ':'')+(p.k==='you'?new Date(p.when+'T12:00').toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})+(st.you.time?', '+st.you.time:''):fmtWhen(p.t,p.tz))+(p.place?' · '+p.place.n:''));
  const big=document.createElement('div');big.className='chbig';
  for(const b of ['sun','moon','asc']){const s=c[b],d=document.createElement('div');d.className='chb';
    d.innerHTML='<span class="chg"></span><span class="chs"></span><span class="chl"></span>';d.querySelector('.chg').textContent=BODY_GLYPH[b];d.querySelector('.chs').textContent=s?s.glyph+' '+s.name:'—';d.querySelector('.chl').textContent=BODY_NAME[b];big.appendChild(d)}
  card.appendChild(big);
  if(p.noTime){const m0=skySign(skyLon('moon',p.t-12*36e5)),m1=skySign(skyLon('moon',p.t+12*36e5));if(m0.i!==m1.i)add('chnote','Without a birth time, the moon could be in '+m0.name+' or '+m1.name+' (it changed signs that day).')}
  if(!c.asc)add('chnote',p.k==='you'?'Add your birth time and city to see your rising sign.':'');
  add('chh','Today');add('chtoday',horoscope(p,now));
  const others=chartPeople().filter(q=>q.k!==p.k&&q.t);if(others.length){add('chh','Together');for(const q of others){const tg=together(p,q,now);if(!tg)continue;const d=add('chtog','');
    const h=document.createElement('b');h.textContent=(p.k==='you'?'You':p.name)+' & '+(q.k==='you'?'you':q.name)+'. ';d.append(h,document.createTextNode(tg.today+' '+tg.always))}}
  add('chh','The whole chart');
  for(const b of ['sun','moon','asc','mercury','venus','mars','jupiter','saturn']){const s=c[b];if(!s)continue;const d=add('chrow','');
    const h=document.createElement('b');h.textContent=BODY_GLYPH[b]+' '+BODY_NAME[b]+' in '+s.name+(s.rx?' (retrograde)':'')+'. ';d.append(h,document.createTextNode(chartLine(p,b,c)))}
  if(p.k==='you'){const e=document.createElement('button');e.type='button';e.className='tsb chedit';e.textContent='Change my birth details';e.addEventListener('click',ev=>{ev.stopPropagation();chartForm(card)});card.appendChild(e)}}
// your birth details: a date, a time if you know it, and the city you were born in
function chartForm(card){card.innerHTML='';const y=st.you||{};let city=y.place||null;
  card.innerHTML='<div class="chname">Your birth chart</div><div class="chnote">Your birthday stays on this phone (and in your backup file), nowhere else.</div>'+
    '<label class="chf">Birthday<input type="date" class="chdate"></label><label class="chf">Birth time, if you know it<input type="time" class="chtime"></label>'+
    '<label class="chf">City you were born in<input type="text" class="chcity" autocomplete="off" placeholder="Start typing…"></label><div class="chsug"></div>'+
    '<div class="chbtns"><button type="button" class="tsb chsave">Show my chart</button></div>';
  const D=card.querySelector('.chdate'),T=card.querySelector('.chtime'),C=card.querySelector('.chcity'),S=card.querySelector('.chsug');
  D.value=y.date||'';T.value=y.time||'';C.value=city?cityLabel(city):'';D.max=new Date().toISOString().slice(0,10);
  for(const el of [D,T,C])['click','pointerdown','keydown'].forEach(ev=>el.addEventListener(ev,e=>e.stopPropagation()));
  C.addEventListener('input',()=>{city=null;S.innerHTML='';const go=()=>{for(const m of citySearch(C.value)){const b=document.createElement('button');b.type='button';b.className='chpick';b.textContent=cityLabel(m);
      b.addEventListener('click',e=>{e.stopPropagation();city={n:m.n,lat:m.lat,lon:m.lon,tz:m.tz,country:m.country,region:m.region};C.value=cityLabel(m);S.innerHTML=''});S.appendChild(b)}};
    if(CITIES)go();else citiesLoad().then(go).catch(()=>{})});
  card.querySelector('.chsave').addEventListener('click',e=>{e.stopPropagation();if(!D.value){D.focus();return}sfx('tick');
    st.you={date:D.value,time:T.value||null,place:city};save();chartSel='you';chartsDraw()})}
