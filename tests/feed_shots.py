"""Feeding: the treat tray and dragging a treat to a monster, with a real mouse.

Run from the repository root:  python tests/feed_shots.py
On an iPhone 13 held sideways: the tray beside the SNACKS cabinet, a treat held over an adult (its mouth opens), then
let go (it eats). Pictures go to tests/screenshots/feed/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "feed")


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(**p.devices["iPhone 13 landscape"])
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:1,day:3,dayT:.3,mode:'actions',curtain:'open',giftSeed:1,catTrust:.1,free:{x:1150,y:918},nge:.4,ge:.5});localStorage.setItem(KEY,JSON.stringify(s));}")
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        await pg.evaluate("()=>{__step(3);capClear();}")
        jar = await pg.evaluate("()=>{const r=cv.getBoundingClientRect();return [r.left+(JAR.x+JAR.w/2)*S,r.top+(JAR.y+JAR.h/2)*S];}")
        await pg.mouse.click(*jar)
        await pg.evaluate("()=>__step(.2)")
        if await pg.locator(".ttray .ttreat").count() != 7:
            fails.append("tapping the SNACKS cabinet didn't show the tray of 7 treats")
        await pg.screenshot(path=os.path.join(OUT, "1_tray.png"))
        box = await pg.locator(".ttreat[data-id=cotton]").bounding_box()
        await pg.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
        await pg.mouse.down()
        target = await pg.evaluate("()=>{const r=cv.getBoundingClientRect(),b=plantBox();return [r.left+(b.x+b.w/2)*S+(rightHand()?30:-30),r.top+(b.y+b.h*.45)*S+46];}")
        await pg.mouse.move(*target, steps=6)
        await pg.evaluate("()=>__step(.1)")
        if await pg.evaluate("()=>feed.over!==st.id||mouthNow()!==2"):
            fails.append("holding a treat over the adult didn't open its mouth")
        await pg.screenshot(path=os.path.join(OUT, "2_open_mouth.png"))
        await pg.mouse.up()
        await pg.evaluate("()=>__step(.115)")
        await pg.screenshot(path=os.path.join(OUT, "3_chomp.png"))
        await pg.evaluate("()=>__step(1)")
        if await pg.evaluate("()=>((st.treats||{}).cotton||0)!==1"):
            fails.append("letting go over the adult didn't feed it")
        await pg.screenshot(path=os.path.join(OUT, "4_after.png"))
        fails += errs
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS feed_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
