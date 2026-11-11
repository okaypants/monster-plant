'use strict';
/* JOURNAL (Jackie, Nov 4): a cozy keepsake book opened from the name tags (the desk drawers hold the files now), not a status screen.
   Calm and almost wordless: short labels only, no numbers, no meters or bars, no settings screens. No new art: the plants' own
   sprites, the treat and charm pictures and the cat's frames, plus tiny icons drawn here in the room's palette.
   One open book (cream pages, dark stepped pixel outline), fitted to the screen with no scrolling. Ribbons along the top pick the
   page: one per plant (two at most) and one for the cat. A page turn is a 2-frame swap, never a slide or fade.
   Close: tap outside the book or the little corner. Controls: charms (tap to wear, tap again to take off) and the tiny hand inside
   the back cover (which hand carries the carafe). Everything the old journal showed (day, checklist, bars, treat counts, log, pots)
   is still in the save; the numbers live in the debug drawer. */
const DRAWERS={x:1062,y:560,w:118,h:180};
const JB={w:760,h:400,rib:46}; // the book's design size; scaled to fit the room
const QUIRK_SHORT={moon:'Moon bouncer',bonk:'Bonks things',wander:'Wanders',tidy:'Tidy',usual:'Its usual',novel:'New treats',
 catfriend:'Cat buddy',share:'Shares joy',boo:'Spooky',dark:'Dark tastes',sweet:'Sweet tooth'};
const NAP_SPOTS=['bed','rug','chair','sill','crate','books','byplant'];
const RIB_COLORS=[C.coral,C.lav,C.blue,C.g2];
let jPage=null,jEl=null,jSub=0; // jSub: which spread of that animal (0 = its main pages, then one per relationship)
// pages that only show up once they have something in them (later: freed plants, postcards, Sloth's notes)
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
 left:['...k','..kk','.kkk','kkkk','.kkk','..kk','...k'],right:['k...','kk..','kkk.','kkkk','kkk.','kk..','k...'],
 sloth:['bbbbbbbbbbbbbbbb','...b........b...','...b........b...','...bb......bb...','....bbbbbbbb....','...bbbbbbbbbb...','..bbbbbbbbbbbb..','..bb...bb...bb..','..bb...bb...bb..','..bbbbbbbbbbbb..','...bbbb..bbbb...','....bbbbbbbb....','.....bbbbbb.....']}; // (the paper airplane icon is gone: Sloth's notes show the envelope art, Nov 10)
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
const LAB_ICON={Likes:'sun',Friends:'heart',Quirks:'star'}; // small rust pixel icons over these sections
function jlabel(t){const l=jdiv('jlab',[],null);if(LAB_ICON[t])l.appendChild(tsGlyph(LAB_ICON[t],TS.rust,'tslabicon'));l.appendChild(document.createTextNode(t));return l;}
function fitBook(){if(!jEl)return;const noRib=jEl.classList.contains('archive'),r=wrap.getBoundingClientRect(),k=Math.min(r.width*.96/JB.w,r.height*.95/(JB.h+(noRib?0:JB.rib))),dy=noRib?-Math.round(JB.rib/2*k):0; // the Files have no ribbons: their room goes to the pages
 jEl.bookK=k;const bk=jEl.querySelector('.jbook');bk.style.setProperty('--jk',k);bk.style.transform=`translate(-50%,calc(-50% + ${dy}px)) scale(${k})`;} // --jk keeps small print at 14px or more on screen (css/textstyle.css)
function closeJournal(){if(jEl){jEl.remove();jEl=null;}jKeep=null;if(jPage==='archive'||jPage==='keep'){jPage=null;jSub=0;}}
function jPages(){const P=allRaw().filter(q=>q.stage>=0).slice(0,MAX_PLANTS).map(q=>'p'+q.id);P.push('cat');if(worldItems().length)P.push('world');return P;}
function openJournal(page){sfx('page');closeJournal();
 const P=jPages();jPage=page&&P.includes(page)?page:P.includes('p'+st.id)?'p'+st.id:P[0];
 jEl=document.createElement('div');jEl.className='screen journal';jEl.innerHTML='<div class="jbook"><div class="jribs"></div><div class="jcover jstep"><div class="jpage jstep jl"></div><div class="jpage jstep jr"></div></div><button type="button" class="jclose tsb" aria-label="Close">×</button></div>';
 jEl.addEventListener('click',e=>{if(e.target===jEl)closeJournal();}); // tap outside the book
 jEl.querySelector('.jclose').addEventListener('click',e=>{e.stopPropagation();closeJournal();});
 ui.appendChild(jEl);fitBook();renderJournal();}
