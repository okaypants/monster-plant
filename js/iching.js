'use strict';
/* THE MOON BOX: THE I CHING (Jackie, Nov 17: "then let's work on I Ching"). The third thing in the box (js/tarot.js has the
   box and its menu). The I Ching, or Book of Changes (易經), is a Chinese book of 64 six-line figures called hexagrams, each
   with a short text, put together about 3,000 years ago.
   THE COIN METHOD, as it has been done in China for over a thousand years: toss three coins six times. The side with writing
   counts 2 and the plain side counts 3 (the usual Chinese way; some books turn it around). Each toss adds up to
     6  a broken line that is changing      (1 toss in 8)
     7  a solid line                        (3 in 8)
     8  a broken line                       (3 in 8)
     9  a solid line that is changing       (1 in 8)
   and draws one line, from the bottom up. The six lines make the hexagram. If any lines are changing, flipping them makes a
   second hexagram, which is where things are heading. No question is asked (as with the tarot).
   WHAT IS SHOWN: the hexagram with its Chinese name, how it is said and a short English name; its meaning in plain words,
   written for the game from the Judgment; on its page, the two three-line halves (trigrams), the Judgment in the original
   Chinese, James Legge's English of it (The Yî King, Sacred Books of the East vol. 16, 1882, public domain), and for each
   changing line the original line text with Legge's English.
   THE TEXT (data/iching.json, loaded only when the I Ching is opened): the Chinese is from Chinese Wikisource (周易). Legge's
   hexagrams 1 to 32 are from English Wikisource (proofread); 33 to 64 are from two Internet Archive scans of the 1882 book,
   compared with each other and tidied by hand, so a stray scanning slip is possible there. Legge's own spelling of the
   Chinese names (Khien, Kwâi) is kept inside his words.
   ONCE A DAY, like the tarot: today's six tosses are kept (localStorage 'mp-iching') and shown again until tomorrow. */
const ICHING_KEY='mp-iching';
const TRIGRAM={'111':'heaven','000':'earth','100':'thunder','010':'water','001':'mountain','011':'wind','101':'fire','110':'lake'};
// Legge's words are left off a page where they are rough (noses cut off, concubines, blood, prisoners, "a female who is bold"):
// Jackie, Nov 17. The original Chinese still shows. His "there will be evil" stays; it is how he says bad luck (凶).
const ICH_HARSH=/\b(nose|noses|buttocks|concubine|blood|bloody|kill\w*|slay\w*|slain|death|die|dies|dying|dead|corpse\w*|robbers?|criminal|culprit\w*|punish\w*|branded|cut off|cutting off|shaving|wounded|wounds|captive\w*|prison\w*|fetter\w*|cangue|ghosts|pregnant|female|widow\w*|perish\w*|destroy\w*)\b/i;
const ICH_ORD=['first','second','third','fourth','fifth','top'];
let ICH=null,ichP=null,ich=null;
function ichingLoad(){return ichP||(ichP=fetch('data/iching.json').then(r=>r.json()).then(j=>{ICH=j;return j}).catch(e=>{ichP=null;throw e}))}
function ichingHex(bits){return ICH.find(h=>h.b===bits)}
// today's hexagrams, one for each thing a reading can be about (Jackie, Nov 25; the tarot's topics, js/tarot.js). A save from when there was
// one hexagram a day is read as the one about everything.
function ichingLog(){let s=null;try{s=JSON.parse(localStorage.getItem(ICHING_KEY)||'{}')}catch(e){}if(!s||s.day!==tarotToday())return {};
  const okL=l=>Array.isArray(l)&&l.length===6&&l.every(v=>v>=6&&v<=9),c={};if(okL(s.lines))c.all=s.lines;for(const t in (s.casts||{}))if(TOPICS[t]&&okL(s.casts[t]))c[t]=s.casts[t];return c}
