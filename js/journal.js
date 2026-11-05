'use strict';
/* JOURNAL (Jackie, Nov 4): a cozy keepsake book opened from the desk drawers, not a status screen.
   Calm and almost wordless: short labels only, no numbers, no meters or bars, no settings screens. No new art: the plants' own
   sprites, the treat and charm pictures and the cat's frames, plus tiny icons drawn here in the room's palette.
   One open book (cream pages, dark stepped pixel outline), fitted to the screen with no scrolling. Ribbons along the top pick the
   page: one per plant (two at most) and one for the cat. A page turn is a 2-frame swap, never a slide or fade.
   Close: tap outside the book or the little corner. Controls: charms (tap to wear, tap again to take off) and the tiny hand inside
   the back cover (which hand carries the carafe). Everything the old journal showed (day, checklist, bars, treat counts, log, pots)
   is still in the save; the numbers live in the debug drawer. */
const DRAWERS={x:1062,y:560,w:118,h:180};
const JB={w:760,h:400,rib:46}; // the book's design size; scaled to fit the room
const QUIRK_SHORT={bonk:'Bonks things',wander:'Wanders',tidy:'Tidy',usual:'Its usual',novel:'New treats',
 catfriend:'Cat buddy',share:'Shares joy',boo:'Spooky',dark:'Dark tastes',sweet:'Sweet tooth'};
const NAP_SPOTS=['bed','rug','chair','sill','crate','books','byplant'];
const RIB_COLORS=[C.coral,C.lav,C.blue,C.g2];
let jPage=null,jEl=null;
// pages that only show up once they have something in them (later: freed plants, postcards, Doctor Bug's notes)
function worldItems(){return [];}

/* ---------- tiny pixel icons (drawn in code, room palette, dark outline like the comic marks) ---------- */
const IPAL={y:C.fl3,o:C.fl2,r:C.fl1,m:C.fl3,w:C.lav,v:C.vio,p:C.coral,c:C.rust,b:C.wine,h:C.peach,g:C.g2,G:C.g1,n:C.blue,f:C.wine,s:C.sand,k:C.brick,i:C.ivory};
const ICONS={
 sun:['....y....','.y.....y.','...ooo...','..ooooo..','y.ooooo.y','..ooooo..','...ooo...','.y.....y.','....y....'],
 shade:['...ww....','..wwww.w.','.wwwwwwww','wwwwwwwww','.wwwwwww.'],
 night:['..mmm...','.mmm....','mmm.....','mmm.....','mmm.....','mmm.....','.mmm....','..mmm...'],
 heart:['.rr.rr.','rrrrrrr','rrrrrrr','.rrrrr.','..rrr..','...r...'],
 squiggle:['.v...v...','v.v.v.v.v','...v...v.'],
 paw:['.b.b.b.','.b.b.b.','b.....b','..bbb..','.bbbbb.','.bbbbb.','..bbb..'],
 hand:['..h.h.h.','..h.h.h.','h.hhhhh.','hhhhhhh.','.hhhhhh.','..hhhh..'],
 leaf:['..g..g.','.ggg.gg','..ggg..','...g...','.ppppp.','..ppp..'],
 bed:['.pppppp.','pccccccp','pccccccp','.pppppp.'],
 rug:['kkkkkkkk','kyyyyyyk','kyvvvvyk','kyyyyyyk','kkkkkkkk'],
 chair:['.yyyyy.','.yyyyy.','yyyyyyy','ykkkkky','y.....y'],
 sill:['fffffff','fnnfnnf','fnnfnnf','fffffff','fnnfnnf','sssssss'],
 crate:['yyyyyyy','y.y.y.y','yy.y.yy','y.y.y.y','yyyyyyy'],
 books:['.vvvvv.','kkkkkkk','.GGGGG.'],
 byplant:['..g..g.','.ggg.gg','..ggg..','...g...','.ppppp.','..ppp..'],
 plane:BUG_PLANE.map(r=>r.replace(/1/g,'i').replace(/2/g,'s').replace(/0/g,'.'))};
function pix(name,px=4,flip=false){const m=ICONS[name],h=m.length,w=m[0].length,c=document.createElement('canvas');c.width=(w+2)*px;c.height=(h+2)*px;c.className='jpix';
 const x=c.getContext('2d'),cell=(i,j)=>{const ch=m[j]&&m[j][i];return ch&&ch!=='.';},at=i=>flip?w-1-i:i;
 x.fillStyle=C.out;for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(cell(i,j))x.fillRect(at(i)*px,j*px,px*3,px*3); // outline: one pixel all round
 for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(cell(i,j)){x.fillStyle=IPAL[m[j][i]]||C.out;x.fillRect((at(i)+1)*px,(j+1)*px,px,px);}
 return c;}

