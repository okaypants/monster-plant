"""Reading: touch a book, drag one from the tray to a monster, watch it read.

Run from the repository root:  python tests/reading_shots.py
On an iPhone 13 held sideways with a real mouse: tap a book on the bookcase, the tray of four books; drag the fairy tales
onto an adult; it hops into the armchair and the story opens facing us; tap to turn; after the last page the book hops home
and the monster goes back. Then a kid reading the grimoire in the armchair.
Pictures go to tests/screenshots/reading/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "reading")


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(**{**p.devices["iPhone 13 landscape"], "has_touch": False, "is_mobile": False})
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:5,id:1,day:3,dayT:.3,mode:'actions',curtain:'open',giftSeed:1,name:'Pip Wobblebean',catTrust:.1,free:{x:1150,y:918}});localStorage.setItem(KEY,JSON.stringify(s));}")
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        await pg.evaluate("()=>{__step(3);capClear();}")
        g2s = "([x,y])=>{const r=cv.getBoundingClientRect();return [r.left+x*S,r.top+y*S];}"
        x, y = await pg.evaluate(g2s, [100, 190])
        await pg.mouse.click(x, y)
        await pg.evaluate("()=>__step(.1)")
        if await pg.locator(".btray .tbook").count() != 4:
            fails.append("tapping a book didn't open the tray")
        await pg.screenshot(path=os.path.join(OUT, "1_tray.png"))
        bk = await pg.locator(".tbook[data-id=fairy]").bounding_box()
        await pg.mouse.move(bk["x"] + bk["width"] / 2, bk["y"] + bk["height"] / 2)
        await pg.mouse.down()
        tx, ty = await pg.evaluate("()=>{const b=plantBox(),r=cv.getBoundingClientRect();return [r.left+(b.x+b.w/2)*S+30,r.top+(b.y+b.h*.55)*S+46];}")
        for i in range(1, 9):
            await pg.mouse.move(bk["x"] + (tx - bk["x"]) * i / 8, bk["y"] + (ty - bk["y"]) * i / 8)
        await pg.evaluate("()=>__step(.05)")
        await pg.screenshot(path=os.path.join(OUT, "2_dragging_over_monster.png"))
        await pg.mouse.up()
        await pg.evaluate("()=>__step(2.5)")  # it hops in; the cat, if he was napping there, walks off
        r = await pg.evaluate("()=>({chair:spotKey(),story:!!document.querySelector('.story'),text:document.querySelector('.story .sl')?.textContent})")
        if r["chair"] != "chair" or not r["story"]:
            fails.append(f"reading: {r}")
        await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, "3_story_in_the_chair.png"))
        sb = await pg.locator(".story").bounding_box()
        await pg.mouse.click(sb["x"] + sb["width"] * .7, sb["y"] + sb["height"] / 2)
        await pg.evaluate("()=>__step(.1)")
        await pg.screenshot(path=os.path.join(OUT, "4_page_turning.png"))
        await pg.evaluate("()=>__step(.2)")
        await pg.screenshot(path=os.path.join(OUT, "5_next_pages.png"))
        for _ in range(12):
            if not await pg.evaluate("()=>!!document.querySelector('.story')"):
                break
            await pg.mouse.click(sb["x"] + sb["width"] * .7, sb["y"] + sb["height"] / 2)
            await pg.evaluate("()=>__step(.3)")
        await pg.evaluate("()=>__step(.25)")
        await pg.screenshot(path=os.path.join(OUT, "6_book_hops_home.png"))
        if await pg.evaluate("()=>!!document.querySelector('.story')||spotKey()==='chair'"):
            fails.append("after the last page the book should close and the monster go back")
        # a kid in the armchair with the grimoire
        await pg.evaluate("()=>{st.stage=4;st.perch='books';st.nge=-.5;__step(1);capClear();startReading(st.id,BOOKS[3]);__step(.4);}")
        await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, "7_kid_reading_grimoire.png"))
        await pg.evaluate("()=>{closeStory(true);st.stage=8;st.perch=null;__step(1);capClear();}")
        # many reads per book (Jackie, Nov 15): every read comes round once before any repeats, never the same one twice running; saved
        r = await pg.evaluate("""()=>{st.shelf={};st.shelfLast={};const out={};for(const bk of BOOKS){const n=STORIES[bk.id].length,seen=[];for(let i=0;i<n*3;i++)seen.push(STORIES[bk.id].indexOf(nextRead(bk.id)));
          out[bk.id]={n,seen};}save();const saved=JSON.parse(localStorage.getItem(KEY));out.saved=!!(saved.shelf&&saved.shelfLast);return out;}""")
        check = lambda ok, msg: None if ok else fails.append(msg)
        for bk in ("fairy", "almanac", "nonsense", "grimoire"):
            n, seen = r[bk]["n"], r[bk]["seen"]
            check(n >= 3, f"{bk}: only {n} reads")
            check(all(sorted(seen[i:i + n]) == list(range(n)) for i in range(0, len(seen), n)), f"{bk}: every read should come once before any repeats: {seen}")
            check(all(x != y for x, y in zip(seen, seen[1:])), f"{bk}: the same read twice running: {seen}")
        check(r["saved"], "the order to come should be saved")
        # every read: a title and who it's by, real pages, and every page fits its paper at the smallest words (an iPhone held sideways)
        bad = await pg.evaluate("""()=>{const bad=[];for(const bk of BOOKS)for(const s of STORIES[bk.id]){if(!s.t||!s.by||!s.p||!s.p.length)bad.push(bk.id+': '+(s.t||'?')+' needs a title, a by line and pages');
          if(/sloth.s almanac/i.test(s.by)!==(bk.id==='almanac'))bad.push(bk.id+': '+s.t+' by line');if((bk.id==='almanac'||/^told/.test(s.by))&&!s.src)bad.push(bk.id+': '+s.t+' needs a source to check');
          closeStory(true);startReading(st.id,bk);__step(.4);const r=READ.get(st.id);r.s=s;const P=readPages(s);
          for(let i=0;i<P.length;i+=2){r.page=i;showStory();for(const el of storyEl.querySelectorAll('.spage')){if(el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1)bad.push(bk.id+': '+s.t+': page '+(i+(el.classList.contains('sr')?1:0))+' does not fit');
            for(const n of el.querySelectorAll('*'))if(parseFloat(getComputedStyle(n).fontSize)<14)bad.push(s.t+': words under 14px');if(parseFloat(getComputedStyle(el).fontSize)<16)bad.push(s.t+': page words under 16px');}}}
          closeStory(true);return bad;}""")
        fails += bad
        # flipping back (Jackie, Nov 15): tap the left page to go back two pages; from the title page, back to the read before
        await pg.evaluate("()=>{closeStory(true);capClear();st.shelf={};st.shelfLast={};st.shelfHist={};startReading(st.id,BOOKS[0]);__step(.4);}")
        sb = await pg.locator(".story").bounding_box()
        left, right, my = sb["x"] + sb["width"] * .25, sb["x"] + sb["width"] * .75, sb["y"] + sb["height"] / 2
        state = "()=>{const r=READ.get(st.id);return r?{read:STORIES.fairy.indexOf(r.s),page:r.page,left:document.querySelector('.story .sl').textContent}:null;}"
        first = await pg.evaluate(state)
        await pg.mouse.click(left, my)
        await pg.evaluate("()=>__step(.3)")
        check(await pg.evaluate(state) == first, "the very first read's title page: tapping the left page should do nothing")
        await pg.mouse.click(right, my)
        await pg.evaluate("()=>__step(.3)")
        on = await pg.evaluate(state)
        check(on and on["page"] == 2, f"tapping the right page should turn on: {on}")
        await pg.mouse.click(left, my)
        await pg.evaluate("()=>__step(.1)")
        await pg.screenshot(path=os.path.join(OUT, "8_flipping_back.png"))
        await pg.evaluate("()=>__step(.3)")
        check(await pg.evaluate(state) == first, f"tapping the left page should flip back to the title: {await pg.evaluate(state)}")
        await pg.evaluate("()=>{closeStory(true);startReading(st.id,BOOKS[0]);__step(.4);}")  # the next read in the book
        second = await pg.evaluate(state)
        check(second["read"] != first["read"] and second["page"] == 0, f"the next read should be a different one: {second}")
        await pg.mouse.click(left, my)
        await pg.evaluate("()=>__step(.3)")
        back = await pg.evaluate(state)
        check(back == first, f"from a title page, the left page should go back to the read before, at its title: {back}")
        await pg.evaluate("()=>closeStory(true)")
        # pictures: each book's first read, its title page and the pages after
        for k, bk in enumerate(("fairy", "almanac", "nonsense", "grimoire")):
            for j in range(await pg.evaluate("(b)=>STORIES[b].length", bk)):
                await pg.evaluate("([k,j])=>{closeStory(true);capClear();startReading(st.id,BOOKS[k]);__step(.4);READ.get(st.id).s=STORIES[BOOKS[k].id][j];showStory();capClear();__step(.1);}", [k, j])
                await pg.wait_for_timeout(250)
                await pg.locator(".story").screenshot(path=os.path.join(OUT, f"read_{bk}_{j + 1}_title.png"))
                await pg.evaluate("()=>{READ.get(st.id).page=2;showStory();}")
                await pg.locator(".story").screenshot(path=os.path.join(OUT, f"read_{bk}_{j + 1}_pages.png"))
        await pg.evaluate("()=>closeStory(true)")
        fails += errs
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS reading_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
