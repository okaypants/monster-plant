'use strict';
/* Plants: ages, sprites, faces, charms, pots (paused), needs and light, scooting, personality, friends, titles, seeds and breeding. */
const BABY=[],ELDER=[];for(let i=1;i<=16;i++){const n=String(i).padStart(2,'0');BABY.push(img('baby_'+n+'.png'));ELDER.push(img('elder_'+n+'.png'));}
// seedling pot (Jackie's sheet, 2 frames per stage): soil, first sprout, then the bigger sprout halfway through the sprout stage.
// Drawn at half size in code (never resized): the sheet's pot is 238 px across, baby_01's is 140, so it lands a bit smaller, and halving stays crisp.
const SEEDLING={soil:[img('seedling_soil1.png'),img('seedling_soil2.png')],sprout:[img('seedling_sprout1.png'),img('seedling_sprout2.png')],bigsprout:[img('seedling_bigsprout1.png'),img('seedling_bigsprout2.png')]},SEED_K=.65; // at the front of the rug; depthK makes it ~.43 on the desk
function seedFrame(){const k=st.stage<1?'soil':st.timer<GROW_FOR[1]/2?'sprout':'bigsprout';return SEEDLING[k][Math.floor(T*.6)%2];} // slow 2-frame swap
const BABY_SLEEP=[];for(let i=1;i<=16;i++)BABY_SLEEP.push(img('baby_'+String(i).padStart(2,'0')+'_sleep.png'));
const SLEEP_OFF=[[0, 0], [-4, -1], [-1, 3], [-4, 11], [-1, 3], [-2, 2], [-2, 3], [1, 3], [0, 4], [0, 4], [-2, 4], [-1, 5], [1, -2], [0, 2], [2, 3], [0, 2]]; // sleeping baby offset vs awake; only x is used now (the bottom is anchored by the real bottom)
const EYE_O=[],EYE_C=[],MOUTH=[];for(let i=1;i<=16;i++){const n=String(i).padStart(2,'0');EYE_O.push(img('eyes_'+n+'_open.png'));EYE_C.push(img('eyes_'+n+'_blink.png'));if(i<=12)MOUTH.push(img('mouthB_'+n+'.png'));}
const EYE_NAMES=['big round','small dot','sparkle','sly cat','square','flower','tall oval','lashed','sleepy','swirl','sinister','slit','three-shine','pink lids','startled','blushing'];
const NAMES=['curl-sprout bun','lobed bun','stacked cone','leafy mop','bulb','rounded crown','pineapple tuft','floppy ears','sprout-ears','spiral','tentacle star','willow mop','octopus','diamond','lobed cloud','cradle lobes'];
function lightFit(k){return lightFitText(spotInfo(k,.37,true),st.pref);} // the spot by day, curtains open
function stageGroup(){return st.stage<4?'seed':st.stage===4?'baby':'grown';}
const STAGES=['seed','sprout','sprout','sprout','kid','teen','teen','adult','adult'];
const TEACH={thirst:'Someone\'s thirsty -- try dragging over the water carafe or enjoy your new living rock sculptures.',attention:'A little frown: it\'s lonely. Pet it or read to it.'};
/* ---------- plant sprite ---------- */
// returns {img|null, x, y, w, h, scale} in room coords for the current stage
// FEWER AGES (Jackie): seed -> sprout -> baby -> teen -> adult, each clearly bigger. Internal stage numbers kept: 0 seed, 1 sprout, 4 baby, 6 teen, 8 elder
const NEXT={0:1,1:4,4:6,6:8},AGES=[0,1,4,6,8];
const ELDER_SCALE={6:.62,7:.62,8:.82}; // shown smaller so elder pixels match the room's (Jackie OK'd); swap to 1 when finer-pixel redraws arrive
const FACE=[[0.531, 0.511], [0.505, 0.403], [0.487, 0.493], [0.509, 0.409], [0.525, 0.47], [0.508, 0.377], [0.536, 0.435], [0.503, 0.364], [0.51, 0.461], [0.417, 0.516], [0.5, 0.488], [0.497, 0.375], [0.505, 0.376], [0.5, 0.413], [0.506, 0.406], [0.494, 0.456]]; // per-elder face point (fraction of sprite), from blank body area
function plantBox(){const pb=plantBoxRaw();if(drag.on&&mx>-50&&st.id===drag.id){ /* only the plant you grabbed follows your finger */const dx=mx-(pb.x+pb.w/2),dy=my-(pb.y+pb.h*.85);return {...pb,x:pb.x+dx,y:pb.y+dy};}
 const q=quirkOff();return q[0]||q[1]?{...pb,x:pb.x+q[0],y:pb.y+q[1]}:pb;}
/* SEEING ITS NATURE (Jackie, Nov 7): the quirks happen on screen, not just in a caption. All moves are whole steps of 5 (one art pixel).
   moon  : a really chaotic monster (lawful-chaotic at -0.6 or wilder) sometimes floats up and bounces slowly around the room in
           moon gravity, and keeps at it until you drag it back down to earth.
   bonk  : it hops over toward the thing it bonks, then back.   tidy: a quick, neat little shuffle in place.
   boo   : a shark-grin spooky face at the cat (teens and adults), with a hop toward the cat. */
const MOON_G=140,R5=v=>Math.round(v/5)*5;
function quirkOff(){let x=0,y=0;if(st.float)y-=R5(st.float.h);
 if(st.bonkT>0){const t=st.bonkT,d=st.bonkDir||1;if(t>.38){x+=d*20;y-=15;}else if(t>.25){x+=d*30;y-=5;}else if(t>.12)x+=d*15;}
 if(st.tidyT>0)x+=Math.floor(st.tidyT*8)%2?5:-5;if(st.nodT>0)y+=st.nodT>.15?5:0;return [x,y];} // nod: dips one art pixel, then back
function quirkMotion(dt){if(st.bonkT>0)st.bonkT-=dt;if(st.nodT>0)st.nodT-=dt;if(st.tidyT>0)st.tidyT-=dt;if(st.spookT>0)st.spookT-=dt;
 const f=st.float;if(!f)return;if(drag.on&&st.id===drag.id){st.float=null;return;} // grabbed: back to earth
 f.vh-=MOON_G*dt;f.h+=f.vh*dt;
 if(f.h<=0){f.h=0;if(st.night||st.nap>0){st.float=null;return;} // bedtime: it lands and stays
  f.vh=rnd(250,330);sfx('boing');}
 st.free=st.free||{x:SPOT.rugC.x,y:SPOT.rugC.y};st.free.x+=f.vx*dt;
 if(st.free.x<FLOOR_X0+60){st.free.x=FLOOR_X0+60;f.vx=Math.abs(f.vx);}if(st.free.x>FLOOR_X1-60){st.free.x=FLOOR_X1-60;f.vx=-Math.abs(f.vx);}}
// NEW teen/adult art per species (Jackie via ChatGPT), shown at target heights: teen 45%, adult 60% of the room
const NEWART={1:{teen:img('teen_01.png'),adult:img('adult_01.png'),face:{teen:[0.494, 0.398],adult:[0.491, 0.511]}},2:{teen:img('teen_02.png'),adult:img('adult_02.png'),face:{teen:[0.499, 0.363],adult:[0.493, 0.375]}},3:{teen:img('teen_03.png'),adult:img('adult_03.png'),face:{teen:[0.493, 0.477],adult:[0.498, 0.532]}},4:{teen:img('teen_04.png'),adult:img('adult_04.png'),face:{teen:[0.5, 0.503],adult:[0.486, 0.523]}},5:{teen:img('teen_05.png'),adult:img('adult_05.png'),face:{teen:[0.494, 0.414],adult:[0.503, 0.497]}},6:{teen:img('teen_06.png'),adult:img('adult_06.png'),face:{teen:[0.492, 0.401],adult:[0.507, 0.364]}},7:{teen:img('teen_07.png'),adult:img('adult_07.png'),face:{teen:[0.501, 0.445],adult:[0.5, 0.491]}},8:{teen:img('teen_08.png'),adult:img('adult_08.png'),face:{teen:[0.497, 0.352],adult:[0.499, 0.414]}},9:{teen:img('teen_09.png'),adult:img('adult_09.png'),face:{teen:[0.495, 0.42],adult:[0.509, 0.465]}},10:{teen:img('teen_10.png'),adult:img('adult_10.png'),face:{teen:[0.542, 0.48],adult:[0.491, 0.532]}},11:{teen:img('teen_11.png'),adult:img('adult_11.png'),face:{teen:[0.491, 0.53],adult:[0.469, 0.528]}},12:{teen:img('teen_12.png'),adult:img('adult_12.png'),face:{teen:[0.503, 0.431],adult:[0.495, 0.385]}},13:{teen:img('teen_13.png'),adult:img('adult_13.png'),face:{teen:[0.499, 0.242],adult:[0.505, 0.267]}},14:{teen:img('teen_14.png'),adult:img('adult_14.png'),face:{teen:[0.499, 0.289],adult:[0.503, 0.318]}},15:{teen:img('teen_15.png'),adult:img('adult_15.png'),face:{teen:[0.499, 0.368],adult:[0.499, 0.419]}},16:{teen:img('teen_16.png'),adult:img('adult_16.png'),face:{teen:[0.5, 0.419],adult:[0.498, 0.422]}}};
// AGE SIZES at the front of the rug (100%); depthK shrinks them farther back. A teen is 1.45x a kid, an adult 1.9x (adult = 60% of the room, as Jackie set).
// Every kid is the same height (they only ever sit around 2/3 depth, so none is drawn bigger than its PNG). A teen or adult drawing
// shorter than AGE_REF isn't blown up to full height (squat ones stay squat, as Jackie decided), so those come out a little under 1.45x / 1.9x.
const AGE_H={kid:.60*942/1.9,teen:.60*942*1.45/1.9,adult:.60*942},AGE_REF={kid:229,teen:460,adult:740},TARGET_H={teen:AGE_H.teen,adult:AGE_H.adult};
function plantDepth(){return onChair()?DEPTH.chair:spotDepth(spotKey());}
function ageArt(){const n=NEWART[st.species+1];if(!n||st.stage<6)return null;const k=st.stage>=8?'adult':'teen';return ok(n[k])?{im:n[k],k,face:n.face[k]}:null;}
function plantBoxRaw(){const sp=SPOT[spotKey()];
 if(st.stage<4){const [nx,ny]=plantNudge(),f=seedFrame();if(!ok(f))return {img:null,x:sp.x-60+nx,y:sp.y-80+ny,w:120,h:80};const k=SEED_K*depthK(plantDepth()),w=f.naturalWidth*k,h=f.naturalHeight*k;
  return {img:null,seed:f,seedK:k,x:Math.round(sp.x-w/2)+nx,y:Math.round(sp.y-h+bottomPad(f)*k)+ny,w,h};} // the pot's real bottom on the spot's surface line
 let im,sc=1;const aa=ageArt(),age=st.stage<=5?'kid':st.stage>=8?'adult':'teen';if(st.stage<=5){im=BABY[st.species];sc=AGE_H.kid/(im.naturalHeight||AGE_REF.kid);}else if(aa){im=aa.im;sc=AGE_H[age]/Math.max(im.naturalHeight,AGE_REF[age]);} /* squat drawings aren't blown up */else{im=ELDER[st.species];sc=AGE_H[age]/(im.naturalHeight||601);} /* stand-in */
 const wl=st.witherLv||0;let w=im.naturalWidth*sc*(1-.05*wl),h=im.naturalHeight*sc*(1-.07*wl); // withering: hunches and curls in, one clear step per level
 const dk=depthK(plantDepth()),at=onChair()?CHAIR_SEAT:sp;w*=dk;h*=dk;sc*=dk; // the armchair is just another spot: its depth, like any other
 const [nx,ny]=plantNudge();return {img:im,x:at.x-w/2+nx,y:at.y-h+padPx(im,h)+ny,w,h,scale:sc,dk};} // pot bottom on the surface line
