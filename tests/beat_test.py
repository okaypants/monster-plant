"""The sampler's BEAT and SAVED pages (sampler.html).

Run from the repository root:  python tests/beat_test.py
Opens the sampler by itself on a phone held sideways, with two made-up pads (no internet needed), and checks:
pitch per pad (a semitone a press, shown on the pad), the tempo keys, the click, LOCK snapping a recorded hit to
the nearest sixteenth (and not snapping with LOCK off), the loop playing its hits back, STOP, the click sounding only
while recording, the one work in progress coming back after a reload (and replaced by saving again), the warning when
leaving unsaved, FINISH SONG (two taps) making a song and clearing the work, sending it to the radio, and erasing it. Pictures go to tests/screenshots/sampler/.
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
        # the click is only a guide: it sounds while recording, never while the loop just plays
        await pg.evaluate("()=>{SEQ.click=true;window.__b=0;const o=blip;blip=(t,one)=>{__b++;return o(t,one)};beatUI()}")
        await pg.click("#bplay")
        await pg.wait_for_timeout(1200)
        check(await pg.evaluate("()=>__b") == 0, "the click should be silent while the loop plays back")
        await pg.click("#rec")
        await pg.wait_for_timeout(1200)
        check(await pg.evaluate("()=>__b") >= 2, "the click should sound while recording")
        await pg.click("#bplay")
        await pg.evaluate("()=>{SEQ.click=false;beatUI()}")
        # work in progress: save it, reload, and it is back
        await pg.evaluate("()=>{SEQ.ev=[{p:0,b:0},{p:1,b:2}];SEQ.bars=1;beatUI()}")
        await pg.click(".tab[data-p=pSaved]")
        await pg.click("#save")
        await pg.wait_for_function("()=>/^Work in progress saved/.test(document.getElementById('wip').textContent)")
        await pg.reload(wait_until="load")
        await pg.wait_for_function("()=>pads.some(Boolean)")
        st = await pg.evaluate("()=>[pads[0].title,pads[0].pitch,pads[1].title,pads.filter(Boolean).length,SEQ.bpm,SEQ.bars,JSON.stringify(SEQ.ev.map(e=>[e.p,e.b])),Math.abs(pads[0].buf.duration-.4)<.01,document.getElementById('l2').textContent]")
        check(st[:8] == ["Test tone low", 2, "Test tone high", 2, 120, 1, "[[0,0],[1,2]]", True] and "back" in st[8], f"the work in progress should come back when the sampler opens, got {st}")
        # only one work in progress: saving again replaces it
        await pg.evaluate("()=>{setBpm(100)}")
        await pg.click(".tab[data-p=pSaved]")
        await pg.click("#save")
        await pg.wait_for_timeout(300)
        n = await pg.evaluate("()=>cratesTx(['work'],'readonly',(tx,put)=>{const r=tx.objectStore('work').getAllKeys();r.onsuccess=()=>put(r.result)})")
        bpm = await pg.evaluate("()=>cratesGet('work','wip').then(w=>w.bpm)")
        check(n == ["wip"] and bpm == 100, f"there is one work in progress, replaced by saving again: keys {n}, bpm {bpm}")
        # leaving with unsaved changes asks once
        await pg.evaluate("()=>setBpm(101)")
        await pg.click("#x")
        check("not saved" in await pg.locator("#l2").text_content(), "leaving with unsaved work should warn first")
        await pg.evaluate("()=>setBpm(100)")
        # finish the song: two taps; the work in progress is cleared
        await pg.click("#finish")
        check(not await pg.locator("#slist .srow").count(), "one tap on FINISH SONG only asks")
        await pg.click("#finish")
        await pg.wait_for_selector("#slist .srow")
        st = await pg.evaluate("()=>Promise.all([cratesGet('work','wip'),cratesAll('songs'),cratesAll('songpcm')]).then(([w,s,p])=>[!!w,s.length,s[0].name,s[0].radio,Math.round(s[0].secs),p[0].sr,p[0].pcm.length>p[0].sr*20])")
        check(st[0] is False and st[1:4] == [1, "Song 1", False] and 24 <= st[4] <= 50 and st[5] == 22050 and st[6], f"FINISH SONG should make Song 1 (about half a minute) and clear the work in progress, got {st}")
        # the song has the loop in it and no click: its first sound is the low tone at the very start
        peak = await pg.evaluate("()=>cratesAll('songpcm').then(p=>{const a=p[0].pcm;let m=0;for(let k=0;k<2205;k++)m=Math.max(m,Math.abs(a[k]));return m})")
        check(peak > 3000, f"the song should start with the first hit, peak {peak}")
        # send it to the radio
        await pg.click("#slist .srow .t")
        await pg.wait_for_function("()=>cratesAll('songs').then(s=>s[0].radio)")
        await pg.wait_for_selector("#slist .srow .t.on")
        await pg.screenshot(path=os.path.join(OUT, "songs_page.png"))
        # listen, then erase
        await pg.click("#slist .srow .r")
        await pg.wait_for_function("()=>songSrc!==null")
        await pg.click("#erase")
        await pg.click("#slist .srow .r")
        await pg.wait_for_selector("#slist #note")
        check(await pg.evaluate("()=>Promise.all([cratesAll('songs'),cratesAll('songpcm')]).then(([s,p])=>s.length+p.length)") == 0, "ERASE then a song should erase it and its sound")
        check(not await pg.evaluate("()=>Object.keys(localStorage).length"), "the sampler must not write to the game's storage")
        fails += errs
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS beat_test" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
