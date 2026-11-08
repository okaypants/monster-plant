'use strict';
/* Core: canvas + screen fitting, image loading, errors, palette, helpers, captions/bubbles, effects, shared frame state, full screen. */
const W=1670,H=942; // book room v2 (Jackie's curated room)
const cv=document.getElementById('c'),g=cv.getContext('2d');g.imageSmoothingEnabled=false;
const wrap=document.getElementById('wrap'),ui=document.getElementById('ui');
let S=1,FIT_RIGHT=0; // FIT_RIGHT: screen width the debug drawer takes on the right; the room fits beside it instead of under it
function fit(){const vw=(document.documentElement.clientWidth||innerWidth)-FIT_RIGHT,vh=document.documentElement.clientHeight||innerHeight;S=Math.min(vw/W,vh/H);wrap.style.setProperty('--S',S);wrap.style.setProperty('--u',Math.max(3,Math.round(5*S))+'px');/* --u: one outline 'pixel' of the caption bubble */cv.style.width=W*S+'px';cv.style.height=H*S+'px';wrap.style.width=W*S+'px';wrap.style.height=H*S+'px';wrap.style.left=vw/2+'px';}
addEventListener('resize',fit);addEventListener('orientationchange',()=>setTimeout(fit,300));addEventListener('load',fit);setInterval(fit,1000);fit(); // keep the whole room on screen on iPad/phones
function img(src){const i=new Image();i.onerror=()=>showErr('could not load '+src);i.src=src;return i;}
const ok=i=>i&&i.complete&&i.naturalWidth>0;
// REAL BOTTOM (Nov 3): empty rows under a picture's lowest solid pixel (the pot's bottom, the cat's paws), measured once per picture.
// Plants and the cat are placed so that pixel sits exactly on the spot's surface line, not the picture's edge.
const padCache=new Map();
function bottomPad(im){if(!ok(im))return 0;let p=padCache.get(im.src);if(p!=null)return p;const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d');x.drawImage(im,0,0);
 let d;try{d=x.getImageData(0,0,c.width,c.height).data;}catch(e){return 0;}p=0;rows:for(let y=c.height-1;y>=0;y--){for(let i=y*c.width*4+3;i<(y+1)*c.width*4;i+=4)if(d[i]>40)break rows;p++;}padCache.set(im.src,p);return p;}
const padPx=(im,h)=>Math.round(bottomPad(im)*h/im.naturalHeight); // those empty rows at the size it's drawn
let errShown=0;function showErr(t){if(errShown>4)return;errShown++;let d=document.getElementById('errbox');if(!d){d=document.createElement('div');d.id='errbox';d.style.cssText='position:fixed;left:8px;bottom:8px;max-width:70vw;background:#341839;color:#fdebc9;font:12px monospace;padding:6px 8px;z-index:99;white-space:pre-wrap;opacity:.9';document.body.appendChild(d);}d.textContent+=(d.textContent?'\n':'')+t;}
addEventListener('error',e=>{if(!e.filename&&!e.lineno)return; // "Script error." with no file = someone else's script (a browser extension or the app showing the page), not the game
 showErr('error: '+e.message+' (line '+e.lineno+')');});
const FX={};for(const n of['flames','zzz','rumble','dust','thought','puddle','drops','hearts','sparkles','sweat'])FX[n]=[img('fx_'+n+'_1.png'),img('fx_'+n+'_2.png')];
const FX_SCALE=.7; // all reactions a little smaller (Jackie)
// ZZZ (Jackie, calm-down): one single Zzz drifts slowly up from a sleeper every 12-20 s and fades out gently. Never two at once in the room.
// Each sleeper calls sleepZ(id,x,y,sc) every frame it's asleep, with the spot the Zzz starts from.
const ZZ_LIFE=4.5,ZZ_RISE=40;let zzNow=null;const zzNext={};
function sleepZ(id,x,y,sc){if(FX_OFF.has('zzz'))return;if(zzNow&&T-zzNow.t0>ZZ_LIFE)zzNow=null;
 if(zzNext[id]==null||zzNext[id]<T-30)zzNext[id]=T+rnd(4,12); // just fell asleep: the first one comes after a little while
 if(!zzNow&&T>=zzNext[id]){zzNow={id,t0:T};zzNext[id]=T+rnd(12,20);}
 else if(zzNow&&zzNow.id!==id&&T>=zzNext[id])zzNext[id]=T+rnd(2,5); // someone else's Zzz is up: wait a bit, never two at once
 if(!zzNow||zzNow.id!==id)return;const f=FX.zzz[1];if(!ok(f))return;const u=(T-zzNow.t0)/ZZ_LIFE;
 const w=Math.round(f.naturalWidth*sc),h=Math.round(f.naturalHeight*sc),a=u<.15?u/.15:u<.5?1:.5+.5*Math.cos((u-.5)/.5*Math.PI); // fades in, holds, then fades out gently
 g.save();g.globalAlpha=Math.max(0,a);g.drawImage(f,Math.round(x-w/2),Math.round(y-h/2-u*ZZ_RISE),w,h);g.restore();} // whole-pixel drift up
