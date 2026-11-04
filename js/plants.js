'use strict';
/* Plants: ages, sprites, faces, charms, pots (paused), needs and light, scooting, personality, friends, titles, seeds and breeding. */
const BABY=[],ELDER=[];for(let i=1;i<=16;i++){const n=String(i).padStart(2,'0');BABY.push(img('baby_'+n+'.png'));ELDER.push(img('elder_'+n+'.png'));}
// seedling pot (Jackie's sheet, 2 frames per stage): soil, first sprout, then the bigger sprout halfway through the sprout stage.
// Drawn at half size in code (never resized): the sheet's pot is 238 px across, baby_01's is 140, so it lands a bit smaller, and halving stays crisp.
const SEEDLING={soil:[img('seedling_soil1.png'),img('seedling_soil2.png')],sprout:[img('seedling_sprout1.png'),img('seedling_sprout2.png')],bigsprout:[img('seedling_bigsprout1.png'),img('seedling_bigsprout2.png')]},SEED_K=.65; // at the front of the rug; depthK makes it ~.43 on the desk
function seedFrame(){const k=st.stage<1?'soil':st.timer<15?'sprout':'bigsprout';return SEEDLING[k][Math.floor(T*.6)%2];} // slow 2-frame swap
const BABY_SLEEP=[];for(let i=1;i<=16;i++)BABY_SLEEP.push(img('baby_'+String(i).padStart(2,'0')+'_sleep.png'));
const SLEEP_OFF=[[0, 0], [-4, -1], [-1, 3], [-4, 11], [-1, 3], [-2, 2], [-2, 3], [1, 3], [0, 4], [0, 4], [-2, 4], [-1, 5], [1, -2], [0, 2], [2, 3], [0, 2]]; // sleeping baby offset vs awake; only x is used now (the bottom is anchored by the real bottom)
const EYE_O=[],EYE_C=[],MOUTH=[];for(let i=1;i<=16;i++){const n=String(i).padStart(2,'0');EYE_O.push(img('eyes_'+n+'_open.png'));EYE_C.push(img('eyes_'+n+'_blink.png'));if(i<=12)MOUTH.push(img('mouthB_'+n+'.png'));}
const EYE_NAMES=['big round','small dot','sparkle','sly cat','square','flower','tall oval','lashed','sleepy','swirl','sinister','slit','three-shine','pink lids','startled','blushing'];
const NAMES=['curl-sprout bun','lobed bun','stacked cone','leafy mop','bulb','rounded crown','pineapple tuft','floppy ears','sprout-ears','spiral','tentacle star','willow mop','octopus','diamond','lobed cloud','cradle lobes'];
function lightFit(k){return lightFitText(spotInfo(k,.37,true),st.pref);} // the spot by day, curtains open
function stageGroup(){return st.stage<4?'seed':st.stage===4?'baby':'grown';}
const STAGES=['seed','sprout','sprout','sprout','kid','teen','teen','adult','adult'];
const TEACH={thirst:'Fading to gray: it\'s thirsty. Water it with the carafe on the stool.',hunger:'Mouth open, eyeing the snack jar: it\'s hungry.',attention:'A little frown: it\'s lonely. Pet it, or read it something from the shelf.'};
/* ---------- plant sprite ---------- */
// returns {img|null, x, y, w, h, scale} in room coords for the current stage
// FEWER AGES (Jackie): seed -> sprout -> baby -> teen -> adult, each clearly bigger. Internal stage numbers kept: 0 seed, 1 sprout, 4 baby, 6 teen, 8 elder
const NEXT={0:1,1:4,4:6,6:8},AGES=[0,1,4,6,8];
const ELDER_SCALE={6:.62,7:.62,8:.82}; // shown smaller so elder pixels match the room's (Jackie OK'd); swap to 1 when finer-pixel redraws arrive
const FACE=[[0.531, 0.511], [0.505, 0.403], [0.487, 0.493], [0.509, 0.409], [0.525, 0.47], [0.508, 0.377], [0.536, 0.435], [0.503, 0.364], [0.51, 0.461], [0.417, 0.516], [0.5, 0.488], [0.497, 0.375], [0.505, 0.376], [0.5, 0.413], [0.506, 0.406], [0.494, 0.456]]; // per-elder face point (fraction of sprite), from blank body area
function plantBox(){const pb=plantBoxRaw();if(drag.on&&mx>-50){const dx=mx-(pb.x+pb.w/2),dy=my-(pb.y+pb.h*.85);return {...pb,x:pb.x+dx,y:pb.y+dy};}return pb;}
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
let chairId=null,ACT=null;function onChair(){return st.stage>=4&&(st.nap>0||st.night)&&!drag.on&&st.id===chairId;}
function pickChair(){const c=allRaw().filter(p=>p.stage>=4&&(p.nap>0||st.night));c.sort((a,b)=>(b.nap>0)-(a.nap>0)||a.id-b.id);chairId=c.length?c[0].id:null;}
function baseY(){return onChair()?CHAIR_SEAT.y:SPOT[spotKey()].y;}
// NEEDS SHOW ONLY ON THE PLANT (Jackie, Nov 3; RULES.md 10): never on tools, curtains or the room. Each in a few clear steps, and back in steps once the need is met.
//  not enough water: fades to gray (dryLv 0-4, gradually: 16 tiny levels)            too much water: sits in a puddle, a bit soggy and droopy (puddleLv 0-3, dries over time)
//  not enough light: withers (witherLv 0-3: droops, hunches, curls in, colors a little dull)
//  too much light: burns (burnLv 0-3: squints, leans away, toasty scorched edges and tips; the tiny flame only in the extreme case)
// The looks are pre-made per image and level and cached; nothing blends live.
const DRY_FROM=.45,DRY_FULL=.9,DRY_FINE=4,DRY_HEAL=2,NEED_STEP=.5; // gray starts at thirst .45 and is full at .9, in quarter-steps (16 tiny levels, so it comes on gradually); watering brings the color back over 2 s; seconds per step back for the other looks
const HI_WAIT=40,HI_FLAME=80,WITHER_AT=[6,30,60],BURN_AT=[40,60,80],PUDDLE_T=30; // light timings in game seconds x speed (lightBad); a puddle dries in 30 s
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
function earnPot(id){if(!POTS_ON)return;st.pots=st.pots||[];if(st.pots.includes(id))return;st.pots.push(id);st.potOn=id;const p=POTS.find(q=>q.id===id);setTimeout(()=>{sfx('chime');burst('heart',plantBox().x+plantBox().w/2,plantBox().y+plantBox().h-40,3);say('New pot: '+p.name+'! You earned it: '+p.how+'. Swap pots in the journal (desk drawers).',8);},700);save();}
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
function drawPlant(){let b=plantBox();const MO=moveOff();b={...b,x:b.x+(st.id===ACT?Math.round(BOING.ox):0)+MO[0]};const bob=((st.stage>=4&&!st.night)?Math.round(Math.sin(T*2.2)*1.5):0)+(st.id===ACT?Math.round(BOING.oy):0)+MO[1];
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
function mouthNow(){if(st.grump>0)return 9;if(grinning())return 10;const sad=st.lightState!=='ok'||st.needs.thirst>.8||st.needs.attention>.6;if(sad)return 9;return MOUTH_BY[align()]||6;}
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
function want(n){if(st.stage<0)return false;if(st.stage<4)return n==='thirst'&&st.needs.thirst>.6;return st.needs[n]>.6;}
function plantUpdate(dt){const sp=gameSpeed();
 st.listen=Math.max(0,st.listen-dt);st.over=Math.max(0,st.over-dt);st.nap=Math.max(0,st.nap-dt);
 if(st.mv)st.mv.t+=dt;if(st.grump>0)st.grump-=dt;
 needTick(dt); // real seconds, so looks come back over a couple of seconds at any speed
 if(st.night)return;
 scootTick(dt);quirkTick(dt);if(Math.random()<dt*.2)titleCheck();
 if(st.dayT>=.5&&st.goldenSaid!==st.day){st.goldenSaid=st.day;tell('Golden hour. When you\'re ready, tap the armchair (or the journal in the desk drawers) to say goodnight.',{kind:'teach',key:'golden'});}
 if(st.stage<4){st.timer+=dt*sp;if(st.timer>30){st.timer=0;st.stage=NEXT[st.stage]??4;
   if(st.stage===4){sfx('chime');sfx('boing');tell('Its eyes open! It\'s a little kid now, a '+NAMES[st.species]+'. '+temperament()+' It hops down to the book stack. (Drag it to the milk crate if you like.)',{kind:'important',who:st.id});}
   else{sfx('soil');tell('It\'s growing: '+STAGES[st.stage]+'.',{kind:'important'});}}}
 const k=dt*sp/60;
 st.needs.thirst=clamp(st.needs.thirst+k*.11*(st.glare===2?2:1),0,1); // half as fast as before (Jackie, calm-down): at normal speed, gray starts after ~2 min, thirsty ~2.7 min, fully gray ~4 min; only the little-flame case dries it twice as fast
 if(st.needs.thirst>=.95)st.wasParched=1;if(st.wasParched&&st.needs.thirst<.1&&st.stage>=4){st.wasParched=0;earnPot('kintsugi');}
 if(st.stage>=4){st.parch=st.needs.thirst>=.95?clamp((st.parch||0)+k*.35,0,1):st.needs.thirst<.5?clamp((st.parch||0)-dt*.08,0,1):(st.parch||0);} // petrifying cracks (Jackie): slow to form, heal after watering
 if(st.stage>=4){st.full=clamp((st.full||0)-k*.25,0,1);st.needs.hunger=0;st.needs.attention=clamp(st.needs.attention+k*.26,0,1);}
 const li=spotInfo(spotKey());st.light=li.L;
 const ls=st.stage<1?'ok':lightFeel(li,st.pref);
 if(ls!=='ok')st.lightBad+=dt*sp;else{if(st.lightState!=='ok'){met('light');sfx('boing');}st.lightBad=0;} // moving it out fixes it right away
 st.lightState=st.lightBad>(ls==='hi'?HI_WAIT:6)?ls:'ok'; // too much light takes a while to bother it
 st.glare=st.lightState!=='hi'?0:li.sun&&st.pref==='night'&&st.lightBad>HI_WAIT+HI_FLAME?2:1; // 1 = squint + lean away; 2 = the little flame, only a night-lover left in midday sun a long while
 if(st.glare===2&&Math.random()<dt*.25)sfx('fsss');
 for(const n of['thirst','attention'])if(want(n)){
  if(Math.random()<dt*.06)sfx(n==='thirst'?'crinkle':n==='hunger'?'rumble':'hum');
  if(!st.taught[n]){tell(TEACH[n],{kind:'teach',key:n});sfx(n==='thirst'?'crinkle':n==='hunger'?'rumble':'hum');}}
 if(st.lightState!=='ok'){if(Math.random()<dt*.05)sfx('hmm');}
 // no hints on objects (RULES.md 10): no carafe wobble or sparkle, curtain sway, window wobble, bouncing book or jar
}
/* ---------- it moves itself (Jackie: "sit back in the room if it wants to") ----------
   A grown plant that's been in the wrong light for a while shuffles, in whole-pixel steps, to the nearest floor spot that suits it. */
function squinting(){return st.lightState==='hi'&&Math.floor(T*1.5)%3!==0;} // eyes shut against the light, peeking now and then (frame swap)
function leanOff(){if(st.lightState!=='hi')return 0;const s=SPOT[spotKey()],i=spotInfo(spotKey()),from=i.sun?WINDOW_LIGHT.x:i.under?i.under.x:WINDOW_LIGHT.x;const n=Math.max(4,Math.round(plantBoxRaw().h*.025));return s.x<from?-n:n;} // whole pixels, away from the light; bigger plants lean further
function scootTick(dt){if(stageGroup()!=='grown'||st.nap>0||(drag.on&&st.id===ACT))return;
 if(st.walk){const w=st.walk,f=st.free,sp=Math.max(1,Math.round(90*dt));f.x+=clamp(w.x-f.x,-sp,sp);f.y+=clamp(w.y-f.y,-Math.ceil(sp/2),Math.ceil(sp/2));
  if(f.x===w.x&&f.y===w.y){st.walk=null;sfx('pop');}return;}
 if(st.lightState==='ok'||st.lightBad<(st.lightState==='hi'?HI_WAIT+50:70))return; // grown plants move off once it's been withering or burning a good whilelet best=null,bd=1e9;
 for(let x=FLOOR_X0;x<=FLOOR_X1;x+=40)for(const y of [FLOOR_FRONT,860,FLOOR_BACK]){if(lightFeel(lightInfo(x,y),st.pref)!=='ok'||!freeClear(x,y))continue;const d=Math.abs(x-st.free.x)+Math.abs(y-st.free.y);if(d<bd){bd=d;best={x,y};}}
 if(best){st.walk={...best,why:st.lightState};st.lightBad=0;}}

/* ---------- PERSONALITY that does things (Jackie: "make it more fun") ----------
   Research notes: Animal Crossing personalities change what villagers say, do and how they treat others; Black & White creatures
   change with alignment; Cult of the Lamb traits flip reactions (what one hates, another loves); Petz used a fixed personality
   sheet + "constrained randomness", never punished the player, and aimed for every interaction to give you a story to tell. */
function pers(){return {g:st.ge>.33?'good':st.ge<-.33?'evil':'',l:st.lc>.33?'lawful':st.lc<-.33?'chaotic':''};}
function who(){return plantCount()>1?'The '+NAMES[st.species]:'It';}
const VOICE={
 pet:{good:['{W} leans into your hand.','{W} hums a tiny thank-you.'],evil:['{W} pretends not to like it. It likes it.','{W} lets you, this once.'],
  lawful:['{W} holds perfectly still to be petted.','{W} straightens up afterwards, very proper.'],chaotic:['{W} nibbles your finger, gently.','{W} wiggles every leaf at once.'],'':['{W} wiggles happily.']},
 water:{good:['{W} sighs happily.','{W} glows a little.'],evil:['{W} slurps it down loudly. Mwah-ha-hah.','{W} drinks like a tiny villain.'],
  lawful:['{W} drinks exactly half, then the other half.'],chaotic:['{W} splashes some on the floor on purpose.','{W} blows bubbles in it.'],'':['Gulp gulp.']},
 greet:{good:'{W} waves every leaf at you.',evil:'{W} acts like it didn\'t notice you. It noticed.',lawful:'{W} was waiting in exactly the same spot.',chaotic:'{W} is somehow facing a different direction.','':'{W} perks up.'},
 idle:{good:['{W} is humming to itself.','{W} is watching the cat sleep, fondly.'],evil:['{W} is plotting something small.','{W} is doing a tiny evil laugh.'],
  lawful:['{W} is tidying its leaves into neat rows.','{W} is counting the books on the shelf.'],chaotic:['{W} is trying to lick the window.','{W} is doing a little dance for no reason.'],'':['{W} is just vibing.']}};
// voice lines come out of a shuffle bag: never one of the last 15 picked for that event, never one shown in the last 10 minutes ('' = nothing fresh, stay quiet)
const LINE_HIST={};
function line(ev){const p=pers(),keys=[p.g,p.l].filter(Boolean);if(!keys.length)keys.push('');const fmt=t=>t.replace('{W} is ',who()==='It'?'It\'s ':'{W} is ').replace('{W}',who());
 const all=[...new Set(keys.flatMap(k=>[].concat(VOICE[ev][k]||[])).map(fmt))],h=LINE_HIST[ev]=LINE_HIST[ev]||[],fresh=all.filter(t=>!h.includes(t)&&!capRecent(t));
 if(!fresh.length)return '';const t=fresh[Math.floor(Math.random()*fresh.length)];h.push(t);if(h.length>15)h.shift();return t;}
function notice(q,desc){st.quirks=st.quirks||{};if(!st.quirks[q]){st.quirks[q]=desc;return true;}return false;}
const QUIRK_TXT={bonk:'Chaotic: bonks things around the room for fun.',wander:'Chaotic: wanders to a new spot when it gets bored.',tidy:'Lawful: tidies its leaves; loves being watered at its usual time.',
 usual:'Lawful: loves its usual treat.',novel:'Chaotic: loves a treat it hasn\'t had lately.',catfriend:'Good: keeps the cat company (the cat warms up to you faster).',share:'Good: shares its happiness with the other plants.',
 boo:'Evil: makes spooky faces at the cat (the cat is unimpressed).',dark:'Evil: loves dark treats, eats wholesome ones politely.',sweet:'Good: loves wholesome treats, eats dark ones politely.'};
function quirkTick(dt){if(st.stage<4||st.nap>0||st.night)return;st.quirkT=(st.quirkT??rnd(25,50))-dt;if(st.quirkT>0)return;st.quirkT=rnd(45,95);
 const p=pers(),b=plantBox(),cx=b.x+b.w/2,opts=[];
 if(p.l==='chaotic'){opts.push('bonk');if(stageGroup()==='grown')opts.push('wander');}
 if(p.l==='lawful')opts.push('tidy');
 if(p.g==='good'){if(cat.state==='sleep'&&Math.abs(cat.x-cx)<650)opts.push('catfriend');if(allRaw().some(q=>q.id!==st.id&&q.stage>=4&&q.needs.attention>.3))opts.push('share');}
 if(p.g==='evil'&&cat.state==='sleep'&&cat.spot!=='byplant'&&Math.abs(cat.x-cx)<750)opts.push('boo');
 if(!opts.length){if(ambientOK()&&Math.random()<.35)tell(line('idle'),{kind:'ambient',who:st.id});return;}
 const q=opts[Math.floor(Math.random()*opts.length)];let t='';doMove();
 if(q==='bonk'){let best=null,bd=480;for(const f of FP){const d=Math.hypot(f.x+f.w/2-cx,f.y+f.h/2-(b.y+b.h*.4));if(d<bd){bd=d;best=f;}}
  plantBoing(cx);if(best){fidgetPoke(best.x+best.w/2,best.y+best.h/2);t=who()+' bonked the '+({ammonite:'fossil shell',armillary:'brass globe',bookstack:'book stack',butterflies:'butterfly picture',catpic:'cat picture',cratebook:'book on the crate',drum:'drum machine',flowerpic:'flower painting',glass:'glass',lockbox:'little pink box',moonbox:'moon box',moonpanel:'moon picture',petbed:'cat bed',pillow:'pillow',radio:'radio',shelfplant:'shelf plant',snail:'wind-up snail'}[best.n]||'something')+'. Just because.';}else t=line('idle');}
 else if(q==='wander'){const c=[];for(let x=FLOOR_X0;x<=FLOOR_X1;x+=60)for(const y of [FLOOR_FRONT,850,FLOOR_BACK]){if(lightFeel(lightInfo(x,y),st.pref)==='ok'&&freeClear(x,y)&&Math.abs(x-st.free.x)>150)c.push({x,y});}
  if(c.length){st.walk={...c[Math.floor(Math.random()*c.length)],why:'bored'};t=who()+' got bored and wandered off somewhere new.';}else{plantBoing(cx);t=line('idle');}}
 else if(q==='tidy'){st.listen=1.6;const L=VOICE.idle.lawful;t=L[Math.floor(Math.random()*L.length)].replace('{W}',who());}
 else if(q==='catfriend'){for(let i=0;i<3;i++)setTimeout(()=>burst('heart',cx+(cat.x-cx)*(i+1)/4,Math.min(b.y,cat.y)-40,1),i*200);trustGain(.01);t=(who()==='It'?'It\'s':who()+' is')+' keeping the cat company. The cat seems to like it.';}
 else if(q==='share'){const o=allRaw().find(q2=>q2.id!==st.id&&q2.stage>=4&&q2.needs.attention>.3);o.needs.attention=Math.max(0,o.needs.attention-.2);if(o._pos)for(let i=0;i<3;i++)setTimeout(()=>burst('heart',cx+(o._pos.x-cx)*(i+1)/4,b.y,1),i*200);t=(who()==='It'?'It\'s':who()+' is')+' cheering up the '+NAMES[o.species]+'.';}
 else if(q==='boo'){plantBoing(cx);sfx('hmm');cat.state='wake';cat.t=1.2;t=who()+' made a spooky face at the cat. The cat is unimpressed and leaves.';}
 const first=notice(q,QUIRK_TXT[q]);if(t)tell(first?t+' (New quirk in the journal.)':t,first?{kind:'teach',key:'quirk_'+q,who:st.id}:{kind:'ambient',key:'quirk:'+q+':'+st.id,who:st.id});} // a new quirk is explained once ever; after that it's chatter

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
 const a=P[Math.floor(Math.random()*P.length)],others=P.filter(q=>q!==a),b=others[Math.floor(Math.random()*others.length)],r=rel(a,b),n=q=>NAMES[q.species];
 const both=(f)=>{for(const q of[a,b]){const i=(st.others||[]).indexOf(q);if(i<0)f();else{swapIn(i);try{f();}finally{swapIn(i);}}}};
 const hearts=()=>{for(let i=0;i<4;i++)setTimeout(()=>burst('heart',a._pos.x+(b._pos.x-a._pos.x)*(i+.5)/4,Math.min(a._pos.y,b._pos.y)-300,1),i*180);};
 if(r==='bicker'){both(()=>{st.grump=6;doMove('grin');});sfx('hmm');
  const said=tell('The '+n(a)+' and the '+n(b)+' are bickering. Grumpy faces all around.',{kind:'ambient',key:'bicker'});
  setTimeout(()=>{hearts();sfx('chime');if(said)tell('…and they made up. They always do.',{kind:'info',key:'madeup'});},6500);bumpRel(a,b,-1);}
 else if(r==='friends'){const p=pers.call(null);both(()=>doMove());hearts();sfx('giggle');
  const both2=(k,v)=>a[k]*v>0.33&&b[k]*v>0.33;
  const t=both2('lc',-1)?'egging each other on':both2('lc',1)?'bowing politely to each other':both2('ge',1)?'swaying together':both2('ge',-1)?'scheming together':'getting along';
  tell('The '+n(a)+' and the '+n(b)+' are '+t+'. Friends!',{kind:'ambient',key:'friends'});bumpRel(a,b,1);}
 else{both(()=>doMove('bob'));}}