/* ---------- pictures from the game's own sprites ---------- */
function fitCanvas(src,sx,sy,sw,sh,bw,bh){const s=Math.min(bw/sw,bh/sh),c=document.createElement('canvas');c.width=Math.max(1,Math.round(sw*s));c.height=Math.max(1,Math.round(sh*s));c.className='jpix';
 const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(src,sx,sy,sw,sh,0,0,c.width,c.height);return c;}
function trimBox(c){const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=-1,y1=-1;
 for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 return x1<0?null:{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};}
// the plant as it looks right now (age, face, worn charm, mood): drawn by the game itself on a cleared patch of the room canvas, copied out, then the room is put back
function plantPortrait(id,bw,bh){let out=null;withPlant(id,()=>{if(st.stage<0)return;const b=plantBox();
  const x0=clamp(Math.floor(b.x-b.w*.2),0,W-1),y0=clamp(Math.floor(b.y-b.h*.4),0,H-1),w=Math.min(W-x0,Math.ceil(b.w*1.4)),h=Math.min(H-y0,Math.ceil(b.h*1.45));
  const keep=g.getImageData(x0,y0,w,h);g.clearRect(x0,y0,w,h);try{drawPlant();const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(cv,x0,y0,w,h,0,0,w,h);
   const t=trimBox(c);if(t)out=fitCanvas(c,t.x,t.y,t.w,t.h,bw,bh);}finally{g.putImageData(keep,x0,y0);}});
 return out||document.createElement('canvas');}
// growth row: seed, sprout, kid, teen, adult, from this plant's own sprites; filled in up to its age
function ageSprites(){const n=NEWART[st.species+1],pick=k=>n&&ok(n[k])?n[k]:ELDER[st.species];return [SEEDLING.soil[0],SEEDLING.bigsprout[0],BABY[st.species],pick('teen'),pick('adult')];}
function ageStep(s=st.stage){return s<1?0:s<4?1:s<6?2:s<8?3:4;}
function silhouette(im,size,filled){if(!ok(im))return document.createElement('canvas');const c=fitCanvas(im,0,0,im.naturalWidth,im.naturalHeight,size,size),x=c.getContext('2d');
 x.globalCompositeOperation='source-in';x.fillStyle=filled?C.plum:'#ead8c0';x.fillRect(0,0,c.width,c.height);return c;}
function imgPic(im,bw,bh){return ok(im)?fitCanvas(im,0,0,im.naturalWidth,im.naturalHeight,bw,bh):document.createElement('canvas');}
// which charm it's wearing: st.wear, 'none' = taken off, nothing chosen = the newest one (as drawTopper does)
function wornCharm(){const tr=st.traits||[];if(st.wear==='none')return null;return st.wear&&tr.includes(st.wear)?st.wear:tr.slice(-1)[0]||null;}
function bornLine(){return temperament().replace('It seems ','Born ').replace(/\.$/,'');}

/* ---------- the book ---------- */
function jdiv(cls,kids=[],txt){const e=document.createElement('div');e.className=cls;if(txt!=null)e.textContent=txt;for(const k of kids)if(k)e.appendChild(k);return e;}
function jlabel(t){return jdiv('jlab',[],t);}
function fitBook(){if(!jEl)return;const r=wrap.getBoundingClientRect(),k=Math.min(r.width*.96/JB.w,r.height*.95/(JB.h+JB.rib));jEl.querySelector('.jbook').style.transform=`translate(-50%,-50%) scale(${k})`;}
function closeJournal(){if(jEl){jEl.remove();jEl=null;}}
function jPages(){const P=allRaw().filter(q=>q.stage>=0).slice(0,MAX_PLANTS).map(q=>'p'+q.id);P.push('cat');if(worldItems().length)P.push('world');return P;}
function openJournal(page){sfx('page');closeJournal();
 const P=jPages();jPage=page&&P.includes(page)?page:P.includes('p'+st.id)?'p'+st.id:P[0];
 jEl=document.createElement('div');jEl.className='screen journal';jEl.innerHTML='<div class="jbook"><div class="jribs"></div><div class="jcover jstep"><div class="jpage jstep jl"></div><div class="jpage jstep jr"></div></div><button type="button" class="jclose" aria-label="Close">×</button></div>';
 jEl.addEventListener('click',e=>{if(e.target===jEl)closeJournal();}); // tap outside the book
 jEl.querySelector('.jclose').addEventListener('click',e=>{e.stopPropagation();closeJournal();});
 ui.appendChild(jEl);fitBook();renderJournal();}
