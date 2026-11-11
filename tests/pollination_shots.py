"""Two adults can make a seed, and you choose where it goes.

Run from the repository root:  python3 tests/pollination_shots.py
Checks: two content adults may make a seed even though they fill the room (never a third monster on the spot); the bubble names
both with two choices; Send it to Sloth, PhD: the packet goes on the sill and Sloth's paw takes it, both parents stay, the hook is called; Keep it here: caption,
then next morning both move out ("Out living their own lives", each keepsake still knowing the other) and the seed is on the
windowsill with its own name and the hello caption; tapping away decides nothing and the bubble comes back; the offer survives
a reload; not with a kid or teen, or while something else is waiting; debug's Breed now follows the same flow on the test copy.
Pictures go to tests/screenshots/pollination/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "pollination")
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:1,day:9,dayT:.3,giftSeed:1,mode:'actions',curtain:'open',catTrust:.1,lamp:true,desk:true,"
        "name:'Zib Wobblebean',free:{x:560,y:918},nge:0,ge:0,nlc:0,lc:0,needs:{thirst:0,hunger:0,attention:0},"
        "others:[Object.assign(freshPlant(),{id:2,stage:8,species:7,name:'Mortie Gloomsnack',free:{x:1250,y:918},nge:0,ge:0,nlc:0,lc:0,needs:{thirst:0,hunger:0,attention:0}})],nextId:2});%s"
        "localStorage.setItem(KEY,JSON.stringify(s));}")
FEED = "for(const q of allRaw()){q.needs.thirst=0;q.needs.attention=0;q.lightState='ok';q.lightBad=0;q.nap=0;}"
# the go-ask is rolled off here so only breeding can raise a bubble
BLOOM = "()=>{Math.random=()=>0;goAsk=()=>{};for(let i=0;i<220;i++){" + FEED + "__step(.5,50);if(bubble)break;}return bubble?bubble.textContent:'';}"
WANT = "Zib and Mortie made a seed together!Send it to Sloth, PhDthe paw comes for itKeep it hereboth parents head off in the morning"  # with the line under each choice (Nov 10)


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
            await pg.evaluate("()=>{__step(10);capClear();CAP.log.length=0;}")

        # a seed on its own, room full of two adults: a bubble, no third monster
        await load()
        t = await pg.evaluate(BLOOM)
        check(t == WANT, f"the bubble: {t!r}")
        check(await pg.evaluate("()=>plantCount()===2&&allRaw().every(q=>q.stage===8)"), "a third monster appeared")
        check(await pg.evaluate("()=>st.seedOffer&&st.seedOffer.seed.stage===0&&!!st.seedOffer.seed.name&&st.seedOffer.seed.parents.join()==='1,2'"), "the seed isn't waiting with its name and parents")
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "1_choice.png"))

        # tapping away decides nothing; it comes back
        await pg.evaluate("()=>closeBubble()")
        check(await pg.evaluate("()=>!!st.seedOffer&&plantCount()===2"), "tapping away lost the seed")
        t = await pg.evaluate("()=>{__step(20);return bubble?bubble.textContent:'';}")
        check(t == WANT, f"the bubble didn't come back: {t!r}")

        # it waits in the save
        await pg.evaluate("()=>{closeBubble();__step(1);}")
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        t = await pg.evaluate("()=>{Math.random=()=>0;for(let i=0;i<60;i++){__step(.5,50);if(bubble)break;}return bubble?bubble.textContent:'';}")
        check(t == WANT, f"the offer didn't survive a reload: {t!r}")

        # Send it to Sloth, PhD
        await pg.evaluate("()=>{capClear();CAP.log.length=0;}")
        await pg.click(".bubble [data-k=s]")
        await pg.evaluate("()=>__step(4.6,50)")
        check(await pg.evaluate("()=>st.sillItem==='send'&&!!paw&&paw.kind==='take'"), "send: the packet should wait on the sill for Sloth's paw")
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "2_paw_comes_for_it.png"))
        await pg.evaluate("()=>{for(let i=0;i<60&&(paw||st.pawWait);i++)__step(.5,50);__step(1);}")
        r = await pg.evaluate("()=>({paw:!!paw,item:st.sillItem,off:!!st.seedOffer,sent:st.seedsSent,n:plantCount(),arch:st.archive.length,dest:allRaw().filter(q=>q.goDest).length,log:CAP.log.concat(CAP.q).map(l=>l.t)})")
        check(not r["paw"] and not r["item"] and not r["off"] and r["sent"] == 1 and r["n"] == 2 and r["arch"] == 0 and r["dest"] == 0, f"send: {r}")
        check("Off it goes to Sloth, PhD." in r["log"], f"send caption: {r['log']}")
        await pg.evaluate("()=>{st.night=true;wake();__step(1);}")
        check(await pg.evaluate("()=>plantCount()===2&&st.archive.length===0"), "sending it away should keep both parents")
        # and not again right away
        t = await pg.evaluate(BLOOM)
        check(t == "", f"asked again inside the 3 days: {t!r}")

        # Keep it here
        await load()
        t = await pg.evaluate(BLOOM)
        seed = await pg.evaluate("()=>st.seedOffer.seed.name")
        await pg.evaluate("()=>{capClear();CAP.log.length=0;}")
        await pg.click(".bubble [data-k=k]")
        await pg.evaluate("()=>__step(.5)")
        check(await pg.evaluate("()=>CAP.log.some(l=>l.t==='Zib and Mortie will head off in the morning to live their own lives.')"), "no heading-off caption")
        check(await pg.evaluate("()=>plantCount()===2&&allRaw().every(q=>q.goDest==='Out living their own lives')&&goWaiting()"), "they should still be here today")
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "3_keeping_it.png"))
        await pg.evaluate("()=>{st.curtain='closed';st.night=true;wake();for(let i=0;i<40&&!CAP.log.some(l=>l.t.startsWith('Hello,'));i++)__step(1);}")
        r = await pg.evaluate("()=>({n:plantCount(),stage:st.stage,name:st.name,spot:spotKey(),curtain:st.curtain,arch:st.archive.map(e=>[e.name,e.dest,e.pals.map(p=>p.name)]),keep:st.seedKeep,tags:[...document.querySelectorAll('#nameTags button')].map(b=>b.textContent)})")
        check(r["n"] == 1 and r["stage"] == 0 and r["name"] == seed and r["spot"] == "sill" and r["curtain"] == "open" and not r["keep"], f"the seed in the morning: {r}")
        check([x[0] for x in r["arch"]] == ["Zib Wobblebean", "Mortie Gloomsnack"] and all(x[1] == "Out living their own lives" for x in r["arch"]), f"the parents: {r['arch']}")
        check(r["arch"][0][2] == ["Mortie Gloomsnack"] and r["arch"][1][2] == ["Zib Wobblebean"], f"each keepsake should know the other: {r['arch']}")
        check(await pg.evaluate(f"()=>CAP.log.some(l=>l.t==='Hello, {seed}! Your little seed is on the window sill growing, or move it to the desk and turn on the lamp.')"), "no hello caption")
        await pg.evaluate("()=>{__step(3);}")
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "4_seed_next_morning.png"))
        check(await pg.evaluate("()=>!document.querySelector('.screen')"), "the start screen came up even though a seed is here")
        await pg.evaluate("()=>__step(12)")
        check(await pg.evaluate("()=>!document.querySelector('.screen')"), "the empty-room start screen came up anyway")

        # who doesn't: a kid or teen in the pair, or something waiting
        for label, extra in [("a teen", "s.others[0].stage=6;"), ("a kid", "s.others[0].stage=4;"), ("a recent ask", "s.goNext=11;"), ("already today", "s.breedDay=9;")]:
            await load(extra)
            t = await pg.evaluate(BLOOM)
            check(t == "", f"{label}: made a seed anyway ({t!r})")

        # the odds: a miss waits for tomorrow
        await load()
        t = await pg.evaluate("()=>{Math.random=()=>.99;goAsk=()=>{};for(let i=0;i<220;i++){" + FEED + "__step(.5,50);}return [bubble?bubble.textContent:'',st.breedDay===st.day,!!st.seedOffer];}")
        check(t[0] == "" and t[1] and not t[2], f"one roll a day: {t}")

        # debug: same flow, on the test copy
        await load()
        await pg.click("#dbgBtn")
        await pg.evaluate("()=>{__step(.5);[...dbg.querySelectorAll('button')].find(b=>b.textContent==='Breed now').click();capClear();for(let i=0;i<20&&!bubble;i++){__step(.5);capClear();}}")
        t = await pg.evaluate("()=>TESTING&&bubble?bubble.textContent:''")
        check(t == WANT, f"debug's Breed now: {t!r}")
        check(await pg.evaluate("()=>!JSON.parse(localStorage.getItem(KEY)).seedOffer"), "debug's seed reached the real save")
        fails += errs
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS pollination_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
