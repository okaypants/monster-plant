"""The real clock: the time of day is the device's own local time, and growing keeps going in real time.

Run from the repository root:  python3 tests/clock_test.py
Checks:
  - day -> golden hour -> dusk -> night at real clock times (November and June), and the room pictures that go with them;
  - the clock keeps moving while the game is open (midday turns into golden hour without a reload);
  - a real sunrise brings the morning by itself: one new day, even after three days away;
  - golden hour and night never slow growing or wither anyone; a dim spot in the bright hours still does;
  - coming back after six hours: growing caught up gently (half speed, one age at most);
  - the debug drawer (test mode) shows the clock, the season, each monster's age and what's slowing it.
Screenshots of each changeover go to tests/screenshots/clock/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, VIRTUAL_TIME, serve, ROOT

SHOTS = os.path.join(ROOT, "tests", "screenshots", "clock")
# a sun-loving kid on the book stack (far from the window's sun patch, lamps off): dim for a sun-lover in the daytime
KID = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:4,species:6,id:1,day:3,giftSeed:1,curtain:'open',lamp:false,desk:false,"
       "place:{baby:'books'},catTrust:.1,timer:0,pref:'sun',name:'Tuffet Mossmuffin',needs:{thirst:0,hunger:0,attention:0}});%s"
       "localStorage.setItem(KEY,JSON.stringify(s));}")
# sets the device clock to a local time; it keeps running with the game's virtual time from there
AT = "([y,mo,d,h,mi])=>{const at=new Date(y,mo,d,h,mi).getTime(),t0=performance.now();Date.now=()=>at+(performance.now()-t0);}"


async def main():
    serve()
    os.makedirs(SHOTS, exist_ok=True)
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

        async def load(extra="", when=(2026, 10, 10, 12, 0)):
            await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
            await pg.evaluate(AT, list(when))
            await pg.evaluate(KID % extra)
            await pg.reload(wait_until="load")
            await pg.evaluate(AT, list(when))
            await pg.evaluate("()=>{lastWall=Date.now();}")  # setting the clock here isn't time away
            await pg.click(".screen button")
            await pg.evaluate("()=>{capClear();__step(1);}")

        async def now():
            return await pg.evaluate("()=>({phase:phase(st.dayT),room:timeKey(),day:st.day,night:st.night})")

        # 1. the changeover at real clock times (November: sunset 4:42 pm; June: sunset 9:06 pm)
        await load()
        times = [((2026, 10, 10, 8, 0), "morning", "day"), ((2026, 10, 10, 12, 0), "midday", "day"),
                 ((2026, 10, 10, 15, 45), "golden hour", "golden"), ((2026, 10, 10, 17, 0), "dusk", "golden"),
                 ((2026, 10, 10, 20, 0), "night", "night"), ((2026, 10, 11, 3, 0), "night", "night"),
                 ((2026, 5, 20, 20, 0), "golden hour", "golden"), ((2026, 5, 20, 22, 30), "night", "night"),
                 ((2026, 5, 20, 14, 0), "midday", "day")]
        for when, ph, room in times:
            await pg.evaluate(AT, list(when))
            await pg.evaluate("()=>{st.lastMorning=lastRise();__step(.2);}")  # just the time, no new morning here
            r = await now()
            label = f"{when[1]+1}-{when[2]} {when[3]:02d}:{when[4]:02d}"
            check(r["phase"] == ph and r["room"] == room, f"{label}: expected {ph}/{room}, got {r}")
            await pg.screenshot(path=os.path.join(SHOTS, f"{label.replace(':', '')}_{ph.replace(' ', '_')}.png"))

        # 2. the clock moves while the game is open: 3 pm -> 3:30 pm is midday -> golden hour, no reload
        await pg.evaluate(AT, [2026, 10, 10, 15, 0])
        await pg.evaluate("()=>{st.lastMorning=lastRise();__step(.2);}")
        a = await now()
        await pg.evaluate("()=>__step(30*60,1000)")
        c = await now()
        check(a["phase"] == "midday" and c["phase"] == "golden hour", f"the clock didn't move while open: {a['phase']} -> {c['phase']}")

        # 3. a real sunrise brings the morning by itself, once
        await load(when=(2026, 10, 10, 23, 0))
        d0 = await pg.evaluate("()=>st.day")
        await pg.evaluate("()=>__step(9*3600,1000)")  # 11 pm -> 8 am: sunrise 7:06 am passes
        r = await now()
        check(r["day"] == d0 + 1 and r["phase"] == "morning", f"no morning at sunrise: day {d0} -> {r}")
        await pg.evaluate("()=>__step(3600,1000)")
        check(await pg.evaluate("()=>st.day") == d0 + 1, "a second morning came the same day")
        # asleep (Goodnight) at night: the room is dark, and the sunrise wakes everyone
        await load(when=(2026, 10, 10, 22, 0))
        await pg.evaluate("()=>{st.night=true;__step(1);}")
        dark = await now()
        await pg.evaluate("()=>__step(10*3600,1000)")
        r = await now()
        check(dark["room"] == "night" and not r["night"] and r["day"] == dark["day"] + 1, f"Goodnight -> sunrise: {dark} -> {r}")
        # three days away: one new day, not three
        await load(when=(2026, 10, 10, 12, 0))
        d0 = await pg.evaluate("()=>st.day")
        await pg.evaluate(AT, [2026, 10, 13, 12, 0])
        await pg.evaluate("()=>__step(1)")
        check(await pg.evaluate("()=>st.day") == d0 + 1, "three days away should be one new day")

        # 4. golden hour and night never slow growing; a dim spot in the bright hours does
        for when, label in [((2026, 10, 10, 16, 0), "golden hour"), ((2026, 10, 10, 21, 0), "night")]:
            await load(when=when)
            await pg.evaluate("()=>__step(60)")
            r = await pg.evaluate("()=>({holds:growHolds(),light:st.lightState,wither:st.witherLv||0,happy:growHappy()})")
            check(r["happy"] and r["light"] == "ok" and r["wither"] == 0, f"{label}: light slowed or withered the kid: {r}")
            t0 = await pg.evaluate("()=>{st.timer=0;st.needs.thirst=0;st.needs.attention=0;__step(10);return st.timer;}")
            check(abs(t0 - 10) < .5, f"{label}: should grow at full speed, grew {t0:.2f} s in 10 s")
        await load("s.curtain='closed';", when=(2026, 10, 10, 12, 0))
        await pg.evaluate("()=>__step(60)")
        r = await pg.evaluate("()=>({holds:growHolds(),light:st.lightState})")
        check("too dim" in r["holds"], f"midday on the book stack, curtains closed: a sun-lover should be in too little light: {r}")

        # 5. six hours away: half speed, one age at most
        await load("s.lastSeen=new Date(2026,10,10,6,0).getTime();", when=(2026, 10, 10, 12, 0))
        r = await pg.evaluate("()=>({stage:st.stage,timer:st.timer})")
        check(r["stage"] == 4 and abs(r["timer"] - 3 * 3600) < 120, f"six hours away should grow three hours' worth: {r}")
        await load("s.timer=GROW_FOR[4]-60;s.lastSeen=new Date(2026,10,5,12,0).getTime();", when=(2026, 10, 10, 12, 0))
        r = await pg.evaluate("()=>({stage:st.stage,timer:st.timer})")
        check(r["stage"] == 6 and r["timer"] < 60, f"five days away: one age, no more: {r}")

        # 6. the debug drawer shows the clock, season, ages and what's slowing growth (test mode only)
        await load("s.needs.thirst=.9;", when=(2026, 10, 10, 12, 0))
        await pg.click("#dbgBtn")
        await pg.evaluate("()=>{__step(2);dbgSync();}")
        txt = await pg.evaluate("()=>document.getElementById('dStatus').textContent")
        for want in ["12:", "phone clock", "midday", "autumn", "Tuffet", "kid", "half speed", "thirst"]:
            check(want in txt, f"debug status is missing '{want}': {txt}")
        await pg.screenshot(path=os.path.join(SHOTS, "debug_status.png"))
        await pg.click("#dbg button.big")  # Back to my game
        await pg.evaluate("()=>__step(1)")
        check(await pg.evaluate("()=>JSON.parse(localStorage.getItem(KEY)).timer") is not None, "real save gone after test mode")
        check(not await pg.evaluate("()=>TESTING"), "still in test mode")

        check(not errs, f"page errors: {errs[:3]}")
        await b.close()
    if fails:
        for f in fails:
            print("FAIL", f)
        sys.exit(1)
    print("PASS: the time of day follows the real clock; growing keeps going (screenshots in tests/screenshots/clock/)")


if __name__ == "__main__":
    asyncio.run(main())
