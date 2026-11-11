"""Sloth's note: the opt-in second plant.

Run from the repository root:  python tests/sloth_note_shots.py
A late teen alone in the room: Sloth's paw sets an envelope on the windowsill; tapping it asks "I have a seedling in need
of a home. May I send it over?"; "Not yet" puts the note in the journal (where "Yes, please" works); the seed arrives the
next morning with Sloth's caption. Pictures go to tests/screenshots/sloth_note/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "sloth_note")
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:6,credit:.4,species:4,id:1,day:4,dayT:.3,mode:'actions',curtain:'open',"
        "nge:0,nlc:0,ge:0,lc:0,catTrust:.1,free:{x:1250,y:918}});localStorage.setItem(KEY,JSON.stringify(s));}")


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    check = lambda ok, msg: ok or fails.append(msg)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1440, "height": 812})
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate(SAVE)
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        await pg.evaluate("()=>{__step(14);capClear();__step(3);}")
        check(await pg.evaluate("()=>slothOnSill()"), "the note didn't land for a late teen")
        await pg.evaluate("()=>{for(let i=0;i<60&&(paw||st.pawWait);i++)__step(.5,50);}")
        check(await pg.evaluate("()=>st.sillItem==='envelope'"), "the paw didn't leave the envelope on the sill")
        await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(OUT, "1_note_on_sill.png"))
        # tap the note like a player
        box = await pg.evaluate("()=>{const n=sillBox(),r=cv.getBoundingClientRect();return {x:r.left+(n.x+n.w/2)*S,y:r.top+(n.y+n.h/2)*S};}")
        await pg.mouse.click(box["x"], box["y"])
        await pg.wait_for_timeout(300)
        txt = await pg.evaluate("()=>bubble?bubble.textContent:''")
        check("I have a seedling in need of a home. May I send it over?" in txt and "Yes, please" in txt and "Not yet" in txt, f"tapping the note: {txt!r}")
        await pg.screenshot(path=os.path.join(OUT, "2_asks.png"))
        await pg.click(".bubble [data-k=n]")
        check(await pg.evaluate("()=>!slothOnSill()&&st.slothJournal===1&&st.giftAskDay===st.day+3"), "not yet: the note should move to the journal and ask again in 3 days")
        await pg.evaluate("()=>openJournal()")
        await pg.wait_for_timeout(300)
        await pg.click(".jslothnote")  # the envelope tucked in the journal
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "3_journal_note.png"))
        await pg.click(".jslothask [data-k=y]")
        check(await pg.evaluate("()=>st.slothSend===st.day+1&&plantCount()===1"), "yes in the journal: the seed should come next morning, not now")
        await pg.evaluate("()=>{closeJournal();capClear();st.night=true;wake();__step(1);for(let i=0;i<60&&(paw||st.pawWait);i++)__step(.5,50);}")  # the paw brings a seed packet (Nov 10)
        check(await pg.evaluate("()=>st.sillItem==='seed'&&plantCount()===1"), "the paw should leave a seed packet in the morning")
        await pg.evaluate("()=>{__step(4.5);}")  # the morning line, then Sloth's
        check(await pg.evaluate("()=>CAP.log.concat(CAP.q).some(l=>l.t==='A seed packet from Sloth, PhD is on the windowsill.')"), "no Sloth, PhD caption")
        await pg.evaluate("()=>{sillTap();__step(1);}")
        check(await pg.evaluate("()=>plantCount()===2&&st.stage===0"), "tapping the packet should plant the seed")
        await pg.wait_for_timeout(700)
        await pg.screenshot(path=os.path.join(OUT, "4_seed_next_morning.png"))
        fails += errs
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS sloth_note_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