// debug (test mode only): effects switched off, and paused time
const FX_OFF=new Set();let PAUSED=false;function gameSpeed(){return PAUSED?0:st.speed;}
function fx(n,x,y,rate=3,ph=0,sc=FX_SCALE){if(FX_OFF.has(n))return;const f=FX[n][(Math.floor(T*rate+ph))%2];if(!ok(f))return;const w=Math.round(f.naturalWidth*sc),h=Math.round(f.naturalHeight*sc);g.drawImage(f,Math.round(x-w/2),Math.round(y-h/2),w,h);}
/* ---------- palette ---------- */
const C={out:'#341839',wine:'#833343',plum:'#490d40',brick:'#b8594d',rust:'#d37259',coral:'#eb905d',peach:'#f5ab6b',sand:'#fbbe7b',cream:'#fcd6a5',ivory:'#fdebc9',lav:'#8d8bb5',vio:'#6c61a4',navy:'#1f3f8f',g1:'#4f7a16',g2:'#70a71c',g3:'#b8d725',g4:'#f2ec6a',fl1:'#d33d3b',fl2:'#f88c26',fl3:'#fcc93f',blue:'#3c9ab4'};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const rnd=(a,b)=>a+Math.random()*(b-a);
const P=6; // comic-mark pixel size
/* ---------- ui helpers ---------- */
/* ---------- CAPTIONS (Jackie): a cream rounded pill at the top centre ----------
   tell(text,{kind,key,who}):
     important : always shows (welcome back, a new seed, a new age, a bloom, a title...); bumps a chatty line that's up
     teach     : a teaching tip, shown ONCE EVER (remembered in the save under st.taught[key])
     info      : a reply to something you just did
     ambient   : chatter (voice lines, quirks, friends and bickering): at most one every 45-90 s, never while you're busy
   Nothing but important lines repeats within 10 minutes (by its text, or by key: one event, however it's worded). who = a plant id or 'cat': the bubble gets a little tail pointing at them.
   Shows 2 s + 0.3 s a word: short lines 3-5 s, the longest 6-8 s (never more); fades in and out. */
const cap=document.getElementById('caption'),capText=cap.querySelector('.ct'),capTail=cap.querySelector('.tail');
const CAP_REPEAT=10*60*1000,CAP={q:[],cur:null,until:0,nextAt:0,lastAmb:-1e9,ambGap:45+Math.random()*45,seen:new Map(),log:[]};
function capBusy(){return !!document.querySelector('.story')||!!(typeof held!=='undefined'&&held.tool)||!!(typeof drag!=='undefined'&&(drag.on||drag.down))||!!bubble||!!document.querySelector('.screen')||(typeof pointerHeld!=='undefined'&&pointerHeld)||!!(typeof feed!=='undefined'&&feed.item);} // carrying, dragging, holding a tap, or reading (treat jar, books, journal)
function capRecent(t){const at=CAP.seen.get(t);return at!=null&&performance.now()-at<CAP_REPEAT;}
function tell(t,o={}){if(!t)return false;const kind=o.kind||'info',now=performance.now();
 if(kind==='teach'){const k=o.key||t;st.taught=st.taught||{};if(st.taught[k])return false;st.taught[k]=1;}
 const rk=kind==='teach'?t:(o.key||t);if(kind!=='important'&&(capRecent(rk)||capRecent(t)))return false;
 if(CAP.q.some(i=>i.t===t)||(CAP.cur&&CAP.cur.t===t))return false;
 if(kind==='ambient'){if(!ambientOK())return false;CAP.lastAmb=now;CAP.ambGap=rnd(45,90);}
 const item={t,rk,kind,who:o.who??null,dur:clamp(2+t.trim().split(/\s+/).length*.3,3,8)};
 if(kind==='important'){const i=CAP.q.findIndex(x=>x.kind!=='important');CAP.q.splice(i<0?CAP.q.length:i,0,item);if(CAP.cur&&CAP.cur.kind==='ambient')CAP.until=now;} // jumps the queue; a chatty line steps aside
 else{CAP.q=CAP.q.filter(x=>x.kind!=='ambient');CAP.q.push(item);if(CAP.q.length>4)CAP.q.splice(CAP.q.findIndex(x=>x.kind!=='important'),1);}
 return true;}
