"""Start over, then the new seedling's journal.

Run from the repository root:  python3 tests/start_over_test.py
Starting over used to leave the new seed without an id until the next reload, so its journal opened blank with an error
when it landed on a relationship spread. Checks the new seed has an id straight away and every spread of its journal draws.
Exit code 1 if a check fails.
"""
import asyncio, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, VIRTUAL_TIME, serve

SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:7,nextId:7,day:3,dayT:.3,giftSeed:1,mode:'actions',"
        "catTrust:.1,free:{x:1250,y:918},name:'Zib Wigglebottom'});localStorage.setItem(KEY,JSON.stringify(s));}")


async def main():
    fails = []
    serve()
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
        await pg.click(".screen button[data-k=new]")
        if await pg.evaluate("()=>st.id") != 1:
            fails.append("after Start over the new seed should have an id at once")
        # the seed planted, the journal opened on each of its spreads (the book remembers which spread it was last on)
        r = await pg.evaluate("""()=>{document.querySelectorAll('.screen').forEach(s=>s.remove());st.started=true;st.stage=0;st.name='Pim';const out=[];
          for(let sub=0;sub<4;sub++){jSub=sub;openJournal();out.push([jPage,jSub,document.querySelector('.jl').children.length>0,!!document.getElementById('errbox')]);closeJournal()}return out}""")
        if not all(x[0] == "p1" and x[2] and not x[3] for x in r):
            fails.append(f"every spread of the new seedling's journal should draw, with no error: {r}")
        fails += [f"page error: {e}" for e in errs]
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS start_over_test" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
