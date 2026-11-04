"""Screenshots of the debug Light map, and checks of how plants react to light.

Run from the repository root:  python tests/light_map_shots.py
1. The Light map at morning, noon, golden hour and night x curtains open/closed x lamps on/off, with three plants
   (an adult shade-lover on the rug, a kid sun-lover on the milk crate, a sprout night-lover on the desk).
2. Light zone cases at noon (a shade plant on the left of the rug, in the window's sun patch, under a lamp...),
   each checked: too much light only bothers it after a while, squint + lean first, flame only in the extreme case,
   moving it out fixes it right away. Exit code 1 if a check fails.
Pictures go to tests/screenshots/lightmap/ (plus contact_sheet.png) and tests/screenshots/zones/.
"""
import asyncio, os, sys
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
                    await pg.click("#dbgBtn"); await pg.locator("#dbg .row", has=pg.locator("label", has_text="Light map")).locator("button", has_text="on").click(); await pg.locator("#dbg button", has_text="Hide").click()  # Light map on (debug drawer, test mode), drawer hidden
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
        fails = await zones(b)
        await b.close()
    print("saved to tests/screenshots/lightmap/ and tests/screenshots/zones/")
    if fails:
        print(f"FAIL: {fails} light zone checks")
        sys.exit(1)


NOON = "s.dayT=.37;s.mode='actions';s.curtain='open';s.lamp=true;s.desk=true;s.giftSeed=1;s.others=[];"
ADULT = NOON + "s.stage=8;s.species=3;"
SPROUT = NOON + "s.stage=1;s.species=2;s.timer=-1e9;"  # stays a sprout (sprouts grow up in seconds)
ZONES = [  # name, save, js after a run (or ''), seconds, check, Light map on
    ("shade_rug-left_noon", ADULT + "s.pref='shade';s.free={x:260,y:918};", "", 60,
     "st.lightState==='ok'&&!st.glare", True),
    ("shade_sun-patch_noon_10s", ADULT + "s.pref='shade';s.free={x:470,y:852};", "", 10,
     "st.lightState==='ok'&&lightFeel(spotInfo('free'),'shade')==='hi'", True),  # too much, but not long enough to mind
    ("shade_sun-patch_noon_30s_squint", ADULT + "s.pref='shade';s.free={x:470,y:852};", "", 30,
     "st.lightState==='hi'&&st.glare===1&&leanOff()!==0", False),
    ("shade_sun-patch_noon_30s_map", ADULT + "s.pref='shade';s.free={x:470,y:852};", "", 30,
     "st.lightState==='hi'&&st.glare===1", True),
    ("shade_moved-out_right-away", ADULT + "s.pref='shade';s.free={x:470,y:852};", "st.free={x:260,y:918};st.walk=null;", 30,
     "st.lightState==='ok'&&!st.glare&&leanOff()===0", False),
    ("shade_sun-patch_noon_curtains-closed", ADULT + "s.pref='shade';s.free={x:470,y:852};s.curtain='closed';", "", 60,
     "st.lightState==='ok'", True),
    ("sun_sun-patch_noon", ADULT + "s.pref='sun';s.free={x:470,y:852};", "", 60,
     "st.lightState==='ok'", True),
    ("shade_sprout_under-desk-lamp_30s", SPROUT + "s.pref='shade';s.place={seed:'desk'};", "", 30,
     "st.lightState==='hi'&&st.glare===1", True),  # right under a lamp: too warm, after a while
    ("shade_sprout_desk_lamp-off", SPROUT + "s.pref='shade';s.place={seed:'desk'};s.desk=false;", "", 60,
     "st.lightState==='ok'", True),
    ("sun_sprout_desk_curtains-closed", SPROUT + "s.pref='sun';s.place={seed:'desk'};s.curtain='closed';", "", 60,
     "st.lightState==='ok'", True),  # grow light: a sun-lover grows with the curtains closed
    ("night_sprout_sill_noon_long_flame", SPROUT + "s.pref='night';s.place={seed:'sill'};", "", 70,
     "st.lightState==='hi'&&st.glare===2", False),  # the one extreme case
]


async def zones(b):
    out = os.path.join(SHOTS, "zones")
    os.makedirs(out, exist_ok=True)
    fails = 0
    for name, save, after, secs, check, map_on in ZONES:
        ctx = await b.new_context(viewport={"width": 1670, "height": 942})
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate("()=>{const s=fresh();s.started=true;" + save + "localStorage.setItem(KEY,JSON.stringify(s));}")
        await pg.reload(wait_until="load")
        await pg.click(".screen button")  # Continue
        if map_on:
            await pg.click("#dbgBtn"); await pg.locator("#dbg .row", has=pg.locator("label", has_text="Light map")).locator("button", has_text="on").click(); await pg.locator("#dbg button", has_text="Hide").click()
        await pg.evaluate("s=>__step(s)", secs)
        if after:
            await pg.evaluate("()=>{" + after + "}")
            await pg.evaluate("()=>__step(.2)")
        await pg.evaluate("()=>{for(let i=0;i<60&&st.lightState==='hi'&&!squinting();i++)__step(.05)}")  # land on a squinting frame
        ok = await pg.evaluate("()=>!!(" + check + ")")
        state = await pg.evaluate("()=>st.lightState+' glare '+(st.glare||0)+' light '+st.light.toFixed(2)")
        await pg.wait_for_timeout(800)  # the caption's fade-out runs on real time
        await pg.screenshot(path=os.path.join(out, name + ".png"))
        print(("ok   " if ok and not errs else "FAIL ") + name + "  (" + state + ")", *errs)
        fails += (not ok) or bool(errs)
        await ctx.close()
    return fails


asyncio.run(main())
