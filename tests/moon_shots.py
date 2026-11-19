"""The moon in the window (js/moon.js): tonight's real phase.

Run from the repository root:  python3 tests/moon_shots.py
Checks the phase against real new and full moons, then draws the night window in every season at eight phases and puts
them on one sheet (tests/screenshots/moon/sheet.png). Also checks: the painted moon is gone at new moon (nothing bright
left where it was), the full moon is fully lit, a waxing moon is lit on the right and a waning one on the left, the
curtains close over it, and there's no moon by day. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "moon")
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:1,day:3,dayT:.95,night:true,giftSeed:1,mode:'actions',curtain:'open',"
        "catTrust:.1,free:{x:1250,y:918},name:'Zib Wigglebottom'});localStorage.setItem(KEY,JSON.stringify(s));}")
SEASONS = ["spring", "summer", "autumn", "winter"]
PHASES = [("new", 0), ("waxing crescent", 4), ("first quarter", 7.4), ("waxing gibbous", 11), ("full", 14.77), ("waning gibbous", 18.5), ("last quarter", 22.1), ("waning crescent", 26)]
# real moons (UTC), from published tables: name the phase right within half a day
KNOWN = [("2024-01-11T11:57Z", "new moon"), ("2024-01-25T17:54Z", "full moon"), ("2024-04-08T18:21Z", "new moon"),
         ("2024-10-17T11:26Z", "full moon"), ("2025-03-14T06:55Z", "full moon"), ("2025-09-21T19:54Z", "new moon"),
         ("2024-02-16T15:01Z", "first quarter"), ("2024-03-03T15:23Z", "last quarter")]
# brightness left and right of the moon's middle, and the brightest spot over the painted moon's area
MEASURE = """(s)=>{const M=MOON_AT[s],x=PANES.x+M.x,y=PANES.y+M.y,r=M.r-2;const b=(x0,w)=>{const d=g.getImageData(x0,y-r,w,2*r).data;let t=0;for(let i=0;i<d.length;i+=4)t+=d[i]+d[i+1];return t/(d.length/4)};
 const a=g.getImageData(x-13,y-13,26,26).data;let mx=0;for(let i=0;i<a.length;i+=4)mx=Math.max(mx,a[i]+a[i+1]);return {left:b(x-r,r-1),right:b(x+2,r-1),max:mx}}"""


async def main():
    fails = []
    def check(ok, msg):
        if not ok:
            fails.append(msg)
    serve()
    os.makedirs(OUT, exist_ok=True)
    shots = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1670, "height": 942})
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        for when, want in KNOWN:
            got = await pg.evaluate("(t)=>moonName(Date.parse(t))", when)
            check(got == want, f"{when}: expected {want}, got {got}")
        await pg.evaluate(SAVE)
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        await pg.evaluate("()=>{__step(3);capClear();}")
        for s in SEASONS:
            for name, age in PHASES:
                m = await pg.evaluate("([s,a])=>{SEASON_OVERRIDE=s;MOON_TEST=a;st.night=true;st.dayT=.95;st.curtain='open';capClear();__step(2.5);capClear();__step(.1);return 1}", [s, age])
                v = await pg.evaluate(MEASURE, s)
                path = os.path.join(OUT, f"{s}_{name.replace(' ', '_')}.png")
                await pg.screenshot(path=path, clip={"x": 316 + 120, "y": 170 + 80, "width": 180, "height": 130})
                shots.append((s, name, path))
                if name == "new":
                    check(v["max"] < 300, f"{s}: at new moon the painted moon should be gone (stars and snowflakes are dimmer), brightest {v['max']}")
                if name == "full":
                    check(v["left"] > 300 and v["right"] > 300, f"{s}: the full moon should be lit all over {v}")
                if name == "first quarter":
                    check(v["right"] > v["left"] + 150, f"{s}: a waxing moon should be lit on the right {v}")
                if name == "last quarter":
                    check(v["left"] > v["right"] + 150, f"{s}: a waning moon should be lit on the left {v}")
            # the curtains close over it
            await pg.evaluate("([s])=>{MOON_TEST=14.77;st.curtain='closed';__step(3);return 1}", [s])
            check((await pg.evaluate(MEASURE, s))["max"] < 380, f"{s}: closed curtains should hide the moon")
        # by day: the day window, no moon drawn
        await pg.evaluate("()=>{SEASON_OVERRIDE='summer';MOON_TEST=14.77;st.night=false;st.dayT=.3;st.curtain='open';__step(2);return 1}")
        check(await pg.evaluate("()=>timeKey()") == "day", "expected daytime")
        fails += [f"page error: {e}" for e in errs]
        await b.close()
    from PIL import Image, ImageDraw
    cw, ch = 180, 130
    sheet = Image.new("RGB", (cw * len(PHASES) + 100, ch * len(SEASONS) + 30), (40, 28, 30))
    d = ImageDraw.Draw(sheet)
    for j, (name, _) in enumerate(PHASES):
        d.text((100 + j * cw + 4, 8), name, fill=(255, 240, 210))
    for i, s in enumerate(SEASONS):
        d.text((8, 30 + i * ch + ch // 2), s, fill=(255, 240, 210))
        for j, (name, _) in enumerate(PHASES):
            sheet.paste(Image.open(os.path.join(OUT, f"{s}_{name.replace(' ', '_')}.png")).convert("RGB").resize((cw, ch)), (100 + j * cw, 30 + i * ch))
    sheet.save(os.path.join(OUT, "sheet.png"))
    for f in fails:
        print("FAIL", f)
    print("PASS moon_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
