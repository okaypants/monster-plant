'use strict';
/* THE SKY (Jackie, Nov 16): where the sun, the moon and the five planets you can see by eye (Mercury, Venus, Mars, Jupiter,
   Saturn) are in the zodiac at any moment, and the rising sign for a place, worked out on the phone with no internet.
   The method is Paul Schlyter's "How to compute planetary positions" (orbital elements of date, the moon's twelve biggest
   wobbles, Jupiter's and Saturn's pull on each other); good to well under a degree, plenty for signs and aspects.
   Longitudes are tropical (from the spring equinox), as astrologers use. Used by the birth charts (js/charts.js). */
const SIGNS=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SIGN_GLYPH=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'].map(g=>g+'\uFE0E'); // as plain symbols, not emoji tiles
const SIGN_ELEMENT=['fire','earth','air','water','fire','earth','air','water','fire','earth','air','water'];
const SKY_BODIES=['sun','moon','mercury','venus','mars','jupiter','saturn'];
const RAD=Math.PI/180,rev=x=>((x%360)+360)%360,sind=x=>Math.sin(x*RAD),cosd=x=>Math.cos(x*RAD),atan2d=(y,x)=>Math.atan2(y,x)/RAD;
function skyDay(t){return t/864e5+2440587.5-2451543.5} // days since 1999 Dec 31, 0h UT (Schlyter's day 0)
const ELEMENTS={ // N, i, w, a, e, M (each [value, change per day])
  sun:[[0,0],[0,0],[282.9404,4.70935e-5],[1,0],[.016709,-1.151e-9],[356.0470,.9856002585]],
  moon:[[125.1228,-.0529538083],[5.1454,0],[318.0634,.1643573223],[60.2666,0],[.0549,0],[115.3654,13.0649929509]],
  mercury:[[48.3313,3.24587e-5],[7.0047,5e-8],[29.1241,1.01444e-5],[.387098,0],[.205635,5.59e-10],[168.6562,4.0923344368]],
  venus:[[76.6799,2.4659e-5],[3.3946,2.75e-8],[54.891,1.38374e-5],[.72333,0],[.006773,-1.302e-9],[48.0052,1.6021302244]],
  mars:[[49.5574,2.11081e-5],[1.8497,-1.78e-8],[286.5016,2.92961e-5],[1.523688,0],[.093405,2.516e-9],[18.6021,.5240207766]],
  jupiter:[[100.4542,2.76854e-5],[1.303,-1.557e-7],[273.8777,1.64505e-5],[5.20256,0],[.048498,4.469e-9],[19.895,.0830853001]],
  saturn:[[113.6634,2.3898e-5],[2.4886,-1.081e-7],[339.3939,2.97661e-5],[9.55475,0],[.055546,-9.499e-9],[316.967,.0334442282]]};
function skyEl(b,d){return ELEMENTS[b].map(([v,k])=>v+k*d)}
function skyKepler(M,e){let E=M+e/RAD*sind(M)*(1+e*cosd(M));for(let k=0;k<6;k++)E=E-(E-e/RAD*sind(E)-M)/(1-e*cosd(E));return E}
function skyOrbit(b,d){const [N,i,w,a,e,M]=skyEl(b,d),Mr=rev(M),E=skyKepler(Mr,e),xv=a*(cosd(E)-e),yv=a*Math.sqrt(1-e*e)*sind(E),v=atan2d(yv,xv),r=Math.hypot(xv,yv);
  const x=r*(cosd(N)*cosd(v+w)-sind(N)*sind(v+w)*cosd(i)),y=r*(sind(N)*cosd(v+w)+cosd(N)*sind(v+w)*cosd(i)),z=r*sind(v+w)*sind(i);return {x,y,z,r,v,w,N,M:Mr}}
