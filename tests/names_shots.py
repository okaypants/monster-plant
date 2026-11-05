"""Names: a monster's eyes open, it gets a name and says hello; its journal page shows the name.

Run from the repository root:  python tests/names_shots.py
On an iPhone 13 held sideways: the hello caption when a sprout becomes a kid, and the journal page with the name on top
(species small underneath). Pictures go to tests/screenshots/names/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "names")


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(**p.devices["iPhone 13 landscape"])
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate("()=>{const s=fresh();Object.assign(s,{started:true,stage:1,timer:0,species:0,id:1,day:2,dayT:.3,mode:'actions',curtain:'open',giftSeed:1,nge:.5,nlc:0,ge:.4,catTrust:.1});localStorage.setItem(KEY,JSON.stringify(s));}")
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        await pg.evaluate("()=>{__step(1);capClear();CAP.seen.clear();st.timer=29.5;__step(1.5);}")  # past the welcome back; then the timer runs out: eyes open
        name = await pg.evaluate("()=>st.name")
        txt = await pg.evaluate("()=>CAP.cur?CAP.cur.t:''")
        if not name or txt != f"Its eyes open! Hello, {name}!":
            fails.append(f"hello caption: {txt!r} (name {name!r})")
        await pg.evaluate("()=>document.fonts.ready")
        await pg.wait_for_timeout(700)
        await pg.screenshot(path=os.path.join(OUT, "1_hello_caption.png"))
        await pg.evaluate("()=>{capClear();st.fav='cotton';st.quirks={share:1};openJournal();__step(.3);}")
        await pg.wait_for_timeout(300)
        shown = await pg.evaluate("()=>[document.querySelector('.jrename')?.textContent,document.querySelector('.jspecies')?.textContent]")
        if shown[0] != name or not shown[1]:
            fails.append(f"journal shows {shown}")
        await pg.screenshot(path=os.path.join(OUT, "2_journal_name.png"))
        fails += errs
        await b.close()
    for f in fails:
        print("FAIL", f)
    print(f"PASS names_shots ({name})" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