addEventListener('resize',()=>setTimeout(fitBook,50));
function jTurn(to){if(to===jPage||!jEl)return;sfx('page');const bk=jEl.querySelector('.jcover');
 const f=document.createElement('div');f.className='jturn jturn1 jstep';bk.appendChild(f); // frame 1: the right page lifts
 setTimeout(()=>{f.className='jturn jturn2 jstep';},90); // frame 2: it lands on the left
 setTimeout(()=>{f.remove();jPage=to;renderJournal();},180);}
function renderJournal(){if(!jEl)return;const P=jPages();if(!P.includes(jPage))jPage=P[0];
 const ribs=jEl.querySelector('.jribs');ribs.innerHTML='';
 P.forEach((p,i)=>{const r=document.createElement('button');r.type='button';r.className='jrib'+(p===jPage?' on':'');r.dataset.page=p;r.style.background=RIB_COLORS[i%RIB_COLORS.length];r.style.left=(430+i*52)+'px';
  r.setAttribute('aria-label',p==='cat'?'The cat':p==='world'?'Out in the world':'Plant');r.appendChild(pix(p==='cat'?'paw':p==='world'?'plane':'leaf',3));
  r.addEventListener('click',e=>{e.stopPropagation();jTurn(p);});ribs.appendChild(r);});
 const L=jEl.querySelector('.jl'),R=jEl.querySelector('.jr');L.innerHTML='';R.innerHTML='';
 if(jPage==='cat')catPages(L,R);else if(jPage==='world')worldPages(L,R);else withPlant(+jPage.slice(1),()=>plantPages(L,R));
 // inside the back cover: which hand carries the carafe (tap to flip)
 const hand=document.createElement('button');hand.type='button';hand.className='jhand';hand.setAttribute('aria-label',st.leftHand?'Left-handed':'Right-handed');hand.appendChild(pix('hand',3,!!st.leftHand));
 hand.addEventListener('click',e=>{e.stopPropagation();st.leftHand=!st.leftHand;sfx('tick');save();renderJournal();});R.appendChild(hand);
 // Doctor Bug's note, tucked in until you say yes
 if(st.bugJournal&&bugReady()){const n=document.createElement('button');n.type='button';n.className='jbugnote';n.setAttribute('aria-label','A note from Doctor Bug');n.appendChild(pix('plane',3));
  n.addEventListener('click',e=>{e.stopPropagation();bugCard();});R.appendChild(n);}}
function bugCard(){const old=jEl.querySelector('.jbugask');if(old){old.remove();return;}sfx('page');
 const c=jdiv('jbugask jstep',[],null);c.innerHTML='<div>“'+BUG_ASK+'”</div><div class="jbtns"><button type="button" data-k="y">Yes, please</button><button type="button" data-k="n">Not yet</button></div>';
 c.querySelector('[data-k=y]').addEventListener('click',e=>{e.stopPropagation();bugYes();renderJournal();c.remove();});
 c.querySelector('[data-k=n]').addEventListener('click',e=>{e.stopPropagation();c.remove();});jEl.querySelector('.jcover').appendChild(c);}

