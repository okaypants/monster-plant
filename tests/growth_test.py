"""Growing up: a plant kept in its right light all day gets credit for it, and any tap at night offers Good morning.

Run from the repository root:  python tests/growth_test.py
A kid sits in light it likes all day (no fixing needed), gets watered and petted, then you say goodnight in the journal
and tap an empty bit of the room: Good morning comes up, and in the morning it's a teen. Then a day where it only gets
light and water (no company): two nights of that also grow it one age. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, VIRTUAL_TIME, serve

SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:4,species:6,id:1,day:3,dayT:.3,giftSeed:1,mode:'actions',curtain:'open',"
        "place:{baby:'books'},catTrust:.1,credit:0,needs:{thirst:0,hunger:0,attention:0}});"
        "for(const p of ['shade','night','sun']){s.pref=p;st=s;if(lightFeel(spotInfo('books'),p)==='ok')break;}localStorage.setItem(KEY,JSON.stringify(s));}")


async def main():
    serve()
    fails = []
    def check(ok, msg):
        if not ok:
            fails.append(msg)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1670, "height": 942})
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate(SAVE)
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        await pg.evaluate("()=>{__step(4);capClear();}")

        async def tap(x, y):
            c = await pg.evaluate(f"()=>{{const r=cv.getBoundingClientRect();return [r.left+{x}*S,r.top+{y}*S];}}")
            await pg.mouse.click(*c)
            await pg.evaluate("()=>__step(.2)")

        async def night_and_morning(label):
            await pg.evaluate("()=>openJournal()")
            await pg.locator(".screen button", has_text="Say goodnight").click()
            await pg.evaluate("()=>__step(.1)")
            await pg.evaluate("()=>__step(3)")  # the 2.5 s dusk
            check(await pg.evaluate("()=>st.night"), f"{label}: not night after Say goodnight")
            await tap(1050, 870)  # an empty bit of rug: not the plant, the chair, a lamp or the curtains
            if await pg.locator(".bubble button", has_text="Good morning").count() != 1:
                fails.append(f"{label}: tapping the rug at night didn't offer Good morning"); return
            await pg.locator(".bubble button", has_text="Good morning").click()
            await pg.evaluate("()=>__step(1)")

        # day 1: everything covered; the light was right all along
        print("likes:", await pg.evaluate("()=>st.pref"), "light ok on the books:", await pg.evaluate("()=>lightFeel(spotInfo('books'),st.pref)==='ok'"))
        await pg.evaluate("()=>__step(20)")  # 20 s at normal speed in its right light
        check(await pg.evaluate("()=>!!st.met.light"), "a whole while in its right light didn't count as the right light")
        await pg.evaluate("()=>{st.needs.thirst=.8;held.tool='can';useTool();st.needs.attention=.8;pet();__step(.5);}")
        m = await pg.evaluate("()=>st.met")
        check(m.get("thirst") and m.get("attention") and m.get("light"), f"not all three needs covered: {m}")
        await night_and_morning("night 1")
        r = await pg.evaluate("()=>({stage:st.stage,day:st.day,credit:st.credit})")
        check(r["stage"] == 6 and r["day"] == 4, f"a fully cared-for kid didn't grow overnight: {r}")

        # light and water only (no company): 0.77 a night, so two nights make an age
        for n in (2, 3):
            await pg.evaluate("()=>{__step(20);st.needs.thirst=.8;held.tool='can';useTool();__step(.5);}")
            m = await pg.evaluate("()=>st.met")
            check(m.get("thirst") and m.get("light") and not m.get("attention"), f"day {n}: {m}")
            await night_and_morning(f"night {n}")
        r = await pg.evaluate("()=>({stage:st.stage,credit:st.credit})")
        check(r["stage"] == 8, f"two nights of light and water didn't grow the teen: {r}")
        fails += [f"page error: {e}" for e in errs]
        await b.close()
    for f in fails:
        print("FAIL", f)
    if fails:
        sys.exit(1)
    print("PASS: right light all day counts; any tap at night offers Good morning; plants grow")


if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    asyncio.run(main())
