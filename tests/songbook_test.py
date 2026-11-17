"""The song book (js/stories.js songs, js/care.js): chords over the words and a tune that plays in time.

Run from the repository root:  python3 tests/songbook_test.py
Checks every song's data (each chord sits on a syllable, every note parses, a first page of plain words), that a song page
draws its chords above the words, that Play sounds the notes of the open pages, turns the pages in time to the end and then
stops, that tapping it again stops at once, that the radio pauses and comes back, and that other books have no Play button.
Pictures go to tests/screenshots/songbook/ (phone size). Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "songbook")
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:1,day:5,dayT:.3,mode:'actions',curtain:'open',giftSeed:1,"
        "name:'Zib Wigglebottom',free:{x:1250,y:918}});localStorage.setItem(KEY,JSON.stringify(s));}")
OPEN = "(i)=>{closeStory(true);nextRead=()=>STORIES.songs[i];startReading(st.id,BOOK_BY('songs'));__step(.5);return STORIES.songs[i].t}"


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
        # the data
        bad = await pg.evaluate("""()=>{const bad=[];for(const s of STORIES.songs){if(!isSong(s)){bad.push(s.t+': not a song');continue;}
          if(typeof s.p[0]!=='string')bad.push(s.t+': the first page should be plain words');if(!(s.bpm>40&&s.bpm<260))bad.push(s.t+': bpm');
          s.p.slice(1).forEach((pg,i)=>{if(!pg.w||!pg.n){bad.push(s.t+' page '+(i+2)+': needs words and notes');return;}
            const N=songNotes(pg);if(N.some(n=>!(n.b>0)||(!n.f&&!/(^|\\s)r:/.test(pg.n))))bad.push(s.t+' page '+(i+2)+': a note does not parse');
            if(!/\\[[A-G][^\\]]*\\]/.test(pg.w))bad.push(s.t+' page '+(i+2)+': no chord');if(/\\[[^\\]]*\\](\\s|$)/.test(pg.w))bad.push(s.t+' page '+(i+2)+': a chord with no syllable under it');});}
          return bad}""")
        check(not bad, f"song data: {bad}")
        n_songs = await pg.evaluate("()=>STORIES.songs.length")
        check(n_songs >= 4, f"expected at least 4 songs, got {n_songs}")
        # count the notes that sound
        await pg.evaluate("()=>{window.__tones=[];const t0=tone;tone=function(t,d,ty,f){if(ty==='triangle')__tones.push(Math.round(f));return t0.apply(null,arguments)};}")
        for i in range(n_songs):
            title = await pg.evaluate(OPEN, i)
            await pg.wait_for_timeout(250)
            check(await pg.locator(".story .splay").count() == 1, f"{title}: no Play button")
            fits = await pg.evaluate("()=>{const b=document.querySelector('.splay').getBoundingClientRect();return b.top>=0&&b.left>=0&&b.right<=innerWidth}")
            check(fits, f"{title}: the Play button is off the screen")
            await pg.screenshot(path=os.path.join(OUT, f"{i+1}_title.png"))
            await pg.evaluate("()=>{turnStory();__step(.5)}")
            await pg.wait_for_timeout(250)
            r = await pg.evaluate("""()=>{const out={chords:0,above:true,fit:true};for(const pgEl of document.querySelectorAll('.story .spage')){
              if(pgEl.scrollHeight>pgEl.clientHeight+1||pgEl.scrollWidth>pgEl.clientWidth+1)out.fit=false;
              for(const c of pgEl.querySelectorAll('.sch i')){out.chords++;const a=c.getBoundingClientRect(),w=c.parentNode.getBoundingClientRect();if(a.bottom>w.top+a.height*.9)out.above=false;}}return out}""")
            check(r["chords"] >= 1 and r["above"], f"{title}: chords should sit above their words {r}")
            check(r["fit"], f"{title}: a song page doesn't fit on a phone")
            await pg.screenshot(path=os.path.join(OUT, f"{i+1}_words.png"))
            # play from here to the end: every note of every page from this one on sounds, the pages turn, then it stops
            want = await pg.evaluate("(i)=>{const P=readPages(STORIES.songs[i]);let n=0,secs=0;for(const pg of P.slice(2)){for(const x of songNotes(pg)){if(x.f)n++;secs+=x.b*60/STORIES.songs[i].bpm}}return {n,secs,pages:P.length}}", i)
            await pg.evaluate("()=>{__tones.length=0;document.querySelector('.splay').click();__step(.2)}")
            check(await pg.evaluate("()=>!!song&&document.querySelector('.splay').textContent==='Stop'"), f"{title}: Play should start the tune")
            await pg.evaluate("(s)=>__step(s+1,50)", want["secs"])
            got = await pg.evaluate("()=>({n:__tones.length,song:!!song,page:READ.get(st.id).page,label:document.querySelector('.splay').textContent})")
            check(got["n"] == want["n"], f"{title}: {got['n']} notes sounded, expected {want['n']}")
            check(not got["song"] and got["label"] == "Play the tune", f"{title}: the tune should stop at the end {got}")
            check(got["page"] + 2 >= want["pages"], f"{title}: the pages should turn to the end, at page {got['page']} of {want['pages']}")
        # tap again to stop; the radio pauses and comes back
        await pg.evaluate(OPEN, 0)
        await pg.evaluate("()=>{turnStory();__step(.5);radio.on=true;radioOff=function(){radio.on=false};radioOn=function(){radio.on=true};document.querySelector('.splay').click();__step(1)}")
        check(await pg.evaluate("()=>!!song&&radio.on===false"), "the radio should pause while the tune plays")
        await pg.evaluate("()=>{__tones.length=0;document.querySelector('.splay').click();__step(3)}")
        check(await pg.evaluate("()=>!song&&radio.on===true&&__tones.length===0"), "tapping again should stop the tune and bring the radio back")
        # turning a page or closing the book stops it
        await pg.evaluate("()=>{document.querySelector('.splay').click();__step(.5);turnStory();__step(.5)}")
        check(await pg.evaluate("()=>!song"), "turning the page should stop the tune")
        await pg.evaluate("()=>{document.querySelector('.splay').click();__step(.5);closeStory();__step(.5)}")
        check(await pg.evaluate("()=>!song&&!storyEl"), "closing the book should stop the tune")
        # another book: no Play button
        await pg.evaluate("()=>{nextRead=b=>STORIES[b][0];startReading(st.id,BOOK_BY('recipes'));__step(.5)}")
        check(await pg.locator(".story .splay").count() == 0, "a book that isn't the song book has a Play button")
        fails += [f"page error: {e}" for e in errs]
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS songbook_test" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
