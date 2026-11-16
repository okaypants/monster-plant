"""The sampler on the top shelf opens its own app (sampler.html).

Run from the repository root:  python tests/sampler_shots.py
On a phone held sideways: taps the sampler on the top shelf, checks its app opens over the room with a screen,
eight empty pads and the digging panel, that an empty pad asks for a record first, and that the X brings the
room back with nothing of the app left behind. Nothing here touches the internet. Pictures go to
tests/screenshots/sampler/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "sampler")


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 844, "height": 390}, device_scale_factor=2, has_touch=True)
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate("()=>{const s=fresh();Object.assign(s,{started:true,stage:6,species:4,id:1,day:3,dayT:.3,mode:'actions',curtain:'open',giftSeed:1,catTrust:.1,free:{x:400,y:918}});localStorage.setItem(KEY,JSON.stringify(s));}")
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        await pg.evaluate("()=>{capClear();__step(2);}")
        await pg.screenshot(path=os.path.join(OUT, "room.png"))
        # the middle of the sampler, in screen dots
        x, y = await pg.evaluate("()=>{const r=cv.getBoundingClientRect();return [r.left+(SAMPLER.x+SAMPLER.w/2)*S,r.top+(SAMPLER.y+SAMPLER.h/2)*S];}")
        await pg.mouse.click(x, y)
        await pg.wait_for_selector(".screen.sampler iframe")
        fr = pg.frame_locator(".screen.sampler iframe")
        await fr.locator("#pads .p").first.wait_for()
        n = await fr.locator("#pads .p").count()
        if n != 8:
            fails.append(f"the sampler should have 8 pads, found {n}")
        if await fr.locator("#pads .p.full").count():
            fails.append("pads should start empty")
        for sel in ("#lcd", "#q", "#tags .t", "#play", "#erase", "#x"):
            if not await fr.locator(sel).first.is_visible():
                fails.append(f"missing on the sampler: {sel}")
        await pg.screenshot(path=os.path.join(OUT, "open.png"))
        await fr.locator("#pads .p").first.click()
        said = await fr.locator("#l2").text_content()
        if "record" not in said:
            fails.append(f"an empty pad with nothing playing should ask for a record first, said: {said!r}")
        await pg.screenshot(path=os.path.join(OUT, "empty_pad.png"))
        await fr.locator("#x").click()
        await pg.wait_for_selector(".screen.sampler", state="detached")
        if await pg.evaluate("()=>!!samplerEl||!!document.querySelector('iframe')"):
            fails.append("closing the sampler should leave nothing of it behind")
        await pg.evaluate("()=>__step(1)")
        await pg.screenshot(path=os.path.join(OUT, "back_in_room.png"))
        fails += errs
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS sampler_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
