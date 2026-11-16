"""The sampler's BEAT and SAVED pages (sampler.html).

Run from the repository root:  python tests/beat_test.py
Opens the sampler by itself on a phone held sideways, with two made-up pads (no internet needed), and checks:
pitch per pad (a semitone a press, shown on the pad), the tempo keys, the click, LOCK snapping a recorded hit to
the nearest sixteenth (and not snapping with LOCK off), the loop playing its hits back, STOP, and saving a beat,
loading it back after the page is reloaded, and erasing it. Pictures go to tests/screenshots/sampler/.
Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, serve

OUT = os.path.join(SHOTS, "sampler")
PADS = """()=>{unlock();const tone=(f,s)=>{const b=AC.createBuffer(1,Math.round(AC.sampleRate*s),AC.sampleRate),d=b.getChannelData(0);
 for(let k=0;k<d.length;k++)d[k]=Math.sin(k/AC.sampleRate*f*6.283)*.3*(1-k/d.length);return b};
 pads[0]={buf:tone(220,.4),title:'Test tone low',pitch:0};pads[1]={buf:tone(440,.2),title:'Test tone high',pitch:0};
 drawPad(0);drawPad(1);SEQ.sel=0;beatUI();}"""


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    def check(ok, why):
        if not ok:
            fails.append(why)
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        ctx = await b.new_context(viewport={"width": 844, "height": 390}, device_scale_factor=2, has_touch=True)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/sampler.html", wait_until="load")
        await pg.evaluate("()=>document.fonts.ready")
        await pg.evaluate(PADS)
        await pg.click(".tab[data-p=pBeat]")
        check(await pg.locator("#pBeat").is_visible() and not await pg.locator("#pDig").is_visible(), "the BEAT tab should show the beat page")
        for sel in ("#bpmD", "#bpmU", "#click", "#lock", "#pitD", "#pitU", "#rec", "#bplay", "#clear"):
            check(await pg.locator(sel).is_visible(), f"missing on the beat page: {sel}")
        # pitch: two presses up on pad 1
        await pg.click("#pitU"); await pg.click("#pitU")
        st = await pg.evaluate("()=>[pads[0].pitch,rate(pads[0].pitch),document.querySelector('#pads .p u').textContent,document.getElementById('pit').textContent]")
        check(st[0] == 2 and abs(st[1] - 2 ** (2 / 12)) < 1e-9 and st[2] == "1 · +2" and st[3] == "+2", f"pitch +2 on pad 1, got {st}")
        # tempo
        for _ in range(3):
            await pg.click("#bpmU")
        check(await pg.evaluate("()=>SEQ.bpm") == 93, "three taps on + should make the tempo 93")
        await pg.evaluate("()=>setBpm(500)")
        check(await pg.evaluate("()=>SEQ.bpm") == 200, "the tempo stops at 200")
        await pg.evaluate("()=>setBpm(120)")
        # the click runs the clock by itself
        await pg.click("#click")
        await pg.wait_for_timeout(700)
        st = await pg.evaluate("()=>[SEQ.on,SEQ.nextClick,document.querySelectorAll('#dots i.on').length]")
        check(st[0] and st[1] >= 2 and st[2] == 1, f"the click should tick the beat lights, got {st}")
        await pg.click("#click")
        check(not await pg.evaluate("()=>SEQ.on"), "turning the click off with nothing playing stops the clock")
        # LOCK: a hit heard at beat 1.13 is recorded at 1.25; with LOCK off it stays at 1.13
        hit = """(lock)=>{SEQ.ev=[];SEQ.lock=lock;clockStart();SEQ.rec=true;SEQ.start=0;const t=AC.currentTime-lat();SEQ.a0=t;SEQ.b0=1.13;record(0);const r=SEQ.ev.map(e=>e.b);clockStop();return r}"""
        on = await pg.evaluate(hit, True)
        off = await pg.evaluate(hit, False)
        check(on == [1.25], f"LOCK should snap 1.13 to 1.25, got {on}")
        check(len(off) == 1 and abs(off[0] - 1.13) < .01, f"with LOCK off the hit stays near 1.13, got {off}")
        # the loop plays its hits back, and STOP stops it
        await pg.evaluate("()=>{SEQ.lock=true;SEQ.bars=1;SEQ.ev=[{p:0,b:0},{p:1,b:2}];window.__n=0;const v=voice;voice=(i,t)=>{__n++;return v(i,t)};beatUI()}")
        await pg.click("#bplay")
        await pg.wait_for_timeout(2300)  # a bar at 120 is 2 s
        await pg.screenshot(path=os.path.join(OUT, "beat_page.png"))
        n = await pg.evaluate("()=>__n")
        check(n >= 3, f"one bar and a bit of the loop should play at least 3 hits, played {n}")
        check("STOP" in await pg.locator("#bplay").text_content(), "PLAY should turn into STOP while the loop plays")
        await pg.click("#bplay")
        n0 = await pg.evaluate("()=>__n")
        await pg.wait_for_timeout(600)
        check(await pg.evaluate("()=>__n") == n0 and not await pg.evaluate("()=>SEQ.on"), "STOP should stop the loop")
        # REC from a standstill counts in one bar
        await pg.click("#rec")
        st = await pg.evaluate("()=>[SEQ.rec,SEQ.play,SEQ.count,SEQ.start]")
        check(st == [True, True, True, 4], f"REC from a standstill counts in a bar, got {st}")
        await pg.click("#bplay")
        # save, reload, load, erase
        await pg.click(".tab[data-p=pSaved]")
        await pg.click("#save")
        await pg.wait_for_selector("#slist .r")
        await pg.screenshot(path=os.path.join(OUT, "saved_page.png"))
        await pg.reload(wait_until="load")
        await pg.evaluate("()=>unlock()")
        check(not await pg.evaluate("()=>pads.some(Boolean)"), "pads are not kept unless a beat is loaded")
        await pg.click(".tab[data-p=pSaved]")
        await pg.wait_for_selector("#slist .r")
        await pg.click("#slist .r")
        await pg.wait_for_function("()=>pads.some(Boolean)")
        st = await pg.evaluate("()=>[pads[0].title,pads[0].pitch,pads[1].title,pads.filter(Boolean).length,SEQ.bpm,SEQ.bars,JSON.stringify(SEQ.ev.map(e=>[e.p,e.b])),Math.abs(pads[0].buf.duration-.4)<.01]")
        check(st == ["Test tone low", 2, "Test tone high", 2, 120, 1, "[[0,0],[1,2]]", True], f"the loaded beat should match the saved one, got {st}")
        await pg.screenshot(path=os.path.join(OUT, "loaded.png"))
        await pg.click("#erase")
        await pg.click("#slist .r")
        await pg.wait_for_selector("#slist #note")
        check(await pg.locator("#slist .r").count() == 0, "ERASE then tapping a saved beat should erase it")
        check(not await pg.evaluate("()=>Object.keys(localStorage).length"), "the sampler must not write to the game's storage")
        fails += errs
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS beat_test" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
