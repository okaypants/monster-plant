"""The journal's growth row, growth line and day line, on an iPhone 13 held sideways.

Run from the repository root:  python3 tests/journal_growth_test.py
Checks:
  - the next age's silhouette fills from the bottom in whole pixel rows as it grows; past ages filled, later ones pale;
  - the line under the silhouettes changes as growing gets closer: in a few days -> tomorrow -> in a while -> any time now,
    and adults get the calm line;
  - while something slows its growing, the line says what, kindly (a drink, company, the right light, a little shade),
    the same reasons the debug drawer shows;
  - the top corner says today in words ("Tuesday morning · autumn"), from the device's clock and the real season;
  - no numbers in any of it.
Pictures of a kid's page at a few growth points go to tests/screenshots/journal_growth/ (with sheet.png).
Exit code 1 if a check fails.
"""
import asyncio, os, re, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "journal_growth")
# the tests' clock: Tuesday Nov 10, 10 am. A kid on the book stack, cared for, in good light.
BASE = ("s.started=true;s.day=6;s.curtain='open';s.giftSeed=1;s.id=1;s.species=6;s.name='Tuffet Mossmuffin';s.pref='shade';"
        "s.place={baby:'books',seed:'sill'};s.catTrust=.1;s.needs={thirst:0,hunger:0,attention:0};")
