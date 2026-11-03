"""Needs show only on the monster, and the rare idle wiggle (RULES.md 10): screenshots and checks.

Run from the repository root:  python tests/needs_shots.py
1. One plant (a shade-loving adult) in every need state, step by step: withered (too dark), burned (too much light),
   gray (thirsty), puddle (overwatered). Each must reach its steps and heal in steps once the need is met.
2. The idle wiggle: 40 minutes of game time untouched must give a few wiggles, at least 150 s apart, only on usable
   things (never books); 20 minutes of touching must give none. Plus a sheet of everything that can wiggle.
Pictures go to tests/screenshots/needs/ (the four states, contact_sheet.png, wiggle_items.png). Exit code 1 on a failed check.
"""
import asyncio, base64, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "needs")
BASE = "s.mode='actions';s.giftSeed=1;s.others=[];s.stage=8;s.species=3;s.pref='shade';"
DARK = BASE + "s.dayT=.8;s.curtain='closed';s.lamp=false;s.desk=false;s.free={x:1250,y:918};"  # dusk, curtains closed, lamps off
SUN = BASE + "s.dayT=.37;s.curtain='open';s.free={x:470,y:852};"  # midday in the window's sun patch
FINE = BASE + "s.dayT=.3;s.curtain='open';s.free={x:1250,y:860};"
LIGHT_WORDS = ("light", "bright", "dark", "sun", "shad", "lamp", "flame", "curtain", "scoot")
CLIP = "()=>{const b=plantBox(),x=Math.max(0,b.x-60),y=Math.max(0,b.y-60);return {x,y,width:Math.min(1670-x,b.w+120),height:Math.min(942-y,b.h+110)};}"


async def page_for(b, save):
    ctx = await b.new_context(viewport={"width": 1670, "height": 942})
    await ctx.add_init_script(VIRTUAL_TIME)
    pg = await ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
    await pg.evaluate("()=>{const s=fresh();s.started=true;" + save + "localStorage.setItem(KEY,JSON.stringify(s));}")
    await pg.reload(wait_until="load")
    await pg.click(".screen button")  # Continue
    await pg.evaluate("()=>{window.__said=[];const o=say;say=(t,...a)=>{__said.push(t);return o(t,...a);};}")  # every caption from here on
    return ctx, pg, errs


async def no_light_text(pg, fails, label):
    """Light shows only on the plant: no caption may talk about light."""
    said = await pg.evaluate("()=>__said")
    bad = [t for t in said if any(w in t.lower() for w in LIGHT_WORDS)]
    if bad: fails.append(f"{label}: light caption in play: {bad[0][:80]}")


async def shot(pg, name, full=False):
    await pg.wait_for_timeout(700)  # the caption's fade-out runs on real time
    path = os.path.join(OUT, name + ".png")
    await pg.screenshot(path=path, clip=None if full else await pg.evaluate(CLIP))
    return name + ".png"


async def heals(pg, key, fix, start, fails, label):
    """After the fix, the level must come down one step every half second."""
    await pg.evaluate("()=>{" + fix + "}")
    seen = []
    for _ in range(start + 1):
        await pg.evaluate("()=>__step(.25)")
        seen.append(await pg.evaluate(f"()=>st.{key}||0"))
        await pg.evaluate("()=>__step(.25)")
    if seen != list(range(start, -1, -1)):
        fails.append(f"{label} heals {seen}, expected {list(range(start, -1, -1))}")


async def states(b, fails, rows, heads):
    # withered: too dark for a while, 3 steps
    ctx, pg, errs = await page_for(b, DARK)
    row, t = [], 0
    for lv, at in ((1, 4), (2, 16), (3, 31)):  # game seconds at speed 2 (steps at 3, 15, 30 s)
        await pg.evaluate(f"()=>__step({at - t})"); t = at
        got = await pg.evaluate("()=>st.witherLv")
        if got != lv: fails.append(f"withered at {at}s: level {got}, expected {lv}")
        row.append(await shot(pg, f"withered_{lv}"))
    heads.append(await shot(pg, "state_withered", full=True))
    await heals(pg, "witherLv", "st.curtain='open';st.dayT=.3;", 3, fails, "withered")
    await no_light_text(pg, fails, "withered"); rows.append(("withered (too dark)", row)); fails += errs; await ctx.close()

    # burned: too much light for a while, 3 steps
    ctx, pg, errs = await page_for(b, SUN)
    row, t = [], 0
    for lv, at in ((1, 21), (2, 31), (3, 41)):  # steps at 20, 30, 40 s; a grown plant would scoot off at 45 s
        await pg.evaluate(f"()=>__step({at - t})"); t = at
        await pg.evaluate("()=>{for(let i=0;i<60&&!squinting();i++)__step(.05)}")  # land on a squinting frame
        got = await pg.evaluate("()=>st.burnLv")
        if got != lv: fails.append(f"burned at {at}s: level {got}, expected {lv}")
        row.append(await shot(pg, f"burned_{lv}"))
    if await pg.evaluate("()=>st.glare===2"): fails.append("a shade plant got the flame (only the extreme case should)")
    heads.append(await shot(pg, "state_burned", full=True))
    await heals(pg, "burnLv", "st.free={x:1250,y:918};st.walk=null;", 3, fails, "burned")
    await no_light_text(pg, fails, "burned"); rows.append(("burned (too much light)", row)); fails += errs; await ctx.close()

    # gray: thirsty, comes on gradually (16 tiny levels between thirst .45 and .9) and the color returns smoothly over 2 s
    ctx, pg, errs = await page_for(b, FINE)
    await pg.evaluate("()=>__step(8)")
    row = []
    for th in (.5, .65, .8, .95):
        want = min(16, int(max(0, (th - .45) / .45) * 16)) / 4
        got = await pg.evaluate(f"()=>{{st.needs.thirst={th};__step(.1);return st.dryLv;}}")
        if abs(got - want) > 1e-6: fails.append(f"gray at thirst {th}: level {got}, expected {want}")
        row.append(await shot(pg, f"gray_{th}"))
    heads.append(await shot(pg, "state_gray", full=True))
    await pg.evaluate("()=>{held.tool='can';useTool();}")
    seen = []
    for _ in range(10):
        await pg.evaluate("()=>__step(.25)"); seen.append(await pg.evaluate("()=>st.dryLv||0"))
    if seen[-1] != 0 or any(b > a or a - b > .5 for a, b in zip([4] + seen, seen)):
        fails.append(f"gray heals {seen}: expected a smooth return to 0 (at most half a level per quarter second)")
    rows.append(("gray (thirsty)", row)); fails += errs; await ctx.close()

    # puddle: overwatered, dries in 3 steps over 30 s
    ctx, pg, errs = await page_for(b, FINE)
    await pg.evaluate("()=>{__step(8);st.needs.thirst=0;held.tool='can';useTool();__step(.5);}")
    row = []
    for lv in (3, 2, 1):
        got = await pg.evaluate("()=>[st.puddleLv,droopOff()>0]")
        if got[0] != lv: fails.append(f"puddle level {got[0]}, expected {lv}")
        if lv >= 1 and not got[1]: fails.append(f"no soggy droop at puddle level {lv}")
        row.append(await shot(pg, f"puddle_{lv}"))
        if lv == 3: heads.append(await shot(pg, "state_puddle", full=True))
        await pg.evaluate("()=>__step(10)")
    if await pg.evaluate("()=>st.puddleLv") != 0: fails.append("puddle did not dry up")
    rows.append(("puddle (too much water)", row)); fails += errs; await ctx.close()


