'use strict';
/* TEXT STYLE (Jackie, Nov 10): one look for every word in the game. The colors and shapes are here and in css/textstyle.css;
   everything else (captions, speech bubbles, notes, Sloth's letters, the FILES drawer, journal pages, name tags, buttons,
   the FILES placard) uses them. Cream paper, cocoa ink, 3px cocoa outline, stepped pixel corners, a solid toffee shadow.
   Every text color is at least 4.5:1 on its paper and every icon at least 3:1 (tests/textstyle_shots.py checks). */
const TS={paper:'#FFF4E0',ink:'#5B3A2E',rust:'#A84B26',sage:'#CFE3C2',mint:'#E4F4EA',mintInk:'#2F6B57',toffee:'#B98C66',brass:'#E2B04A',brassInk:'#3A2406'};

/* Each monster's look: a soft tint (its speech bubbles and name tag), a deep name color and a pixel symbol, so a name is never
   told apart by color alone. Given at birth, in this order, skipping any a monster in the room already has. Muted and calm. */
const LOOKS=[
 {k:'greyblue',tint:'#E7EDF3',name:'#3F5468',rib:'#8FA3B8',sym:'star'},
 {k:'butter',  tint:'#FFF3C4',name:'#6B500A',rib:'#E2B93B',sym:'drop'},
 {k:'sage',    tint:'#E5F0DC',name:'#3D5A30',rib:'#9CBB88',sym:'leaf'},
 {k:'clay',    tint:'#F7E4DA',name:'#7A3B26',rib:'#D39A80',sym:'triangle'},
 {k:'mist',    tint:'#ECE9F5',name:'#4C4470',rib:'#A9A0CC',sym:'moon'},
 {k:'sand',    tint:'#F3EBDC',name:'#5E4A2C',rib:'#C9B38E',sym:'diamond'},
 {k:'pond',    tint:'#E0EFEC',name:'#2E5B56',rib:'#8DBDB5',sym:'ring'}];
const CAT_LOOK={k:'cat',tint:'#ECE7E1',name:'#4A3F37',rib:'#BFB3A6',sym:'paw'};
function lookOf(p){return p==='cat'?CAT_LOOK:(p&&LOOKS[p.look])||LOOKS[0];}
// gives every monster in the room a look, never two the same (old saves and new seeds get theirs the first time they're seen)
function looksTick(){const used=new Set();for(const q of allRaw()){if(LOOKS[q.look]&&!used.has(q.look)){used.add(q.look);continue;}
  const i=LOOKS.findIndex((_,j)=>!used.has(j));q.look=i<0?0:i;used.add(q.look);}}

/* tiny pixel symbols, one flat color, no outline */
const TS_GLYPH={
 star:['...#...','..###..','#######','.#####.','..###..','.##.##.','.#...#.'],
 drop:['...#...','..###..','..###..','.#####.','.#####.','.#####.','..###..'],
 leaf:['....###','..#####','.######','.#####.','.####..','.#.....','#......'],
 triangle:['...#...','...#...','..###..','..###..','.#####.','.#####.','#######'],
 moon:['..###..','.###...','###....','###....','###....','.###...','..###..'],
 diamond:['...#...','..###..','.#####.','#######','.#####.','..###..','...#...'],
 ring:['..###..','.#####.','##...##','##...##','##...##','.#####.','..###..'],
 paw:['.#.#.#.','.#.#.#.','#.....#','..###..','.#####.','.#####.','..###..'],
 sun:['...#...','.#...#.','..###..','#.###.#','..###..','.#...#.','...#...'],
 heart:['.##.##.','#######','#######','.#####.','..###..','...#...'],
 check:['......#','.....##','#...##.','##.##..','.###...','..#....'],
 hourglass:['#######','.#...#.','..#.#..','...#...','..###..','.#####.','#######'],
 plane:['#......','###....','.#####.','..#####','.#####.','###....','#......']};
