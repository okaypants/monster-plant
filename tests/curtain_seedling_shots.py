"""A seedling on the windowsill hides behind the curtains when they close.

Run from the repository root:  python3 tests/curtain_seedling_shots.py
A sprout on the sill: visible with the curtains open; halfway through closing the fabric is sweeping over it; once they're
shut the seedling isn't drawn (the sill looks exactly like the room with no plant) and can't be tapped (tapping there opens
the curtains instead of petting); open again, it's back. A seedling on the desk is never hidden.
Pictures go to tests/screenshots/curtain_seedling/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "curtain_seedling")
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:1,species:2,id:1,day:2,dayT:.3,giftSeed:1,mode:'actions',curtain:'open',"
        "name:'Pip Wobblebean',timer:2000,catTrust:.1,place:{seed:'sill'},needs:{thirst:0,hunger:0,attention:0}});localStorage.setItem(KEY,JSON.stringify(s));}")
# how many pixels in the seedling's box differ from the same frame drawn with no plant at all
DIFF = ("()=>{cat.x=-999;draw();const b=plantBoxRaw(),A=g.getImageData(b.x,b.y,b.w,b.h).data;const s0=st.stage;st.stage=-1;draw();"
        "const B=g.getImageData(b.x,b.y,b.w,b.h).data;st.stage=s0;draw();let n=0;for(let i=0;i<A.length;i+=4)if(Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2])>30)n++;return n;}")


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    check = lambda ok, msg: ok or fails.append(msg)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1440, "height": 812})
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate(SAVE)
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        await pg.evaluate("()=>{__step(3);capClear();}")

        async def tap_seedling():
            c = await pg.evaluate("()=>{const b=plantBoxRaw(),r=cv.getBoundingClientRect();return [r.left+(b.x+b.w/2)*S,r.top+(b.y+b.h*.6)*S];}")
            await pg.mouse.click(*c)
            await pg.evaluate("()=>__step(.2)")

        check(await pg.evaluate(DIFF) > 200, "the seedling isn't visible with the curtains open")
        await pg.screenshot(path=os.path.join(OUT, "1_open.png"))
        await pg.evaluate("()=>{st.curtain='closed';__step(.25);}")
        mid = await pg.evaluate("()=>curK")
        check(.1 < mid < .9, f"not mid-sweep: curK {mid}")
        await pg.screenshot(path=os.path.join(OUT, "2_closing.png"))
        await pg.evaluate("()=>__step(2)")
        n = await pg.evaluate(DIFF)
        check(n == 0, f"the seedling still shows through closed curtains ({n} pixels)")
        check(not await pg.evaluate("()=>{const b=plantBoxRaw();return onPlantPx(b.x+b.w/2,b.y+b.h*.6)||onPlant(b.x+b.w/2,b.y+b.h*.6);}"), "the hidden seedling can still be touched")
        await pg.screenshot(path=os.path.join(OUT, "3_closed.png"))
        await tap_seedling()
        check(await pg.evaluate("()=>st.curtain==='open'"), "tapping the curtain over the seedling didn't open the curtains")
        await pg.evaluate("()=>__step(2)")
        check(await pg.evaluate(DIFF) > 200, "the seedling didn't come back when the curtains opened")
        await pg.screenshot(path=os.path.join(OUT, "4_open_again.png"))
        # on the desk it never hides
        await pg.evaluate("()=>{st.place.seed='desk';st.curtain='closed';__step(2);}")
        check(await pg.evaluate(DIFF) > 200, "a seedling on the desk hid when the curtains closed")
        fails += errs
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS curtain_seedling_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
