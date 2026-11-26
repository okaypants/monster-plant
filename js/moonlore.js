'use strict';
/* WHAT TONIGHT'S MOON IS CALLED ELSEWHERE (Jackie, Nov 25: the moon card should carry "the evening's astrological significance or
   features in different cultures"). Everything here is worked out from the date and where the moon is, and every line only
   describes: it names the night and says what a tradition holds about it. Nothing is predicted and nobody is told what to do.

   - The Hawaiian moon calendar names each night of the lunar month (about thirty). Night 1, Hilo, is the first thin crescent;
     the last, Muku, is the dark moon.
   - The nakshatras are the 27 lunar mansions of Indian astronomy: equal parts of the moon's path measured against the stars
     (so the sky's slow drift since antiquity, the ayanamsa, is taken off first; the Lahiri value is used).
   - The manazil are the 28 lunar mansions of Arabic astronomy; here 28 equal parts from the start of Aries, as astrologers counted
     them. Both sets of mansions were named for stars, but with equal parts and the sky's drift the moon is often no longer beside
     the star a mansion is named for, so the lines say "named for", never that the moon is near it.
   - The Hebrew day in the phone's calendar changes at midnight, though the real day begins at sundown, so Passover and Sukkot
     are matched on the day before (the 14th) and worded "begins at sundown tonight".
   - Japan has names for the nights around the full moon, counted by the day of the lunar month.
   - The lunar dates and the festivals come from the phone's own Chinese, Hebrew and Islamic calendars (Intl.DateTimeFormat).
     Islamic months really begin when the crescent is seen, so that date is given as "about". */
const HAWAII_NIGHTS=[
 ['Hilo','the first night, named for the thin twisted thread of the new crescent'],
 ['Hoaka','the second night. Its name means crescent'],
 ['Kū Kahi','the first of four Kū nights'],
 ['Kū Lua','the second of four Kū nights'],
 ['Kū Kolu','the third of four Kū nights'],
 ['Kū Pau','the last of four Kū nights'],
 ['ʻOle Kū Kahi','the first of four ʻOle nights. ʻOle means nothing, and these were generally held to be poor nights for planting and fishing'],
 ['ʻOle Kū Lua','the second of four ʻOle nights, generally held to be poor nights for planting and fishing'],
 ['ʻOle Kū Kolu','the third of four ʻOle nights, generally held to be poor nights for planting and fishing'],
 ['ʻOle Pau','the last of four ʻOle nights'],
 ['Huna','the eleventh night. Its name means hidden, and by some accounts it was a night for planting root crops'],
 ['Mōhalu','the twelfth night. Its name means to open, like a flower'],
 ['Hua','the thirteenth night. Its name means fruit, egg and seed, and by some accounts it was a good night for planting'],
 ['Akua','the fourteenth night. Its name means god'],
 ['Hoku','the fifteenth night, the full moon'],
 ['Māhealani','the sixteenth night, when the moon is still full'],
 ['Kulu','the seventeenth night. Its name means to drop'],
 ['Lāʻau Kū Kahi','the first of three Lāʻau nights. Lāʻau means plants and medicine, and by some accounts these were nights for planting trees and gathering medicine'],
 ['Lāʻau Kū Lua','the second of three Lāʻau nights'],
 ['Lāʻau Pau','the last of three Lāʻau nights'],
 ['ʻOle Kū Kahi','the first of three more ʻOle nights, generally held to be poor nights for planting and fishing'],
 ['ʻOle Kū Lua','the second of three more ʻOle nights, generally held to be poor nights for planting and fishing'],
 ['ʻOle Pau','the last ʻOle night of the month'],
 ['Kāloa Kū Kahi','the first of three Kāloa nights, which belong to the god Kanaloa'],
 ['Kāloa Kū Lua','the second of three Kāloa nights, which belong to the god Kanaloa'],
 ['Kāloa Pau','the last of three Kāloa nights, which belong to the god Kanaloa'],
 ['Kāne','the twenty-seventh night, which belongs to the god Kāne'],
 ['Lono','the twenty-eighth night, which belongs to the god Lono'],
 ['Mauli','the twenty-ninth night, the last sliver of the old moon'],
 ['Muku','the last night. Its name means cut off, and the moon is not seen']];