function bumpRel(a,b,v){for(const[x,y]of[[a,b],[b,a]]){x.rel=x.rel||{};x.rel[y.id]=(x.rel[y.id]||0)+v;}}
// extremes earn a title + a one-time celebration
const TITLES={good:'Little saint',evil:'Little menace',lawful:'Stickler',chaotic:'Wild child'};
function titleCheck(){const out=[];if(st.ge>.85)out.push('good');if(st.ge<-.85)out.push('evil');if(st.lc>.85)out.push('lawful');if(st.lc<-.85)out.push('chaotic');
 st.titles=st.titles||[];const id=st.id;for(const t of out)if(!st.titles.includes(t)){st.titles.push(t);setTimeout(()=>withPlant(id,()=>{const b=plantBox();doMove();burst('heart',b.x+b.w/2,b.y-30,4);sfx('chime');tell(who()+' earned a title: '+TITLES[t]+'! (In the journal.)',{kind:'important',who:id});}),2500);}}
/* ---------- a second seed, and breeding ---------- */
function addPlant(p){st.others=st.others||[];st.others.push(p);swapIn(st.others.length-1);ACT=st.id;} // the new one becomes the one you're tending
function seedTick(dt){ // once your first plant is a teen, a seed drifts in through the open window
 if(st.giftSeed||st.night||plantCount()>=3||st.curtain==='closed'||!quiet()||T<8)return;/* not in the first moments after you arrive: the welcome comes first */if(!allRaw().some(q=>q.stage>=6))return;
 if(allRaw().some(q=>q.stage>=0&&q.stage<4))return;st.giftSeed=1;const p=freshPlant();p.species=Math.floor(Math.random()*16);addPlant(p);sfx('soil');
 tell('Something tapped the window. A seed drifted in and landed in the little pot. You have two plants now: tap one to tend it.',{kind:'important'});save();}
