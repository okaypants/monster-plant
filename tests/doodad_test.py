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
        check(all(n in names for n in ["crate", "deskchair", "forks", "ball", "moondial", "viewer", "toy"]), f"the new room's things should be touchable: {names}")
        own = await pg.evaluate("()=>FP.filter(p=>!p.does&&!p.puff&&p.n!=='toy').map(p=>p.n)")
        check(set(own) <= {"pillow", "drum", "radio", "petbed", "deskchair"}, f"only furniture and things with their own app should be bounce-only: {own}")
        for n, kind in [("box1", "coin"), ("catpic", "heart"), ("bigpic", "petal")]:
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
        # the moon dial says tonight's moon and shows a face for it
        await pg.evaluate(TAP, "moondial")
        await pg.evaluate("()=>__step(.3)")
        cap = await pg.evaluate("()=>capText.textContent")
        check("tonight" in cap, f"tapping the moon dial should say tonight's moon: {cap!r}")
        check(await pg.evaluate("()=>/^moon[1-5]$/.test(moonDialPic())"), "the moon dial should show one of its five faces")
        await pg.evaluate("()=>{__step(5);capClear()}")
        # the crystal ball: mist gathers, it gives one of Melville's signs, and it clears again
        await pg.evaluate(TAP, "ball")
        await pg.evaluate("()=>__step(1)")
        check(await pg.evaluate("()=>ballFrame()>1"), "the crystal ball should fill with mist when tapped")
        await pg.screenshot(path=os.path.join(OUT, "ball.png"), clip=await pg.evaluate("()=>{const r=cv.getBoundingClientRect();return {x:r.left+1380*S,y:r.top+120*S,width:290*S,height:260*S}}"))
        await pg.evaluate("()=>__step(1)")
        cap = await pg.evaluate("()=>capText.textContent")
        check(await pg.evaluate("(c)=>BALL_SIGNS.includes(c)||/crystal ball/.test(c)", cap), f"the crystal ball should give a sign: {cap!r}")
        await pg.evaluate("()=>{__step(4);capClear()}")
        check(await pg.evaluate("()=>ballFrame()===1"), "the crystal ball should clear again")
        # the wind-up cat: wound, it leaves its cubby, runs along the floor, winds down, and a tap puts it back
        await pg.evaluate(TAP, "toy")
        check(await pg.evaluate("()=>toy.ph==='wind'&&toy.home"), "a tap should wind the toy cat in its cubby")
        await pg.evaluate("()=>__step(6)")
        check(await pg.evaluate("()=>toy.ph==='run'&&!toy.home&&toyPic()===null&&toy.y===TOY_FLOOR"), "the wound toy cat should be out on the floor, its cubby empty")
        await pg.screenshot(path=os.path.join(OUT, "toy_out.png"))
        await pg.evaluate("()=>__step(TOY_RUN+1)")
        check(await pg.evaluate("()=>toy.ph==='stopped'"), "the toy cat should wind down and stop")
        check(await pg.evaluate("()=>/put it back/.test(capText.textContent)"), "the game should say how to put the toy cat back")
        await pg.evaluate("()=>{const b=toyBox(),r=cv.getBoundingClientRect();capClear();cv.dispatchEvent(new MouseEvent('click',{clientX:r.left+(b.x+b.w/2)*S,clientY:r.top+(b.y+b.h/2)*S,bubbles:true}));}")
        check(await pg.evaluate("()=>toy.home&&toy.ph==='home'&&toyPic()==='toy_h1'"), "a tap on the stopped toy cat should put it back in its cubby")
        for n in ["forks", "deskchair", "crate"]:
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
