'use strict';
/* THE MOON IN THE WINDOW (Jackie, Nov 16): at night the moon outside the window shows tonight's real phase, worked out from
   the phone's date (no internet, no new pictures, nothing extra to load). Each season's night window picture has its own
   painted moon (a crescent in spring, a full moon in summer and autumn, none in winter); at night that one is painted over
   with the sky around it and a pixel moon is drawn in its place, lit like the real one. Seen from the northern half of the
   world: a waxing moon is lit on the right. It's behind the glass, so the curtains close over it like the rest of the view.
   moonAge(), moonLit() and moonName() are here for anything else that wants tonight's moon (the astrology box, later). */
const MOON_MONTH=29.530588853,MOON_NEW0=Date.UTC(2000,0,6,18,14); // the length of a lunar month (days) and a known new moon
// where the moon sits in each season's night window (picture pixels; the picture is drawn at 318,88), its color, and how
// much sky to paint over the painted moon first (enough to hide its whole shape)
const MOON_AT=(()=>{const m=(lit)=>({x:119,y:210,r:12,cover:0,sky:'#0b1640',lit});return {spring:m([253,226,130]),summer:m([253,226,142]),autumn:m([254,211,86]),winter:m([236,236,214])};})(); // in the middle pane of the second row (Nov 18: the new room's window)
const MOON_PX=2; // its pixels, in room units: chunky, like the rest of the room's pixel art
let MOON_TEST=null; // the debug drawer and the tests can set a moon age (days) to see any phase
function moonAge(t){if(MOON_TEST!=null)return MOON_TEST;const d=((t??Date.now())-MOON_NEW0)/864e5;return ((d%MOON_MONTH)+MOON_MONTH)%MOON_MONTH}
function moonLit(t){return (1-Math.cos(2*Math.PI*moonAge(t)/MOON_MONTH))/2} // how much of it is lit, 0 to 1
function moonName(t){const a=moonAge(t),f=a/MOON_MONTH;
  return f<.0339||f>.9661?'new moon':f<.2161?'waxing crescent':f<.2839?'first quarter':f<.4661?'waxing gibbous':f<.5339?'full moon':f<.7161?'waning gibbous':f<.7839?'last quarter':'waning crescent'}
const moonCache=new Map();
// the moon as a little picture: lit pixels in its color, the dark part a shade lighter than the sky so the round shape still
// reads (except at new moon, when there's nothing to see), a softer rim on the lit edge like the painted moons had
function moonPic(season,age){const M=MOON_AT[season],key=season+'|'+Math.round(age*4);if(moonCache.has(key))return moonCache.get(key);
  const n=Math.ceil(M.r*2/MOON_PX)+1,c=document.createElement('canvas');c.width=c.height=n*MOON_PX;const x=c.getContext('2d');
  const th=2*Math.PI*age/MOON_MONTH,waxing=th<=Math.PI,cs=Math.cos(th),R=M.r/MOON_PX,mid=(n-1)/2,lit=moonLit(MOON_NEW0+age*864e5);
  const [lr,lg,lb]=M.lit;
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const dx=(i-mid)/R,dy=(j-mid)/R,d2=dx*dx+dy*dy;if(d2>1)continue;
    const e=Math.sqrt(Math.max(0,1-dy*dy)),on=waxing?dx>e*cs+.04:dx<-e*cs-.04,rim=d2>.72;
    if(on)x.fillStyle=rim?`rgb(${lr*.9|0},${lg*.88|0},${lb*.8|0})`:`rgb(${lr},${lg},${lb})`;
    else if(lit>.02)x.fillStyle='rgba(120,140,190,.16)';else continue;
    x.fillRect(i*MOON_PX,j*MOON_PX,MOON_PX,MOON_PX)}
  moonCache.set(key,c);return c}
function drawMoon(tk,season){if(tk!=='night')return;const M=MOON_AT[season];if(!M)return;const ox=318,oy=88;
  if(M.cover){g.fillStyle=M.sky;g.beginPath();g.arc(ox+M.x,oy+M.y,M.cover,0,Math.PI*2);g.fill()}
  const p=moonPic(season,moonAge());g.drawImage(p,Math.round(ox+M.x-p.width/2),Math.round(oy+M.y-p.height/2))}
