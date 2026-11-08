"""The ARCHIVE sign on the desk drawers (SNACKS style, over the top knob).

Run from the repository root:  python tests/placard_shots.py
Pictures the sign at day, golden hour and night (desk lamp on and off), room and close-up, to
tests/screenshots/placard/. Checks it gets darker at night like the wood around it, stays warm under the desk lamp, and
that tapping it opens the empty archive (with its note), not the journal. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "placard")
STATES = [("day", "st.dayT=.3;st.night=false;st.desk=true;"), ("golden", "st.dayT=.6;st.night=false;st.desk=true;"),
          ("night_desklamp_on", "st.night=true;st.desk=true;"), ("night_desklamp_off", "st.night=true;st.desk=false;")]


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1670, "height": 942}, device_scale_factor=2)
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate("()=>{const s=fresh();Object.assign(s,{started:true,stage:6,species:4,id:1,day:3,dayT:.3,mode:'actions',curtain:'open',giftSeed:1,catTrust:.1,free:{x:400,y:918}});localStorage.setItem(KEY,JSON.stringify(s));}")
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        lum = {}
        for name, js in STATES:
            await pg.evaluate("()=>{" + js + "capClear();__step(2);}")
            px = await pg.evaluate("()=>Array.from(g.getImageData(PLACARD.x+3,PLACARD.y+13,1,1).data)")  # a gold rim pixel
            lum[name] = px
            await pg.screenshot(path=os.path.join(OUT, f"{name}_room.png"))
            await pg.screenshot(path=os.path.join(OUT, f"{name}_closeup.png"), clip={"x": 1060, "y": 560, "width": 140, "height": 180})
        s = lambda c: sum(c[:3])
        if not s(lum["night_desklamp_off"]) < s(lum["night_desklamp_on"]) < s(lum["day"]):
            fails.append(f"placard lighting: day {lum['day']}, night lamp on {lum['night_desklamp_on']}, night lamp off {lum['night_desklamp_off']}")
        on = lum["night_desklamp_on"]
        if not on[0] > on[2] * 1.5:
            fails.append(f"not warm under the desk lamp: {on}")
        await pg.evaluate("()=>{st.night=false;st.dayT=.3;__step(1);}")
        await pg.mouse.click(1127, 582)
        await pg.evaluate("()=>__step(.3)")
        a = await pg.evaluate("()=>({archive:!!document.querySelector('.journal.archive .jbook'),ribbons:document.querySelectorAll('.jrib').length,note:(document.querySelector('.jarchnote')||{}).textContent||''})")
        if not (a["archive"] and a["ribbons"] == 0 and a["note"] == await pg.evaluate("()=>ARCHIVE_NOTE")):
            fails.append(f"tapping the drawers should open the empty archive with its note, not the journal: {a}")
        await pg.screenshot(path=os.path.join(OUT, "archive_empty.png"))
        fails += errs
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS placard_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
