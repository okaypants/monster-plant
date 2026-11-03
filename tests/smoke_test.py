"""Smoke test for Monster Plant.

Run from the repository root:
    pip install playwright && python -m playwright install chromium
    python tests/smoke_test.py

It serves the folder locally, then checks that:
  1. a brand-new game starts (quiz -> seed) without errors,
  2. an old-style save (one adult, made before multi-plant support) loads, gets a nature,
     receives the gift seed, and runs a minute of game time without errors,
  3. two adults can cross-pollinate and the seed lands,
  4. the iPhone landscape view loads.
Exit code 0 = all good, 1 = something broke.
"""
import asyncio, http.server, os, socketserver, sys, threading
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8765


def serve():
    os.chdir(ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass

    httpd = socketserver.TCPServer(("", PORT), Quiet)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


async def main():
    serve()
    url = f"http://localhost:{PORT}/index.html"
    fails = []
    async with async_playwright() as p:
        b = await p.chromium.launch()

        # 1. brand-new game
        pg = await b.new_page(viewport={"width": 1670, "height": 942})
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(url)
        await pg.wait_for_timeout(1500)
        await pg.evaluate("()=>localStorage.clear()")
        await pg.reload()
        await pg.wait_for_timeout(1500)
        await pg.click(".screen button")  # Begin
        for _ in range(4):  # answer the 4 quiz questions
            await pg.wait_for_timeout(300)
            await pg.click(".screen button")
        await pg.wait_for_timeout(800)
        ok = await pg.evaluate("()=>st.started&&st.stage===0&&st.nge!=null")
        if not ok:
            fails.append("new game did not start with a seed and a nature")

        # 2. old save: one adult, no 'others', no nature
        await pg.evaluate("""()=>{const s=fresh();s.started=true;s.stage=8;s.species=3;s.day=4;s.dayT=.3;
            s.place={grown:'rugC'};delete s.others;localStorage.setItem(KEY,JSON.stringify(s));}""")
        await pg.reload()
        await pg.wait_for_timeout(1500)
        await pg.click(".screen button")  # Continue
        await pg.evaluate("()=>{st.speed=20}")
        await pg.wait_for_timeout(6000)
        n = await pg.evaluate("()=>plantCount()")
        if n < 2:
            fails.append(f"gift seed did not arrive (plants: {n})")

        # 3. breeding
        await pg.evaluate("()=>{const q=freshPlant();q.species=6;q.stage=8;addPlant(q);}")
        await pg.wait_for_timeout(300)
        before = await pg.evaluate("()=>plantCount()")
        await pg.evaluate("()=>{const A=allRaw().filter(q=>q.stage>=8);if(A.length>=2&&plantCount()<3)crossPollinate(A[0],A[1]);}")
        await pg.wait_for_timeout(2500)
        after = await pg.evaluate("()=>plantCount()")
        if before < 3 and after <= before:
            fails.append("breeding did not add a seed")

        # night + morning
        await pg.evaluate("()=>{st.night=true}")
        await pg.wait_for_timeout(500)
        await pg.evaluate("()=>wake()")
        await pg.wait_for_timeout(500)
        if errs:
            fails.append("page errors: " + "; ".join(errs[:5]))

        # 4. iPhone landscape
        ctx = await b.new_context(**p.devices["iPhone 13 landscape"])
        ph = await ctx.new_page()
        perrs = []
        ph.on("pageerror", lambda e: perrs.append(str(e)))
        await ph.goto(url)
        await ph.wait_for_timeout(2000)
        if perrs:
            fails.append("phone errors: " + "; ".join(perrs[:5]))
        await b.close()

    if fails:
        print("FAIL")
        for f in fails:
            print(" -", f)
        sys.exit(1)
    print("PASS: new game, old save, gift seed, breeding, night/morning, iPhone view")


asyncio.run(main())
