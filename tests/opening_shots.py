"""The opening: a brand-new game on an iPhone 13 held sideways.

Run from the repository root:  python tests/opening_shots.py
Plays Begin and the four quiz questions, then checks the room opens in the daytime with the curtains open and both lamps
off, the seed already has a name, the hello caption shares it, and its name tag shows at the bottom left. Pictures go to
tests/screenshots/opening/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "opening")


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
        await pg.evaluate("()=>{localStorage.clear();}")
        await pg.reload(wait_until="load")
        await pg.evaluate("()=>{st.dayT=.9;st.night=true;st.lamp=true;st.desk=true;st.curtain='closed';}")  # whatever the room was doing before
        await pg.click(".screen button")  # Begin
        for i in range(4):
            await pg.click(".screen button >> nth=%d" % (i % 2))
        await pg.evaluate("()=>__step(1.2)")
        r = await pg.evaluate("()=>({dayT:st.dayT,night:st.night,lamp:st.lamp,desk:st.desk,curtain:st.curtain,name:st.name,cap:CAP.cur?CAP.cur.t:'',tags:[...document.querySelectorAll('#nameTags button')].map(b=>b.textContent)})")
        if not (r["dayT"] >= .3 and r["dayT"] < .35 and not r["night"] and r["lamp"] is False and r["desk"] is False and r["curtain"] == "open"):
            fails.append(f"opening room: {r}")
        if not r["name"] or not r["cap"].startswith(f"Hello, {r['name']}! Your little seed"):
            fails.append(f"hello caption: {r['cap']!r} (name {r['name']!r})")
        if r["tags"] != [r["name"]]:
            fails.append(f"name tag: {r['tags']}")
        await pg.evaluate("()=>document.fonts.ready")
        await pg.wait_for_timeout(700)
        await pg.screenshot(path=os.path.join(OUT, "1_opening_hello.png"))
        fails += errs
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS opening_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
