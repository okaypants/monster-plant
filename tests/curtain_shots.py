"""Closed curtains with a plant in the wrong light: screenshots and checks.

Run from the repository root:  python tests/curtain_shots.py
Day, golden hour and night with the curtains closed (both lamps on, so the curtain pieces are drawn) and a sun-loving
adult too far from any light. Checks that the plant shows it in the daytime (too dark, withering; golden hour and night never wither anyone) and that the curtains stay perfectly
still (no wiggle): the curtain area must be pixel-identical over two seconds. Pictures go to tests/screenshots/curtains/.
Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "curtains")
TIMES = {"day": ".3", "golden": ".6", "night": ".88"}  # night by the clock, so the plant is still awake to show it
SAVE = ("s.mode='actions';s.curtain='closed';s.lamp=true;s.desk=true;s.giftSeed=1;s.others=[];"
        "s.stage=8;s.species=3;s.pref='sun';s.free={x:1000,y:880};")  # a sun-lover in soft room light: too dark
# the upper curtain, above any plant's head
CURTAIN_AREA = "()=>{const d=g.getImageData(250,30,420,270).data;let h=0;for(let i=0;i<d.length;i+=3)h=(h*31+d[i])|0;return h;}"


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, t in TIMES.items():
            ctx = await b.new_context(viewport={"width": 1670, "height": 942})
            await ctx.add_init_script(VIRTUAL_TIME)
            pg = await ctx.new_page()
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
            await pg.evaluate("()=>{const s=fresh();s.started=true;s.dayT=" + t + ";" + SAVE + "localStorage.setItem(KEY,JSON.stringify(s));}")
            await pg.reload(wait_until="load")
            await pg.click(".screen button")  # Continue
            await pg.evaluate("()=>__step(8)")  # curtains settle, the plant notices its light (a grown plant scoots off after ~12 s)
            state = await pg.evaluate("()=>({light:st.lightState,wither:st.witherLv||0,time:timeKey(),hints:typeof wob!=='undefined'})")
            frames = []
            for _ in range(8):  # sample the curtain area every quarter second
                await pg.evaluate("()=>__step(.25)")
                frames.append(await pg.evaluate(CURTAIN_AREA))
            if name == "day" and (state["light"] != "lo" or state["wither"] < 1):
                fails.append(f"{name}: plant should be too dark and withering, got {state}")
            if name != "day" and (state["light"] != "ok" or state["wither"] != 0):  # golden hour and night are dim for everyone: nobody withers
                fails.append(f"{name}: evening light should never wither anyone, got {state}")
            if state["time"] != name:
                fails.append(f"{name}: room shows {state['time']}")
            if len(set(frames)) != 1:
                fails.append(f"{name}: curtain area moved ({len(set(frames))} different frames)")
            if state["hints"]:
                fails.append(f"{name}: object hints still exist")
            fails += [f"{name}: {e}" for e in errs]
            await pg.wait_for_timeout(800)  # the caption's fade-out runs on real time
            await pg.screenshot(path=os.path.join(OUT, f"{name}_curtains-closed_too-dark.png"))
            print(f"{name}: light {state['light']}, withered {state['wither']}/3, curtain frames identical: {len(set(frames)) == 1}")
            await ctx.close()
        await b.close()
    for f in fails:
        print("FAIL", f)
    if fails:
        sys.exit(1)
    print("PASS: plant shows the wrong light, curtains stay still. Screenshots in tests/screenshots/curtains/")


if __name__ == "__main__":
    asyncio.run(main())