addEventListener('resize',()=>setTimeout(fitBook,50));
// once Fredoka has loaded, lay the open book out again: what fits on a page depends on the real letters
if(document.fonts&&document.fonts.addEventListener)document.fonts.addEventListener('loadingdone',()=>{if(jEl&&!jEl.querySelector('input')){jEl.more={};renderJournal();}});
function jTurn(to,sub=0){if((to===jPage&&sub===jSub)||!jEl)return;sfx('page');const bk=jEl.querySelector('.jcover');
 if(tsCalm()){jPage=to;jSub=sub;renderJournal();return;} // reduce motion: the new page just appears
 const f=document.createElement('div');f.className='jturn jturn1 jstep';bk.appendChild(f); // frame 1: the right page lifts
 setTimeout(()=>{f.className='jturn jturn2 jstep';},90); // frame 2: it lands on the left
 setTimeout(()=>{f.remove();jPage=to;jSub=sub;renderJournal();},180);}
function renderJournal(){if(!jEl)return;if(jPage==='archive'){renderArchive();return;}if(jPage==='keep'){renderKeepsake();return;}const P=jPages();if(!P.includes(jPage)){jPage=P[0];jSub=0;}
 const ribs=jEl.querySelector('.jribs');ribs.innerHTML='';
 P.forEach((p,i)=>{const r=document.createElement('button');r.type='button';r.className='jrib'+(p===jPage?' on':'');r.dataset.page=p;r.style.left=(430+i*52)+'px';
  const q=p[0]==='p'?allRaw().find(o=>o.id===+p.slice(1)):null,lk=p==='cat'?CAT_LOOK:q?lookOf(q):null; // each ribbon: the monster's ribbon color and symbol (the cat: a paw)
  r.style.background=lk?lk.rib:TS.toffee;r.setAttribute('aria-label',p==='cat'?catName():p==='world'?'Out in the world':(q&&q.name)||'Plant');r.appendChild(tsGlyph(lk?lk.sym:'plane',lk?lk.name:TS.ink,'tssym',3));
  r.addEventListener('click',e=>{e.stopPropagation();jTurn(p);});ribs.appendChild(r);});
 const L=jEl.querySelector('.jl'),R=jEl.querySelector('.jr');L.innerHTML='';R.innerHTML='';
 const main=(l,r)=>{if(jPage==='cat')catPages(l,r);else if(jPage==='world')worldPages(l,r);else withPlant(+jPage.slice(1),()=>plantPages(l,r));};
 const subs=withMore(relSpreads(jPage),jPage);if(jSub>=subs.length)jSub=0;const sp=subs[jSub];
 if(sp.k==='main'){main(L,R);if(spill(R,jPage)){renderJournal();return;}}
 else if(sp.k==='more')morePages(L,R,main,jPage);
 else relPages(L,R,sp);
 // little pixel arrows: flip through this animal's spreads (its main pages, then one per relationship)
 const arrow=(side,to)=>{const a=document.createElement('button');a.type='button';a.className='jarrow '+side;a.setAttribute('aria-label',side==='jprev'?'Back':'Next');a.appendChild(pix(side==='jprev'?'left':'right',3));
  a.addEventListener('click',e=>{e.stopPropagation();jTurn(jPage,to);});(side==='jprev'?L:R).appendChild(a);};
 if(jSub>0)arrow('jprev',jSub-1);if(jSub<subs.length-1)arrow('jnext',jSub+1);
 // inside the back cover: which hand carries the carafe (tap to flip)
 const hand=document.createElement('button');hand.type='button';hand.className='jhand';hand.setAttribute('aria-label',st.leftHand?'Left-handed':'Right-handed');hand.appendChild(pix('hand',3,!!st.leftHand));
 hand.addEventListener('click',e=>{e.stopPropagation();st.leftHand=!st.leftHand;sfx('tick');save();renderJournal();});R.appendChild(hand);
 // Sloth's note, tucked in until you say yes
 if(st.slothJournal&&slothReady()){const n=document.createElement('button');n.type='button';n.className='jslothnote';n.setAttribute('aria-label','A note from Sloth, PhD');n.appendChild(imgPic(ITEM_ART.envelope,46,31));
  n.addEventListener('click',e=>{e.stopPropagation();slothCard();});R.appendChild(n);}
 if(letterInJournal())letterJournalNote(R);}
/* ON A PHONE (Jackie, Nov 10): the print never shrinks below 14px, so a full page (an adult with titles, charms and every quirk) can be
   too tall. Whatever doesn't fit on the right page moves, whole, to a next spread behind the page arrow, under the same name. */
function spill(R,key){let n=0;const kids=()=>[...R.children].filter(c=>c.classList.contains('jgroup')||c.classList.contains('jrow'));
 while(R.scrollHeight>R.clientHeight+1&&kids().length>1){kids().pop().remove();n++;}jEl.more=jEl.more||{};const changed=(jEl.more[key]||0)!==n;jEl.more[key]=n;return changed;}