function breedTick(dt){ // two happy adults on the same day cross-pollinate and leave a seed (if there's room)
 if(st.night||plantCount()>=3||st.breedDay===st.day){st.bloomT=0;return;}const A=allRaw().filter(q=>q.stage>=8&&q.nap<=0&&q.needs.thirst<.5&&q.needs.attention<.5&&q.lightState==='ok');
 if(A.length<2||allRaw().some(q=>q.stage>=0&&q.stage<4)){st.bloomT=0;return;}const R=rel(A[0],A[1]);st.bloomT=(st.bloomT||0)+dt*gameSpeed();if(st.bloomT<(R==='friends'?25:R==='bicker'?70:40))return; // friends pollinate sooner
 st.bloomT=0;st.breedDay=st.day;const [a,b]=A;crossPollinate(a,b);}
function crossPollinate(a,b){a={...a,needs:{...a.needs}};b={...b,needs:{...b.needs}};const pa=a._pos,pb=b._pos; // snapshot: 'st' changes when the seed arrives
 for(let i=0;i<10;i++)setTimeout(()=>{const t=i/9;burst('heart',pa.x+(pb.x-pa.x)*t,Math.min(pa.y,pb.y)-380-Math.sin(t*Math.PI)*80,1);},i*160);
 sfx('chime');tell('Pollen drifts between your two plants…',{kind:'important'});
 setTimeout(()=>{const pick=(k,n)=>Math.random()<.08?Math.floor(Math.random()*n):(Math.random()<.5?a:b)[k];
  const c=freshPlant();c.species=pick('species',16);c.eye=pick('eye',16);c.pref=Math.random()<.08?['sun','shade','night'][Math.floor(Math.random()*3)]:(Math.random()<.5?a:b).pref;c.parents=[a.id,b.id];c.nge=clamp(((a.nge||0)+(b.nge||0))/2+rnd(-.2,.2),-.6,.6);c.nlc=clamp(((a.nlc||0)+(b.nlc||0))/2+rnd(-.2,.2),-.6,.6);c.ge=clamp((a.ge+b.ge)/2*.5+c.nge*.5,-1,1);c.lc=clamp((a.lc+b.lc)/2*.5+c.nlc*.5,-1,1); // born leaning a little like its parents
  addPlant(c);sfx('soil');sfx('boing');const nm=q=>NAMES[q.species];
  tell('A seed! Its parents are your '+nm(a)+' and your '+nm(b)+'. It\'s in the little pot '+(spotKey()==='desk'?'on the desk':'by the window')+'.',{kind:'important'});save();},1800);}
function align(){const a=st.lc>.33?'Lawful':st.lc<-.33?'Chaotic':'Neutral',b=st.ge>.33?'Good':st.ge<-.33?'Evil':'Neutral';return a===b?'True Neutral':a+' '+b;}