const tsGlyphCache=new Map();
// a glyph (or any ICONS-style map: every mark becomes one color) as a data URL, each map cell px pixels
function tsGlyphURL(name,color,px=2){const key=name+color+px;if(tsGlyphCache.has(key))return tsGlyphCache.get(key);
 const m=TS_GLYPH[name]||(typeof ICONS!=='undefined'&&ICONS[name]);if(!m)return '';const c=document.createElement('canvas');c.width=m[0].length*px;c.height=m.length*px;const x=c.getContext('2d');x.fillStyle=color;
 m.forEach((r,j)=>[...r].forEach((v,i)=>{if(v!=='.')x.fillRect(i*px,j*px,px,px);}));const u=c.toDataURL();tsGlyphCache.set(key,u);return u;}
function tsGlyph(name,color,cls='tssym',px=2){const im=document.createElement('img');im.className=cls;im.alt='';im.src=tsGlyphURL(name,color,px);im.setAttribute('aria-hidden','true');return im;}

/* names: bold, in their name color, with their symbol in front. Works on any text: captions, bubbles, letters. */
function tsNamesKnown(){const out=[],add=(n,l)=>{if(n&&n.length>1)out.push([n,l]);};
 try{for(const q of allRaw()){add(q.name,lookOf(q));add(firstName(q),lookOf(q));}
  for(const e of st.archive||[]){add(e.name,lookOf(e.snap));add(firstName(e.snap),lookOf(e.snap));}
  if(st.catName)add(st.catName,CAT_LOOK);}catch(e){}
 return out.sort((a,b)=>b[0].length-a[0].length);}
function tsNameEl(text,look){const b=document.createElement('b');b.className='tsname';b.style.color=look.name;b.appendChild(tsGlyph(look.sym,look.name));b.appendChild(document.createTextNode(text));return b;}
function tsNamify(el){const known=tsNamesKnown();if(!known.length)return el;
 const re=new RegExp('\\b('+known.map(([n])=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\b','g'),look=new Map(known);
 const walk=n=>{for(const c of [...n.childNodes]){if(c.nodeType===3){const t=c.nodeValue;re.lastIndex=0;if(!re.test(t))continue;re.lastIndex=0;const f=document.createDocumentFragment();let at=0,m;
   while((m=re.exec(t))){if(m.index>at)f.appendChild(document.createTextNode(t.slice(at,m.index)));f.appendChild(tsNameEl(m[0],look.get(m[0])));at=m.index+m[0].length;}
   if(at<t.length)f.appendChild(document.createTextNode(t.slice(at)));c.replaceWith(f);}
  else if(c.nodeType===1&&!c.classList.contains('tsname')&&c.tagName!=='BUTTON'&&c.tagName!=='INPUT')walk(c);}};
 walk(el);return el;}

/* choice buttons: the same size side by side, a pixel icon and a word each (never color alone), one short line under each saying
   what happens. kind 'yes' = sage with a check; 'wait' = cream with an hourglass. Returns HTML for a bubble or card. */
function tsChoices(list){return '<div class="tschoices">'+list.map(([k,label,sub,kind,icon])=>'<div class="tschoice"><button type="button" data-k="'+k+'" class="tsb tsbtn ts'+kind+'"><img class="tsicon" alt="" aria-hidden="true" src="'+
  tsGlyphURL(icon||(kind==='yes'?'check':'hourglass'),TS.ink)+'">'+label+'</button>'+(sub?'<div class="tssub">'+sub+'</div>':'')+'</div>').join('')+'</div>';}

/* words appear in 2-3 stepped pops (never a fade, never a typewriter); with the phone's reduce-motion setting they just appear */
const tsCalm=()=>!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
// Sloth's postage stamp: a code-drawn silhouette (real art later: sloth_portrait.png, see LETTER_ART in js/plants.js)
function tsStampHTML(px=2){return '<span class="jlstamp"><img class="jpix" alt="" aria-hidden="true" src="'+tsGlyphURL('sloth',TS.mintInk,px)+'"></span>';}
function tsPop(el){if(!el)return;el.classList.remove('tspop');void el.offsetWidth;el.classList.add('tspop');}