function withMore(subs,key){return jEl&&jEl.more&&jEl.more[key]>0?[subs[0],{k:'more'}].concat(subs.slice(1)):subs;}
function morePages(L,R,build,key){const tL=document.createElement('div'),tR=document.createElement('div');build(tL,tR);const n=jEl.more[key]||0;
 const items=[...tR.children].filter(c=>c.classList.contains('jgroup')||c.classList.contains('jrow')).slice(-n);if(tL.firstChild)L.appendChild(tL.firstChild); // the name on top
 for(const it of items)L.appendChild(it);while(L.scrollHeight>L.clientHeight+1&&L.children.length>2)R.prepend(L.lastChild);}
function letterJournalNote(R){const n=document.createElement('button');n.type='button';n.className='jslothnote jletternote';n.setAttribute('aria-label','A letter from Sloth, PhD');n.appendChild(imgPic(ITEM_ART.envelope,46,31));n.addEventListener('click',e=>{e.stopPropagation();openLetter(true);});R.appendChild(n);}
function slothCard(){const old=jEl.querySelector('.jslothask');if(old){old.remove();return;}sfx('page');
 const c=jdiv('jslothask tsb tsmint',[],null);c.innerHTML='<div>“'+SLOTH_ASK+'”</div>'+tsChoices(SLOTH_CHOICES);tsPop(c); // Sloth's mint paper
 c.querySelector('[data-k=y]').addEventListener('click',e=>{e.stopPropagation();slothYes();renderJournal();c.remove();});
 c.querySelector('[data-k=n]').addEventListener('click',e=>{e.stopPropagation();c.remove();});jEl.querySelector('.jcover').appendChild(c);}

/* ---------- THE FILES (Jackie, Nov 8; called the Archive in code): the desk drawers hold the journals of monsters who have moved out ----------
   The current journals open from the name tags, bottom left. Tapping the drawers opens this over the room in 3 stepped frames: one
   closed, code-drawn book per monster that has moved out. Tap a book for its journal as a read-only keepsake, frozen as of the
   day it left, with a last page "Out in the world". moveOut() is the one way out of the room, whatever ends up sending a monster off. */
// THE WORDS, in one place to edit: the empty drawer's note (one string per paragraph; the first two go on the left page) and the moving-out caption
const ARCHIVE_NOTE=[
 "This drawer is for the journals of monsters who have grown up and moved out. It's empty for now.",
 "A grown monster might ask to go somewhere special. You can say yes, or ask the monster to stay a while longer.",
 "If two grown monsters make a seed together, they head off to live their own lives and leave the little one in your care.",
 "Sometimes Sloth, PhD sends a letter asking to have one back. That's up to you too.",
 "Wherever they go, their journals rest here. Now and then a postcard finds its way home, and Sloth, PhD sends word of anyone staying over."];
const moveOutCaption=n=>n+(n.endsWith('s')?"'":"'s")+' journal is tucked safely in the desk.';
const ARCH_COVERS=[C.wine,C.vio,C.g1,C.navy],ARCH_PER_PAGE=6; // two rows of three a page; more than a spread gets arrows, never a scrollbar
const ARCH_CALM={nap:0,listen:0,over:0,overType:'',grump:0,float:null,walk:null,mv:null,bonkT:0,tidyT:0,spookT:0,nodT:0,dryLv:0,dryRaw:0,witherLv:0,burnLv:0,puddleLv:0,parch:0,glare:0,lightState:'ok',lightBad:0,needs:{thirst:0,hunger:0,attention:0}}; // a keepsake portrait is a happy one
const ARCH_WORLD=['catTrust','catBond','catSeen','catNaps','catName','leftHand']; // what its relationship pages read from the room
let jKeep=null,jArchSub=0; // the archived monster whose keepsake is open; which spread of books to come back to
const jsonCopy=o=>JSON.parse(JSON.stringify(o));
function plantFields(o){const c={};for(const k of Object.keys(o))if(!GLOBAL.has(k)&&k!=='_pos')c[k]=o[k];return Object.assign(jsonCopy(c),jsonCopy(ARCH_CALM));}
/* moveOut(plant or id, where it went, [copies of monsters who left with it]): saves a frozen copy of its journal in st.archive, takes it out of the room, its name tag and its
   ribbon (those read the live plants), and says so. The cat's page stays live. Returns the archive entry. */
