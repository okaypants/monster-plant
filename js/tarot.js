'use strict';
/* THE MOON BOX: A TAROT READING (Jackie, Nov 16). Tap the little box with the moon on the right-hand bookcase and it opens
   over the room on a menu of what is inside (tarot, charts, the I Ching in js/iching.js; Nov 17). The tarot: a velvet cloth and a real deck, the Rider-Waite-Smith tarot (Pamela Colman Smith's pictures, 1909, made into
   the room's pixel style), with meanings in plain words written from A. E. Waite's own (1910; js/tarotdata.js).
   Three spreads, picked on the cloth:
     Card of the day   one card.
     Three cards       the past, the present, the future.
     Celtic Cross      ten cards, laid out as Waite gives it in The Pictorial Key (1910): six in a cross (what covers you,
                       what crosses you, crowns you, is beneath you, behind you, before you) and four in a column beside it
                       (yourself, your house, your hopes or fears, what will come). Waite's "him" is "you" here; his
                       Significator (a card picked to stand for the one asking) is left out, as most readers do today.
   A reading (no question is asked; Jackie, Nov 17: "I don't want them to be question related"): tap the deck to shuffle, cut it into three piles and pick one, then turn the cards over one
   by one. About one in three comes up reversed (upside down), which changes its meaning, as in Waite's book. Once a card is
   turned, its name, its place in the spread in parentheses and its meaning are written under it ("The Star (the past)"); the
   Celtic Cross shows a small map of the cross and one card at a time beside it. Tap a turned card for the zoom: the card big,
   with the details for the curious (js/tarotlore.js). Once all are turned, the reading is summed up under the spread (Jackie, Nov 17): each card's short meaning in its
   place, then the traditional count (how many Major Arcana, which suit leads, whether several are reversed). It shows three
   lines at most; "Read all of it" opens the whole summary with every card listed. The card's page (Jackie, Nov 17) has, in order: the plain meaning; Waite's own 1910
   words for it (left out where they are harsh, see TAROT_HARSH); how readers read it today; what it would mean the other way up; for court cards and Aces, how that kind of
   card is read; anything special to that one card; then the picture, the deck, the astrology and the artist.
   ONCE A DAY (Jackie: "you should not be able to re-do it in the same calendar day", by the phone's clock): each spread can be
   read once per calendar day. The cards are kept (localStorage 'mp-tarot', today's date and today's cards per spread), so
   opening the box again that day shows the same cards face up to read again; a new one comes tomorrow.
   The pictures load only when the box is opened (the back) and when cards are dealt, so the game starts no slower. */
const MOONBOX={x:1492,y:412,w:102,h:76}; // the same box as the 'moonbox' fidget in js/fidgets.js
// Waite's words are left off a card's page when they speak of death, lies, cruelty, illness, enemies and the like (Jackie, Nov 17:
// "We don't want the readings to imply anything too negative"); the plain meaning and the rest of the page stay
const TAROT_HARSH=/\b(lie|lies|lying|falsehood|false|deceit\w*|decept\w*|decei\w*|treach\w*|disloyal\w*|perfid\w*|betray\w*|cruel\w*|evil|vice|deprav\w*|dishonou?r\w*|scandal|roguery|pillage|death|mortality|destruction|ruin|perdition|perish|disease|sickness|mental|madness|mania|delirium|frenzy|intoxication|violence|malice|bigotry|infidelity|seduction|perver\w*|corruption|disgrace|widowhood|sterility|imposture|duplicity|slander|enem\w*|war|hatred|wrath|calamity|disaster|catastrophe|snares|imprison\w*|usury|virility|sexes|concubine|artifice|trickery|fraud|theft|thief|rogue|spy|spying|chagrin|mortification|suffering|bale|prudery|misery|desolation|affliction|poverty|destitution|profligacy|debauch\w*|voluptuous\w*|fatality|downfall)\b/i;
const TAROT_REV=.35,TAROT_KEY='mp-tarot'; // the chance a card comes up reversed; where today's readings are kept
const SPREADS={
  one:{name:'Card of the day',next:'A new card of the day comes tomorrow.',pos:[{t:'Today',in:'Today'}]},
  three:{name:'Three cards',next:'A new three-card reading comes tomorrow.',pos:[{t:'The past',in:'In the past'},{t:'The present',in:'Right now'},{t:'The future',in:'Coming up'}]},
  cross:{name:'Celtic Cross',next:'A new Celtic Cross comes tomorrow.',pos:[
    {t:'What covers you',in:'What covers you, the mood around you right now'},
    {t:'What crosses you',in:'What crosses you, what stands in the way'},
    {t:'What crowns you',in:'What crowns you, the best that can come'},
    {t:'What is beneath you',in:'What is beneath you, what all of this rests on'},
    {t:'What is behind you',in:'What is behind you, what is passing away'},
    {t:'What is before you',in:'What is before you, what comes soon'},
    {t:'Yourself',in:'Yourself, where you stand'},
    {t:'Your house',in:'Your house, the people and places around you'},
    {t:'Your hopes or fears',in:'Your hopes or fears'},
    {t:'What will come',in:'What will come, how it all turns out'}]}};
