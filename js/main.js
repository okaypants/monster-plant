'use strict';
/* Main: the game loop. Loads last, then starts everything. */
/* ---------- loop ---------- */
function update(dt){const sp=gameSpeed();T+=dt;catUpdate(PAUSED?0:dt);
 capTick();
 if(blink>0)blink-=dt;else if(Math.random()<dt*.35)blink=.14;
 for(let i=parts.length-1;i>=0;i--){const q=parts[i];q.t-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=q.g*dt;if(q.t<=0)parts.splice(i,1);}
 if(!st.started||plantCount()===0)return;
 if(!st.night&&st.mode!=='actions')st.dayT=Math.min(.7,st.dayT+dt*sp*(st.mode==='ambient'?.004:.0012));
 ACT=st.id;pickChair();
 eachPlant(()=>{if(st.stage<0)return;plantUpdate(dt);const k=spotKey();st._pos={id:st.id,g:stageGroup(),k,x:SPOT[k].x,y:SPOT[k].y,box:plantBoxRaw()};}); // box: so nobody is dropped or walks on top of it
 seedTick(dt);breedTick(dt);socialTick(dt);}
function loop(now){const dt=Math.min(.1,(now-last)/1000);last=now;try{update(dt);}catch(e){showErr('update: '+e.message);}try{draw();}catch(e){showErr('draw: '+e.message);}requestAnimationFrame(loop);}
requestAnimationFrame(loop);
setInterval(()=>{if(st.started)save();if(dbgOpen)dbgSync();},500);
startFlow();