function ichingKeep(topic,lines){const c=ichingLog();c[topic]=lines;try{localStorage.setItem(ICHING_KEY,JSON.stringify({day:tarotToday(),casts:c}))}catch(e){}}
function ichingToday(){if(!ICH)return [];const c=ichingLog();return Object.keys(TOPICS).filter(t=>c[t]).map(t=>({topic:t,name:ichingName(ichingPair(c[t]).first)+', '+ichingPair(c[t]).first.en}))}
// back from a hexagram: to the coins and what to ask about (or to Today, if it was opened from there). false = nothing to go back to here
function ichingBack(){if(!ich||ich.lines.length!==6)return false;if(ich.from==='today'){todayShow();return true}ichingShow();return true}
// the two hexagrams of a reading: the one thrown, and (if any lines are changing) the one it turns into
function ichingPair(lines){const a=lines.map(v=>v%2?'1':'0').join(''),chg=lines.map((v,i)=>v===6||v===9?i:-1).filter(i=>i>=0);
  const b=lines.map(v=>v===6?'1':v===9?'0':v%2?'1':'0').join('');return {first:ichingHex(a),second:chg.length?ichingHex(b):null,chg}}
// the figure: six lines, the first at the bottom. 6 and 8 are broken, 7 and 9 solid; 6 and 9 are changing; null is not thrown yet
function ichingFig(vals,cls,plain){const d=document.createElement('div');d.className='ihex '+(cls||'');
  for(let i=5;i>=0;i--){const v=vals[i],l=document.createElement('div');l.className='iline'+(v==null?' iempty':v%2?' iyang':' iyin')+(!plain&&(v===6||v===9)?' ichg':'');
    l.appendChild(document.createElement('span'));if(v!=null&&v%2===0)l.appendChild(document.createElement('span'));d.appendChild(l)}
  return d}
function ichingIcon(){return ichingFig([7,8,8,8,7,8],'iicon')}
function ichingName(h){return h.k+'. '+h.zh+' '+h.py}
function ichingShow(topic,from){tr={k:'iching',step:'iching',cards:[],open:[]};tarotTabs();tStage().innerHTML='';tSay('Opening the book…');
  ichingLoad().then(()=>{if(!tarotEl||!tr||tr.k!=='iching')return;const c=ichingLog(),left=Object.keys(TOPICS).filter(t=>!c[t]);
    if(topic&&c[topic]){ich={lines:c[topic].slice(),again:true,busy:false,topic,from};ichingResult();return} // one you have had today: straight to it
    ich={lines:[],again:false,busy:false,topic:left.includes(tarotTopic)?tarotTopic:(left[0]||null)};ichingDraw()}).catch(()=>{if(tarotEl&&tr&&tr.k==='iching')tSay('The book wouldn’t open. It needs the internet the first time.')})}
// a coin: the side with writing (開元通寶, the Tang dynasty coin) or the plain side
function ichingCoin(face){const c=document.createElement('div');c.className='icoin'+(face===2?' iw':face===3?' ip':'');
  if(face===2)['開','元','通','寶'].forEach((ch,i)=>{const s=document.createElement('i');s.className='ic'+i;s.textContent=ch;s.lang='zh-Hant';c.appendChild(s)});return c}