function moveOut(p,dest,also=[]){const id=p&&typeof p==='object'?p.id:p,q=allRaw().find(x=>x.id===id&&x.stage>=0);if(!q)return null;
 const world={};for(const k of ARCH_WORLD)if(st[k]!==undefined)world[k]=st[k];
 const e={id,name:q.name||NAMES[q.species],dest:dest||'',day:st.day,snap:plantFields(q),pals:allRaw().filter(x=>x.id!==id&&x.stage>=0).map(plantFields).concat(also),world:jsonCopy(world)};
 if(READ.has(id))closeStory(true);if(drag.id===id){drag.on=false;drag.down=false;}
 if(st.id!==id)st.others=st.others.filter(x=>x.id!==id);
 else if((st.others||[]).length){swapIn(0);st.others=st.others.filter(x=>x.id!==id);}
 else{for(const k of Object.keys(st))if(!GLOBAL.has(k))delete st[k];const f=fresh();for(const k in f)if(!GLOBAL.has(k))st[k]=f[k];st.id=(st.nextId=(st.nextId||1)+1);} // the last one: an empty room, ready for a new seed
 st.archive=(st.archive||[]).concat(e);ACT=st.id;pickChair();sfx('page');tell(moveOutCaption(firstName(e.snap)||NAMES[e.snap.species]),{kind:'important',key:'moveout'+id});
 if(jEl)renderJournal();save();return e;}
// runs f with the room as it was the day that monster left: read-only and all in one go, so nothing is ever drawn or saved from it
function withKeepsake(e,f){const live=st,t={};for(const k of Object.keys(live))if(GLOBAL.has(k))t[k]=live[k];
 st=Object.assign(t,jsonCopy(e.world),jsonCopy(e.snap),{others:jsonCopy(e.pals),night:false});try{return f();}finally{st=live;}}
function archiveShell(){jEl=document.createElement('div');jEl.className='screen journal archive';jEl.innerHTML='<div class="jbook"><div class="jribs"></div><div class="jcover jstep"><div class="jpage jstep jl"></div><div class="jpage jstep jr"></div></div><button type="button" class="jclose tsb" aria-label="Close">×</button></div>';
 jEl.addEventListener('click',e=>{if(e.target===jEl)archiveBack();});jEl.querySelector('.jclose').addEventListener('click',e=>{e.stopPropagation();archiveBack();});}
function openArchive(){sfx('page');closeJournal();jPage='archive';jSub=0;archiveShell();ui.appendChild(jEl);fitBook();renderArchive();archiveSteps();}
// out of a keepsake goes back to the drawer; out of the drawer closes it
function archiveBack(){if(jPage==='keep'){jKeep=null;jTurn('archive',jArchSub);return;}closeJournal();}
// the drawer opens in 3 stepped frames: the book comes up out of the drawers, no fade
function archiveSteps(){if(tsCalm())return;const el=jEl,b=el.querySelector('.jbook'),k=el.bookK||1,c=cv.getBoundingClientRect(),r=el.getBoundingClientRect(),dx=c.left+(DRAWERS.x+DRAWERS.w/2)*S-(r.left+r.width/2),dy=c.top+(DRAWERS.y+DRAWERS.h/2)*S-(r.top+r.height/2);
 const step=s=>{if(el===jEl)b.style.transform=`translate(calc(-50% + ${Math.round(dx*(1-s))}px),calc(-50% + ${Math.round(dy*(1-s))}px)) scale(${k*s})`;};
 step(.3);setTimeout(()=>step(.65),80);setTimeout(()=>{if(el===jEl)fitBook();},160);}
function jFlip(side,to){const a=document.createElement('button');a.type='button';a.className='jarrow '+side;a.setAttribute('aria-label',side==='jprev'?'Back':'Next');a.appendChild(pix(side==='jprev'?'left':'right',3));
 a.addEventListener('click',e=>{e.stopPropagation();jTurn(jPage,to);});jEl.querySelector(side==='jprev'?'.jl':'.jr').appendChild(a);}
function jClearPages(){const L=jEl.querySelector('.jl'),R=jEl.querySelector('.jr');L.innerHTML='';R.innerHTML='';jEl.querySelector('.jribs').innerHTML='';return [L,R];}
function renderArchive(){const [L,R]=jClearPages(),past=st.archive||[],n=ARCH_PER_PAGE;L.appendChild(jdiv('jname',[],'Files'));
 if(!past.length){ARCHIVE_NOTE.forEach((t,i)=>(i<2?L:R).appendChild(tsKeepName(jdiv('jarchnote',[],t))));R.firstChild.classList.add('jarchtop');
  while(R.scrollHeight>R.clientHeight+1&&R.children.length>1&&L.scrollHeight<=L.clientHeight){const m=R.firstChild;m.classList.remove('jarchtop');L.appendChild(m);R.firstChild.classList.add('jarchtop');if(L.scrollHeight>L.clientHeight+1){R.prepend(m);break;}} // the bigger phone print can need the room: never cut a word off
  return;}
 const last=Math.ceil(past.length/(2*n))-1;if(jSub>last)jSub=last;const shown=past.slice(jSub*2*n,(jSub+1)*2*n);
 L.appendChild(jdiv('jshelf',shown.slice(0,n).map(archiveBook)));if(shown.length>n)R.appendChild(jdiv('jshelf jarchtop',shown.slice(n).map(archiveBook)));
 if(jSub>0)jFlip('jprev',jSub-1);if(jSub<last)jFlip('jnext',jSub+1);}