function ambientOK(){return !capBusy()&&!CAP.cur&&!CAP.q.length&&performance.now()-CAP.lastAmb>=CAP.ambGap*1000;}
function say(t,sec,lock){return tell(t,{kind:lock?'important':'info'});} // older calls; new ones say what kind of line they are
function quiet(){return !CAP.cur&&!CAP.q.length;}
function capClear(){CAP.q=[];CAP.cur=null;cap.classList.remove('show');capText.textContent='';}
function capTick(){const now=performance.now();
 if(CAP.cur&&now>=CAP.until){CAP.cur=null;cap.classList.remove('show');CAP.nextAt=now+450;}
 if(!CAP.cur&&CAP.q.length&&now>=CAP.nextAt){const it=CAP.q.shift();CAP.cur=it;CAP.until=now+it.dur*1000;CAP.seen.set(it.t,now);CAP.seen.set(it.rk,now);CAP.log.push({t:it.t,kind:it.kind,at:now});if(CAP.log.length>200)CAP.log.shift();
  capText.textContent=it.t;cap.classList.toggle('talk',it.who!=null);cap.classList.add('show');capPlace(true);}
 if(CAP.cur)capPlace(false);}
// where it sits: top centre, unless that would cover a plant's face; the tail points at whoever is talking
function capSpeakerX(w){try{if(w==='cat'){const b=catBox();return b?b.x+b.w/2:null;}let x=null;withPlant(w,()=>{if(st.stage>=0){const b=plantBox();x=b.x+b.w/2;}});return x;}catch(e){return null;}}
function capFaces(){const F=[];try{eachPlant(()=>{if(st.stage<0)return;const b=plantBox();F.push({x0:b.x+b.w*.2,x1:b.x+b.w*.8,y0:b.y+b.h*.2,y1:b.y+b.h*.65});});}catch(e){}return F;}
let capPlaceT=0;
function capRight(){const fb=document.getElementById('fsBtn'),r=fb&&fb.getBoundingClientRect(),c=cv.getBoundingClientRect();return r&&r.width?(r.left-c.left)/S-12:W-8;} // keep clear of the buttons at the top right
function capPlace(force){const now=performance.now(),R=capRight();if(force)cap.style.maxWidth=Math.round(Math.min(W*.6,R-24)*S)+'px';const bw=cap.offsetWidth/S,bh=cap.offsetHeight/S;if(!bw)return;const top=Math.round(H*.03);
 if(force||now-capPlaceT>=400){capPlaceT=now;const F=capFaces();let best=Math.min(W/2,R-bw/2); // top centre, or the nearest place along the top that leaves every plant's face clear
  for(const c of[W/2,W*.36,W*.64,W*.25,W*.75]){const x0=c-bw/2,x1=c+bw/2;if(x0<8||x1>R)continue;if(!F.some(f=>f.x1>x0&&f.x0<x1&&f.y0<top+bh+20)){best=c;break;}}cap.dataset.cx=best;}
 const cx=+cap.dataset.cx||W/2;cap.style.left=Math.round((cx-bw/2)*S)+'px';cap.style.top=Math.round(top*S)+'px';
 if(CAP.cur&&CAP.cur.who!=null){const sx=capSpeakerX(CAP.cur.who);if(sx==null){capTail.style.display='none';return;}capTail.style.display='';const u=parseFloat(getComputedStyle(wrap).getPropertyValue('--u'))||3;
  capTail.style.left=Math.round(clamp((sx-(cx-bw/2))*S-3*u,3*u,bw*S-9*u))+'px';}}