/* ---------- a plant's pages ---------- */
function plantPages(L,R){
 const id=st.id,steps=ageSprites(),at=ageStep();
 L.appendChild(st.name?nameTag(id):jdiv('jname',[],NAMES[st.species])); // its name once its eyes are open; the species small underneath
 if(st.name)L.appendChild(jdiv('jspecies',[],NAMES[st.species]));
 L.appendChild(jdiv('jportrait',[plantPortrait(id,240,196)]));
 L.appendChild(jdiv('jgrowth',steps.map((im,i)=>silhouette(im,34,i<=at))));
 L.appendChild(jdiv('jborn',[],bornLine()));
 // likes: its light, and the last treat it loved (blank until then)
 const fav=st.fav&&TREAT_IMG[st.fav];
 const likes=jdiv('jrow',[jdiv('jgroup',[jlabel('Likes'),jdiv('jicons',[pix(st.pref==='sun'?'sun':st.pref==='shade'?'shade':'night',4),fav?jdiv('jfav',[imgPic(fav,40,40)]):jdiv('jblank')])])]);
 // friends: a tiny portrait of the other plant with a heart or a squiggle, or nothing
 const pals=allRaw().filter(q=>q.id!==id&&q.stage>=4).map(q=>({q,r:rel(st,q)})).filter(o=>o.r==='friends'||o.r==='bicker');
 if(pals.length)likes.appendChild(jdiv('jgroup',[jlabel('Friends'),jdiv('jicons',pals.flatMap(o=>[jdiv('jpal',[plantPortrait(o.q.id,44,48)]),pix(o.r==='friends'?'heart':'squiggle',4)]))]));
 R.appendChild(likes);
 const titles=(st.titles||[]).filter(t=>TITLES[t]);
 if(titles.length)R.appendChild(jdiv('jgroup',[jlabel('Titles'),jdiv('jstamps',titles.map(t=>jdiv('jstamp jtitle',[],TITLES[t])))]));
 const charms=(st.traits||[]).filter(t=>TOPPER_IMG[t]),worn=wornCharm();
 if(charms.length){const row=jdiv('jstickers',charms.map(t=>{const b=document.createElement('button');b.type='button';b.className='jcharm'+(t===worn?' worn':'');b.dataset.trait=t;b.setAttribute('aria-label',t);b.appendChild(imgPic(TOPPER_IMG[t],38,38));
   b.addEventListener('click',e=>{e.stopPropagation();st.wear=wornCharm()===t?'none':t;sfx('pop');save();renderJournal();});return b;}));
  R.appendChild(jdiv('jgroup',[jlabel('Charms'),row]));}
 const seen=st.quirks||{};
 R.appendChild(jdiv('jgroup',[jlabel('Quirks'),jdiv('jstamps jquirks',Object.keys(QUIRK_SHORT).map(k=>seen[k]?jdiv('jstamp',[],QUIRK_SHORT[k]):jdiv('jstamp jfaint')))]));}

// tap the name to type a new one (16 letters at most); cleared = it keeps its old name
function nameTag(id){const b=document.createElement('button');b.type='button';b.className='jname jrename';b.textContent=st.name;b.setAttribute('aria-label','Rename '+st.name);
 b.addEventListener('click',e=>{e.stopPropagation();const old=st.name,inp=document.createElement('input');inp.className='jname jnameinput';inp.maxLength=16;inp.value=old;inp.setAttribute('aria-label','Name');
  let done=false;const finish=()=>{if(done)return;done=true;const v=inp.value.replace(/\s+/g,' ').trim().slice(0,16);
   withPlant(id,()=>{if(v)st.name=v;else tell('Back to '+old+'.',{kind:'info'});});sfx('tick');save();renderJournal();};
  inp.addEventListener('keydown',ev=>{ev.stopPropagation();if(ev.key==='Enter')finish();if(ev.key==='Escape'){inp.value=old;finish();}});
  inp.addEventListener('blur',finish);inp.addEventListener('click',ev=>ev.stopPropagation());b.replaceWith(inp);inp.focus();inp.select();});
 return b;}

/* ---------- the cat's pages ---------- */
function catPages(L,R){
 const tr=catTrust(),paws=1+[TRUST_SHY,TRUST_FOND,TRUST_BFF].filter(t=>tr>=t).length;
 L.appendChild(jdiv('jname',[],'The cat'));
 const f=CATF.loaf1&&ok(CATF.loaf1)?CATF.loaf1:CATF.sit1;
 L.appendChild(jdiv('jportrait',[imgPic(f,220,170)]));
 L.appendChild(jdiv('jpaws',Array.from({length:paws},()=>pix('paw',5))));
 const naps=Object.entries(st.catNaps||{}).filter(([k,n])=>n>0&&NAP_SPOTS.includes(k)).sort((a,b)=>b[1]-a[1]).slice(0,3);
 if(naps.length)R.appendChild(jdiv('jgroup',[jlabel('Favorite naps'),jdiv('jicons',naps.map(([k])=>pix(k,5)))]));
 const seen=st.catSeen||{};
 R.appendChild(jdiv('jgroup',[jlabel('Quirks'),jdiv('jstamps jquirks',Object.keys(CAT_QUIRKS).map(k=>seen[k]?jdiv('jstamp',[],CAT_QUIRKS[k]):jdiv('jstamp jfaint')))]));}

