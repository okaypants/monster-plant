"""The song book (js/stories.js songs, js/care.js): true stories of real songs, each with its record from the crates.

Run from the repository root:  python3 tests/songbook_test.py
Checks every song's data (plain pages, a record with an id, a file and who plays it), that the open book has a Play the record
button that fits on a phone, that tapping it streams that record from the library and says who is playing, that it keeps playing
while the pages turn, that tapping again or closing the book stops it, that the radio pauses and comes back, that a record
that can't play says so, and that other books have no button. With --online it also asks the library that every record's
file is really there. Pictures go to tests/screenshots/songbook/ (phone size). Exit code 1 if a check fails.
"""
import asyncio, os, subprocess, sys, urllib.parse
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "songbook")
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:1,day:5,dayT:.3,mode:'actions',curtain:'open',giftSeed:1,"
        "name:'Zib Wigglebottom',free:{x:1250,y:918}});localStorage.setItem(KEY,JSON.stringify(s));}")
OPEN = "(i)=>{closeStory(true);nextRead=()=>STORIES.songs[i];startReading(st.id,BOOK_BY('songs'));__step(.5);capClear();return STORIES.songs[i].t}"
# a stand-in record player: remembers what it was asked to play, never touches the internet
FAKE = "()=>{window.__au=[];window.Audio=function(){const a={paused:true,setAttribute(){},removeAttribute(){a.src=''},load(){},pause(){a.paused=true},play(){a.paused=false;return window.__fail?Promise.reject(new Error('no')):Promise.resolve()}};__au.push(a);return a};}"


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    check = lambda ok, msg: ok or fails.append(msg)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 844, "height": 390}, device_scale_factor=2)
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate(SAVE)
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        await pg.evaluate("()=>Promise.all([500,600,700,800].map(w=>document.fonts.load(w+' 16px Nunito')))")
        await pg.evaluate("()=>{__step(5);capClear();}")
        await pg.evaluate(FAKE)
        songs = await pg.evaluate("()=>STORIES.songs.map(s=>({t:s.t,rec:s.rec||null,plain:s.p.every(x=>typeof x==='string'),n:s.p.length}))")
        check(len(songs) >= 4, f"expected at least 4 songs, got {len(songs)}")
        for s in songs:
            check(s["plain"] and s["n"] >= 3, f"{s['t']}: pages should be plain words")
            r = s["rec"] or {}
            check(bool(r.get("id")) and str(r.get("f", "")).endswith(".mp3") and bool(r.get("by")), f"{s['t']}: needs a record (id, an mp3 file, who plays it)")
        for i, s in enumerate(songs):
            title = await pg.evaluate(OPEN, i)
            await pg.wait_for_timeout(250)
            check(await pg.locator(".story .splay").count() == 1 and await pg.locator(".story .splay").text_content() == "Play the record", f"{title}: no Play the record button")
            check(await pg.evaluate("()=>{const b=document.querySelector('.splay').getBoundingClientRect();return b.top>=0&&b.left>=0&&b.right<=innerWidth}"), f"{title}: the button is off the screen")
            n_pages = await pg.evaluate("()=>readPages(READ.get(st.id).s).length")
            for sp in range(0, n_pages, 2):
                await pg.evaluate("(p)=>{READ.get(st.id).page=p;showStory()}", sp)
                check(await pg.evaluate("()=>[...document.querySelectorAll('.story .spage')].every(e=>e.scrollHeight<=e.clientHeight+1&&e.scrollWidth<=e.clientWidth+1)"), f"{title}: pages {sp+1}-{sp+2} don't fit on a phone")
            await pg.evaluate("()=>{READ.get(st.id).page=0;showStory()}")
            await pg.evaluate("()=>{__au.length=0;CAP.log.length=0;document.querySelector('.splay').click();__step(1)}")
            got = await pg.evaluate("()=>({src:(__au[0]||{}).src,playing:!!song&&__au[0]&&!__au[0].paused,label:document.querySelector('.splay').textContent,said:CAP.log.concat(CAP.cur||[],CAP.q).map(c=>c.t).join(' | ')})")
            want = "https://archive.org/download/" + urllib.parse.quote(s["rec"]["id"], safe="") + "/"
            check(str(got["src"]).startswith(want) and got["playing"] and got["label"] == "Stop", f"{title}: Play should stream its record {got}")
            check(("Playing “" + title + "”, " + s["rec"]["by"] + ".") in got["said"], f"{title}: it should say who is playing: {got['said']}")
            if i == 0:
                await pg.wait_for_timeout(200)
                await pg.screenshot(path=os.path.join(OUT, "1_playing.png"))
                await pg.evaluate("()=>{turnStory();__step(.5)}")
                check(await pg.evaluate("()=>!!song&&READ.get(st.id).page===2"), "the record should keep playing while the pages turn")
                await pg.wait_for_timeout(200)
                await pg.screenshot(path=os.path.join(OUT, "2_pages.png"))
            await pg.evaluate("()=>{capClear();}")
        # tap again to stop; the radio pauses and comes back
        await pg.evaluate(OPEN, 0)
        await pg.evaluate("()=>{radio.on=true;radioOff=function(){radio.on=false};radioOn=function(){radio.on=true};document.querySelector('.splay').click();__step(1)}")
        check(await pg.evaluate("()=>!!song&&radio.on===false"), "the radio should pause while the record plays")
        await pg.evaluate("()=>{document.querySelector('.splay').click();__step(1)}")
        check(await pg.evaluate("()=>!song&&radio.on===true&&__au[__au.length-1].paused&&document.querySelector('.splay').textContent==='Play the record'"), "tapping again should stop the record and bring the radio back")
        await pg.evaluate("()=>{document.querySelector('.splay').click();__step(.5);closeStory();__step(.5)}")
        check(await pg.evaluate("()=>!song&&!storyEl&&__au[__au.length-1].paused"), "closing the book should stop the record")
        # a record that can't play says so
        await pg.evaluate(OPEN, 1)
        await pg.evaluate("()=>{window.__fail=true;CAP.log.length=0;document.querySelector('.splay').click()}")
        await pg.wait_for_timeout(100)
        await pg.evaluate("()=>__step(1)")
        check(await pg.evaluate("()=>!song&&CAP.log.concat(CAP.cur||[],CAP.q).some(c=>c.t==='The record wouldn’t play. It needs the internet.')"), "a record that can't play should say so and stop")
        await pg.evaluate("()=>{window.__fail=false;closeStory();capClear();nextRead=b=>STORIES[b][0];startReading(st.id,BOOK_BY('recipes'));__step(.5)}")
        check(await pg.locator(".story .splay").count() == 0, "a book that isn't the song book has a Play button")
        fails += [f"page error: {e}" for e in errs]
        await b.close()
    if "--online" in sys.argv:  # every record's file really is in the library
        for s in songs:
            url = "https://archive.org/download/" + urllib.parse.quote(s["rec"]["id"], safe="") + "/" + urllib.parse.quote(s["rec"]["f"])
            out = subprocess.run(["curl", "-sIL", "-A", "Mozilla/5.0", "-o", "/dev/null", "-w", "%{http_code} %{content_type}", "--max-time", "40", url], capture_output=True, text=True).stdout
            check(out.startswith("200") and "audio" in out, f"{s['t']}: the record's file isn't there ({out})")
    for f in fails:
        print("FAIL", f)
    print("PASS songbook_test" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
