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
        r = await pg.evaluate("()=>{const v=document.querySelector('.mvstage video'),c=document.querySelector('.mvcurtain');return {open:movieRoomOpen(),state:mvState,src:v.getAttribute('src'),muted:v.muted,cur:c.getAttribute('src'),hidden:c.hidden};}")
        check("the room opens with its curtains closed and no film loaded", r["open"] and r["state"] == "closed" and not r["src"] and r["cur"].endswith("curtain_closed.png") and not r["hidden"], r)
        check("nothing is asked of the Internet Archive on entering", not asked, asked)
        await pg.screenshot(path=os.path.join(OUT, "curtains_closed.png"))
        # the screen sits where the picture's screen is
        g = await pg.evaluate("()=>{const s=document.querySelector('.mvstage').getBoundingClientRect(),v=document.querySelector('.mvstage video').getBoundingClientRect();return [(v.left-s.left)/s.width*1670,(v.top-s.top)/s.height*941,v.width/s.width*1670,v.height/s.height*941];}")
        check("the film sits behind the picture's screen", abs(g[0]-424) < 2 and abs(g[1]-118) < 2 and abs(g[2]-824) < 2 and abs(g[3]-468) < 2, g)
        r = await pg.evaluate("()=>{const v=document.querySelector('.mvstage video');window.__plays=0;v.play=()=>{window.__plays++;Object.defineProperty(v,'paused',{value:false,configurable:true});return Promise.resolve();};v.pause=()=>{Object.defineProperty(v,'paused',{value:true,configurable:true});};"
                              "(document.querySelector('.mvremote').click(),document.querySelector('.mvrplay').click());const a=mvState;__step(.1);const b=mvState;__step(.4);return {a,b,c:mvState,plays:window.__plays,src:v.getAttribute('src'),hidden:document.querySelector('.mvcurtain').hidden,muted:v.muted,note:document.querySelector('.mvnote').textContent};}")
        check("the remote opens the curtains in two steps and starts the film", r["a"] == "half" and r["b"] == "half" and r["c"] == "open" and r["plays"] == 1 and r["hidden"], r)
        check("the film comes from the Internet Archive and plays with its sound on", r["src"].startswith("https://archive.org/download/") and not r["muted"], r)
        check("the film's name shows", "A Trip to the Moon" in r["note"], r)
        r = await pg.evaluate("()=>{const c=document.querySelector('.mvseats'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let top=0,low=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x+=4){if(d[(y*c.width+x)*4+3]>0){if(y<697)top++;else low++;}}return {hidden:c.hidden,n:c.dataset.n,top,low};}")
        check("the monster sits on the couch as a dark shape while the curtains are open", not r["hidden"] and r["n"] == "1" and r["top"] > 500, r)
        r = await pg.evaluate("()=>{const v=document.querySelector('.mvstage video'),t=()=>(document.querySelector('.mvremote').click(),document.querySelector('.mvrplay').click());t();const a=v.paused;t();return {a,b:v.paused,state:mvState};}")
        check("the remote pauses the film and starts it again", r["a"] is True and r["b"] is False and r["state"] == "open", r)
        r = await pg.evaluate("()=>{const v=document.querySelector('.mvstage video');v.dispatchEvent(new Event('ended'));const a=mvState;__step(.5);const c=document.querySelector('.mvcurtain');return {a,b:mvState,cur:c.getAttribute('src'),hidden:c.hidden,seats:document.querySelector('.mvseats').hidden};}")
        check("when the film ends the curtains close", r["a"] == "half" and r["b"] == "closed" and r["cur"].endswith("curtain_closed.png") and not r["hidden"] and r["seats"], r)
        r = await pg.evaluate("()=>{const v=document.querySelector('.mvstage video'),k=document.querySelector('.mvamp'),a=v.muted;k.click();const b=v.muted,note=document.querySelector('.mvnote').textContent;k.click();return {a,b,note,c:v.muted};}")
        check("the receiver turns the film's sound off and on, and it starts on", r["a"] is False and r["b"] is True and r["note"] == "Sound off." and r["c"] is False, r)
        r = await pg.evaluate("()=>{const m=document.querySelector('.movieroom'),k=document.querySelector('.mvknob'),b=()=>+m.style.getPropertyValue('--mvb'),L=[b()];for(let i=0;i<4;i++){k.click();L.push(b());}const note=document.querySelector('.mvnote').textContent;"
                              "k.click();k.click();k.click();const low=b();(document.querySelector('.mvremote').click(),document.querySelector('.mvrplay').click());__step(.6);const playing=b();mvLight=0;mvLightApply();const playUp=b();(document.querySelector('.mvremote').click(),document.querySelector('.mvrplay').click());const paused=b();mvScreen();__step(.5);return {L,note,low,playing,playUp,paused};}")
        r4 = await pg.evaluate("()=>{const m=document.querySelector('.movieroom'),k=document.querySelector('.mvknob').getBoundingClientRect(),st0=document.querySelector('.mvstage').getBoundingClientRect(),b0=m.style.getPropertyValue('--mvb');document.querySelectorAll('.mvlamp')[1].click();const b1=m.style.getPropertyValue('--mvb');mvLight=0;mvLightApply();return {w:k.width/st0.width*1670,h:k.height/st0.height*941,b0,b1,lamps:document.querySelectorAll('.mvlamp').length};}")
        check("the knob's tap area is roomy, and a tap on a wall lamp also turns the lights down", r4["w"] > 95 and r4["h"] > 95 and r4["lamps"] == 2 and r4["b0"] == "1" and r4["b1"] == "0.62", r4)
        check("the gold knob steps the room's light down and round again", r["L"] == [1, .62, .34, .14, 1] and r["note"] == "Lights up." and r["low"] == .14, r)
        r3 = await pg.evaluate("()=>{const sc=()=>[...document.querySelectorAll('.mvsconce')].map(e=>e.hidden);mvLight=0;mvLightApply();const up=sc();mvLight=2;mvLightApply();const low=sc();mvLight=0;mvLightApply();return {up,low};}")
        check("the wall lamps are lit while the lights are up and off when they are turned down", r3["up"] == [False, False] and r3["low"] == [True, True], r3)
        check("while a film plays the room is never brighter than low, and the knob can take it lower", r["playing"] == .14 and r["playUp"] == .62 and r["paused"] == 1, r)
        # the remote's live channels: a satellite loop plays on the room's screen; a live camera opens close up in YouTube's player
        r = await pg.evaluate("()=>{document.querySelector('.mvremote').click();const L=[...document.querySelectorAll('.mvremotep .mvpfilm')],n=L.length,play=document.querySelector('.mvrplay').textContent;L[0].click();__step(.6);const v=document.querySelector('.mvstage video'),src=v.getAttribute('src'),loop=v.loop,st1=mvState;"
                              "document.querySelector('.mvremote').click();[...document.querySelectorAll('.mvremotep .mvpfilm')][2].click();const f=document.querySelector('.mvtv iframe'),ysrc=f&&f.getAttribute('src'),paused=v.paused,box=document.querySelector('.mvtvbox').getBoundingClientRect();document.querySelector('.mvtvx').click();"
                              "const gone=!document.querySelector('.mvtv');mvFilm=MV_SHELVES[0].films[0];mvScreen();__step(.5);return {n,play,src,loop,st1,ysrc,paused,w:box.width,h:box.height,gone};}")
        check("the remote lists play and five live channels, and a satellite channel plays round and round on the room's screen", r["n"] == 5 and r["play"] in ("Play", "Pause") and "nesdis.noaa.gov" in r["src"] and r["loop"] and r["st1"] == "open", r)
        check("a live camera opens close up in YouTube's own player, large and alone, and closes again", r["ysrc"].startswith("https://www.youtube-nocookie.com/embed/") and r["paused"] and r["w"] >= 200 and r["h"] >= 200 and r["gone"], r)
        # the shelves: popcorn, soda, the glasses, the box set
        r = await pg.evaluate("()=>{const hot=k=>[...document.querySelectorAll('.mvthing')].find(b=>b.dataset.k===k);st.full=0;st.needs.thirst=.8;hot('machine').click();const tiles=document.querySelectorAll('.mvtile').length;document.querySelector('.mvtile[data-id=caramel]').click();"
                              "const full=st.full,note1=document.querySelector('.mvnote').textContent,pop=!!document.querySelector('.mvpop');hot('cups').click();const sodas=document.querySelectorAll('.mvtile').length;document.querySelector('.mvtile[data-id=blue]').click();"
                              "const thirst=st.needs.thirst,note2=document.querySelector('.mvnote').textContent;hot('glasses').click();const tint=document.querySelector('.movieroom').dataset.tint;hot('glasses').click();hot('glasses').click();hot('glasses').click();const tint0=document.querySelector('.movieroom').dataset.tint;"
                              "hot('boxset').click();const books=document.querySelectorAll('.mvbooks .mvpfilm').length;document.querySelectorAll('.mvbooks .mvpfilm')[1].click();const title=document.querySelector('.mvread h2').textContent,p1=document.querySelector('.mvrtext').textContent;document.querySelector('.mvrnext').click();const p2=document.querySelector('.mvrtext').textContent;mvTrayClose();"
                              "return {tiles,full,note1,pop,sodas,thirst,note2,tint,tint0,books,title,p1:p1.length,turned:p1!==p2};}")
        check("the popcorn machine offers five kinds and feeds the monster", r["tiles"] == 5 and r["full"] > .3 and r["note1"] == "Caramel popcorn for the couch." and r["pop"], r)
        check("the cups offer three sodas and nobody is left thirsty", r["sodas"] == 3 and r["thirst"] == 0 and r["note2"] == "Blueberry soda for the couch.", r)
        check("the 3D glasses tint the film and come back round to plain", r["tint"] == "amber" and r["tint0"] == "", r)
        check("the box set opens three books that turn a page at a time", r["books"] == 3 and r["title"] == "A First Book of Elvish" and r["p1"] > 60 and r["turned"], r)
        # the cat: asleep somewhere in the room, wakes to a tap, takes a pet, goes back to sleep
        r = await pg.evaluate("()=>{const c=document.querySelector('.mvcat'),a=[c.hidden,c.dataset.pose,mvCat.awake];c.click();const b=c.dataset.pose;c.click();__step(.3);const p1=c.dataset.pose;__step(.5);const p2=c.dataset.pose;__step(13);return {a,b,p1,p2,end:c.dataset.pose,awake:mvCat.awake,spot:[mvCat.x,mvCat.y]};}")
        check("the cat sleeps in the movie room, sits up at a tap, takes a pet and goes back to sleep", r["a"][0] is False and r["a"][1] in ("loaf2", "curl1", "side1") and r["a"][2] is False and r["b"] == "sit1" and r["p1"] == "pet2" and r["p2"] == "sit2" and r["end"] == r["a"][1] and r["awake"] is False, r)
        # the screen: a tap opens the curtains and another closes them, without starting the film
        r = await pg.evaluate("()=>{const t=document.querySelector('.mvtap'),p0=window.__plays;t.click();__step(.5);const a=mvState,p1=window.__plays;t.click();__step(.5);return {a,b:mvState,started:p1-p0,seats:document.querySelector('.mvseats').hidden};}")
        check("a tap on the screen opens the curtains and another closes them, and the film does not start", r["a"] == "open" and r["b"] == "closed" and r["started"] == 0 and r["seats"], r)
        # the collection: a tap on the tapes opens their list, and choosing a film plays it
        r = await pg.evaluate("()=>{[...document.querySelectorAll('.mvhot')].find(b=>b.dataset.shelf===String(MV_SHELVES.findIndex(q=>q.id==='vhs'))).click();const L=[...document.querySelectorAll('.mvpfilm')];const n=L.length,title=document.querySelector('.mvplist h2').textContent;L[2].click();__step(.6);"
                              "const v=document.querySelector('.mvstage video');return {n,title,pick:!!document.querySelector('.mvpick'),state:mvState,src:v.getAttribute('src'),note:document.querySelector('.mvnote').textContent,shelves:MV_SHELVES.length,all:MV_SHELVES.every(s=>s.films.every(f=>f.t&&f.by&&f.len&&f.id&&f.f))};}")
        check("a tap on the tapes lists that shelf's films", r["n"] == 6 and r["title"] == "Magic lantern" and r["shelves"] == 6 and r["all"], r)
        r2 = await pg.evaluate("()=>{mvPick(MV_SHELVES.find(q=>q.id==='swim'));const tabs=[...document.querySelectorAll('.mvptab')].map(b=>b.textContent);document.querySelectorAll('.mvptab')[1].click();const t=document.querySelector('.mvplist h2').textContent,n=document.querySelectorAll('.mvpfilm').length;mvPickClose();return {tabs,t,n};}")
        check("every film thing opens the one menu, with all six collections as buttons at the top", len(r2["tabs"]) == 6 and r2["t"] == r2["tabs"][1] and r2["n"] >= 4, r2)
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