// geocentric ecliptic longitude of a body, in degrees, at time t (ms)
function skyLon(b,t){const d=skyDay(t),S=skyOrbit('sun',d),lonSun=rev(S.v+S.w);
  if(b==='sun')return lonSun;
  if(b==='moon'){const m=skyOrbit('moon',d);let lon=rev(atan2d(m.y,m.x));const Ms=S.M,Mm=m.M,Ls=rev(Ms+S.w),Lm=rev(Mm+m.w+m.N),D=Lm-Ls,F=Lm-m.N;
    lon+=-1.274*sind(Mm-2*D)+.658*sind(2*D)-.186*sind(Ms)-.059*sind(2*Mm-2*D)-.057*sind(Mm-2*D+Ms)+.053*sind(Mm+2*D)+.046*sind(2*D-Ms)+.041*sind(Mm-Ms)-.035*sind(D)-.031*sind(Mm+Ms)-.015*sind(2*F-2*D)+.011*sind(Mm-4*D);
    return rev(lon)}
  const p=skyOrbit(b,d);let x=p.x,y=p.y,z=p.z;
  if(b==='jupiter'||b==='saturn'){const Mj=skyEl('jupiter',d)[5],Msa=skyEl('saturn',d)[5];let lon=atan2d(y,x),lat=atan2d(z,Math.hypot(x,y));const r=p.r;
    lon+=b==='jupiter'?-.332*sind(2*Mj-5*Msa-67.6)-.056*sind(2*Mj-2*Msa+21)+.042*sind(3*Mj-5*Msa+21)-.036*sind(Mj-2*Msa)+.022*cosd(Mj-Msa)+.023*sind(2*Mj-3*Msa+52)-.016*sind(Mj-5*Msa-69)
      :.812*sind(2*Mj-5*Msa-67.6)-.229*cosd(2*Mj-4*Msa-2)+.119*sind(Mj-2*Msa-3)+.046*sind(2*Mj-6*Msa-69)+.014*sind(Mj-3*Msa+32);
    x=r*cosd(lon)*cosd(lat);y=r*sind(lon)*cosd(lat);z=r*sind(lat)}
  return rev(atan2d(y+S.r*sind(lonSun),x+S.r*cosd(lonSun)))}
// the rising sign's degree for a place (latitude, longitude east positive) at time t
function skyAsc(t,lat,lon){const d=skyDay(t),S=skyEl('sun',d),Ls=rev(S[5]+S[2]),ut=((t/36e5)%24+24)%24,ramc=rev(Ls+180+ut*15+lon),ecl=23.4393-3.563e-7*d;
  return rev(atan2d(cosd(ramc),-(sind(ramc)*cosd(ecl)+Math.tan(lat*RAD)*sind(ecl))))}
function skySign(lon){const i=Math.floor(rev(lon)/30);return {i,name:SIGNS[i],glyph:SIGN_GLYPH[i],deg:Math.floor(rev(lon)%30),element:SIGN_ELEMENT[i]}}
// the whole chart: each body's longitude and sign, whether it's moving backward (retrograde), and the rising sign if a place is known
function skyChart(t,place){const out={t};for(const b of SKY_BODIES){const l=skyLon(b,t),l0=skyLon(b,t-864e5),mv=((l-l0+540)%360)-180;out[b]={lon:l,...skySign(l),rx:b!=='sun'&&b!=='moon'&&mv<0}}
  if(place&&place.lat!=null){const a=skyAsc(t,place.lat,place.lon);out.asc={lon:a,...skySign(a)}}return out}
// the angle between two longitudes and which classic aspect it makes (within its orb), if any
const ASPECTS=[{n:'conjunct',a:0,orb:8},{n:'sextile',a:60,orb:4},{n:'square',a:90,orb:6},{n:'trine',a:120,orb:6},{n:'opposite',a:180,orb:8}];
function skyAspect(l1,l2,tight){const d=Math.abs(((l1-l2+540)%360)-180);for(const A of ASPECTS){const o=Math.abs(d-A.a);if(o<=(tight?A.orb/2:A.orb))return {...A,off:o}}return null}