READ = ("()=>{const c=[...document.querySelectorAll('.jgrowth canvas')];return {line:(document.querySelector('.jgrowline')||{}).textContent,"
        "day:(document.querySelector('.jday')||{}).textContent,rows:c.map(x=>x.dataset.rows==null?null:+x.dataset.rows),of:c.map(x=>+x.dataset.of||0),"
        "fit:(()=>{const p=document.querySelector('.jl');return p.scrollHeight<=p.clientHeight+1;})(),"
        "clear:(()=>{const d=document.querySelector('.jday'),r=d&&d.getBoundingClientRect(),hit=[...document.querySelectorAll('.jr .jlabel,.jclose,.jr button')].filter(e=>e!==d&&(()=>{const q=e.getBoundingClientRect();return q.width&&q.left<r.right&&q.right>r.left&&q.top<r.bottom&&q.bottom>r.top;})());return hit.map(e=>e.className);})(),"
        "portrait:(()=>{const a=document.querySelector('.jspecies')||document.querySelector('.jname'),c=document.querySelector('.jportrait canvas');if(!a||!c)return true;return c.getBoundingClientRect().top>=a.getBoundingClientRect().bottom-1;})()}}")


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    def check(ok, msg):
        if not ok:
            fails.append(msg)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(**p.devices["iPhone 13 landscape"])
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))

        async def page(save, then=""):
            await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
            await pg.evaluate("()=>{const s=fresh();" + BASE + save + "localStorage.setItem(KEY,JSON.stringify(s));}")
            await pg.reload(wait_until="load")
            await pg.click(".screen button")
            await pg.evaluate("()=>{__step(2);capClear();" + then + "openJournal();__step(.5);}")
            return await pg.evaluate(READ)

        # 1. the line gets closer as it grows, and the next silhouette fills row by row
        shots, last_rows = [], -1
        for name, stage, frac, want in [("teen_start", 6, 0, "in a few days"), ("kid_start", 4, 0, "tomorrow"),
                                        ("kid_third", 4, .35, "tomorrow"), ("kid_two_thirds", 4, .7, "in a while"),
                                        ("kid_almost", 4, .995, "any time now")]:
            r = await page(f"s.stage={stage};s.timer={frac}*GROW_FOR[{stage}];")
            check(r["line"] == f"Tuffet will be {'an adult' if stage == 6 else 'a teen'} {want}.", f"{name}: line '{r['line']}', expected '... {want}'")
            nxt = 3 if stage == 4 else 4
            check(r["rows"][:nxt] == [None] * nxt, f"{name}: past ages should be filled: {r['rows']}")
            check(r["rows"][nxt] == int(frac * r["of"][nxt]), f"{name}: next age should have {int(frac * r['of'][nxt])} of {r['of'][nxt]} rows filled, has {r['rows'][nxt]}")
            check(r["fit"], f"{name}: the left page overflows")
            check(r["portrait"], f"{name}: the portrait covers the species name")
            check(not r["clear"], f"{name}: today's line overlaps {r['clear']}")
            if stage == 4:
                check(r["rows"][3] > last_rows or frac == 0, f"{name}: the fill should grow: {last_rows} -> {r['rows'][3]}")
                last_rows = r["rows"][3]
                await pg.screenshot(path=os.path.join(OUT, f"{name}.png"))
                shots.append(name)
        r = await page("s.stage=1;s.timer=0;")
        check(r["line"] == "Tuffet will be a kid in a while.", f"sprout: '{r['line']}'")
        r = await page("s.stage=0;s.timer=GROW_FOR[0]-30;")
        check(r["line"] == "Tuffet will be a sprout any time now.", f"seed: '{r['line']}'")
        r = await page("s.stage=8;s.free={x:1250,y:918};s.name='Grimble Spoonmore';")
        check(r["portrait"] and r["fit"], f"adult with a long name: portrait over the name or the page overflows {r}")
        check(r["line"] == "Grimble is all grown up.", f"adult: '{r['line']}'")
        await pg.screenshot(path=os.path.join(OUT, "adult.png"))

        # 2. what's slowing it, kindly, the same reasons as the debug drawer
        for name, save, then, want in [
                ("thirsty", "s.stage=4;s.timer=0;s.needs.thirst=.9;", "", "Tuffet could use a drink."),
                ("lonely", "s.stage=4;s.timer=0;s.needs.attention=.9;", "", "Tuffet would love a little company."),
                ("too_dim", "s.stage=4;s.timer=0;s.pref='sun';s.curtain='closed';", "__step(15);", "Tuffet is waiting for the right light."),
                ("too_bright", "s.stage=4;s.timer=0;", "st.lightState='hi';", "Tuffet would like a little shade.")]:
            if name == "too_bright":  # a shade-lover right under a lamp in the bright hours: set the light state directly, no stepping
                r = await page(save)
                r["line"] = await pg.evaluate("()=>{st.lightState='hi';return {holds:growHolds(),line:growLine()};}")
                check(r["line"]["holds"] == ["too bright"] and r["line"]["line"] == want, f"{name}: {r['line']}")
                continue
            r = await page(save, then)
            holds = await pg.evaluate("()=>growHolds()")
            check(r["line"] == want, f"{name}: line '{r['line']}', expected '{want}' (debug says {holds})")
            await pg.screenshot(path=os.path.join(OUT, f"reason_{name}.png"))
        # asleep at night: nothing is slowing it, so it's the time line
        r = await page("s.stage=4;s.timer=0;s.night=true;")
        check(r["line"] == "Tuffet will be a teen tomorrow.", f"asleep: '{r['line']}'")

        # 3. today in words, top corner
        r = await page("s.stage=4;s.timer=0;")
        check(r["day"] == "Tuesday morning · autumn", f"day line: '{r['day']}'")
        for when, want in [((2026, 10, 10, 14, 0), "Tuesday afternoon · autumn"), ((2026, 10, 10, 19, 30), "Tuesday evening · autumn"),
                           ((2026, 10, 11, 2, 0), "Wednesday night · autumn"), ((2026, 11, 26, 9, 0), "Saturday morning · winter")]:
            got = await pg.evaluate("([y,mo,d,h,mi])=>{const at=new Date(y,mo,d,h,mi).getTime();Date.now=()=>at;return dayWords();}", list(when))
            check(got == want, f"day line at {when}: '{got}', expected '{want}'")

        # 4. no numbers anywhere in the new words
        for t in [r["line"], r["day"]]:
            check(not re.search(r"\d", t or ""), f"a number in '{t}'")
        check(not errs, f"page errors: {errs[:3]}")
        await b.close()

    from PIL import Image
    ims = [Image.open(os.path.join(OUT, n + ".png")) for n in shots + ["adult"]]
    w, h = ims[0].size
    sheet = Image.new("RGB", (w * 2, h * ((len(ims) + 1) // 2)), "white")
    for i, im in enumerate(ims):
        sheet.paste(im, ((i % 2) * w, (i // 2) * h))
    sheet.save(os.path.join(OUT, "sheet.png"))
    if fails:
        for f in fails:
            print("FAIL", f)
        sys.exit(1)
    print("PASS: the journal shows growing and today in words, no numbers (pictures in tests/screenshots/journal_growth/)")


if __name__ == "__main__":
    asyncio.run(main())
