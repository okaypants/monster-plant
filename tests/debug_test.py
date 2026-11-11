"""Debug drawer and TEST MODE: debug must never change the real game.

Run from the repository root:  python tests/debug_test.py
On an iPhone 13 held sideways (844 x 390, touch): opens the debug drawer and checks TEST MODE is on (label showing, the
room fits beside the drawer), then works a control in every group (time, season, curtains, lamps, species, age, thirst,
two adults, breeding, cat trust, cat spot, cat pose, effects, presets, hide). All the while the real save in
localStorage must not change by a single byte. "Back to my game" must bring back the real game exactly (and a seed
from "breed now" must never arrive in it); "Keep these changes in my real game" saves only after a second tap.
Screenshots go to tests/screenshots/debug/. Exit code 1 if a check fails.
"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "debug")
REAL = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:1,day:4,dayT:.3,giftSeed:1,mode:'actions',catTrust:.5,"
        "nge:.4,nlc:-.4,ge:.4,lc:-.4,pref:'shade',free:{x:1250,y:918},needs:{thirst:.1,hunger:0,attention:.2}});localStorage.setItem(KEY,JSON.stringify(s));}")


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
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate(REAL)
        await pg.reload(wait_until="load")
        await pg.tap(".screen button")
        await pg.evaluate("()=>__step(8)")
        vw = await pg.evaluate("()=>innerWidth")
        print(f"iPhone 13 landscape: {vw} x {await pg.evaluate('()=>innerHeight')} visible (Safari)")

        real_disk = lambda: pg.evaluate("()=>localStorage.getItem(KEY)")
        step = lambda s=.3: pg.evaluate(f"()=>__step({s})")
        dbg = lambda text: pg.locator("#dbg button", has_text=text).first
        async def row_btn(label, text):
            await pg.locator("#dbg .row", has=pg.locator("label", has_text=label)).first.locator("button", has_text=text).first.tap()
            await step()
        async def slide(label, value):
            await pg.evaluate("""([l,v])=>{const r=[...document.querySelectorAll('#dbg .row')].find(r=>r.querySelector('label')?.textContent===l);const i=r.querySelector('input[type=range]');i.value=v;i.dispatchEvent(new Event('input'));}""", [label, value])
            await step()
        async def choose(label, value):
            await pg.locator("#dbg .row", has=pg.locator("label", has_text=label)).first.locator("select").select_option(str(value))
            await step()

        # open the drawer: TEST MODE
        await pg.tap("#dbgBtn")
        await step()
        disk0 = await real_disk()
        st0 = json.loads(await pg.evaluate("()=>realSnap.st"))  # the real game at the moment the drawer opened
        cat0 = json.loads(await pg.evaluate("()=>realSnap.cat"))
        check(await pg.evaluate("()=>TESTING"), "opening debug didn't switch to TEST MODE")
        check(await pg.is_visible("#testBadge"), "no TEST MODE label")
        lay = await pg.evaluate("()=>{const c=cv.getBoundingClientRect(),d=dbg.getBoundingClientRect();return {cr:c.right,dl:d.left,dw:d.width};}")
        check(lay["cr"] <= lay["dl"] + 1, f"the drawer covers the room (room ends at {lay['cr']:.0f}, drawer starts at {lay['dl']:.0f})")
        await pg.screenshot(path=os.path.join(OUT, "phone_1_drawer_open.png"))
        # a picture of every group in the drawer (scrolled to it)
        for i, name in enumerate(("World", "Plants", "Cat", "Effects", "Presets")):
            sm = pg.locator("#dbg summary", has_text=name).first
            if not await pg.evaluate("n=>[...document.querySelectorAll('#dbg summary')].find(s=>s.textContent.startsWith(n)).parentElement.open", name):
                await sm.tap(); await step()
            await pg.evaluate("n=>{const s=[...document.querySelectorAll('#dbg summary')].find(s=>s.textContent.startsWith(n));dbg.scrollTop=s.offsetTop-dbg.querySelector('.dhead').offsetHeight;}", name)
            await pg.screenshot(path=os.path.join(OUT, f"phone_group_{i + 1}_{name.lower()}.png"))
            if name in ("Effects", "Presets"):
                await sm.tap(); await step()  # close them again
        await pg.evaluate("()=>{dbg.scrollTop=0;}")

        # World
        await dbg("Golden hour").tap(); await step()
        check(abs(await pg.evaluate("()=>st.dayT") - .6) < 1e-6, "Golden hour didn't set the time")
        await slide("Time of day", .37)
        check(abs(await pg.evaluate("()=>st.dayT") - .37) < 1e-6, "time slider didn't set the time")
        await row_btn("Season", "winter")
        check(await pg.evaluate("()=>seasonNow()") == "winter", "season override didn't apply")
        await row_btn("Curtains", "closed")
        await row_btn("Floor lamp", "off")
        check(await pg.evaluate("()=>st.curtain==='closed'&&st.lamp===false"), "curtains/floor lamp didn't change")
        await row_btn("Pause time", "on")
        t0 = await pg.evaluate("()=>st.dayT"); await pg.evaluate("()=>{st.mode='visit';__step(5);}")
        check(await pg.evaluate("()=>st.dayT") == t0, "time moved while paused")
        await row_btn("Pause time", "off")
        await row_btn("Clock", "held")
        check(await pg.evaluate("()=>st.mode") == "actions", "clock mode")

        # Plants: species/age keep it the same plant
        await choose("Species", 7)
        await row_btn("Age", "kid")
        await slide("Thirst", .8)
        r = await pg.evaluate("()=>({id:st.id,sp:st.species,stage:st.stage,nge:st.nge,th:st.needs.thirst})")
        check(r["id"] == 1 and r["sp"] == 7 and r["stage"] == 4 and abs(r["nge"] - .4) < 1e-9 and abs(r["th"] - .8) < .01, f"plant edits wrong or made a new plant: {r}")
        await dbg("Make two adults").tap(); await step()
        check(await pg.evaluate("()=>allRaw().filter(q=>q.stage===8).length") == 2, "Make two adults didn't")
        pid = await pg.evaluate("()=>dbgPid")
        await pg.locator("#dbg .tabs button:not(.on)").first.tap(); await step()
        check(await pg.evaluate("()=>dbgPid") != pid, "plant tabs don't switch")
        await dbg("Breed now").tap(); await step()

        # Cat
        await slide("Trust", .95)
        check(await pg.evaluate("()=>catTrust()") == .95, "trust slider")
        check("BFF" in await pg.locator("#dbg .row", has=pg.locator("label", has_text="Trust")).first.locator("output").inner_text(), "trust doesn't show its level name")
        await row_btn("Walk there", "off")
        await dbg("Book stack").tap(); await step()
        check(await pg.evaluate("()=>cat.spot") == "books", "send cat to the book stack")
        await choose("Pose", "groom1")
        check(await pg.evaluate("()=>catFrame()===CATF.groom1"), "cat pose")
        await pg.screenshot(path=os.path.join(OUT, "phone_2_changes_applied.png"))

        # Effects
        await pg.locator("#dbg summary", has_text="Effects").tap(); await step()
        await row_btn("Hearts", "off")
        check(await pg.evaluate("()=>FX_OFF.has('hearts')"), "effect toggle")
        await row_btn("Sparkles", "replay")
        check(await pg.evaluate("()=>!!dbgFx"), "effect replay")

        # Presets
        await pg.locator("#dbg summary", has_text="Presets").tap(); await step()
        await dbg("Load: Two adults at golden hour in winter").tap(); await step()
        r = await pg.evaluate("()=>({n:allRaw().filter(q=>q.stage===8).length,t:st.dayT,s:seasonNow()})")
        check(r["n"] >= 2 and abs(r["t"] - .6) < .01 and r["s"] == "winter", f"built-in preset: {r}")
        await pg.locator("#dbg input[type=text]").fill("my test setup")
        await dbg("Save preset").tap(); await step()
        check("my test setup" in await pg.evaluate("()=>localStorage.getItem('mp-presets')||''"), "saving a preset")

        # Hide: look at the room with the settings applied
        await dbg("Hide").tap(); await step()
        lay = await pg.evaluate("()=>({open:dbg.classList.contains('open'),tab:getComputedStyle(dbgTab).display,cw:cv.getBoundingClientRect().width})")
        check(not lay["open"] and lay["tab"] != "none", f"Hide: {lay}")
        await pg.evaluate("()=>__step(1)")
        await pg.screenshot(path=os.path.join(OUT, "phone_3_hidden_settings_applied.png"))
        await pg.tap("#dbgTab"); await step()
        check(await pg.evaluate("()=>dbg.classList.contains('open')"), "the tab doesn't bring the drawer back")

        # all this time the real save never changed
        await pg.evaluate("()=>__step(3)")  # autosave runs every half second
        check(await real_disk() == disk0, "the real save in localStorage changed during TEST MODE")

        # Back to my game: everything as it was, and the seed from "Breed now" never arrives
        await dbg("Back to my game").tap()
        r = await pg.evaluate("()=>({testing:TESTING,st:JSON.stringify(st),cat:plainCat(),season:SEASON_OVERRIDE,fx:FX_OFF.size})")
        check(not r["testing"], "still in TEST MODE after Back to my game")
        back = json.loads(r["st"])
        diff = sorted(k for k in set(back) | set(st0) if back.get(k) != st0.get(k))
        check(not diff, f"the real game didn't come back exactly: {diff}")
        check(json.loads(r["cat"]) == cat0, "the cat didn't come back exactly")
        check(r["season"] is None and r["fx"] == 0, "test settings leaked (season or effects)")
        check(not await pg.is_visible("#testBadge"), "TEST MODE label still showing")
        check(await pg.evaluate("()=>cap.textContent") == "", "a caption from TEST MODE is still showing on the real game")
        await pg.evaluate("()=>__step(6)")
        check(await pg.evaluate("()=>plantCount()") == 1, "a seed from Breed now arrived in the real game")
        saved = await pg.evaluate("()=>{const a=JSON.parse(localStorage.getItem(KEY));delete a.lastSeen;return {id:a.id,sp:a.species,stage:a.stage,others:(a.others||[]).length};}")
        check(saved == {"id": 1, "sp": 3, "stage": 8, "others": 0}, f"real save after leaving test mode: {saved}")
        await pg.screenshot(path=os.path.join(OUT, "phone_4_back_to_my_game.png"))

        # Keep these changes: only after a second tap
        await pg.tap("#dbgBtn"); await step()
        await choose("Species", 9)
        await pg.locator("#dbg button.keep").tap(); await step()
        check(await pg.evaluate("()=>TESTING"), "Keep saved on the first tap (it should ask again)")
        await pg.locator("#dbg button.keep").tap(); await step()
        r = await pg.evaluate("()=>({testing:TESTING,disk:JSON.parse(localStorage.getItem(KEY))})")
        check(not r["testing"] and r["disk"]["species"] == 9 and r["disk"]["id"] == 1, "Keep these changes didn't save them for real")
        fails += [f"page error: {e}" for e in errs]
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("saved to tests/screenshots/debug/")
    if fails:
        sys.exit(1)
    print("PASS: debug runs in TEST MODE on a copy; the real save never changes unless you tap Keep twice")


if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    asyncio.run(main())
