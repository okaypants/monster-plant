"""A letter from Sloth, PhD asking to have an adult come stay.

Run from the repository root:  python3 tests/letter_shots.py
Checks: the note lands on the sill by itself, a little more often for an evil lean; never a kid or teen, never while something else
is waiting; tapping it opens the letter (names the monster, stamp portrait, Yes / Not yet); Yes means gone the next morning to
"Staying with Sloth, PhD"; Not yet puts it in the journal, where it can be accepted anytime, and it lands again in 3 days; no penalty;
it survives a reload; other asks wait for it; iPhone fit; debug's button stays on the test copy.
Pictures go to tests/screenshots/letter/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "letter")
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:1,day:9,dayT:.3,giftSeed:1,mode:'actions',curtain:'open',catTrust:.1,lamp:true,desk:true,"
        "name:'Zib Wobblebean',free:{x:900,y:918},nge:0,ge:0,nlc:0,lc:0,needs:{thirst:0,hunger:0,attention:0},others:[],nextId:2});%s"
        "localStorage.setItem(KEY,JSON.stringify(s));}")
ROLL = "()=>{Math.random=()=>%s;for(let i=0;i<120;i++){for(const q of allRaw()){q.needs.thirst=0;q.needs.attention=0;}__step(.5,50);if(letterOnSill())break;}return letterOnSill();}"


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

        async def load(extra="", reset=True):
            await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
            if reset:
                await pg.evaluate(SAVE % extra)
                await pg.reload(wait_until="load")
            await pg.click(".screen button")
            await pg.evaluate("()=>{goTick=()=>{};breedTick=()=>{};__step(10);capClear();CAP.log.length=0;for(const q of allRaw())q.nap=0;}")

        async def tap_note():
            c = await pg.evaluate("()=>{const n=slothNoteBox(),r=cv.getBoundingClientRect();return [r.left+(n.x+n.w/2)*S,r.top+(n.y+n.h/2)*S];}")
            await pg.mouse.click(*c)
            await pg.evaluate("()=>__step(.2)")

        # lands by itself
        await load()
        check(await pg.evaluate(ROLL % "0"), "the note didn't land")
        check(await pg.evaluate("()=>st.letterFor===1&&st.goNext===12"), "the letter should be for Zib and count as an ask")
        await pg.evaluate("()=>__step(2)")
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "1_note_on_sill.png"))

        # the letter
        await tap_note()
        r = await pg.evaluate("()=>({t:document.querySelector('.jltext').textContent,s:document.querySelector('.jlsign').textContent,c:document.querySelector('.jlstamp img,.jlstamp canvas').getBoundingClientRect().width,y:!!document.querySelector('.jletter [data-k=y]'),n:!!document.querySelector('.jletter [data-k=n]'),bug:document.querySelector('.jletter').textContent.includes('Doctor')})")
        check(r["t"] == "Dear friend, I would love to have Zib come stay with me for a while. May Zib come?" and r["s"] == "Sloth, PhD" and r["c"] > 20 and r["y"] and r["n"] and not r["bug"], f"letter: {r}")
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "2_letter.png"))

        # tapping away leaves it on the sill
        await pg.mouse.click(4, 400)
        check(await pg.evaluate("()=>!letterEl&&letterOnSill()"), "tapping away should leave the note on the sill")

        # Not yet: into the journal, no penalty, other asks wait
        before = await pg.evaluate("()=>JSON.stringify([st.ge,st.lc,st.needs.thirst>.6])")
        await tap_note()
        await pg.click(".jletter [data-k=n]")
        r = await pg.evaluate("()=>({sill:letterOnSill(),j:letterInJournal(),again:st.letterAgain,day:st.day,wait:goWaiting()})")
        check(not r["sill"] and r["j"] and r["again"] == r["day"] + 3 and r["wait"], f"not yet: {r}")
        check(before == await pg.evaluate("()=>JSON.stringify([st.ge,st.lc,st.needs.thirst>.6])"), "not yet changed something")
        await pg.evaluate("()=>{openJournal();__step(.3);}")
        check(await pg.evaluate("()=>!!document.querySelector('.jletternote')"), "the letter isn't tucked in the journal")
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "3_waiting_in_journal.png"))
        # from the journal, Not yet just leaves it there
        await pg.evaluate("()=>{document.querySelector('.jletternote').click();document.querySelector('.jletter [data-k=n]').click();}")
        check(await pg.evaluate("()=>letterInJournal()&&st.letterAgain===12&&!letterEl&&!!document.querySelector('.jbook')"), "not yet from the journal")
        await pg.evaluate("()=>closeJournal()")

        # survives a reload, and doesn't land again before 3 days
        await pg.evaluate("()=>__step(1)")
        await load(reset=False)
        check(await pg.evaluate("()=>letterInJournal()"), "the letter didn't survive a reload")
        for _ in range(2):
            check(not await pg.evaluate(ROLL % "0"), "landed again too soon")
            await pg.evaluate("()=>{st.night=true;wake();__step(1);capClear();}")
        await pg.evaluate("()=>{st.night=true;wake();__step(1);capClear();}")
        check(await pg.evaluate("()=>st.day===12") and await pg.evaluate(ROLL % ".99"), "it should land again on the third day, no roll needed")

        # accepted from the journal: set off in the morning
        await pg.evaluate("()=>{capClear();CAP.log.length=0;closeBubble();st.letterNote=null;openJournal();__step(.3);document.querySelector('.jletternote').click();}")
        await pg.click(".jletter [data-k=y]")
        await pg.evaluate("()=>__step(.3)")
        r = await pg.evaluate("()=>({dest:st.goDest,j:letterWaiting(),note:!!document.querySelector('.jletternote'),log:CAP.log.map(l=>l.t)})")
        check(r["dest"] == "Staying with Sloth, PhD" and not r["j"] and not r["note"] and "Zib will set off in the morning." in r["log"], f"yes from the journal: {r}")
        await pg.evaluate("()=>closeJournal()")

        # Yes from the sill, with a second monster so somebody stays
        await load("s.others=[Object.assign(freshPlant(),{id:2,stage:8,species:7,name:'Mortie Gloomsnack',free:{x:1380,y:918},nge:-.6,ge:-.6,nlc:0,lc:0,needs:{thirst:0,hunger:0,attention:0}})];")
        await pg.evaluate("()=>{letterLand(2);__step(2);}")
        await tap_note()
        check(await pg.evaluate("()=>/have Mortie come stay/.test(document.querySelector('.jltext').textContent)"), "the letter should name Mortie")
        await pg.click(".jletter [data-k=y]")
        await pg.evaluate("()=>{st.night=true;wake();__step(8);}")
        r = await pg.evaluate("()=>({n:plantCount(),a:st.archive.map(e=>[e.name,e.dest]),left:allRaw().map(q=>q.name)})")
        check(r["n"] == 1 and r["a"] == [["Mortie Gloomsnack", "Staying with Sloth, PhD"]] and r["left"] == ["Zib Wobblebean"], f"next morning: {r}")
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "4_gone_next_morning.png"))

        # rarer unless evil: a roll of .15 misses an easygoing adult and hits an evil one
        await load()
        check(not await pg.evaluate(ROLL % ".15"), "an easygoing adult shouldn't get this roll")
        check(await pg.evaluate("()=>st.letterRolled===st.day"), "one roll a day")
        await load("s.ge=s.nge=-.6;")
        check(await pg.evaluate(ROLL % ".15"), "an evil lean should get this roll")

        # who never gets one, and when none lands
        for label, extra in [("a kid", "s.stage=4;"), ("a teen", "s.stage=6;"), ("a new adult", "s.adultDay=9;"), ("a recent ask", "s.goNext=11;"), ("a seedling note on the sill", "delete s.giftSeed;s.slothNote='sill';"),
                             ("a seedling note in the journal", "delete s.giftSeed;s.slothJournal=1;"), ("a seed choice", "s.seedOffer={ids:[1,1],seed:{}};goTick=()=>{};"), ("someone leaving", "s.goDest='x';s.goDay=99;")]:
            await load(extra)
            await pg.evaluate("()=>{offerTick=()=>{};}")
            check(not await pg.evaluate(ROLL % "0"), f"{label}: a letter landed anyway")
        # and the seedling note waits for a letter
        await load("delete s.giftSeed;s.letterJournal=1;s.letterFor=1;s.letterAgain=99;")
        await pg.evaluate("()=>{for(let i=0;i<40;i++)__step(.5,50);}")
        check(await pg.evaluate("()=>st.slothNote!=='sill'"), "the seedling note landed over a waiting letter")

        # debug, on the test copy
        await load()
        await pg.click("#dbgBtn")
        await pg.evaluate("()=>{__step(.5);[...dbg.querySelectorAll('button')].find(b=>b.textContent==='Sloth, PhD letter now').click();__step(.5);}")
        check(await pg.evaluate("()=>TESTING&&letterOnSill()"), "debug's letter")
        check(await pg.evaluate("()=>!JSON.parse(localStorage.getItem(KEY)).letterNote"), "debug's letter reached the real save")
        fails += errs
        await ctx.close()

        # iPhone landscape
        ctx = await b.new_context(viewport={"width": 844, "height": 390}, device_scale_factor=2)
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await load()
        await pg.evaluate("()=>{letterLand(1);openLetter();__step(.2);}")
        check(await pg.evaluate("()=>{const r=document.querySelector('.jletter').getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;}"), "the letter doesn't fit an iPhone")
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "5_iphone.png"))
        fails += errs
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS letter_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
