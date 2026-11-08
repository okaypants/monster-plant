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
        for _ in range(2):
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
        fails += errs
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS reading_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
