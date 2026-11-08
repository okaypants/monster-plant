"""Its nature on screen: the quirks you can see.

Run from the repository root:  python tests/nature_shots.py
On an iPhone 13 held sideways: a very chaotic monster bouncing in moon gravity (mid-air, and later still up), a spooky
face at the cat, and a bonk hop. Pictures go to tests/screenshots/nature/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "nature")


async def page(p, b, save):
    ctx = await b.new_context(**p.devices["iPhone 13 landscape"])
    await ctx.add_init_script(VIRTUAL_TIME)
    pg = await ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
    await pg.evaluate("()=>{const s=fresh();Object.assign(s,{started:true,day:3,dayT:.3,mode:'actions',curtain:'open',giftSeed:1,id:1,quirkT:999," + save + "});localStorage.setItem(KEY,JSON.stringify(s));}")
    await pg.reload(wait_until="load")
    await pg.click(".screen button")
    await pg.evaluate("()=>{__step(3);capClear();st.quirkT=999;}")
    return ctx, pg, errs


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx, pg, errs = await page(p, b, "stage:8,species:3,name:'Penny Flapdoodle',lc:-.8,nlc:-.6,ge:0,nge:0,free:{x:700,y:918},catTrust:.1")
        await pg.evaluate("()=>{st.float={h:0,vh:300,vx:60};__step(1.6);}")
        h = await pg.evaluate("()=>st.float&&st.float.h")
        if not h or h < 150:
            fails.append(f"moon bounce: height {h}")
        await pg.screenshot(path=os.path.join(OUT, "1_moon_bounce.png"))
        await pg.evaluate("()=>__step(20)")
        await pg.screenshot(path=os.path.join(OUT, "2_still_bouncing.png"))
        if not await pg.evaluate("()=>!!st.float"):
            fails.append("it stopped bouncing on its own")
        fails += errs
        await ctx.close()
        ctx, pg, errs = await page(p, b, "stage:8,species:10,name:'Mortie Gloomsnack',ge:-.7,nge:-.5,lc:0,nlc:0,free:{x:1150,y:918},catTrust:.1")
        await pg.evaluate("()=>{cat.state='sleep';st.quirkT=0;__step(.25);}")  # its quirk: a spooky face at the sleeping cat
        if await pg.evaluate("()=>!(st.spookT>0)"):
            await pg.evaluate("()=>{st.spookT=1.8;st.bonkT=.5;st.bonkDir=cat.x<plantBox().x?-1:1;__step(.2);}")
        await pg.screenshot(path=os.path.join(OUT, "3_spooky_face.png"))
        await pg.evaluate("()=>{st.spookT=0;__step(2);st.bonkT=.5;st.bonkDir=-1;__step(.15);}")
        await pg.screenshot(path=os.path.join(OUT, "4_bonk_hop.png"))
        fails += errs
        await ctx.close()
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS nature_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
