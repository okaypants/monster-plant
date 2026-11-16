"""Things in the room are lit like the room (js/light.js, lightAt and litPic).

Run from the repository root:  python tests/sprite_light_shots.py
A teen monster on the rug by the floor lamp and the cat beside it, at noon, at golden hour, at noon with the curtains
shut, and at night with the lamps on and off. Checks: at noon in daylight nothing is tinted; golden hour and night are darker, and
shut curtains never brighter (they follow the art, which hardly changes by the rug); at night the lamps make them warm and
the dark makes them blue; never darker than the
floor; and the monster's own pixels really are darker at night. Pictures go to tests/screenshots/sprite_light/.
Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "sprite_light")
CASES = [  # name, time, curtains, lamps
    ("noon", "s.dayT=.37;", "open", True),
    ("golden", "s.dayT=.6;", "open", True),
    ("noon_curtains_shut", "s.dayT=.37;", "closed", True),
    ("night_lamps_on", "s.dayT=.9;s.night=true;", "open", True),
    ("night_lamps_off", "s.dayT=.9;s.night=true;", "open", False),
]


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails, got = [], {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, tjs, cur, lamps in CASES:
            ctx = await b.new_context(viewport={"width": 1670, "height": 942})
            await ctx.add_init_script(VIRTUAL_TIME)
            pg = await ctx.new_page()
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
            lit = "true" if lamps else "false"
            await pg.evaluate("()=>{const s=fresh();s.started=true;s.stage=6;s.species=4;s.giftSeed=1;s.mode='actions';s.free={x:330,y:918};s.catTrust=.1;"
                              + tjs + f"s.curtain='{cur}';s.lamp={lit};s.desk={lit};localStorage.setItem(KEY,JSON.stringify(s));}}")
            await pg.reload(wait_until="load")
            await pg.click(".screen button")
            await pg.evaluate("()=>{capClear();cat.x=520;cat.y=918;__step(3);capClear();__step(.2);}")
            r = await pg.evaluate("""()=>{const b=plantBox(),L=lightAt(b.x+b.w/2,b.y+b.h),cb=catBox(),C=cb?lightAt(cb.x+cb.w/2,cb.y+cb.h):null;
              const d=g.getImageData(Math.round(b.x+b.w*.3),Math.round(b.y+b.h*.45),Math.round(b.w*.4),Math.round(b.h*.2)).data;let s=0,n=0;
              for(let i=0;i<d.length;i+=4)if(d[i+3]>200){s+=d[i]+d[i+1]+d[i+2];n++;}return {f:L.f,dim:L.dim,cat:C&&C.f,px:n?s/n:0};}""")
            got[name] = r
            await pg.screenshot(path=os.path.join(OUT, name + ".png"))
            fails += [name + ": " + e for e in errs]
            await ctx.close()
        await b.close()
    s = lambda k: sum(got[k]["f"])
    if got["noon"]["dim"]:
        fails.append(f"at noon in daylight the monster should not be tinted, got {got['noon']['f']}")
    if s("noon_curtains_shut") > s("noon"):
        fails.append(f"shut curtains should never make them brighter: {got['noon_curtains_shut']['f']}")
    for k in ("golden", "night_lamps_on", "night_lamps_off"):
        if not s(k) < s("noon"):
            fails.append(f"{k} should be darker than noon: {got[k]['f']}")
        if min(got[k]["f"]) < .42 - 1e-9:
            fails.append(f"{k} is darker than the floor: {got[k]['f']}")
    warm = lambda k: got[k]["f"][0] / got[k]["f"][2]
    if not warm("night_lamps_on") > warm("night_lamps_off") * 1.2:
        fails.append(f"at night the lamps should make them warmer, the dark bluer: on {got['night_lamps_on']['f']}, off {got['night_lamps_off']['f']}")
    if not got["night_lamps_off"]["px"] < got["noon"]["px"] * .85:
        fails.append(f"the monster's own pixels should be darker at night: noon {got['noon']['px']:.0f}, night {got['night_lamps_off']['px']:.0f}")
    if any(got[k]["cat"] is None for k in got):
        fails.append("the cat should be in the room")
    for k, v in got.items():
        print(f"{k:20s} monster {v['f']}  cat {v['cat']}  pixels {v['px']:.0f}")
    for f in fails:
        print("FAIL", f)
    print("PASS sprite_light_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