function archiveBook(e){const b=document.createElement('button');b.type='button';b.className='jarchbook jstep';b.dataset.id=e.id;b.style.background=ARCH_COVERS[(st.archive||[]).indexOf(e)%ARCH_COVERS.length];b.setAttribute('aria-label',e.name+"'s journal");
 b.appendChild(jdiv('jarchlabel',[jdiv('jarchpic',[withKeepsake(e,()=>plantPortrait(e.id,58,58))]),tsNamify(jdiv('jarchname',[],e.name))]));
 b.addEventListener('click',ev=>{ev.stopPropagation();jKeep=e;jArchSub=jSub;jTurn('keep',0);});return b;}
const NUM_ONES=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'],NUM_TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function numWords(n){if(n<20)return NUM_ONES[n];if(n<100)return NUM_TENS[Math.floor(n/10)]+(n%10?'-'+NUM_ONES[n%10]:'');if(n<1000)return NUM_ONES[Math.floor(n/100)]+' hundred'+(n%100?' and '+numWords(n%100):'');return numWords(Math.floor(n/1000))+' thousand'+(n%1000?' '+numWords(n%1000):'');}
function outPages(L,R,e){L.appendChild(jdiv('jname',[],'Out in the world'));if(e.dest)L.appendChild(jdiv('jborn jwent',[],e.dest));L.appendChild(jdiv('jborn',[],'Moved out on day '+numWords(e.day)));
 R.appendChild(jdiv('jgroup',[jlabel('Postcards'),jdiv('jicons',[jdiv('jblank jpostcard')])]));}
function renderKeepsake(){const e=jKeep;if(!e){jPage='archive';renderArchive();return;}const [L,R]=jClearPages();let count=1;
 let again=false;withKeepsake(e,()=>{const key='k'+e.id,subs=withMore(relSpreads('p'+e.id),key);count=subs.length+1;if(jSub>=count)jSub=0;const sp=subs[jSub];
  if(!sp)outPages(L,R,e);else if(sp.k==='main'){plantPages(L,R);again=spill(R,key);}else if(sp.k==='more')morePages(L,R,plantPages,key);else relPages(L,R,sp);});
 if(again){renderKeepsake();return;}
 if(jSub>0)jFlip('jprev',jSub-1);if(jSub<count-1)jFlip('jnext',jSub+1);}

/* ---------- a plant's pages ---------- */
function plantPages(L,R){
 const id=st.id,steps=ageSprites(),at=ageStep();
 L.appendChild(nameTag(id)); // its name on top (tap to name it, even as a seed); the species small underneath
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
   if(jKeep)b.disabled=true;else b.addEventListener('click',e=>{e.stopPropagation();st.wear=wornCharm()===t?'none':t;sfx('pop');save();renderJournal();});return b;}));
  R.appendChild(jdiv('jgroup',[jlabel('Charms'),row]));}
 const seen=st.quirks||{};
 R.appendChild(jdiv('jgroup',[jlabel('Quirks'),jdiv('jstamps jquirks',Object.keys(QUIRK_SHORT).map(k=>seen[k]?jdiv('jstamp',[],QUIRK_SHORT[k]):jdiv('jstamp jfaint',[],'not seen yet')))]));}

// tap the name to type a new one (16 letters at most); cleared = it keeps its old name
function nameTag(id){if(jKeep)return tsNamify(jdiv('jname',[],st.name||NAMES[st.species])); // a keepsake is read-only
 const b=document.createElement('button');b.type='button';b.className='jname jrename';b.textContent=st.name||NAMES[st.species];b.setAttribute('aria-label',st.name?'Rename '+st.name:'Name it'); // no name yet (a seed or sprout): it shows the species, and a tap names it
 b.addEventListener('click',e=>{e.stopPropagation();const old=st.name,inp=document.createElement('input');inp.className='jname jnameinput';inp.maxLength=16;inp.value=old||'';inp.setAttribute('aria-label','Name');
  let done=false;const finish=()=>{if(done)return;done=true;const v=inp.value.replace(/\s+/g,' ').trim().slice(0,16);
   withPlant(id,()=>{if(v)st.name=v;else if(old)tell('Back to '+old+'.',{kind:'info'});});sfx('tick');save();renderJournal();};
  inp.addEventListener('keydown',ev=>{ev.stopPropagation();if(ev.key==='Enter')finish();if(ev.key==='Escape'){inp.value=old;finish();}});
  inp.addEventListener('blur',finish);inp.addEventListener('click',ev=>ev.stopPropagation());b.replaceWith(inp);inp.focus();inp.select();});
 return tsNamify(b);}