function ichingDraw(faces){const st0=tStage();st0.innerHTML='';const row=document.createElement('div');row.className='istage';
  const fig=ichingFig(ich.lines.concat(Array(6-ich.lines.length).fill(null)),'imain');
  const side=document.createElement('div');side.className='iside';const coins=document.createElement('div');coins.className='icoins';
  for(let i=0;i<3;i++)coins.appendChild(ichingCoin(faces?faces[i]:0));
  const b=document.createElement('button');b.type='button';b.className='tsb itoss';b.textContent=ich.lines.length?'Toss again ('+(ich.lines.length+1)+' of 6)':'Toss the coins';
  b.addEventListener('click',e=>{e.stopPropagation();ichingToss()});side.append(coins,b);row.append(fig,side);st0.appendChild(row);
  if(!ich.lines.length){const c=ichingLog(),tp=document.createElement('div');tp.className='ttopics itopics'; // what to ask about, as in the tarot: a ticked one opens today's hexagram for it
    for(const [id,T] of Object.entries(TOPICS)){const had=!!c[id],t=document.createElement('button');t.type='button';t.className='ttopic'+(id===ich.topic?' on':'')+(had?' thad':'');t.dataset.t=id;t.textContent=T.n+(had?' ✓':'');
      t.addEventListener('click',e=>{e.stopPropagation();if(ich.busy||ich.lines.length)return;sfx('tick');if(had){ichingShow(id);return}tarotTopic=ich.topic=id;tp.querySelectorAll('.ttopic').forEach(x=>x.classList.toggle('on',x===t))});tp.appendChild(t)}
    st0.appendChild(tp);b.disabled=!ich.topic}
  if(!ich.lines.length)tSayNote(ich.topic?'Pick what to ask about. Then toss three coins six times. Each toss draws one line, from the bottom up.':'You have a hexagram for each of these today. Tap one to see it again.','The I Ching, or Book of Changes, was put together in China about 3,000 years ago. Tossing coins for it is at least a thousand years old.')}
// one toss: three coins, each 2 (writing) or 3 (plain); faces can be given (tests)
function ichingToss(faces){if(!ich||ich.busy||ich.lines.length>=6||!ich.topic)return;sfx('paper');const f=faces||[0,1,2].map(()=>tarotRand(2)?3:2),sum=f[0]+f[1]+f[2];ich.busy=true;
  const land=()=>{if(!tarotEl||!tr||tr.k!=='iching')return;ich.busy=false;ich.lines.push(sum);sfx('tick');
    const n=f.filter(v=>v===2).length,what=sum===6?'a broken line that is changing':sum===7?'a solid line':sum===8?'a broken line':'a solid line that is changing';
    if(ich.lines.length===6){ichingKeep(ich.topic,ich.lines);ichingResult();return}
    ichingDraw(f);tSay((n===3?'Three sides with writing':n===0?'Three plain sides':n===1?'One side with writing and two plain':'Two sides with writing and one plain')+' add up to '+sum+'. That is '+what+'.')};
  if(tsCalm()){land();return}
  tarotEl.querySelectorAll('.icoin').forEach(c=>c.classList.add('ispin'));const t=tarotEl.querySelector('.itoss');if(t)t.disabled=true;setTimeout(land,520)}
// the reading: the hexagram thrown and, if lines are changing, the one it turns into; tap either for its page
function ichingResult(){const P=ichingPair(ich.lines),st0=tStage();st0.innerHTML='';const row=document.createElement('div');row.className='ires';
  const pick=(h,vals,w,plain)=>{const b=document.createElement('button');b.type='button';b.className='ipick';b.dataset.w=w;b.setAttribute('aria-label','More about '+h.en);
    const z=document.createElement('div');z.className='izh';z.lang='zh-Hant';z.textContent=h.zh;const n=document.createElement('div');n.className='iname';n.textContent=h.k+'. '+h.py+', '+h.en;
    b.append(ichingFig(vals,'imain',plain),z,n);b.addEventListener('click',e=>{e.stopPropagation();ichingRead(w)});return b};
  row.appendChild(pick(P.first,ich.lines,0,false));
  if(P.second){const a=document.createElement('div');a.className='iarrow';a.textContent='→';a.setAttribute('aria-hidden','true');row.append(a,pick(P.second,ich.lines.map(v=>v===6?7:v===9?8:v),1,true))}
  st0.appendChild(row);
  const list=a=>a.length===1?a[0]:a.slice(0,-1).join(', ')+' and '+a[a.length-1],nums=P.chg.map(i=>i+1);
  ich.story='Your hexagram is '+P.first.en+'. '+P.first.m;
  ich.turn=P.second?(nums.length===6?'All six lines are':nums.length===1?'Line '+nums[0]+' is':'Lines '+list(nums)+' are')+' changing, so it turns into '+P.second.en+'. '+P.second.m:'No lines are changing, so this one hexagram is the whole reading.';
  const s=tarotEl.querySelector('.tsay');s.innerHTML='';const sp=document.createElement('span');sp.className='tsumtx';sp.textContent=ich.story+' '+ich.turn;
  const note=document.createElement('div');note.className='tnote';note.appendChild(document.createTextNode((ich.again?'This is today’s reading'+(ich.topic&&ich.topic!=='all'?' about '+TOPICS[ich.topic].of:'')+'. ':'')+'Tap a hexagram for more about it. A new one comes tomorrow.'));s.append(sp,note);
  if(sp.scrollHeight>sp.clientHeight+2){const b=document.createElement('button');b.type='button';b.className='tmore';b.textContent='Read all of it';b.addEventListener('click',e=>{e.stopPropagation();ichingRead(-1)});note.appendChild(b)}}
