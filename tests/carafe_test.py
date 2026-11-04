"""Carrying the carafe: mirrored for right-handed play, left-handed setting flips it back.

Run from the repository root:  python tests/carafe_test.py
On an iPhone 13 held sideways (touch), for a kid and for an adult: pick up the carafe and check that the tilt and pour
frames are drawn mirrored (spout on the left), that the carafe sits up and to the left of the finger, that tapping
with the spout over the plant waters it (drops land under the spout), and that a tap with only the finger on the plant
but the spout off it doesn't pour. Then the journal's left-handed setting: frames not mirrored, carafe up and to the
right of the finger, spout on the right, watering still works. Screenshots of each pour go to tests/screenshots/carafe/.
Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "carafe")
BASE = "s.dayT=.3;s.mode='actions';s.curtain='open';s.giftSeed=1;s.others=[];s.pref='shade';s.needs={thirst:.7,hunger:0,attention:0};"
PLANTS = {
    "kid": BASE + "s.stage=4;s.species=7;s.place={baby:'books'};",
    "adult": BASE + "s.stage=8;s.species=3;s.free={x:1100,y:900};",
}
SPY = "()=>{if(window._spy)return;window._spy=1;const o=drawCarried;drawCarried=function(...a){window._dc={src:a[0]&&a[0].src.split('/').pop(),x:a[1],y:a[2],flip:!!a[4]};return o.apply(this,a);};}"
# a finger position that puts the stream's end on the plant, a third of the way down
AIM = "()=>{const b=plantBox(),d=pourPoint(0,0,depthK(plantDepth()));return {x:b.x+b.w/2-d.x,y:b.y+b.h*.3-d.y};}"
CLIP = "([x,y])=>{const r=cv.getBoundingClientRect(),b=plantBox(),x0=Math.min(x-200,b.x-40),x1=Math.max(x+120,b.x+b.w+40),y0=Math.min(y-200,b.y-60),y1=Math.max(y+60,baseY()+20);return {x:r.left+Math.max(0,x0)*S,y:r.top+Math.max(0,y0)*S,width:(Math.min(1670,x1)-Math.max(0,x0))*S,height:(Math.min(942,y1)-Math.max(0,y0))*S};}"


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    def check(ok, msg):
        if not ok:
            fails.append(msg)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, save in PLANTS.items():
            ctx = await b.new_context(**p.devices["iPhone 13 landscape"])
            await ctx.add_init_script(VIRTUAL_TIME)
            pg = await ctx.new_page()
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
            await pg.evaluate("()=>{const s=fresh();s.started=true;" + save + "localStorage.setItem(KEY,JSON.stringify(s));}")
            await pg.reload(wait_until="load")
            await pg.tap(".screen button")
            await pg.evaluate("()=>__step(8)")
            await pg.evaluate(SPY)

            async def tap(x, y):  # a finger tap at game coordinates
                c = await pg.evaluate(f"()=>{{const r=cv.getBoundingClientRect();return [r.left+{x}*S,r.top+{y}*S];}}")
                await pg.touchscreen.tap(c[0], c[1])
                await pg.evaluate("()=>__step(.2)")

            async def hold_at(x, y):  # the finger rests here while carrying
                await pg.evaluate(f"()=>{{mx={x};my={y};__step(.1);}}")
                return await pg.evaluate("()=>window._dc")

            async def pick_up():
                await tap(830, 550)  # the carafe on the stool
                check(await pg.evaluate("()=>held.tool") == "can", f"{name}: tapping the carafe didn't pick it up")

            for hand in ("right", "left"):
                if hand == "left":  # the journal setting
                    await pg.evaluate("()=>openJournal()")
                    await pg.locator(".screen button", has_text="left-handed").tap()
                    await pg.evaluate("()=>__step(.2)")
                    check(await pg.evaluate("()=>st.leftHand===true"), f"{name}: the left-handed setting didn't save")
                    check("✓ left-handed" in await pg.locator(".screen").inner_text(), f"{name}: the journal doesn't show left-handed as chosen")
                    await pg.locator(".screen button", has_text="Close").tap()
                    await pg.evaluate("()=>__step(.2)")
                    await pg.evaluate("()=>{st.needs.thirst=.7;}")
                mirrored = hand == "right"

                # away from the plant: the tilt frame, up and to the side of the finger
                await pick_up()
                dc = await hold_at(400, 300)
                check(dc and dc["src"] == "carafe_tilt.png", f"{name}/{hand}: not the tilt frame away from the plant: {dc}")
                check(dc and dc["flip"] == mirrored, f"{name}/{hand}: tilt frame mirrored={dc and dc['flip']}, expected {mirrored}")
                check(dc and dc["y"] < 300 and ((dc["x"] < 400) if mirrored else (dc["x"] > 400)),
                      f"{name}/{hand}: carafe not up and to the {'left' if mirrored else 'right'} of the finger: {dc}")

                # the spout over the plant: the pour frame, and a tap waters it
                aim = await pg.evaluate(AIM)
                dc = await hold_at(aim["x"], aim["y"])
                if not dc:
                    fails.append(f"{name}/{hand}: nothing carried"); break
                check(dc and dc["src"] == "carafe_pour.png" and dc["flip"] == mirrored, f"{name}/{hand}: not the {'mirrored ' if mirrored else ''}pour frame over the plant: {dc}")
                sp = await pg.evaluate(f"()=>pourPoint({aim['x']},{aim['y']},holdK({aim['x']},{aim['y']}))")
                check((sp["x"] < dc["x"]) if mirrored else (sp["x"] > dc["x"]), f"{name}/{hand}: the spout is on the wrong side ({sp} vs carafe {dc})")
                await pg.wait_for_timeout(300)
                await pg.screenshot(path=os.path.join(OUT, f"{name}_{hand}_pouring.png"), clip=await pg.evaluate(CLIP, [aim["x"], aim["y"]]))
                print(f"{name}/{hand}: finger at {aim['x']:.0f},{aim['y']:.0f} ({'on' if await pg.evaluate(f'()=>onPlant({aim["x"]},{aim["y"]})') else 'off'} the plant), spout at {sp['x']:.0f},{sp['y']:.0f}")
                await tap(aim["x"], aim["y"])
                r = await pg.evaluate("()=>({th:st.needs.thirst,tool:held.tool,drops:parts.filter(q=>q.k==='drop').map(q=>q.x)})")
                check(r["th"] < .01 and r["tool"] is None, f"{name}/{hand}: tapping with the spout over the plant didn't water it: {r}")
                check(r["drops"] and all(abs(x - sp["x"]) < 80 for x in r["drops"]), f"{name}/{hand}: drops don't fall under the spout ({sp['x']:.0f}): {r['drops']}")
                await pg.evaluate("()=>__step(3)")

                # finger on the plant but the spout off it: no pour
                await pg.evaluate("()=>{st.needs.thirst=.7;}")
                await pick_up()
                bx = await pg.evaluate("()=>{const b=plantBox();return {x:b.x+b.w/2,y:b.y+b.h*.5,w:b.w};}")
                fx = bx["x"] + (bx["w"] / 2 if mirrored else -bx["w"] / 2)  # the plant's edge on the side away from the spout
                off = not await pg.evaluate(f"()=>pourOver({fx},{bx['y']},depthK(plantDepth()))")
                if off:
                    await tap(fx, bx["y"])
                    check(await pg.evaluate("()=>st.needs.thirst") == .7, f"{name}/{hand}: poured although the spout was off the plant")
                else:
                    await pg.evaluate("()=>{held.tool=null;}")
                print(f"{name}/{hand}: spout off the plant with the finger on its far edge: {'checked' if off else 'n/a (the spout still reaches it)'}")
            fails += [f"{name}: page error: {e}" for e in errs]
            await ctx.close()
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("saved to tests/screenshots/carafe/")
    if fails:
        sys.exit(1)
    print("PASS: the carafe pours from the left for right-handed play, from the right when left-handed")


if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    asyncio.run(main())
