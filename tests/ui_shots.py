"""UI look: Fredoka text, cream pills, soft peach buttons (the room stays pixel art).

Run from the repository root:  python tests/ui_shots.py
On a laptop-sized screen and an iPhone 13 held sideways: the start screen, a caption, a bubble with buttons (the treat
jar) and the journal. Checks that the text uses Fredoka, captions and bubbles are cream and rounded, and buttons have no
hard outline. Pictures go to tests/screenshots/ui/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "ui")
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:1,giftSeed:1,dayT:.3,catTrust:.7,free:{x:1250,y:918}});"
        "localStorage.setItem(KEY,JSON.stringify(s));}")


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    check = lambda ok, msg: ok or fails.append(msg)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, dev in (("laptop", {"viewport": {"width": 1440, "height": 812}}), ("phone", p.devices["iPhone 13 landscape"])):
            ctx = await b.new_context(**dev)
            await ctx.add_init_script(VIRTUAL_TIME)
            pg = await ctx.new_page()
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
            await pg.evaluate(SAVE)
            await pg.reload(wait_until="load")
            await pg.evaluate("()=>document.fonts.ready")
            await pg.wait_for_timeout(400)
            await pg.screenshot(path=os.path.join(OUT, f"{name}_1_start.png"))
            r = await pg.evaluate("()=>{const b=document.querySelector('.screen button'),cs=getComputedStyle(b);return {font:getComputedStyle(document.body).fontFamily,loaded:document.fonts.check('500 20px Fredoka'),radius:parseFloat(cs.borderTopLeftRadius),border:cs.borderTopStyle};}")
            check("Fredoka" in r["font"] and r["loaded"], f"{name}: Fredoka isn't the font ({r})")
            check(r["radius"] >= 20 and r["border"] == "none", f"{name}: screen buttons should be outline-free pills ({r})")
            await pg.click(".screen button")
            await pg.evaluate("()=>{__step(12);capClear();CAP.seen.clear();tell('Get out your cameras, it\\'s golden hour.',{kind:'important'});__step(.6);}")
            await pg.wait_for_timeout(700)
            r = await pg.evaluate("()=>{const c=getComputedStyle(cap.querySelector('.ci'));return {bg:c.backgroundColor,radius:parseFloat(c.borderTopLeftRadius),weight:c.fontWeight};}")
            check(r["bg"] == "rgb(255, 244, 226)" and r["radius"] >= 20 and r["weight"] == "500", f"{name}: caption isn't a cream pill ({r})")
            await pg.screenshot(path=os.path.join(OUT, f"{name}_2_caption.png"))
            await pg.evaluate("()=>{capClear();openSnacks(1300,600);}")
            await pg.wait_for_timeout(300)
            r = await pg.evaluate("()=>{const b=document.querySelector('.bubble'),c=getComputedStyle(b),bt=getComputedStyle(b.querySelector('button'));return {bg:c.backgroundColor,radius:parseFloat(c.borderTopLeftRadius),btnBorder:bt.borderTopStyle};}")
            check(r["bg"] == "rgb(255, 244, 226)" and r["radius"] >= 12 and r["btnBorder"] == "none", f"{name}: bubble look ({r})")
            await pg.screenshot(path=os.path.join(OUT, f"{name}_3_bubble.png"))
            await pg.evaluate("()=>{closeBubble();openJournal();}")
            await pg.wait_for_timeout(300)
            await pg.screenshot(path=os.path.join(OUT, f"{name}_4_journal.png"))
            fails += errs
            await ctx.close()
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS ui_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
