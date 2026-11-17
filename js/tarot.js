'use strict';
/* THE MOON BOX: A TAROT READING (Jackie, Nov 16). Tap the little box with the moon on the right-hand bookcase and it opens
   over the room: a velvet cloth and a real deck, the Rider-Waite-Smith tarot (Pamela Colman Smith's pictures, 1909, made into
   the room's pixel style), with meanings in plain words written from A. E. Waite's own (1910; js/tarotdata.js).
   Three spreads, picked on the cloth:
     Card of the day   one card.
     Three cards       the past, the present, the future.
     Celtic Cross      ten cards, laid out as Waite gives it in The Pictorial Key (1910): six in a cross (what covers you,
                       what crosses you, crowns you, is beneath you, behind you, before you) and four in a column beside it
                       (yourself, your house, your hopes or fears, what will come). Waite's "him" is "you" here; his
                       Significator (a card picked to stand for the one asking) is left out, as most readers do today.
   A reading: think of a question, tap the deck to shuffle, cut it into three piles and pick one, then turn the cards over one
   by one. About one in three comes up reversed (upside down), which changes its meaning, as in Waite's book. Tap a turned card
   to read it: the card big and its meaning in plain words for its place (Waite's own 1910 wording was shown one tap away at
   first; Jackie had it taken out, Nov 16; it stays in js/tarotdata.js as the record of where each meaning comes from). Once all are turned, a
   line reads the spread the traditional way (how many Major Arcana, which suit leads, whether several are reversed).
   ONCE A DAY (Jackie: "you should not be able to re-do it in the same calendar day", by the phone's clock): each spread can be
   read once per calendar day. The cards are kept (localStorage 'mp-tarot', today's date and today's cards per spread), so
   opening the box again that day shows the same cards face up to read again; a new one comes tomorrow.
   The pictures load only when the box is opened (the back) and when cards are dealt, so the game starts no slower. */