const NAKSHATRAS=[['Ashwini','the horse riders'],['Bharani','the bearer'],['Krittika','the cutters, named for the Pleiades'],['Rohini','the red one, named for the star Aldebaran'],['Mrigashira','the deer’s head'],['Ardra','the moist one'],
 ['Punarvasu','good again'],['Pushya','the nourisher'],['Ashlesha','the embrace'],['Magha','the mighty one'],['Purva Phalguni','the former reddish one'],['Uttara Phalguni','the latter reddish one'],
 ['Hasta','the hand'],['Chitra','the bright one, named for the star Spica'],['Swati','named for the star Arcturus'],['Vishakha','the forked branch'],['Anuradha','the one that follows Radha, the mansion before it'],['Jyeshtha','the eldest, named for the star Antares'],
 ['Mula','the root'],['Purva Ashadha','the former unconquered one'],['Uttara Ashadha','the latter unconquered one'],['Shravana','hearing'],['Dhanishta','the wealthiest'],['Shatabhisha','a hundred healers'],
 ['Purva Bhadrapada','the former lucky feet'],['Uttara Bhadrapada','the latter lucky feet'],['Revati','the wealthy one']];
const MANAZIL=[['al-Sharaṭān','the two signs'],['al-Buṭayn','the little belly'],['al-Thurayyā','the Pleiades'],['al-Dabarān','the follower, named for the star Aldebaran'],['al-Haqʿa','the white spot'],['al-Hanʿa','the mark'],['al-Dhirāʿ','the forearm'],
 ['al-Nathra','the gap'],['al-Ṭarf','the glance'],['al-Jabha','the forehead'],['al-Zubra','the mane'],['al-Ṣarfa','the change of weather'],['al-ʿAwwāʾ','the howler'],['al-Simāk al-Aʿzal','the unarmed Simāk, named for the star Spica'],
 ['al-Ghafr','the covering'],['al-Zubānā','the claws'],['al-Iklīl','the crown'],['al-Qalb','the heart, named for the star Antares'],['al-Shawla','the sting'],['al-Naʿāʾim','the ostriches'],['al-Balda','the empty place'],
 ['Saʿd al-Dhābiḥ','the lucky star of the slaughterer'],['Saʿd Bulaʿ','the lucky star of the swallower'],['Saʿd al-Suʿūd','the luckiest of the lucky stars'],['Saʿd al-Akhbiya','the lucky star of the tents'],
 ['al-Fargh al-Muqaddam','the front spout of the bucket'],['al-Fargh al-Muʾakhkhar','the rear spout of the bucket'],['Baṭn al-Ḥūt','the belly of the fish']];
// Japan's names for the nights of the lunar month (by its day)
const JAPAN_NIGHTS={3:['mikazuki','the third-day moon, the thin crescent'],13:['jūsan’ya','the thirteenth night, admired as the moon that is not quite full'],15:['jūgoya','the fifteenth night, the full-moon night'],
 16:['izayoi','the sixteenth night. Its name means hesitating, because the moon rises a little later'],17:['tachimachizuki','the moon you wait for standing up'],18:['imachizuki','the moon you wait for sitting down'],
 19:['nemachizuki','the moon you wait for lying down'],20:['fukemachizuki','the moon you wait for late into the night']};