function ageName(s=st.stage){return s<1?'seed':s<4?'sprout':s<6?'kid':s<8?'teen':'adult';}
function plantSpotName(){if(onChair())return 'chair';const k=spotKey();return k==='free'?'rug':k;}
function plantNudge(){return NUDGE.plant[(st.species+1)+'|'+ageName()+'|'+plantSpotName()]||[0,0];}
// SLEEPING IN THE ARMCHAIR (Jackie): asleep plants sit on the seat, sized by the chair's depth like any spot
const CHAIR_SEAT={x:628,y:SURFACE.chair};
// the chair's arms and seat front are redrawn over the sleeping plant so it nestles INTO the seat
const CHAIR_FRONT=[[443,598,80,150],[688,598,78,150],[515,686,178,62]];
let chairId=null,ACT=null;function onChair(){return st.stage>=4&&(st.nap>0||st.night)&&!(drag.on&&st.id===drag.id)&&st.id===chairId;} // only the plant you're dragging leaves the chair
function inChair(){return onChair()||(!(drag.on&&st.id===drag.id)&&st.stage>=4&&spotKey()==='chair');} // napping there, or sitting there awake
function pickChair(){const p=allRaw().find(q=>q.perch==='chair'&&q.stage>=6&&q.stage>=0);if(p){chairId=p.id;return;} /* someone sits in it awake: it's theirs */const c=allRaw().filter(p=>p.stage>=4&&(p.nap>0||st.night));c.sort((a,b)=>(b.nap>0)-(a.nap>0)||a.id-b.id);chairId=c.length?c[0].id:null;}
function baseY(){return onChair()?CHAIR_SEAT.y:SPOT[spotKey()].y;}
// NEEDS SHOW ONLY ON THE PLANT (Jackie, Nov 3; RULES.md 10): never on tools, curtains or the room. Each in a few clear steps, and back in steps once the need is met.
//  not enough water: fades to gray (dryLv 0-4, gradually: 16 tiny levels)            too much water: sits in a puddle, a bit soggy and droopy (puddleLv 0-3, dries over time)
//  not enough light: withers (witherLv 0-3: droops, hunches, curls in, colors a little dull)
//  too much light: burns (burnLv 0-3: squints, leans away, toasty scorched edges and tips; the tiny flame only in the extreme case)
// The looks are pre-made per image and level and cached; nothing blends live.
const DRY_FROM=.45,DRY_FULL=.9,DRY_FINE=4,DRY_HEAL=2,NEED_STEP=.5; // gray starts at thirst .45 and is full at .9, in quarter-steps (16 tiny levels, so it comes on gradually); watering brings the color back over 2 s; seconds per step back for the other looks
const LIGHT_OK_FOR=30,HI_WAIT=40,HI_FLAME=80,WITHER_AT=[6,30,60],BURN_AT=[40,60,80],PUDDLE_T=30; // light timings in game seconds x speed (lightBad); a puddle dries in 30 s
function stepLv(k,target,dt){st[k]=st[k]||0;if(target>=st[k]){st[k]=target;st[k+'T']=0;return;}st[k+'T']=(st[k+'T']||0)+dt;if(st[k+'T']>=NEED_STEP){st[k+'T']=0;st[k]--;}} // worse as it happens, better one step at a time
function needTick(dt){const dry=st.stage<0?0:Math.floor(clamp((st.needs.thirst-DRY_FROM)/(DRY_FULL-DRY_FROM),0,1)*4*DRY_FINE)/DRY_FINE; // 0-4 in quarter steps
 st.dryRaw=dry>=(st.dryRaw??st.dryLv??0)?dry:Math.max(dry,(st.dryRaw??st.dryLv??0)-dt*4/DRY_HEAL);st.dryLv=Math.ceil(st.dryRaw*DRY_FINE-1e-9)/DRY_FINE; // grays as thirst rises; color returns smoothly
 stepLv('witherLv',st.lightState==='lo'?WITHER_AT.filter(v=>st.lightBad>=v).length:0,dt);
 stepLv('burnLv',st.lightState==='hi'?BURN_AT.filter(v=>st.lightBad>=v).length:0,dt);
 st.puddleLv=st.over>0&&st.overType==='water'?Math.ceil(st.over/PUDDLE_T*3):0;}
function needK(){return Math.min(1,(st.dryLv||0)/4+(st.witherLv||0)*.1);} // how far colors drain: thirst grays, withering dulls a little
const TOASTY=[150,78,32],toastK=burn=>burn>0?.3+.15*burn:0;
const lookCache=new Map();
// one pre-made look per image + level: colors drained by k, and a crisp toasty band along the edges (wider at the top tips) when burned. The whole sprite, pot too (keep it simple); outlines stay black.
function needLook(im,k,burn){if(k<=0&&burn<=0)return im;const key=im.src+'|'+k.toFixed(2)+'|'+burn;let c=lookCache.get(key);if(c)return c;
 const W2=im.naturalWidth,H2=im.naturalHeight;c=document.createElement('canvas');c.width=W2;c.height=H2;const x=c.getContext('2d');x.drawImage(im,0,0);
 let d;try{d=x.getImageData(0,0,W2,H2);}catch(e){return im;}const a=d.data,tipY=H2*.45,R=Math.max(2,Math.round(H2*.008*burn)),Rt=Math.round(R*1.6),t=toastK(burn);
 let edge=null;if(burn>0){edge=new Uint8Array(W2*H2).fill(255);const q=[];for(let p=0;p<W2*H2;p++)if(a[p*4+3]<=40||a[p*4]+a[p*4+1]+a[p*4+2]<170){edge[p]=0;q.push(p);} // steps in from the outside and from the outlines, so leaf edges toast inside the black line
  for(let h=0;h<q.length;h++){const p=q[h],dd=edge[p];if(dd>=Rt)continue;const px=p%W2;for(const n of[px>0?p-1:-1,px<W2-1?p+1:-1,p-W2,p+W2])if(n>=0&&n<W2*H2&&edge[n]>dd+1){edge[n]=dd+1;q.push(n);}}}
 for(let p=0,i=0;p<W2*H2;p++,i+=4){if(a[i+3]===0)continue;const r=a[i],g=a[i+1],b=a[i+2];if(r+g+b<170)continue; // black outlines stay black
  const y=(p/W2)|0;
  let R1=r,G1=g,B1=b;if(k>0){const L=.3*r+.59*g+.11*b;R1+=(L-r)*k;G1+=(L-g)*k;B1+=(L-b)*k;}
  if(edge&&edge[p]<=(y<tipY?Rt:R)){R1+=(TOASTY[0]-R1)*t;G1+=(TOASTY[1]-G1)*t;B1+=(TOASTY[2]-B1)*t;}
  a[i]=Math.round(R1);a[i+1]=Math.round(G1);a[i+2]=Math.round(B1);}
 x.putImageData(d,0,0);if(lookCache.size>24)lookCache.clear();lookCache.set(key,c);return c;}
function needHex(hex,k,burn){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const L=.3*r+.59*g+.11*b,t=toastK(burn);r+=(L-r)*k;g+=(L-g)*k;b+=(L-b)*k;
 r+=(TOASTY[0]-r)*t;g+=(TOASTY[1]-g)*t;b+=(TOASTY[2]-b)*t;return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;} // the same steps for the code-drawn sprouts
function droopOff(){const n=Math.max(st.witherLv||0,Math.min(2,st.puddleLv||0));return n?Math.round(plantBoxRaw().h*.04*n):0;} // whole pixels: withering or soggy, the top sags
// petrifying: stony grey creeps in and cracks spread across the body (not the pot). seeded per species so cracks stay put
function drawCracks(b){const p=st.parch,W2=tintCv.width,H2=tintCv.height,body=H2*.72;
 tg.save();tg.globalCompositeOperation='source-atop';tg.beginPath();tg.rect(0,0,W2,body);tg.clip();
 tg.fillStyle=`rgba(150,140,130,${p*.45})`;tg.fillRect(0,0,W2,body);
 let seed=(st.species+1)*9301;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 const n=Math.ceil(p*9),U=Math.max(3,Math.round(W2/75));
 for(let c=0;c<9;c++){let x=W2*(.2+R()*.6),y=body*(.15+R()*.75);const len=10+Math.floor(R()*14);let dx=R()<.5?-1:1;
  if(c>=n){for(let i=0;i<len*3;i++)R();continue;}
  for(let i=0;i<len*Math.min(1,p*3);i++){tg.fillStyle='rgba(52,24,57,.85)';tg.fillRect(Math.round(x),Math.round(y),U,U);tg.fillStyle='rgba(255,240,210,.35)';tg.fillRect(Math.round(x)+U,Math.round(y),Math.max(1,U/2),U);
   const r=R();if(r<.45)y+=U;else if(r<.8)x+=dx*U;else{x+=dx*U;y+=U;}if(R()<.12)dx=-dx;}}
 tg.restore();}
