"""Welcome back: what it says happened while you were away is really there in the room.

Run from the repository root:  python tests/welcome_shots.py
On an iPhone 13 held sideways, coming back after 3 hours: two friends scooted close together; two who bicker sulking on
opposite sides; a very chaotic one bouncing in moon gravity; the cat napping far from a spooky one.
Pictures go to tests/screenshots/welcome/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "welcome")
OTHER = "(()=>{const f=fresh(),q={};for(const k in f)if(!GLOBAL.has(k))q[k]=f[k];return q;})()"
BASE = "started:true,day:5,dayT:.3,mode:'actions',curtain:'open',giftSeed:1,id:1,nextId:3,catName:'Tofu',catTrust:.3,lastSeen:Date.now()-3*3600e3,"
CASES = [
    ("1_friends", BASE + "stage:8,species:3,name:'Pip Wobblebean',ge:.6,lc:.6,free:{x:300,y:918},others:[Object.assign(" + OTHER + ",{id:2,stage:8,species:7,name:'Mortie Gloomsnack',ge:.6,lc:.6,free:{x:1350,y:918}})]", "scooted close together"),
    ("2_bicker", BASE + "stage:8,species:3,name:'Pip Wobblebean',ge:.6,lc:.6,free:{x:700,y:918},others:[Object.assign(" + OTHER + ",{id:2,stage:8,species:7,name:'Mortie Gloomsnack',ge:-.6,lc:-.6,free:{x:950,y:918}})]", "sulking on opposite sides"),
    ("3_moon", BASE + "stage:8,species:3,name:'Penny Flapdoodle',lc:-.8,nlc:-.6,ge:0,nge:0,free:{x:700,y:918}", "moon gravity"),
    ("4_cat_far_from_spooky", BASE + "stage:8,species:10,name:'Mortie Gloomsnack',ge:-.7,nge:-.5,lc:0,nlc:0,free:{x:1300,y:918}", "as far from Mortie as possible"),
]


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, save, want in CASES:
            ctx = await b.new_context(**p.devices["iPhone 13 landscape"])
            await ctx.add_init_script(VIRTUAL_TIME)
            pg = await ctx.new_page()
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
            await pg.evaluate("()=>{const s=fresh();Object.assign(s,{" + save + "});localStorage.setItem(KEY,JSON.stringify(s));}")
            await pg.reload(wait_until="load")
            await pg.click(".screen button")
            await pg.evaluate("()=>__step(1.4)")
            txt = await pg.evaluate("()=>CAP.log.concat(CAP.q).concat(CAP.cur||[]).map(c=>c.t).join(' | ')")
            await pg.evaluate("w=>{for(let i=0;i<40&&!(CAP.cur&&CAP.cur.t.includes(w));i++)__step(.5);}", want)  # wait for the line about it
            if want not in txt:
                fails.append(f"{name}: {txt!r}")
            await pg.evaluate("()=>document.fonts.ready")
            await pg.wait_for_timeout(700)
            await pg.screenshot(path=os.path.join(OUT, name + ".png"))
            fails += [f"{name}: {e}" for e in errs]
            await ctx.close()
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS welcome_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
