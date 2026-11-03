"""Thirst fades to gray: screenshots and checks.

Run from the repository root:  python tests/thirst_shots.py
For an adult, a kid and a sprout: one picture at a few thirst values (full color ... parched, fully gray),
checking the gray level the game shows (0-4 in quarter steps: it comes on gradually). Then a parched adult is
watered and must get its color back smoothly over about 2 seconds. Pictures go to tests/screenshots/thirst/, plus contact_sheet.png.
Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "thirst")
THIRST = [0, .5, .65, .8, .95]  # full color ... fully gray
want_lv = lambda t: min(16, int(max(0, (t - .45) / .45) * 16)) / 4
BASE = "s.dayT=.2;s.mode='actions';s.curtain='open';s.giftSeed=1;s.others=[];s.pref='shade';s.desk=false;"
PLANTS = {
    "adult": BASE + "s.stage=8;s.species=3;s.free={x:900,y:900};",
    "kid": BASE + "s.stage=4;s.species=7;s.place={baby:'books'};",
    "sprout": BASE + "s.stage=1;s.species=2;s.timer=-1e9;s.place={seed:'desk'};",  # stays a sprout
}
CLIP = "()=>{const b=plantBox();return {x:Math.max(0,b.x-30),y:Math.max(0,b.y-50),width:Math.min(1670-Math.max(0,b.x-30),b.w+60),height:Math.min(942-Math.max(0,b.y-50),b.h+70)};}"


async def page_for(b, save):
    ctx = await b.new_context(viewport={"width": 1670, "height": 942})
    await ctx.add_init_script(VIRTUAL_TIME)
    pg = await ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
    await pg.evaluate("()=>{const s=fresh();s.started=true;" + save + "localStorage.setItem(KEY,JSON.stringify(s));}")
    await pg.reload(wait_until="load")
    await pg.click(".screen button")  # Continue
    await pg.evaluate("()=>__step(8)")  # welcome-back caption and bounce are over
    return ctx, pg, errs


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails, rows = [], []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, save in PLANTS.items():
            ctx, pg, errs = await page_for(b, save)
            row = []
            for lv, t in enumerate(THIRST):
                got = await pg.evaluate(f"()=>{{st.needs.thirst={t};__step(.1);return st.dryLv;}}")
                if abs(got - want_lv(t)) > 1e-6:
                    fails.append(f"{name} at thirst {t}: level {got}, expected {want_lv(t)}")
                await pg.wait_for_timeout(700)  # let any caption fade (real time)
                f = f"{name}_step{lv}.png"
                await pg.screenshot(path=os.path.join(OUT, f), clip=await pg.evaluate(CLIP))
                row.append(f)
            rows.append((name, row))
            fails += [f"{name}: {e}" for e in errs]
            await ctx.close()

        # watering a parched adult: color comes back smoothly over about 2 s
        ctx, pg, errs = await page_for(b, PLANTS["adult"])
        await pg.evaluate("()=>{st.needs.thirst=.95;__step(.1);held.tool='can';useTool();}")
        seen, row = [], []
        for i in range(5):
            await pg.evaluate("()=>__step(.25)")  # sample midway through each half-second step
            seen.append(await pg.evaluate("()=>st.dryLv"))
            await pg.evaluate("()=>__step(.25)")
            f = f"watering_{i}.png"
            await pg.screenshot(path=os.path.join(OUT, f), clip=await pg.evaluate(CLIP))
            row.append(f)
        if seen[-1] != 0 or any(b > a or a - b > 1 for a, b in zip([4] + seen, seen)):
            fails.append(f"watering levels {seen}, expected a smooth return to 0 (at most 1 level per half second)")
        rows.append(("watering (every 0.5 s)", row))
        fails += [f"watering: {e}" for e in errs]
        await ctx.close()

        html = ("<body style='margin:0;padding:8px;background:#19101b;color:#fdebc9;font:15px monospace'>"
                "<div style='display:grid;grid-template-columns:120px repeat(5,1fr);gap:6px;align-items:end'><div></div>"
                + "".join(f"<div>step {i}</div>" for i in range(5))
                + "".join(f"<div>{n}</div>" + "".join(f"<img src='{f}' style='width:100%;display:block'>" for f in r) for n, r in rows)
                + "</div>")
        open(os.path.join(OUT, "contact.html"), "w").write(html)
        pg = await b.new_page(viewport={"width": 1400, "height": 600})
        await pg.goto(f"http://localhost:{PORT}/tests/screenshots/thirst/contact.html", wait_until="load")
        await pg.screenshot(path=os.path.join(OUT, "contact_sheet.png"), full_page=True)
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("saved to tests/screenshots/thirst/")
    if fails:
        sys.exit(1)
    print("PASS: gray comes on gradually with thirst, and the color comes back smoothly after watering")


asyncio.run(main())