const MOONBOX={x:1492,y:412,w:102,h:76}; // the same box as the 'moonbox' fidget in js/fidgets.js
const TAROT_REV=.35,TAROT_KEY='mp-tarot'; // the chance a card comes up reversed; where today's readings are kept
const SPREADS={
  one:{name:'Card of the day',next:'A new card of the day comes tomorrow.',pos:[{t:'Today',in:'Today'}]},
  three:{name:'Three cards',next:'A new three-card reading comes tomorrow.',pos:[{t:'The past',in:'In the past'},{t:'The present',in:'Right now'},{t:'The future',in:'Coming up'}]},
  cross:{name:'Celtic Cross',next:'A new Celtic Cross comes tomorrow.',pos:[
    {t:'What covers you',in:'What covers you, the mood around the whole matter'},
    {t:'What crosses you',in:'What crosses you, what stands in the way'},
    {t:'What crowns you',in:'What crowns you, the best that can come of it'},
    {t:'What is beneath you',in:'What is beneath you, what it rests on'},
    {t:'What is behind you',in:'What is behind you, what is passing away'},
    {t:'What is before you',in:'What is before you, what comes soon'},
    {t:'Yourself',in:'Yourself, where you stand in it'},
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
  ui.appendChild(tarotEl);tarotStart(tarotPick)}
function closeTarot(){if(tarotEl){tarotEl.remove();tarotEl=null;tr=null}}
function tStage(){return tarotEl&&tarotEl.querySelector('.tstage')}
function tSay(t){const s=tarotEl&&tarotEl.querySelector('.tsay');if(s)s.textContent=t}
function tBack(cls){const b=tarotImg('back');b.className='tcard '+(cls||'');return b}
// the three spread buttons along the top; each shows today's reading if it's been done
function tarotTabs(){const p=tarotEl.querySelector('.tpick');p.innerHTML='';
  for(const [k,s] of Object.entries(SPREADS)){const b=document.createElement('button');b.type='button';b.className='tsb tspick'+(k===tr.k?' on':'');b.dataset.k=k;
    b.textContent=s.name+(tarotDone(k)?' ✓':'');b.addEventListener('click',e=>{e.stopPropagation();if(k===tr.k||(tr.step==='shuffling'))return;sfx('tick');tarotStart(k)});p.appendChild(b)}
  const c=document.createElement('button');c.type='button';c.className='tsb tspick tscharts'+(tr.k==='charts'?' on':'');c.dataset.k='charts';c.textContent='Charts'; // birth charts and horoscopes (js/charts.js)
  c.addEventListener('click',e=>{e.stopPropagation();if(tr.k==='charts'||tr.step==='shuffling')return;sfx('tick');tarotStart('charts')});p.appendChild(c)}
function tarotStart(k){tarotPick=k;if(k==='charts'){chartsShow();return}const done=tarotDone(k);if(done){tarotShow(k,done);return}tarotDeck(k)}
// 1. the deck, waiting for a question
function tarotDeck(k){const S=SPREADS[k];tr={k,step:'deck',deck:null,cards:[],open:S.pos.map(()=>false)};tarotTabs();const st0=tStage();st0.innerHTML='';
  const d=document.createElement('button');d.type='button';d.className='tdeck';d.setAttribute('aria-label','Shuffle the deck');
  for(let i=0;i<4;i++){const b=tBack();b.style.setProperty('--i',i);d.appendChild(b)}
  d.addEventListener('click',e=>{e.stopPropagation();tarotShuffle(d)});st0.appendChild(d);
  tSay(k==='one'?'Think about your day. Then tap the deck to shuffle it.':'Think of a question. Then tap the deck to shuffle it.')}
// 2. shuffle (78 cards, each maybe reversed), then cut into three piles
function tarotShuffle(d){if(tr.step!=='deck')return;tr.step='shuffling';sfx('paper');
  const ids=TAROT.map((c,i)=>i);for(let i=ids.length-1;i>0;i--){const j=tarotRand(i+1);[ids[i],ids[j]]=[ids[j],ids[i]]}
  tr.deck=ids.map(i=>({c:TAROT[i],rev:tarotRand(1000)<TAROT_REV*1000}));
  d.classList.add('tshuf');tSay('Shuffling…');setTimeout(()=>{if(!tarotEl||tr.step!=='shuffling')return;tarotCut()},tsCalm()?60:900)}
function tarotCut(){tr.step='cut';const st0=tStage();st0.innerHTML='';const row=document.createElement('div');row.className='tpiles';
  for(let p=0;p<3;p++){const b=document.createElement('button');b.type='button';b.className='tpile';b.setAttribute('aria-label','Pile '+(p+1));
    for(let i=0;i<3;i++){const c=tBack();c.style.setProperty('--i',i);b.appendChild(c)}
    b.addEventListener('click',e=>{e.stopPropagation();tarotDeal(p)});row.appendChild(b)}
  st0.appendChild(row);tSay('Now cut the deck: tap one of the three piles.')}
// 3. deal from the top of the pile you chose; the reading counts for today from here on
function tarotDeal(p){if(tr.step!=='cut')return;tr.step='dealt';sfx('paper');const n=tr.deck.length,a=Math.floor(n/3),b=Math.floor(2*n/3);
  const piles=[tr.deck.slice(0,a),tr.deck.slice(a,b),tr.deck.slice(b)];tr.deck=piles[p].concat(piles[(p+1)%3],piles[(p+2)%3]); // the chosen pile goes on top
  tr.cards=tr.deck.slice(0,SPREADS[tr.k].pos.length);tr.cards.forEach(x=>{const i=new Image();i.src='tarot/'+x.c.id+'.png'}); // fetch the faces now
  tarotKeep(tr.k,tr.cards);tarotLay(false);tSay(tr.cards.length===1?'Tap the card to turn it over.':'Tap each card to turn it over.')}
// lay the spread out: face down (a new reading) or face up (today's, opened again)
function tarotLay(up){const k=tr.k,S=SPREADS[k],st0=tStage();st0.innerHTML='';const row=document.createElement('div');row.className='tspread t'+k;
  S.pos.forEach((s,i)=>{const slot=document.createElement('div');slot.className='tslot ts'+i;
    const btn=document.createElement('button');btn.type='button';btn.className='tflip';
    btn.addEventListener('click',e=>{e.stopPropagation();if(tr.open[i])tarotRead(i);else tarotFlip(i,btn)});
    slot.appendChild(btn);
    if(k!=='cross'){const lab=document.createElement('div');lab.className='tlab';slot.appendChild(lab)}
    else{const n=document.createElement('div');n.className='tnum';n.textContent=i+1;slot.appendChild(n)}
    row.appendChild(slot);tr.open[i]=up;tarotFace(i,btn,up)});
  st0.appendChild(row)}
function tarotFace(i,btn,up){const x=tr.cards[i],s=SPREADS[tr.k].pos[i];btn.innerHTML='';
  if(up){const f=tarotImg(x.c.id);f.className='tcard'+(x.rev?' trev':'');btn.appendChild(f);btn.setAttribute('aria-label',s.t+': '+x.c.n+(x.rev?', reversed':'')+'. Tap to read it.')}
  else{btn.appendChild(tBack());btn.setAttribute('aria-label',s.t+': turn the card over')}
  const lab=btn.parentNode&&btn.parentNode.querySelector('.tlab');if(lab)lab.textContent=s.t+(up&&x.rev?' · reversed':'')}
function tarotFlip(i,btn){const x=tr.cards[i];tr.open[i]=true;sfx('page');
  const show=()=>{tarotFace(i,btn,true);if(tr.open.every(Boolean))tarotSum();else tSay(x.c.n+(x.rev?', reversed':'')+'. Tap it to read it, or turn the next one.')};
  if(tsCalm()){show();return}
  btn.classList.add('tturn');setTimeout(()=>{show();btn.classList.remove('tturn');btn.classList.add('tturn2');setTimeout(()=>btn.classList.remove('tturn2'),120)},120)} // a stepped turn: narrow, then the face
// today's reading, opened again: the same cards, face up
function tarotShow(k,cards){tr={k,step:'shown',cards,open:cards.map(()=>true)};tarotTabs();tarotLay(true);tarotSum(true)}
// the spread as a whole, the traditional way: big cards and the leading suit
function tarotSum(again){const C=tr.cards,n=C.length,maj=C.filter(x=>x.c.id[0]==='M').length,cnt={};
  for(const x of C)if(x.c.id[0]!=='M')cnt[x.c.id[0]]=(cnt[x.c.id[0]]||0)+1;
  const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0],rev=C.filter(x=>x.rev).length;let t='';
  if(n===1){const x=C[0];t=x.c.id[0]==='M'?'A big card (Major Arcana) for today.':SUIT[x.c.id[0]].n+' today: '+SUIT[x.c.id[0]].m+'.';if(x.rev)t+=' It came up reversed.'}
  else{t+=maj===n?'All big cards (Major Arcana): this is about more than everyday life.':maj>=Math.max(2,n*.4)?'Many big cards (Major Arcana): big forces are at work.':maj>=1?(maj===1?'One big card':maj+' big cards')+' (Major Arcana) in the mix.':'No big cards (Major Arcana): an everyday matter.';
    if(top&&top[1]>=Math.max(2,Math.ceil(n*.3)))t+=' Mostly '+SUIT[top[0]].n+': '+SUIT[top[0]].m+'.';
    if(rev>=Math.max(2,Math.ceil(n*.4)))t+=' Several reversed: things are tangled or slow.'}
  tr.sum=t;tSay((again?'Today’s reading. ':'')+t+(n===1?' Tap it to read it.':' Tap a card to read it.')+' '+SPREADS[tr.k].next);
  tarotTabs()}
// 4. read one card: big, with its meaning for its place
function tarotRead(i){const x=tr.cards[i],s=SPREADS[tr.k].pos[i],old=tarotEl.querySelector('.tread');if(old)old.remove();sfx('tick');
  const r=document.createElement('div');r.className='tread tsb';
  const big=tarotImg(x.c.id);big.className='tbig'+(x.rev?' trev':'');
  const txt=document.createElement('div');txt.className='ttext';
  const h=document.createElement('div');h.className='tname';h.textContent=x.c.n+(x.rev?' (reversed)':'');
  const where=document.createElement('div');where.className='twhere';where.textContent=(tr.k==='cross'?(i+1)+'. ':'')+s.in+':';
  const m=document.createElement('div');m.className='tmean';m.textContent=x.rev?x.c.r:x.c.u;
  const back=document.createElement('button');back.type='button';back.className='tsb tback';back.textContent='Back to the spread';back.addEventListener('click',e=>{e.stopPropagation();sfx('tick');r.remove()});
  txt.append(h,where,m,back);r.append(big,txt);r.addEventListener('click',e=>e.stopPropagation());
  tarotEl.querySelector('.tbox').appendChild(r)}