// festivals by the day of a lunar calendar: [month, day, line]
const MOON_FESTS={chinese:[[1,1,'Today is Lunar New Year’s Day in China, Korea, Vietnam and many other places.'],[1,15,'Tonight is the Lantern Festival in China, the first full moon of the year.'],
  [5,5,'Today is the Dragon Boat Festival in China, and Dano in Korea.'],[7,7,'Tonight is Qixi in China and Chilseok in Korea, the night the weaver and the cowherd meet across the Milky Way.'],
  [7,15,'Tonight is the Ghost Festival in China, when lanterns are lit for the dead.'],[8,15,'Tonight is the Mid-Autumn Festival in China, Chuseok in Korea and moon viewing night in Japan.'],
  [9,9,'Today is the Double Ninth Festival in China, a day for climbing hills and visiting elders.']],
 hebrew:[['Nisan',14,'Passover begins at sundown tonight.'],['Tishri',14,'Sukkot begins at sundown tonight.'],['Adar',14,'Today is Purim.'],['Adar II',14,'Today is Purim.'],['Shevat',15,'Today is Tu BiShvat, the new year of the trees.']],
 islamic:[[9,1,'About now Ramadan begins, when the new crescent is seen.'],[10,1,'About now is Eid al-Fitr, the end of Ramadan.'],[12,10,'About now is Eid al-Adha.']]};
const ORD=n=>n+(n%100>10&&n%100<14?'th':['th','st','nd','rd','th','th','th','th','th','th'][n%10]);
function calParts(cal,t){try{const p=new Intl.DateTimeFormat('en-u-ca-'+cal,{day:'numeric',month:'numeric',year:'numeric'}).formatToParts(new Date(t)),g=k=>(p.find(x=>x.type===k)||{}).value||'';
  const m=g('month'),leap=/bis|L/i.test(m);return {day:parseInt(g('day'),10),month:parseInt(m,10),leap,name:new Intl.DateTimeFormat('en-u-ca-'+cal,{month:'long'}).format(new Date(t))};}catch(e){return null}}
function hawaiiNight(t){const n=Math.round(moonAge(t));return n<1||n>29?30:n;} // 1 to 30
function nakshatraAt(t){const y=new Date(t).getUTCFullYear()+new Date(t).getUTCMonth()/12,ay=23.853+.013969*(y-2000),lon=((skyLon('moon',t)-ay)%360+360)%360;return Math.floor(lon/(360/27))%27;}
function manzilAt(t){const lon=((skyLon('moon',t))%360+360)%360;return Math.floor(lon/(360/28))%28;}
function moonElsewhere(t){t=t??Date.now();const out=[];
 const h=HAWAII_NIGHTS[hawaiiNight(t)-1];out.push({where:'Hawaiʻi',say:'In the Hawaiian moon calendar tonight is '+h[0]+', '+h[1]+'.'});
 const ch=calParts('chinese',t);
 if(ch&&!ch.leap&&JAPAN_NIGHTS[ch.day]){const j=JAPAN_NIGHTS[ch.day];out.push({where:'Japan',say:'In Japan tonight’s moon is called '+j[0]+', '+j[1]+'.'});}
 const nk=NAKSHATRAS[nakshatraAt(t)];out.push({where:'India',say:'In Indian astrology the moon is in '+nk[0]+', '+nk[1]+'. It is one of 27 lunar mansions.'});
 const mz=MANAZIL[manzilAt(t)];out.push({where:'Arabic',say:'In the Arabic lunar mansions it is in '+mz[0]+', '+mz[1]+'.'});
 const he=calParts('hebrew',t),is=calParts('islamic-umalqura',t),d=[];
 if(ch)d.push('the '+ORD(ch.day)+' day of the '+ORD(ch.month)+(ch.leap?' (leap)':'')+' month in the Chinese calendar');
 if(he)d.push('the '+ORD(he.day)+' of '+he.name+' in the Hebrew calendar');
 if(is)d.push('about the '+ORD(is.day)+' of '+is.name+' in the Islamic calendar');
 if(d.length)out.push({where:'Calendars',say:'It is '+(d.length>1?d.slice(0,-1).join(', ')+' and '+d[d.length-1]:d[0])+'.'});
 const fest=[];if(ch&&!ch.leap)for(const[m,dd,s]of MOON_FESTS.chinese)if(ch.month===m&&ch.day===dd)fest.push(s);
 if(he)for(const[m,dd,s]of MOON_FESTS.hebrew)if(he.name===m&&he.day===dd)fest.push(s);
 if(is)for(const[m,dd,s]of MOON_FESTS.islamic)if(is.month===m&&is.day===dd)fest.push(s);
 return {lines:out,fest};}
