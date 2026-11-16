'use strict';
/* Audio: real recorded sounds (REC, in sounds/) and the old synth sounds (sfx, all muted). Sound slots for Garry are fplay() in fidgets.js. */
/* ---------- audio ----------
   Soft on purpose (Jackie, Nov 16: a lot of the sounds were abrasive). Everything goes through one quiet bus with a gentle
   low-pass, so nothing is sharp or hissy: sine and triangle tones only (no sawtooth or square buzz), noise only low or
   mid (no high hiss), and no attack faster than 8 ms (no clicks). The tap 'tick' is a tiny soft knock. */
let AC=null,NB=null,BUS=null;
const SFX_VOL=.6,SFX_TOP=2600; // the bus: overall loudness, and the brightest any sound gets (Hz)
function audioInit(){try{AC=new (window.AudioContext||window.webkitAudioContext)();NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=SFX_TOP;lp.Q.value=.5;BUS=AC.createGain();BUS.gain.value=SFX_VOL;BUS.connect(lp).connect(AC.destination);recLoad();}catch(e){AC=null;}}
function env(gn,t0,a,peak,dur){a=Math.max(a,.008);gn.gain.setValueAtTime(0.0001,t0);gn.gain.exponentialRampToValueAtTime(peak,t0+a);gn.gain.exponentialRampToValueAtTime(0.0001,t0+Math.max(dur,a+.02));}
function noise(t0,dur,type,f,q,peak,a=0.02){const s=AC.createBufferSource();s.buffer=NB;s.loop=true;const fl=AC.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const gn=AC.createGain();env(gn,t0,a,peak,dur);s.connect(fl).connect(gn).connect(BUS);s.start(t0,Math.random());s.stop(t0+dur+.05);return {s,fl,gn};}
function tone(t0,dur,type,f0,f1,peak,a=0.02){const o=AC.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t0);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t0+dur);const gn=AC.createGain();env(gn,t0,a,peak,dur);const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2000;o.connect(lp).connect(gn).connect(BUS);o.start(t0);o.stop(t0+dur+.05);return o;}
// All off (Jackie, Nov 16: "I dislike them period"). The made-up synth sounds stay silent until Garry's real sounds
// arrive; the radio and the sampler play real recordings and are not affected. The debug drawer's Sounds group can still
// play each one. To bring one back, take it out of SFX_OFF.
// The five Jackie picked as real recordings (REC below) play anyway. 'paper' is every other paper or book moment
// (pulling out a book, a letter landing, the curtain): silent, as Jackie chose no sound for pulling out a book.
const SFX_OFF=new Set(['tick','page','pop','chime','boing','purr','giggle','hmm','hum','sigh','pour','blub','slurp','burp','crunch','crinkle','fsss','soil','rumble','paper']);
const SFX_ALL=['tick','page','letter','paper','pop','chime','boing','purr','giggle','hmm','hum','sigh','pour','blub','slurp','burp','crunch','crinkle','fsss','soil','rumble'];
// Real recordings Jackie picked (Nov 16), all CC0 from Freesound, trimmed and evened out (see sounds/CREDITS.md).
// These play instead of the synth sound of the same name. v is how loud each one plays.
const REC={page:{f:'page',v:.5},letter:{f:'letter',v:.5},tick:{f:'tap',v:.35},pop:{f:'pop',v:.4},rumble:{f:'tummy',v:.45}};
const REC_BUF={};
function recLoad(){for(const [n,r] of Object.entries(REC))fetch('sounds/'+r.f+'.m4a').then(x=>x.ok?x.arrayBuffer():Promise.reject()).then(b=>new Promise((ok,no)=>AC.decodeAudioData(b,ok,no))).then(b=>{REC_BUF[n]=b;}).catch(()=>{});}
function recPlay(n){const b=REC_BUF[n];if(!b)return;const s=AC.createBufferSource();s.buffer=b;const g=AC.createGain();g.gain.value=REC[n].v;s.connect(g).connect(AC.destination);s.start();}
function sfx(n,force){if(!AC||!BUS)return;if(REC[n]){recPlay(n);return;}if(SFX_OFF.has(n)&&!force)return;const t=AC.currentTime+.01;switch(n){
case'pour':{const x=noise(t,1.4,'bandpass',900,.9,.09,.2);const l=AC.createOscillator();l.frequency.value=7;const lg=AC.createGain();lg.gain.value=180;l.connect(lg).connect(x.fl.frequency);l.start(t);l.stop(t+1.5);break;}
case'crinkle':for(let i=0;i<5;i++)noise(t+i*rnd(.04,.08),.05,'bandpass',1600,1.2,.025,.01);break;
case'rumble':{const o=tone(t,.9,'sine',70,55,.22,.12);const l=AC.createOscillator();l.frequency.value=6;const lg=AC.createGain();lg.gain.value=8;l.connect(lg).connect(o.frequency);l.start(t);l.stop(t+1);break;}
case'hmm':tone(t,.55,'triangle',240,190,.08,.1);break;
case'hum':tone(t,1.1,'sine',392,370,.06,.25);break;
case'purr':{const x=noise(t,1.2,'lowpass',320,.8,.16,.15);const l=AC.createOscillator();l.frequency.value=22;const lg=AC.createGain();lg.gain.value=.12;l.connect(lg).connect(x.gn.gain);l.start(t);l.stop(t+1.3);break;}
case'crunch':for(let i=0;i<4;i++)noise(t+i*.1,.07,'lowpass',1200,.8,.1,.01);break;
case'slurp':tone(t,.4,'triangle',240,520,.05,.06);break;
case'burp':tone(t,.35,'triangle',110,70,.09,.04);break;
case'boing':tone(t,.18,'sine',220,520,.09,.015);tone(t+.16,.25,'sine',520,300,.07,.015);break;
case'fsss':noise(t,.5,'bandpass',1800,.6,.03,.08);break;
case'sigh':noise(t,.9,'bandpass',600,1,.08,.3);break;
case'page':case'paper':noise(t,.22,'bandpass',1100,.7,.045,.04);noise(t+.17,.2,'bandpass',1300,.7,.03,.04);break;
case'chime':[523,659,784,1047].forEach((f,i)=>tone(t+i*.13,.8,'sine',f,0,.05,.015));break;
case'giggle':[480,560,500,600].forEach((f,i)=>tone(t+i*.1,.1,'triangle',f,0,.03,.01));break;
case'blub':tone(t,.15,'sine',300,130,.09,.01);tone(t+.18,.15,'sine',270,115,.07,.01);break;
case'tick':tone(t,.06,'sine',620,480,.025,.008);break; // every tap: a tiny soft knock, not a hiss
case'soil':noise(t,.3,'lowpass',700,.8,.1,.03);break;
case'pop':tone(t,.12,'sine',440,720,.07,.01);break;
}}
