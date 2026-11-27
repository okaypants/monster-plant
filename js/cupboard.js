'use strict';
/* TOFU'S CUPBOARD (Jackie, Nov 18: the star door at the bottom of the right bookcase is "Tofu's cupboard"; the toys are Jackie's sheet,
   Nov 23). A tap opens it (the star door is out of the way and a couple of the toys show inside) and a small tray holds what is kept inside: a ball of yarn, a felt mouse, a feather wand, a jingle
   ball and a tin of cat treats. Press one and drag it to the cat, as a treat is dragged to a monster. What the cat does is posture
   only, from its own drawn poses (play bow, pounce, stalk, leap, eating): never an expression.
   - A cat that trusts you plays with it for a couple of seconds, then sits. It will wake up for a toy.
   - A shy cat only watches (and trusts you a little more for being left alone with it).
   - Play uses up a little of the cat's patience, like petting: after a few goes it has had enough until it has rested.
   - A cat that has walked off in a huff is not in the mood.
   Let go anywhere else and the toy goes back in the cupboard. */
const CUB_TOYS=[
 {id:'yarn',name:'ball of yarn',say:'pounces on the ball of yarn.',seq:[['playbow',.5],['pounce',.45],['playbow',.4],['pounce',.45],['sit1',.6]]},
 {id:'mouse',name:'felt mouse',say:'stalks the felt mouse and pounces.',seq:[['stalk',.9],['pounce',.5],['stalk',.5],['pounce',.5],['sit1',.5]]},
 {id:'wand',name:'feather wand',say:'leaps at the feather wand.',seq:[['sit1',.4],['leap_r',.45],['sit1',.3],['leap_r',.45],['sit1',.5]],high:true},
 {id:'bell',name:'jingle ball',say:'bats the jingle ball about.',seq:[['stand_side',.5],['pounce',.4],['stand_side',.5],['pounce',.4],['sit1',.5]],sfx:'chime'},
 {id:'tin',name:'tin of treats',say:'eats a few treats.',seq:[['eat',2.2],['sit2',.4],['sit1',.5]],pic:'tin_open',sfx:'crunch'}];
const CUB_IMG={};['yarn','mouse','wand','bell','tin','tin_open'].forEach(n=>CUB_IMG[n]=img('cub_'+n+'.png'));
const cub={item:null,x:0,y:0,over:false,t:0};let cubEl=null;const CUB_HIDE=4000;
function cubIsOpen(){return !!cubEl||!!cub.item;}
/* The cupboard keeps two kinds of thing (Jackie, Nov 25: "in the cabinet we can choose cat stuff or decorations"). A tap on the star door
   asks which; Cat toys shows the toys to drag to the cat, as before, and Decorations lists what the room can be decorated for (js/decor.js). */
function cubTray(){if(cubEl){cubEl.remove();}cubEl=document.createElement('div');cubEl.className='ttray tsb';
 cubEl.addEventListener('pointerdown',e=>e.stopPropagation());cubEl.addEventListener('click',e=>e.stopPropagation());ui.appendChild(cubEl);return cubEl;}
function cubBtn(txt,fn,cls){const b=document.createElement('button');b.type='button';b.className='cubpick'+(cls?' '+cls:'');b.textContent=txt;b.addEventListener('click',e=>{e.stopPropagation();sfx('tick');fn();});return b;}
function cubOpen(){sfx('tick');if(!cubEl){const el=cubTray();el.dataset.k='pick';el.append(cubBtn('Cat toys',cubToys),cubBtn('Decorations',cubDecor),cubBtn('String lights',cubLights));}cubPlace();cub.t=performance.now();}
function cubToys(){const el=cubTray();el.dataset.k='toys';
  for(const s of CUB_TOYS){const b=document.createElement('button');b.type='button';b.className='ttreat';b.dataset.id=s.id;b.setAttribute('aria-label',s.name);
   const im=document.createElement('img');im.src=CUB_IMG[s.id].src;im.alt='';im.draggable=false;b.appendChild(im);
   b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();cubGrab(s,e);});el.appendChild(b);}
 cubPlace();cub.t=performance.now();}
/* STRING LIGHTS have their own list (Jackie, Nov 27: "string lights should be a separate menu in the cabinet"): take them down or hang
   them, turn them off or on, and choose the strand. "Seasonal" is the strand that goes with whatever the room is
   decorated for, and with the time of year when it is not; any other choice stays up whatever the occasion. */
function cubLights(){const el=cubTray();el.dataset.k='lights';el.classList.add('cubdecor','cublightsmenu');
 el.appendChild(cubBtn(st.noLights?'Hang the string lights':'Take the string lights down',()=>{lightsSet(!!st.noLights);cubClose();},'cubdown'));
 if(!st.noLights)el.appendChild(cubBtn(st.lightsDark?'Turn them on':'Turn them off',()=>{lightsTap();cubClose();},'cubdown'));
 for(const [id,name] of [['','Seasonal']].concat(LIGHTS_KINDS)){const b=cubBtn(name,()=>{lightsPick(id);cubClose();},(st.lightsKind||'')===id?'on':'');b.dataset.id=id||'auto';el.appendChild(b);}
 cubPlace();cub.t=performance.now();}