const tintCv=document.createElement('canvas'),tg=tintCv.getContext('2d');
// TOPPERS = traits earned from treats (Jackie: cute, not scary). Worn on top of the head; journal lets you switch.
const TOPPER_IMG={'Orbiting sun':img('charm_sun.png'),'Moss sprout':img('charm_moss.png'),'Sugar crystal':img('charm_crystal.png'),'Pizza bow':img('charm_pizza.png'),'Lily-of-the-valley':img('charm_lily.png'),'Dino-skull clip':img('charm_skull.png'),'Heart-charm bow':img('charm_heart.png')}; // treat charms (Jackie's sheet)
const headCache=new Map();
// head top = climb straight up from the face until the body ends (so toppers sit on the head, not on leaf tips or curls)
function headTop(im,fu,fv){const key=im.src+'|'+fu+'|'+fv;let h=headCache.get(key);if(h)return h;const W2=im.naturalWidth,H2=im.naturalHeight;
 const u=Math.round(fu*W2);let v=Math.round(fv*H2);while(v>0&&(alphaAt(im,u,v-1)>60||alphaAt(im,u-4,v-1)>60||alphaAt(im,u+4,v-1)>60))v--;
 h={u:fu,v:v/H2};headCache.set(key,h);return h;}
function drawTopper(b,bob){const t=st.wear||((st.traits||[]).slice(-1)[0]);const ti=TOPPER_IMG[t];if(!ti||!ok(ti)||!b.img||st.stage<4)return;
 const aa=ageArt(),fp=st.stage>=6?(aa?aa.face:FACE[st.species]):[.5,.6],ht=headTop(b.img,fp[0],fp[1]),w=Math.round(b.w*(st.stage>=6?.26:.34)),h=Math.round(ti.naturalHeight*w/ti.naturalWidth);
 const x=Math.round(b.x+b.w*(ht.u+.14)-w/2),y=Math.round(b.y+b.h*ht.v-h*.45+bob);g.drawImage(ti,x,y,w,h);}
// POTS (Jackie): earned by doing things; swap in the journal. A new pot replaces only the old pot's pixels, so leaves draped over the rim stay in front.
const POTS=[
 {id:'drip',name:'Sunny drip pot',how:'grow up to a teen'},
 {id:'speckle',name:'Speckled stoneware',how:'grow up to an adult'},
 {id:'moon',name:'Moon-and-stars pot',how:'first night asleep in the armchair'},
 {id:'candy',name:'Candy-stripe pot',how:'read 5 fairy tales'},
 {id:'plaid',name:'Plaid pot',how:'read the almanac 5 times'},
 {id:'rainbow',name:'Rainbow pot',how:'read 5 nonsense poems'},
 {id:'eye',name:'All-seeing pot',how:'read the grimoire 5 times'},
 {id:'frost',name:'Frosted pot',how:'shake the snow globe 30 times'},
 {id:'gold',name:'Gold-dot pot',how:'cover all its needs on 5 days'},
 {id:'kintsugi',name:'Mended pot',how:'nurse it back after it got very thirsty'},
 {id:'basket',name:'Basket pot',how:'pet it 25 times'},
 {id:'lavender',name:'Lavender scallop pot',how:'give it 10 treats'}];
const POTS_ON=false; // pots paused (Jackie, Nov 3): every plant keeps its own starter pot
const POT_IMG={};POTS.forEach(p=>POT_IMG[p.id]=img('pot_'+p.id+'.png'));
function earnPot(id){if(!POTS_ON)return;st.pots=st.pots||[];if(st.pots.includes(id))return;st.pots.push(id);st.potOn=id;const p=POTS.find(q=>q.id===id);setTimeout(()=>{sfx('chime');burst('heart',plantBox().x+plantBox().w/2,plantBox().y+plantBox().h-40,3);say('A new pot: '+p.name+'! It\'s in the journal.',5);},700);save();}
function bump(k,n=1){st.cnt=st.cnt||{};st.cnt[k]=(st.cnt[k]||0)+n;return st.cnt[k];}
const potCache=new Map();
function rowSpan(data,W,y){let l=-1,r=-1;for(let x=0;x<W;x++)if(data[(y*W+x)*4+3]>40){if(l<0)l=x;r=x;}return [l,r];}
function lastRow(data,W,H){for(let y=H-1;y>=0;y--)for(let x=0;x<W;x++)if(data[(y*W+x)*4+3]>40)return y;return H-1;}
// pot shape: walk up from the bottom; the widest non-leaf row is the rim. Fit new pot rim-to-bottom onto old rim-to-bottom.
function isLeaf(D,i){return D[i+3]>40&&D[i+1]>D[i]+15&&D[i+1]>D[i+2]+25;}
function potShape(D,W,H){const sb=lastRow(D,W,H);const [l0,r0]=rowSpan(D,W,Math.max(0,sb-4));const cx=Math.round((l0+r0)/2);let best={w:r0-l0+1,y:sb-4,l:l0,r:r0};
 for(let y=sb-4;y>Math.max(0,sb-H*.6);y--){let l=cx,r=cx;if(D[(y*W+cx)*4+3]<=40||isLeaf(D,(y*W+cx)*4))break;while(l>0&&D[(y*W+l-1)*4+3]>40&&!isLeaf(D,(y*W+l-1)*4))l--;while(r<W-1&&D[(y*W+r+1)*4+3]>40&&!isLeaf(D,(y*W+r+1)*4))r++;
  if(r-l+1>=best.w){best={w:r-l+1,y,l,r};}}
 return {sb,rimY:best.y,l:best.l,r:best.r};}
