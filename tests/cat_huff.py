"""When the cat has had enough, he leaves like a real cat.

Run from the repository root:  python tests/cat_huff.py
Plays the real game loop at normal speed:
  1. a fond cat napping by the plant is petted one time too many: a second of the annoyed look, then he walks off at his
     normal pace to a spot a comfortable way from where he was touched and from the plants; there he sits awake for
     30-90 s (back turned, grooming, a slow blink), loafs with his eyes open for a minute or more, then really naps.
     No trust lost, no caption.
  2. touched again while settling: he calmly moves once more (no annoyed look), and settling takes longer.
  3. a shy cat touched while napping: the same exit. Shy cats still warm up by sniffing when awake.
  4. 40 exits from different places: where he goes (often somewhere higher).
Saves a picture of every step to tests/screenshots/huff/ (step_1_annoyed.png ... step_7_nap.png). Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "huff")
CLIP = "()=>{const b=catBox();const w=520,h=330,x=Math.max(0,Math.min(1670-w,Math.round(b.x+b.w/2-w/2))),y=Math.max(0,Math.min(942-h,Math.round(b.y+b.h-h+40)));return {x,y,width:w,height:h};}"
UNTIL = """(cond)=>{const f=new Function('return '+cond);for(let i=0;i<4000;i++){if(f())return T;__step(.05);}return -1;}"""


async def page_for(b, trust):
    ctx = await b.new_context(viewport={"width": 1670, "height": 942})
    await ctx.add_init_script(VIRTUAL_TIME)
    pg = await ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
    await pg.evaluate(f"()=>{{const s=fresh();s.started=true;s.stage=8;s.species=3;s.giftSeed=1;s.mode='actions';s.speed=2;s.catTrust={trust};s.free={{x:1250,y:918}};s.lc=s.ge=s.nlc=s.nge=0;localStorage.setItem(KEY,JSON.stringify(s));}}")
    await pg.reload(wait_until="load")
    await pg.click(".screen button")
    await pg.evaluate("()=>{__step(8);cap.textContent='';}")
    return ctx, pg, errs


async def nap_by_plant(pg):
    await pg.evaluate("""()=>{const ps=plantSideSpot();CAT_SPOTS.byplant=ps;Object.assign(cat,{spot:'byplant',x:ps.x,y:ps.y,sc:ps.sc,pose:'curl',state:'sleep',t:5,nap:1e9,path:null,pets:0,shyT:0,huff:0,huffN:0,hold:false});}""")


async def until(pg, cond):
    return await pg.evaluate(UNTIL, cond)


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    async with async_playwright() as p:
        b = await p.chromium.launch()

        # 1: petted one time too many
        ctx, pg, errs = await page_for(b, .7)
        await nap_by_plant(pg)
        trust0 = await pg.evaluate("()=>catTrust()")
        for _ in range(3):
            await pg.evaluate("()=>{petCat();__step(2.4);}")
        await pg.evaluate("()=>{cap.textContent='';T0=T;petCat();}")
        x_touch = await pg.evaluate("()=>cat.x")
        st0 = await pg.evaluate("()=>cat.state")
        if st0 != "annoyed":
            fails.append(f"4th pet: state {st0}, expected the annoyed look")
        await pg.evaluate("()=>__step(.5)")
        await pg.screenshot(path=os.path.join(OUT, "step_1_annoyed.png"), clip=await pg.evaluate(CLIP))
        t_walk = await until(pg, "cat.state==='walk'")
        warn = await pg.evaluate("()=>T-T0") if t_walk < 0 else t_walk - await pg.evaluate("()=>T0")
        if not (.8 <= warn <= 1.5):
            fails.append(f"the annoyed look lasted {warn:.1f} s, expected about a second")
        await pg.evaluate("()=>__step(1.2)")
        await pg.screenshot(path=os.path.join(OUT, "step_2_walking_off.png"))  # whole room: where he's headed
        spot = await pg.evaluate("()=>cat.to")
        t0 = await until(pg, "cat.state==='settle'")
        info = await pg.evaluate("""()=>{const pb=plantBox();return {x:cat.x,spot:cat.spot,awake:cat.awake,plant:pb.x+pb.w/2};}""")
        print(f"petted too many times at x{x_touch:.0f}: walked to {info['spot']} (x{info['x']:.0f}, plant at x{info['plant']:.0f}), sits awake {info['awake']:.0f} s")
        if abs(info["x"] - x_touch) < 350 or abs(info["x"] - info["plant"]) < 220:
            fails.append(f"settled too close: x{info['x']:.0f}, touched at x{x_touch:.0f}, plant at x{info['plant']:.0f}")
        if not (30 <= info["awake"] <= 90):
            fails.append(f"sits awake {info['awake']:.0f} s, expected 30-90")
        await pg.evaluate("()=>{window.SEEN=new Set();window.SEENI=setInterval(()=>{if(cat.state==='settle')SEEN.add(OLD_CAT?cat.huffF:catFrame().catName);},50);__step(1);}")
        await pg.screenshot(path=os.path.join(OUT, "step_3_back_turned.png"), clip=await pg.evaluate(CLIP))
        await until(pg, "cat.huffF==='groom2'")
        await pg.screenshot(path=os.path.join(OUT, "step_4_grooming.png"), clip=await pg.evaluate(CLIP))
        await until(pg, "cat.huffF==='sit2'")
        await pg.screenshot(path=os.path.join(OUT, "step_5_slow_blink.png"), clip=await pg.evaluate(CLIP))
        seen = await pg.evaluate("""()=>{while(cat.state==='settle')__step(.05);clearInterval(SEENI);return [...SEEN];}""")
        for need in ("back", "groom1", "groom2", "sit1", "sit2"):
            if need not in seen:
                fails.append(f"settling never showed {need} (saw {seen})")
        t1 = await pg.evaluate("()=>T")
        if await pg.evaluate("()=>cat.state") != "loafwake":
            fails.append(f"after settling: {await pg.evaluate('()=>cat.state')}, expected the eyes-open loaf")
        await pg.evaluate("()=>__step(1)")
        await pg.screenshot(path=os.path.join(OUT, "step_6_loaf_eyes_open.png"), clip=await pg.evaluate(CLIP))
        t2 = await until(pg, "cat.state==='sleep'")
        if t2 - t1 < 60:
            fails.append(f"eyes-open loaf lasted {t2 - t1:.0f} s, expected a minute or more")
        print(f"sat awake {t1 - t0:.0f} s, loafed with eyes open {t2 - t1:.0f} s, then napped")
        await pg.evaluate("()=>{zzNext.cat=T;zzNow=null;__step(.05);__step(1.5);}")
        await pg.screenshot(path=os.path.join(OUT, "step_7_nap.png"), clip=await pg.evaluate(CLIP))
        if await pg.evaluate("()=>catTrust()") < trust0:
            fails.append("trust went down")
        if "cat" in (await pg.evaluate("()=>cap.textContent")).lower():
            fails.append(f"a cat caption showed: {await pg.evaluate('()=>cap.textContent')}")
        fails += errs
        await ctx.close()

        # 2: touched again while settling -> calmly moves once more, settling takes longer
        ctx, pg, errs = await page_for(b, .7)
        await nap_by_plant(pg)
        await pg.evaluate("()=>{cat.pets=3;petCat();}")
        await until(pg, "cat.state==='settle'")
        await pg.evaluate("()=>__step(3)")
        a1 = await pg.evaluate("()=>cat.awake")
        await pg.evaluate("()=>petCat()")
        s2 = await pg.evaluate("()=>cat.state")
        if s2 != "walk":
            fails.append(f"touched while settling: {s2}, expected him to calmly walk off (no annoyed look)")
        await pg.screenshot(path=os.path.join(OUT, "step_8_touched_again_moves_on.png"))
        await until(pg, "cat.state==='settle'")
        a2 = await pg.evaluate("()=>cat.awake")
        if a2 < a1 + 10 - .01:
            fails.append(f"after a second move he sits awake {a2:.0f} s, expected at least 10 s longer than {a1:.0f} s")
        print(f"touched while settling: moved again; awake {a1:.0f} s then {a2:.0f} s (longer each time)")
        fails += errs
        await ctx.close()

        # 3: shy cat touched while napping -> same exit; awake shy cat still sniffs
        ctx, pg, errs = await page_for(b, .1)
        await nap_by_plant(pg)
        s3 = await pg.evaluate("()=>{petCat();return cat.state;}")
        if s3 != "annoyed":
            fails.append(f"shy cat touched while napping: {s3}, expected the annoyed look")
        s4 = await pg.evaluate("()=>{Object.assign(cat,{state:'wake',t:1.5,huff:0});petCat();return cat.state;}")
        if s4 != "sniff":
            fails.append(f"shy cat touched while awake: {s4}, expected a sniff (warming up as before)")
        fails += errs
        await ctx.close()

        # 4: where he goes, over many exits from different places
        ctx, pg, errs = await page_for(b, .7)
        r = await pg.evaluate("""()=>{const out={};for(let i=0;i<40;i++){const ks=['bed','rug','chair','crate','books'],k=ks[i%5],s=CAT_SPOTS[k];
          Object.assign(cat,{spot:k,x:s.x,y:s.y,sc:s.sc,pose:'loaf',state:'sleep',t:5,nap:1e9,path:null,pets:3,huff:0,huffN:0,hold:false});petCat();__step(1.2);out[cat.to]=(out[cat.to]||0)+1;}return out;}""")
        print("40 exits went to:", r)
        high = sum(v for k, v in r.items() if k in ("crate", "books", "chair", "sill"))
        if high < 20:
            fails.append(f"only {high} of 40 exits went somewhere higher")
        fails += errs
        await ctx.close()
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("saved to tests/screenshots/huff/")
    if fails:
        sys.exit(1)
    print("PASS: he warns, walks off to a comfortable spot, settles awake, loafs, then naps; touching again moves him on")


if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    asyncio.run(main())
