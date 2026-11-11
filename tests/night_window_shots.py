"""Night windows for every season (Jackie, Nov 10).

Run from the repository root:  python3 tests/night_window_shots.py
The night room in spring, summer, autumn and winter, curtains open and closed, to tests/screenshots/night_window/ (plus sheet.png).
Checks: with the curtains open each season shows its own view; outside the glass the window piece is the same in every season
(the night_window_*.png files differ from the winter one only behind the glass); with the curtains closed the room looks the same
in every season; golden hour and daytime are unchanged by this. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(SHOTS, "night_window")
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:1,day:3,dayT:.95,night:true,giftSeed:1,mode:'actions',curtain:'open',"
        "catTrust:.1,free:{x:1250,y:918},name:'Zib Wigglebottom'});localStorage.setItem(KEY,JSON.stringify(s));}")
SEASONS = ["spring", "summer", "autumn", "winter"]
# the window's middle pane and a strip of the left curtain, from the room canvas
PANE = "()=>Array.from(g.getImageData(420,330,60,60).data).filter((v,i)=>i%4!==3)"
CURTAIN = "()=>Array.from(g.getImageData(330,120,12,40).data).filter((v,i)=>i%4!==3)"


def diff(a, b):
    return sum(abs(x - y) for x, y in zip(a, b)) / max(1, len(a))


async def main():
    fails = []
    def check(ok, msg):
        if not ok:
            fails.append(msg)
    # the files: outside the glass, identical to the winter piece
    from PIL import Image, ImageChops
    win = Image.open(os.path.join(ROOT, "night_window_winter.png")).convert("RGB")
    for s in ("spring", "summer", "autumn"):
        im = Image.open(os.path.join(ROOT, f"night_window_{s}.png")).convert("RGB")
        check(im.size == win.size, f"{s}: size {im.size}, expected {win.size}")
        d = ImageChops.difference(im, win).convert("L").point(lambda v: 255 if v > 0 else 0)
        for x0, y0, x1, y1 in ((0, 0, 20, 100), (240, 0, 254, 100), (215, 400, 254, 434), (20, 116, 230, 126), (71, 120, 80, 430), (165, 120, 175, 300)):  # curtains, chair, the bars
            check(d.crop((x0, y0, x1, y1)).getbbox() is None, f"{s}: changed outside the glass at {x0},{y0}-{x1},{y1}")
    serve()
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1670, "height": 942})
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate(SAVE)
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        await pg.evaluate("()=>{__step(3);capClear();}")
        panes, closed, shots = {}, {}, []
        for s in SEASONS:
            for cur in ("open", "closed"):
                await pg.evaluate("([s,c])=>{SEASON_OVERRIDE=s;st.night=true;st.dayT=.95;st.curtain=c;capClear();__step(3);capClear();__step(.1);}", [s, cur])
                path = os.path.join(OUT, f"{s}_{cur}.png")
                await pg.screenshot(path=path)
                shots.append((f"{s}, curtains {cur}", path))
                if cur == "open":
                    panes[s] = await pg.evaluate(PANE)
                    check(await pg.evaluate("()=>{const w=WIN_SEASON.night[seasonNow()];return !!w&&ok(w);}"), f"{s}: no night window loaded")
                else:
                    closed[s] = await pg.evaluate(PANE)
        for i, a in enumerate(SEASONS):
            for c in SEASONS[i + 1:]:
                check(diff(panes[a], panes[c]) > 8, f"night, curtains open: {a} and {c} look the same through the window")
                check(diff(closed[a], closed[c]) < 1, f"night, curtains closed: {a} and {c} differ ({diff(closed[a], closed[c]):.1f})")
        # golden hour and day: no night piece involved
        r = await pg.evaluate("()=>{SEASON_OVERRIDE='summer';st.night=false;st.dayT=.6;st.curtain='open';__step(2);return timeKey();}")
        check(r == "golden", f"expected golden hour, got {r}")
        check(await pg.evaluate("()=>!WIN_SEASON.golden"), "golden hour should keep its own window")
        fails += [f"page error: {e}" for e in errs]
        await b.close()
    try:
        tw = 560
        ims = [(t, Image.open(pth).convert("RGB")) for t, pth in shots]
        ims = [(t, im.resize((tw, round(im.height * tw / im.width)))) for t, im in ims]
        th = ims[0][1].height
        from PIL import ImageDraw
        sheet = Image.new("RGB", (2 * (tw + 12) + 12, 4 * (th + 30) + 12), "white")
        d = ImageDraw.Draw(sheet)
        for k, (t, im) in enumerate(ims):
            x, y = 12 + (k % 2) * (tw + 12), 12 + (k // 2) * (th + 30)
            d.text((x, y), "Night, " + t, fill="black")
            sheet.paste(im, (x, y + 18))
        sheet.save(os.path.join(OUT, "sheet.png"))
    except Exception as e:
        fails.append(f"sheet: {e}")
    for f in fails:
        print("FAIL", f)
    print("PASS night_window_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    asyncio.run(main())
