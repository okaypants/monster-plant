"""Screenshots of the debug Light map: morning, noon, golden hour and night x curtains open/closed x lamps on/off.

Run from the repository root:  python tests/light_map_shots.py
Three plants (an adult shade-lover on the rug, a kid sun-lover on the milk crate, a sprout night-lover on the desk),
the Light map switched on with the debug button. Pictures go to tests/screenshots/lightmap/, plus contact_sheet.png.
"""
import asyncio, os
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "lightmap")
TIMES = {"morning": "s.dayT=.12;", "noon": "s.dayT=.37;", "golden": "s.dayT=.6;", "night": "s.dayT=.9;s.night=true;"}
SAVE = ("s.stage=8;s.species=3;s.pref='shade';s.free={x:900,y:880};s.giftSeed=1;s.mode='actions';"  # time holds still
        "s.others=[];")
EXTRA = ("const k=freshPlant();k.species=7;k.stage=4;k.pref='sun';k.place={baby:'crate'};addPlant(k);"
         "const p=freshPlant();p.species=2;p.stage=1;p.pref='night';p.place={seed:'desk'};addPlant(p);"
         "swapIn(0);ACT=st.id;")  # back to tending the adult


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    names = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for t, tjs in TIMES.items():
            for cur in ("open", "closed"):
                for lamps in ("on", "off"):
                    ctx = await b.new_context(viewport={"width": 1670, "height": 942})
                    await ctx.add_init_script(VIRTUAL_TIME)
                    pg = await ctx.new_page()
                    errs = []
                    pg.on("pageerror", lambda e: errs.append(str(e)))
                    await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
                    lit = "true" if lamps == "on" else "false"
                    await pg.evaluate("()=>{const s=fresh();s.started=true;" + SAVE + tjs +
                                      f"s.curtain='{cur}';s.lamp={lit};s.desk={lit};localStorage.setItem(KEY,JSON.stringify(s));}}")
                    await pg.reload(wait_until="load")
                    await pg.click(".screen button")  # Continue
                    await pg.evaluate("()=>{" + EXTRA + "}")
                    await pg.click("#dbgBtn"); await pg.click("#dLm"); await pg.click("#dbgBtn")  # Light map on, panel closed
                    await pg.evaluate("()=>__step(10)")  # curtains settle, captions end, plants notice their light
                    await pg.wait_for_timeout(800)  # the caption's fade-out runs on real time
                    name = f"{t}_curtains-{cur}_lamps-{lamps}.png"
                    await pg.screenshot(path=os.path.join(OUT, name))
                    names.append(name)
                    box = await pg.evaluate("()=>(document.getElementById('errbox')||{}).textContent||''")
                    print(("ok   " if not (errs or box) else "FAIL ") + name, *errs, box)
                    await ctx.close()
        # contact sheet: all 16 on one page, in a 4 x 4 grid (rows = time of day)
        html = ("<body style='margin:0;background:#19101b;color:#fdebc9;font:14px monospace'><div style='display:grid;grid-template-columns:repeat(4,1fr);gap:4px'>"
                + "".join(f"<div><img src='{n}' style='width:100%;display:block'>{n[:-4]}</div>" for n in names) + "</div>")
        open(os.path.join(OUT, "contact.html"), "w").write(html)
        pg = await b.new_page(viewport={"width": 2000, "height": 600})
        await pg.goto(f"http://localhost:{PORT}/tests/screenshots/lightmap/contact.html", wait_until="load")
        await pg.screenshot(path=os.path.join(OUT, "contact_sheet.png"), full_page=True)
        await b.close()
    print("saved to tests/screenshots/lightmap/")


asyncio.run(main())