function firstRow(D,W,H){for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(D[(y*W+x)*4+3]>40)return y;return 0;}
// POT AS ITS OWN PIECE (Jackie): split the sprite into plant (above the rim top), the old pot (dropped), and leaves draping below the rim top (kept in front).
// New pot: scaled evenly to the old rim width, its rim top on the old rim top; then everything shifts so the new pot's bottom sits on the floor.
function rimTop(D,W,o){let best=o.rimY;for(const x0 of[o.l+3,o.l+8,o.r-3,o.r-8]){let y=o.rimY;while(y>0&&D[((y-1)*W+x0)*4+3]>40&&!isLeaf(D,((y-1)*W+x0)*4))y--;best=Math.min(best,y);}return best;}
function potted(im,pim){const key=im.src+'|'+pim.src;let c=potCache.get(key);if(c)return c;
 const W2=im.naturalWidth,H2=im.naturalHeight;
 const sc0=document.createElement('canvas');sc0.width=W2;sc0.height=H2;const s0=sc0.getContext('2d');s0.drawImage(im,0,0);let D0;try{D0=s0.getImageData(0,0,W2,H2).data;}catch(e){return im;}
 const pc=document.createElement('canvas');pc.width=pim.naturalWidth;pc.height=pim.naturalHeight;const px=pc.getContext('2d');px.drawImage(pim,0,0);const pd=px.getImageData(0,0,pc.width,pc.height),P=pd.data;
 for(let i=0;i<P.length;i+=4)if(P[i]>180&&P[i+2]>150&&P[i+1]<120)P[i+3]=0;px.putImageData(pd,0,0);
 const o0=potShape(D0,W2,H2),n=potShape(P,pc.width,pc.height),nTop=firstRow(P,pc.width,pc.height);
 // size from the pot's BOTTOM row (never hidden by draping leaves/tentacles), then rim top = bottom minus the new pot's height
 const [bl,br]=rowSpan(D0,W2,Math.max(0,o0.sb-4)),[nbl,nbr]=rowSpan(P,pc.width,Math.max(0,n.sb-4));
 const k=(br-bl+1)/(nbr-nbl+1),rt=Math.round(o0.sb-(n.sb-nTop)*k),cx0=(bl+br)/2;
 const o={sb:o0.sb,rimY:rt,l:Math.round(cx0-(n.r-n.l+1)*k/2),r:Math.round(cx0+(n.r-n.l+1)*k/2)};
 const pw=Math.round(pc.width*k),ph=Math.round(pc.height*k),ox=Math.round(o.l-n.l*k),oy=Math.round(rt-nTop*k);
 // where the plant's base sat on the OLD pot (rim top); fall back to the typical starter-pot proportion if leaves hide it
 const bw=br-bl+1;let oldRt=rimTop(D0,W2,o0);const rr=(o0.sb-oldRt)/bw;if(!(rr>.85&&rr<1.35))oldRt=Math.round(o0.sb-1.05*bw);
 const delta=0; // >0: new pot is taller, everything lifts
 const band=Math.round((o.r-o.l)*.12),sink0=-Math.round(band*.6),shiftP=rt-oldRt+sink0; // move the plant so its base meets the NEW rim top
 const up=Math.max(0,-shiftP),down=0,H3=H2+up;
 c=document.createElement('canvas');c.width=W2;c.height=H3;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
 const dark=i=>D0[i+3]>40&&D0[i]+D0[i+1]+D0[i+2]<230&&!(D0[i+2]>D0[i]+40); // not the old pot's blue checks // keep the plant's dark outlines: a dark pixel touching leaf green counts as plant
 const LM=new Uint8Array(W2*H2);for(let q=0;q<W2*H2;q++)if(isLeaf(D0,q*4))LM[q]=1; // leaf mask, grown by 3px once (fast)
 const NL=new Uint8Array(W2*H2);for(let y=0;y<H2;y++)for(let x0=0;x0<W2;x0++)if(LM[y*W2+x0])for(let dy=-8;dy<=8;dy++){const Y=y+dy;if(Y<0||Y>=H2)continue;for(let dx=-8;dx<=8;dx++){const X=x0+dx;if(X>=0&&X<W2)NL[Y*W2+X]=1;}}
 const nearLeaf=(xx,y)=>NL[y*W2+xx]===1;
 const pc0=i=>(D0[i]>190&&D0[i+1]>150&&D0[i+2]>90&&D0[i]>=D0[i+1]&&D0[i+1]>=D0[i+2]&&D0[i]-D0[i+2]>30)||(D0[i+2]>D0[i]+40&&D0[i+2]>90);
 const PM=new Uint8Array(W2*H2);for(let q=0;q<W2*H2;q++)if(D0[q*4+3]>40&&pc0(q*4)&&!LM[q])PM[q]=1;
 const NP=new Uint8Array(W2*H2);for(let y=0;y<H2;y++)for(let x0=0;x0<W2;x0++)if(PM[y*W2+x0])for(let dy=-5;dy<=5;dy++){const Y=y+dy;if(Y<0||Y>=H2)continue;for(let dx=-5;dx<=5;dx++){const X=x0+dx;if(X>=0&&X<W2)NP[Y*W2+X]=1;}}
 // plant = anything that isn't the old pot: pot colors go, and dark outline pixels go only if they hug the pot and not a leaf
 const isPlant=(i,xx,y)=>{const q=y*W2+xx;return D0[i+3]>40&&!PM[q]&&NL[q]===1;}; // leaf plus its own outline/highlights (within 8px of leaf green), never old-pot colors
 const plant=new Uint8ClampedArray(D0.length),drape=new Uint8ClampedArray(D0.length);
 for(let y=0;y<H2;y++)for(let xx=0;xx<W2;xx++){const i=(y*W2+xx)*4;if(D0[i+3]<=40)continue;const inMouth=y<rt&&y>=rt-band&&xx>=o.l&&xx<=o.r&&!isPlant(i,xx,y);if(inMouth)continue; // old pot's opening/back rim
 const tgt=y<rt?plant:(isPlant(i,xx,y)?drape:null);if(tgt){tgt[i]=D0[i];tgt[i+1]=D0[i+1];tgt[i+2]=D0[i+2];tgt[i+3]=D0[i+3];}}
 const lay=a=>{const t=document.createElement('canvas');t.width=W2;t.height=H2;t.getContext('2d').putImageData(new ImageData(a,W2,H2),0,0);return t;};
 const py=down; // plant/drape offset inside the canvas (shifted down if the new pot is shorter)
 const sink=sink0; // plant sits a bit higher, on top of the rim (Jackie) // settle the plant down into the new pot so no gap shows under its base
 // pot sits BEHIND the monster (Jackie): pot first, then the plant, then draping leaves
 // pot downscale: averaged (not nearest-neighbor) so stripes, wicker and cracks don't stair-step; edges hardened after
 const sp=document.createElement('canvas');sp.width=pw;sp.height=ph;const spx=sp.getContext('2d');spx.imageSmoothingEnabled=true;spx.imageSmoothingQuality='high';
 let tmp=pc,tw=pc.width,th=pc.height;while(tw/2>pw){const h2=document.createElement('canvas');h2.width=Math.round(tw/2);h2.height=Math.round(th/2);const hx=h2.getContext('2d');hx.imageSmoothingEnabled=true;hx.imageSmoothingQuality='high';hx.drawImage(tmp,0,0,h2.width,h2.height);tmp=h2;tw=h2.width;th=h2.height;}
 spx.drawImage(tmp,0,0,pw,ph);const spd=spx.getImageData(0,0,pw,ph),SP=spd.data;for(let q=3;q<SP.length;q+=4)SP[q]=SP[q]>110?255:0;spx.putImageData(spd,0,0);
 x.drawImage(sp,ox,oy+up);x.drawImage(lay(plant),0,shiftP+up);x.drawImage(lay(drape),0,shiftP+up);
 c.naturalWidth=W2;c.naturalHeight=H3;c.complete=true;c.src=key;c.lift=-shiftP;if(potCache.size>60)potCache.clear();potCache.set(key,c);return c;}
function drawPlant(){let b=plantBox();const MO=moveOff();b={...b,x:b.x+(st.id===ACT?Math.round(BOING.ox):0)+MO[0]};const bob=((st.stage>=4&&!st.night)?Math.round(Math.sin(T*2.2)*1.5):0)+(st.id===ACT?Math.round(BOING.oy):0)+MO[1]+chompDip();
 if(!b.img){if(b.seed)drawSeedPot(b);return b;}
 if(!ok(b.img)||b.w<1||b.h<1)return b; // still loading
 const asleep=st.nap>0||st.night;
 if(asleep&&st.stage>=4&&st.stage<=5&&ok(BABY_SLEEP[st.species])){const si=BABY_SLEEP[st.species],o=SLEEP_OFF[st.species];const k=b.scale||1,line=b.y+b.h-padPx(b.img,b.h),h2=si.naturalHeight*k;b={...b,img:si,x:b.x+o[0]*k,y:line-h2+padPx(si,h2),w:si.naturalWidth*k,h:h2};} // sleeping picture: same pot line, its own real bottom
 const nk=needK();
 const pim=POTS_ON&&st.potOn&&POT_IMG[st.potOn],src=(pim&&ok(pim))?potted(b.img,pim):b.img;
 const sY=b.h/b.img.naturalHeight,floorY=b.y+b.h,cH=Math.round(src.naturalHeight*sY),drawY=floorY-cH;
 if(src.lift){b={...b,y:b.y-Math.round(src.lift*sY)};} // plant moves with the new pot's rim (faces/toppers follow)
 tintCv.width=Math.ceil(b.w);tintCv.height=cH;tg.imageSmoothingEnabled=false;tg.clearRect(0,0,tintCv.width,tintCv.height);
 tg.drawImage(needLook(src,nk,st.burnLv||0),0,0,b.w,cH);
 const evil=clamp(-st.ge,0,1),good=clamp(st.ge,0,1);
 if(evil>.05||good>.05){tg.globalCompositeOperation='source-atop';const fadeK=1-nk;tg.fillStyle=evil>good?`rgba(108,97,164,${evil*.38*fadeK})`:`rgba(245,171,107,${good*.18*fadeK})`;tg.fillRect(0,0,tintCv.width,tintCv.height);tg.globalCompositeOperation='source-over';} // a parched plant is fully gray, personality tint too
 // petrifying cracks removed (Jackie: too scary); thirst = fading to gray only
 const lean=leanOff(),droop=droopOff();if(!lean&&!droop)g.drawImage(tintCv,Math.round(b.x),Math.round(drawY)+bob);
 else{const tw=tintCv.width,th=tintCv.height,cut=Math.round(th*.72),X=Math.round(b.x),Y=Math.round(drawY)+bob; // leaning or drooping: the pot stays, the body shifts in whole-pixel steps, most at the top
  g.drawImage(tintCv,0,cut,tw,th-cut,X,Y+cut,tw,th-cut);for(let s=2;s>=0;s--){const y0=Math.round(cut*s/3),y1=Math.round(cut*(s+1)/3),f=(3-s)/3;g.drawImage(tintCv,0,y0,tw,y1-y0,X+Math.round(lean*f),Y+y0+Math.round(droop*f),tw,y1-y0);}
  b={...b,x:b.x+lean,y:b.y+droop};} // face and charm move with the head
 if(st.stage>=6)drawElderFace(b,bob);
 drawTopper(b,bob);
 return b;}
// mouth set B (Jackie's second sheet): 1 w,2 big open+tongue,3 blep,4 sly fang smirk,5 blushing smile,6 small cat w,7 fang grin+tongue,8 flat line,9 blushing frown,10 w+fang,11 shark grin,12 heart tongue
const MOUTH_BY={'Lawful Good':5,'Neutral Good':1,'Chaotic Good':12,'Lawful Neutral':8,'True Neutral':6,'Chaotic Neutral':3,'Lawful Evil':4,'Neutral Evil':10,'Chaotic Evil':11};
function mouthNow(){const fm=feedMouth();if(fm)return fm;if(st.spookT>0)return 11; /* the spooky face */if(st.grump>0)return 9;if(grinning())return 10;const sad=st.lightState!=='ok'||st.needs.thirst>.8||st.needs.attention>.6;if(sad)return 9;return MOUTH_BY[align()]||6;}
function drawElderFace(b,bob){ // face kit: eyes = gene, mouth = disposition/mood. drawn at the same scale as the body
 const aa=ageArt(),f=aa?aa.face:FACE[st.species],sc=TARGET_H[st.stage>=8?'adult':'teen']/601*.54*(b.dk||1); /* 10% smaller again (Jackie) *//* faces 40% smaller (Jackie) */const cx=b.x+b.w*f[0],cy=b.y+b.h*f[1]+bob;
 const closed=st.nap>0||st.night||blink>0||st.listen>0||squinting();
 const e=(st.eye|0)%16,eo=EYE_O[e],ec=EYE_C[e],m=MOUTH[mouthNow()-1];
 if(!ok(eo)||!ok(ec)||!ok(m))return;
 const eh=eo.naturalHeight*sc,ew=eo.naturalWidth*sc,ey=cy-eh/2-40*sc;
 if(closed){const w=ec.naturalWidth*sc,h=ec.naturalHeight*sc;g.drawImage(ec,Math.round(cx-w/2),Math.round(ey+eh/2-h/2),Math.round(w),Math.round(h));}
 else g.drawImage(eo,Math.round(cx-ew/2),Math.round(ey),Math.round(ew),Math.round(eh));
 const mw=m.naturalWidth*sc,mh=m.naturalHeight*sc;g.drawImage(m,Math.round(cx-mw/2),Math.round(ey+eh+8*sc),Math.round(mw),Math.round(mh));}