const SUIT={W:{n:'Wands',m:'energy, work and new ventures'},C:{n:'Cups',m:'feelings, love and friendship'},S:{n:'Swords',m:'thoughts, troubles and hard choices'},P:{n:'Pentacles',m:'money, home and everyday things'}};
let tarotEl=null,tr=null,tarotPick='three';
function tarotImg(id){const i=new Image();i.src='tarot/'+id+'.png';i.alt='';i.draggable=false;return i}
function tarotRand(n){try{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%n}catch(e){return Math.floor(Math.random()*n)}}
// today, by the phone's own calendar
function tarotToday(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function tarotLog(){try{const s=JSON.parse(localStorage.getItem(TAROT_KEY)||'{}');return s.day===tarotToday()?s:{day:tarotToday(),done:{}}}catch(e){return {day:tarotToday(),done:{}}}}
function tarotDone(k){const d=tarotLog().done[k];return d?d.map(([id,rev])=>({c:TAROT.find(c=>c.id===id),rev:!!rev})).filter(x=>x.c):null}
function tarotKeep(k,cards){const s=tarotLog();s.done[k]=cards.map(x=>[x.c.id,x.rev?1:0]);try{localStorage.setItem(TAROT_KEY,JSON.stringify(s))}catch(e){}}
function openTarot(){if(tarotEl)return;sfx('tick');
  tarotEl=document.createElement('div');tarotEl.className='screen tarot';
  tarotEl.innerHTML='<div class="tbox tsb tspop"><button type="button" class="tsb tx" aria-label="Close">×</button><div class="tpick"></div><div class="tstage"></div><div class="tsay"></div></div>';
  tarotEl.addEventListener('click',e=>{if(e.target===tarotEl)closeTarot()});
  tarotEl.querySelector('.tx').addEventListener('click',e=>{e.stopPropagation();closeTarot()});
  ui.appendChild(tarotEl);tarotMenu()}
// THE BOX'S MENU (Jackie, Nov 17: "when you open the box you can select from tarot, charts, or I Ching"): the box opens on its
// choices, each a big button with a picture, its name and one line. "Moon box" at the left of the top row comes back here.
const BOX_MENU=[{k:'tarot',n:'Tarot',d:'A card reading with the deck of 1909.'},{k:'charts',n:'Charts',d:'Birth charts and today’s sky.'},{k:'iching',n:'I Ching',d:'Toss three coins for one of 64 hexagrams.'}];
function tarotMenuIcon(k){const d=document.createElement('div');d.className='tmicon';
  if(k==='tarot'){const b=tarotImg('back');d.appendChild(b)}
  else if(k==='charts'){const g=document.createElement('span');g.className='tmglyph';g.textContent='☉';d.appendChild(g)}
  else if(typeof ichingIcon==='function')d.appendChild(ichingIcon());
  return d}
function tarotMenu(){tr={k:'menu',step:'menu',cards:[],open:[]};tarotEl.querySelector('.tpick').innerHTML='';const st0=tStage();st0.innerHTML='';
  const old=tarotEl.querySelector('.tread');if(old)old.remove();
  const m=document.createElement('div');m.className='tmenu';
  for(const it of BOX_MENU){const b=document.createElement('button');b.type='button';b.className='tsb tmitem';b.dataset.k=it.k;
    const n=document.createElement('b');n.textContent=it.n;const d=document.createElement('span');d.className='tmd';d.textContent=it.d;b.append(tarotMenuIcon(it.k),n,d);
    b.addEventListener('click',e=>{e.stopPropagation();sfx('tick');if(it.k==='tarot')tarotStart(tarotPick);else if(it.k==='charts')tarotStart('charts');else if(typeof ichingShow==='function')ichingShow()});m.appendChild(b)}
  st0.appendChild(m);tSay('')}
function closeTarot(){if(tarotEl){tarotEl.remove();tarotEl=null;tr=null}}
function tStage(){return tarotEl&&tarotEl.querySelector('.tstage')}
function tSay(t){const s=tarotEl&&tarotEl.querySelector('.tsay');if(s)s.textContent=t}
function tBack(cls){const b=tarotImg('back');b.className='tcard '+(cls||'');return b}
// the top row: "Moon box" (back to the menu), then the three spread buttons while in the tarot; each shows today's reading if it's been done
function tarotTabs(){const p=tarotEl.querySelector('.tpick');p.innerHTML='';
  const h=document.createElement('button');h.type='button';h.className='tsb tspick thome';h.dataset.k='menu';h.textContent='‹ Moon box';
  h.addEventListener('click',e=>{e.stopPropagation();if(tr.step==='shuffling')return;sfx('tick');tarotMenu()});p.appendChild(h);
  if(!SPREADS[tr.k])return;
  for(const [k,s] of Object.entries(SPREADS)){const b=document.createElement('button');b.type='button';b.className='tsb tspick'+(k===tr.k?' on':'');b.dataset.k=k;
    b.textContent=s.name+(tarotDone(k)?' ✓':'');b.addEventListener('click',e=>{e.stopPropagation();if(k===tr.k||(tr.step==='shuffling'))return;sfx('tick');tarotStart(k)});p.appendChild(b)}}
function tarotStart(k){if(k==='charts'){chartsShow();return}tarotPick=k;const done=tarotDone(k);if(done){tarotShow(k,done);return}tarotDeck(k)}
// 1. the deck, waiting (no question is asked: Jackie, Nov 17)
function tarotDeck(k){const S=SPREADS[k];tr={k,step:'deck',deck:null,cards:[],open:S.pos.map(()=>false)};tarotTabs();const st0=tStage();st0.innerHTML='';
  const d=document.createElement('button');d.type='button';d.className='tdeck';d.setAttribute('aria-label','Shuffle the deck');
  for(let i=0;i<4;i++){const b=tBack();b.style.setProperty('--i',i);d.appendChild(b)}
  d.addEventListener('click',e=>{e.stopPropagation();tarotShuffle(d)});st0.appendChild(d);
  tSay('Tap the deck to shuffle it.')}
// 2. shuffle (78 cards, each maybe reversed), then cut into three piles
function tarotShuffle(d){if(tr.step!=='deck')return;tr.step='shuffling';sfx('paper');
  const ids=TAROT.map((c,i)=>i);for(let i=ids.length-1;i>0;i--){const j=tarotRand(i+1);[ids[i],ids[j]]=[ids[j],ids[i]]}
  tr.deck=ids.map(i=>({c:TAROT[i],rev:tarotRand(1000)<TAROT_REV*1000}));
  d.classList.add('tshuf');tSay('Shuffling…');setTimeout(()=>{if(!tarotEl||tr.step!=='shuffling')return;tarotCut()},tsCalm()?60:900)}
function tarotCut(){tr.step='cut';const st0=tStage();st0.innerHTML='';const row=document.createElement('div');row.className='tpiles';
  for(let p=0;p<3;p++){const b=document.createElement('button');b.type='button';b.className='tpile';b.setAttribute('aria-label','Pile '+(p+1));
    for(let i=0;i<3;i++){const c=tBack();c.style.setProperty('--i',i);b.appendChild(c)}
    b.addEventListener('click',e=>{e.stopPropagation();tarotDeal(p)});row.appendChild(b)}
  st0.appendChild(row);tSay('Now cut the deck by tapping one of the three piles.')}
// 3. deal from the top of the pile you chose; the reading counts for today from here on
function tarotDeal(p){if(tr.step!=='cut')return;tr.step='dealt';sfx('paper');const n=tr.deck.length,a=Math.floor(n/3),b=Math.floor(2*n/3);
  const piles=[tr.deck.slice(0,a),tr.deck.slice(a,b),tr.deck.slice(b)];tr.deck=piles[p].concat(piles[(p+1)%3],piles[(p+2)%3]); // the chosen pile goes on top
  tr.cards=tr.deck.slice(0,SPREADS[tr.k].pos.length);tr.cards.forEach(x=>{const i=new Image();i.src='tarot/'+x.c.id+'.png'}); // fetch the faces now
  tarotKeep(tr.k,tr.cards);tarotLay(false);tSay(tr.cards.length===1?'Tap the card to turn it over.':'Tap each card to turn it over.')}
// what's written under a card: its name, then its place in the spread in parentheses ("The Star (the past)"); the card of
// the day has no place to name (Jackie, Nov 16)
function tarotRole(i){if(tr.k==='one')return '';const t=SPREADS[tr.k].pos[i].t;return t[0].toLowerCase()+t.slice(1)}
function tarotTitle(i){const x=tr.cards[i],r=tarotRole(i);return x.c.n+(x.rev?', reversed':'')+(r?' ('+r+')':'')}
function tarotMean(i){const x=tr.cards[i];return x.rev?x.c.r:x.c.u}
// lay the spread out: face down (a new reading) or face up (today's, opened again). One card and three cards: each card
// with its name, place and meaning written beneath it once it's turned. The Celtic Cross: the ten cards as a small map of
// the cross on the left, and on the right the card you're on, larger, with its name, place and meaning (ten cards with
// their readings don't fit side by side on a phone, and a reader goes through them one at a time anyway).
function tarotLay(up){const k=tr.k,S=SPREADS[k],st0=tStage();st0.innerHTML='';const row=document.createElement('div');row.className='tspread t'+k;tr.focus=-1;
  S.pos.forEach((s,i)=>{const slot=document.createElement('div');slot.className='tslot ts'+i;
    const btn=document.createElement('button');btn.type='button';btn.className='tflip';
    btn.addEventListener('click',e=>{e.stopPropagation();if(!tr.open[i])tarotFlip(i,btn);else if(k==='cross'&&tr.focus!==i)tarotFocus(i);else tarotRead(i)});
    slot.appendChild(btn);
    if(k!=='cross'){const lab=document.createElement('div');lab.className='tlab';const mn=document.createElement('div');mn.className='tmn';slot.append(lab,mn)}
    else{const n=document.createElement('div');n.className='tnum';n.textContent=i+1;slot.appendChild(n)}
    row.appendChild(slot);tr.open[i]=up;tarotFace(i,btn,up)});
  if(k!=='cross'){st0.appendChild(row);return}
  const wrap=document.createElement('div');wrap.className='tcrosswrap';const f=document.createElement('div');f.className='tfocus';wrap.append(row,f);st0.appendChild(wrap);tarotFocus(up?0:-1)}
function tarotFace(i,btn,up){const x=tr.cards[i],s=SPREADS[tr.k].pos[i];btn.innerHTML='';
  if(up){const f=tarotImg(x.c.id);f.className='tcard'+(x.rev?' trev':'');btn.appendChild(f);btn.setAttribute('aria-label',tarotTitle(i)+'. Tap for more about this card.')}
  else{btn.appendChild(tBack());btn.setAttribute('aria-label',s.t+': turn the card over')}
  const slot=btn.parentNode,lab=slot&&slot.querySelector('.tlab'),mn=slot&&slot.querySelector('.tmn');
  if(lab)lab.textContent=up?tarotTitle(i):(tr.k==='one'?'':s.t);if(mn)mn.textContent=up?tarotMean(i):''}
// the Celtic Cross: show one card larger beside the map (i = -1: none turned yet)
function tarotFocus(i){tr.focus=i;const f=tarotEl.querySelector('.tfocus');if(!f)return;f.innerHTML='';
  tarotEl.querySelectorAll('.tcross .tslot').forEach((s,j)=>s.classList.toggle('tsel',j===i));
  const next=tr.open.indexOf(false),txt=document.createElement('div');txt.className='tftext';
  if(i>=0&&tr.open[i]){const x=tr.cards[i],b=document.createElement('button');b.type='button';b.className='tfbig';b.setAttribute('aria-label','More about '+x.c.n);
    const im=tarotImg(x.c.id);im.className='tcard'+(x.rev?' trev':'');b.appendChild(im);b.addEventListener('click',e=>{e.stopPropagation();tarotRead(i)});f.appendChild(b);
    const h=document.createElement('div');h.className='tlab';h.textContent=(i+1)+'. '+tarotTitle(i);const m=document.createElement('div');m.className='tmn';m.textContent=tarotMean(i);
    txt.append(h,m);const pin=SPREADS.cross.pos[i].in;if(pin.includes(',')){const w=document.createElement('div');w.className='tfwhere';w.textContent=pin.replace(/^[^,]*, /,'This place shows ')+'.';txt.appendChild(w)}}
  else{const m=document.createElement('div');m.className='tmn';m.textContent='Ten cards are laid out in the shape of a cross with a column beside it. Turn them over in order from 1 to 10.';txt.appendChild(m)}
  if(next>=0){const nb=document.createElement('button');nb.type='button';nb.className='tsb tnext';nb.textContent='Turn card '+(next+1);
    nb.addEventListener('click',e=>{e.stopPropagation();const btn=tarotEl.querySelectorAll('.tcross .tflip')[next];if(btn)tarotFlip(next,btn)});txt.appendChild(nb)}
  else if(i>=0){const row=document.createElement('div');row.className='tfnav';
    for(const [d,label] of [[-1,'Previous card'],[1,'Next card']]){const nb=document.createElement('button');nb.type='button';nb.className='tsb tnext';nb.textContent=label;
      nb.addEventListener('click',e=>{e.stopPropagation();sfx('tick');tarotFocus((i+d+10)%10)});row.appendChild(nb)}txt.appendChild(row)}
  f.appendChild(txt)}
function tarotFlip(i,btn){const x=tr.cards[i];tr.open[i]=true;sfx('page');
  const show=()=>{tarotFace(i,btn,true);if(tr.k==='cross')tarotFocus(i);if(tr.open.every(Boolean))tarotSum();else tSay(tr.k==='cross'?'':'Turn the next card.')};
  if(tsCalm()){show();return}
  btn.classList.add('tturn');setTimeout(()=>{show();btn.classList.remove('tturn');btn.classList.add('tturn2');setTimeout(()=>btn.classList.remove('tturn2'),120)},120)} // a stepped turn: narrow, then the face
// today's reading, opened again: the same cards, face up
function tarotShow(k,cards){tr={k,step:'shown',cards,open:cards.map(()=>true)};tarotTabs();tarotLay(true);tarotSum(true)}
// the spread as a whole, the traditional way: big cards and the leading suit
function tarotSum(again){const C=tr.cards,n=C.length,maj=C.filter(x=>x.c.id[0]==='M').length,cnt={};
  for(const x of C)if(x.c.id[0]!=='M')cnt[x.c.id[0]]=(cnt[x.c.id[0]]||0)+1;
  const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0],rev=C.filter(x=>x.rev).length;let t='';
  const suitIs=k=>SUIT[k].n+', the suit of '+SUIT[k].m;
  if(n===1){const x=C[0];t=x.c.id[0]==='M'?'This is one of the 22 Major Arcana, the most important cards in the deck.':'This card is from '+suitIs(x.c.id[0])+'.';if(x.rev)t+=' It came up reversed, which changes its meaning.'}
  else{t+=maj===n?'All of these cards are Major Arcana, which marks an important time.':maj>=Math.max(2,n*.4)?'Several of these cards are Major Arcana, which marks an important time.':maj===1?'One of these cards is Major Arcana.':maj>1?['','','Two','Three','Four','Five','Six','Seven','Eight','Nine'][maj]+' of these cards are Major Arcana.':'None of these cards are Major Arcana, which points to everyday things.';
    if(top&&top[1]>=Math.max(2,Math.ceil(n*.3)))t+=' Most of the '+(maj?'others':'cards')+' are '+suitIs(top[0])+'.';
    if(rev>=Math.max(2,Math.ceil(n*.4)))t+=' Several cards are reversed, which can mean delays or confusion.'}
  tr.pat=t;tr.story=tarotStory();tr.sum=tr.story+' '+t;tarotSumShow(again);
  tarotTabs()}