let bubble=null;
function closeBubble(){if(bubble){bubble.remove();bubble=null;}}
function openBubble(x,y,html,binds){closeBubble();const b=document.createElement('div');b.className='bubble';b.innerHTML=html;b.style.left=(x*S)+'px';b.style.top=(y*S)+'px';ui.appendChild(b);bubble=b;b.style.left=clamp(x*S,4,Math.max(4,W*S-b.offsetWidth-4))+'px';b.style.top=clamp(y*S,4,Math.max(4,H*S-b.offsetHeight-4))+'px'; /* kept inside the room */
 const r=b.getBoundingClientRect(),wr=wrap.getBoundingClientRect();if(r.right>wr.right)b.style.left=(wr.width-r.width-6)+'px';if(r.bottom>wr.bottom)b.style.top=(wr.height-r.height-6)+'px';if(r.left<wr.left)b.style.left='6px';if(r.top<wr.top)b.style.top='6px';
 b.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',ev=>{ev.stopPropagation();binds[btn.dataset.k]&&binds[btn.dataset.k]();}));const f=b.querySelector('button');f&&f.focus();}
function screen(html,binds){const d=document.createElement('div');d.className='screen';d.innerHTML=html;ui.appendChild(d);d.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{binds[b.dataset.k](d);}));const f=d.querySelector('button');f&&f.focus();return d;}
/* ---------- comic marks ---------- */
function blocks(map,x,y,c,p=P){x=Math.round(x);y=Math.round(y);g.fillStyle=C.out;map.forEach((r,j)=>[...r].forEach((v,i)=>{if(v==='1')g.fillRect(x+i*p-2,y+j*p-2,p+4,p+4);}));g.fillStyle=c;map.forEach((r,j)=>[...r].forEach((v,i)=>{if(v==='1')g.fillRect(x+i*p,y+j*p,p,p);}));}
const GL={z:['1111','0010','0100','1111'],star:['10101','01110','11111','01110','10101']};
function flame(x,y,t){const f=Math.sin(t*20+x)>0?P:0;g.fillStyle=C.out;g.fillRect(x-P*1.5-2,y-P*4-f-2,P*3+4,P*5+f+4);g.fillStyle=C.fl1;g.fillRect(x-P*1.5,y-P*2,P*3,P*2);g.fillStyle=C.fl2;g.fillRect(x-P,y-P*3-f,P*2,P*2);g.fillStyle=C.fl3;g.fillRect(x-P/2,y-P*4-f,P,P*1.5);}
function heart(x,y){blocks(['1101','1111','0110'],x,y,C.fl1,4);}
let last=performance.now(),T=0,blink=0;const parts=[];const held={tool:null,item:null};let mx=-99,my=-99; // no hints on objects (RULES.md 10): needs show only on the plant
function burst(k,x,y,n,c){for(let i=0;i<n;i++)parts.push({k,x:x+rnd(-30,30),y:y+rnd(-20,20),vx:rnd(-40,40),vy:k==='heart'?rnd(-110,-60):rnd(-50,50),g:k==='heart'?0:k==='drop'?700:300,t:k==='heart'?1.1:.7,c});}
// FULL SCREEN (Jackie): works where the browser allows it (desktop, Android, iPad). iPhones don't let a web page go full screen inside the viewer.
document.getElementById('fsBtn').addEventListener('click',e=>{e.stopPropagation();const d=document,el=d.documentElement;
 const on=d.fullscreenElement||d.webkitFullscreenElement;
 try{if(on){(d.exitFullscreen||d.webkitExitFullscreen).call(d);return;}
  const req=el.requestFullscreen||el.webkitRequestFullscreen;if(!req)throw 0;const r=req.call(el,{navigationUI:'hide'});if(r&&r.catch)r.catch(()=>fsNo());}catch(err){fsNo();}
 setTimeout(fit,300);});
const IPHONE=/iPhone|iPod/.test(navigator.userAgent),HOMESCREEN=navigator.standalone||matchMedia('(display-mode: standalone)').matches;
if(HOMESCREEN)document.getElementById('fsBtn').style.display='none'; // opened from the Home Screen icon: already full screen
function fsNo(){tell(IPHONE?'iPhone doesn\'t let web pages go full screen. For full screen: open the game in Safari, tap Share, then Add to Home Screen, and play from that icon.':'This browser won\'t let the game go full screen here.',{kind:'important'});}
document.addEventListener('fullscreenchange',()=>setTimeout(fit,100));document.addEventListener('webkitfullscreenchange',()=>setTimeout(fit,100));
