"""Seasonal items (Jackie, Nov 15): autumn leaves past the window, the pumpkin (autumn) and the tree (winter) on the book stack.

Run from the repository root:  python3 tests/seasonal_shots.py
Pictures to tests/screenshots/seasonal/ (plus sheet.png, the book stack and window up close).
Checks: falling leaves show only through the glass (never on the bars, curtains or armchair), only in autumn and never at night;
the pumpkin is out in autumn with the same face day and night, rocks when tapped and settles back; the tree is out in winter, sways and its
ornaments swing when tapped; nothing seasonal in spring or summer; a plant on the book stack gets the stack (the item makes room);
every frame is drawn on whole pixels. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "seasonal")
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:1,day:3,dayT:.15,night:false,giftSeed:1,mode:'actions',curtain:'open',"
        "catTrust:.1,free:{x:1250,y:918},name:'Zib Wigglebottom'});localStorage.setItem(KEY,JSON.stringify(s));}")
STACK = (850, 440, 1100, 680)  # the book stack and what sits on it, for close-ups
WINDOW = (300, 80, 590, 530)
# draw the room twice without time passing: with the leaves, then without; return how many changed pixels fall outside the glass
LEAF_CHECK = """()=>{sLeafNext=1e15;const L=[];for(let i=0;i<6;i++)L.push({im:LEAVES[i],x:10+i*38,y:30+i*60,vy:0,a:0,w:0,ph:0});sLeaves=L;
 draw();const a=g.getImageData(GLASS_AT.x,GLASS_AT.y,GLASS_W,GLASS_H).data;sLeaves=[];draw();const b=g.getImageData(GLASS_AT.x,GLASS_AT.y,GLASS_W,GLASS_H).data;
 const c=document.createElement('canvas');c.width=GLASS_W;c.height=GLASS_H;const x=c.getContext('2d');x.drawImage(GLASS,0,0);const m=x.getImageData(0,0,GLASS_W,GLASS_H).data;
 let inside=0,outside=0;for(let i=0;i<a.length;i+=4){if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]){if(m[i+3])inside++;else outside++;}}sLeafNext=0;return [inside,outside];}"""
STACK_PX = "()=>Array.from(g.getImageData(910,430,124,225).data).filter((v,i)=>i%4!==3)"  # just the pumpkin or the tree


def diff(a, b):
    return sum(abs(x - y) for x, y in zip(a, b)) / max(1, len(a))


async def main():
    fails = []
    def check(ok, msg):
        if not ok:
            fails.append(msg)
    serve()
    os.makedirs(OUT, exist_ok=True)
    shots = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1670, "height": 942})
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate(SAVE)
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        await pg.evaluate("()=>{__step(3);capClear();}")

        async def shot(name, title):
            path = os.path.join(OUT, name + ".png")
            await pg.screenshot(path=path)
            shots.append((title, path))

        async def tap(x, y):  # a tap at game coordinates
            await pg.evaluate("()=>{closeBubble();capClear();}")
            c = await pg.evaluate(f"()=>{{const r=cv.getBoundingClientRect();return [r.left+{x}*S,r.top+{y}*S];}}")
            await pg.mouse.click(c[0], c[1])

        async def at(season, day=True):
            await pg.evaluate("([s,d])=>{SEASON_OVERRIDE=s;st.night=!d;st.dayT=d?.15:.95;st.curtain='open';idleNext=1e15;capClear();__step(2);capClear();__step(.05);}", [season, day])

        # autumn daytime: leaves fall through the glass only
        await at("autumn")
        check(await pg.evaluate("()=>seasonItem()") == "pumpkin", "autumn: no pumpkin on the book stack")
        inside, outside = await pg.evaluate(LEAF_CHECK)
        check(inside > 500, f"autumn: the leaves barely show through the glass ({inside} px)")
        check(outside == 0, f"autumn: {outside} leaf pixels outside the glass (bars, curtains or armchair)")
        n = await pg.evaluate("()=>{let most=0;for(let i=0;i<240;i++){__step(.25);most=Math.max(most,sLeaves.length);}return most;}")
        check(1 <= n <= 2, f"autumn: {n} leaves at once in a minute (expected one or two)")
        await pg.evaluate("()=>{sLeaves=[{im:LEAVES[0],x:40,y:120,vy:0,a:0,w:0,ph:0},{im:LEAVES[2],x:150,y:260,vy:0,a:0,w:0,ph:0}];sLeafNext=1e15;__step(.05);}")
        await shot("autumn_day", "Autumn day: the pumpkin on the book stack, leaves past the window")
        await pg.evaluate("()=>{sLeafNext=0;}")
        # the pumpkin rocks when tapped, then settles
        idle = await pg.evaluate(STACK_PX)
        b0 = await pg.evaluate("()=>{const b=seasonBox();return [b.x,b.y,b.w,b.h];}")
        check(all(isinstance(v, int) for v in b0), f"pumpkin box not on whole pixels: {b0}")
        await tap(b0[0] + b0[2] // 2, b0[1] + b0[3] // 2)
        await pg.evaluate("()=>__step(.05)")
        await shot("pumpkin_rock", "Tapped: the pumpkin rocks")
        check(diff(await pg.evaluate(STACK_PX), idle) > .5, "pumpkin: tapping it didn't rock it")
        await pg.evaluate("()=>__step(2)")
        check(diff(await pg.evaluate(STACK_PX), idle) < .01, "pumpkin: it didn't settle back after rocking")
        # autumn night: the same pumpkin, no falling leaves
        await at("autumn", day=False)
        await pg.evaluate("()=>__step(30,250)")
        check(await pg.evaluate("()=>sLeaves.length") == 0, "autumn night: leaves are falling at night")
        await shot("autumn_night", "Autumn night: the same sleepy pumpkin")
        check(await pg.evaluate("()=>{const b=seasonBox();return !!b&&sRock<performance.now();}"), "pumpkin: not out at night")
        # winter: the tree; tap = sway + ornaments swing
        await at("winter")
        check(await pg.evaluate("()=>seasonItem()") == "tree", "winter: no tree on the book stack")
        await pg.evaluate("()=>__step(30,250)")
        check(await pg.evaluate("()=>sLeaves.length") == 0, "winter: leaves are falling")
        await shot("winter_day", "Winter day: the tree with its ornaments")
        still = await pg.evaluate(STACK_PX)
        b1 = await pg.evaluate("()=>{const b=seasonBox();return [b.x,b.y,b.w,b.h];}")
        await tap(b1[0] + b1[2] // 2, b1[1] + b1[3] // 3)
        await pg.evaluate("()=>__step(.05)")
        await shot("tree_tap", "Tapped: the tree sways, the ornaments swing")
        check(diff(await pg.evaluate(STACK_PX), still) > .2, "tree: tapping it didn't sway it")
        check(await pg.evaluate("()=>ORNAMENTS.every(o=>o.swing>performance.now())"), "tree: the ornaments didn't swing")
        await pg.evaluate("()=>__step(2)")
        check(diff(await pg.evaluate(STACK_PX), still) < .01, "tree: it didn't settle back")
        await at("winter", day=False)
        await shot("winter_night", "Winter night")
        # spring and summer: nothing seasonal
        for s in ("spring", "summer"):
            await at(s)
            check(await pg.evaluate("()=>seasonItem()") is None, f"{s}: a seasonal item is out")
            await pg.evaluate("()=>__step(30,250)")
            check(await pg.evaluate("()=>sLeaves.length") == 0, f"{s}: leaves are falling")
        # a kid on the book stack: the pumpkin makes room
        await pg.evaluate("()=>{SEASON_OVERRIDE='autumn';st.stage=4;st.species=7;st.perch='books';st.place={baby:'books'};capClear();__step(2);capClear();__step(.05);}")
        check(await pg.evaluate("()=>spotKey()") == "books", "the kid didn't get onto the book stack")
        check(await pg.evaluate("()=>seasonItem()") is None, "a kid on the book stack and the pumpkin is still out")
        await shot("kid_on_stack", "Autumn, a kid on the book stack: the pumpkin makes room")
        fails += [f"page error: {e}" for e in errs]
        await b.close()
    try:
        from PIL import Image, ImageDraw
        crops = []
        for t, pth in shots:
            im = Image.open(pth).convert("RGB")
            crops.append((t, im.crop(STACK).resize(((STACK[2] - STACK[0]) * 2, (STACK[3] - STACK[1]) * 2), Image.NEAREST)))
        win = Image.open(shots[0][1]).convert("RGB").crop(WINDOW)
        win = win.resize((win.width * 2, win.height * 2), Image.NEAREST)
        cw, ch = crops[0][1].size
        cols = 4
        rows = (len(crops) + cols - 1) // cols
        sheet = Image.new("RGB", (max(cols * (cw + 12) + 12, win.width + 24), rows * (ch + 30) + win.height + 54), "white")
        d = ImageDraw.Draw(sheet)
        for k, (t, im) in enumerate(crops):
            x, y = 12 + (k % cols) * (cw + 12), 12 + (k // cols) * (ch + 30)
            d.text((x, y), t, fill="black")
            sheet.paste(im, (x, y + 18))
        y = 12 + rows * (ch + 30)
        d.text((12, y), "Autumn day: leaves through the glass (2x)", fill="black")
        sheet.paste(win, (12, y + 18))
        sheet.save(os.path.join(OUT, "sheet.png"))
    except Exception as e:
        fails.append(f"sheet: {e}")
    for f in fails:
        print("FAIL", f)
    print("PASS seasonal_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    asyncio.run(main())
