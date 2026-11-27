"""The movie room: the curtains and the film.

Run from the repository root:  python tests/movieroom_test.py
The room opens over the main room with its curtains closed and no film loaded. Tapping the curtains opens them in two steps
(closed, halfway, open) and starts the film; a tap while it plays pauses it; when the film ends the curtains close again; Back
returns to the main room. The film itself is not fetched here: requests to the Internet Archive are blocked and play() is
stubbed, so the test needs no connection. A picture goes to tests/screenshots/movieroom/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "movieroom")
fails = []
def check(name, ok, got=""):
    print(("ok   " if ok else "FAIL ") + name + ("" if ok else "  got: " + str(got)))
    if not ok: fails.append(name)

async def main():
    os.makedirs(OUT, exist_ok=True); serve()
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1670, "height": 942}); await ctx.add_init_script(VIRTUAL_TIME)
        asked = []
        await ctx.route("**://archive.org/**", lambda r: (asked.append(r.request.url), asyncio.ensure_future(r.abort())))
        pg = await ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html?test"); await pg.wait_for_function('typeof LOADED!=="undefined"&&LOADED', timeout=20000)
        await pg.evaluate("()=>{localStorage.clear();const s=fresh();Object.assign(s,{started:true,id:1,day:3,stage:6,species:4,dayT:.3});localStorage.setItem(KEY,JSON.stringify(s));}")
        await pg.reload(); await pg.wait_for_function('typeof LOADED!=="undefined"&&LOADED', timeout=20000)
        btn = pg.locator(".screen button").first
        if await btn.count(): await btn.click()
        await pg.evaluate("()=>{__step(1);openMovieRoom();}")
        await pg.wait_for_function("()=>{const i=document.querySelector('.mvroom');return i&&i.complete&&i.naturalWidth>0;}")
        r = await pg.evaluate("()=>{const v=document.querySelector('.mvstage video'),c=document.querySelector('.mvcurtain');return {open:movieRoomOpen(),state:mvState,src:v.getAttribute('src'),muted:v.muted,cur:c.getAttribute('src'),hidden:c.hidden};}")
        check("the room opens with its curtains closed and no film loaded", r["open"] and r["state"] == "closed" and not r["src"] and r["cur"].endswith("curtain_closed.png") and not r["hidden"], r)
        check("nothing is asked of the Internet Archive on entering", not asked, asked)
        await pg.screenshot(path=os.path.join(OUT, "curtains_closed.png"))
        # the screen sits where the picture's screen is
        g = await pg.evaluate("()=>{const s=document.querySelector('.mvstage').getBoundingClientRect(),v=document.querySelector('.mvstage video').getBoundingClientRect();return [(v.left-s.left)/s.width*1670,(v.top-s.top)/s.height*941,v.width/s.width*1670,v.height/s.height*941];}")
        check("the film sits behind the picture's screen", abs(g[0]-428) < 2 and abs(g[1]-117) < 2 and abs(g[2]-816) < 2 and abs(g[3]-468) < 2, g)
        r = await pg.evaluate("()=>{const v=document.querySelector('.mvstage video');window.__plays=0;v.play=()=>{window.__plays++;Object.defineProperty(v,'paused',{value:false,configurable:true});return Promise.resolve();};v.pause=()=>{Object.defineProperty(v,'paused',{value:true,configurable:true});};"
                              "document.querySelector('.mvtap').click();const a=mvState;__step(.1);const b=mvState;__step(.4);return {a,b,c:mvState,plays:window.__plays,src:v.getAttribute('src'),hidden:document.querySelector('.mvcurtain').hidden,muted:v.muted,note:document.querySelector('.mvnote').textContent};}")
        check("a tap opens the curtains in two steps and starts the film", r["a"] == "half" and r["b"] == "half" and r["c"] == "open" and r["plays"] == 1 and r["hidden"], r)
        check("the film comes from the Internet Archive and plays muted", r["src"].startswith("https://archive.org/download/") and r["muted"], r)
        check("the film's name shows", "A Trip to the Moon" in r["note"], r)
        r = await pg.evaluate("()=>{const v=document.querySelector('.mvstage video'),t=document.querySelector('.mvtap');t.click();const a=v.paused;t.click();return {a,b:v.paused,state:mvState};}")
        check("a tap pauses the film and another goes on", r["a"] is True and r["b"] is False and r["state"] == "open", r)
        r = await pg.evaluate("()=>{const v=document.querySelector('.mvstage video');v.dispatchEvent(new Event('ended'));const a=mvState;__step(.5);const c=document.querySelector('.mvcurtain');return {a,b:mvState,cur:c.getAttribute('src'),hidden:c.hidden};}")
        check("when the film ends the curtains close", r["a"] == "half" and r["b"] == "closed" and r["cur"].endswith("curtain_closed.png") and not r["hidden"], r)
        r = await pg.evaluate("()=>{document.querySelector('.mvback').click();return {open:movieRoomOpen(),left:!!document.querySelector('.movieroom')};}")
        check("Back returns to the main room", not r["open"] and not r["left"], r)
        check("no page errors", not errs, errs[:3])
        await b.close()
    print("\n%d failed" % len(fails) if fails else "\nall passed"); sys.exit(1 if fails else 0)

asyncio.run(main())
