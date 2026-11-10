"""The ARCHIVE drawer: the journals of monsters who have moved out.

Run from the repository root:  python3 tests/archive_shots.py
Checks: an old save loads with an empty archive and the drawer shows the note; moveOut() freezes the journal, takes the monster
out of the room, its name tag and its ribbon, and captions it; the archive survives a reload; the drawer shows one closed book
per monster; a book opens a read-only keepsake (no renaming, no charm toggling, frozen against later changes) ending in
"Out in the world"; the x goes back to the drawer and then closes it; everything fits an iPhone with no scrolling; debug's
Move out never touches the real save. Pictures go to tests/screenshots/archive/. Exit code 1 if a check fails.
"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "archive")
OLD_SAVE = ("()=>{const s=fresh();delete s.archive;Object.assign(s,{started:true,stage:8,species:3,id:1,day:42,dayT:.3,giftSeed:1,mode:'actions',curtain:'open',catTrust:.1,"
            "name:'Tuffet Mossmuffin',free:{x:300,y:918},traits:['Pizza bow'],titles:['evil'],quirks:{bonk:'x'},nge:0,nlc:0,ge:0,lc:0,"
            "others:[Object.assign(freshPlant(),{id:2,stage:8,species:7,name:'Mortie Gloomsnack',free:{x:760,y:918},traits:['Pizza bow','Moss sprout'],titles:['evil'],quirks:{bonk:'x',boo:'x'},fav:'blood',nge:0,nlc:0,ge:0,lc:0})],nextId:2});"
            "localStorage.setItem(KEY,JSON.stringify(s));}")
NO_SCROLL = "()=>{const b=document.querySelector('.jbook'),P=[...document.querySelectorAll('.jpage')];return b.scrollHeight<=b.clientHeight+1&&P.every(p=>p.scrollHeight<=p.clientHeight+1&&p.scrollWidth<=p.clientWidth+1);}"
FITS = "()=>{const r=document.querySelector('.jcover').getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;}"
SAVED = "()=>JSON.parse(localStorage.getItem(KEY))"


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    check = lambda ok, msg: ok or fails.append(msg)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1440, "height": 812}, device_scale_factor=2)
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))

        async def begin():
            await pg.click(".screen button")
            await pg.evaluate("()=>{__step(1);capClear();}")

        async def tap_drawer():
            c = await pg.evaluate("()=>{const r=cv.getBoundingClientRect();return [r.left+1127*S,r.top+650*S];}")
            await pg.mouse.click(*c)

        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate(OLD_SAVE)
        await pg.reload(wait_until="load")
        await begin()

        # an old save: empty archive, and the drawer opens on the note in stepped frames
        check(await pg.evaluate("()=>Array.isArray(st.archive)&&st.archive.length===0"), "an old save didn't load with an empty archive")
        await tap_drawer()
        frames = [await pg.evaluate("()=>document.querySelector('.jbook').style.transform")]
        for _ in range(2):
            await pg.evaluate("()=>__step(.085)")
            frames.append(await pg.evaluate("()=>document.querySelector('.jbook').style.transform"))
        check(len(set(frames)) == 3 and frames[-1] == await pg.evaluate("()=>{fitBook();return document.querySelector('.jbook').style.transform;}"), f"the drawer should open in 3 stepped frames: {frames}")
        note = await pg.evaluate("()=>[...document.querySelectorAll('.jarchnote')].map(n=>n.textContent)")
        check(note == await pg.evaluate("()=>ARCHIVE_NOTE") and len(note) == 5, f"the empty note: {note}")
        check(await pg.evaluate("()=>!document.querySelector('.jrib')&&!document.querySelector('.jarchbook')"), "the empty drawer should have no ribbons or books")
        check(await pg.evaluate(NO_SCROLL), "the empty note scrolls")
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "1_empty_drawer.png"))
        await pg.evaluate("()=>document.querySelector('.jclose').click()")
        check(await pg.evaluate("()=>!document.querySelector('.jbook')"), "the x didn't close the drawer")

        # moving out: gone from the room, tag and ribbon; captioned; saved
        await pg.evaluate("()=>{const m=allRaw().find(q=>q.name.startsWith('Mortie'));m.needs.thirst=.9;moveOut(m,'Off to see the ocean');__step(1);}")
        check(await pg.evaluate("()=>plantCount()===1&&st.id===1&&!allRaw().some(q=>q.name.startsWith('Mortie'))"), "Mortie is still in the room")
        check(await pg.evaluate("()=>CAP.log.some(l=>l.t===\"Mortie's journal is tucked safely in the desk.\")"), "no moving-out caption")
        check(await pg.evaluate("()=>[...document.querySelectorAll('#nameTags button')].map(b=>b.textContent).join()==='Tuffet Mossmuffin'"), "Mortie's name tag is still there")
        await pg.evaluate("()=>{openJournal();__step(.3);}")
        check(await pg.evaluate("()=>document.querySelectorAll('.jrib').length===2&&jPages().join()==='p1,cat'"), "Mortie's ribbon is still in the live journal")
        await pg.evaluate("()=>closeJournal()")

        # the second one (the one being tended) goes too: the room empties, the books stay
        await pg.evaluate("()=>{const p=freshPlant();Object.assign(p,{stage:6,species:5,name:'Pip Wobblebean',free:{x:1250,y:918}});addPlant(p);moveOut(p,'Staying with Slowmallow');__step(1);}")
        check(await pg.evaluate("()=>st.id===1&&plantCount()===1&&st.archive.length===2"), "moving out the plant being tended went wrong")

        # the save, across a reload
        await pg.evaluate("()=>__step(1)")
        check(len((await pg.evaluate(SAVED))["archive"]) == 2, "the archive isn't in the save")
        await pg.reload(wait_until="load")
        await begin()
        check(await pg.evaluate("()=>st.archive.map(e=>e.name).join()==='Mortie Gloomsnack,Pip Wobblebean'&&st.archive[0].dest==='Off to see the ocean'&&st.archive[0].day===42"), "the archive didn't survive a reload")

        # the drawer: one closed book each, with name and portrait
        await tap_drawer()
        await pg.evaluate("()=>__step(.3)")
        r = await pg.evaluate("()=>[...document.querySelectorAll('.jarchbook')].map(b=>({t:b.textContent,c:b.querySelector('canvas').width}))")
        check([x["t"] for x in r] == ["Mortie Gloomsnack", "Pip Wobblebean"] and all(x["c"] > 10 for x in r), f"the books: {r}")
        check(await pg.evaluate("()=>!document.querySelector('.jarchnote')"), "the note should only show when empty")
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "2_filled_drawer.png"))

        # a keepsake: read-only and frozen, even if the world changes afterwards
        await pg.evaluate("()=>{st.name='Changed Later';st.catName='Someone Else';document.querySelector('.jarchbook').click();__step(.4);}")
        r = await pg.evaluate("()=>({name:document.querySelector('.jl .jname').textContent,rename:document.querySelectorAll('.jrename,.jnameinput').length,charms:[...document.querySelectorAll('.jcharm')].map(c=>c.disabled),wear:st.archive[0].snap.wear,hand:document.querySelectorAll('.jhand').length,ribs:document.querySelectorAll('.jrib').length})")
        check(r["name"] == "Mortie Gloomsnack" and r["rename"] == 0 and r["hand"] == 0 and r["ribs"] == 0, f"keepsake page: {r}")
        check(r["charms"] == [True, True], f"charms should not toggle: {r['charms']}")
        worn0 = await pg.evaluate("()=>{document.querySelector('.jcharm').click();return JSON.stringify(st.archive[0].snap);}")
        check(worn0 == await pg.evaluate("()=>JSON.stringify(st.archive[0].snap)"), "tapping a keepsake charm changed it")
        check(await pg.evaluate("()=>!!document.querySelector('.jportrait canvas')&&document.querySelector('.jportrait canvas').width>50"), "no frozen portrait")
        check(await pg.evaluate(NO_SCROLL), "the keepsake scrolls")
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "3_open_keepsake.png"))

        # flip through to the last page; the pair spread still knows the other monster as it was
        seen = []
        for _ in range(8):
            seen.append(await pg.evaluate("()=>document.querySelector('.jl .jname').textContent"))
            if await pg.evaluate("()=>!document.querySelector('.jarrow.jnext')"):
                break
            await pg.evaluate("()=>{document.querySelector('.jarrow.jnext').click();__step(.4);}")
        check("Mortie & Tuffet" in seen, f"the frozen pair page is missing or changed: {seen}")
        check(seen[-1] == "Out in the world", f"the last page: {seen}")
        txt = await pg.evaluate("()=>document.querySelector('.journal').innerText")
        check("Off to see the ocean" in txt and "Moved out on day forty-two" in txt and "Postcards" in txt, f"out in the world: {txt!r}")
        check(await pg.evaluate("()=>!!document.querySelector('.jpostcard')"), "no empty spot for postcards")
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "4_out_in_the_world.png"))

        # x: back to the drawer, then closed; nothing about the keepsake leaked into the live game
        await pg.evaluate("()=>{document.querySelector('.jclose').click();__step(.4);}")
        check(await pg.evaluate("()=>document.querySelectorAll('.jarchbook').length===2&&!jKeep"), "the x should go back to the drawer")
        await pg.evaluate("()=>document.querySelector('.jclose').click()")
        check(await pg.evaluate("()=>!document.querySelector('.jbook')&&st.name==='Changed Later'&&st.id===1&&!st.dest"), "closing left something behind")
        await pg.evaluate("()=>{st.name='Tuffet Mossmuffin';st.catName='';}")

        # outside the book closes the drawer too
        await pg.evaluate("()=>{openArchive();__step(.3);}")
        await pg.mouse.click(4, 400)
        check(await pg.evaluate("()=>!document.querySelector('.jbook')"), "tapping outside didn't close the drawer")

        # debug's Move out: on the test copy only
        before = await pg.evaluate("()=>{__step(1);return JSON.parse(localStorage.getItem(KEY)).archive.length;}")
        await pg.click("#dbgBtn")
        await pg.evaluate("()=>__step(.5)")
        check(await pg.evaluate("()=>TESTING"), "debug isn't in test mode")
        await pg.evaluate("()=>{[...dbg.querySelectorAll('button')].find(b=>b.textContent==='Move out').click();__step(1);}")
        r = await pg.evaluate("()=>({n:st.archive.length,real:JSON.parse(localStorage.getItem(KEY)).archive.length,plants:plantCount()})")
        check(r["n"] == before + 1 and r["real"] == before and r["plants"] == 0, f"debug Move out: {r}")
        await pg.evaluate("()=>{[...dbg.querySelectorAll('button')].find(b=>b.textContent==='Back to my game').click();__step(1);}")
        r = await pg.evaluate("()=>({n:st.archive.length,real:JSON.parse(localStorage.getItem(KEY)).archive.length,plants:plantCount(),name:st.name})")
        check(r["n"] == before and r["real"] == before and r["plants"] == 1 and r["name"] == "Tuffet Mossmuffin", f"Back to my game didn't undo it: {r}")
        fails += errs
        await ctx.close()

        # iPhone landscape: the note, a full spread of books and a keepsake all fit with no scrolling
        ctx = await b.new_context(viewport={"width": 844, "height": 390}, device_scale_factor=2)
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate(OLD_SAVE)
        await pg.reload(wait_until="load")
        await begin()
        await pg.evaluate("()=>{openArchive();__step(.3);}")
        check(await pg.evaluate(NO_SCROLL) and await pg.evaluate(FITS), "iPhone: the note doesn't fit")
        await pg.screenshot(path=os.path.join(OUT, "5_iphone_empty.png"))
        await pg.evaluate("()=>{closeJournal();const e=moveOut(2,'Off to see the ocean');for(let i=0;i<13;i++)st.archive.push(Object.assign(jsonCopy(e),{name:e.name}));openArchive();__step(.3);}")
        check(await pg.evaluate("()=>document.querySelectorAll('.jarchbook').length===12&&!!document.querySelector('.jarrow.jnext')"), "iPhone: 14 books should show 12 and an arrow")
        check(await pg.evaluate(NO_SCROLL) and await pg.evaluate(FITS), "iPhone: the books don't fit")
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "6_iphone_full_shelf.png"))
        await pg.evaluate("()=>{document.querySelector('.jarrow.jnext').click();__step(.4);}")
        check(await pg.evaluate("()=>document.querySelectorAll('.jarchbook').length===2&&!!document.querySelector('.jarrow.jprev')"), "iPhone: the next spread of books")
        await pg.evaluate("()=>{document.querySelector('.jarchbook').click();__step(.4);}")
        check(await pg.evaluate(NO_SCROLL) and await pg.evaluate(FITS), "iPhone: the keepsake doesn't fit")
        fails += errs
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS archive_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
