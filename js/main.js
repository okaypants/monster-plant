'use strict';
/* Main: the game loop. Loads last, then starts everything. */
/* ---------- loop ---------- */
function update(dt){const sp=st.speed;T+=dt;catUpdate(dt);
 if(capT>0){capT-=dt;if(capT<=0)cap.style.opacity=0;}
 if(blink>0)blink-=dt;else if(Math.random()<dt*.35)blink=.14;
 for(let i=parts.length-1;i>=0;i--){const q=parts[i];q.t-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=q.g*dt;if(q.t<=0)parts.splice(i,1);}
 if(!st.started||plantCount()===0)return;
 if(!st.night&&st.mode!=='actions')st.dayT=Math.min(.7,st.dayT+dt*sp*(st.mode==='ambient'?.004:.0012));
 ACT=st.id;pickChair();let thirsty=false;
 eachPlant(()=>{if(st.stage<0)return;plantUpdate(dt);const k=spotKey();st._pos={id:st.id,g:stageGroup(),k,x:SPOT[k].x,y:SPOT[k].y};if(want('thirst'))thirsty=true;});
 const hintOn=n=>st.hints==='always'||(st.hints==='auto'&&st.hint[n]<3);
 wob.can=thirsty&&hintOn('thirst')?Math.sin(T*9)*.12*(Math.sin(T*1.3)>0?1:0):0;
 seedTick(dt);breedTick(dt);socialTick(dt);}
function loop(now){const dt=Math.min(.1,(now-last)/1000);last=now;try{update(dt);}catch(e){showErr('update: '+e.message);}try{draw();}catch(e){showErr('draw: '+e.message);}requestAnimationFrame(loop);}
requestAnimationFrame(loop);
setInterval(()=>{if(st.started)save();if(dbgOpen)renderDbg();},1000);
startFlow();