/* ---------- out in the world (hidden until it has something) ---------- */
function worldPages(L,R){L.appendChild(jdiv('jname',[],'Out in the world'));for(const it of worldItems())R.appendChild(jdiv('jgroup',[jlabel(it.label||'')]));}

/* JOURNAL PLACARD (Jackie, Nov 4): a little brass nameplate on the plain bottom panel of the desk drawers, like the SNACKS sign.
   Drawn in code from the room palette on whole pixels (2 room units each), dark outline, a tiny 3x5 pixel-font label. It never
   glows, blinks or bounces; it moves only with the drawers' idle wiggle. Lit like the wood around it: the panel's color in the
   current room picture (time of day, lamps, curtains) against the daytime picture shades it, so it darkens at night and warms
   under the desk lamp. Tapping it is tapping the drawers: the journal opens. */
const PLACARD={x:1092,y:699,u:2}; // top-left of the plate and its pixel size, on the panel under the third drawer (x 1084-1170, y 698-722)
const PFONT={J:['011','001','001','101','010'],O:['010','101','101','101','010'],U:['101','101','101','101','111'],R:['110','101','110','101','101'],N:['101','111','111','111','101'],A:['010','101','111','101','101'],L:['100','100','100','100','111']};
const PLATE=(()=>{const t='JOURNAL',w=t.length*4-1+6,h=11,rows=[];for(let j=0;j<h;j++){let r='';for(let i=0;i<w+2;i++){
  const edge=j===0||j===h-1||i===0||i===w+1,corner=(j===0||j===h-1)&&(i===0||i===w+1);
  if(corner){r+='.';continue;}if(edge){r+='o';continue;}
  let ch=j===1?'h':j===h-2?'d':'b'; // brass: a light top row, a shaded bottom row
  if((j===2||j===h-3)&&(i===2||i===w-1))ch='s'; // four little screws
  const tx=i-4,ty=j-3,gi=Math.floor(tx/4),gx=tx%4;if(ty>=0&&ty<5&&tx>=0&&gi<t.length&&gx<3&&PFONT[t[gi]][ty][gx]==='1')ch='t';
  r+=ch;}rows.push(r);}return rows;})();
const PCOL={o:C.out,h:C.g4,b:C.fl3,d:C.fl2,s:C.rust,t:C.wine};
let placardCv=null,placardKey='',placardRef=null;
function panelAvg(src,sx,sy){const c=document.createElement('canvas');c.width=60;c.height=12;const x=c.getContext('2d');x.drawImage(src,sx,sy,60,12,0,0,60,12);const d=x.getImageData(0,0,60,12).data;let r=0,gg=0,b=0;for(let i=0;i<d.length;i+=4){r+=d[i];gg+=d[i+1];b+=d[i+2];}const n=d.length/4;return [r/n,gg/n,b/n];}
function drawPlacard(key){if(!ok(ROOMS.day))return;
 if(key!==placardKey){placardKey=key;placardRef=placardRef||panelAvg(ROOMS.day,PLACARD.x+5,PLACARD.y+5);const cur=panelAvg(cv,PLACARD.x+5,PLACARD.y+5);
  const f=[0,1,2].map(i=>clamp(cur[i]/Math.max(1,placardRef[i]),0,1)),u=PLACARD.u,c=document.createElement('canvas');c.width=PLATE[0].length*u;c.height=PLATE.length*u;const x=c.getContext('2d');
  PLATE.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='.')return;x.fillStyle=PCOL[ch];x.fillRect(i*u,j*u,u,u);}));
  x.globalCompositeOperation='multiply';x.fillStyle=`rgb(${Math.round(f[0]*255)},${Math.round(f[1]*255)},${Math.round(f[2]*255)})`;x.fillRect(0,0,c.width,c.height); // lit like the panel
  x.globalCompositeOperation='source-over';PLATE.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='.')x.clearRect(i*u,j*u,u,u);}));placardCv=c;} // the rounded corners stay see-through
 const io=idleOn&&idleOn.it.n==='desk drawers (journal)'?idleOffset(performance.now()):0; // moves with the drawers' idle wiggle, nothing else
 g.drawImage(placardCv,PLACARD.x+io,PLACARD.y);}

function logEv(t){st.log=(st.log||[]).concat(t).slice(-6);}
function met(n){st.met[n]=1;st.hint[n]=(st.hint[n]||0)+1;nudgeSun();}
