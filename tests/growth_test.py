"""Growing up on Tamagotchi time: monsters grow on the real clock, not at Good morning.

Run from the repository root:  python3 tests/growth_test.py
Normal speed throughout (1 s of play = 1 s of growing when cared for). Checks:
  - a cared-for kid at the end of its day grows into a teen right there, with a caption;
  - a thirsty kid still grows, at half speed (missing care never stops it, never hurts it);
  - saying goodnight and Good morning doesn't age anyone by itself;
  - coming back after 3 hours away: half speed, at most one age, and welcome back says so;
  - a very long time away (5 days) still only grows one age;
  - a tab left in the background for 2 hours counts like being away.
Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, VIRTUAL_TIME, serve

KID = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:4,species:6,id:1,day:3,dayT:.3,giftSeed:1,mode:'actions',curtain:'open',"
       "place:{baby:'books'},catTrust:.1,timer:0,name:'Tuffet Mossmuffin',needs:{thirst:0,hunger:0,attention:0}});"
       "for(const p of ['shade','night','sun']){s.pref=p;st=s;if(lightFeel(spotInfo('books'),p)==='ok')break;}%s localStorage.setItem(KEY,JSON.stringify(s));}")


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

        async def load(extra=""):
            await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
            await pg.evaluate(KID % extra)
            await pg.reload(wait_until="load")
            await pg.click(".screen button")
            await pg.evaluate("()=>{__step(1);}")

        # 1. cared for: grows into a teen right on time, with a caption
        await load()
        await pg.evaluate("()=>{capClear();CAP.log.length=0;st.timer=GROW_FOR[4]-1;st.needs.thirst=0;st.needs.attention=0;__step(1.5);}")
        r = await pg.evaluate("()=>({stage:st.stage,night:st.night,log:CAP.log.map(l=>l.t)})")
        check(r["stage"] == 6, f"a cared-for kid at the end of its day didn't grow: {r}")
        check(any("is a teen now" in t for t in r["log"]), f"no teen caption: {r['log']}")

        # 2. thirsty: half speed, never stopped
        await pg.evaluate("()=>{st.stage=4;st.timer=GROW_FOR[4]-1;st.needs.thirst=.9;__step(1.5);}")
        r1 = await pg.evaluate("()=>st.stage")
        await pg.evaluate("()=>__step(1)")
        r2 = await pg.evaluate("()=>st.stage")
        check(r1 == 4 and r2 == 6, f"thirsty kid should grow at half speed: after 1.5 s stage {r1}, after 2.5 s stage {r2}")

        # 3. Good morning doesn't age anyone by itself
        await pg.evaluate("()=>{st.stage=4;st.timer=0;st.needs.thirst=0;st.met={thirst:1,attention:1,light:1};st.night=true;wake();__step(1);}")
        r = await pg.evaluate("()=>({stage:st.stage,timer:st.timer})")
        check(r["stage"] == 4, f"Good morning aged the kid: {r}")

        # 4. away 3 hours, kid nearly a teen: grows once, welcome back says so
        await load("s.timer=GROW_FOR[4]-100;s.lastSeen=Date.now()-3*3600e3;")
        await pg.evaluate("()=>__step(20)")  # the hello, then each thing that happened, one caption after another
        r = await pg.evaluate("()=>({stage:st.stage,timer:st.timer,log:CAP.log.map(l=>l.t)})")
        check(r["stage"] == 6 and r["timer"] < 60, f"3 hours away didn't grow the kid exactly one age: {r}")
        check(any(t.startswith("While you were away: ") and "grew into a teen!" in t for t in r["log"]), f"welcome back didn't say it grew: {r['log']}")

        # 5. away 5 days, a kid at the start of its day: one age only (teen), not an adult
        await load("s.timer=0;s.lastSeen=Date.now()-5*86400e3;")
        r = await pg.evaluate("()=>({stage:st.stage,timer:st.timer})")
        check(r["stage"] == 6 and r["timer"] < 60, f"5 days away should grow exactly one age: {r}")
        # half speed: 3 hours away on a fresh kid adds 1.5 hours of growing
        await load("s.timer=0;s.lastSeen=Date.now()-3*3600e3;")
        r = await pg.evaluate("()=>({stage:st.stage,timer:st.timer})")
        check(r["stage"] == 4 and abs(r["timer"] - 5400) < 30, f"3 hours away should add 1.5 hours of growing: {r}")

        # 6. a background tab for 2 hours counts like being away
        await pg.evaluate("()=>{CAP.log.length=0;st.stage=1;st.timer=GROW_FOR[1]-60;lastWall=Date.now()-2*3600e3;__step(25);}")
        r = await pg.evaluate("()=>({stage:st.stage,log:CAP.log.map(l=>l.t)})")
        check(r["stage"] == 4, f"a background tab for 2 hours didn't count: {r}")
        check(any("Tuffet opened its eyes!" in t for t in r["log"]), f"no caption after the background tab: {r['log']}")

        fails += [f"page error: {e}" for e in errs]
        await b.close()
    for f in fails:
        print("FAIL", f)
    if fails:
        sys.exit(1)
    print("PASS: growing on the clock, half speed when care is missing or away, one age per absence")


if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    asyncio.run(main())
