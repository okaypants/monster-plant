'use strict';
/* THE MOON BOX: A TAROT READING (Jackie, Nov 16). Tap the little box with the moon on the right-hand bookcase and it opens
   over the room: a velvet cloth and a real deck, the Rider-Waite-Smith tarot (Pamela Colman Smith's pictures, 1909, made into
   the room's pixel style), with A. E. Waite's own meanings (1910) behind plain words (js/tarotdata.js).
   One spread, the classic three cards: the past, the present, the future.
     1. Think of a question; tap the deck to shuffle it.
     2. Cut it: the deck splits into three piles; tap one.
     3. Three cards are dealt face down. Tap each to turn it over. About one in three comes up reversed (upside down), which
        changes its meaning, as in Waite's book.
     4. Tap a turned card to read it: the card big, its meaning in plain words for its place in the spread, and Waite's own
        words one tap away. Once all three are turned, a line reads the spread as a whole the traditional way: how many big
        cards (Major Arcana) came up and which suit leads.
   The pictures load only when the box is opened (the back) and when a card is dealt (its face), so the game starts no
   slower. Nothing is saved. */
const MOONBOX={x:1492,y:412,w:102,h:76}; // the same box as the 'moonbox' fidget in js/fidgets.js
const TAROT_REV=.35; // the chance a card comes up reversed
const SPREAD=[{k:'past',t:'The past',in:'In the past'},{k:'now',t:'The present',in:'Right now'},{k:'next',t:'The future',in:'Coming up'}];
const SUIT={W:{n:'Wands',m:'energy, work and new ventures'},C:{n:'Cups',m:'feelings, love and friendship'},S:{n:'Swords',m:'thoughts, troubles and hard choices'},P:{n:'Pentacles',m:'money, home and everyday things'}};
let tarotEl=null,tr=null;
function tarotImg(id){const i=new Image();i.src='tarot/'+id+'.png';i.alt='';i.draggable=false;return i}
function tarotRand(n){try{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%n}catch(e){return Math.floor(Math.random()*n)}}
function openTarot(){if(tarotEl)return;sfx('tick');
  tarotEl=document.createElement('div');tarotEl.className='screen tarot';
  tarotEl.innerHTML='<div class="tbox tsb tspop"><button type="button" class="tsb tx" aria-label="Close">×</button><div class="tstage"></div><div class="tsay"></div></div>';
  tarotEl.addEventListener('click',e=>{if(e.target===tarotEl)closeTarot()});
  tarotEl.querySelector('.tx').addEventListener('click',e=>{e.stopPropagation();closeTarot()});
  ui.appendChild(tarotEl);tarotDeck()}
function closeTarot(){if(tarotEl){tarotEl.remove();tarotEl=null;tr=null}}
function tStage(){return tarotEl&&tarotEl.querySelector('.tstage')}
function tSay(t){const s=tarotEl&&tarotEl.querySelector('.tsay');if(s)s.textContent=t}
function tBack(cls){const b=tarotImg('back');b.className='tcard '+(cls||'');return b}
// 1. the deck, waiting for a question
function tarotDeck(){tr={step:'deck',deck:null,cards:[],open:[false,false,false]};const st0=tStage();st0.innerHTML='';
  const d=document.createElement('button');d.type='button';d.className='tdeck';d.setAttribute('aria-label','Shuffle the deck');
  for(let i=0;i<4;i++){const b=tBack();b.style.setProperty('--i',i);d.appendChild(b)}
  d.addEventListener('click',e=>{e.stopPropagation();tarotShuffle(d)});st0.appendChild(d);
  tSay('Think of a question. Then tap the deck to shuffle it.')}
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
// 3. deal three from the top of the pile you chose
function tarotDeal(p){if(tr.step!=='cut')return;tr.step='dealt';sfx('paper');const n=tr.deck.length,a=Math.floor(n/3),b=Math.floor(2*n/3);
  const piles=[tr.deck.slice(0,a),tr.deck.slice(a,b),tr.deck.slice(b)];tr.deck=piles[p].concat(piles[(p+1)%3],piles[(p+2)%3]); // the chosen pile goes on top
  tr.cards=tr.deck.slice(0,3);tr.cards.forEach(x=>{const i=new Image();i.src='tarot/'+x.c.id+'.png'}); // fetch the three faces now
  const st0=tStage();st0.innerHTML='';const row=document.createElement('div');row.className='tspread';
  SPREAD.forEach((s,i)=>{const slot=document.createElement('div');slot.className='tslot';
    const btn=document.createElement('button');btn.type='button';btn.className='tflip';btn.setAttribute('aria-label',s.t+': turn the card over');btn.appendChild(tBack());
    btn.addEventListener('click',e=>{e.stopPropagation();if(tr.open[i])tarotRead(i);else tarotFlip(i,btn)});
    const lab=document.createElement('div');lab.className='tlab';lab.textContent=s.t;slot.append(btn,lab);row.appendChild(slot)});
  st0.appendChild(row);tSay('Tap each card to turn it over.')}