function drawSeedPot(b){ // Jackie's seedling frames; thirst grays and sun toasts them like any plant (needLook), and a leaning sprout shifts its top while the pot stays
 const im=needLook(b.seed,needK(),st.burnLv||0),X=Math.round(b.x),Y=Math.round(b.y),w=Math.round(b.w),h=Math.round(b.h),lean=st.stage>=1?Math.round(leanOff()/2):0;g.save();g.imageSmoothingEnabled=false;
 if(!lean)g.drawImage(im,X,Y,w,h);
 else{const nh=b.seed.naturalHeight,cut=nh-172; // the sprout above the pot's rim moves (the pot is the frame's bottom 172 rows), the pot doesn't
  g.drawImage(im,0,cut,b.seed.naturalWidth,nh-cut,X,Y+Math.round(cut*b.seedK),w,h-Math.round(cut*b.seedK));g.drawImage(im,0,0,b.seed.naturalWidth,cut,X+lean,Y,w,Math.round(cut*b.seedK));}
 g.restore();}
/* ---------- growing up (Tamagotchi time, see GROW_FOR in core.js) ---------- */
function growHappy(){return !want('thirst')&&!want('attention')&&(st.night||st.stage<1||st.lightState==='ok');}
function growTick(dt){if(st.stage<0||st.stage>=8)return;st.timer=(st.timer||0)+dt*gameSpeed()/2*(growHappy()?1:GROW_SLOW);
 if(st.timer>=GROW_FOR[st.stage]){const t=stageUp();tell(t,{kind:'important',who:st.id});}}
// one age up, right now; returns what to say. The sound and the bigger body are the proof.
function stageUp(){st.stage=NEXT[st.stage]??8;st.timer=0;st.walk=null;const W=()=>who();
 if(st.stage===1){sfx('soil');return 'A sprout!';}
 sfx('chime');sfx('boing');
 if(st.stage===4){const had=!!st.name;if(!had)st.name=makeName(st);return had?W()+' opens its eyes!':'Hello, '+st.name+'! Its eyes are open.';}
 if(st.stage===6){earnPot('drip');return W()+' is a teen now, with big ideas and a bigger pot.';}
 earnPot('speckle');st.adultDay=st.day;return W()+' is all grown up and ready to eat everything!';}
// away: half rate, at most one age per absence (the rest of the time away is let go); returns what happened, by name
function catchUp(sec){const said=[];eachPlant(()=>{if(st.stage<0||st.stage>=8)return;const need=GROW_FOR[st.stage]-(st.timer||0),gain=sec*GROW_SLOW;
  if(gain<need){st.timer=(st.timer||0)+gain;return;}const n=nameOf(st,true),to=NEXT[st.stage]??8;stageUp();
  said.push(to===1?n+'\'s seed sprouted!':to===4?n+' opened its eyes!':to===6?n+' grew into a teen!':n+' is all grown up!');});return said;}
function want(n){if(st.stage<0)return false;if(st.stage<4)return n==='thirst'&&st.needs.thirst>.6;return st.needs[n]>.6;}
function plantUpdate(dt){const sp=gameSpeed();quirkMotion(dt);
 st.listen=Math.max(0,st.listen-dt);st.over=Math.max(0,st.over-dt);st.nap=Math.max(0,st.nap-dt);
 if(st.mv)st.mv.t+=dt;if(st.grump>0)st.grump-=dt;
 needTick(dt); // real seconds, so looks come back over a couple of seconds at any speed
 growTick(dt); // growing goes on while it sleeps
 if(st.night)return;
 scootTick(dt);quirkTick(dt);if(Math.random()<dt*.2)titleCheck();
 if(st.dayT>=.5&&st.goldenSaid!==st.day){st.goldenSaid=st.day;tell('Get out your cameras, it\'s golden hour.',{kind:'teach',key:'golden'});}
 const k=dt*sp/60;
 st.needs.thirst=clamp(st.needs.thirst+k*.11/3*(st.glare===2?2:1),0,1); // a third as fast as the calm-down rate (Jackie, Nov 4): at normal speed, gray starts after ~6 min, thirsty ~8 min, fully gray ~12 min; only the little-flame case dries it twice as fast
 if(st.needs.thirst>=.95)st.wasParched=1;if(st.wasParched&&st.needs.thirst<.1&&st.stage>=4){st.wasParched=0;earnPot('kintsugi');}
 if(st.stage>=4){st.parch=st.needs.thirst>=.95?clamp((st.parch||0)+k*.35,0,1):st.needs.thirst<.5?clamp((st.parch||0)-dt*.08,0,1):(st.parch||0);} // petrifying cracks (Jackie): slow to form, heal after watering
 if(st.stage>=4){st.full=clamp((st.full||0)-k*.25,0,1);st.needs.hunger=0;st.needs.attention=clamp(st.needs.attention+k*.26,0,1);}
 const li=spotInfo(spotKey());st.light=li.L;
 const ls=st.stage<1?'ok':lightFeel(li,st.pref);
 if(ls!=='ok')st.lightBad+=dt*sp;else{if(st.lightState!=='ok'){met('light');sfx('boing');}st.lightBad=0;} // moving it out fixes it right away
 // the right light counts for the day once it has spent a little while in it (LIGHT_OK_FOR game s, ~15 s at normal speed), not only when you fix bad light
 if(ls==='ok'&&st.stage>=1&&!st.night&&!st.met.light){st.lightGood=(st.lightGood||0)+dt*sp;if(st.lightGood>=LIGHT_OK_FOR)met('light');}
 st.lightState=st.lightBad>(ls==='hi'?HI_WAIT:6)?ls:'ok'; // too much light takes a while to bother it
 st.glare=st.lightState!=='hi'?0:li.sun&&st.pref==='night'&&st.lightBad>HI_WAIT+HI_FLAME?2:1; // 1 = squint + lean away; 2 = the little flame, only a night-lover left in midday sun a long while
 if(st.glare===2&&Math.random()<dt*.25)sfx('fsss');
 for(const n of['thirst','attention'])if(want(n)){
  if(Math.random()<dt*.06)sfx(n==='thirst'?'crinkle':n==='hunger'?'rumble':'hum');
  if(!st.taught[n]){tell(n==='attention'?'A little frown: '+who()+' is lonely. Pet it or read to it.':TEACH[n],{kind:'teach',key:n,who:st.id});sfx(n==='thirst'?'crinkle':n==='hunger'?'rumble':'hum');}}
 if(st.lightState!=='ok'){if(Math.random()<dt*.05)sfx('hmm');}
 // no hints on objects (RULES.md 10): no carafe wobble or sparkle, curtain sway, window wobble, bouncing book or jar
}
/* ---------- it moves itself (Jackie: "sit back in the room if it wants to") ----------
   A grown plant that's been in the wrong light for a while shuffles, in whole-pixel steps, to the nearest floor spot that suits it. */
function squinting(){return st.lightState==='hi'&&Math.floor(T*1.5)%3!==0;} // eyes shut against the light, peeking now and then (frame swap)
function leanOff(){if(st.lightState!=='hi')return 0;const s=SPOT[spotKey()],i=spotInfo(spotKey()),from=i.sun?WINDOW_LIGHT.x:i.under?i.under.x:WINDOW_LIGHT.x;const n=Math.max(4,Math.round(plantBoxRaw().h*.025));return s.x<from?-n:n;} // whole pixels, away from the light; bigger plants lean further
function scootTick(dt){if(st.float||stageGroup()==='seed'||spotKey()!=='free'||st.nap>0||(drag.on&&st.id===drag.id))return;
 if(st.walk){const w=st.walk,f=st.free,sp=Math.max(1,Math.round(90*dt));f.x+=clamp(w.x-f.x,-sp,sp);f.y+=clamp(w.y-f.y,-Math.ceil(sp/2),Math.ceil(sp/2));
  if(f.x===w.x&&f.y===w.y){st.walk=null;sfx('pop');}return;}
 if(st.lightState==='ok'||st.lightBad<(st.lightState==='hi'?HI_WAIT+50:70))return; /* plants on the floor move off once it's been withering or burning a good while */
 let best=null,bd=1e9;
 for(let x=FLOOR_X0;x<=FLOOR_X1;x+=40)for(const y of [FLOOR_FRONT,860,FLOOR_BACK]){if(lightFeel(lightInfo(x,y),st.pref)!=='ok'||!freeClear(x,y))continue;const d=Math.abs(x-st.free.x)+Math.abs(y-st.free.y);if(d<bd){bd=d;best={x,y};}}
 if(best){st.walk={...best,why:st.lightState};st.lightBad=0;}}

/* ---------- PERSONALITY that does things (Jackie: "make it more fun") ----------
   Research notes: Animal Crossing personalities change what villagers say, do and how they treat others; Black & White creatures
   change with alignment; Cult of the Lamb traits flip reactions (what one hates, another loves); Petz used a fixed personality
   sheet + "constrained randomness", never punished the player, and aimed for every interaction to give you a story to tell. */
function pers(){return {g:st.ge>.33?'good':st.ge<-.33?'evil':'',l:st.lc>.33?'lawful':st.lc<-.33?'chaotic':''};}
/* NAMES IN CAPTIONS (Jackie, Nov 4): with the cat and often two monsters in the room, a caption never says a bare "it" about a monster:
   it names the monster first ("Pip's full. Maybe later.", "Pip loves it."). Seeds and sprouts have no name yet: "The seed", "The sprout". */
function who(){return nameOf(st,true);} // the monster this caption is about
function nameOf(q,cap){const n=firstName(q)||((q.stage<1?'the seed':q.stage<4?'the sprout':'the '+NAMES[q.species]));return cap?n.charAt(0).toUpperCase()+n.slice(1):n;}
function whose(){const w=who();return w+(w.endsWith('s')?'\'':'\'s');} // Pip's, Bonks'
// every monster in the room, named: "Pip", "Pip and Mortie"; plural = more than one
function allNames(cap){const P=allRaw().filter(q=>q.stage>=0),n=P.map((q,i)=>nameOf(q,cap&&i===0));return {text:n.length>1?n.slice(0,-1).join(', ')+' and '+n[n.length-1]:n[0]||'',plural:n.length>1};}
function plantsWord(){const P=allRaw().filter(q=>q.stage>=4);return P.length===1&&firstName(P[0])?firstName(P[0]):P.length>1?'your plants':'your plant';}
/* VOICE (Jackie, Nov 7): every line says something you can SEE right then. Each line is 'text|action': the action happens the moment
   the line is picked (nod, wiggle, grin, hop toward someone, hearts, drops on the floor...). Lines with nothing visible behind them were cut.
   Personality lines are unchanged in spirit: sweet, mischievous, tidy, wiggly, easygoing. */
