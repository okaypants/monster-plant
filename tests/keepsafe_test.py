"""Keep it safe (js/keepsafe.js): the backup file, the copies on the phone, and the iPhone Home Screen tip.

Run from the repository root:  python tests/keepsafe_test.py
On a phone held sideways it plays a saved game (day 12) with a song from the sampler, then checks:
  - the journal has a Keep it safe ribbon and page, with Save a backup and Load a backup
  - Save a backup makes a file holding the game, the radio's presets and the sampler's song
  - a copy of the save goes into the phone's second store as play goes on, and Start over keeps one first
  - on a fresh phone the start screen has Load a backup; loading the file asks first, then brings back day 12, the
    presets and the song, sound for sound
  - with the save gone but a copy still on the phone, the start screen offers to bring it back
  - on iPhone and Android the start screen and the Keep it safe page say how to add the game to the Home Screen, nothing pops
    up about it during play, and there's no how-to when the game is already playing from its icon
Pictures go to tests/screenshots/keepsafe/. Exit code 1 if a check fails.
"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, serve

OUT = os.path.join(SHOTS, "keepsafe")
IPHONE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"
SAVE = """()=>{const s=fresh();Object.assign(s,{started:true,stage:6,species:4,id:1,day:12,dayT:.3,mode:'actions',curtain:'open',giftSeed:1,catTrust:.6,free:{x:400,y:918},name:'Tuffet',lastSeen:Date.now()-3600e3});
 localStorage.setItem(KEY,JSON.stringify(s));localStorage.setItem('mp-radio',JSON.stringify({band:'world',wi:3,pre:[{band:'world',n:'Wa3 Radio'},null,null,{band:'crates'},null]}));}"""
SONG = """()=>{const sr=22050,n=sr,pcm=new Int16Array(n);for(let k=0;k<n;k++)pcm[k]=Math.round(Math.sin(k/sr*330*6.283)*6000)+(k%7);
 return cratesTx(['songs','songpcm'],'readwrite',tx=>{const q=tx.objectStore('songs').add({n:1,name:'Song 1',made:Date.now(),bpm:90,bars:2,secs:1,radio:true});
 q.onsuccess=()=>tx.objectStore('songpcm').put({id:q.result,sr,pcm})})}"""
SONG_SUM = "()=>cratesAll('songpcm').then(a=>a.length?[a.length,a[0].pcm.constructor.name,a[0].pcm.length,a[0].pcm.reduce((s,v,i)=>(s+v*(i%13+1))%1000003,0)]:[0])"


async def until(pg, js, secs):
    for _ in range(int(secs * 10)):
        if await pg.evaluate("()=>" + js):
            return True
        await asyncio.sleep(.1)
    return False


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    def check(ok, why):
        if not ok:
            fails.append(why)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        url = f"http://localhost:{PORT}/index.html"
        # ---- the phone with the game on it ----
        ctx = await b.new_context(viewport={"width": 844, "height": 390}, device_scale_factor=2, has_touch=True, accept_downloads=True)
        await ctx.route(lambda u: not u.startswith(f"http://localhost:{PORT}"), lambda r: r.abort())
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(url, wait_until="load")
        await pg.evaluate(SAVE)
        await pg.evaluate(SONG)
        song = await pg.evaluate(SONG_SUM)
        await pg.reload(wait_until="load")
        await pg.click(".screen button[data-k=go]")
        # copies on the phone: one a minute into play (sped up here), then every 10 minutes
        await pg.evaluate("()=>{ksLast=0;save()}")
        check(await until(pg, "true", .5) and len(await pg.evaluate("()=>ksCopies()")) == 1, "a copy of the save should go into the phone's second store")
        await pg.evaluate("()=>save()")
        check(len(await pg.evaluate("()=>ksCopies()")) == 1, "copies should be made every 10 minutes, not on every save")
        # the journal's Keep it safe page
        await pg.evaluate("()=>openJournal()")
        rib = pg.locator(".jrib[aria-label='Keep it safe']")
        check(await rib.count() == 1, "the journal should have a Keep it safe ribbon")
        await rib.click()
        await asyncio.sleep(.6)
        text = await pg.evaluate("()=>document.querySelector('.journal').innerText")
        check("Save a backup" in text and "Load a backup" in text and "Copies on this phone" in text, f"the Keep it safe page should have both buttons and the copies, got {text[:200]}")
        check("Newest: day 12" in text, f"the page should say the newest copy, got {text[:400]}")
        await pg.screenshot(path=os.path.join(OUT, "journal_keep_it_safe.png"))
        async with pg.expect_download() as dl:
            await pg.click(".kschoices [data-k=save]")
        d = await dl.value
        path = os.path.join(OUT, "backup.json")
        await d.save_as(path)
        check(d.suggested_filename == "monster-plant-backup.json", f"the file should always have the same name, so a new one replaces the old, got {d.suggested_filename}")
        data = json.load(open(path))
        check(data.get("app") == "monster-plant" and json.loads(data["game"]).get("day") == 12, "the file should hold the game")
        check("Wa3 Radio" in (data.get("radio") or ""), "the file should hold the radio's presets")
        check(len(data["crates"].get("songpcm", [])) == 1 and data["crates"]["songpcm"][0][1]["pcm"].get("__ta") == "Int16Array", "the file should hold the song's sound")
        # Start over keeps a copy first
        await pg.evaluate("()=>closeJournal()")
        await pg.reload(wait_until="load")
        await pg.click(".screen button[data-k=new]")
        await asyncio.sleep(.5)
        check(len(await pg.evaluate("()=>ksCopies()")) == 2, "Start over should keep a copy of the room first")
        # the save gone but a copy still on this phone: the start screen offers it back
        await pg.evaluate("()=>localStorage.removeItem(KEY)")
        await pg.reload(wait_until="load")
        back = pg.locator(".screen button[data-k=ksback]")
        check(await until(pg, "!!document.querySelector('.screen button[data-k=ksback]')", 3), "the start screen should offer to bring back a copy from this phone")
        if await back.count():
            check("day 12" in (await back.text_content()), "the offer should say which day")
            await pg.screenshot(path=os.path.join(OUT, "start_bring_back.png"))
            await back.click()
            await pg.wait_for_load_state("load")
            await asyncio.sleep(.5)
            check(await pg.evaluate("()=>st.started&&st.day===12"), "bringing back the copy should restore day 12")
        fails += errs
        await ctx.close()

        # ---- a new phone: load the file from the start screen ----
        ctx = await b.new_context(viewport={"width": 844, "height": 390}, device_scale_factor=2, has_touch=True)
        await ctx.route(lambda u: not u.startswith(f"http://localhost:{PORT}"), lambda r: r.abort())
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(url, wait_until="load")
        check(await pg.locator(".screen button[data-k=load]").count() == 1, "a new phone's start screen should have Load a backup")
        await pg.screenshot(path=os.path.join(OUT, "start_new_phone.png"))
        async with pg.expect_file_chooser() as fc:
            await pg.click(".screen button[data-k=load]")
        await (await fc.value).set_files(path)
        ok = await until(pg, "[...document.querySelectorAll('.screen h1')].some(h=>h.textContent==='Load a backup?')", 3)
        check(ok, "loading a file should ask first")
        await pg.screenshot(path=os.path.join(OUT, "load_asks_first.png"))
        await pg.click(".screen button[data-k=y]")
        await pg.wait_for_load_state("load")
        await asyncio.sleep(.8)
        check(await pg.evaluate("()=>st.started&&st.day===12&&st.name==='Tuffet'"), "the new phone should have the room back, day 12")
        check(await pg.evaluate("()=>JSON.parse(localStorage.getItem('mp-radio')).pre[0].n==='Wa3 Radio'"), "the radio's presets should come back")
        check(await pg.evaluate(SONG_SUM) == song, f"the song should come back sound for sound, {await pg.evaluate(SONG_SUM)} vs {song}")
        # a file that isn't a backup
        await pg.evaluate("()=>{capClear&&capClear();CAP.log=[]}")
        bad = os.path.join(OUT, "not_a_backup.json")
        open(bad, "w").write('{"hello":1}')
        await pg.click(".screen button[data-k=go]")
        await pg.evaluate("()=>openJournal('safe')")
        await asyncio.sleep(.5)
        async with pg.expect_file_chooser() as fc:
            await pg.click(".kschoices [data-k=load]")
        await (await fc.value).set_files(bad)
        await asyncio.sleep(.6)
        log = await pg.evaluate("()=>CAP.log.concat(CAP.q).concat(CAP.cur?[CAP.cur]:[]).map(l=>l.t)")
        check(any("isn't a Monster Plant backup" in t for t in log), f"a wrong file should be turned away, log {log}")
        os.remove(bad)
        fails += errs
        await ctx.close()

        # ---- the Home Screen how-to: one line on the start screen (and the loading screen), for each kind of device ----
        ANDROID_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36"
        for name, ua, want in [("iphone", IPHONE_UA, "Playing in a browser? Tap Share, then Add to Home Screen"), ("android", ANDROID_UA, "Playing in a browser?")]:
            ctx = await b.new_context(viewport={"width": 844, "height": 390}, device_scale_factor=2, has_touch=True, user_agent=ua)
            await ctx.route(lambda u: not u.startswith(f"http://localhost:{PORT}"), lambda r: r.abort())
            pg = await ctx.new_page()
            await pg.goto(url, wait_until="load")
            hint = await pg.evaluate("()=>(document.querySelector('.screen .kshint')||{}).textContent||''")
            check(want in hint, f"{name}: the start screen should say how to add the game to the Home Screen, got {hint!r}")
            await pg.screenshot(path=os.path.join(OUT, f"start_hint_{name}.png"))
            await pg.evaluate(SAVE)
            await pg.reload(wait_until="load")
            check(want in await pg.evaluate("()=>(document.querySelector('.screen .kshint')||{}).textContent||''"), f"{name}: the welcome-back screen should have it too")
            await pg.click(".screen button[data-k=go]")
            await asyncio.sleep(1)
            check(not await pg.evaluate("()=>CAP.log.concat(CAP.q).concat(CAP.cur?[CAP.cur]:[]).some(l=>/Home Screen/i.test(l.t))"), f"{name}: nothing about the Home Screen should pop up during play")
            await pg.evaluate("()=>openJournal('safe')")
            await asyncio.sleep(.5)
            check(want in await pg.evaluate("()=>document.querySelector('.journal').innerText"), f"{name}: the Keep it safe page should say how too")
            await ctx.close()
        # already playing from the Home Screen icon: no how-to
        ctx = await b.new_context(viewport={"width": 844, "height": 390}, user_agent=IPHONE_UA)
        await ctx.add_init_script("Object.defineProperty(navigator,'standalone',{get:()=>true})")
        pg = await ctx.new_page()
        await pg.goto(url, wait_until="load")
        check(not await pg.evaluate("()=>!!document.querySelector('.kshint')"), "playing from the Home Screen icon, there should be no how-to")
        await ctx.close()
        await b.close()
    os.remove(path)
    for f in fails:
        print("FAIL", f)
    print("PASS keepsafe_test" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