function catNameTag(){const b=document.createElement('button');b.type='button';b.className='jname jrename';b.textContent=catName();b.setAttribute('aria-label','Rename '+catName());
 b.addEventListener('click',e=>{e.stopPropagation();const old=catName(),inp=document.createElement('input');inp.className='jname jnameinput';inp.maxLength=16;inp.value=old;inp.setAttribute('aria-label','Name');
  let done=false;const finish=()=>{if(done)return;done=true;const v=inp.value.replace(/\s+/g,' ').trim().slice(0,16);if(v)st.catName=v;else tell('Back to '+old+'.',{kind:'info'});sfx('tick');save();renderJournal();};
  inp.addEventListener('keydown',ev=>{ev.stopPropagation();if(ev.key==='Enter')finish();if(ev.key==='Escape'){inp.value=old;finish();}});
  inp.addEventListener('blur',finish);inp.addEventListener('click',ev=>ev.stopPropagation());b.replaceWith(inp);inp.focus();inp.select();});
 return tsNamify(b);}

/* ---------- the cat's pages ---------- */
function catPages(L,R){
 const tr=catTrust(),paws=1+[TRUST_SHY,TRUST_FOND,TRUST_BFF].filter(t=>tr>=t).length;
 L.appendChild(catNameTag()); // his name (tap to rename)
 const f=CATF.loaf1&&ok(CATF.loaf1)?CATF.loaf1:CATF.sit1;
 L.appendChild(jdiv('jportrait',[imgPic(f,220,170)]));
 L.appendChild(jdiv('jpaws',[pix('hand',4,!!st.leftHand)].concat(Array.from({length:paws},()=>pix('paw',5))))); // you: how much he trusts you
 const pals=allRaw().filter(q=>q.stage>=0).map(q=>({q,m:catMark(q.id)})).filter(o=>o.m); // each monster: a heart if he naps by it, a squiggle if it spooks him
 if(pals.length)R.appendChild(jdiv('jgroup',[jlabel('Friends'),jdiv('jicons',pals.flatMap(o=>[jdiv('jpal',[plantPortrait(o.q.id,44,48)]),pix(o.m,4)]))]));
 const naps=Object.entries(st.catNaps||{}).filter(([k,n])=>n>0&&NAP_SPOTS.includes(k)).sort((a,b)=>b[1]-a[1]).slice(0,3);
 if(naps.length)R.appendChild(jdiv('jgroup',[jlabel('Favorite naps'),jdiv('jicons',naps.map(([k])=>pix(k,5)))]));
 const seen=st.catSeen||{};
 R.appendChild(jdiv('jgroup',[jlabel('Quirks'),jdiv('jstamps jquirks',Object.keys(CAT_QUIRKS).map(k=>seen[k]?jdiv('jstamp',[],CAT_QUIRKS[k]):jdiv('jstamp jfaint',[],'not seen yet')))]));}

/* ---------- RELATIONSHIPS (Jackie, Nov 7): each one gets its own spread ----------
   A monster: it & you, it & the other monster, it & the cat.  The cat: the cat & you, the cat & each monster.
   Left page: the two of them side by side (a heart, a squiggle or a little hand between) and a fun detail or two.
   Right page: milestones as stamps that fill in when they happen (faint until then). No numbers. */
function relSpreads(page){if(page==='world')return [{k:'main'}];const P=allRaw().filter(q=>q.stage>=0);
 if(page==='cat')return [{k:'main'},{k:'catyou'}].concat(P.map(q=>({k:'catpl',q:q.id})));
 const id=+page.slice(1);return [{k:'main'},{k:'you',q:id}].concat(P.filter(o=>o.id!==id).map(o=>({k:'pair',q:id,o:o.id}))).concat([{k:'cat',q:id}]);}
