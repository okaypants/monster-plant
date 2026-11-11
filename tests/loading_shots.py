"""Loading screen: the room stays covered until every picture has arrived, then the game starts with the room complete.

Run from the repository root:  python tests/loading_shots.py
The room's background picture is held back on purpose. While it's missing: the loading screen is up and the game hasn't
started (no title screen). Once it arrives: the loading screen is gone, the title screen is up and the room is drawn.
Also checks a picture that fails to load doesn't leave the loading screen up forever.
Pictures go to tests/screenshots/loading/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, serve

OUT = os.path.join(SHOTS, "loading")
STATE = "()=>({cover:!!document.getElementById('loading'),title:!!document.querySelector('.screen'),left:LOAD_LEFT,room:ok(ROOMS.day),px:g.getImageData(835,471,1,1).data[3]})"


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, dev in (("desktop", {"viewport": {"width": 1670, "height": 942}}), ("iphone", p.devices["iPhone 13 landscape"])):
            ctx = await b.new_context(**dev)
            pg = await ctx.new_page()
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            gate = asyncio.Event()

            async def hold(route):
                await gate.wait()
                await route.continue_()
            await pg.route("**/room_day.png", hold)
            await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="commit")
            await pg.wait_for_function("()=>typeof LOAD_GO!=='undefined'&&LOAD_GO")  # all the code has run
            left = -1
            while True:  # wait for everything else to arrive: the count stops going down
                now = await pg.evaluate("()=>LOAD_LEFT")
                if now == left:
                    break
                left = now
                await pg.wait_for_timeout(700)
            await pg.evaluate("()=>document.fonts.ready")
            s = await pg.evaluate(STATE)
            if not s["cover"] or s["title"] or s["px"] or not 0 < s["left"] <= 2:
                fails.append(f"{name}: while a picture is missing, want the cover up and nothing started: {s}")
            await pg.screenshot(path=os.path.join(OUT, name + "_1_loading.png"))
            gate.set()
            await pg.wait_for_function("()=>LOADED")
            await pg.evaluate("()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))")  # the first frame
            s = await pg.evaluate(STATE)
            if s["cover"] or not s["title"] or not s["room"] or not s["px"]:
                fails.append(f"{name}: once everything is in, want the cover gone and the room drawn: {s}")
            await pg.wait_for_timeout(300)
            await pg.screenshot(path=os.path.join(OUT, name + "_2_ready.png"))
            fails += [f"{name}: {e}" for e in errs]
            await ctx.close()
        # a picture that can't be loaded: the game still starts (and says which picture, as before)
        ctx = await b.new_context(viewport={"width": 1670, "height": 942})
        pg = await ctx.new_page()
        await pg.route("**/cat_side1.png", lambda r: r.abort())
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="commit")
        try:
            await pg.wait_for_function("()=>typeof LOADED!=='undefined'&&LOADED&&!document.getElementById('loading')", timeout=20000)
        except Exception:
            fails.append("a picture that fails to load left the loading screen up")
        await ctx.close()
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS loading_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