// the list of what to decorate for. Taking things down comes first, where it is seen without scrolling (Jackie, Nov 27: "I need the
// option to remove decorations"; it had been the last of thirty-one buttons); the set that is up is marked
function cubDecor(){const el=cubTray();el.dataset.k='decor';el.classList.add('cubdecor');
 if(st.decor)el.appendChild(cubBtn('Take the decorations down',()=>{decorSet(null);cubClose();},'cubdown'));
 const head=t=>{const h=document.createElement('div');h.className='cubhead';h.textContent=t;el.appendChild(h);},put=L=>{for(const s of L){const b=cubBtn(s.name,()=>{decorSet(s.id);cubClose();},st.decor===s.id?'on':'');b.dataset.id=s.id;el.appendChild(b);}};
 head('Seasons');put(decorSeasonal());head('Holidays');put(decorHolidays());
 cubPlace();cub.t=performance.now();}
function cubPlace(){if(!cubEl)return;const w=cubEl.offsetWidth,h=cubEl.offsetHeight;if(cubEl.dataset.k==='decor'){cubEl.style.left=Math.round(clamp((CUPBOARD.x+CUPBOARD.w)*S-w,4,W*S-w-4))+'px';cubEl.style.top=Math.round(Math.max(48,(H*S-h)/2))+'px';return;} // the long list stands beside the cupboard, in the middle of the screen's height
  // along the bottom, ending under the cupboard, clear of the bottom edge like the treat tray
 cubEl.style.left=Math.round(clamp((CUPBOARD.x+CUPBOARD.w)*S-w,4,W*S-w-4))+'px';cubEl.style.top=Math.round(trayTop(h))+'px';}
function cubClose(){if(cubEl){cubEl.remove();cubEl=null;}}
cv.addEventListener('pointerdown',()=>{if(!cub.item)cubClose();}); // tap away
addEventListener('resize',()=>setTimeout(cubPlace,50));
function cubPos(e){const [x,y]=toGame(e);cub.x=x+(rightHand()?-30:30)/S;cub.y=y-46/S;cub.over=catHit(cub.x,cub.y)||catHit(x,y);}
function cubGrab(s,e){cub.item=s;cubPos(e);cub.t=performance.now();sfx('pop');addEventListener('pointermove',cubMove);addEventListener('pointerup',cubUp);addEventListener('pointercancel',cubUp);}
function cubMove(e){if(cub.item)cubPos(e);}
function cubUp(){removeEventListener('pointermove',cubMove);removeEventListener('pointerup',cubUp);removeEventListener('pointercancel',cubUp);
 const s=cub.item,over=cub.over;cub.item=null;cub.over=false;cub.t=performance.now();if(!s)return;if(over)cubGive(s);else sfx('tick');}
// the cat is offered a toy
function cubGive(s){const N=catName(),say=t=>tell(t,{kind:'info',who:'cat'});
 if(['annoyed','settle','loafwake','fedup'].includes(cat.state)||cat.huff){say(N+' is not in the mood for the '+s.name+'.');return;}
 if(catTrust()<TRUST_SHY){if(cat.state==='sleep'){say(N+' sleeps on.');return;}
  if(cat.state!=='walk'){cat.state='look';cat.t=0;cat.lookNap=0;cat.faceX=null;}trustGain(.03);say(N+' watches the '+s.name+' from a safe distance.');return;}
 if(patLow()){say(N+' has had enough play for now.');return;}
 const woke=cat.state==='sleep';if(cat.state==='walk'){cat.path=[];cat.pauseT=0;cat.stutter=0;}
 cat.state='play';cat.t=0;cat.play={toy:s,len:s.seq.reduce((a,q)=>a+q[1],0)};patHit(.18);trustGain(.03);sfx(s.sfx||'pop');if(s.id==='tin')setTimeout(()=>sfx('purr'),1800);
 say(woke?N+' wakes up and '+s.say:N+' '+s.say);if(typeof bump==='function')bump('catPlays');save();}
// the frame of its play right now (js/cat.js catFrame)
function cubFrame(){const P=cat.play;if(!P)return CATF.sit1;let t=cat.t;for(const[f,d]of P.toy.seq){if(t<d)return CATF[f]||CATF.sit1;t-=d;}return CATF.sit1;}
// the toy beside the cat while it plays: on the floor by its front paws, the wand held above (drawn from js/cat.js drawCat)
function drawCubToy(b){const P=cat.play;if(!P)return;const im=CUB_IMG[P.toy.pic||P.toy.id];if(!ok(im))return;const k=cat.sc*.5,w=Math.round(im.naturalWidth*k),h=Math.round(im.naturalHeight*k);
 const sit=CATF.sit1,sw=ok(sit)?sit.naturalWidth*cat.sc*catK(sit):b.w,x=Math.round(cat.x+sw*.5+6),y=P.toy.high?Math.round(cat.y-sw*.7-h):Math.round(cat.y-h);
 g.drawImage(litPic(im,catLit),x,y,w,h);}
// the toy in your hand, and the tray tidying itself away
function drawCub(){if(cubEl&&cubEl.dataset.k!=='decor'&&!cub.item&&performance.now()-cub.t>CUB_HIDE)cubClose(); // the list of decorations stays until you choose or tap away
 if(!cub.item)return;const im=CUB_IMG[cub.item.id];if(!ok(im))return;
 const k=.4,w=Math.round(im.naturalWidth*k),h=Math.round(im.naturalHeight*k);g.drawImage(im,Math.round(cub.x-w/2),Math.round(cub.y-h/2),w,h);}