const raw=id=>allRaw().find(q=>q.id===id);
const msOf=(q,k)=>!!(q&&q.ms&&q.ms[k]);
const readMost=q=>{const c=q.cnt||{};let best=null,bn=0;for(const b of BOOKS){const n=c['read_'+b.id]||0;if(n>bn){bn=n;best=b.id;}}return best;};
function relMilestones(sp){const q=raw(sp.q),o=raw(sp.o),cb=q?((st.catBond||{})[q.id]||{}):{},cs=st.catSeen||{},tr=catTrust(),c=(q&&q.cnt)||{};
 if(sp.k==='you')return [['First hello',q.stage>=4],['First pet',(c.pets||0)>0],['First treat',(c.treats||0)>0],['First story',!!readMost(q)],['A favorite treat',!!q.fav],['Right on time',msOf(q,'routine')],['A title',(q.titles||[]).length>0],['All grown up',q.stage>=8]];
 if(sp.k==='pair')return [['Met',q.stage>=4&&o.stage>=4],['First bicker',msOf(q,'bicker:'+o.id)],['Made up',msOf(q,'madeup:'+o.id)],['Cheered up',msOf(q,'share:'+o.id)||msOf(o,'share:'+q.id)],['Friends',rel(q,o)==='friends'||msOf(q,'friends:'+o.id)]];
 if(sp.k==='cat'||sp.k==='catpl')return [['First sniff hello',(cb.bond||0)+(cb.hmph||0)>0||!!(q.quirks||{}).catfriend],['Napped nearby',(cb.bond||0)>0],['Cat buddy',!!(q.quirks||{}).catfriend],['Spooky face',(cb.hmph||0)>0]];
 return [['First sniff',!!cs.sniff],['First purr',!!cs.purr],['Lets you pet',tr>=TRUST_SHY],['Naps by your monster',tr>=TRUST_FOND],['Adores you',tr>=TRUST_BFF]];}
function catPic(w,h){const f=CATF.loaf1&&ok(CATF.loaf1)?CATF.loaf1:CATF.sit1;return imgPic(f,w,h);}
function relPages(L,R,sp){const q=raw(sp.q),o=raw(sp.o),cb=q?((st.catBond||{})[q.id]||{}):{},paws=1+[TRUST_SHY,TRUST_FOND,TRUST_BFF].filter(t=>catTrust()>=t).length;
 const nm=x=>firstName(x)||NAMES[x.species],you=()=>jdiv('jyou',[pix('hand',6,!!st.leftHand)]);
 let title,a,b,mark,details=[];
 if(sp.k==='you'){title=nm(q)+' & you';a=plantPortrait(q.id,118,130);b=you();mark=pix('heart',5);
  if(q.fav)details.push(jdiv('jgroup',[jlabel('Favorite treat'),jdiv('jicons',[imgPic(TREAT_IMG[q.fav],40,40)])]));
  const rb=readMost(q);if(rb)details.push(jdiv('jgroup',[jlabel('Favorite story'),jdiv('jicons',[bookPix(rb,4)])]));}
 else if(sp.k==='pair'){const r=rel(q,o);title=nm(q)+' & '+nm(o);a=plantPortrait(q.id,118,130);b=plantPortrait(o.id,118,130);mark=r==='friends'?pix('heart',5):r==='bicker'?pix('squiggle',5):null;
  details.push(jdiv('jdetail',[],r==='friends'?'Best friends':r==='bicker'?'Bicker, then make up':'Getting to know each other'));}
 else if(sp.k==='cat'||sp.k==='catpl'){const m=catMark(q.id);title=sp.k==='cat'?nm(q)+' & '+catName():catName()+' & '+nm(q);a=sp.k==='cat'?plantPortrait(q.id,118,130):catPic(118,92);b=sp.k==='cat'?catPic(118,92):plantPortrait(q.id,118,130);mark=m?pix(m,5):null;
  details.push(jdiv('jdetail',[],m==='heart'?'Naps close by':m==='squiggle'?'Keeps an eye on each other':'Still sniffing around'));}
 else{title=catName()+' & you';a=catPic(118,92);b=you();mark=pix('heart',5);
  details.push(jdiv('jdetail',[],['Still shy','Lets you pet','Fond of you','Adores you'][paws-1]));details.push(jdiv('jpaws',Array.from({length:paws},()=>pix('paw',4))));
  const nap=Object.entries(st.catNaps||{}).filter(([k,n])=>n>0&&NAP_SPOTS.includes(k)).sort((x,y)=>y[1]-x[1])[0];if(nap)details.push(jdiv('jgroup',[jlabel('Favorite nap'),jdiv('jicons',[pix(nap[0],5)])]));}
 L.appendChild(tsNamify(jdiv('jname',[],title)));
 L.appendChild(jdiv('jpair',[jdiv('jpairpic',[a]),mark?jdiv('jpairmark',[mark]):jdiv('jpairmark'),jdiv('jpairpic',[b])]));
 L.appendChild(jdiv('jdetails',details)); // the fun details, side by side
 R.appendChild(jdiv('jgroup',[jlabel('Milestones'),jdiv('jstamps jmiles',relMilestones(sp).map(([t,done])=>done?jdiv('jstamp',[],t):jdiv('jstamp jfaint',[],t)))]));}