const VOICE={
 pet:{good:['{W} leans into your hand.|lean','{W} hums a tiny thank-you, eyes closed.|hum'],evil:['{W} pretends not to like it. It likes it.|grin','{W} lets you, this once.|nod'],
  lawful:['{W} gives a small, proper nod.|nod','{W} straightens up afterwards, very proper.|stretch'],chaotic:['{W} wiggles every leaf at once.|wiggle','{W} bounces right back for more.|bounce'],'':['{W} wiggles happily.|wiggle']},
 water:{good:['{W} sighs happily, eyes closed.|hum','{W} sends you a little heart.|hearts'],evil:['{W} slurps it down. Mwah-ha-hah.|grin','{W} drinks like a tiny villain.|grin'],
  lawful:['{W} drinks exactly half, then the other half.|sips'],chaotic:['{W} splashes some on the floor on purpose.|splash'],'':['{W} goes gulp gulp.|sips']},
 greet:{good:'{W} sends you a little heart.',evil:'{W} gives you a sly little grin.',lawful:'{W} gives you a small, proper nod.',chaotic:'{W} does a happy wiggle.','':'{W} perks up.'}, /* Nov 7: greetings are things the monster does right then (greetNow in start.js) */
 idle:{good:['{W} hums to itself, eyes closed.|hum','{W} leans over to watch '+'{C}'+' sleep.|watchcat'],evil:['{W} grins at nothing in particular.|grin','{W} is plotting something. Look at that grin.|grin'],
  lawful:['{W} tidies its leaves into neat rows.|tidy','{W} gives the room a proper nod.|nod'],chaotic:['{W} does a little dance for no reason.|dance','{W} hops in place, just because.|bounce'],'':['{W} bops along to nothing.|bounce']}};
// the actions behind the lines (whole-pixel moves and the game's own marks), run on the monster the line is about
function voiceAct(a){const b=plantBox(),cx=b.x+b.w/2;
 if(a==='lean'){st.bonkT=.5;st.bonkDir=mx<cx?-1:1;}
 else if(a==='hum'){st.listen=2;sfx('hum');}
 else if(a==='grin'){st.spookT=1.6;}
 else if(a==='nod'){st.nodT=.45;}
 else if(a==='stretch'){st.nodT=.45;st.bonkT=0;}
 else if(a==='wiggle'||a==='tidy'){st.tidyT=1.2;}
 else if(a==='dance'){st.tidyT=1.6;setTimeout(()=>plantBoing(cx),400);}
 else if(a==='bounce'){plantBoing(cx);}
 else if(a==='hearts'){burst('heart',cx,b.y-20,3);}
 else if(a==='sips'){st.nodT=.3;setTimeout(()=>{st.nodT=.3;sfx('slurp');},500);sfx('slurp');}
 else if(a==='splash'){burst('drop',cx-50,baseY()-40,10);setTimeout(()=>burst('drop',cx+50,baseY()-40,10),350);} // two splashes, easy to see
 else if(a==='watchcat'){st.bonkT=.5;st.bonkDir=cat.x<cx?-1:1;st.listen=1.2;}}
function voiceOK(t){const a=t.split('|')[1];if(a==='watchcat')return cat.state==='sleep'&&cat.x>-500;return true;} // only true lines: no watching a cat that isn't asleep
const LINE_HIST={};
function line(ev){const p=pers(),keys=[p.g,p.l].filter(Boolean);if(!keys.length)keys.push('');const fmt=t=>t.replace('{W}',who()).replace('{C}',catName());
 const all=[...new Set(keys.flatMap(k=>[].concat(VOICE[ev][k]||[])).filter(voiceOK).map(fmt))],h=ev==='greet'?(st.greetSeen=st.greetSeen||[]):(LINE_HIST[ev]=LINE_HIST[ev]||[]),fresh=all.filter(t=>!h.includes(t)&&!capRecent(t)); // greetings are remembered in the save, so they don't repeat visit after visit
 if(!fresh.length){if(ev==='greet')h.splice(0,h.length-1);return '';}const t=fresh[Math.floor(Math.random()*fresh.length)];h.push(t);if(h.length>(ev==='greet'?5:15))h.shift();
 const [text,act]=t.split('|');if(act)voiceAct(act);return text;} // the action happens as the line is said
function notice(q,desc){st.quirks=st.quirks||{};if(!st.quirks[q]){st.quirks[q]=desc;return true;}return false;}
const QUIRK_TXT={moon:'Chaotic: sometimes bounces around in moon gravity until you bring it back down.',bonk:'Chaotic: bonks things around the room for fun.',wander:'Chaotic: wanders to a new spot when it gets bored.',tidy:'Lawful: tidies its leaves; loves being watered at its usual time.',
 usual:'Lawful: loves its usual treat.',novel:'Chaotic: loves a treat it hasn\'t had lately.',catfriend:'Good: keeps the cat company (the cat warms up to you faster).',share:'Good: shares its happiness with the other plants.',
 boo:'Evil: makes spooky faces at the cat (the cat is unimpressed).',dark:'Evil: loves dark treats, eats wholesome ones politely.',sweet:'Good: loves wholesome treats, eats dark ones politely.'};
function quirkTick(dt){if(st.stage<4||st.nap>0||st.night||st.float)return;st.quirkT=(st.quirkT??rnd(25,50))-dt;if(st.quirkT>0)return;st.quirkT=rnd(45,95);
 const p=pers(),b=plantBox(),cx=b.x+b.w/2,opts=[];
 if(p.l==='chaotic'){opts.push('bonk');if(stageGroup()!=='seed'&&spotKey()==='free')opts.push('wander');if(st.lc<=-.6&&spotKey()==='free')opts.push('moon');}
 if(p.l==='lawful')opts.push('tidy');
 if(p.g==='good'){if(cat.state==='sleep'&&Math.abs(cat.x-cx)<650)opts.push('catfriend');if(allRaw().some(q=>q.id!==st.id&&q.stage>=4&&q.needs.attention>.3))opts.push('share');}
 if(p.g==='evil'&&cat.state==='sleep'&&cat.spot!=='byplant'&&Math.abs(cat.x-cx)<750)opts.push('boo');
 if(!opts.length){if(ambientOK()&&Math.random()<.35)tell(line('idle'),{kind:'ambient',who:st.id});return;}
 const q=opts[Math.floor(Math.random()*opts.length)];let t='';doMove();
 if(q==='bonk'){let best=null,bd=480;for(const f of FP){const d=Math.hypot(f.x+f.w/2-cx,f.y+f.h/2-(b.y+b.h*.4));if(d<bd){bd=d;best=f;}}
  st.bonkT=.5;st.bonkDir=best&&best.x+best.w/2<cx?-1:1;if(best){const bb=best;setTimeout(()=>fidgetPoke(bb.x+bb.w/2,bb.y+bb.h/2),250);t=who()+' bonked the '+({ammonite:'fossil shell',armillary:'brass globe',bookstack:'book stack',butterflies:'butterfly picture',catpic:'cat picture',cratebook:'book on the crate',drum:'drum machine',flowerpic:'flower painting',glass:'glass',lockbox:'little pink box',moonbox:'moon box',moonpanel:'moon picture',petbed:'cat bed',pillow:'pillow',radio:'radio',shelfplant:'shelf plant',snail:'wind-up snail'}[best.n]||'something')+'. Just because.';}else t=line('idle');}
 else if(q==='wander'){const c=[];for(let x=FLOOR_X0;x<=FLOOR_X1;x+=60)for(const y of [FLOOR_FRONT,850,FLOOR_BACK]){if(lightFeel(lightInfo(x,y),st.pref)==='ok'&&freeClear(x,y)&&Math.abs(x-st.free.x)>150)c.push({x,y});}
  if(c.length){st.walk={...c[Math.floor(Math.random()*c.length)],why:'bored'};t=who()+' got bored and wandered off somewhere new.';}else{plantBoing(cx);t=line('idle');}}
 else if(q==='tidy'){st.listen=1.6;st.tidyT=1.2;t=who()+' tidies its leaves into neat rows.';}
 else if(q==='catfriend'){for(let i=0;i<3;i++)setTimeout(()=>burst('heart',cx+(cat.x-cx)*(i+1)/4,Math.min(b.y,cat.y)-40,1),i*200);trustGain(.01);t=who()+' is'+' keeping '+catName()+' company. '+catName()+' seems to like it.';}
 else if(q==='share'){const o=allRaw().find(q2=>q2.id!==st.id&&q2.stage>=4&&q2.needs.attention>.3);o.needs.attention=Math.max(0,o.needs.attention-.2);msSet(st,'share:'+o.id);if(o._pos)for(let i=0;i<3;i++)setTimeout(()=>burst('heart',cx+(o._pos.x-cx)*(i+1)/4,b.y,1),i*200);t=who()+' is'+' cheering up '+nameOf(o)+'.';}
 else if(q==='boo'){st.spookT=1.8;st.bonkT=.5;st.bonkDir=cat.x<cx?-1:1;sfx('hmm');catFeel(st.id,'hmph');cat.state='wake';cat.t=1.2;t=who()+' made a spooky face at '+catName()+'. '+catName()+' is unimpressed and leaves.';}
 else if(q==='moon'){st.walk=null;st.float={h:0,vh:rnd(260,320),vx:(Math.random()<.5?-1:1)*rnd(40,70)};sfx('boing');t=who()+' floats off in moon gravity! Drag '+who()+' back down to earth.';}
 const first=notice(q,QUIRK_TXT[q]);if(t)tell(t,first?{kind:'teach',key:'quirk_'+q,who:st.id}:{kind:'ambient',key:'quirk:'+q+':'+st.id,who:st.id});} // a new quirk is explained once ever; after that it's chatter

