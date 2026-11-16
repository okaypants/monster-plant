"""The radio on the desk (js/radio.js).

Run from the repository root:  python tests/radio_test.py
On a phone held sideways, with the internet blocked (so no records and no live stations), it puts a finished song
from the sampler on the radio and checks: tapping the radio opens its dial and plays that song with its caption,
tapping again closes the dial and the music keeps going, the screen is kept awake while it plays, OFF switches it off, the radio goes quiet while the sampler is
open and comes back after, and with no songs on the radio and no internet it says there is only static and switches
itself off. Then the WORLD band: 50-some stations along the dial, the arrows step through them (wrapping round), the band
and station are remembered, and with no internet each station says No signal, tries the next, and after a few the
radio says so and switches off. Pictures go to tests/screenshots/radio/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "radio")


async def until(pg, js, secs):  # the game's test clock stops the page's own timers, so poll from here
    for _ in range(int(secs * 10)):
        if await pg.evaluate("()=>" + js):
            return True
        await asyncio.sleep(.1)
    return False
SONG = """()=>{const sr=22050,n=sr*3,pcm=new Int16Array(n);for(let k=0;k<n;k++)pcm[k]=Math.sin(k/sr*330*6.283)*6000;
 return cratesTx(['songs','songpcm'],'readwrite',tx=>{const q=tx.objectStore('songs').add({n:1,name:'Song 1',made:Date.now(),bpm:90,bars:2,secs:3,radio:true});
 q.onsuccess=()=>tx.objectStore('songpcm').put({id:q.result,sr,pcm})})}"""


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
        await ctx.add_init_script(VIRTUAL_TIME)
        # test browsers refuse the real screen wake lock, so count requests with a stand-in
        await ctx.add_init_script("""(()=>{window.__wake={asked:0,held:0};const wl={request:async()=>{__wake.asked++;__wake.held++;const s={released:false,_l:[],
          addEventListener(t,f){this._l.push(f)},release:async function(){if(!this.released){this.released=true;__wake.held--;this._l.forEach(f=>f())}}};return s}};
          Object.defineProperty(navigator,'wakeLock',{get:()=>wl,configurable:true})})()""")
        await ctx.route("https://archive.org/**", lambda r: r.abort())
        await ctx.route(lambda u: not u.startswith(f"http://localhost:{PORT}"), lambda r: r.abort())  # no live stations either
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate("()=>{const s=fresh();Object.assign(s,{started:true,stage:6,species:4,id:1,day:3,dayT:.3,mode:'actions',curtain:'open',giftSeed:1,catTrust:.1,free:{x:400,y:918}});localStorage.setItem(KEY,JSON.stringify(s));}")
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        await pg.evaluate("()=>{capClear();__step(2);}")
        await pg.evaluate(SONG)
        x, y = await pg.evaluate("()=>{const r=cv.getBoundingClientRect();return [r.left+(RADIO.x+RADIO.w/2)*S,r.top+(RADIO.y+RADIO.h/2)*S];}")
        await pg.mouse.click(x, y)
        await until(pg, "radio.src!==null", 5)
        check(await pg.evaluate("()=>__wake.held===1"), "the screen should be kept awake while the radio is on")
        await pg.evaluate("()=>__step(1.5)")
        log = await pg.evaluate("()=>CAP.log.concat(CAP.q).map(l=>l.t)")
        check(any(t.startswith("On the radio: Song 1, by you!") and "bops along" in t for t in log), f"the song should be announced, log {log}")
        for _ in range(20):  # wait for the caption's turn
            if await pg.evaluate("()=>!!CAP.cur&&CAP.cur.t.startsWith('On the radio')"):
                break
            await pg.evaluate("()=>__step(.5)")
        await pg.screenshot(path=os.path.join(OUT, "on_the_radio.png"))
        # quiet while the sampler is open, back after
        await pg.evaluate("()=>openSampler()")
        check(await pg.evaluate("()=>!radio.on&&radio.src===null"), "the radio should go quiet while the sampler is open")
        await pg.evaluate("()=>closeSampler()")
        await until(pg, "radio.on&&radio.src!==null", 5)
        # the dial: a second tap closes it and the music keeps going; OFF switches it off
        check(await pg.evaluate("()=>!radio.panel"), "the sampler should close the dial")
        await pg.mouse.click(x, y)
        check(await pg.evaluate("()=>!!radio.panel&&radio.on"), "a tap should open the dial")
        await pg.screenshot(path=os.path.join(OUT, "dial_crates.png"))
        await pg.mouse.click(x, y)
        check(await pg.evaluate("()=>!radio.panel&&radio.on"), "a second tap should close the dial and keep playing")
        await pg.mouse.click(x, y)
        await pg.click(".rpanel .rpow")
        check(await pg.evaluate("()=>!radio.on&&radio.src===null"), "OFF should switch the radio off")
        check(await pg.evaluate("()=>__wake.held===0"), "the screen may sleep again once the radio is off")
        await pg.click(".rpanel .rx")
        check(await pg.evaluate("()=>!radio.panel"), "the close button should close the dial")
        # nothing on the radio and no internet: static, and it switches itself off
        await pg.evaluate("()=>cratesTx(['songs'],'readwrite',tx=>tx.objectStore('songs').clear())")
        await pg.evaluate("()=>{capClear();CAP.log=[];}")
        await pg.mouse.click(x, y)
        await until(pg, "!radio.on", 8)
        await pg.evaluate("()=>__step(1.5)")
        log = await pg.evaluate("()=>CAP.log.concat(CAP.q).map(l=>l.t)")
        check(any("static" in t for t in log), f"no songs and no internet should say static, log {log}")
        await pg.screenshot(path=os.path.join(OUT, "static.png"))
        # WORLD: no internet here, so each station has no signal
        check(await pg.evaluate("()=>WORLD.length>=50&&WORLD.every(w=>w.u.startsWith('https://')&&w.n&&w.k&&w.p)"), "WORLD should have 50 or more https stations, each with a name, what it plays and where")
        await pg.evaluate("()=>{capClear();CAP.log=[];}")
        check(await pg.evaluate("()=>!!radio.panel"), "the dial should stay open when the radio switches itself off")
        await pg.click(".rpanel [data-b=world]")
        check(await pg.evaluate("()=>radio.band==='world'&&radio.on&&radio.el.src===WORLD[radio.wi].u"), "WORLD should tune to the remembered station")
        w0 = await pg.evaluate("()=>radio.wi")
        await pg.click(".rpanel [data-d='1']")
        check(await pg.evaluate(f"()=>radio.wi===({w0}+1)%WORLD.length"), "the right arrow should step to the next station")
        await pg.evaluate("()=>radioPanelShow()")
        name = await pg.evaluate("()=>document.querySelector('.rpanel .rname b').textContent")
        check(name == await pg.evaluate("()=>WORLD[radio.wi].n"), f"the dial should show the station's name, got {name}")
        await pg.screenshot(path=os.path.join(OUT, "dial_world.png"))
        await pg.evaluate("()=>{radio.on=true;radio.fails=0;radio.wi=0;worldPlay(-1)}")
        check(await pg.evaluate("()=>radio.wi===WORLD.length-1"), "stepping back from the first station should wrap to the last")
        check(await pg.evaluate("()=>JSON.parse(localStorage.getItem('mp-radio')).band==='world'"), "the band should be remembered")
        for _ in range(60):
            await pg.evaluate("()=>__step(.5)")
            if await pg.evaluate("()=>!radio.on"):
                break
        log = await pg.evaluate("()=>CAP.log.concat(CAP.q).map(l=>l.t)")
        check(await pg.evaluate("()=>!radio.on") and any("No signal on the WORLD band" in t for t in log), f"with no internet WORLD should give up and say so, log {log}")
        fails += errs
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS radio_test" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
