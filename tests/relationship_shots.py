"""Relationship pages in the journal: each relationship gets its own spread with milestones.

Run from the repository root:  python tests/relationship_shots.py
Two adults (Pip and Mortie) and the cat on an iPhone 13 held sideways: Pip & you, Pip & Mortie, Pip & the cat,
the cat & you, the cat & Mortie, reached with the little arrows. Checks every spread fits with nothing scrolling.
Pictures go to tests/screenshots/relationships/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "relationships")
OTHER = "(()=>{const f=fresh(),q={};for(const k in f)if(!GLOBAL.has(k))q[k]=f[k];return q;})()"
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,day:9,dayT:.3,mode:'actions',curtain:'open',giftSeed:1,id:1,nextId:3,stage:8,species:3,name:'Pip Wobblebean',"
        "ge:.6,lc:.5,nge:.4,free:{x:300,y:918},fav:'cotton',titles:['good'],cnt:{pets:12,treats:4,read_fairy:3,read_nonsense:1},ms:{routine:4,'bicker:2':3,'madeup:2':3},"
        "quirks:{catfriend:1},catTrust:.7,catName:'Tofu',catSeen:{sniff:1,purr:1},catNaps:{byplant:6,bed:3},catBond:{1:{bond:5,hmph:0},2:{bond:1,hmph:2}},"
        "others:[Object.assign(" + OTHER + ",{id:2,stage:8,species:7,name:'Mortie Gloomsnack',ge:-.6,lc:-.5,free:{x:1250,y:918}})]});localStorage.setItem(KEY,JSON.stringify(s));}")


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
        await pg.evaluate(SAVE)
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        await pg.evaluate("()=>{__step(3);capClear();openJournal('p1');__step(.3);}")
        await pg.evaluate("()=>document.fonts.ready")
        n = 0
        for page, count in (("p1", 3), ("cat", 2)):
            if page == "cat":
                await pg.click(".jrib[data-page=cat]")
                await pg.evaluate("()=>__step(.3)")
            for i in range(count):
                await pg.click(".jarrow.jnext")
                await pg.evaluate("()=>__step(.3)")
                await pg.wait_for_timeout(200)
                r = await pg.evaluate("()=>({title:document.querySelector('.jl .jname')?.textContent,miles:document.querySelectorAll('.jmiles .jstamp').length,"
                                      "over:[...document.querySelectorAll('.jpage')].some(p=>p.scrollHeight>p.clientHeight+1||p.scrollWidth>p.clientWidth+1)})")
                n += 1
                if not r["title"] or r["miles"] < 3:
                    fails.append(f"spread {n}: {r}")
                if r["over"]:
                    fails.append(f"spread {n} ({r['title']}) overflows")
                await pg.screenshot(path=os.path.join(OUT, f"{n}_{r['title'].replace(' & ', '_and_').replace(' ', '_')}.png"))
        fails += errs
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS relationship_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