// the reading in a few sentences: each card's short meaning (js/tarotread.js) put in its place in the spread
function tarotStory(){const k=tr.cards.map(x=>(TAROT_K[x.c.id]||['',''])[x.rev?1:0]);
  if(tr.k==='one')return 'Today is about '+k[0]+'.';
  if(tr.k==='three')return 'This reading moves from '+k[0]+' in the past, through '+k[1]+' now, toward '+k[2]+'.';
  return 'You are surrounded by '+k[0]+', with '+k[1]+' standing in the way. At its best this brings '+k[2]+', and all of it rests on '+k[3]+'. You are leaving behind '+k[4]+' and heading toward '+k[5]+'. You meet this with '+k[6]+', and the people and places around you bring '+k[7]+'. Your hopes or fears are about '+k[8]+'. It leads toward '+k[9]+'.'}
// under the spread: the summary (three lines at most; "Read all of it" opens the whole thing when it doesn't fit), then a small note
function tarotSumShow(again){const s=tarotEl.querySelector('.tsay');s.innerHTML='';const sp=document.createElement('span');sp.className='tsumtx';sp.textContent=tr.sum;
  const note=document.createElement('div');note.className='tnote';note.appendChild(document.createTextNode((again?'This is today’s reading. ':'')+(tr.cards.length===1?'Tap the card for more about it.':'Tap a card for more about it.')+' '+SPREADS[tr.k].next));
  s.append(sp,note);
  if(sp.scrollHeight>sp.clientHeight+2){const b=document.createElement('button');b.type='button';b.className='tsb tmore';b.textContent='Read all of it';b.addEventListener('click',e=>{e.stopPropagation();tarotSumOpen()});note.appendChild(b)}}