function tarotFlip(i,btn){const x=tr.cards[i];tr.open[i]=true;sfx('page');
  const show=()=>{btn.innerHTML='';const f=tarotImg(x.c.id);f.className='tcard'+(x.rev?' trev':'');btn.appendChild(f);btn.setAttribute('aria-label',SPREAD[i].t+': '+x.c.n+(x.rev?', reversed':'')+'. Tap to read it.');
    btn.parentNode.querySelector('.tlab').textContent=SPREAD[i].t+(x.rev?' · reversed':'');
    if(tr.open.every(Boolean))tarotSum();else tSay(x.c.n+(x.rev?', reversed':'')+'. Tap it to read it, or turn the next one.')};
  if(tsCalm()){show();return}
  btn.classList.add('tturn');setTimeout(()=>{show();btn.classList.remove('tturn');btn.classList.add('tturn2');setTimeout(()=>btn.classList.remove('tturn2'),120)},120)} // a stepped turn: narrow, then the face
// the spread as a whole, the traditional way: big cards and the leading suit
function tarotSum(){const C=tr.cards,maj=C.filter(x=>x.c.id[0]==='M').length,cnt={};
  for(const x of C)if(x.c.id[0]!=='M')cnt[x.c.id[0]]=(cnt[x.c.id[0]]||0)+1;
  const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0],rev=C.filter(x=>x.rev).length;let t='';
  t+=maj===3?'All three are big cards (Major Arcana): this is about more than everyday life.':maj===2?'Two big cards (Major Arcana): big forces are at work.':maj===1?'One big card (Major Arcana) at the heart of it.':'No big cards (Major Arcana): an everyday matter.';
  if(top&&top[1]>=2)t+=' Mostly '+SUIT[top[0]].n+': '+SUIT[top[0]].m+'.';
  if(rev>=2)t+=' Several reversed: things are tangled or slow.';
  tr.sum=t;tSay(t+' Tap a card to read it.');
  const again=document.createElement('button');again.type='button';again.className='tsb tagain';again.textContent='New reading';again.addEventListener('click',e=>{e.stopPropagation();sfx('tick');tarotDeck()});
  const s=tarotEl.querySelector('.tsay');s.appendChild(document.createTextNode(' '));s.appendChild(again)}
// 4. read one card: big, its meaning for its place, and Waite's own words a tap away
function tarotRead(i){const x=tr.cards[i],s=SPREAD[i],old=tarotEl.querySelector('.tread');if(old)old.remove();sfx('tick');
  const r=document.createElement('div');r.className='tread tsb';
  const big=tarotImg(x.c.id);big.className='tbig'+(x.rev?' trev':'');
  const txt=document.createElement('div');txt.className='ttext';
  const h=document.createElement('div');h.className='tname';h.textContent=x.c.n+(x.rev?' (reversed)':'');
  const where=document.createElement('div');where.className='twhere';where.textContent=s.in+':';
  const m=document.createElement('div');m.className='tmean';m.textContent=x.rev?x.c.r:x.c.u;
  const w=document.createElement('button');w.type='button';w.className='tsb twaite';w.textContent="Waite's own words";
  const q=document.createElement('div');q.className='tquote';q.hidden=true;const wt=x.rev?x.c.wr:x.c.wu;
  q.textContent=wt?'“'+wt+'” (A. E. Waite, 1910'+(x.rev?', reversed':'')+')':'Waite gives no reversed meaning for this card.';
  w.addEventListener('click',e=>{e.stopPropagation();q.hidden=!q.hidden;w.textContent=q.hidden?"Waite's own words":"Hide Waite's words"});
  const back=document.createElement('button');back.type='button';back.className='tsb tback';back.textContent='Back to the spread';back.addEventListener('click',e=>{e.stopPropagation();sfx('tick');r.remove()});
  txt.append(h,where,m,q,w,back);r.append(big,txt);r.addEventListener('click',e=>e.stopPropagation());
  tarotEl.querySelector('.tbox').appendChild(r)}
