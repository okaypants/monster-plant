"""Everything you can touch in the room does something of its own (js/fidgets.js, fidgetDo).

Run from the repository root:  python3 tests/doodad_test.py
Taps each doodad on a phone held sideways and checks its own small thing happens: coins from the jar, notes from the
music box, the journal's Keep it safe page from the lockbox, a record from the crate, a butterfly, the moon, the sun's sign,
hearts, petals, drops, the snail trundling sideways (never up into the shelf), and the stool and desk chair wobbling.
Pictures go to tests/screenshots/doodads/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "doodads")
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:1,day:3,dayT:.3,giftSeed:1,mode:'actions',"
        "catTrust:.1,free:{x:520,y:918},name:'Zib Wigglebottom'});localStorage.setItem(KEY,JSON.stringify(s));}")
TAP = "(n)=>{const p=FP.find(p=>p.n===n);capClear();fBits.length=0;const hit=fidgetPoke(p.x+p.w/2+6,p.y+p.h/2);return hit}"


async def main():
    fails = []
    def check(ok, msg):
        if not ok:
            fails.append(msg)
    serve()
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(**p.devices["iPhone 13 landscape"])
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate(SAVE)
        await pg.reload(wait_until="load")
        await pg.click(".screen button[data-k=go]")
        await pg.evaluate("()=>{__step(2);capClear();}")
        names = await pg.evaluate("()=>FP.map(p=>p.n)")
        check(all(n in names for n in ["crate", "stool", "deskchair"]), f"the crate, the stool and the desk chair should be touchable: {names}")
        own = await pg.evaluate("()=>FP.filter(p=>!p.does&&!p.scoot&&!p.puff).map(p=>p.n)")
        check(set(own) <= {"pillow", "drum", "radio", "bookstack", "petbed", "cratebook", "moonbox", "stool", "deskchair"}, f"only furniture and things with their own app or books should be bounce-only: {own}")
        for n, kind in [("box1", "coin"), ("box2", "note"), ("butterflies", "fly"), ("catpic", "heart"), ("flowerpic", "petal"), ("glass", None)]:
            await pg.evaluate(TAP, n)
            bits = await pg.evaluate("(k)=>fBits.filter(b=>!k||b[k]).length", kind)
            check(bits >= 1, f"tapping {n} should send out its own little things, got {bits}")
            await pg.evaluate("()=>__step(.25)")
            await pg.screenshot(path=os.path.join(OUT, n + ".png"), clip=await pg.evaluate("(n)=>{const p=FP.find(p=>p.n===n),r=cv.getBoundingClientRect();return {x:r.left+(p.x-90)*S,y:r.top+Math.max(0,p.y-110)*S,width:(p.w+180)*S,height:(p.h+200)*S}}", n))
            await pg.evaluate("()=>__step(4)")
        # coins land on the shelf and stay on it for a while
        await pg.evaluate(TAP, "box1")
        await pg.evaluate("()=>__step(1.2)")
        r = await pg.evaluate("()=>{const p=FP.find(p=>p.n==='box1');return fBits.every(b=>b.y<=p.y+p.h-9)}")
        check(r, "the coins should bounce on the shelf, not fall through it")
        for n, want in [("moonpanel", "tonight"), ("armillary", "The sun is in ")]:
            await pg.evaluate(TAP, n)
            await pg.evaluate("()=>__step(.3)")
            cap = await pg.evaluate("()=>capText.textContent")
            check(want in cap, f"tapping {n} should say something true about the sky: {cap!r}")
            await pg.evaluate("()=>{__step(5);capClear()}")
        # the snail: sideways along its shelf and back, never up
        await pg.evaluate(TAP, "snail")
        track = await pg.evaluate("()=>{const p=FP.find(p=>p.n==='snail'),o=[];for(let i=0;i<30;i++){__step(.05);o.push([p.ox,p.oy])}__step(2);o.push([p.ox,p.oy]);return o}")
        check(max(t[0] for t in track) == 10 and all(t[1] == 0 for t in track) and track[-1] == [0, 0], f"the snail should trundle 10 to the right and come back, without leaving the shelf: {track[:12]}")
        for n in ["stool", "deskchair", "crate"]:
            await pg.evaluate(TAP, n)
            await pg.evaluate("()=>__step(.05)")
            check(await pg.evaluate("(n)=>{const p=FP.find(p=>p.n===n);return !!(p.vx||p.vy||p.ox||p.oy)}", n), f"{n} should wobble when tapped")
        await pg.evaluate("()=>__step(.2)")
        await pg.screenshot(path=os.path.join(OUT, "wobble.png"), clip=await pg.evaluate("()=>{const r=cv.getBoundingClientRect();return {x:r.left+700*S,y:r.top+480*S,width:720*S,height:320*S}}"))
        check(await pg.evaluate("()=>radio.on&&radio.band==='crates'"), "tapping the crate should put a record on the radio")
        await pg.evaluate("()=>{radioOff(false);__step(2);capClear()}")
        # the lockbox opens the journal at Keep it safe
        await pg.evaluate(TAP, "lockbox")
        await pg.evaluate("()=>__step(.6)")
        check(await pg.evaluate("()=>!!jEl&&jPage==='safe'"), "tapping the lockbox should open the journal at Keep it safe")
        await pg.evaluate("()=>capClear()")
        await pg.screenshot(path=os.path.join(OUT, "lockbox.png"))
        fails += [f"page error: {e}" for e in errs]
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS doodad_test" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
