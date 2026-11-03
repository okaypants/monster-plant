'use strict';
/* Audio: the little synth sounds (sfx). Sound slots for Garry are fplay() in fidgets.js. */
/* ---------- audio ---------- */
let AC=null,NB=null;
function audioInit(){try{AC=new (window.AudioContext||window.webkitAudioContext)();NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}catch(e){AC=null;}}
function env(gn,t0,a,peak,dur){gn.gain.setValueAtTime(0.0001,t0);gn.gain.exponentialRampToValueAtTime(peak,t0+a);gn.gain.exponentialRampToValueAtTime(0.0001,t0+dur);}
function noise(t0,dur,type,f,q,peak,a=0.02){const s=AC.createBufferSource();s.buffer=NB;s.loop=true;const fl=AC.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const gn=AC.createGain();env(gn,t0,a,peak,dur);s.connect(fl).connect(gn).connect(AC.destination);s.start(t0,Math.random());s.stop(t0+dur+.05);return {s,fl,gn};}
function tone(t0,dur,type,f0,f1,peak,a=0.02){const o=AC.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t0);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t0+dur);const gn=AC.createGain();env(gn,t0,a,peak,dur);const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2400;o.connect(lp).connect(gn).connect(AC.destination);o.start(t0);o.stop(t0+dur+.05);return o;}
function sfx(n){if(!AC)return;const t=AC.currentTime+.01;switch(n){
case'pour':{const x=noise(t,1.4,'bandpass',1400,.8,.18,.15);const l=AC.createOscillator();l.frequency.value=9;const lg=AC.createGain();lg.gain.value=300;l.connect(lg).connect(x.fl.frequency);l.start(t);l.stop(t+1.5);break;}
case'crinkle':for(let i=0;i<7;i++)noise(t+i*rnd(.03,.07),.03,'highpass',3500,.7,.08,.003);break;
case'rumble':{const o=tone(t,.9,'sine',70,55,.35,.1);const l=AC.createOscillator();l.frequency.value=7;const lg=AC.createGain();lg.gain.value=12;l.connect(lg).connect(o.frequency);l.start(t);l.stop(t+1);break;}
case'hmm':tone(t,.55,'triangle',260,200,.12,.08);break;
case'hum':tone(t,1.1,'sine',392,370,.08,.2);break;
case'purr':{const x=noise(t,1.2,'lowpass',380,1,.3,.1);const l=AC.createOscillator();l.frequency.value=24;const lg=AC.createGain();lg.gain.value=.25;l.connect(lg).connect(x.gn.gain);l.start(t);l.stop(t+1.3);break;}
case'crunch':for(let i=0;i<5;i++)noise(t+i*.09,.06,'lowpass',2200,1,.25,.005);break;
case'slurp':tone(t,.45,'sawtooth',250,700,.06,.05);break;
case'burp':tone(t,.4,'sawtooth',95,60,.12,.03);break;
case'boing':tone(t,.18,'sine',220,620,.15,.01);tone(t+.16,.25,'sine',620,330,.12,.01);break;
case'fsss':noise(t,.6,'highpass',4500,.5,.08,.05);break;
case'sigh':noise(t,.9,'bandpass',700,1.2,.12,.25);break;
case'page':noise(t,.25,'highpass',2500,.6,.1,.02);noise(t+.2,.2,'highpass',3000,.6,.07,.02);break;
case'chime':[660,880,990,1320].forEach((f,i)=>tone(t+i*.12,.6,'sine',f,0,.08,.01));break;
case'giggle':[520,600,540,640].forEach((f,i)=>tone(t+i*.09,.08,'square',f,0,.03,.005));break;
case'blub':tone(t,.15,'sine',300,120,.15,.01);tone(t+.18,.15,'sine',280,110,.12,.01);break;
case'tick':noise(t,.04,'highpass',2000,1,.06,.002);break;
case'soil':noise(t,.3,'lowpass',900,1,.15,.02);break;
case'pop':tone(t,.12,'sine',500,900,.12,.005);break;
}}
