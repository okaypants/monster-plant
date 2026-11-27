"""The movie room: the curtains and the film.

Run from the repository root:  python tests/movieroom_test.py
The room opens over the main room with its curtains closed and no film loaded. A tap on the curtains opens or closes them in two steps
(closed, halfway, open); the remote starts and pauses the film; when the film ends the curtains close again. Each room has
a Leave button that opens a screen of rooms to choose from. The film itself is not fetched here: requests to the Internet Archive are blocked and play() is
stubbed, so the test needs no connection. A picture goes to tests/screenshots/movieroom/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "movieroom")
fails = []
def check(name, ok, got=""):
    print(("ok   " if ok else "FAIL ") + name + ("" if ok else "  got: " + str(got)))
    if not ok: fails.append(name)

async def main():
    os.makedirs(OUT, exist_ok=True); serve()
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1670, "height": 942}); await ctx.add_init_script(VIRTUAL_TIME)
        asked = []
        await ctx.route("**://*.youtube-nocookie.com/**", lambda r: asyncio.ensure_future(r.abort()))
        await ctx.route("**://cdn.star.nesdis.noaa.gov/**", lambda r: asyncio.ensure_future(r.abort()))
        await ctx.route("**://archive.org/**", lambda r: (asked.append(r.request.url), asyncio.ensure_future(r.abort())))
        pg = await ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html?test"); await pg.wait_for_function('typeof LOADED!=="undefined"&&LOADED', timeout=20000)
        await pg.evaluate("()=>{localStorage.clear();const s=fresh();Object.assign(s,{started:true,id:1,day:3,stage:6,species:4,dayT:.3});localStorage.setItem(KEY,JSON.stringify(s));}")
        await pg.reload(); await pg.wait_for_function('typeof LOADED!=="undefined"&&LOADED', timeout=20000)
        btn = pg.locator(".screen button").first
        if await btn.count(): await btn.click()
        # the way in: Leave in the study room opens the screen of rooms
        r = await pg.evaluate("()=>{__step(1);document.getElementById('leaveBtn').click();const c=[...document.querySelectorAll('.rmcard')];return {n:c.length,names:c.map(x=>x.textContent),room:roomNow()};}")
        check("Leave opens a screen with both rooms, marking where you are", r["n"] == 2 and "you are here" in r["names"][0] and r["names"][1] == "The movie room" and r["room"] == "main", r)
        await pg.screenshot(path=os.path.join(OUT, "rooms.png"))
        r = await pg.evaluate("()=>{document.querySelector('.rmcard[data-id=movie]').click();return {open:movieRoomOpen(),rooms:!!document.querySelector('.rooms')};}")
        check("choosing the movie room goes there", r["open"] and not r["rooms"], r)
        await pg.evaluate("()=>Promise.all([...document.querySelectorAll('.mvstage img')].map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r;})))")  # the test's clock is stopped, so wait on the pictures themselves
        r0 = await pg.evaluate("()=>{const t=document.querySelector('.mvtap'),v=document.querySelector('.mvstage video');t.click();__step(.6);const a=mvState,src=v.getAttribute('src');t.click();__step(.6);return {a,src,b:mvState,asked:0};}")
        check("a tap on the curtains before anything is chosen opens them on a black screen", r0["a"] == "open" and not r0["src"] and r0["b"] == "closed" and not asked, [r0, asked])
        r = await pg.evaluate("()=>{const v=document.querySelector('.mvstage video'),c=document.querySelector('.mvcurtain');return {open:movieRoomOpen(),state:mvState,src:v.getAttribute('src'),muted:v.muted,cur:c.getAttribute('src'),hidden:c.hidden};}")
        check("the room opens with its curtains closed and no film loaded", r["open"] and r["state"] == "closed" and not r["src"] and r["cur"].endswith("curtain_closed.png") and not r["hidden"], r)
        check("nothing is asked of the Internet Archive on entering", not asked, asked)
        await pg.screenshot(path=os.path.join(OUT, "curtains_closed.png"))
        # the screen sits where the picture's screen is
        g = await pg.evaluate("()=>{const s=document.querySelector('.mvstage').getBoundingClientRect(),v=document.querySelector('.mvstage video').getBoundingClientRect();return [(v.left-s.left)/s.width*1670,(v.top-s.top)/s.height*941,v.width/s.width*1670,v.height/s.height*941];}")
        check("the film sits behind the picture's screen", abs(g[0]-424) < 2 and abs(g[1]-118) < 2 and abs(g[2]-824) < 2 and abs(g[3]-468) < 2, g)
        r = await pg.evaluate("()=>{const v=document.querySelector('.mvstage video');window.__plays=0;v.play=()=>{window.__plays++;Object.defineProperty(v,'paused',{value:false,configurable:true});return Promise.resolve();};v.pause=()=>{Object.defineProperty(v,'paused',{value:true,configurable:true});};"
                              "(document.querySelector('.mvremote').click(),document.querySelector('.mvrplay').click());const menu=!!document.querySelector('.mvpick .mvtonight'),none=mvFilm===null&&!document.querySelector('.mvstage video').getAttribute('src');document.querySelectorAll('.mvpick .mvpfilm')[0].click();const a=mvState;__step(.1);const b=mvState;__step(.4);return {menu,none,a,b,c:mvState,plays:window.__plays,src:v.getAttribute('src'),hidden:document.querySelector('.mvcurtain').hidden,muted:v.muted,note:document.querySelector('.mvnote').textContent};}")
        check("with nothing chosen, Play opens the film menu and loads nothing", r["menu"] and r["none"], r)
        check("the remote opens the curtains in two steps and starts the film", r["a"] == "half" and r["b"] == "half" and r["c"] == "open" and r["plays"] == 1 and r["hidden"], r)
        check("the film comes from the Internet Archive and plays with its sound on", r["src"].startswith("https://archive.org/download/") and not r["muted"], r)
        check("the film's name shows", "A Trip to the Moon" in r["note"], r)
        r = await pg.evaluate("()=>{const c=document.querySelector('.mvseats'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let top=0,low=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x+=4){if(d[(y*c.width+x)*4+3]>0){if(y<697)top++;else low++;}}return {hidden:c.hidden,n:c.dataset.n,top,low};}")
        check("the monster sits on the couch as a dark shape while the curtains are open", not r["hidden"] and r["n"] == "1" and r["top"] > 500, r)
        r = await pg.evaluate("()=>{const v=document.querySelector('.mvstage video'),t=()=>(document.querySelector('.mvremote').click(),document.querySelector('.mvrplay').click());t();const a=v.paused;t();return {a,b:v.paused,state:mvState};}")
        check("the remote pauses the film and starts it again", r["a"] is True and r["b"] is False and r["state"] == "open", r)
        r = await pg.evaluate("()=>{const v=document.querySelector('.mvstage video');v.dispatchEvent(new Event('ended'));const a=mvState;__step(.5);const c=document.querySelector('.mvcurtain');return {a,b:mvState,cur:c.getAttribute('src'),hidden:c.hidden,seats:document.querySelector('.mvseats').hidden};}")
        check("when the film ends the curtains close", r["a"] == "half" and r["b"] == "closed" and r["cur"].endswith("curtain_closed.png") and not r["hidden"] and not r["seats"], r)
        r = await pg.evaluate("()=>{const v=document.querySelector('.mvstage video'),k=document.querySelector('.mvamp'),a=v.muted;k.click();const b=v.muted,note=document.querySelector('.mvnote').textContent;k.click();return {a,b,note,c:v.muted};}")
        check("the receiver turns the film's sound off and on, and it starts on", r["a"] is False and r["b"] is True and r["note"] == "Sound off." and r["c"] is False, r)
        r = await pg.evaluate("()=>{const m=document.querySelector('.movieroom'),k=document.querySelector('.mvknob'),b=()=>+m.style.getPropertyValue('--mvb'),L=[b()];for(let i=0;i<4;i++){k.click();L.push(b());}const note=document.querySelector('.mvnote').textContent;"
                              "k.click();k.click();k.click();const low=b();(document.querySelector('.mvremote').click(),document.querySelector('.mvrplay').click());__step(.6);const playing=b();mvLight=0;mvLightApply();const playUp=b();(document.querySelector('.mvremote').click(),document.querySelector('.mvrplay').click());const paused=b();mvScreen();__step(.5);return {L,note,low,playing,playUp,paused};}")
        r4 = await pg.evaluate("()=>{const m=document.querySelector('.movieroom'),k=document.querySelector('.mvknob').getBoundingClientRect(),st0=document.querySelector('.mvstage').getBoundingClientRect(),b0=m.style.getPropertyValue('--mvb');document.querySelectorAll('.mvlamp')[1].click();const b1=m.style.getPropertyValue('--mvb');mvLight=0;mvLightApply();return {w:k.width/st0.width*1670,h:k.height/st0.height*941,b0,b1,lamps:document.querySelectorAll('.mvlamp').length};}")
        check("the knob's tap area is roomy, and a tap on a wall lamp also turns the lights down", r4["w"] > 95 and r4["h"] > 95 and r4["lamps"] == 2 and r4["b0"] == "1" and r4["b1"] == "0.62", r4)
        r5 = await pg.evaluate("()=>{const k=document.querySelector('.mvknob'),t=document.querySelector('.mvknobtick'),P=()=>t.style.left+t.style.top,a=P();k.click();const b=P();k.click();k.click();k.click();return {moved:a!==b,back:P()===a,old:!!document.querySelector('.mvknobon')};}")
        check("the knob is the room's own picture at every setting, with a mark on its dial that moves", r5["moved"] and r5["back"] and not r5["old"], r5)
        check("the gold knob steps the room's light down and round again", r["L"] == [1, .62, .34, .14, 1] and r["note"] == "Lights up." and r["low"] == .14, r)
        r3 = await pg.evaluate("()=>{const sc=()=>[...document.querySelectorAll('.mvsconce')].map(e=>e.hidden);mvLight=0;mvLightApply();const up=sc();mvLight=2;mvLightApply();const low=sc();mvLight=0;mvLightApply();return {up,low};}")
        check("the wall lamps are lit while the lights are up and off when they are turned down", r3["up"] == [False, False] and r3["low"] == [True, True], r3)
        check("while a film plays the room is never brighter than low, and the knob can take it lower", r["playing"] == .14 and r["playUp"] == .62 and r["paused"] == 1, r)
        # the remote's channels: a satellite loop plays round and round on the room's screen, and an old television show plays there too, with no YouTube player
        r = await pg.evaluate("()=>{document.querySelector('.mvremote').click();const L=[...document.querySelectorAll('.mvremotep .mvpfilm')],n=L.length,play=document.querySelector('.mvrplay').textContent;L[0].click();__step(.6);const v=document.querySelector('.mvstage video'),src=v.getAttribute('src'),loop=v.loop,st1=mvState;"
                              "document.querySelector('.mvremote').click();[...document.querySelectorAll('.mvremotep .mvpfilm')][3].click();__step(1.2);const tsrc=v.getAttribute('src'),tloop=v.loop,st2=mvState,frame=!!document.querySelector('.mvtv'),yt=MV_LIVE.some(c=>c.yt),all=MV_LIVE.every(c=>c.src&&c.t&&c.by);"
                              "v.pause();mvSet('closed');mvFilm=MV_SHELVES[0].films[0];mvScreen();__step(.5);return {n,play,src,loop,st1,tsrc,tloop,st2,frame,yt,all};}")
        check("the remote lists play and eight channels, and a satellite channel plays round and round on the room's screen", r["n"] == 8 and r["play"] in ("▶️ Play", "⏸️ Pause", "🎞️ Film library") and "nesdis.noaa.gov" in r["src"] and r["loop"] and r["st1"] == "open", r)
        check("an old television show plays in the room's own screen like a film, and no channel uses YouTube's player", "archive.org/download/tales_of_tomorrow" in r["tsrc"] and not r["tloop"] and r["st2"] == "open" and not r["frame"] and not r["yt"] and r["all"], r)
        # the shelves: popcorn, soda, the glasses, the box set
        r = await pg.evaluate("()=>{const hot=k=>[...document.querySelectorAll('.mvthing')].find(b=>b.dataset.k===k);st.full=0;st.needs.thirst=.8;hot('buckets').click();const tiles=document.querySelectorAll('.mvtile').length;document.querySelector('.mvtile[data-id=caramel]').click();"
                              "const full=st.full,note1=document.querySelector('.mvnote').textContent,pop=true;hot('cups').click();const sodas=document.querySelectorAll('.mvtile').length;document.querySelector('.mvtile[data-id=blue]').click();"
                              "const thirst=st.needs.thirst,note2=document.querySelector('.mvnote').textContent;hot('glasses').click();const tint=document.querySelector('.movieroom').dataset.tint;hot('glasses').click();hot('glasses').click();hot('glasses').click();const tint0=document.querySelector('.movieroom').dataset.tint;"
                              "hot('books').click();const L=[...document.querySelectorAll('.mvbooks .mvpfilm')],books=L.length,el=L.find(b=>b.textContent.includes('First Book of Elvish'));el.click();const title=document.querySelector('.mvread h2').textContent,p1=document.querySelector('.mvrtext').textContent;document.querySelector('.mvrnext').click();const p2=document.querySelector('.mvrtext').textContent;mvTrayClose();"
                              "hot('boxset').click();const kal=kalimbaOpen(),ksrc=document.querySelector('.kalimba iframe').getAttribute('src');closeKalimba();"
                              "return {tiles,full,note1,pop,sodas,thirst,note2,tint,tint0,books,title,p1:p1.length,turned:p1!==p2,kal,ksrc,gone:!kalimbaOpen()};}")
        check("popcorn comes in five kinds; with one monster it goes straight to it and fills it", r["tiles"] == 5 and r["full"] > .3 and "caramel popcorn" in r["note1"] and "Bun" not in r["note1"] or r["tiles"] == 5 and r["full"] > .3, r)
        check("there are four drinks, and the monster given one is no longer thirsty", r["sodas"] == 4 and r["thirst"] == 0 and "beetle brew" in r["note2"], r)
        check("the 3D glasses tint the film and come back round to plain", r["tint"] == "amber" and r["tint0"] == "", r)
        check("the row of books holds the film books and the three trilogy books, read a page at a time", r["books"] >= 14 and r["title"] == "A First Book of Elvish" and r["p1"] > 60 and r["turned"], r)
        check("the box set's place opens the Kalimbasizer and it closes again", r["kal"] and r["ksrc"].startswith("kalimba.html") and r["gone"], r)
        # a soundtrack kept for a film is offered by the receiver and plays in its place
        r = await pg.evaluate("async()=>{const f0=mvFilm,f=MV_SHELVES[0].films[0];await scorePut(f,{blob:new Blob([new Uint8Array(400)],{type:'audio/webm'}),mime:'audio/webm',dur:3});await mvScoresLoad();mvFilm=f;mvMode='film';const has=mvHasScore(f),k=document.querySelector('.mvamp'),v=document.querySelector('.mvstage video');k.click();const m1=mvMode,n1=document.querySelector('.mvnote').textContent,mu1=v.muted;k.click();const m2=mvMode;k.click();const m3=mvMode,mu3=v.muted;await scoreDrop(f);await mvScoresLoad();return {has,m1,n1,mu1,m2,m3,mu3,after:mvHasScore(f)};}")
        check("a film with a soundtrack of your own gets a third setting on the receiver, and the film's own sound is muted for it", r["has"] and r["m1"] == "mine" and r["n1"] == "Your soundtrack." and r["mu1"] is True and r["m2"] == "off" and r["m3"] == "film" and r["mu3"] is False and r["after"] is False, r)
        # the play: favourites, throwing, burps, holding the machine, intermission
        r = await pg.evaluate("()=>{const w=mvWho[0],fav=MV_FAV(w),name=MV_CORN.find(q=>q[0]===fav)[1];mvGive(w,'corn',fav,name);const loves=document.querySelector('.mvnote').textContent,hop=w.hop;__step(1.2);const b=document.querySelector('.mvcorn'+w.id),under=true;"
                              "mvFx=[];document.querySelector('.mvwho').click();const thrown=mvFx.length,up=mvFx.every(p=>p.vy<0);mvGive(w,'soda','swamp','Swamp fizz');const sw=w.soda,cupEl=document.querySelector('.mvcup'+w.id),cup=!!cupEl,R=e=>{if(!e)return [NaN,NaN];const q=e.getBoundingClientRect();return [q.left,q.right]},rb=R(b),rc=R(cupEl),rw=R(document.querySelector('.mvwho')),side=rb[0]>=rw[1]-1&&rc[0]>=rb[1]-1;"
                              "const m=[...document.querySelectorAll('.mvthing')].find(q=>q.dataset.k==='machine');m.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));const popping=!!mvPopping;__step(4,16);const spilled=mvPopping&&mvPopping.spilled;m.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));const tray=!!document.querySelector('.mvoffer');mvTrayClose();m.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));m.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));const tapPops=!!mvPopping&&!document.querySelector('.mvoffer');__step(1.5,16);const tapTray=!!document.querySelector('.mvoffer')&&!mvPopping;mvTrayClose();"
                              "return {tapPops,tapTray,loves,hop,thrown,up,sw,cup,under,side,green:getComputedStyle(cupEl).filter.includes('hue-rotate'),popping,spilled,tray,seats:document.querySelector('.mvseats').hidden,who:document.querySelectorAll('.mvwho').length};}")
        check("a monster given its favourite popcorn hops, and the game says it loves it", " loves " in r["loves"] and r["hop"] == 6, r)
        check("a tap on a monster that has popcorn throws some up at the screen", r["under"] and r["thrown"] >= 6 and r["up"], r)
        check("swamp fizz goes to the monster, and the bucket and cup stand beside it without overlapping it or each other", r["sw"] == "swamp" and r["cup"] and r["side"] and r["green"], r)
        check("holding the machine pops, overflows after a while, and letting go offers the kinds", r["popping"] and r["spilled"] and r["tray"], r)
        check("a quick tap on the machine still pops for a moment before offering the kinds", r["tapPops"] and r["tapTray"], r)
        check("the monsters sit on the couch from the start and can be tapped", r["seats"] is False and r["who"] == 1, r)
        r = await pg.evaluate("()=>{const v=document.querySelector('.mvstage video');mvFilm=MV_SHELVES[5].films[0]||MV_SHELVES[0].films[1];mvSet('open');mvEl.dataset.paused='';v.dataset.film=mvSrc(mvFilm);v.src=v.dataset.film;Object.defineProperty(v,'duration',{value:1200,configurable:true});Object.defineProperty(v,'currentTime',{value:601,writable:true,configurable:true});Object.defineProperty(v,'paused',{value:false,configurable:true});"
                              "mvLight=2;mvInterCheck();const on=!!mvInter,up=mvLight;__step(.6);const st1=mvState,note=document.querySelector('.mvnote').textContent;mvScreen();__step(.6);const off=!mvInter,back=mvLight,st2=mvState;mvInterCheck();const again=!!mvInter;v.pause();mvLight=0;mvLightApply();mvScreen();__step(.6);return {on,up,st1,note,off,back,st2,again};}")
        check("halfway through a long film the curtains close for an intermission with the lights up, and a tap goes on", r["on"] and r["up"] == 0 and r["st1"] == "closed" and r["note"].startswith("Intermission") and r["off"] and r["back"] == 2 and r["st2"] == "open" and not r["again"], r)
        # your films: a kept soundtrack is listed under its title with its size, plays with its card, counts against the limit, and can be removed
        r = await pg.evaluate("async()=>{const f0=mvFilm,f=MV_SHELVES[0].films[0];await scorePut(f,{blob:new Blob([new Uint8Array(2000)]),mime:'audio/webm',dur:65,title:'Moon Song',by:'Mortie',card:1});await mvScoresLoad();mvPick(MV_MINE);await scoreList();await scoreList();"
                              "const tabs=[...document.querySelectorAll('.mvptab')].map(b=>b.textContent),row=document.querySelector('.mvmine .mvpfilm'),text=row?row.textContent:'',use=document.querySelector('.mvmineuse').textContent,fits=await scoreRoom(f,1000),over=await scoreRoom(MV_SHELVES[0].films[1],SCORES_MAX);"
                              "row&&row.click();const mode=mvMode,film=mvFilm&&mvFilm.id,want=mvCardNext&&mvCardNext.title;__step(1.5);const card=document.querySelector('.mvcard').textContent;mvPick(MV_MINE);await scoreList();await scoreList();document.querySelector('.mvminex').click();await scoreList();await scoreList();await scoreList();const left=(await scoreList()).length;mvPickClose();__step(1);document.querySelector('.mvstage video').pause();mvSet('closed');mvCardNext=null;mvLast=MV_SHELVES[0];mvFilm=f0;mvMode='film';mvSoundApply();return {tabs,text,use,fits,over,mode,film,want,card,left,same:film===f.id};}")
        check("Your films lists a kept soundtrack under the film with who scored it, its length and size, plays it as yours with its title card, holds to the size limit, and Remove takes it off", r["tabs"][-1] == "Your films" and "A Trip to the Moon" in r["text"] and "Moon Song" not in r["text"] and "scored by Mortie" in r["text"] and "1:05" in r["text"] and "2 KB" in r["text"] and "40.0 MB" in r["use"] and r["fits"] and not r["over"] and r["mode"] == "mine" and r["same"] and "A Trip to the Moon" in r["card"] and "Moon Song" not in r["card"] and "scored by Mortie" in r["card"] and "Kalimbasizer" not in r["card"] and r["left"] == 0, r)
        # a soundtrack goes out as one small file and comes back in beside your own; a file for no film here, or not a soundtrack, is turned away
        r = await pg.evaluate("async()=>{const f=MV_SHELVES[0].films[0];await scorePut(f,{blob:new Blob([new Uint8Array(3000)],{type:'audio/webm'}),mime:'audio/webm',dur:30,title:'Mine',by:'Me',card:2});const file=await scoreFile(scoreKey(f)),back=await scoreFromFile(file);"
                              "mvPick(MV_MINE);await mvAddFile(file);const L=await scoreList(),other=L.find(q=>q.from);await mvScoresLoad();mvScorePick=other.key;const use=mvScoreFor(f);mvScorePick='';const own=mvScoreFor(f);"
                              "let bad='';try{await scoreFromFile(new File([new Uint8Array(50)],'x.mpscore'))}catch(e){bad=e.message}const stray=await scoreFile(scoreKey(f)),rec=await scoreFromFile(stray);rec.key='nofilm/x.mp4';const n0=(await scoreList()).length;await mvAddFile(new File([new TextEncoder().encode('junk junk junk')],'j.mpscore'));"
                              "const share=document.querySelectorAll('.mvmines').length,add=!!document.querySelector('.mvmineadd');for(const q of await scoreList())await scoreDropKey(q.key);await mvScoresLoad();mvPickClose();mvLast=MV_SHELVES[0];return {name:file.name,size:file.size,back:[back.key===scoreKey(f),back.title,back.by,back.card,back.blob.size],n:L.length,otherBy:other&&other.by,use:use===other.key,own:own===scoreKey(f),bad,n0,share,add,left:(await scoreList()).length};}")
        check("a soundtrack is shared as one small file and added back beside your own, with Share on each and a button to add one; junk is turned away", r["name"] == "A Trip to the Moon scored by Me.mpscore" and r["size"] < 3400 and r["back"] == [True, "Mine", "Me", 2, 3000] and r["n"] == 2 and r["otherBy"] == "Me" and r["use"] and r["own"] and r["bad"] and r["n0"] == 2 and r["share"] == 2 and r["add"] and r["left"] == 0, r)
        # the drawers: decorations, cat toys, string lights
        r = await pg.evaluate("()=>{const hot=k=>[...document.querySelectorAll('.mvthing')].find(b=>b.dataset.k===k);hot('dr_decor').click();const nd=document.querySelectorAll('.mvdrawer .mvdt').length;document.querySelector('.mvdrawer .mvdt[data-id=harvest]').click();const dec=st.mvDecor,g=document.querySelector('.mvgarland'),fl=document.querySelector('.mvfloorpiece'),gs=g&&g.getAttribute('src'),fs=fl&&fl.getAttribute('src'),n1=document.querySelector('.mvnote').textContent;"
                              "hot('dr_lights').click();const nl=document.querySelectorAll('.mvdrawer .mvdt').length;document.querySelector('.mvdrawer .mvdt[data-id=star]').click();const li=st.mvLights;hot('dr_toys').click();const nt=document.querySelectorAll('.mvdrawer .mvdt').length;document.querySelector('.mvdrawer .mvdt[data-id=yarn]').click();const toy=!!document.querySelector('.mvtoy'),pose=document.querySelector('.mvcat').dataset.pose,n3=document.querySelector('.mvnote').textContent;"
                              "hot('dr_decor').click();document.querySelector('.mvdrawer .mvdt[data-id=\\'\\']').click();return {nd,dec,gs,fs,n1,nl,li,nt,toy,pose,n3,down:st.mvDecor,hid:document.querySelector('.mvgarland').hidden,label:document.querySelector('.mvback').textContent+'|'+document.getElementById('leaveBtn').textContent};}")
        check("the decorations drawer lists the thirty occasions and hangs the garland on the couch back with the floor piece by the rug", r["nd"] == 30 and r["dec"] == "harvest" and r["gs"] == "decor/harvest_w.png" and r["fs"] == "decor/harvest_f.png" and "Harvest" in r["n1"], r)
        check("the string lights drawer hangs a strand, and the cat toys drawer gets the cat playing", r["nl"] == 7 and r["li"] == "star" and r["nt"] == 5 and r["toy"] and r["pose"] == "playbow" and "pounces on the ball of yarn" in r["n3"], r)
        check("the decorations can be taken down again, and the way out reads Rooms with a door", r["down"] == "" and r["hid"] and r["label"] == "🚪 Rooms|🚪 Rooms", r)
        # the cat: asleep somewhere in the room, wakes to a tap, takes a pet, goes back to sleep
        r = await pg.evaluate("()=>{clearTimeout(mvCatT);mvCatSleep();const c=document.querySelector('.mvcat'),a=[c.hidden,c.dataset.pose,mvCat.awake];c.click();const b=c.dataset.pose;c.click();__step(.3);const p1=c.dataset.pose;__step(.5);const p2=c.dataset.pose;__step(13);return {a,b,p1,p2,end:c.dataset.pose,awake:mvCat.awake,spot:[mvCat.x,mvCat.y]};}")
        check("the cat sleeps in the movie room, sits up at a tap, takes a pet and goes back to sleep", r["a"][0] is False and r["a"][1] in ("loaf2", "curl1", "side1") and r["a"][2] is False and r["b"] == "sit1" and r["p1"] == "pet2" and r["p2"] == "sit2" and r["end"] == r["a"][1] and r["awake"] is False, r)
        # the screen: a tap opens the curtains and another closes them, without starting the film
        r = await pg.evaluate("()=>{const t=document.querySelector('.mvtap'),p0=window.__plays;t.click();__step(.5);const a=mvState,p1=window.__plays;t.click();__step(.5);return {a,b:mvState,started:p1-p0,seats:document.querySelector('.mvseats').hidden};}")
        check("a tap on the screen opens the curtains and another closes them, and the film does not start", r["a"] == "open" and r["b"] == "closed" and r["started"] == 0 and not r["seats"], r)
        # the collection: a tap on the tapes opens their list, and choosing a film plays it
        r = await pg.evaluate("()=>{[...document.querySelectorAll('.mvhot')].find(b=>b.dataset.shelf===String(MV_SHELVES.findIndex(q=>q.id==='vhs'))).click();const L=[...document.querySelectorAll('.mvpfilm')];const n=L.length,title=document.querySelector('.mvplist h2').textContent;L[2].click();__step(.6);"
                              "const v=document.querySelector('.mvstage video');return {n,title,pick:!!document.querySelector('.mvpick'),state:mvState,src:v.getAttribute('src'),note:document.querySelector('.mvnote').textContent,shelves:MV_SHELVES.length,all:MV_SHELVES.every(s=>s.films.every(f=>f.t&&f.by&&f.len&&f.id&&f.f))};}")
        check("a tap on the tapes lists that shelf's films", r["n"] == 6 and r["title"] == "Magic lantern" and r["shelves"] == 6 and r["all"], r)
        r2 = await pg.evaluate("()=>{mvPick(MV_SHELVES.find(q=>q.id==='swim'));const tabs=[...document.querySelectorAll('.mvptab')].map(b=>b.textContent);document.querySelectorAll('.mvptab')[1].click();const t=document.querySelector('.mvplist h2').textContent,n=document.querySelectorAll('.mvpfilm').length;mvPickClose();return {tabs,t,n};}")
        check("every film thing opens the one menu, with all six collections and Your films as buttons at the top", len(r2["tabs"]) == 7 and r2["tabs"][-1] == "Your films" and r2["t"] == r2["tabs"][1] and r2["n"] >= 4, r2)
        check("choosing a film opens the curtains on it", not r["pick"] and r["state"] == "open" and "fairies" in r["src"].lower() and "Fairies" in r["note"], r)
        r = await pg.evaluate("()=>{const v=document.querySelector('.mvstage video');v.dispatchEvent(new Event('ended'));__step(.5);return mvState;}")
        check("that film ends and the curtains close", r == "closed", r)
        r = await pg.evaluate("()=>{const t=mvTonight();mvPick();document.querySelector('.mvtonight').click();__step(.6);const note=document.querySelector('.mvnote').textContent,same=mvFilm===t,st1=mvState;"
                              "document.querySelector('.mvstage video').dispatchEvent(new Event('ended'));__step(.5);mvPick(MV_SHELVES.find(q=>q.films.includes(mvTonight())));"
                              "const seen=[...document.querySelectorAll('.mvpfilm span')].filter(x=>x.textContent.endsWith('seen')).length;document.querySelector('.mvpx').click();return {note,same,st1,seen,list:mvSeen().length};}")
        check("the button at the top of the film menu puts on tonight's film", r["same"] and r["st1"] == "open" and r["note"].startswith("Tonight"), r)
        check("films watched to the end are marked seen in their list", r["list"] >= 2 and r["seen"] >= 1, r)
        r = await pg.evaluate("()=>{document.querySelector('.mvtap').click();__step(.5);const v=document.querySelector('.mvstage video');document.querySelector('.mvback').click();const paused=v.paused,here=document.querySelector('.rmcard[data-id=movie]').textContent;"
                              "document.querySelector('.rmcard[data-id=main]').click();return {paused,here,open:movieRoomOpen(),left:!!document.querySelector('.movieroom'),rooms:!!document.querySelector('.rooms')};}")
        check("Leave in the movie room pauses the film, and choosing the study room goes back", r["paused"] is True and "you are here" in r["here"] and not r["open"] and not r["left"] and not r["rooms"], r)
        check("no page errors", not errs, errs[:3])
        await b.close()
    print("\n%d failed" % len(fails) if fails else "\nall passed"); sys.exit(1 if fails else 0)

asyncio.run(main())