// a page: the whole summary (w = -1), the hexagram thrown (0) or the one it turns into (1)
function ichingRead(w){const P=ichingPair(ich.lines),old=tarotEl.querySelector('.tread');if(old)old.remove();sfx('tick');
  const r=document.createElement('div');r.className='tread tsb'+(w<0?' tsumfull':' iread');const txt=document.createElement('div');txt.className='ttext';
  const add=(cls,t,bold,zh)=>{const d=document.createElement('div');d.className=cls;if(bold){const b=document.createElement('b');b.textContent=bold+' ';d.appendChild(b)}
    if(zh){const z=document.createElement('span');z.className='iorig';z.lang='zh-Hant';z.textContent=zh+' ';d.appendChild(z)}if(t)d.appendChild(document.createTextNode(t));txt.appendChild(d)};
  const cap=s=>s[0].toUpperCase()+s.slice(1);
  if(w<0){add('tname','I Ching');add('tmean',ich.story);add('tlore',ich.turn)}
  else{const h=w?P.second:P.first,lo=TRIGRAM[h.b.slice(0,3)],up=TRIGRAM[h.b.slice(3)];
    r.appendChild(ichingFig(w?ich.lines.map(v=>v===6?7:v===9?8:v):ich.lines,'ibig',!!w));
    add('tname',ichingName(h)+', '+h.en);add('tmean',h.m);
    add('tlore',lo===up?cap(lo)+' doubled. The lower three lines and the upper three are the same.':cap(lo)+' below and '+up+' above. Each half of a hexagram is one of eight three-line figures.','The two halves.');
    add('tlore','','The original.',h.jz);
    if(!ICH_HARSH.test(h.je))add('tlore twaite','“'+h.je+'”','James Legge, 1882.');
    if(!w&&P.chg.length){add('tlore','This hexagram is how things stand. The changing lines show what is moving, and the second hexagram shows where it is heading.','How to read it.');
      if(P.chg.length===6&&h.xz)add('tlore twaite','“'+h.xe+'”','All six lines changing.',h.xz);
      for(const i of P.chg){if(ICH_HARSH.test(h.le[i]))add('tlore','This line is a rough one in the old book, so its English is left out.','The '+ICH_ORD[i]+' line, changing.',h.lz[i]);else add('tlore twaite','“'+h.le[i]+'”','The '+ICH_ORD[i]+' line, changing.',h.lz[i])}}
    else if(!w)add('tlore','No lines are changing, so this hexagram is the whole reading.','How to read it.');
    else add('tlore','This is what the first hexagram turns into once its changing lines flip. It shows where things are heading.','How to read it.');
}
  r.append(txt);r.addEventListener('click',e=>e.stopPropagation());tarotEl.querySelector('.tbox').appendChild(r)}