/* ---------- out in the world (hidden until it has something) ---------- */
function worldPages(L,R){L.appendChild(jdiv('jname',[],'Out in the world'));for(const it of worldItems())R.appendChild(jdiv('jgroup',[jlabel(it.label||'')]));}

/* FILES SIGN (Jackie, Nov 8; replaces the Nov 4 JOURNAL plate, which was too small to notice; the word was ARCHIVE until Nov 10,
   now FILES so the letters can be bigger): a sign in the SNACKS sign's shape (clipped corners) in the text style's brass
   (brass face, dark brass letters, toffee rim, cocoa outline; Nov 10) set over the top drawer's knob. Drawn in code from the room palette on whole pixels (2 room units each); the five
   letters are 8 pixels tall with 2-pixel stems, as big as the plate allows with the plate filling most of the drawer face. It never
   glows, blinks or bounces; it moves only with the drawers' idle wiggle. Lit like the wood around it: the drawer's color in the
   current room picture (time of day, lamps, curtains) against the daytime picture shades it, so it darkens at night and warms
   under the desk lamp. Tapping it is tapping the drawers: the files open. */
const PLACARD={x:1089,y:569,u:2}; // top-left of the sign and its pixel size: centered on the top drawer (face x 1084-1170, y 566-600), over its knob; its light is read from the plain bottom panel at 1097,704
const PFONT={F:['######','##....','##....','#####.','##....','##....','##....','##....'],I:['####','.##.','.##.','.##.','.##.','.##.','.##.','####'],
 L:['##....','##....','##....','##....','##....','##....','##....','######'],E:['######','##....','##....','#####.','##....','##....','##....','######'],
 S:['.#####','##....','##....','.####.','....##','....##','....##','#####.']};
const PLATE=(()=>{const t='FILES',tw=[...t].reduce((n,ch)=>n+PFONT[ch][0].length+1,-1),w=tw+6,h=PFONT[t[0]].length+6,rows=[];
  const ink=new Set();let cx=3;for(const ch of t){PFONT[ch].forEach((r,j)=>[...r].forEach((v,i)=>{if(v==='#')ink.add((cx+i)+','+(3+j));}));cx+=PFONT[ch][0].length+1;}
  for(let j=0;j<h;j++){let r='';for(let i=0;i<w;i++){const dx=Math.min(i,w-1-i),dy=Math.min(j,h-1-j),d=dx+dy;
    r+=d<2?'.':(d===2||dx===0||dy===0)?'o':(d===3||dx===1||dy===1)?'h':ink.has(i+','+j)?'t':'b';}rows.push(r);}return rows;})();
const PCOL={o:TS.ink,h:TS.toffee,b:TS.brass,t:TS.brassInk}; // the text style's brass plate (Jackie, Nov 10): cocoa outline, toffee rim, brass face, dark brass letters
let placardCv=null,placardKey='',placardRef=null;
function panelAvg(src,sx,sy){const c=document.createElement('canvas');c.width=60;c.height=12;const x=c.getContext('2d');x.drawImage(src,sx,sy,60,12,0,0,60,12);const d=x.getImageData(0,0,60,12).data;let r=0,gg=0,b=0;for(let i=0;i<d.length;i+=4){r+=d[i];gg+=d[i+1];b+=d[i+2];}const n=d.length/4;return [r/n,gg/n,b/n];}
function drawPlacard(key){if(!ok(ROOMS.day))return;
 if(key!==placardKey){placardKey=key;placardRef=placardRef||panelAvg(ROOMS.day,1097,704);const cur=panelAvg(cv,1097,704);
  const f=[0,1,2].map(i=>clamp(cur[i]/Math.max(1,placardRef[i]),0,1)),u=PLACARD.u,c=document.createElement('canvas');c.width=PLATE[0].length*u;c.height=PLATE.length*u;const x=c.getContext('2d');
  PLATE.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='.')return;x.fillStyle=PCOL[ch];x.fillRect(i*u,j*u,u,u);}));
  x.globalCompositeOperation='multiply';x.fillStyle=`rgb(${Math.round(f[0]*255)},${Math.round(f[1]*255)},${Math.round(f[2]*255)})`;x.fillRect(0,0,c.width,c.height); // lit like the panel
  x.globalCompositeOperation='source-over';PLATE.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='.')x.clearRect(i*u,j*u,u,u);}));placardCv=c;} // the rounded corners stay see-through
 const io=idleOn&&idleOn.it.n==='desk drawers (journal)'?idleOffset(performance.now()):0; // moves with the drawers' idle wiggle, nothing else
 g.drawImage(placardCv,PLACARD.x+io,PLACARD.y);}

function logEv(t){st.log=(st.log||[]).concat(t).slice(-6);}
function met(n){st.met[n]=1;st.hint[n]=(st.hint[n]||0)+1;nudgeSun();}