async def wiggles(b, fails):
    ctx, pg, errs = await page_for(b, FINE)
    await pg.evaluate("()=>__step(40*60,250)")  # 40 minutes untouched, quarter-second frames
    log = await pg.evaluate("()=>idleLog.map(e=>[e.n,e.t])")
    names = await pg.evaluate("()=>IDLE_ITEMS.map(i=>i.n)")
    gaps = [round((log[i][1] - log[i - 1][1]) / 1000) for i in range(1, len(log))]
    print(f"idle wiggles in 40 min untouched: {len(log)} ({', '.join(n for n, _ in log)}); gaps {gaps} s")
    if not 4 <= len(log) <= 16: fails.append(f"{len(log)} idle wiggles in 40 minutes (expected a few)")
    if gaps and min(gaps) < 150: fails.append(f"two idle wiggles only {min(gaps)} s apart")
    if any("book" in n for n in names): fails.append("a book is in the idle wiggle list")
    if await pg.evaluate("()=>IDLE_FRAMES.some(v=>Math.abs(v)>1)||IDLE_FRAMES.length>4"): fails.append("idle wiggle is more than 1 px or a couple of frames")
    n0 = len(log)
    await pg.evaluate("()=>{pointerHeld=true;__step(20*60,250);}")  # 20 minutes touching
    if await pg.evaluate("()=>idleLog.length") != n0: fails.append("an idle wiggle happened while touching")
    fails += errs
    # what moves for each item: the item's pixels on magenta (left) next to the room (right)
    tiles = await pg.evaluate("""()=>{const rm=ROOMS[timeKey()],out=[];for(const it of IDLE_ITEMS){
      const c=document.createElement('canvas');c.width=it.w*2+12;c.height=it.h;const x=c.getContext('2d');x.fillStyle='#ff00ff';x.fillRect(0,0,it.w,it.h);
      if(it.k==='plain')x.drawImage(rm,it.x,it.y,it.w,it.h,0,0,it.w,it.h);else{const p=fgPiece(rm,it.x,it.y,it.w,it.h,it.k);if(p)x.drawImage(p,0,0);}
      x.drawImage(rm,it.x,it.y,it.w,it.h,it.w+12,0,it.w,it.h);out.push([it.n,c.toDataURL()]);}return out;}""")
    await ctx.close()
    return tiles


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails, rows, heads = [], [], []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        await states(b, fails, rows, heads)
        tiles = await wiggles(b, fails)
        cell = lambda f: f"<img src='{f}' style='height:260px;display:block'>"
        html = ("<body style='margin:0;padding:8px;background:#19101b;color:#fdebc9;font:15px monospace'>"
                + "".join(f"<div style='margin:6px 0'>{n}</div><div style='display:flex;gap:6px'>{''.join(cell(f) for f in r)}</div>" for n, r in rows))
        open(os.path.join(OUT, "contact.html"), "w").write(html)
        pg = await b.new_page(viewport={"width": 1500, "height": 600})
        await pg.goto(f"http://localhost:{PORT}/tests/screenshots/needs/contact.html", wait_until="load")
        await pg.screenshot(path=os.path.join(OUT, "contact_sheet.png"), full_page=True)
        html = ("<body style='margin:0;padding:8px;background:#19101b;color:#fdebc9;font:14px monospace'><div style='display:flex;flex-wrap:wrap;gap:14px;align-items:flex-end'>"
                + "".join(f"<div><img src='{u}' style='max-height:240px;display:block'>{n}</div>" for n, u in tiles) + "</div>")
        await pg.set_content(html)
        await pg.screenshot(path=os.path.join(OUT, "wiggle_items.png"), full_page=True)
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("saved to tests/screenshots/needs/")
    if fails:
        sys.exit(1)
    print("PASS: every need shows on the plant in steps and heals in steps; idle wiggles are rare, 1 px, never while touching")


if __name__ == "__main__":
    asyncio.run(main())