function tarotSumOpen(){const old=tarotEl.querySelector('.tread');if(old)old.remove();sfx('tick');
  const r=document.createElement('div');r.className='tread tsb tsumfull';const txt=document.createElement('div');txt.className='ttext';
  const add=(cls,t,bold)=>{const d=document.createElement('div');d.className=cls;if(bold){const b=document.createElement('b');b.textContent=bold+' ';d.appendChild(b)}d.appendChild(document.createTextNode(t));txt.appendChild(d)};
  add('tname',SPREADS[tr.k].name);add('tmean',tr.story);add('tlore',tr.pat);
  tr.cards.forEach((x,i)=>add('tlore',tarotMean(i),tarotTitle(i)+'.'));
  const back=document.createElement('button');back.type='button';back.className='tsb tback';back.textContent='Back';back.addEventListener('click',e=>{e.stopPropagation();sfx('tick');r.remove()});
  r.append(txt,back);r.addEventListener('click',e=>e.stopPropagation());tarotEl.querySelector('.tbox').appendChild(r)}
// 4. the zoom: the card big, with its meaning and the details for the curious (js/tarotlore.js): what is in the picture,
// its place in the deck, its sign or planet in the old system, and how it was made
function tarotRead(i){const x=tr.cards[i],s=SPREADS[tr.k].pos[i],old=tarotEl.querySelector('.tread');if(old)old.remove();sfx('tick');
  const r=document.createElement('div');r.className='tread tsb';
  const big=tarotImg(x.c.id);big.className='tbig'+(x.rev?' trev':'');
  const txt=document.createElement('div');txt.className='ttext';
  const h=document.createElement('div');h.className='tname';h.textContent=tarotTitle(i);
  const m=document.createElement('div');m.className='tmean';m.textContent=tarotMean(i);txt.append(h,m);
  if(tr.k!=='one'){const w=document.createElement('div');w.className='tlore';w.textContent=s.in.replace(/^[^,]*, /,'This place in the spread shows ')+(s.in.includes(',')?'.':'');if(s.in.includes(','))txt.appendChild(w)}
  // Waite's own words (1910), how readers read it today, and what it would mean the other way up (Jackie, Nov 17)
  const say=(k,v,cls)=>{const d=document.createElement('div');d.className='tlore'+(cls?' '+cls:'');const b=document.createElement('b');b.textContent=k+' ';d.append(b,document.createTextNode(v));txt.appendChild(d)};
  const w=x.rev?x.c.wr:x.c.wu;
  if(TAROT_HARSH.test(w||x.c.wu)){} // his harsher passages are left out (Jackie, Nov 17)
  else if(w)say('A. E. Waite, 1910.','“'+w+'”','twaite');else say('A. E. Waite, 1910.','Waite gives no reversed meaning for this card. Upright he writes “'+x.c.wu+'”','twaite');
  if(TAROT_M[x.c.id])say('Readers today.',TAROT_M[x.c.id]+(x.rev?' That is how they read it upright. Reversed, many take the same thing as blocked, delayed or overdone.':''),'tmodern');
  say(x.rev?'If it were upright.':'If it were reversed.',x.rev?x.c.u:x.c.r,'tother');
  const num=+x.c.id.slice(1);
  if(x.c.id[0]!=='M'&&num>=11)say('How to read it.','A court card can stand for a real person in your life or for a side of yourself. '+(num===11?'Pages are also read as messages and news.':num===12?'Knights are also read as something arriving or leaving.':'Queens and Kings are also read as people with some say over you.'),'thow');
  if(x.c.id[0]!=='M'&&num===1)say('How to read it.','An Ace is the root of its suit. Readers take it as a seed or a first chance.','thow');
  if(TAROT_X[x.c.id])say('Special to this card.',TAROT_X[x.c.id],'tspecial');
  for(const [k,v] of tarotLore(x.c)){const d=document.createElement('div');d.className='tlore';const b=document.createElement('b');b.textContent=k+'. ';d.append(b,document.createTextNode(v));txt.appendChild(d)}
  const back=document.createElement('button');back.type='button';back.className='tsb tback';back.textContent='Back';back.addEventListener('click',e=>{e.stopPropagation();sfx('tick');r.remove()});
  r.append(big,txt,back);r.addEventListener('click',e=>e.stopPropagation());
  tarotEl.querySelector('.tbox').appendChild(r)}
