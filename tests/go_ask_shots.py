"""An adult can ask to move out.

Run from the repository root:  python3 tests/go_ask_shots.py
Checks: the ask appears by itself on a calm day (bubble names the monster, reason fits its nature, Yes / Not yet); Not yet has no
penalty and it asks again in 3 days; Yes means gone the next morning via moveOut with that destination; never a kid or teen,
never a monster that's unhappy, never while a note, seed or another ask is waiting; at most one roll a day; a last monster
leaving doesn't leave a dead end; debug's Ask to go now stays on the test copy.
Pictures go to tests/screenshots/go_ask/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "go_ask")
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:1,day:9,dayT:.3,giftSeed:1,mode:'actions',curtain:'open',catTrust:.1,lamp:true,desk:true,"
        "name:'Zib Wobblebean',free:{x:560,y:918},nge:0,ge:0,nlc:-.6,lc:-.6,needs:{thirst:0,hunger:0,attention:0},"
        "others:[Object.assign(freshPlant(),{id:2,stage:8,species:7,name:'Mortie Gloomsnack',free:{x:1250,y:918},nge:-.6,ge:-.6,nlc:0,lc:0,needs:{thirst:0,hunger:0,attention:0}})],nextId:2});%s"
        "localStorage.setItem(KEY,JSON.stringify(s));}")
FEED = "for(const q of allRaw()){q.needs.thirst=0;q.needs.attention=0;q.lightState='ok';q.lightBad=0;}"
CALM = "()=>{Math.random=()=>0;for(let i=0;i<120;i++){" + FEED + "__step(.5,50);if(bubble)break;}return bubble?bubble.textContent:'';}"


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    check = lambda ok, msg: ok or fails.append(msg)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1440, "height": 812}, device_scale_factor=2)
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))

        async def load(extra=""):
            await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
            await pg.evaluate(SAVE % extra)
            await pg.reload(wait_until="load")
            await pg.click(".screen button")
            await pg.evaluate("()=>{breedTick=()=>{};__step(10);capClear();CAP.log.length=0;for(const q of allRaw())q.nap=0;}")  # breeding has its own test

        await load()
        # the first ask comes by itself; every monster here is adult and content. Random 0 picks the first of each list
        t = await pg.evaluate(CALM)
        check(" May " in t, f"no ask: {t!r}")
        name = t.split(" ")[0]
        check(name in ("Zib", "Mortie"), f"the ask should name the monster: {t!r}")
        check(f"May {name} go?" in t and "Yes" in t and "Not yet" in t, f"ask: {t!r}")
        check(not any(w in f" {t.lower()} " for w in (" he ", " she ", " his ", " her ", " him ")), f"genders: {t!r}")
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "1_asks.png"))
        fit = await pg.evaluate("()=>{const r=bubble.getBoundingClientRect(),c=cv.getBoundingClientRect();return r.left>=c.left&&r.right<=c.right&&r.top>=c.top&&r.bottom<=c.bottom;}")
        check(fit, "the bubble leaves the room")

        # Not yet: caption, no penalty, not again today, asks again in 3 days
        before = await pg.evaluate(f"()=>{{const q=allRaw().find(x=>x.name.startsWith('{name}'));return {{ge:q.ge,lc:q.lc,th:q.needs.thirst,at:q.needs.attention}};}}")
        await pg.click(".bubble [data-k=n]")
        await pg.evaluate("()=>__step(.3)")
        after = await pg.evaluate(f"()=>{{const q=allRaw().find(x=>x.name.startsWith('{name}'));return {{ge:q.ge,lc:q.lc,th:q.needs.thirst,at:q.needs.attention,again:q.goAgain,day:st.day,dest:q.goDest||''}};}}")
        check(await pg.evaluate(f"()=>CAP.log.some(l=>l.t==='{name} snuggles back in.')"), "no snuggle caption")
        check(after["again"] == after["day"] + 3 and not after["dest"], f"not yet: {after}")
        check(all(abs(before[k] - after[k]) < .02 for k in before), f"not yet changed something: {before} -> {after}")
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "2_not_yet.png"))
        for _ in range(2):
            t = await pg.evaluate(CALM)
            check(t == "", f"asked again too soon: {t!r}")
            await pg.evaluate("()=>{st.night=true;wake();__step(1);capClear();}")
        t = await pg.evaluate("()=>{st.night=true;wake();__step(1);capClear();return st.day;}")
        t = await pg.evaluate(CALM)
        check(t.startswith(name + " "), f"should ask again on the third day: {t!r}")

        # Yes: set off in the morning, gone the next morning with that destination
        await pg.click(".bubble [data-k=y]")
        await pg.evaluate("()=>__step(.3)")
        check(await pg.evaluate(f"()=>CAP.log.some(l=>l.t==='{name} will set off in the morning.')"), "no setting-off caption")
        dest = await pg.evaluate(f"()=>allRaw().find(x=>x.name.startsWith('{name}')).goDest")
        check(bool(dest) and await pg.evaluate("()=>plantCount()===2"), f"should still be here today: {dest}")
        check(await pg.evaluate("()=>goWaiting()"), "another ask could land while one is waiting")
        await pg.evaluate("()=>{st.night=true;wake();__step(8);}")
        r = await pg.evaluate("()=>({n:plantCount(),a:st.archive.map(e=>[e.name,e.dest,e.snap.goDest||''])})")
        check(r["n"] == 1 and len(r["a"]) == 1 and r["a"][0][0].startswith(name) and r["a"][0][1] == dest and r["a"][0][2] == "", f"next morning: {r}")
        check(await pg.evaluate(f"()=>CAP.log.some(l=>l.t.startsWith('{name}')&&l.t.endsWith('journal is tucked safely in the desk.'))"), "no moving-out caption")
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "3_gone_next_morning.png"))

        # who never asks, and when nobody asks
        cases = [("a kid", "s.stage=4;s.others=[];"), ("a teen", "s.stage=6;s.others=[];"), ("a brand-new adult", "s.adultDay=9;s.others=[];"),
                 ("a note waiting", "s.others=[];delete s.giftSeed;s.slothJournal=1;"), ("a note on the sill", "s.others=[];delete s.giftSeed;s.slothNote='sill';"), ("a seed on its way", "s.others=[];delete s.giftSeed;s.slothSend=10;"),
                 ("asked in the last 3 days", "s.goNext=11;")]
        for label, extra in cases:
            await load(extra)
            t = await pg.evaluate(CALM)
            check(t == "", f"{label}: asked anyway ({t!r})")
        # unhappy: thirsty adults don't ask
        await load("s.others=[];")
        t = await pg.evaluate("()=>{Math.random=()=>0;for(let i=0;i<120;i++){st.needs.thirst=.9;__step(.5,50);if(bubble)break;}return bubble?bubble.textContent:'';}")
        check(t == "", f"a thirsty adult asked: {t!r}")
        # the odds: one roll a day, and a miss waits for tomorrow
        await load("s.others=[];")
        t = await pg.evaluate("()=>{Math.random=()=>.99;for(let i=0;i<120;i++){" + FEED + "__step(.5,50);}Math.random=()=>0;for(let i=0;i<120;i++){" + FEED + "__step(.5,50);}return [bubble?bubble.textContent:'',st.goRolled===st.day];}")
        check(t[0] == "" and t[1], f"one roll a day: {t}")

        # the last monster leaving: an empty room, then the way to plant a new seed; the archive stays
        await load("s.others=[];")
        await pg.evaluate("()=>{goAsk(1);document.querySelector('.bubble [data-k=y]').click();st.night=true;wake();__step(2);}")
        check(await pg.evaluate("()=>plantCount()===0&&st.archive.length===1&&!document.querySelector('.screen')"), "the last monster didn't leave")
        await pg.evaluate("()=>__step(9)")
        check(await pg.evaluate("()=>!!document.querySelector('.screen')&&document.querySelector('.screen').textContent.includes('Begin')"), "an empty room is a dead end")
        await pg.click(".screen button")
        for _ in range(4):
            await pg.evaluate("()=>__step(.3)")
            await pg.click(".screen button")
        await pg.evaluate("()=>__step(1)")
        check(await pg.evaluate("()=>plantCount()===1&&st.stage===0&&st.archive.length===1&&!!st.name&&st.id!==1"), "the new seed after an empty room")

        # debug: on the test copy only
        await load("s.others=[];")
        await pg.click("#dbgBtn")
        await pg.evaluate("()=>{__step(.5);[...dbg.querySelectorAll('button')].find(b=>b.textContent==='Ask to go now').click();__step(.5);}")
        check(await pg.evaluate("()=>TESTING&&!!bubble&&/May Zib go/.test(bubble.textContent)"), "debug's Ask to go now")
        await pg.evaluate("()=>{document.querySelector('.bubble [data-k=y]').click();__step(1);}")
        check(await pg.evaluate("()=>!JSON.parse(localStorage.getItem(KEY)).goDest"), "debug's ask reached the real save")
        fails += errs
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS go_ask_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
