'use strict';
/* Core: canvas + screen fitting, image loading, errors, palette, helpers, captions/bubbles, effects, shared frame state, full screen. */
const W=1670,H=942; // book room v2 (Jackie's curated room)
const cv=document.getElementById('c'),g=cv.getContext('2d');g.imageSmoothingEnabled=false;
const wrap=document.getElementById('wrap'),ui=document.getElementById('ui');
let S=1;
function fit(){const vw=document.documentElement.clientWidth||innerWidth,vh=document.documentElement.clientHeight||innerHeight;S=Math.min(vw/W,vh/H);cv.style.width=W*S+'px';cv.style.height=H*S+'px';wrap.style.width=W*S+'px';wrap.style.height=H*S+'px';}
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
function sleepZ(id,x,y,sc){if(zzNow&&T-zzNow.t0>ZZ_LIFE)zzNow=null;
 if(zzNext[id]==null||zzNext[id]<T-30)zzNext[id]=T+rnd(4,12); // just fell asleep: the first one comes after a little while
 if(!zzNow&&T>=zzNext[id]){zzNow={id,t0:T};zzNext[id]=T+rnd(12,20);}
 else if(zzNow&&zzNow.id!==id&&T>=zzNext[id])zzNext[id]=T+rnd(2,5); // someone else's Zzz is up: wait a bit, never two at once
 if(!zzNow||zzNow.id!==id)return;const f=FX.zzz[1];if(!ok(f))return;const u=(T-zzNow.t0)/ZZ_LIFE;
 const w=Math.round(f.naturalWidth*sc),h=Math.round(f.naturalHeight*sc),a=u<.15?u/.15:u<.5?1:.5+.5*Math.cos((u-.5)/.5*Math.PI); // fades in, holds, then fades out gently
 g.save();g.globalAlpha=Math.max(0,a);g.drawImage(f,Math.round(x-w/2),Math.round(y-h/2-u*ZZ_RISE),w,h);g.restore();} // whole-pixel drift up
function fx(n,x,y,rate=3,ph=0,sc=FX_SCALE){const f=FX[n][(Math.floor(T*rate+ph))%2];if(!ok(f))return;const w=Math.round(f.naturalWidth*sc),h=Math.round(f.naturalHeight*sc);g.drawImage(f,Math.round(x-w/2),Math.round(y-h/2),w,h);}
/* ---------- palette ---------- */
const C={out:'#341839',wine:'#833343',plum:'#490d40',brick:'#b8594d',rust:'#d37259',coral:'#eb905d',peach:'#f5ab6b',sand:'#fbbe7b',cream:'#fcd6a5',ivory:'#fdebc9',lav:'#8d8bb5',vio:'#6c61a4',navy:'#1f3f8f',g1:'#4f7a16',g2:'#70a71c',g3:'#b8d725',g4:'#f2ec6a',fl1:'#d33d3b',fl2:'#f88c26',fl3:'#fcc93f',blue:'#3c9ab4'};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const rnd=(a,b)=>a+Math.random()*(b-a);
const P=6; // comic-mark pixel size
/* ---------- ui helpers ---------- */
const cap=document.getElementById('caption');let capT=0;
let capLock=0;function say(t,sec=5,lock){const now=performance.now();if(now<capLock&&!lock){setTimeout(()=>say(t,sec),capLock-now+200);return;}if(lock)capLock=now+sec*1000;cap.textContent=t;cap.style.opacity=1;capT=sec;}
let bubble=null;
function closeBubble(){if(bubble){bubble.remove();bubble=null;}}
function openBubble(x,y,html,binds){closeBubble();const b=document.createElement('div');b.className='bubble';b.innerHTML=html;b.style.left=(x*S)+'px';b.style.top=(y*S)+'px';ui.appendChild(b);bubble=b;
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
function fsNo(){say(IPHONE?'iPhone doesn\'t let web pages go full screen. For full screen: open the game in Safari, tap Share, then Add to Home Screen, and play from that icon.':'This browser won\'t let the game go full screen here.',9,true);}
document.addEventListener('fullscreenchange',()=>setTimeout(fit,100));document.addEventListener('webkitfullscreenchange',()=>setTimeout(fit,100));