/* ---------- born with a nature; visible moves; friends and bickering; titles (Nov 3, no new art) ---------- */
function temperament(){const g=st.nge||0,l=st.nlc||0,a=[];if(g>.15)a.push('sweet');if(g<-.15)a.push('a little mischievous');if(l>.15)a.push('tidy');if(l<-.15)a.push('wiggly');return a.length?'It seems '+a.join(' and ')+'.':'It seems easygoing.';}
// one signature move per personality, all whole-pixel offsets (DS rule): chaotic hop, lawful bow, good sway, evil grin + shiver
const MOVES={hop:[0,-6,-12,-16,-16,-12,-6,0,-4,0],bow:[0,2,4,6,6,6,4,2,0],sway:[0,-3,-5,-5,-3,0,3,5,5,3,0],grin:[0,2,-2,2,-2,0,0,0,0,0,0,0],bob:[0,-2,-3,-2,0]};
function sigMove(){const p=pers();return p.l==='chaotic'?'hop':p.l==='lawful'?'bow':p.g==='good'?'sway':p.g==='evil'?'grin':'bob';}
function doMove(k){st.mv={k:k||sigMove(),t:0};}
function moveOff(){const m=st.mv;if(!m)return [0,0];const f=Math.floor(m.t/.07),seq=MOVES[m.k];if(f>=seq.length){st.mv=null;return [0,0];}const v=seq[f];return (m.k==='sway'||m.k==='grin')?[v,0]:[0,v];}
function grinning(){return st.mv&&st.mv.k==='grin';}
// friends and bickering: same side on an axis = friends; opposite sides = they bicker (then always make up: grace)
function rel(a,b){const s=v=>v>.33?1:v<-.33?-1:0;let f=0,x=0;for(const k of['ge','lc']){const p=s(a[k]),q=s(b[k]);if(p&&q){if(p===q)f++;else x++;}}return x>f?'bicker':f>0?'friends':'fine';}
function relWord(a,b){const r=rel(a,b);return r};
let socialT=rnd(40,70);
function socialTick(dt){if(st.night)return;const P=allRaw().filter(q=>q.stage>=4&&q.nap<=0&&q._pos);if(P.length<2){socialT=rnd(40,70);return;}socialT-=dt;if(socialT>0)return;socialT=rnd(60,110);
 const a=P[Math.floor(Math.random()*P.length)],others=P.filter(q=>q!==a),b=others[Math.floor(Math.random()*others.length)],r=rel(a,b),n=q=>nameOf(q),cap=t=>t.charAt(0).toUpperCase()+t.slice(1);
 const both=(f)=>{for(const q of[a,b]){const i=(st.others||[]).indexOf(q);if(i<0)f();else{swapIn(i);try{f();}finally{swapIn(i);}}}};
 const hearts=()=>{for(let i=0;i<4;i++)setTimeout(()=>burst('heart',a._pos.x+(b._pos.x-a._pos.x)*(i+.5)/4,Math.min(a._pos.y,b._pos.y)-300,1),i*180);};
 if(r==='bicker'){both(()=>{st.grump=6;doMove('grin');});sfx('hmm');
  msSet(a,'bicker:'+b.id);msSet(b,'bicker:'+a.id);setTimeout(()=>{msSet(a,'madeup:'+b.id);msSet(b,'madeup:'+a.id);},6500);
  const said=tell(cap(n(a))+' and '+n(b)+' are bickering. Grumpy faces all around.',{kind:'ambient',key:'bicker'});
  setTimeout(()=>{hearts();sfx('chime');if(said)tell('…and they made up. They always do.',{kind:'info',key:'madeup'});},6500);bumpRel(a,b,-1);}
 else if(r==='friends'){const p=pers.call(null);both(()=>doMove());hearts();sfx('giggle');
  const both2=(k,v)=>a[k]*v>0.33&&b[k]*v>0.33;
  const t=both2('lc',-1)?'egging each other on':both2('lc',1)?'bowing politely to each other':both2('ge',1)?'swaying together':both2('ge',-1)?'scheming together':'getting along';
  msSet(a,'friends:'+b.id);msSet(b,'friends:'+a.id);tell(cap(n(a))+' and '+n(b)+' are friends!',{kind:'ambient',key:'friends'});bumpRel(a,b,1);}
 else{both(()=>doMove('bob'));}}
function msSet(q,k){q.ms=q.ms||{};q.ms[k]=q.ms[k]||(st.day||1);} // a milestone, remembered with the day it happened
function bumpRel(a,b,v){for(const[x,y]of[[a,b],[b,a]]){x.rel=x.rel||{};x.rel[y.id]=(x.rel[y.id]||0)+v;}}
// extremes earn a title + a one-time celebration
const TITLES={good:'Little saint',evil:'Little menace',lawful:'Stickler',chaotic:'Wild child'};
function titleCheck(){const out=[];if(st.ge>.85)out.push('good');if(st.ge<-.85)out.push('evil');if(st.lc>.85)out.push('lawful');if(st.lc<-.85)out.push('chaotic');
 st.titles=st.titles||[];const id=st.id;for(const t of out)if(!st.titles.includes(t)){st.titles.push(t);setTimeout(()=>withPlant(id,()=>{const b=plantBox();doMove();burst('heart',b.x+b.w/2,b.y-30,4);sfx('chime');tell(who()+' is officially a '+TITLES[t]+'!',{kind:'important',who:id});}),2500);}}
/* ---------- a second seed, and breeding ---------- */
function addPlant(p){st.others=st.others||[];st.others.push(p);swapIn(st.others.length-1);ACT=st.id;} // the new one becomes the one you're tending
/* A SEED FROM TWO ADULTS (Jackie, Nov 8): nothing appears out of nowhere. The bubble names both parents and asks where the seed goes:
     Send it to Slowmallow: it flies off on a paper airplane and both parents stay.
     Keep it here: both parents head off the next morning (moveOut) and the seed is planted on the windowsill.
   Tapping away doesn't decide anything: the bubble comes back a little later. Waiting offers live in the save (st.seedOffer). */
const SEED_REASK=15;let offerAt=0; // seconds before a dismissed bubble comes back
function offerTick(){const o=st.seedOffer;if(!o||bubble||T<offerAt||capBusy()||st.night||document.querySelector('.screen'))return; // never while you're busy, in a menu, or at night
 const [a,b]=o.ids.map(id=>allRaw().find(q=>q.id===id));if(!a||!b){st.seedOffer=null;return;} // a parent is gone (debug): nothing to decide
 offerAt=T+SEED_REASK;sfx('chime');openBubble(SPOT.sill.x-150,SPOT.sill.y-250,esc(nameOf(a,true))+' and '+esc(nameOf(b,true))+' made a seed together!<br><button data-k="s">Send it to Slowmallow</button><button data-k="k">Keep it here</button>',
  {s:()=>{closeBubble();seedSend();},k:()=>{closeBubble();seedKeep();}});}
// PAYMENT ISN'T DECIDED (Jackie): whatever Slowmallow gives for a seed goes here
function seedSentHook(seed){st.seedsSent=(st.seedsSent||0)+1;}
let seedFly=null; // when the airplane took off this visit
function seedSend(){const o=st.seedOffer;st.seedOffer=null;seedFly=T;sfx('page');seedSentHook(o.seed);tell('Off it goes to Slowmallow on a paper airplane.',{kind:'important'});save();}
const KEEP_DEST='Out living their own lives';
function seedKeep(){const o=st.seedOffer;st.seedOffer=null;st.seedKeep=o.seed;const P=o.ids.map(id=>allRaw().find(q=>q.id===id));for(const q of P){q.goDest=KEEP_DEST;q.goDay=st.day+1;delete q.goAgain;}
 sfx('chime');tell(nameOf(P[0],true)+' and '+nameOf(P[1],true)+' will head off in the morning to live their own lives.',{kind:'important'});save();}
// the morning after "Keep it here": the seed takes over the windowsill, with its own name and the usual hello
function seedKeptArrives(){const c=st.seedKeep;st.seedKeep=null;if(plantCount()===0)Object.assign(st,c);else addPlant(c);ACT=st.id;pickChair();st.curtain='open';sfx('soil');tell(seedHello(st.name),{kind:'important',who:st.id});}
/* SLOWMALLOW'S NOTE (Jackie, Nov 4; renamed Nov 7): Slowmallow is a cute sloth who only talks by paper airplane and
   helps monsters become good members of society (no doctor, no professor).  the second plant is opt-in. When your only plant is a late teen (at least one night as a teen,
   or already grown), a paper-airplane note from Slowmallow glides onto the windowsill once and sits there (nothing loops or blinks).
   Tap it: "I have a seedling in need of a home. May I send it over?"
     Yes, please -> the seed arrives the next morning in the little pot (wakeRoom in start.js).
     Not yet     -> the note goes into the journal (accept it there anytime); Slowmallow asks again in a few days.
   Never with two plants. This is the only way a second plant comes (Jackie, Nov 7: no "Plant another seed" on the start screen). */
const BUG_NOTE={x:452,y:SURFACE.sill},BUG_ASK='I have a seedling in need of a home. May I send it over?';
const BUG_PLANE=['1000000000','1110000000','0111110000','0011111111','0122222000','1222000000','2200000000']; // a little paper airplane, nose to the right; 1 = paper, 2 = the folded underside
let bugLand=null; // when it landed this visit (for the glide in); null = already there
function bugReady(){if(plantCount()!==1||st.giftSeed||st.bugSend||allRaw().some(q=>q.goDest))return false;const q=allRaw().find(p=>p.stage>=0);return !!q&&(q.stage>=8||(q.stage===6&&(q.timer||0)>=GROW_FOR[6]/2));}
function bugNoteBox(){const p=P,w=BUG_PLANE[0].length*p,h=BUG_PLANE.length*p;return {x:BUG_NOTE.x-w/2,y:BUG_NOTE.y-h,w,h};}
function bugOnSill(){return st.bugNote==='sill'&&bugReady();}
function bugNoteHit(x,y){if(!bugOnSill())return false;const b=bugNoteBox();return x>=b.x-24&&x<=b.x+b.w+24&&y>=b.y-24&&y<=b.y+b.h+16;}
function drawPlane(x0,y0){const p=P,X=Math.round(x0/p)*p,Y=Math.round(y0/p)*p; // on whole pixels
 g.fillStyle=C.out;BUG_PLANE.forEach((r,j)=>[...r].forEach((v,i)=>{if(v!=='0')g.fillRect(X+i*p-2,Y+j*p-2,p+4,p+4);}));
 BUG_PLANE.forEach((r,j)=>[...r].forEach((v,i)=>{if(v==='0')return;g.fillStyle=v==='1'?C.ivory:C.cream;g.fillRect(X+i*p,Y+j*p,p,p);}));return [X,Y];}
