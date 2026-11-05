"""Journal shots: the keepsake book on an iPhone 13 held sideways.

Run from the repository root:  python tests/journal_shots.py
A kid's page; an adult's page with titles, charms and quirks; two friends; the cat's page at low and high trust.
Checks the book fits the screen with nothing scrolling and no page errors. Pictures go to tests/screenshots/journal/.
Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "journal")
BASE = "s.started=true;s.day=6;s.dayT=.3;s.mode='actions';s.curtain='open';s.giftSeed=1;"
OTHER = "(()=>{const f=fresh(),q={};for(const k in f)if(!GLOBAL.has(k))q[k]=f[k];return q;})()"
SHOTS_LIST = [
    ("1_kid", BASE + "s.stage=4;s.species=0;s.nge=.4;s.ge=.3;s.pref='sun';s.catTrust=.1;", "p"),
    ("2_adult_titles_charms_quirks", BASE + "s.stage=8;s.species=10;s.nge=-.4;s.nlc=-.3;s.ge=-.6;s.lc=-.5;s.pref='night';s.free={x:1250,y:918};"
     "s.titles=['evil','chaotic'];s.traits=['Dino-skull clip','Heart-charm bow','Pizza bow'];s.wear='Heart-charm bow';s.fav='blood';"
     "s.quirks={bonk:1,wander:1,boo:1,dark:1,novel:1};s.catTrust=.4;", "p"),
    ("3_friends", BASE + "s.stage=8;s.species=3;s.ge=.6;s.lc=.6;s.nge=.3;s.pref='shade';s.free={x:300,y:918};s.titles=['good'];s.quirks={share:1,catfriend:1};s.fav='solar';s.id=1;s.nextId=3;"
     f"s.others=[Object.assign({OTHER},{{id:2,stage:8,species:7,ge:.6,lc:.6,pref:'sun',free:{{x:1250,y:918}}}})];s.catTrust=.4;", "p"),
    ("4_cat_low_trust", BASE + "s.stage=6;s.species=4;s.free={x:1250,y:918};s.catTrust=.1;s.catNaps={bed:2};s.catSeen={sniff:1};", "cat"),
    ("5_cat_high_trust", BASE + "s.stage=6;s.species=4;s.free={x:1250,y:918};s.catTrust=.95;s.catNaps={bed:9,sill:6,chair:4,rug:1};s.catSeen={sniff:1,purr:1,byplant:1,huff:1};", "cat"),
]


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, save, page in SHOTS_LIST:
            ctx = await b.new_context(**p.devices["iPhone 13 landscape"])
            await ctx.add_init_script(VIRTUAL_TIME)
            pg = await ctx.new_page()
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
            await pg.evaluate("()=>{const s=fresh();" + save + "localStorage.setItem(KEY,JSON.stringify(s));}")
            await pg.reload(wait_until="load")
            await pg.click(".screen button")
            await pg.evaluate("()=>{__step(3);capClear();}")
            await pg.evaluate("p=>{openJournal(p==='cat'?'cat':undefined);__step(.3);}", page)
            await pg.evaluate("()=>document.fonts.ready")
            await pg.wait_for_timeout(300)
            r = await pg.evaluate("""()=>{const b=document.querySelector('.jbook').getBoundingClientRect(),pages=[...document.querySelectorAll('.jpage')];
              return {l:b.left,t:b.top,r:b.right,bt:b.bottom,w:innerWidth,h:innerHeight,over:pages.some(p=>p.scrollHeight>p.clientHeight+1||p.scrollWidth>p.clientWidth+1)};}""")
            if r["l"] < 0 or r["t"] < 0 or r["r"] > r["w"] + 1 or r["bt"] > r["h"] + 1:
                fails.append(f"{name}: the book doesn't fit the screen {r}")
            if r["over"]:
                fails.append(f"{name}: a page overflows (would need scrolling)")
            await pg.screenshot(path=os.path.join(OUT, name + ".png"))
            fails += [f"{name}: {e}" for e in errs]
            await ctx.close()
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS journal_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