function drawBugNote(){if(!bugOnSill())return;const b=bugNoteBox(),u=bugLand==null?1:clamp((T-bugLand)/1.6,0,1);drawPlane(b.x-(1-u)*140,b.y-(1-u)*170);} // glides down from the window once
// the seed leaving for Slowmallow's: the airplane lifts off the sill and flies up out of the room, a little seed riding on it
function drawSeedFly(){if(seedFly==null)return;const u=(T-seedFly)/2.4;if(u>=1){seedFly=null;return;}const b=bugNoteBox(),[X,Y]=drawPlane(b.x+u*760,b.y-u*640),p=P;
 g.fillStyle=C.out;g.fillRect(X+3*p-2,Y-p-2,2*p+4,2*p+4);g.fillStyle=C.brick;g.fillRect(X+3*p,Y-p,2*p,2*p);}
function bugAsk(){sfx('page');const b=bugNoteBox();
 openBubble(b.x-140,b.y-190,'<b>From Slowmallow</b><br>'+BUG_ASK+'<br><button data-k="y">Yes, please</button><button data-k="n">Not yet</button>',{y:()=>{closeBubble();bugYes();},n:()=>{closeBubble();bugNotYet();}});}
function bugYes(){st.bugSend=st.day+1;st.bugNote=null;st.bugJournal=0;sfx('chime');tell('Slowmallow will send the seedling over in the morning.',{kind:'info'});save();}
function bugNotYet(){st.bugNote=null;st.bugJournal=1;st.giftAskDay=st.day+3;sfx('page');save();}
function bugArrive(){ // the next morning
 if(!st.bugSend||st.day<st.bugSend)return;st.bugSend=0;if(plantCount()>=MAX_PLANTS)return;
 st.giftSeed=1;const p=freshPlant();p.species=Math.floor(Math.random()*16);addPlant(p);sfx('soil');
 tell('Something taps the window and a seed drifts in on a paper airplane note from Slowmallow.',{kind:'important'});save();}
/* ASKING TO GO (Jackie, Nov 8): a content adult may ask, now and then, to go somewhere that fits its nature (GO_REASONS in names.js).
   At most one roll a day, after things have been calm for a little while; never while another ask, note or seed is waiting; never a kid or teen.
   Yes: it sets off the next morning (moveOut). Not yet, or tapping away: no penalty of any kind, it asks again in 3 days. */
const GO_CHANCE=.2,GO_CALM=20,GO_AGAIN=3,GO_SETTLED=3;let goCalm=0; // chance per day; seconds of calm first; days until it asks again; days an adult settles in before it can ask
function goContent(){return st.stage>=8&&st.nap<=0&&!want('thirst')&&!want('attention')&&st.lightState==='ok'&&!st.float&&!(st.grump>0)&&!READ.has(st.id)&&(st.adultDay==null||st.day>=st.adultDay+GO_SETTLED)&&(st.goAgain||0)<=st.day;}
function goWaiting(){return !!bubble||bugOnSill()||!!(st.bugJournal&&bugReady())||!!st.bugSend||!!st.seedOffer||!!st.seedKeep||allRaw().some(q=>q.goDest);}
function goTick(dt){if(!quiet())return; // a caption only pauses the calm
 if(st.night||T<8||goWaiting()||(st.goNext||0)>st.day||st.goRolled===st.day||drag.down||held.tool||storyEl||trayEl||btrayEl||document.querySelector('.screen')){goCalm=0;return;}
 const ids=[];eachPlant(()=>{if(goContent())ids.push(st.id);});if(!ids.length){goCalm=0;return;}goCalm+=dt;if(goCalm<GO_CALM)return;goCalm=0;st.goRolled=st.day;
 const due=ids.filter(id=>allRaw().find(q=>q.id===id).goAgain);if(due.length){goAsk(due[0]);return;} // it said it would ask again
 if(Math.random()<GO_CHANCE)goAsk(ids[Math.floor(Math.random()*ids.length)]);else save();}
function goAsk(id){withPlant(id,()=>{const p=pers(),R=[p.g,p.l].filter(Boolean).flatMap(k=>GO_REASONS[k]),L=R.length?R:GO_REASONS.neutral,r=L[Math.floor(Math.random()*L.length)],b=plantBox(),N=esc(who());
  st.goAgain=st.day+GO_AGAIN;st.goNext=st.day+GO_AGAIN;sfx('page');const right=b.x+b.w+390<W;
  openBubble(right?b.x+b.w+10:b.x-390,Math.max(20,b.y+10),N+' '+esc(r[0])+'. May '+N+' go?<br><button data-k="y">Yes</button><button data-k="n">Not yet</button>',{y:()=>{closeBubble();goYes(id,r[1]);},n:()=>{closeBubble();goNotYet(id);}});});save();}
function goYes(id,dest){withPlant(id,()=>{st.goDest=dest;st.goDay=st.day+1;delete st.goAgain;sfx('chime');tell(who()+' will set off in the morning.',{kind:'important',who:st.id});});save();}
function goNotYet(id){withPlant(id,()=>{const b=plantBox();st.goAgain=st.day+GO_AGAIN;burst('heart',b.x+b.w/2,b.y-20,3);plantBoing(b.x+b.w/2);tell(who()+' snuggles back in.',{kind:'important',who:st.id});});save();}
// the morning after a yes (wake in start.js): gone, journal in the desk. If that was the last monster, the room waits a moment, then a new seed can be planted
function goMorning(){const L=allRaw().filter(q=>q.goDest&&st.day>=q.goDay),go=L.map(q=>({id:q.id,d:q.goDest}));for(const q of L){delete q.goDest;delete q.goDay;}
 const copies=L.map(plantFields);go.forEach((x,i)=>moveOut(x.id,x.d,copies.slice(0,i))); // leaving together: each keepsake still knows the other
 if(st.seedKeep)seedKeptArrives();
 if(plantCount()===0)setTimeout(()=>{if(plantCount()===0&&!document.querySelector('.screen'))startFlow();},GO_EMPTY_MS);}
const GO_EMPTY_MS=10000;
function seedTick(dt){
 offerTick();
 if(st.bugNote==='sill'||st.night||T<8||!quiet()||!bugReady())return; // not in the first moments after you arrive: the welcome comes first
 if((st.giftAskDay||0)>st.day)return; // you said not yet: ask again in a few days
 st.bugNote='sill';bugLand=T;sfx('page');save();}
const BREED_CHANCE=.25,BREED_FRIENDS=.4; // two content adults may make a seed: rolled once a day at most, and never in the 3 days after any ask
function breedTick(dt){ // MAX_PLANTS is 2, so the room being full of two adults is the one case that's allowed (Jackie, Nov 8)
 if(st.night||st.breedDay===st.day||goWaiting()||(st.goNext||0)>st.day||st.seedKeep){st.bloomT=0;return;}const A=allRaw().filter(q=>q.stage>=8&&q.nap<=0&&q.needs.thirst<.5&&q.needs.attention<.5&&q.lightState==='ok'&&(q.adultDay==null||st.day>=q.adultDay+GO_SETTLED));
 if(A.length<2){st.bloomT=0;return;}const R=rel(A[0],A[1]);st.bloomT=(st.bloomT||0)+dt*gameSpeed();if(st.bloomT<(R==='friends'?25:R==='bicker'?70:40))return; // friends pollinate sooner
 st.bloomT=0;st.breedDay=st.day;if(Math.random()<(R==='friends'?BREED_FRIENDS:BREED_CHANCE)){const [a,b]=A;crossPollinate(a,b);}else save();}
function crossPollinate(a,b){a={...a,needs:{...a.needs}};b={...b,needs:{...b.needs}};const pa=a._pos,pb=b._pos; // snapshot: 'st' changes when the seed arrives
 for(let i=0;i<10;i++)setTimeout(()=>{const t=i/9;burst('heart',pa.x+(pb.x-pa.x)*t,Math.min(pa.y,pb.y)-380-Math.sin(t*Math.PI)*80,1);},i*160);
 sfx('chime');tell('Please excuse the mess.',{kind:'important'});
 setTimeout(()=>{const pick=(k,n)=>Math.random()<.08?Math.floor(Math.random()*n):(Math.random()<.5?a:b)[k];
  const c=freshPlant();c.species=pick('species',16);c.eye=pick('eye',16);c.pref=Math.random()<.08?['sun','shade','night'][Math.floor(Math.random()*3)]:(Math.random()<.5?a:b).pref;c.parents=[a.id,b.id];c.nge=clamp(((a.nge||0)+(b.nge||0))/2+rnd(-.2,.2),-.6,.6);c.nlc=clamp(((a.nlc||0)+(b.nlc||0))/2+rnd(-.2,.2),-.6,.6);c.ge=clamp((a.ge+b.ge)/2*.5+c.nge*.5,-1,1);c.lc=clamp((a.lc+b.lc)/2*.5+c.nlc*.5,-1,1); // born leaning a little like its parents
  c.name=makeName(c);c.place={seed:'sill'};st.seedOffer={ids:[a.id,b.id],seed:JSON.parse(JSON.stringify(c))};st.goNext=st.day+GO_AGAIN;save();},1800);}
function align(){const a=st.lc>.33?'Lawful':st.lc<-.33?'Chaotic':'Neutral',b=st.ge>.33?'Good':st.ge<-.33?'Evil':'Neutral';return a===b?'True Neutral':a+' '+b;}
